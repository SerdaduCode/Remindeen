import { defineConfig } from 'wxt';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  alias: {
    '@': path.resolve(__dirname, './'),
  },
  vite: () => ({
    plugins: [tailwindcss()],
  }),
  manifest: {
    manifest_version: 3,

    name: "Remindeen",
    version: "1.3.0",

    action: {
      default_title: "Open Remindeen Panel",
      default_popup: "popup/index.html",
    },

    permissions: [
      "geolocation",
      "sidePanel",
      "storage",
      "tabs",
      "commands",
      "notifications",
      "idle",
      "alarms",
      "identity",
    ],

    host_permissions: [
      "https://quotes.serdadu.dev/*",
      "http://localhost:3000/*",
    ],

    side_panel: {
      default_path: "sidepanel.html",
    },

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
        strict_min_version: "90.0",
      },
      safari: {
        strict_min_version: "15.0",
      },
    },

    "oauth2": {
      "client_id": "246803860856-o3k462jmfdejp2vvfuu8eep08udjnmll.apps.googleusercontent.com",
      "scopes": [
        "https://www.googleapis.com/auth/userinfo.email",
        "https://www.googleapis.com/auth/userinfo.profile"
      ]
    }
  },
});
