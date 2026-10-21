import { defineConfig } from 'wxt';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

// See https://wxt.dev/api/config.html
export default defineConfig({
  // WXT 0.20 ignores manifest.manifest_version and defaults Firefox to MV2
  manifestVersion: 3,
  modules: ['@wxt-dev/module-react'],
  alias: {
    '@': path.resolve(__dirname, './'),
  },
  vite: () => ({
    plugins: [tailwindcss()],
  }),
  manifest: {
    name: "Remindeen",
    version: "1.3.2",

    action: {
      default_title: "Open Remindeen Panel",
    },

    // "sidePanel" is added by WXT for Chrome only; "commands" is a manifest key, not a permission
    permissions: ["geolocation", "storage", "notifications", "alarms"],

    commands: {
      "toggle-sidebar": {
        suggested_key: {
          default: "Ctrl+Shift+S",
        },
        description: "Open Remindeen Sidebar",
      },
    },

    browser_specific_settings: {
      gecko: {
        id: "remindeen@serdadu.dev",
        strict_min_version: "109.0",
      },
      safari: {
        strict_min_version: "15.0",
      },
    },
  },
});
