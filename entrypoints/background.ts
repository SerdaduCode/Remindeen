import { storage } from '#imports';

interface TopWebsite {
  domain: string;
  duration: number; // in seconds
}

interface ActivityLog {
  id: string;
  domain: string;
  title?: string;
  timestamp: number; // ms
  duration: number; // seconds
  count: number;
}

interface CurrentSession {
  domain: string;
  startTime: number;
  lastTickTime: number;
  logId: string;
}

// Define storage items using storage.defineItem
const topWebsitesStorage = storage.defineItem<TopWebsite[]>('local:topWebsites', {
  fallback: [],
});

const recentActivityStorage = storage.defineItem<ActivityLog[]>('local:recentActivity', {
  fallback: [],
});

const currentSessionStorage = storage.defineItem<CurrentSession | null>('local:currentSession', {
  fallback: null,
});

async function getActiveTabInfo(): Promise<{ domain: string; title: string } | null> {
  try {
    // Check if user is active (not idle)
    const state = await browser.idle.queryState(60);
    if (state !== 'active') {
      return null;
    }

    // Get the active tab in the last focused window
    const [tab] = await browser.tabs.query({ active: true, lastFocusedWindow: true });
    if (!tab || !tab.url) return null;

    // Check if the window is focused
    const window = await browser.windows.getLastFocused();
    if (!window.focused) return null;

    const url = tab.url;
    if (url.startsWith('http://') || url.startsWith('https://')) {
      const parsed = new URL(url);
      const domain = parsed.hostname.replace(/^www\./, '');
      const title = tab.title || domain;
      return { domain, title };
    }
  } catch (error) {
    console.error('Error in getActiveTabInfo:', error);
  }
  return null;
}

function updateTopWebsites(list: TopWebsite[], domain: string, elapsedSec: number): TopWebsite[] {
  const existing = list.find((item) => item.domain === domain);
  if (existing) {
    existing.duration += elapsedSec;
  } else {
    list.push({ domain, duration: elapsedSec });
  }
  // Sort descending by duration
  return list.sort((a, b) => b.duration - a.duration);
}

function updateRecentActivity(list: ActivityLog[], logId: string, elapsedSec: number): ActivityLog[] {
  const existing = list.find((item) => item.id === logId);
  if (existing) {
    existing.duration += elapsedSec;
  }
  return list;
}

async function startNewSession(domain: string, title: string, now: number, topWebsites: TopWebsite[], recentActivity: ActivityLog[]) {
  const lastLog = recentActivity[0]; // Newest is at index 0
  const mergeThresholdMs = 2 * 60 * 1000; // 2 minutes
  
  let logId = "";
  let isMerged = false;
  
  if (lastLog && lastLog.domain === domain && lastLog.title === title) {
    const lastActiveTime = lastLog.timestamp + lastLog.duration * 1000;
    if (now - lastActiveTime < mergeThresholdMs) {
      lastLog.count += 1;
      logId = lastLog.id;
      isMerged = true;
    }
  }
  
  if (!isMerged) {
    logId = Math.random().toString(36).substring(2, 9);
    const newLog: ActivityLog = {
      id: logId,
      domain,
      title,
      timestamp: now,
      duration: 0,
      count: 1,
    };
    recentActivity.unshift(newLog);
    if (recentActivity.length > 50) {
      recentActivity = recentActivity.slice(0, 50);
    }
  }

  const newSession: CurrentSession = {
    domain,
    startTime: now,
    lastTickTime: now,
    logId,
  };

  await Promise.all([
    currentSessionStorage.setValue(newSession),
    topWebsitesStorage.setValue(topWebsites),
    recentActivityStorage.setValue(recentActivity),
  ]);
}

async function trackActiveTab() {
  const now = Date.now();
  const activeTab = await getActiveTabInfo();
  const newDomain = activeTab ? activeTab.domain : null;
  const newTitle = activeTab ? activeTab.title : '';
  
  const currentSession = await currentSessionStorage.getValue();
  let topWebsites = await topWebsitesStorage.getValue();
  let recentActivity = await recentActivityStorage.getValue();

  if (currentSession) {
    const lastLog = recentActivity.find(log => log.id === currentSession.logId);
    const isSamePage = newDomain && currentSession.domain === newDomain && lastLog && (lastLog.title === newTitle || !lastLog.title);

    if (isSamePage) {
      // Continuing the same session
      if (lastLog && !lastLog.title) {
        lastLog.title = newTitle;
      }
      const elapsedMs = now - currentSession.lastTickTime;
      let elapsedSec = Math.floor(elapsedMs / 1000);
      
      if (elapsedSec >= 1) {
        // Handle potential sleep/suspend gap
        if (elapsedSec > 10) {
          elapsedSec = 5; // Cap to 5 seconds
        }
        
        topWebsites = updateTopWebsites(topWebsites, currentSession.domain, elapsedSec);
        recentActivity = updateRecentActivity(recentActivity, currentSession.logId, elapsedSec);
        
        await Promise.all([
          currentSessionStorage.setValue({
            ...currentSession,
            lastTickTime: currentSession.lastTickTime + elapsedSec * 1000,
          }),
          topWebsitesStorage.setValue(topWebsites),
          recentActivityStorage.setValue(recentActivity),
        ]);
      }
    } else {
      // Ending old session
      const elapsedMs = now - currentSession.lastTickTime;
      let elapsedSec = Math.floor(elapsedMs / 1000);
      
      if (elapsedSec >= 1) {
        if (elapsedSec > 10) {
          elapsedSec = 5;
        }
        topWebsites = updateTopWebsites(topWebsites, currentSession.domain, elapsedSec);
        recentActivity = updateRecentActivity(recentActivity, currentSession.logId, elapsedSec);
      }
      
      await currentSessionStorage.setValue(null);
      
      if (newDomain) {
        await startNewSession(newDomain, newTitle, now, topWebsites, recentActivity);
      } else {
        await Promise.all([
          topWebsitesStorage.setValue(topWebsites),
          recentActivityStorage.setValue(recentActivity),
        ]);
      }
    }
  } else {
    if (newDomain) {
      await startNewSession(newDomain, newTitle, now, topWebsites, recentActivity);
    }
  }
}

export default defineBackground(() => {
  console.log('Background script loaded!', { id: browser.runtime.id });

  // Handle extension icon click to open sidepanel
  browser.action.onClicked.addListener(async (tab) => {
    if (tab.id) {
      await browser.sidePanel.open({ tabId: tab.id });
    }
  });

  // Set up sidepanel options on install
  browser.runtime.onInstalled.addListener(async () => {
    await browser.sidePanel.setOptions({
      path: 'sidepanel.html',
      enabled: true
    });
    
    await browser.sidePanel.setPanelBehavior({
      openPanelOnActionClick: true
    });
  });

  // Active website tracking interval (runs every 5 seconds)
  const trackingInterval = setInterval(trackActiveTab, 5000);

  // Tab activation
  browser.tabs.onActivated.addListener(() => {
    trackActiveTab();
  });

  // Tab updates (URL change)
  browser.tabs.onUpdated.addListener((tabId, changeInfo) => {
    if (changeInfo.url) {
      trackActiveTab();
    }
  });

  // Window focus change
  browser.windows.onFocusChanged.addListener(() => {
    trackActiveTab();
  });

  // Idle state change
  browser.idle.onStateChanged.addListener(() => {
    trackActiveTab();
  });

  // Return clean-up function if needed (WXT background script structure handles it)
  return () => {
    clearInterval(trackingInterval);
  };
});
