// FomoTracker Content Script
// Injects overlay when time limit is reached on tracked URLs

(function () {
  "use strict";

  // Signal to the web app that the extension is installed
  document.documentElement.dataset.fomotrackerExtensionInstalled = "true";
  if (!document.getElementById("fomotracker-extension-root")) {
    const marker = document.createElement("div");
    marker.id = "fomotracker-extension-root";
    marker.style.display = "none";
    marker.setAttribute("aria-hidden", "true");
    document.documentElement.appendChild(marker);
  }

  let tickInterval = null;
  let overlayShown = false;
  let breakTimerInterval = null;
  let currentRule = null;
  let lastUrl = location.href;

  // No overlay needed anymore

  function formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }

  function getDomain(url) {
    try {
      return new URL(url).hostname.replace(/^www\./, "");
    } catch {
      return url;
    }
  }

  function startTicking() {
    if (tickInterval) clearInterval(tickInterval);

    tickInterval = setInterval(async () => {
      if (document.visibilityState !== "visible") return;

      try {
        const url = location.href;
        await chrome.runtime.sendMessage({
          type: "TICK",
          url,
        });
      } catch {
        // Extension context invalidated or other error
        clearInterval(tickInterval);
      }
    }, 1000);
  }

  async function init() {
    try {
      const url = location.href;
      const { rule } = await chrome.runtime.sendMessage({
        type: "CHECK_URL",
        url,
      });

      if (rule) {
        currentRule = rule;
        startTicking();
      }
    } catch {
      // Extension not ready
    }
  }

  // Listen for URL change messages from background
  chrome.runtime.onMessage.addListener((message) => {
    if (message.type === "URL_CHANGED") {
      clearInterval(tickInterval);
      init();
    }
  });

  // Start
  init();

  // Watch for SPA navigation
  let lastHref = location.href;
  const observer = new MutationObserver(() => {
    if (location.href !== lastHref) {
      const oldHref = lastHref;
      lastHref = location.href;
      chrome.runtime.sendMessage({ type: "HANDLE_SPA_NAVIGATION", oldUrl: oldHref, newUrl: location.href }).catch(() => {});
      clearInterval(tickInterval);
      init();
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });

  // Flush on visibility hidden or page unload
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      chrome.runtime.sendMessage({ type: "FLUSH_SESSION", url: location.href }).catch(() => {});
    } else if (document.visibilityState === "visible") {
      // Resume ticking if visible again
      init();
    }
  });

  window.addEventListener("pagehide", () => {
    chrome.runtime.sendMessage({ type: "FLUSH_SESSION", url: location.href }).catch(() => {});
  });

  // Listen to messages from the web app to sync rules
  window.addEventListener("message", async (event) => {
    if (event.source !== window) return;

    if (event.data && event.data.type === "FOMOTRACKER_SYNC_RULES") {
      try {
        await chrome.runtime.sendMessage({ type: "SAVE_RULES", rules: event.data.rules });
        window.postMessage({ type: "FOMOTRACKER_SYNC_SUCCESS" }, "*");
      } catch (e) {
        // Extension context might be invalid
      }
    } else if (event.data && event.data.type === "FOMOTRACKER_GET_RULES") {
      try {
        const rules = await chrome.runtime.sendMessage({ type: "GET_RULES" });
        window.postMessage({ type: "FOMOTRACKER_RULES_DATA", rules }, "*");
      } catch (e) {
        // Extension context might be invalid
      }
    } else if (event.data && event.data.type === "FOMOTRACKER_SET_USER_INFO") {
      try {
        await chrome.runtime.sendMessage({ 
          type: "SET_USER_INFO", 
          userId: event.data.userId, 
          deviceId: event.data.deviceId 
        });
      } catch (e) {
        // Extension context might be invalid
      }
    }
  });
})();
