/**
 * Mobile-specific features for Capacitor apps
 */

import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { StatusBar, Style } from '@capacitor/status-bar';
import { App } from '@capacitor/app';
import { BiometricAuth, BiometryType } from '@aparajita/capacitor-biometric-auth';
import { platform } from './platform';

/**
 * Initialize mobile app features
 */
export async function initializeMobileFeatures() {
  if (!platform.isMobile()) {
    return;
  }

  try {
    // Set status bar style
    await StatusBar.setStyle({ style: Style.Light });
    await StatusBar.setBackgroundColor({ color: '#FFFFFF' });

    // Set app to show status bar
    await StatusBar.show();
  } catch (error) {
    console.warn('Failed to initialize mobile features:', error);
  }
}

/**
 * Haptic feedback utilities
 */
export const haptics = {
  /**
   * Light impact (e.g., button tap)
   */
  light: async () => {
    if (!platform.isMobile()) return;
    try {
      await Haptics.impact({ style: ImpactStyle.Light });
    } catch (error) {
      console.warn('Haptics not available:', error);
    }
  },

  /**
   * Medium impact (e.g., toggle switch)
   */
  medium: async () => {
    if (!platform.isMobile()) return;
    try {
      await Haptics.impact({ style: ImpactStyle.Medium });
    } catch (error) {
      console.warn('Haptics not available:', error);
    }
  },

  /**
   * Heavy impact (e.g., delete action)
   */
  heavy: async () => {
    if (!platform.isMobile()) return;
    try {
      await Haptics.impact({ style: ImpactStyle.Heavy });
    } catch (error) {
      console.warn('Haptics not available:', error);
    }
  },

  /**
   * Success notification
   */
  success: async () => {
    if (!platform.isMobile()) return;
    try {
      await Haptics.notification({ type: NotificationType.Success });
    } catch (error) {
      console.warn('Haptics not available:', error);
    }
  },

  /**
   * Warning notification
   */
  warning: async () => {
    if (!platform.isMobile()) return;
    try {
      await Haptics.notification({ type: NotificationType.Warning });
    } catch (error) {
      console.warn('Haptics not available:', error);
    }
  },

  /**
   * Error notification
   */
  error: async () => {
    if (!platform.isMobile()) return;
    try {
      await Haptics.notification({ type: NotificationType.Error });
    } catch (error) {
      console.warn('Haptics not available:', error);
    }
  },
};

/**
 * Biometric authentication utilities
 */
export const biometric = {
  /**
   * Check if biometric authentication is available
   */
  isAvailable: async (): Promise<boolean> => {
    if (!platform.isMobile()) return false;
    try {
      const result = await BiometricAuth.checkBiometry();
      return result.isAvailable;
    } catch (error) {
      console.warn('Biometric check failed:', error);
      return false;
    }
  },

  /**
   * Get available biometry type (fingerprint, face, etc.)
   */
  getBiometryType: async (): Promise<BiometryType | null> => {
    if (!platform.isMobile()) return null;
    try {
      const result = await BiometricAuth.checkBiometry();
      return result.biometryType;
    } catch (error) {
      console.warn('Failed to get biometry type:', error);
      return null;
    }
  },

  /**
   * Authenticate with biometrics
   */
  authenticate: async (reason: string): Promise<boolean> => {
    if (!platform.isMobile()) return false;
    try {
      await BiometricAuth.authenticate({
        reason,
        cancelTitle: 'Cancel',
        allowDeviceCredential: true,
        iosFallbackTitle: 'Use Password',
        androidTitle: 'Biometric Authentication',
        androidSubtitle: reason,
        androidConfirmationRequired: false,
      });
      return true;
    } catch (error) {
      console.warn('Biometric authentication failed:', error);
      return false;
    }
  },
};

/**
 * Status bar utilities
 */
export const statusBar = {
  /**
   * Set status bar to light theme (dark text)
   */
  setLight: async () => {
    if (!platform.isMobile()) return;
    try {
      await StatusBar.setStyle({ style: Style.Light });
    } catch (error) {
      console.warn('Failed to set status bar style:', error);
    }
  },

  /**
   * Set status bar to dark theme (light text)
   */
  setDark: async () => {
    if (!platform.isMobile()) return;
    try {
      await StatusBar.setStyle({ style: Style.Dark });
    } catch (error) {
      console.warn('Failed to set status bar style:', error);
    }
  },

  /**
   * Set status bar background color
   */
  setBackgroundColor: async (color: string) => {
    if (!platform.isMobile()) return;
    try {
      await StatusBar.setBackgroundColor({ color });
    } catch (error) {
      console.warn('Failed to set status bar color:', error);
    }
  },

  /**
   * Hide status bar
   */
  hide: async () => {
    if (!platform.isMobile()) return;
    try {
      await StatusBar.hide();
    } catch (error) {
      console.warn('Failed to hide status bar:', error);
    }
  },

  /**
   * Show status bar
   */
  show: async () => {
    if (!platform.isMobile()) return;
    try {
      await StatusBar.show();
    } catch (error) {
      console.warn('Failed to show status bar:', error);
    }
  },
};

/**
 * App lifecycle utilities
 */
export const appLifecycle = {
  /**
   * Add listener for app state changes
   */
  onStateChange: (callback: (isActive: boolean) => void) => {
    if (!platform.isMobile()) return () => {};

    const listener = App.addListener('appStateChange', ({ isActive }) => {
      callback(isActive);
    });

    return () => {
      listener.then(l => l.remove());
    };
  },

  /**
   * Add listener for app URL open events
   */
  onUrlOpen: (callback: (url: string) => void) => {
    if (!platform.isMobile()) return () => {};

    const listener = App.addListener('appUrlOpen', ({ url }) => {
      callback(url);
    });

    return () => {
      listener.then(l => l.remove());
    };
  },
};
