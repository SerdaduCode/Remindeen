import { defineAppConfig } from '#imports';

// Define types for your config
declare module 'wxt/utils/define-app-config' {
  export interface WxtAppConfig {
    features?: {
      enableChat?: boolean;
      maxTokens?: number;
    };
    language?: {
      default?: 'en' | 'id';
      available?: { label: string; value: 'en' | 'id' }[];
    };
    about?: string;
  }
}

export default defineAppConfig({
  features: {
    enableChat: import.meta.env.WXT_ENABLE_CHAT === 'true' || true,
    maxTokens: parseInt(import.meta.env.WXT_MAX_TOKENS || '1000'),
  },
  language: {
    default: 'en',
    available: [
      { label: 'English (Default)', value: 'en' },
      { label: 'Bahasa Indonesia', value: 'id' },
    ],
  },
  about: 'Remindeen is a browser extension specifically designed to be a prayer reminder and source of inspiration for Muslims in carrying out their daily activities.',
});