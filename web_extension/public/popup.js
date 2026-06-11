// FomoTracker Popup Logic
// Standalone JS — no framework, works in MV3 extension context

/** @type {Rule[]} */
let rules = [];
/** @type {Record<string, SessionStatus>} */
let sessions = {};
let currentTab = "rules";
let pollInterval = null;

// ── Types ─────────────────────────────────────────────────────────────────────
/**
 * @typedef {{ id:string, url:string, duration:number, breakTime:number, enabled:boolean }} Rule
 * @typedef {{ active:boolean, rule?:Rule, elapsed?:number, remaining?:number, onBreak?:boolean, breakRemaining?:number, limitReached?:boolean }} SessionStatus
 */

// ── Helpers ───────────────────────────────────────────────────────────────────
function genId() {
  return Math.random().toString(36).slice(2, 10);
}

function getDomain(url) {
  try {
    const u = url.startsWith("http") ? url : `https://${url}`;
    return new URL(u).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

// ── Chrome Storage ────────────────────────────────────────────────────────────
const STORAGE_KEY = "fomotracker_rules";

async function loadRules() {
  return new Promise((resolve) => {
    chrome.storage.local.get(STORAGE_KEY, (data) => {
      resolve(data[STORAGE_KEY] || []);
    });
  });
}

async function saveRules(updated) {
  return new Promise((resolve) => {
    chrome.storage.local.set({ [STORAGE_KEY]: updated }, () => {
      chrome.runtime.sendMessage({ type: "SAVE_RULES", rules: updated });
      resolve();
    });
  });
}

// ── Session Polling ───────────────────────────────────────────────────────────
function getSessionStateHash(sessionsObj) {
  return Object.keys(sessionsObj).sort().map(k => {
    const s = sessionsObj[k];
    return `${k}:${s.active}:${s.onBreak}:${s.limitReached}`;
  }).join("|");
}

async function pollSessions() {
  const enabled = rules.filter((r) => r.enabled);
  const newSessions = {};
  for (const rule of enabled) {
    try {
      const status = await new Promise((resolve) => {
        chrome.runtime.sendMessage(
          { type: "GET_SESSION_STATUS", url: rule.url },
          (response) => resolve(response)
        );
      });
      if (status && status.active) {
        newSessions[rule.id] = status;
      }
    } catch {
      // ignore
    }
  }
  
  const oldHash = getSessionStateHash(sessions);
  const newHash = getSessionStateHash(newSessions);
  sessions = newSessions;

  if (oldHash !== newHash) {
    renderContent();
  } else {
    updateLiveTimers();
  }
  updateFooter();
}

function updateLiveTimers() {
  if (currentTab === "rules") {
    rules.forEach(rule => {
      const card = document.querySelector(`.rule-card[data-id="${rule.id}"]`);
      if (!card) return;
      const session = sessions[rule.id];
      const isActive = rule.enabled && session?.active;
      const limitReached = session?.limitReached;
      const onBreak = session?.onBreak;

      let liveChip = "";
      if (onBreak) {
        liveChip = `<span class="live-chip success"><span class="live-dot"></span>Break: ${formatTime(session.breakRemaining || 0)}</span>`;
      } else if (isActive && session?.remaining !== undefined) {
        if (limitReached) {
          liveChip = `<span class="live-chip danger">⏰ Limit reached</span>`;
        } else {
          liveChip = `<span class="live-chip muted">▶ ${formatTime(session.remaining)} left</span>`;
        }
      }
      
      const statsContainer = card.querySelector('.rule-stats');
      if (statsContainer) {
        const existingChip = statsContainer.querySelector('.live-chip');
        if (liveChip) {
          if (existingChip) {
            existingChip.outerHTML = liveChip;
          } else {
            statsContainer.insertAdjacentHTML('beforeend', liveChip);
          }
        } else if (existingChip) {
          existingChip.remove();
        }
      }
    });
  } else {
    const activeSessions = rules.filter(r => r.enabled && sessions[r.id]?.active);
    activeSessions.forEach(rule => {
      const card = document.querySelector(`.session-card[data-id="${rule.id}"]`);
      if (!card) return;
      const status = sessions[rule.id];
      const pct = status?.elapsed && rule.duration
        ? Math.min(100, (status.elapsed / (rule.duration * 60)) * 100)
        : 0;

      const timerVal = status?.onBreak
        ? formatTime(status.breakRemaining || 0)
        : formatTime(status?.remaining || 0);

      const subText = status?.onBreak
        ? `<span style="color:var(--success)">On break — ${formatTime(status.breakRemaining || 0)} left</span>`
        : `<span style="color:var(--text-muted)">${formatTime(status?.elapsed || 0)} elapsed</span>`;

      const timerEl = card.querySelector('.session-timer');
      if (timerEl) timerEl.textContent = timerVal;

      const subEl = card.querySelector('.session-sub');
      if (subEl) subEl.innerHTML = subText;

      const barEl = card.querySelector('.progress-bar');
      if (barEl) barEl.style.width = `${pct}%`;
    });
  }
}

// ── Rendering ─────────────────────────────────────────────────────────────────
function renderContent() {
  const content = document.getElementById("content");

  if (currentTab === "rules") {
    if (rules.length === 0) {
      content.innerHTML = renderEmpty();
    } else {
      content.innerHTML = rules.map(renderRuleCard).join("");
      attachCardListeners();
    }
  } else {
    const activeSessions = rules.filter(
      (r) => r.enabled && sessions[r.id]?.active
    );
    if (activeSessions.length === 0) {
      content.innerHTML = `
        <div class="no-active">
          <div class="no-active-icon">🎉</div>
          <div class="no-active-text">No active sessions</div>
          <div class="no-active-sub">You're not on any tracked site</div>
        </div>`;
    } else {
      content.innerHTML = activeSessions
        .map((r) => renderSessionCard(r, sessions[r.id]))
        .join("");
    }
  }

  // Update active badge
  const activeCount = rules.filter(
    (r) => r.enabled && sessions[r.id]?.active
  ).length;
  const badge = document.getElementById("active-badge");
  if (activeCount > 0) {
    badge.textContent = activeCount;
    badge.style.display = "inline-flex";
  } else {
    badge.style.display = "none";
  }
}

function renderEmpty() {
  return `
    <div id="empty">
      <div class="empty-icon">🕐</div>
      <div class="empty-title">No rules yet</div>
      <div class="empty-sub">Add a website and set your time limit to start tracking</div>
      <button class="empty-btn" id="empty-add-btn">+ Add First Rule</button>
    </div>`;
}

function renderRuleCard(rule) {
  const session = sessions[rule.id];
  const isActive = rule.enabled && session?.active;
  const limitReached = session?.limitReached;
  const onBreak = session?.onBreak;

  const cardClass = `rule-card${limitReached ? " limit-reached" : ""}${onBreak ? " on-break" : ""}`;
  const dotClass = `status-dot${isActive ? " active" : ""}`;

  let liveChip = "";
  if (onBreak) {
    liveChip = `<span class="live-chip success"><span class="live-dot"></span>Break: ${formatTime(session.breakRemaining || 0)}</span>`;
  } else if (isActive && session?.remaining !== undefined) {
    if (limitReached) {
      liveChip = `<span class="live-chip danger">⏰ Limit reached</span>`;
    } else {
      liveChip = `<span class="live-chip muted">▶ ${formatTime(session.remaining)} left</span>`;
    }
  }

  return `
    <div class="${cardClass}" data-id="${rule.id}">
      <div class="rule-top">
        <div class="rule-info">
          <span class="${dotClass}"></span>
          <div style="min-width:0">
            <div class="rule-domain">${escapeHtml(getDomain(rule.url))}</div>
            <div class="rule-url">${escapeHtml(rule.url)}</div>
          </div>
        </div>
        <div class="rule-actions">
          <button class="icon-btn edit-btn" data-action="edit" data-id="${rule.id}" title="Edit">✎</button>
          <button class="icon-btn del-btn" data-action="delete" data-id="${rule.id}" title="Delete">🗑</button>
          <button class="toggle${rule.enabled ? " on" : ""}" data-action="toggle" data-id="${rule.id}" title="${rule.enabled ? "Disable" : "Enable"}">
            <span class="toggle-thumb"></span>
          </button>
        </div>
      </div>
      <div class="rule-stats">
        <span class="stat-chip">⏱ ${rule.duration}m limit</span>
        <span class="stat-chip">☕ ${rule.breakTime}m break</span>
        ${liveChip}
      </div>
    </div>`;
}

function renderSessionCard(rule, status) {
  const pct = status?.elapsed && rule.duration
    ? Math.min(100, (status.elapsed / (rule.duration * 60)) * 100)
    : 0;

  const color = pct >= 100 ? "var(--danger)"
    : pct >= 75 ? "linear-gradient(90deg,var(--accent),#f59e0b)"
    : "linear-gradient(90deg,var(--accent),var(--accent2))";

  const timerColor = status?.limitReached ? "var(--danger)"
    : status?.onBreak ? "var(--success)"
    : "var(--accent2)";

  const timerVal = status?.onBreak
    ? formatTime(status.breakRemaining || 0)
    : formatTime(status?.remaining || 0);

  const subText = status?.onBreak
    ? `<span style="color:var(--success)">On break — ${formatTime(status.breakRemaining || 0)} left</span>`
    : `<span style="color:var(--text-muted)">${formatTime(status?.elapsed || 0)} elapsed</span>`;

  return `
    <div class="session-card" data-id="${rule.id}">
      <div class="session-top">
        <div>
          <div class="session-domain">${escapeHtml(getDomain(rule.url))}</div>
          <div class="session-sub">${subText}</div>
        </div>
        <div class="session-timer" style="color:${timerColor}">${timerVal}</div>
      </div>
      <div class="progress-track">
        <div class="progress-bar" style="width:${pct}%;background:${color}"></div>
      </div>
    </div>`;
}

function updateFooter() {
  document.getElementById("footer-total").textContent =
    `${rules.length} rule${rules.length !== 1 ? "s" : ""}`;
  document.getElementById("footer-enabled").textContent =
    `${rules.filter((r) => r.enabled).length} active`;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ── Event Listeners ───────────────────────────────────────────────────────────
function attachCardListeners() {
  document.querySelectorAll("[data-action]").forEach((el) => {
    el.addEventListener("click", async (e) => {
      e.stopPropagation();
      const action = el.dataset.action;
      const id = el.dataset.id;

      if (action === "toggle") {
        rules = rules.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r));
        await saveRules(rules);
        renderContent();
        updateFooter();
      } else if (action === "delete") {
        rules = rules.filter((r) => r.id !== id);
        delete sessions[id];
        await saveRules(rules);
        await new Promise((res) => {
          chrome.runtime.sendMessage({ type: "DELETE_RULE", id }, res);
        });
        renderContent();
        updateFooter();
      } else if (action === "edit") {
        const rule = rules.find((r) => r.id === id);
        if (rule) openModal(rule);
      }
    });
  });

  // Empty add button
  const emptyBtn = document.getElementById("empty-add-btn");
  if (emptyBtn) emptyBtn.addEventListener("click", () => openModal());
}

// ── Tabs ──────────────────────────────────────────────────────────────────────
document.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    currentTab = tab.dataset.tab;
    document.querySelectorAll(".tab").forEach((t) => t.classList.remove("active"));
    tab.classList.add("active");
    renderContent();
  });
});

// ── Add Button ────────────────────────────────────────────────────────────────
document.getElementById("add-btn").addEventListener("click", () => openModal());

// ── Modal ─────────────────────────────────────────────────────────────────────
function openModal(rule = null) {
  const modal = document.getElementById("modal-overlay");
  document.getElementById("modal-title").textContent = rule ? "Edit Rule" : "New Rule";
  document.getElementById("modal-save").textContent = rule ? "Save Changes" : "Add Rule";
  document.getElementById("edit-id").value = rule?.id || "";
  document.getElementById("url-input").value = rule?.url || "";
  document.getElementById("url-error").textContent = "";
  document.getElementById("url-input").classList.remove("error");

  const dur = rule?.duration || 30;
  const brk = rule?.breakTime || 5;
  document.getElementById("duration-slider").value = dur;
  document.getElementById("break-slider").value = brk;
  updateSliderLabels(dur, brk, rule?.url || "");

  modal.classList.add("open");
  setTimeout(() => document.getElementById("url-input").focus(), 100);
}

function closeModal() {
  document.getElementById("modal-overlay").classList.remove("open");
}

function updateSliderLabels(dur, brk, url) {
  document.getElementById("duration-val").textContent = `${dur}m`;
  document.getElementById("break-val").textContent = `${brk}m`;
  document.getElementById("sum-dur").textContent = `${dur} minutes`;
  document.getElementById("sum-break").textContent = `${brk}-minute break`;
  const domain = getDomain(url) || "this site";
  document.getElementById("sum-domain").textContent = domain;
}

document.getElementById("duration-slider").addEventListener("input", (e) => {
  const url = document.getElementById("url-input").value;
  const brk = Number(document.getElementById("break-slider").value);
  updateSliderLabels(Number(e.target.value), brk, url);
});

document.getElementById("break-slider").addEventListener("input", (e) => {
  const url = document.getElementById("url-input").value;
  const dur = Number(document.getElementById("duration-slider").value);
  updateSliderLabels(dur, Number(e.target.value), url);
});

document.getElementById("url-input").addEventListener("input", (e) => {
  const dur = Number(document.getElementById("duration-slider").value);
  const brk = Number(document.getElementById("break-slider").value);
  updateSliderLabels(dur, brk, e.target.value);
  document.getElementById("url-error").textContent = "";
  e.target.classList.remove("error");
});

document.getElementById("modal-close").addEventListener("click", closeModal);
document.getElementById("modal-cancel").addEventListener("click", closeModal);
document.getElementById("modal-overlay").addEventListener("click", (e) => {
  if (e.target === document.getElementById("modal-overlay")) closeModal();
});

document.getElementById("rule-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const url = document.getElementById("url-input").value.trim();
  if (!url) {
    document.getElementById("url-error").textContent = "Please enter a URL";
    document.getElementById("url-input").classList.add("error");
    return;
  }

  const id = document.getElementById("edit-id").value || genId();
  const duration = Number(document.getElementById("duration-slider").value);
  const breakTime = Number(document.getElementById("break-slider").value);

  const newRule = { id, url, duration, breakTime, enabled: true };

  if (document.getElementById("edit-id").value) {
    // Preserve enabled state on edit
    const existing = rules.find((r) => r.id === id);
    newRule.enabled = existing?.enabled ?? true;
    rules = rules.map((r) => (r.id === id ? newRule : r));
  } else {
    rules = [...rules, newRule];
  }

  await saveRules(rules);
  closeModal();
  renderContent();
  updateFooter();
});

// ── Init ──────────────────────────────────────────────────────────────────────
// ── Init & Auth ─────────────────────────────────────────────────────────────
async function checkAuth() {
  const authStatus = await new Promise((resolve) => {
    chrome.runtime.sendMessage({ type: "GET_AUTH_STATUS" }, resolve);
  });

  const appEl = document.getElementById("app");
  const authEl = document.getElementById("auth-screen");

  if (!authStatus || !authStatus.isAuthenticated) {
    appEl.style.display = "none";
    authEl.style.display = "flex";
  } else {
    appEl.style.display = "flex";
    authEl.style.display = "none";
    
    // Proceed with initialization
    rules = await loadRules();
    renderContent();
    updateFooter();

    // Start polling sessions
    pollInterval = setInterval(pollSessions, 1000);
    pollSessions(); // immediate first poll
  }
}

// ── Login Button ──────────────────────────────────────────────────────────────
document.getElementById("login-btn")?.addEventListener("click", () => {
  // Try to use environment's next app, fallback to localhost for dev
  chrome.tabs.create({ url: "http://localhost:3000/auth/login" });
});

// Run auth check instead of direct init
checkAuth();
