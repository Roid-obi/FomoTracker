// FomoTracker Background Service Worker
// Manages timers, state, and communication between popup and content scripts

const STORAGE_KEY = "fomotracker_rules";
const SESSION_KEY = "fomotracker_sessions";

// Rule structure:
// { id, url, duration (minutes), breakTime (minutes), enabled }

// Session structure:
// { ruleId, url, startTime, paused, pauseStart, totalPaused, breakUntil }

// Listen for messages from popup and content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.type) {
    case "GET_RULES":
      getRules().then(sendResponse);
      return true;

    case "GET_AUTH_STATUS":
      getAuthToken().then(token => sendResponse({ isAuthenticated: !!token, token }));
      return true;

    case "SAVE_RULES":
      saveRules(message.rules).then(sendResponse);
      return true;

    case "DELETE_RULE":
      deleteRule(message.id).then(sendResponse);
      return true;

    case "GET_SESSION_STATUS":
      getSessionStatus(message.url).then(sendResponse);
      return true;

    case "START_BREAK":
      startBreak(message.ruleId).then(sendResponse);
      return true;

    case "DISMISS_OVERLAY":
      dismissOverlay(message.ruleId).then(sendResponse);
      return true;

    case "CHECK_URL":
      checkUrlMatch(message.url).then(sendResponse);
      return true;

    case "TICK":
      handleTick(message.url, sender.tab?.id).then(sendResponse);
      return true;

    default:
      sendResponse({ error: "Unknown message type" });
  }
});

// Tab events
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  try {
    const tab = await chrome.tabs.get(activeInfo.tabId);
    if (tab.url) {
      await handleTabActivated(tab.url, activeInfo.tabId);
    }
  } catch (e) {
    // Tab may not be accessible
  }
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.url) {
    await handleTabActivated(tab.url, tabId);
  }
});

async function getRules() {
  const data = await chrome.storage.local.get(STORAGE_KEY);
  return data[STORAGE_KEY] || [];
}

async function saveRules(rules) {
  await chrome.storage.local.set({ [STORAGE_KEY]: rules });
  return { success: true };
}

async function deleteRule(id) {
  const rules = await getRules();
  const filtered = rules.filter((r) => r.id !== id);
  await saveRules(filtered);
  // Also clean up session
  const sessions = await getSessions();
  delete sessions[id];
  await saveSessions(sessions);
  return { success: true };
}

async function getSessions() {
  const data = await chrome.storage.local.get(SESSION_KEY);
  return data[SESSION_KEY] || {};
}

async function saveSessions(sessions) {
  await chrome.storage.local.set({ [SESSION_KEY]: sessions });
}

function urlMatchesRule(url, ruleUrl) {
  try {
    const targetUrl = new URL(ruleUrl.startsWith("http") ? ruleUrl : `https://${ruleUrl}`);
    const currentUrl = new URL(url);
    // Match by hostname (exact or subdomain)
    return (
      currentUrl.hostname === targetUrl.hostname ||
      currentUrl.hostname.endsWith(`.${targetUrl.hostname}`) ||
      targetUrl.hostname.endsWith(`.${currentUrl.hostname}`)
    );
  } catch {
    return url.includes(ruleUrl);
  }
}

async function checkUrlMatch(url) {
  const rules = await getRules();
  const matchingRule = rules.find(
    (r) => r.enabled && urlMatchesRule(url, r.url)
  );
  return { rule: matchingRule || null };
}

async function getSessionStatus(url) {
  const { rule } = await checkUrlMatch(url);
  if (!rule) return { active: false };

  const sessions = await getSessions();
  const session = sessions[rule.id];

  if (!session) {
    return {
      active: false,
      rule,
      elapsed: 0,
      remaining: rule.duration * 60,
      onBreak: false,
    };
  }

  const now = Date.now();

  // Check if on break
  if (session.breakUntil && now < session.breakUntil) {
    const breakRemaining = Math.ceil((session.breakUntil - now) / 1000);
    return {
      active: true,
      rule,
      session,
      onBreak: true,
      breakRemaining,
      elapsed: Math.floor(session.totalElapsed / 1000),
      remaining: Math.max(0, rule.duration * 60 - Math.floor(session.totalElapsed / 1000)),
    };
  }

  // Break ended — reset overlay state
  if (session.breakUntil && now >= session.breakUntil) {
    session.breakUntil = null;
    session.overlayShown = false;
    session.startTime = now;
    session.totalElapsed = 0;
    sessions[rule.id] = session;
    await saveSessions(sessions);
  }

  const elapsedSeconds = Math.floor(session.totalElapsed / 1000);
  const limitSeconds = rule.duration * 60;
  const remaining = Math.max(0, limitSeconds - elapsedSeconds);

  return {
    active: true,
    rule,
    session,
    elapsed: elapsedSeconds,
    remaining,
    onBreak: false,
    limitReached: elapsedSeconds >= limitSeconds,
    overlayShown: session.overlayShown,
  };
}

async function handleTick(url, tabId) {
  const { rule } = await checkUrlMatch(url);
  if (!rule) return { active: false };

  const sessions = await getSessions();
  let session = sessions[rule.id];
  const now = Date.now();

  if (!session) {
    session = {
      ruleId: rule.id,
      url: url,
      startTime: now,
      totalElapsed: 0,
      breakUntil: null,
      overlayShown: false,
    };
  } else {
    // Only count time if last tick was recent (within 5 seconds).
    // If it's been longer, the tab was closed or suspended, so we don't count the gap.
    const gap = now - session.startTime;
    if (gap < 5000) {
      session.totalElapsed += gap;
    }
    session.startTime = now;
  }

  // Check break
  if (session.breakUntil && now < session.breakUntil) {
    sessions[rule.id] = session;
    await saveSessions(sessions);
    return { active: true, onBreak: true };
  }

  // Break ended
  if (session.breakUntil && now >= session.breakUntil) {
    session.breakUntil = null;
    session.overlayShown = false;
    session.totalElapsed = 0;
  }

  sessions[rule.id] = session;
  await saveSessions(sessions);

  const elapsedSeconds = Math.floor(session.totalElapsed / 1000);
  const limitSeconds = rule.duration * 60;
  const limitReached = elapsedSeconds >= limitSeconds;

  return {
    active: true,
    rule,
    elapsed: elapsedSeconds,
    remaining: Math.max(0, limitSeconds - elapsedSeconds),
    limitReached,
    onBreak: false,
    overlayShown: session.overlayShown,
  };
}

async function startBreak(ruleId) {
  const rules = await getRules();
  const rule = rules.find((r) => r.id === ruleId);
  if (!rule) return { success: false };

  const sessions = await getSessions();
  const session = sessions[ruleId];
  if (!session) return { success: false };

  session.breakUntil = Date.now() + rule.breakTime * 60 * 1000;
  session.overlayShown = false;
  session.totalElapsed = 0;
  session.startTime = Date.now();
  sessions[ruleId] = session;
  await saveSessions(sessions);

  return { success: true, breakUntil: session.breakUntil };
}

async function dismissOverlay(ruleId) {
  const sessions = await getSessions();
  const session = sessions[ruleId];
  if (session) {
    session.overlayShown = true;
    sessions[ruleId] = session;
    await saveSessions(sessions);
  }
  return { success: true };
}

async function handleTabActivated(url, tabId) {
  // Notify the content script to re-check
  try {
    await chrome.tabs.sendMessage(tabId, { type: "URL_CHANGED", url });
  } catch {
    // Content script not ready yet
  }
}

// Check if user is logged into the main web app
async function getAuthToken() {
  return new Promise((resolve) => {
    // Check both http and https for localhost or production
    const domains = ["http://localhost:3000", "https://localhost:3000", "https://fomotracker.vercel.app"];
    
    // Check domains one by one
    let foundToken = null;
    let checkedCount = 0;

    const checkNext = () => {
      if (checkedCount >= domains.length || foundToken) {
        resolve(foundToken);
        return;
      }
      const url = domains[checkedCount];
      checkedCount++;
      
      chrome.cookies.getAll({ url }, (cookies) => {
        // Find cookie starting with sb- and ending with -auth-token
        const authCookie = cookies.find(c => c.name.startsWith('sb-') && c.name.endsWith('-auth-token'));
        if (authCookie) {
          try {
            const sessionData = JSON.parse(decodeURIComponent(authCookie.value));
            // In typical Supabase session cookie, the first element is the access token or it's an object with access_token
            if (Array.isArray(sessionData) && sessionData.length > 0) {
              foundToken = sessionData[0];
            } else if (sessionData && sessionData.access_token) {
              foundToken = sessionData.access_token;
            } else {
              foundToken = sessionData; // Fallback
            }
          } catch (e) {
            // parsing failed, but cookie exists
            foundToken = authCookie.value;
          }
        }
        checkNext();
      });
    };
    
    checkNext();
  });
}
