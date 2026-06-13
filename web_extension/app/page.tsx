"use client";

import { useState, useEffect, useCallback } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Rule {
  id: string;
  url: string;
  duration: number; // minutes
  enabled: boolean;
}

interface SessionStatus {
  active: boolean;
  rule?: Rule;
  elapsed?: number;
  remaining?: number;
  limitReached?: boolean;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function generateId(): string {
  return Math.random().toString(36).slice(2, 10);
}

function getDomain(url: string): string {
  try {
    const u = url.startsWith("http") ? url : `https://${url}`;
    return new URL(u).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

// ─── Chrome API wrapper ───────────────────────────────────────────────────────

const isExtension =
  typeof window !== "undefined" &&
  typeof (window as unknown as Record<string, unknown>)["chrome"] !==
    "undefined" &&
  !!(window as unknown as Record<string, { runtime?: { id?: string } }>)[
    "chrome"
  ]?.runtime?.id;

async function sendMessage<T = unknown>(message: object): Promise<T> {
  if (!isExtension) return {} as T;
  return new Promise((resolve) => {
    chrome.runtime.sendMessage(message, (response: T) => {
      resolve(response);
    });
  });
}

async function getFromStorage<T>(key: string): Promise<T | null> {
  if (!isExtension) {
    const val = localStorage.getItem(key);
    return val ? (JSON.parse(val) as T) : null;
  }
  return new Promise((resolve) => {
    chrome.storage.local.get(key, (data) => {
      resolve((data[key] as T) ?? null);
    });
  });
}

async function saveToStorage(key: string, value: unknown): Promise<void> {
  if (!isExtension) {
    localStorage.setItem(key, JSON.stringify(value));
    return;
  }
  return new Promise((resolve) => {
    chrome.storage.local.set({ [key]: value }, resolve);
  });
}

// ─── Components ───────────────────────────────────────────────────────────────

function StatusDot({ active }: { active: boolean }) {
  return (
    <span
      className={`inline-block w-2 h-2 rounded-full ${
        active ? "bg-[var(--success)]" : "bg-[var(--text-muted)]"
      }`}
      style={active ? { boxShadow: "0 0 6px var(--success)" } : {}}
    />
  );
}

function RuleCard({
  rule,
  onToggle,
  onDelete,
  onEdit,
  sessionStatus,
}: {
  rule: Rule;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (rule: Rule) => void;
  sessionStatus?: SessionStatus | null;
}) {
  const isActive = rule.enabled && sessionStatus?.active;
  const limitReached = sessionStatus?.limitReached;

  return (
    <div
      className="group relative rounded-2xl p-4 transition-all duration-200 cursor-pointer"
      style={{
        background: limitReached
          ? "linear-gradient(135deg, rgba(239,68,68,0.06) 0%, rgba(239,68,68,0.02) 100%)"
          : "var(--bg-surface)",
        border: limitReached
          ? "1px solid rgba(239,68,68,0.2)"
          : "1px solid var(--border-subtle)",
      }}
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <StatusDot active={!!isActive} />
          <div className="min-w-0">
            <div
              className="font-semibold text-sm truncate leading-tight"
              style={{
                fontFamily: "var(--font-display)",
                color: "var(--text-primary)",
              }}
            >
              {getDomain(rule.url)}
            </div>
            <div
              className="text-xs truncate mt-0.5"
              style={{ color: "var(--text-muted)" }}
            >
              {rule.url}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            onClick={() => onEdit(rule)}
            className="w-7 h-7 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-150"
            style={{
              background: "var(--bg-hover)",
              color: "var(--text-muted)",
            }}
            aria-label="Edit aturan"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="13"
              height="13"
              fill="currentColor"
              viewBox="0 0 16 16"
            >
              <path d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.499.499 0 0 1-.175-.032l-.179.178a.5.5 0 0 0-.11.168l-2 5a.5.5 0 0 0 .65.65l5-2a.5.5 0 0 0 .168-.11z" />
            </svg>
          </button>

          <button
            onClick={() => onDelete(rule.id)}
            className="w-7 h-7 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-150"
            style={{
              background: "var(--danger-bg)",
              color: "var(--danger)",
            }}
            aria-label="Hapus aturan"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="13"
              height="13"
              fill="currentColor"
              viewBox="0 0 16 16"
            >
              <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z" />
              <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z" />
            </svg>
          </button>

          {/* Toggle */}
          <button
            onClick={() => onToggle(rule.id)}
            className="relative w-9 h-5 rounded-full transition-all duration-200"
            style={{
              background: rule.enabled
                ? "var(--accent-primary)"
                : "var(--bg-hover)",
              boxShadow: rule.enabled ? "0 0 12px var(--accent-glow)" : "none",
            }}
            aria-label={rule.enabled ? "Nonaktifkan aturan" : "Aktifkan aturan"}
          >
            <span
              className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-200"
              style={{
                left: rule.enabled ? "calc(100% - 18px)" : "2px",
              }}
            />
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-3">
        <div
          className="flex items-center gap-1.5 text-xs rounded-lg px-2.5 py-1"
          style={{
            background: "var(--bg-elevated)",
            color: "var(--text-secondary)",
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="11"
            height="11"
            fill="currentColor"
            viewBox="0 0 16 16"
          >
            <path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71z" />
            <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16m7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0" />
          </svg>
          {rule.duration}m batas
        </div>

        {/* Live status */}
        {isActive && sessionStatus?.remaining !== undefined && (
          <div
            className="flex items-center gap-1 text-xs rounded-lg px-2.5 py-1 ml-auto"
            style={{
              background: limitReached
                ? "var(--danger-bg)"
                : "var(--bg-elevated)",
              color: limitReached ? "var(--danger)" : "var(--text-muted)",
            }}
          >
            {limitReached ? "⏰" : "▶"}
            {limitReached
              ? " Batas tercapai"
              : ` ${formatTime(sessionStatus.remaining)} tersisa`}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Add/Edit Modal ───────────────────────────────────────────────────────────

function RuleModal({
  initial,
  onSave,
  onClose,
}: {
  initial?: Rule | null;
  onSave: (rule: Omit<Rule, "id"> & { id?: string }) => void;
  onClose: () => void;
}) {
  const [url, setUrl] = useState(initial?.url ?? "");
  const [duration, setDuration] = useState(initial?.duration ?? 30);
  const [urlError, setUrlError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      setUrlError("Please enter a URL");
      return;
    }
    setUrlError("");
    onSave({
      id: initial?.id,
      url: url.trim(),
      duration,
      enabled: initial?.enabled ?? true,
    });
  };

  const inputClass =
    "w-full rounded-xl px-4 py-3 text-sm transition-all duration-150 border";
  const inputStyle = {
    background: "var(--bg-elevated)",
    color: "var(--text-primary)",
    borderColor: "var(--border-subtle)",
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in"
      style={{ background: "rgba(6,39,67,0.6)", backdropFilter: "blur(6px)" }}
    >
      <div
        className="w-full max-w-sm mx-4 rounded-2xl p-6 animate-scale-in"
        style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--border-accent)",
          boxShadow:
            "0 0 0 1px var(--border-accent), 0 32px 64px rgba(6,39,67,0.5)",
        }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2
            className="text-lg font-bold"
            style={{
              fontFamily: "var(--font-display)",
              color: "var(--text-primary)",
            }}
          >
            {initial ? "Edit Aturan" : "Aturan Baru"}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
            style={{
              background: "var(--bg-hover)",
              color: "var(--text-muted)",
            }}
            aria-label="Tutup modal"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* URL */}
          <div>
            <label
              className="block text-xs font-semibold mb-2 uppercase tracking-wider"
              style={{ color: "var(--text-muted)" }}
            >
              URL Situs
            </label>
            <input
              type="text"
              id="rule-url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="mis. youtube.com atau twitter.com"
              className={`${inputClass} focus:outline-none`}
              style={{
                ...inputStyle,
                borderColor: urlError
                  ? "var(--danger)"
                  : url
                    ? "var(--border-accent)"
                    : "var(--border-subtle)",
                boxShadow: url ? "0 0 0 3px rgba(6,39,67,0.1)" : "none",
              }}
              autoFocus
            />
            {urlError && (
              <p className="text-xs mt-1" style={{ color: "var(--danger)" }}>
                {urlError}
              </p>
            )}
          </div>

          {/* Duration */}
          <div>
            <label
              className="block text-xs font-semibold mb-2 uppercase tracking-wider"
              style={{ color: "var(--text-muted)" }}
            >
              Batas waktu (menit)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                id="rule-duration"
                min={1}
                max={120}
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="flex-1 h-1.5 rounded-full appearance-none cursor-pointer"
                style={{ accentColor: "var(--accent-primary)" }}
              />
              <div
                className="w-16 text-center rounded-xl py-2 text-sm font-bold tabular-nums"
                style={{
                  background: "var(--bg-elevated)",
                  color: "var(--accent-secondary)",
                  fontFamily: "var(--font-display)",
                }}
              >
                {duration}m
              </div>
            </div>
          </div>

          {/* Summary */}
          <div
            className="rounded-xl p-3 text-xs leading-relaxed"
            style={{
              background: "rgba(6,39,67,0.06)",
              border: "1px solid rgba(6,39,67,0.12)",
              color: "var(--text-secondary)",
            }}
          >
            Setelah{" "}
            <span style={{ color: "var(--accent-secondary)", fontWeight: 600 }}>
              {duration} menit
            </span>{" "}
            di{" "}
            <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>
              {getDomain(url) || "situs ini"}
            </span>
            , akan muncul pemberitahuan waktu.
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl text-sm font-medium transition-all"
              style={{
                background: "var(--bg-hover)",
                color: "var(--text-secondary)",
              }}
            >
              Batal
            </button>
            <button
              type="submit"
              id="save-rule-btn"
              className="flex-1 py-3 rounded-xl text-sm font-bold transition-all duration-150 hover:opacity-90"
              style={{
                background: "var(--accent-primary)",
                color: "white",
                boxShadow: "0 4px 16px var(--accent-glow)",
              }}
            >
              {initial ? "Simpan Perubahan" : "Tambah Aturan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────

export default function Home() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [sessions, setSessions] = useState<Record<string, SessionStatus>>({});
  const [showModal, setShowModal] = useState(false);
  const [editingRule, setEditingRule] = useState<Rule | null>(null);
  const [activeTab, setActiveTab] = useState<"rules" | "active">("rules");
  const [loading, setLoading] = useState(true);

  // Save rules
  const persistRules = useCallback(async (updated: Rule[]) => {
    await saveToStorage("fomotracker_rules", updated);
    if (isExtension) {
      await sendMessage({ type: "SAVE_RULES", rules: updated });
    }
  }, []);

  // Load rules on mount
  useEffect(() => {
    let cancelled = false;
    async function load() {
      const stored = await getFromStorage<Rule[]>("fomotracker_rules");
      if (!cancelled) {
        setRules(stored || []);
        setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  // Poll active sessions
  useEffect(() => {
    if (rules.length === 0) return;
    let cancelled = false;

    async function poll() {
      const sessionMap: Record<string, SessionStatus> = {};
      for (const rule of rules) {
        if (!rule.enabled) continue;
        try {
          const status = await sendMessage<SessionStatus>({
            type: "GET_SESSION_STATUS",
            url: rule.url,
          });
          if (status?.active) {
            sessionMap[rule.id] = status;
          }
        } catch {
          // ignore
        }
      }
      if (!cancelled) setSessions(sessionMap);
    }

    poll();
    const interval = setInterval(poll, 2000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [rules]);

  const handleAddRule = async (data: Omit<Rule, "id"> & { id?: string }) => {
    const newRule: Rule = {
      id: data.id || generateId(),
      url: data.url,
      duration: data.duration,
      enabled: data.enabled,
    };

    let updated: Rule[];
    if (data.id) {
      updated = rules.map((r) => (r.id === data.id ? newRule : r));
    } else {
      updated = [...rules, newRule];
    }

    setRules(updated);
    await persistRules(updated);
    setShowModal(false);
    setEditingRule(null);
  };

  const handleToggle = async (id: string) => {
    const updated = rules.map((r) =>
      r.id === id ? { ...r, enabled: !r.enabled } : r,
    );
    setRules(updated);
    await persistRules(updated);
  };

  const handleDelete = async (id: string) => {
    const updated = rules.filter((r) => r.id !== id);
    setRules(updated);
    await persistRules(updated);
    setSessions((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const handleEdit = (rule: Rule) => {
    setEditingRule(rule);
    setShowModal(true);
  };

  const activeRules = rules.filter((r) => r.enabled && sessions[r.id]?.active);

  return (
    <>
      <div
        className="flex flex-col min-h-screen relative z-10"
        style={{ background: "transparent" }}
      >
        {/* Header */}
        <header
          className="flex items-center justify-between px-5 pt-5 pb-3"
          style={{ borderBottom: "1px solid var(--border-subtle)" }}
        >
          <div className="flex items-baseline gap-0.5 select-none">
            <span
              className="text-3xl font-normal leading-none"
              style={{
                fontFamily: "var(--font-yellowtail), cursive",
                color: "var(--text-primary)",
              }}
            >
              Fomo
            </span>
            <span
              className="text-[10px] font-bold tracking-widest uppercase leading-none"
              style={{
                fontFamily: "var(--font-display)",
                color: "var(--text-primary)",
              }}
            >
              Tracker
            </span>
          </div>

          <button
            id="add-rule-btn"
            onClick={() => {
              setEditingRule(null);
              setShowModal(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-150 hover:opacity-90"
            style={{
              background: "var(--accent-primary)",
              color: "white",
              boxShadow: "0 2px 12px var(--accent-glow)",
            }}
          >
            <span className="text-base leading-none">+</span>
            Tambah Aturan
          </button>
        </header>

        {/* Tab bar */}
        <div className="flex px-5 pt-4 gap-1">
          {(["rules", "active"] as const).map((tab) => (
            <button
              key={tab}
              id={`tab-${tab}`}
              onClick={() => setActiveTab(tab)}
              className="flex-1 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-150"
              style={{
                background:
                  activeTab === tab ? "var(--bg-elevated)" : "transparent",
                color:
                  activeTab === tab
                    ? "var(--accent-secondary)"
                    : "var(--text-muted)",
                border:
                  activeTab === tab
                    ? "1px solid var(--border-accent)"
                    : "1px solid transparent",
              }}
            >
              {tab === "active" ? (
                <span className="flex items-center justify-center gap-1.5">
                  Aktif
                  {activeRules.length > 0 && (
                    <span
                      className="w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-bold"
                      style={{
                        background: "var(--danger)",
                        color: "white",
                      }}
                    >
                      {activeRules.length}
                    </span>
                  )}
                </span>
              ) : (
                "Semua Aturan"
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 px-5 py-4 overflow-y-auto space-y-2.5">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div
                className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin"
                style={{
                  borderColor:
                    "var(--accent-primary) transparent transparent transparent",
                }}
              />
            </div>
          ) : activeTab === "rules" ? (
            rules.length === 0 ? (
              <EmptyState onAdd={() => setShowModal(true)} />
            ) : (
              rules.map((rule, i) => (
                <div
                  key={rule.id}
                  className="animate-slide-in"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <RuleCard
                    rule={rule}
                    onToggle={handleToggle}
                    onDelete={handleDelete}
                    onEdit={handleEdit}
                    sessionStatus={sessions[rule.id]}
                  />
                </div>
              ))
            )
          ) : activeRules.length === 0 ? (
            <div
              className="text-center py-12"
              style={{ color: "var(--text-muted)" }}
            >
              <div className="text-3xl mb-3">🎉</div>
              <p className="text-sm font-medium">Tidak ada sesi aktif</p>
              <p className="text-xs mt-1 opacity-70">
                Anda tidak berada di situs yang dilacak
              </p>
            </div>
          ) : (
            activeRules.map((rule, i) => (
              <div
                key={rule.id}
                className="animate-slide-in"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <ActiveSessionCard rule={rule} status={sessions[rule.id]} />
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <footer
          className="px-5 py-3 flex items-center justify-between"
          style={{
            borderTop: "1px solid var(--border-subtle)",
          }}
        >
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>
            {rules.length} aturan
          </span>
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>
            {rules.filter((r) => r.enabled).length} aktif
          </span>
        </footer>
      </div>

      {/* Modal */}
      {showModal && (
        <RuleModal
          initial={editingRule}
          onSave={handleAddRule}
          onClose={() => {
            setShowModal(false);
            setEditingRule(null);
          }}
        />
      )}
    </>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center animate-fade-in">
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl mb-4"
        style={{
          background: "var(--bg-elevated)",
          border: "1px solid var(--border-subtle)",
        }}
      >
        🕐
      </div>
      <h3
        className="text-base font-bold mb-1"
        style={{
          fontFamily: "var(--font-display)",
          color: "var(--text-primary)",
        }}
      >
        Belum ada aturan
      </h3>
      <p
        className="text-xs mb-5 max-w-[200px] leading-relaxed"
        style={{ color: "var(--text-muted)" }}
      >
        Tambahkan situs web dan atur batas waktu untuk mulai melacak
      </p>
    </div>
  );
}

// ─── Active Session Card ──────────────────────────────────────────────────────

function ActiveSessionCard({
  rule,
  status,
}: {
  rule: Rule;
  status?: SessionStatus;
}) {
  const pct =
    status?.elapsed && rule.duration
      ? Math.min(100, (status.elapsed / (rule.duration * 60)) * 100)
      : 0;

  return (
    <div
      className="rounded-2xl p-4"
      style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border-subtle)",
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <div>
          <div
            className="font-bold text-sm"
            style={{
              fontFamily: "var(--font-display)",
              color: "var(--text-primary)",
            }}
          >
            {getDomain(rule.url)}
          </div>
          {status?.limitReached ? (
            <div className="text-xs mt-0.5" style={{ color: "var(--danger)" }}>
              Batas tercapai
            </div>
          ) : (
            <div
              className="text-xs mt-0.5"
              style={{ color: "var(--text-muted)" }}
            >
              {formatTime(status?.elapsed || 0)} berlalu
            </div>
          )}
        </div>

        <div
          className="text-2xl font-black tabular-nums"
          style={{
            fontFamily: "var(--font-display)",
            color: status?.limitReached
              ? "var(--danger)"
              : "var(--accent-secondary)",
          }}
        >
          {formatTime(status?.remaining || 0)}
        </div>
      </div>

      {/* Progress bar */}
      <div
        className="w-full h-1.5 rounded-full overflow-hidden"
        style={{ background: "var(--bg-elevated)" }}
      >
        <div
          className="h-full rounded-full transition-all duration-1000"
          style={{
            width: `${pct}%`,
            background:
              pct >= 100
                ? "var(--danger)"
                : pct >= 75
                  ? "linear-gradient(90deg, var(--accent-primary), #f59e0b)"
                  : "linear-gradient(90deg, var(--accent-primary), var(--accent-secondary))",
          }}
        />
      </div>
    </div>
  );
}
