package com.fomotracker.app;

import android.app.usage.UsageEvents;
import android.app.usage.UsageStatsManager;
import android.content.Context;
import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "UsageEvents")
public class UsageEventsPlugin extends Plugin {

    @PluginMethod
    public void queryEvents(PluginCall call) {
        Long startTime = call.getLong("startTime");
        Long endTime = call.getLong("endTime");

        if (startTime == null || endTime == null) {
            call.reject("Must provide startTime and endTime");
            return;
        }

        UsageStatsManager usageStatsManager = (UsageStatsManager) getContext().getSystemService(Context.USAGE_STATS_SERVICE);
        if (usageStatsManager == null) {
            call.reject("UsageStatsManager is not available");
            return;
        }

        UsageEvents usageEvents = usageStatsManager.queryEvents(startTime, endTime);
        JSArray eventsArray = new JSArray();

        while (usageEvents.hasNextEvent()) {
            UsageEvents.Event event = new UsageEvents.Event();
            usageEvents.getNextEvent(event);

            // 1 = ACTIVITY_RESUMED (App brought to foreground / opened)
            // 2 = ACTIVITY_PAUSED (App sent to background / closed)
            if (event.getEventType() == UsageEvents.Event.ACTIVITY_RESUMED || 
                event.getEventType() == UsageEvents.Event.ACTIVITY_PAUSED) {
                
                JSObject eventObj = new JSObject();
                eventObj.put("packageName", event.getPackageName());
                eventObj.put("eventType", event.getEventType());
                eventObj.put("timeStamp", event.getTimeStamp());
                
                eventsArray.put(eventObj);
            }
        }

        JSObject result = new JSObject();
        result.put("events", eventsArray);
        call.resolve(result);
    }
}
