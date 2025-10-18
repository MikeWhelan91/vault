import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.forebearer',
  appName: 'Forebearer',
  webDir: 'out',
  server: {
    url: 'https://forebearer.app',
    cleartext: true,
    errorPath: '/offline.html'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0,
      launchAutoHide: false,
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    }
  },
  ios: {
    contentInset: 'always',
  },
  android: {
    allowMixedContent: true,
  }
};

export default config;
