package com.fomotracker.app;

import android.app.AppOpsManager;
import android.app.usage.UsageStats;
import android.app.usage.UsageStatsManager;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.provider.Settings;
import android.content.pm.ApplicationInfo;
import android.content.pm.PackageManager;
import android.content.pm.ActivityInfo;
import android.content.pm.ResolveInfo;
import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@CapacitorPlugin(name = "CapacitorUsageStatsManager")
public class UsageStatsManagerPlugin extends Plugin {

    @PluginMethod
    public void isUsageStatsPermissionGranted(PluginCall call) {
        AppOpsManager appOpsManager = (AppOpsManager) getContext().getSystemService(Context.APP_OPS_SERVICE);
        boolean granted = false;

        if (appOpsManager != null) {
            int mode = appOpsManager.checkOpNoThrow(
                AppOpsManager.OPSTR_GET_USAGE_STATS,
                android.os.Process.myUid(),
                getContext().getPackageName()
            );
            granted = mode == AppOpsManager.MODE_ALLOWED;
        }

        JSObject result = new JSObject();
        result.put("granted", granted);
        call.resolve(result);
    }

    @PluginMethod
    public void openUsageStatsSettings(PluginCall call) {
        Intent intent = new Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS);
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        getContext().startActivity(intent);
        call.resolve();
    }

    @PluginMethod
    public void getInstalledApps(PluginCall call) {
        PackageManager pm = getContext().getPackageManager();
        Intent intent = new Intent(Intent.ACTION_MAIN, null);
        intent.addCategory(Intent.CATEGORY_LAUNCHER);
        List<ResolveInfo> launchables = pm.queryIntentActivities(intent, 0);
        JSArray appsArray = new JSArray();
        java.util.Set<String> packageNames = new java.util.HashSet<>();

        for (ResolveInfo launchable : launchables) {
            ActivityInfo activityInfo = launchable.activityInfo;
            if (activityInfo != null && activityInfo.applicationInfo != null) {
                String packageName = activityInfo.packageName;
                if (!packageNames.contains(packageName)) {
                    packageNames.add(packageName);
                    boolean isSystem = (activityInfo.applicationInfo.flags & ApplicationInfo.FLAG_SYSTEM) != 0;
                    JSObject appObj = new JSObject();
                    appObj.put("packageName", packageName);
                    CharSequence label = launchable.loadLabel(pm);
                    appObj.put("appName", label != null ? label.toString() : activityInfo.applicationInfo.loadLabel(pm).toString());
                    appObj.put("isSystem", isSystem);
                    appsArray.put(appObj);
                }
            }
        }

        JSObject result = new JSObject();
        result.put("apps", appsArray);
        call.resolve(result);
    }

    @PluginMethod
    public void queryAndAggregateUsageStats(PluginCall call) {
        Long beginTime = call.getLong("beginTime");
        Long endTime = call.getLong("endTime");

        if (beginTime == null || endTime == null) {
            call.reject("Must provide beginTime and endTime");
            return;
        }

        UsageStatsManager usageStatsManager = (UsageStatsManager) getContext().getSystemService(Context.USAGE_STATS_SERVICE);
        if (usageStatsManager == null) {
            call.reject("UsageStatsManager is not available");
            return;
        }

        List<UsageStats> usageStats = usageStatsManager.queryUsageStats(
            UsageStatsManager.INTERVAL_DAILY,
            beginTime,
            endTime
        );

        Map<String, Long> totalsByPackage = new HashMap<>();
        if (usageStats != null) {
            for (UsageStats stat : usageStats) {
                String packageName = stat.getPackageName();
                long totalTime = stat.getTotalTimeInForeground();
                totalsByPackage.put(packageName, totalsByPackage.getOrDefault(packageName, 0L) + totalTime);
            }
        }

        JSObject result = new JSObject();
        for (Map.Entry<String, Long> entry : totalsByPackage.entrySet()) {
            JSObject stat = new JSObject();
            stat.put("packageName", entry.getKey());
            stat.put("totalTimeInForeground", entry.getValue());
            result.put(entry.getKey(), stat);
        }

        call.resolve(result);
    }

    @PluginMethod
    public void setupBackgroundSync(PluginCall call) {
        String userId = call.getString("userId");
        String deviceId = call.getString("deviceId");
        JSArray monitoredAppsArray = call.getArray("monitoredApps");
        String sleepStart = call.getString("sleepStart", "22:00:00");
        String sleepEnd = call.getString("sleepEnd", "06:00:00");
        String productiveStart = call.getString("productiveStart", "08:00:00");
        String productiveEnd = call.getString("productiveEnd", "17:00:00");
        Integer continuousLimitSeconds = call.getInt("continuousLimitSeconds", 3600);

        if (userId == null || deviceId == null || monitoredAppsArray == null) {
            call.reject("Must provide userId, deviceId and monitoredApps");
            return;
        }

        StringBuilder monitoredAppsBuilder = new StringBuilder();
        try {
            List<String> monitoredAppsList = monitoredAppsArray.toList();
            for (int i = 0; i < monitoredAppsList.size(); i++) {
                if (i > 0) monitoredAppsBuilder.append(",");
                monitoredAppsBuilder.append(monitoredAppsList.get(i));
            }
        } catch (Exception e) {
            call.reject("Failed to parse monitored apps: " + e.getMessage());
            return;
        }

        android.content.SharedPreferences prefs = getContext().getSharedPreferences("FomoTrackerPrefs", Context.MODE_PRIVATE);
        android.content.SharedPreferences.Editor editor = prefs.edit();
        editor.putString("userId", userId);
        editor.putString("deviceId", deviceId);
        editor.putString("monitoredApps", monitoredAppsBuilder.toString());
        editor.putString("sleepStart", sleepStart);
        editor.putString("sleepEnd", sleepEnd);
        editor.putString("productiveStart", productiveStart);
        editor.putString("productiveEnd", productiveEnd);
        editor.putInt("continuousLimitSeconds", continuousLimitSeconds != null ? continuousLimitSeconds : 3600);
        editor.apply();

        try {
            androidx.work.Constraints constraints = new androidx.work.Constraints.Builder()
                .setRequiredNetworkType(androidx.work.NetworkType.CONNECTED)
                .build();

            androidx.work.PeriodicWorkRequest syncWorkRequest =
                new androidx.work.PeriodicWorkRequest.Builder(SyncWorker.class, 15, java.util.concurrent.TimeUnit.MINUTES)
                    .setConstraints(constraints)
                    .build();

            androidx.work.WorkManager.getInstance(getContext()).enqueueUniquePeriodicWork(
                "FomoTrackerSyncWork",
                androidx.work.ExistingPeriodicWorkPolicy.UPDATE,
                syncWorkRequest
            );

            JSObject result = new JSObject();
            result.put("success", true);
            call.resolve(result);
        } catch (Exception e) {
            call.reject("Failed to schedule background sync work: " + e.getMessage());
        }
    }
}