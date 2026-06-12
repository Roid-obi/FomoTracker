package com.fomotracker.app;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.usage.UsageEvents;
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

    private static long parseTimeStrToSeconds(String timeStr) {
        if (timeStr == null || timeStr.isEmpty()) return 0;
        String[] parts = timeStr.split(":");
        long h = parts.length > 0 ? Integer.parseInt(parts[0]) : 0;
        long m = parts.length > 1 ? Integer.parseInt(parts[1]) : 0;
        long s = parts.length > 2 ? Integer.parseInt(parts[2]) : 0;
        return h * 3600 + m * 60 + s;
    }

    private static long calculateOverlap(long sessionStart, long sessionEnd, long boundStart, long boundEnd) {
        long start = Math.max(sessionStart, boundStart);
        long end = Math.min(sessionEnd, boundEnd);
        return Math.max(0, end - start);
    }

    private static long calculateOverlapWithMidnightCross(long sessionStart, long sessionEnd, long boundStart, long boundEnd) {
        if (boundStart > boundEnd) {
            // Boundary crosses midnight (e.g. 22:00 to 06:00)
            return calculateOverlap(sessionStart, sessionEnd, boundStart, 86400) +
                   calculateOverlap(sessionStart, sessionEnd, 0, boundEnd);
        }
        return calculateOverlap(sessionStart, sessionEnd, boundStart, boundEnd);
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

        // Get configurations from SharedPreferences
        String sleepStartStr = prefs.getString("sleepStart", "22:00:00");
        String sleepEndStr = prefs.getString("sleepEnd", "06:00:00");
        String productiveStartStr = prefs.getString("productiveStart", "08:00:00");
        String productiveEndStr = prefs.getString("productiveEnd", "17:00:00");
        int continuousLimitSeconds = prefs.getInt("continuousLimitSeconds", 3600);

        long sleepStart = parseTimeStrToSeconds(sleepStartStr);
        long sleepEnd = parseTimeStrToSeconds(sleepEndStr);
        long productiveStart = parseTimeStrToSeconds(productiveStartStr);
        long productiveEnd = parseTimeStrToSeconds(productiveEndStr);

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

            // Get end of today (local time)
            java.util.Calendar calEnd = java.util.Calendar.getInstance();
            calEnd.set(java.util.Calendar.HOUR_OF_DAY, 23);
            calEnd.set(java.util.Calendar.MINUTE, 59);
            calEnd.set(java.util.Calendar.SECOND, 59);
            calEnd.set(java.util.Calendar.MILLISECOND, 999);
            long endTime = calEnd.getTimeInMillis();

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

            // Query UsageEvents for calculating detail stats (openFrequency, midnight, productive, continuous)
            UsageEvents usageEvents = usageStatsManager.queryEvents(beginTime, endTime);
            
            Map<String, Long> lastResumedMap = new HashMap<>();
            Map<String, Integer> openFrequencyMap = new HashMap<>();
            Map<String, Long> midnightDurationMap = new HashMap<>();
            Map<String, Long> productiveDurationMap = new HashMap<>();
            Map<String, Long> maxContinuousMap = new HashMap<>();
            JSONArray activityLogsArray = new JSONArray();

            if (usageEvents != null) {
                UsageEvents.Event event = new UsageEvents.Event();
                while (usageEvents.hasNextEvent()) {
                    usageEvents.getNextEvent(event);
                    String pkg = event.getPackageName();
                    
                    if (monitoredApps.contains(pkg)) {
                        int eventType = event.getEventType();
                        long timestamp = event.getTimeStamp();
                        
                        if (eventType == UsageEvents.Event.ACTIVITY_RESUMED) {
                            openFrequencyMap.put(pkg, openFrequencyMap.getOrDefault(pkg, 0) + 1);
                            lastResumedMap.put(pkg, timestamp);
                        } else if (eventType == UsageEvents.Event.ACTIVITY_PAUSED) {
                            Long resumedTime = lastResumedMap.get(pkg);
                            if (resumedTime != null) {
                                long durationSeconds = Math.max(0, (timestamp - resumedTime) / 1000);
                                if (durationSeconds >= 1) {
                                    maxContinuousMap.put(pkg, Math.max(maxContinuousMap.getOrDefault(pkg, 0L), durationSeconds));
                                    
                                    java.util.Calendar resCal = java.util.Calendar.getInstance();
                                    resCal.setTimeInMillis(resumedTime);
                                    long resumedSecs = resCal.get(java.util.Calendar.HOUR_OF_DAY) * 3600L + 
                                                       resCal.get(java.util.Calendar.MINUTE) * 60L + 
                                                       resCal.get(java.util.Calendar.SECOND);
                                                       
                                    java.util.Calendar pauseCal = java.util.Calendar.getInstance();
                                    pauseCal.setTimeInMillis(timestamp);
                                    long pausedSecs = pauseCal.get(java.util.Calendar.HOUR_OF_DAY) * 3600L + 
                                                      pauseCal.get(java.util.Calendar.MINUTE) * 60L + 
                                                      pauseCal.get(java.util.Calendar.SECOND);
                                    
                                    long midnightOverlap = 0;
                                    long productiveOverlap = 0;
                                    
                                    if (pausedSecs < resumedSecs) { // Crossed midnight
                                        midnightOverlap += calculateOverlapWithMidnightCross(resumedSecs, 86400, sleepStart, sleepEnd) +
                                                          calculateOverlapWithMidnightCross(0, pausedSecs, sleepStart, sleepEnd);
                                        productiveOverlap += calculateOverlapWithMidnightCross(resumedSecs, 86400, productiveStart, productiveEnd) +
                                                             calculateOverlapWithMidnightCross(0, pausedSecs, productiveStart, productiveEnd);
                                    } else {
                                        midnightOverlap += calculateOverlapWithMidnightCross(resumedSecs, pausedSecs, sleepStart, sleepEnd);
                                        productiveOverlap += calculateOverlapWithMidnightCross(resumedSecs, pausedSecs, productiveStart, productiveEnd);
                                    }
                                    
                                    midnightDurationMap.put(pkg, midnightDurationMap.getOrDefault(pkg, 0L) + midnightOverlap);
                                    productiveDurationMap.put(pkg, productiveDurationMap.getOrDefault(pkg, 0L) + productiveOverlap);
                                    
                                    java.text.SimpleDateFormat isoFormat = new java.text.SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.US);
                                    isoFormat.setTimeZone(java.util.TimeZone.getTimeZone("UTC"));
                                    String startedAtStr = isoFormat.format(new Date(resumedTime));
                                    String endedAtStr = isoFormat.format(new Date(timestamp));
                                    
                                    JSONObject logObj = new JSONObject();
                                    logObj.put("packageName", pkg);
                                    logObj.put("startedAt", startedAtStr);
                                    logObj.put("endedAt", endedAtStr);
                                    logObj.put("durationSeconds", durationSeconds);
                                    logObj.put("isMidnight", midnightOverlap > 0);
                                    logObj.put("isProductiveHour", productiveOverlap > 0);
                                    logObj.put("isContinuous", durationSeconds > continuousLimitSeconds);
                                    logObj.put("source", "android_app");
                                    activityLogsArray.put(logObj);
                                }
                                lastResumedMap.remove(pkg);
                            }
                        }
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

                int openFreq = openFrequencyMap.getOrDefault(pkg, 0);
                // Fallback to at least 1 open frequency if usage exists
                if (openFreq == 0 && durationSec > 0) {
                    openFreq = 1;
                }

                // Add to stats payload
                JSONObject statObj = new JSONObject();
                statObj.put("packageName", pkg);
                statObj.put("totalDurationSeconds", durationSec);
                statObj.put("openFrequency", openFreq);
                statObj.put("midnightDurationSeconds", midnightDurationMap.getOrDefault(pkg, 0L));
                statObj.put("productiveHourDurationSeconds", productiveDurationMap.getOrDefault(pkg, 0L));
                statObj.put("maxContinuousSeconds", maxContinuousMap.getOrDefault(pkg, 0L));
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

            // Get cookies for authentication
            String cookies = CookieManager.getInstance().getCookie("https://fomotracker.vercel.app");

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
            if (cookies != null) {
                conn.setRequestProperty("Cookie", cookies);
            }
            conn.setDoOutput(true);

            try (OutputStream os = conn.getOutputStream()) {
                byte[] input = payload.toString().getBytes("utf-8");
                os.write(input, 0, input.length);
            }

            int code = conn.getResponseCode();
            Log.d(TAG, "API sync stats response code: " + code);

            if (code == 200 || code == 201) {
                Log.d(TAG, "Stats synced successfully in background.");
            } else {
                Log.e(TAG, "Failed to sync stats in background. Status code: " + code);
            }
            conn.disconnect();

            // 4. Post activity logs if any
            if (activityLogsArray.length() > 0) {
                JSONObject activityPayload = new JSONObject();
                activityPayload.put("userId", userId);
                activityPayload.put("deviceId", deviceId);
                activityPayload.put("logs", activityLogsArray);

                URL activityUrl = new URL("https://fomotracker.vercel.app/api/tracking/sync/activity");
                HttpURLConnection activityConn = (HttpURLConnection) activityUrl.openConnection();
                activityConn.setRequestMethod("POST");
                activityConn.setRequestProperty("Content-Type", "application/json; utf-8");
                activityConn.setRequestProperty("Accept", "application/json");
                if (cookies != null) {
                    activityConn.setRequestProperty("Cookie", cookies);
                }
                activityConn.setDoOutput(true);

                try (OutputStream os = activityConn.getOutputStream()) {
                    byte[] input = activityPayload.toString().getBytes("utf-8");
                    os.write(input, 0, input.length);
                }

                int activityCode = activityConn.getResponseCode();
                Log.d(TAG, "API sync activity response code: " + activityCode);
                activityConn.disconnect();
            }

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
