import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.forebearer',
  appName: 'Forebearer',
  webDir: 'out',
  server: {
    url: 'https://forebearer.app',
    cleartext: true
  },
  ios: {
    contentInset: 'always',
  },
  android: {
    allowMixedContent: true,
  }
};

export default config;
