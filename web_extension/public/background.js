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

    case "SET_USER_INFO":
      chrome.storage.local.set({ 
        fomotracker_user_id: message.userId, 
        fomotracker_device_id: message.deviceId 
      }).then(() => sendResponse({ success: true }));
      return true;

    case "CHECK_URL":
      checkUrlMatch(message.url).then(sendResponse);
      return true;

    case "HANDLE_SPA_NAVIGATION":
      handleSpaNavigation(message.oldUrl, message.newUrl).then(sendResponse);
      return true;

    case "FLUSH_SESSION":
      handleFlushSession(message.url).then(sendResponse);
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
    };
  }

  const elapsedSeconds = Math.floor(session.totalElapsed / 1000);

  return {
    active: true,
    rule,
    session,
    elapsed: elapsedSeconds,
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
      lastTick: now
    };
  } else {
    const gap = now - session.lastTick;
    if (gap < 5000) {
      session.totalElapsed += gap;
    } else {
      if (session.totalElapsed > 1000) {
        await flushSessionToApi(session);
      }
      session.startTime = now;
      session.totalElapsed = 0;
    }
    session.lastTick = now;
  }

  sessions[rule.id] = session;
  await saveSessions(sessions);

  return {
    active: true,
    rule,
    elapsed: Math.floor(session.totalElapsed / 1000),
  };
}

async function handleFlushSession(url) {
  const { rule } = await checkUrlMatch(url);
  if (!rule) return;

  const sessions = await getSessions();
  const session = sessions[rule.id];
  
  if (session && session.totalElapsed > 1000) {
    await flushSessionToApi(session);
    delete sessions[rule.id];
    await saveSessions(sessions);
  }
}

async function handleSpaNavigation(oldUrl, newUrl) {
  const oldMatch = await checkUrlMatch(oldUrl);
  const newMatch = await checkUrlMatch(newUrl);

  if (oldMatch.rule && oldMatch.rule.id !== newMatch.rule?.id) {
    const sessions = await getSessions();
    const session = sessions[oldMatch.rule.id];
    if (session && session.totalElapsed > 1000) {
      await flushSessionToApi(session);
      delete sessions[oldMatch.rule.id];
      await saveSessions(sessions);
    }
  }
}

async function flushSessionToApi(session) {
  const durationSeconds = Math.floor(session.totalElapsed / 1000);
  if (durationSeconds < 1) return;

  const targetUrl = new URL(session.url.startsWith("http") ? session.url : `https://${session.url}`);
  const webDomain = targetUrl.hostname.replace(/^www\./, "");

  const logs = [{
    webDomain,
    startedAt: new Date(session.startTime).toISOString(),
    endedAt: new Date(session.startTime + session.totalElapsed).toISOString(),
    durationSeconds,
    isMidnight: new Date(session.startTime).getHours() < 5,
    isProductiveHour: false,
    isContinuous: true,
    source: "browser_extension"
  }];

  const data = await chrome.storage.local.get(["fomotracker_user_id", "fomotracker_device_id"]);
  const userId = data.fomotracker_user_id;
  const deviceId = data.fomotracker_device_id;
  
  if (!userId || !deviceId) return;

  const authData = await getAuthTokenAndDomain();
  if (!authData) return;

  try {
    const apiUrl = `${authData.domain}/api/tracking/sync/activity`;
    await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${authData.token}`
      },
      body: JSON.stringify({ userId, deviceId, logs })
    });
  } catch (e) {
    console.error("Failed to sync log", e);
  }
}

async function getAuthTokenAndDomain() {
  return new Promise((resolve) => {
    const domains = ["http://localhost:3000", "https://localhost:3000", "https://fomotracker.vercel.app"];
    
    let foundToken = null;
    let foundDomain = null;
    let checkedCount = 0;

    const checkNext = () => {
      if (checkedCount >= domains.length || foundToken) {
        resolve(foundToken ? { token: foundToken, domain: foundDomain } : null);
        return;
      }
      const url = domains[checkedCount];
      checkedCount++;
      
      chrome.cookies.getAll({ url }, (cookies) => {
        const authCookie = cookies.find(c => c.name.startsWith('sb-') && c.name.endsWith('-auth-token'));
        if (authCookie) {
          try {
            const sessionData = JSON.parse(decodeURIComponent(authCookie.value));
            if (Array.isArray(sessionData) && sessionData.length > 0) {
              foundToken = sessionData[0];
            } else if (sessionData && sessionData.access_token) {
              foundToken = sessionData.access_token;
            } else {
              foundToken = sessionData;
            }
            foundDomain = url;
          } catch (e) {
            foundToken = authCookie.value;
            foundDomain = url;
          }
        }
        checkNext();
      });
    };
    
    checkNext();
  });
}

async function handleTabActivated(url, tabId) {
  // Notify the content script to re-check
  try {
    await chrome.tabs.sendMessage(tabId, { type: "URL_CHANGED", url });
  } catch {
    // Content script not ready yet
  }
}

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
