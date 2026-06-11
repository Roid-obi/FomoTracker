package com.fomotracker.app;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.usage.UsageStats;
import android.app.usage.UsageStatsManager;
import android.content.Context;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.os.Build;
import android.util.Log;
import android.webkit.CookieManager;

import androidx.annotation.NonNull;
import androidx.core.app.NotificationCompat;
import androidx.work.Worker;
import androidx.work.WorkerParameters;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.text.SimpleDateFormat;
import java.util.Arrays;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

public class SyncWorker extends Worker {
    private static final String TAG = "SyncWorker";
    private static final String CHANNEL_ID = "fomo_warnings";

    public SyncWorker(@NonNull Context context, @NonNull WorkerParameters params) {
        super(context, params);
    }

    @NonNull
    @Override
    public Result doWork() {
        Log.d(TAG, "Starting periodic sync work...");

        Context context = getApplicationContext();
        SharedPreferences prefs = context.getSharedPreferences("FomoTrackerPrefs", Context.MODE_PRIVATE);

        String userId = prefs.getString("userId", null);
        String deviceId = prefs.getString("deviceId", null);
        String monitoredAppsStr = prefs.getString("monitoredApps", null);

        if (userId == null || deviceId == null || monitoredAppsStr == null || monitoredAppsStr.isEmpty()) {
            Log.d(TAG, "Sync skipped: Missing configuration details in SharedPreferences.");
            return Result.success();
        }

        Set<String> monitoredApps = new HashSet<>(Arrays.asList(monitoredAppsStr.split(",")));
        if (monitoredApps.isEmpty()) {
            Log.d(TAG, "Sync skipped: Monitored apps list is empty.");
            return Result.success();
        }

        try {
            // 1. Get usage statistics from UsageStatsManager for the current day
            UsageStatsManager usageStatsManager = (UsageStatsManager) context.getSystemService(Context.USAGE_STATS_SERVICE);
            if (usageStatsManager == null) {
                Log.e(TAG, "UsageStatsManager is not available.");
                return Result.success();
            }

            // Get start of today (local time)
            java.util.Calendar cal = java.util.Calendar.getInstance();
            cal.set(java.util.Calendar.HOUR_OF_DAY, 0);
            cal.set(java.util.Calendar.MINUTE, 0);
            cal.set(java.util.Calendar.SECOND, 0);
            cal.set(java.util.Calendar.MILLISECOND, 0);
            long beginTime = cal.getTimeInMillis();
            long endTime = System.currentTimeMillis();

            List<UsageStats> usageStatsList = usageStatsManager.queryUsageStats(
                UsageStatsManager.INTERVAL_DAILY,
                beginTime,
                endTime
            );

            Map<String, Long> totalsByPackage = new HashMap<>();
            if (usageStatsList != null) {
                for (UsageStats stat : usageStatsList) {
                    String pkg = stat.getPackageName();
                    if (monitoredApps.contains(pkg)) {
                        long totalTime = stat.getTotalTimeInForeground();
                        totalsByPackage.put(pkg, totalsByPackage.getOrDefault(pkg, 0L) + totalTime);
                    }
                }
            }

            // 2. Process limits and show local notifications
            PackageManager pm = context.getPackageManager();
            String todayDateStr = new SimpleDateFormat("yyyy-MM-dd", Locale.US).format(new Date());

            JSONArray statsArray = new JSONArray();

            for (String pkg : monitoredApps) {
                long durationMs = totalsByPackage.getOrDefault(pkg, 0L);
                long durationSec = durationMs / 1000;

                // Add to stats payload
                JSONObject statObj = new JSONObject();
                statObj.put("packageName", pkg);
                statObj.put("totalDurationSeconds", durationSec);
                statObj.put("openFrequency", 1); // fallback
                statObj.put("midnightDurationSeconds", 0);
                statObj.put("productiveHourDurationSeconds", 0);
                statObj.put("maxContinuousSeconds", 0);
                statsArray.put(statObj);

                // Check 4-hour limit (4 hours = 14400 seconds)
                if (durationSec >= 14400) {
                    String prefKey = "notif_" + pkg + "_" + todayDateStr;
                    boolean alreadyShown = prefs.getBoolean(prefKey, false);

                    if (!alreadyShown) {
                        String appLabel = pkg;
                        try {
                            appLabel = pm.getApplicationLabel(pm.getApplicationInfo(pkg, 0)).toString();
                        } catch (Exception ignored) {}

                        // Trigger native notification
                        showLimitNotification(context, pkg, appLabel);
                        prefs.edit().putBoolean(prefKey, true).apply();
                    }
                }
            }

            // 3. Post statistics payload directly to the API
            JSONObject payload = new JSONObject();
            payload.put("userId", userId);
            payload.put("deviceId", deviceId);
            payload.put("statDate", todayDateStr);
            payload.put("stats", statsArray);

            URL url = new URL("https://fomotracker.vercel.app/api/tracking/sync/stats");
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("POST");
            conn.setRequestProperty("Content-Type", "application/json; utf-8");
            conn.setRequestProperty("Accept", "application/json");

            // Get cookies for authentication
            String cookies = CookieManager.getInstance().getCookie("https://fomotracker.vercel.app");
            if (cookies != null) {
                conn.setRequestProperty("Cookie", cookies);
            }

            conn.setDoOutput(true);

            try (OutputStream os = conn.getOutputStream()) {
                byte[] input = payload.toString().getBytes("utf-8");
                os.write(input, 0, input.length);
            }

            int code = conn.getResponseCode();
            Log.d(TAG, "API sync response code: " + code);

            if (code == 200 || code == 201) {
                Log.d(TAG, "Stats synced successfully in background.");
            } else {
                Log.e(TAG, "Failed to sync stats in background. Status code: " + code);
            }
            conn.disconnect();

        } catch (Exception e) {
            Log.e(TAG, "Error performing background stats sync:", e);
        }

        return Result.success();
    }

    private void showLimitNotification(Context context, String packageName, String appLabel) {
        NotificationManager manager = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
        if (manager != null) {
            // Create Notification Channel for Android 8.0+
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                NotificationChannel channel = new NotificationChannel(
                    CHANNEL_ID,
                    "Peringatan Batas Waktu",
                    NotificationManager.IMPORTANCE_HIGH
                );
                channel.setDescription("Peringatan ketika pemakaian aplikasi melebihi batas");
                manager.createNotificationChannel(channel);
            }

            // Build notification
            NotificationCompat.Builder builder = new NotificationCompat.Builder(context, CHANNEL_ID)
                .setSmallIcon(android.R.drawable.ic_dialog_alert)
                .setContentTitle("Batas Waktu Terlampaui")
                .setContentText("Anda telah menggunakan " + appLabel + " lebih dari 4 jam hari ini!")
                .setPriority(NotificationCompat.PRIORITY_HIGH)
                .setAutoCancel(true);

            try {
                // Check POST_NOTIFICATIONS permission on Android 13+ before notifying
                if (Build.VERSION.SDK_INT < 33 ||
                    context.checkSelfPermission(android.Manifest.permission.POST_NOTIFICATIONS) == PackageManager.PERMISSION_GRANTED) {
                    manager.notify(packageName.hashCode(), builder.build());
                    Log.d(TAG, "Notification triggered for package: " + packageName);
                } else {
                    Log.w(TAG, "Cannot trigger notification: POST_NOTIFICATIONS permission not granted.");
                }
            } catch (Exception e) {
                Log.e(TAG, "Failed to trigger notification", e);
            }
        }
    }
}
