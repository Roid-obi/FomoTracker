// FomoTracker Content Script
// Injects overlay when time limit is reached on tracked URLs

(function () {
  "use strict";

  let tickInterval = null;
  let overlayShown = false;
  let breakTimerInterval = null;
  let currentRule = null;
  let lastUrl = location.href;

  // Inject overlay styles
  function injectStyles() {
    if (document.getElementById("fomotracker-styles")) return;
    const style = document.createElement("style");
    style.id = "fomotracker-styles";
    style.textContent = `
      #fomotracker-overlay {
        position: fixed;
        inset: 0;
        z-index: 2147483647;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(0, 0, 0, 0.92);
        backdrop-filter: blur(12px) saturate(0.3);
        font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
        opacity: 0;
        animation: fomotracker-fadein 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      }

      @keyframes fomotracker-fadein {
        from { opacity: 0; transform: scale(1.04); }
        to { opacity: 1; transform: scale(1); }
      }

      #fomotracker-overlay-card {
        position: relative;
        background: linear-gradient(135deg, #0f0f13 0%, #1a1a2e 50%, #16213e 100%);
        border: 1px solid rgba(99, 102, 241, 0.3);
        border-radius: 24px;
        padding: 48px 52px;
        max-width: 520px;
        width: 90vw;
        text-align: center;
        box-shadow:
          0 0 0 1px rgba(99, 102, 241, 0.1),
          0 32px 80px rgba(0, 0, 0, 0.8),
          0 0 120px rgba(99, 102, 241, 0.15);
        animation: fomotracker-slideup 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      }

      @keyframes fomotracker-slideup {
        from { opacity: 0; transform: translateY(32px); }
        to { opacity: 1; transform: translateY(0); }
      }

      #fomotracker-glow {
        position: absolute;
        top: -60px;
        left: 50%;
        transform: translateX(-50%);
        width: 200px;
        height: 200px;
        background: radial-gradient(circle, rgba(99, 102, 241, 0.4) 0%, transparent 70%);
        pointer-events: none;
        animation: fomotracker-pulse 3s ease-in-out infinite;
      }

      @keyframes fomotracker-pulse {
        0%, 100% { opacity: 0.6; transform: translateX(-50%) scale(1); }
        50% { opacity: 1; transform: translateX(-50%) scale(1.15); }
      }

      #fomotracker-icon {
        font-size: 52px;
        margin-bottom: 16px;
        display: block;
        animation: fomotracker-bounce 1s ease-in-out infinite alternate;
      }

      @keyframes fomotracker-bounce {
        from { transform: translateY(0); }
        to { transform: translateY(-6px); }
      }

      #fomotracker-title {
        font-size: 28px;
        font-weight: 800;
        color: #f8fafc;
        margin: 0 0 8px;
        letter-spacing: -0.5px;
        background: linear-gradient(135deg, #a5b4fc 0%, #818cf8 50%, #6366f1 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }

      #fomotracker-subtitle {
        font-size: 15px;
        color: rgba(148, 163, 184, 0.9);
        margin: 0 0 8px;
        line-height: 1.6;
      }

      #fomotracker-domain {
        display: inline-block;
        background: rgba(99, 102, 241, 0.15);
        border: 1px solid rgba(99, 102, 241, 0.3);
        color: #a5b4fc;
        border-radius: 8px;
        padding: 4px 12px;
        font-size: 13px;
        font-weight: 600;
        margin-bottom: 28px;
        letter-spacing: 0.3px;
      }

      #fomotracker-elapsed {
        font-size: 13px;
        color: rgba(148, 163, 184, 0.6);
        margin-bottom: 32px;
      }

      #fomotracker-elapsed span {
        color: #f87171;
        font-weight: 700;
      }

      #fomotracker-actions {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      #fomotracker-break-btn {
        background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
        color: white;
        border: none;
        border-radius: 14px;
        padding: 14px 28px;
        font-size: 15px;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        letter-spacing: 0.2px;
        box-shadow: 0 4px 24px rgba(99, 102, 241, 0.4);
        position: relative;
        overflow: hidden;
      }

      #fomotracker-break-btn::before {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 100%);
        opacity: 0;
        transition: opacity 0.2s;
      }

      #fomotracker-break-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 32px rgba(99, 102, 241, 0.6);
      }

      #fomotracker-break-btn:hover::before {
        opacity: 1;
      }

      #fomotracker-break-btn:active {
        transform: translateY(0);
      }

      #fomotracker-dismiss-btn {
        background: transparent;
        color: rgba(148, 163, 184, 0.6);
        border: 1px solid rgba(148, 163, 184, 0.15);
        border-radius: 14px;
        padding: 12px 28px;
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
        letter-spacing: 0.2px;
      }

      #fomotracker-dismiss-btn:hover {
        color: rgba(148, 163, 184, 0.9);
        border-color: rgba(148, 163, 184, 0.3);
        background: rgba(148, 163, 184, 0.05);
      }

      #fomotracker-break-display {
        margin-top: 20px;
      }

      #fomotracker-break-badge {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        background: rgba(52, 211, 153, 0.1);
        border: 1px solid rgba(52, 211, 153, 0.3);
        border-radius: 50px;
        padding: 8px 20px;
        color: #34d399;
        font-size: 14px;
        font-weight: 600;
        margin-bottom: 12px;
      }

      #fomotracker-break-badge::before {
        content: '';
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #34d399;
        animation: fomotracker-blink 1s ease-in-out infinite;
        flex-shrink: 0;
      }

      @keyframes fomotracker-blink {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.3; }
      }

      #fomotracker-break-countdown {
        font-size: 42px;
        font-weight: 800;
        color: #34d399;
        letter-spacing: -1px;
        font-variant-numeric: tabular-nums;
      }

      #fomotracker-break-label {
        font-size: 13px;
        color: rgba(148, 163, 184, 0.5);
        margin-top: 4px;
      }

      #fomotracker-progress {
        width: 100%;
        height: 4px;
        background: rgba(148, 163, 184, 0.1);
        border-radius: 2px;
        margin-top: 28px;
        overflow: hidden;
      }

      #fomotracker-progress-bar {
        height: 100%;
        background: linear-gradient(90deg, #6366f1, #818cf8);
        border-radius: 2px;
        transition: width 1s linear;
      }
    `;
    document.head.appendChild(style);
  }

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

  function createOverlay(rule, elapsed, isBreak, breakRemaining, breakTotal) {
    if (document.getElementById("fomotracker-overlay")) return;

    injectStyles();

    const overlay = document.createElement("div");
    overlay.id = "fomotracker-overlay";

    const elapsedFormatted = formatTime(elapsed);
    const domain = getDomain(location.href);

    if (isBreak) {
      const pct = breakTotal > 0 ? ((breakTotal - breakRemaining) / breakTotal) * 100 : 0;
      overlay.innerHTML = `
        <div id="fomotracker-overlay-card">
          <div id="fomotracker-glow"></div>
          <span id="fomotracker-icon">☕</span>
          <h1 id="fomotracker-title">Break Time!</h1>
          <p id="fomotracker-subtitle">Take a moment away from <strong>${domain}</strong>.<br/>Your break timer is running.</p>
          <div id="fomotracker-break-display">
            <div id="fomotracker-break-badge">Break in progress</div>
            <div id="fomotracker-break-countdown">${formatTime(breakRemaining)}</div>
            <div id="fomotracker-break-label">remaining</div>
          </div>
          <div id="fomotracker-progress">
            <div id="fomotracker-progress-bar" style="width: ${pct}%"></div>
          </div>
        </div>
      `;
    } else {
      overlay.innerHTML = `
        <div id="fomotracker-overlay-card">
          <div id="fomotracker-glow"></div>
          <span id="fomotracker-icon">⏰</span>
          <h1 id="fomotracker-title">Time's Up!</h1>
          <p id="fomotracker-subtitle">You've spent your allocated time on</p>
          <div id="fomotracker-domain">${domain}</div>
          <div id="fomotracker-elapsed">Time spent: <span>${elapsedFormatted}</span> / limit: ${formatTime(rule.duration * 60)}</div>
          <div id="fomotracker-actions">
            <button id="fomotracker-break-btn">☕ Take a ${rule.breakTime}-minute break</button>
            <button id="fomotracker-dismiss-btn">Continue anyway (not recommended)</button>
          </div>
        </div>
      `;
    }

    document.body.appendChild(overlay);

    if (!isBreak) {
      document.getElementById("fomotracker-break-btn")?.addEventListener("click", () => {
        chrome.runtime.sendMessage({ type: "START_BREAK", ruleId: rule.id }, () => {
          // Replace overlay with break overlay
          removeOverlay();
          overlayShown = false;
          startTicking();
        });
      });

      document.getElementById("fomotracker-dismiss-btn")?.addEventListener("click", () => {
        chrome.runtime.sendMessage({ type: "DISMISS_OVERLAY", ruleId: rule.id }, () => {
          removeOverlay();
          overlayShown = false;
        });
      });
    }

    overlayShown = true;
  }

  function updateBreakOverlay(breakRemaining, breakTotal) {
    const countdown = document.getElementById("fomotracker-break-countdown");
    const bar = document.getElementById("fomotracker-progress-bar");
    if (countdown) countdown.textContent = formatTime(breakRemaining);
    if (bar) {
      const pct = breakTotal > 0 ? ((breakTotal - breakRemaining) / breakTotal) * 100 : 0;
      bar.style.width = `${pct}%`;
    }
  }

  function removeOverlay() {
    const overlay = document.getElementById("fomotracker-overlay");
    if (overlay) {
      overlay.id = "fomotracker-overlay-removing"; // Change ID immediately to avoid race conditions
      overlay.style.animation = "none";
      overlay.style.opacity = "0";
      overlay.style.transition = "opacity 0.3s ease";
      setTimeout(() => overlay.remove(), 300);
    }
  }

  function startTicking() {
    if (tickInterval) clearInterval(tickInterval);

    tickInterval = setInterval(async () => {
      try {
        const url = location.href;
        const status = await chrome.runtime.sendMessage({
          type: "TICK",
          url,
        });

        if (!status || !status.active) {
          removeOverlay();
          return;
        }

        currentRule = status.rule;

        if (status.onBreak) {
          // Show or update break overlay
          const response = await chrome.runtime.sendMessage({
            type: "GET_SESSION_STATUS",
            url,
          });
          if (response && response.onBreak) {
            const breakTotal = (currentRule?.breakTime || 5) * 60;
            if (!document.getElementById("fomotracker-overlay")) {
              createOverlay(currentRule, status.elapsed, true, response.breakRemaining, breakTotal);
            } else {
              updateBreakOverlay(response.breakRemaining, breakTotal);
            }
          }
          return;
        }

        if (status.limitReached) {
          if (!status.overlayShown) {
            if (!document.getElementById("fomotracker-overlay")) {
              createOverlay(status.rule, status.elapsed, false, 0, 0);
            } else {
              // Update elapsed time live
              const elapsedSpan = document.querySelector("#fomotracker-elapsed span");
              if (elapsedSpan) elapsedSpan.textContent = formatTime(status.elapsed);
            }
          } else {
            // Already dismissed by user, remove if somehow present
            removeOverlay();
          }
        } else {
          // Timer not reached and not on break — ensure no overlay
          if (document.getElementById("fomotracker-overlay")) {
            removeOverlay();
          }
        }
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
      removeOverlay();
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
      lastHref = location.href;
      removeOverlay();
      clearInterval(tickInterval);
      init();
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
})();
