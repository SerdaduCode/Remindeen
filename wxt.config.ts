import { defineConfig } from "wxt";

// See https://wxt.dev/api/config.html
export default defineConfig({
  extensionApi: "chrome",
  modules: ["@wxt-dev/module-react"],
  manifest: {
    manifest_version: 3,
    name: "Remindeen",
    version: "1.0",
    action: {
      default_popup: "index.html",
    },
    permissions: ["storage", "tabs", "geolocation"],
  },
});
