import { storage } from '#imports';

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
const prayerTimesStorage = storage.defineItem<StoredPrayerTimes | null>('local:prayerTimes', {
  fallback: null,
});

const uiSettingsStorage = storage.defineItem<UiSettings>('local:uiSettings', {
  fallback: { activeTab: 'home', language: 'en' },
});

const PRAYER_ALARM_PREFIX = 'prayer-';

function getLocalDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
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
    iconUrl: browser.runtime.getURL('/icon/128.png'),
    title: 'Remindeen',
    message,
  });
}

// Firefox exposes `sidebarAction`; Chrome exposes `sidePanel`. Neither exists in
// the other browser, so every use below is feature-detected.
interface SidebarAction {
  toggle(): Promise<void>;
}

function getSidebarAction(): SidebarAction | undefined {
  return (browser as unknown as { sidebarAction?: SidebarAction }).sidebarAction;
}

export default defineBackground(() => {
  console.log('Background script loaded!', { id: browser.runtime.id });

  // Chrome: let the browser open the side panel natively when the toolbar icon is clicked
  browser.sidePanel?.setPanelBehavior({ openPanelOnActionClick: true }).catch(console.error);

  // Firefox: toggle the sidebar on icon click. toggle() must be called synchronously
  // from the listener, since Firefox only allows it inside a user-input handler.
  browser.action?.onClicked.addListener(() => {
    getSidebarAction()?.toggle().catch(console.error);
  });

  // Keyboard shortcut (manifest command "toggle-sidebar")
  browser.commands?.onCommand.addListener((command, tab) => {
    if (command !== 'toggle-sidebar') return;

    const sidebarAction = getSidebarAction();
    if (sidebarAction) {
      sidebarAction.toggle().catch(console.error);
    } else if (browser.sidePanel?.open && tab?.windowId !== undefined) {
      browser.sidePanel.open({ windowId: tab.windowId }).catch(console.error);
    }
  });

  // Schedule prayer time notifications based on the last fetched prayer times
  prayerTimesStorage.getValue().then(schedulePrayerAlarms);

  // Re-schedule whenever fresh prayer times are fetched (e.g. new day, new location)
  prayerTimesStorage.watch((newVal) => {
    schedulePrayerAlarms(newVal);
  });

  browser.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name.startsWith(PRAYER_ALARM_PREFIX)) {
      notifyPrayerTime(alarm.name.slice(PRAYER_ALARM_PREFIX.length));
    }
  });
});
