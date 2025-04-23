import { defineConfig } from "wxt";

// See https://wxt.dev/api/config.html
export default defineConfig({
  extensionApi: "chrome",
  modules: ["@wxt-dev/module-react"],
  manifest: {
    manifest_version: 3,
    name: "Remindeen",
    version: "1.2.0",
    action: {
      default_popup: "index.html",
    },
    permissions: ["geolocation"],
    browser_specific_settings: {
      gecko: {
        id: "remindeen@serdadu.dev",
        strict_min_version: "90.0",
      },
      safari: {
        strict_min_version: "15.0"
      },
    },
  },
});
