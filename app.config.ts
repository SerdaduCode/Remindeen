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
  },
});