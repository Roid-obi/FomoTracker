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
 * @typedef {{ id:string, url:string, enabled:boolean }} Rule
 * @typedef {{ active:boolean, rule?:Rule, elapsed?:number }} SessionStatus
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
  return Object.keys(sessionsObj)
    .sort()
    .map((k) => {
      const s = sessionsObj[k];
      return `${k}:${s.active}`;
    })
    .join("|");
}

async function pollSessions() {
  const enabled = rules.filter((r) => r.enabled);
  const newSessions = {};
  for (const rule of enabled) {
    try {
      const status = await new Promise((resolve) => {
        chrome.runtime.sendMessage(
          { type: "GET_SESSION_STATUS", url: rule.url },
          (response) => resolve(response),
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
    rules.forEach((rule) => {
      const card = document.querySelector(`.rule-card[data-id="${rule.id}"]`);
      if (!card) return;
      const session = sessions[rule.id];
      const isActive = rule.enabled && session?.active;

      let liveChip = "";
      if (isActive && session?.elapsed !== undefined) {
        liveChip = `<span class="live-chip muted">▶ ${formatTime(session.elapsed)} terlacak</span>`;
      }

      const statsContainer = card.querySelector(".rule-stats");
      if (statsContainer) {
        const existingChip = statsContainer.querySelector(".live-chip");
        if (liveChip) {
          if (existingChip) {
            existingChip.outerHTML = liveChip;
          } else {
            statsContainer.insertAdjacentHTML("beforeend", liveChip);
          }
        } else if (existingChip) {
          existingChip.remove();
        }
      }
    });
  } else {
    const activeSessions = rules.filter(
      (r) => r.enabled && sessions[r.id]?.active,
    );
    activeSessions.forEach((rule) => {
      const card = document.querySelector(
        `.session-card[data-id="${rule.id}"]`,
      );
      if (!card) return;
      const status = sessions[rule.id];
      const pct = 100;

      const timerVal = formatTime(status?.elapsed || 0);

      const subText = `<span style="color:var(--text-muted)">Melacak...</span>`;

      const timerEl = card.querySelector(".session-timer");
      if (timerEl) timerEl.textContent = timerVal;

      const subEl = card.querySelector(".session-sub");
      if (subEl) subEl.innerHTML = subText;

      const barEl = card.querySelector(".progress-bar");
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
      (r) => r.enabled && sessions[r.id]?.active,
    );
    if (activeSessions.length === 0) {
      content.innerHTML = `
        <div class="no-active">
          <div class="no-active-icon">🎉</div>
          <div class="no-active-text">Tidak ada sesi aktif</div>
          <div class="no-active-sub">Anda tidak berada di situs yang dilacak</div>
        </div>`;
    } else {
      content.innerHTML = activeSessions
        .map((r) => renderSessionCard(r, sessions[r.id]))
        .join("");
    }
  }

  // Update active badge
  const activeCount = rules.filter(
    (r) => r.enabled && sessions[r.id]?.active,
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
      <div class="empty-title">Belum ada aturan</div>
      <div class="empty-sub">Tambahkan situs web untuk mulai melacak</div>
    </div>`;
}

function renderRuleCard(rule) {
  const session = sessions[rule.id];
  const isActive = rule.enabled && session?.active;

  const cardClass = `rule-card`;
  const dotClass = `status-dot${isActive ? " active" : ""}`;

  let liveChip = "";
  if (isActive && session?.elapsed !== undefined) {
    liveChip = `<span class="live-chip muted">▶ ${formatTime(session.elapsed)} terlacak</span>`;
  }

  return `
    <div class="${cardClass}" data-id="${rule.id}">
      <div class="rule-top">
        <div class="rule-info">
          <span class="${dotClass}"></span>
          <div style="min-width:0">
            <div class="rule-domain">${escapeHtml(rule.name || getDomain(rule.url))}</div>
            <div class="rule-url">${escapeHtml(rule.url)}</div>
          </div>
        </div>
        <div class="rule-actions">
          <button class="icon-btn edit-btn" data-action="edit" data-id="${rule.id}" title="Edit">✎</button>
          <button class="icon-btn del-btn" data-action="delete" data-id="${rule.id}" title="Hapus">🗑</button>
          <button class="toggle${rule.enabled ? " on" : ""}" data-action="toggle" data-id="${rule.id}" title="${rule.enabled ? "Nonaktifkan" : "Aktifkan"}">
            <span class="toggle-thumb"></span>
          </button>
        </div>
      </div>
      <div class="rule-stats">
        ${liveChip}
      </div>
    </div>`;
}

function renderSessionCard(rule, status) {
  const pct = 100;
  const color = "linear-gradient(90deg,var(--accent),var(--accent2))";
  const timerColor = "var(--accent2)";
  const timerVal = formatTime(status?.elapsed || 0);
  const subText = `<span style="color:var(--text-muted)">Melacak...</span>`;

  return `
    <div class="session-card" data-id="${rule.id}">
      <div class="session-top">
        <div>
          <div class="session-domain">${escapeHtml(rule.name || getDomain(rule.url))}</div>
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
    `${rules.length} aturan`;
  document.getElementById("footer-enabled").textContent =
    `${rules.filter((r) => r.enabled).length} aktif`;
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
        rules = rules.map((r) =>
          r.id === id ? { ...r, enabled: !r.enabled } : r,
        );
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
    document
      .querySelectorAll(".tab")
      .forEach((t) => t.classList.remove("active"));
    tab.classList.add("active");
    renderContent();
  });
});

// ── Add Button ────────────────────────────────────────────────────────────────
document.getElementById("add-btn").addEventListener("click", () => openModal());

// ── Modal ─────────────────────────────────────────────────────────────────────
function openModal(rule = null) {
  const modal = document.getElementById("modal-overlay");
  document.getElementById("modal-title").textContent = rule
    ? "Edit Aturan"
    : "Aturan Baru";
  document.getElementById("modal-save").textContent = rule
    ? "Simpan Perubahan"
    : "Tambah Aturan";
  document.getElementById("edit-id").value = rule?.id || "";
  document.getElementById("name-input").value = rule?.name || "";
  document.getElementById("url-input").value = rule?.url || "";
  document.getElementById("url-error").textContent = "";
  document.getElementById("url-input").classList.remove("error");
  updateDomainLabel(rule?.url || "");

  modal.classList.add("open");
  setTimeout(() => document.getElementById("url-input").focus(), 100);
}

function closeModal() {
  document.getElementById("modal-overlay").classList.remove("open");
}

function updateDomainLabel(url) {
  const domain = getDomain(url) || "situs ini";
  document.getElementById("sum-domain").textContent = domain;
}

document.getElementById("url-input").addEventListener("input", (e) => {
  updateDomainLabel(e.target.value);
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
  const name = document.getElementById("name-input").value.trim();
  const url = document.getElementById("url-input").value.trim();
  if (!url) {
    document.getElementById("url-error").textContent = "Harap masukkan URL";
    document.getElementById("url-input").classList.add("error");
    return;
  }

  const id = document.getElementById("edit-id").value || genId();

  const newRule = { id, name, url, enabled: true };

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

// Listen for rule changes from the background/web app
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === "local" && changes[STORAGE_KEY]) {
    rules = changes[STORAGE_KEY].newValue || [];
    renderContent();
    updateFooter();
  }
});
