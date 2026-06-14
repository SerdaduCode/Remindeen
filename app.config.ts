import { defineAppConfig } from '#imports';

declare module 'wxt/utils/define-app-config' {
  export interface WxtAppConfig {
    language?: {
      default?: 'en' | 'id';
      available?: { label: string; value: 'en' | 'id' }[];
    };
    about?: string;
    translation?: {
      [key: string]: {
        [lang in 'en' | 'id']?: string;
      };
    };
  }
}

export default defineAppConfig({
  language: {
    default: 'en',
    available: [
      { label: 'English (Default)', value: 'en' },
      { label: 'Bahasa Indonesia', value: 'id' },
    ],
  },
  translation: {
    'header.description': {
      en: 'Prayer reminders and daily inspiration while you browse',
      id: 'Pengingat sholat dan inspirasi harian saat kamu browsing',
    },
    'tabs.settings': {
      en: 'Settings',
      id: 'Pengaturan',
    },
    'tabs.home': {
      en: 'Today',
      id: 'Hari Ini',
    },
    'tabs.trends': {
      en: 'Trends',
      id: 'Tren',
    },
    'settings.theme': {
      en: 'Theme',
      id: 'Tema',
    },
    'settings.theme.description': {
      en: 'Customize the look and feel',
      id: 'Sesuaikan tampilan dan nuansa',
    },
    'settings.theme.system': {
      en: 'System',
      id: 'Sistem',
    },
    'settings.theme.light': {
      en: 'Light',
      id: 'Terang',
    },
    'settings.theme.dark': {
      en: 'Dark',
      id: 'Gelap',
    },
    'settings.language': {
      en: 'Language',
      id: 'Bahasa',
    },
    'settings.about': {
      en: 'About',
      id: 'Tentang',
    },
    'settings.about.description': {
      en: 'Remindeen is a browser extension specifically designed to be a prayer reminder and source of inspiration for Muslims in carrying out their daily activities.',
      id: 'Remindeen adalah ekstensi browser yang dirancang untuk menjadi pengingat sholat dan sumber inspirasi bagi umat Muslim dalam menjalankan aktivitas sehari-hari.',
    },
    'settings.support': {
      en: 'Support',
      id: 'Dukungan',
    },
    'settings.support.description': {
      en: 'Show your love by scanning the QR code below ❤️',
      id: 'Tunjukkan dukunganmu dengan memindai kode QR di bawah ini ❤️',
    },
    'widgets.today': {
      en: 'Today',
      id: 'Hari Ini',
    },
    'widgets.recent_activity': {
      en: 'Recent Activity',
      id: 'Aktivitas Terbaru',
    },
    'widgets.show_all': {
      en: 'Show all',
      id: 'Tampilkan semua',
    },
    'widgets.show_less': {
      en: 'Show less',
      id: 'Sembunyikan',
    },
    'settings.searchbar': {
      en: 'Search Bar',
      id: 'Bilah Pencarian',
    },
    'settings.searchbar.description': {
      en: 'Show or hide the search bar',
      id: 'Tampilkan atau sembunyikan bilah pencarian',
    },
    'settings.searchbar.toggle': {
      en: 'Show search bar on new tab',
      id: 'Tampilkan bilah pencarian di tab baru',
    },
    'prayers.imsak': {
      en: 'Imsak',
      id: 'Imsak',
    },
    'prayers.fajr': {
      en: 'Fajr',
      id: 'Subuh',
    },
    'prayers.dhuhr': {
      en: 'Dhuhr',
      id: 'Dzuhur',
    },
    'prayers.asr': {
      en: 'Asr',
      id: 'Ashar',
    },
    'prayers.maghrib': {
      en: 'Maghrib',
      id: 'Maghrib',
    },
    'prayers.isha': {
      en: 'Isha',
      id: 'Isya',
    },
    'prayers.hour_short': {
      en: 'hr',
      id: 'jam',
    },
    'prayers.minute_short': {
      en: 'min',
      id: 'menit',
    },
    'prayers.remaining_suffix': {
      en: ' left',
      id: ' lagi',
    },
    'prayers.fallback_remaining': {
      en: '0 min left',
      id: '0 menit lagi',
    },
    'prayers.error_not_found': {
      en: 'Prayer time data not found.',
      id: 'Data waktu salat tidak ditemukan.',
    },
    'prayers.error_failed': {
      en: 'Failed to fetch Prayer times',
      id: 'Gagal mengambil waktu salat',
    },
    'prayers.error_location': {
      en: 'Failed to get user location.',
      id: 'Gagal mendapatkan lokasi pengguna.',
    },
    'prayers.error_geolocation': {
      en: 'Geolocation is not supported by this browser.',
      id: 'Geolocation tidak didukung oleh browser ini.',
    },
    'location.loading': {
      en: 'Getting location...',
      id: 'Mendapatkan lokasi...',
    },
    'location.unknown_city': {
      en: 'Unknown City',
      id: 'Kota Tidak Diketahui',
    },
    'location.unknown_country': {
      en: 'Unknown Country',
      id: 'Negara Tidak Diketahui',
    },
    'location.not_found': {
      en: 'Location not found',
      id: 'Lokasi tidak ditemukan',
    },
    'location.failed': {
      en: 'Failed to get location',
      id: 'Gagal mendapatkan lokasi',
    },
    'location.allow': {
      en: 'Please allow location access',
      id: 'Harap izinkan akses lokasi',
    },
    'location.not_supported': {
      en: 'Geolocation not supported by this browser',
      id: 'Geolocation tidak didukung oleh browser ini',
    },
  },
});