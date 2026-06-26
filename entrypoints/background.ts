import { storage } from '#imports';
import { supabase } from '@/lib/supabase';
import { setStoredSession, toAuthSession } from '@/stores/auth';
import { apiFetch } from '@/lib/api';

const GOOGLE_CALENDAR_URL = import.meta.env.VITE_API_GOOGLE_CALENDAR as string;

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

interface PrayerTimes {
  Imsak: string;
  Fajr: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
}

interface StoredPrayerTimes {
  times: PrayerTimes;
  date: string; // YYYY-MM-DD, the day these times apply to
}

interface UiSettings {
  activeTab: string;
  language: 'en' | 'id';
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

const lastResetDateStorage = storage.defineItem<string>('local:lastResetDate', {
  fallback: '',
});

const prayerTimesStorage = storage.defineItem<StoredPrayerTimes | null>('local:prayerTimes', {
  fallback: null,
});

const uiSettingsStorage = storage.defineItem<UiSettings>('local:uiSettings', {
  fallback: { activeTab: 'home', language: 'en' },
});

const DAILY_RESET_ALARM = 'dailyStatsReset';
const PRAYER_ALARM_PREFIX = 'prayer-';

function getLocalDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getMsUntilNextMidnight(): number {
  const now = new Date();
  const nextMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0);
  return nextMidnight.getTime() - now.getTime();
}

async function resetDailyStats() {
  await Promise.all([
    topWebsitesStorage.setValue([]),
    recentActivityStorage.setValue([]),
    currentSessionStorage.setValue(null),
    lastResetDateStorage.setValue(getLocalDateString(new Date())),
  ]);
}

// Catches the case where the browser was closed when midnight passed
async function checkDailyReset() {
  const lastReset = await lastResetDateStorage.getValue();
  const today = getLocalDateString(new Date());
  if (lastReset !== today) {
    await resetDailyStats();
  }
}

// Converts an "HH:mm" time into a timestamp for that time on the given date
function timeStringToTimestamp(time: string, date: Date): number {
  const [hours, minutes] = time.split(':').map(Number);
  const result = new Date(date);
  result.setHours(hours, minutes, 0, 0);
  return result.getTime();
}

// (Re)schedules one alarm per prayer time that hasn't passed yet today
async function schedulePrayerAlarms(stored: StoredPrayerTimes | null) {
  const existingAlarms = await browser.alarms.getAll();
  await Promise.all(
    existingAlarms
      .filter((alarm) => alarm.name.startsWith(PRAYER_ALARM_PREFIX))
      .map((alarm) => browser.alarms.clear(alarm.name))
  );

  if (!stored) return;

  const today = getLocalDateString(new Date());
  if (stored.date !== today) return;

  const now = Date.now();
  for (const [prayer, time] of Object.entries(stored.times)) {
    const when = timeStringToTimestamp(time, new Date());
    if (when > now) {
      browser.alarms.create(`${PRAYER_ALARM_PREFIX}${prayer}`, { when });
    }
  }
}

async function notifyPrayerTime(prayer: string) {
  const { language } = await uiSettingsStorage.getValue();
  const config = getAppConfig();
  const message = config.translation?.[`prayers.${prayer.toLowerCase()}`]?.[language] ?? prayer;

  await browser.notifications.create('', {
    type: 'basic',
    iconUrl: browser.runtime.getURL('/wxt.svg'),
    title: 'Remindeen',
    message,
  });
}

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

type SignInResult = { ok: true } | { ok: false; error: string };

// Initiates the Google OAuth flow. Must run here, not in a UI context: newtab
// is a fresh document every open and can be torn down mid-flow, which would
// abandon `launchWebAuthFlow` partway through.
async function handleSignIn(): Promise<SignInResult> {
  try {
    const redirectTo = browser.identity.getRedirectURL();
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo, skipBrowserRedirect: true },
    });
    if (error || !data.url) {
      throw error ?? new Error('No OAuth URL returned');
    }

    const responseUrl = await browser.identity.launchWebAuthFlow({
      url: data.url,
      interactive: true,
    });
    if (!responseUrl) {
      throw new Error('Sign-in was cancelled');
    }

    const code = new URL(responseUrl).searchParams.get('code');
    if (!code) {
      throw new Error('No authorization code in redirect');
    }

    const { data: exchanged, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
    if (exchangeError || !exchanged.session) {
      throw exchangeError ?? new Error('Session exchange failed');
    }

    await setStoredSession(toAuthSession(exchanged.session));
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'Sign-in failed' };
  }
}

// Separate from handleSignIn: this requests the additional, more sensitive
// `calendar.events` scope and forces re-consent (so Google actually returns a
// refresh token), which should only happen on an explicit "Connect Calendar"
// action — not on every ordinary sign-in.
async function handleConnectCalendar(): Promise<SignInResult> {
  try {
    const redirectTo = browser.identity.getRedirectURL();
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        skipBrowserRedirect: true,
        scopes: 'https://www.googleapis.com/auth/calendar.events',
        queryParams: { access_type: 'offline', prompt: 'consent' },
      },
    });
    if (error || !data.url) {
      throw error ?? new Error('No OAuth URL returned');
    }

    const responseUrl = await browser.identity.launchWebAuthFlow({
      url: data.url,
      interactive: true,
    });
    if (!responseUrl) {
      throw new Error('Connection was cancelled');
    }

    const code = new URL(responseUrl).searchParams.get('code');
    if (!code) {
      throw new Error('No authorization code in redirect');
    }

    const { data: exchanged, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
    if (exchangeError || !exchanged.session) {
      throw exchangeError ?? new Error('Session exchange failed');
    }

    // Only the Google-issued refresh token matters here — the Supabase session
    // from this exchange is otherwise discarded; the user's existing signed-in
    // session (read by apiFetch) is what authenticates the relay below.
    const refreshToken = exchanged.session.provider_refresh_token;
    if (!refreshToken) {
      throw new Error('Google did not return a refresh token');
    }

    // Relay only — never written to extension storage.
    await apiFetch(GOOGLE_CALENDAR_URL, {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });

    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'Connecting Google Calendar failed' };
  }
}

export default defineBackground(() => {
  console.log('Background script loaded!', { id: browser.runtime.id });

  browser.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message?.type === 'auth:signIn') {
      handleSignIn().then(sendResponse);
      return true; // keep the message channel open for the async sendResponse
    }
    if (message?.type === 'auth:connectCalendar') {
      handleConnectCalendar().then(sendResponse);
      return true;
    }
  });

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

  // Reset stats if midnight passed while the browser was closed
  checkDailyReset();

  // Schedule a recurring alarm to reset stats every day at midnight
  browser.alarms.create(DAILY_RESET_ALARM, {
    when: Date.now() + getMsUntilNextMidnight(),
    periodInMinutes: 24 * 60,
  });

  // Schedule prayer time notifications based on the last fetched prayer times
  prayerTimesStorage.getValue().then(schedulePrayerAlarms);

  // Re-schedule whenever fresh prayer times are fetched (e.g. new day, new location)
  prayerTimesStorage.watch((newVal) => {
    schedulePrayerAlarms(newVal);
  });

  browser.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === DAILY_RESET_ALARM) {
      resetDailyStats();
    } else if (alarm.name.startsWith(PRAYER_ALARM_PREFIX)) {
      notifyPrayerTime(alarm.name.slice(PRAYER_ALARM_PREFIX.length));
    }
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
