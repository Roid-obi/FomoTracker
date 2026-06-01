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
        List<ApplicationInfo> apps = pm.getInstalledApplications(PackageManager.GET_META_DATA);
        JSArray appsArray = new JSArray();

        for (ApplicationInfo appInfo : apps) {
            boolean isSystem = (appInfo.flags & ApplicationInfo.FLAG_SYSTEM) != 0;
            if (pm.getLaunchIntentForPackage(appInfo.packageName) != null) {
                JSObject appObj = new JSObject();
                appObj.put("packageName", appInfo.packageName);
                CharSequence label = pm.getApplicationLabel(appInfo);
                appObj.put("appName", label != null ? label.toString() : appInfo.packageName);
                appObj.put("isSystem", isSystem);
                appsArray.put(appObj);
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
}