import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.fomotracker.app",
  appName: "Fomo Tracker",
  webDir: "out",
  plugins: {
    CapacitorCookies: {
      enabled: true,
    },
  },
};

export default config;
