/**
 * Push Notification Management for Mobile App
 * Handles registration, permissions, and notification handling
 */

import { PushNotifications, type Token, type PushNotificationSchema, type ActionPerformed } from '@capacitor/push-notifications';
import { platform } from './platform';

/**
 * Initialize push notifications and register device token
 */
export async function initializePushNotifications(userId: string): Promise<boolean> {
  if (!platform.isMobile()) {
    console.log('Push notifications only available on mobile');
    return false;
  }

  try {
    // Check current permission status
    let permStatus = await PushNotifications.checkPermissions();

    if (permStatus.receive === 'prompt') {
      // Request permission if not yet asked
      permStatus = await PushNotifications.requestPermissions();
    }

    if (permStatus.receive !== 'granted') {
      console.log('Push notification permission denied');
      return false;
    }

    // Register with APNs/FCM
    await PushNotifications.register();

    // Listen for registration success
    await PushNotifications.addListener('registration', async (token: Token) => {
      console.log('Push registration success, token:', token.value);

      // Determine platform
      const platformType = platform.isIOS() ? 'ios' : 'android';

      // Send token to backend
      try {
        const response = await fetch('/api/push-tokens', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            token: token.value,
            platform: platformType,
          }),
        });

        if (response.ok) {
          console.log('Push token registered successfully');
        } else {
          console.error('Failed to register push token:', await response.text());
        }
      } catch (error) {
        console.error('Error sending push token to backend:', error);
      }
    });

    // Listen for registration errors
    await PushNotifications.addListener('registrationError', (error: any) => {
      console.error('Push registration error:', error);
    });

    // Listen for push notification received while app is in foreground
    await PushNotifications.addListener(
      'pushNotificationReceived',
      (notification: PushNotificationSchema) => {
        console.log('Push notification received:', notification);
      }
    );

    // Listen for push notification action (user tapped notification)
    await PushNotifications.addListener(
      'pushNotificationActionPerformed',
      (notification: ActionPerformed) => {
        console.log('Push notification action performed:', notification);

        // App is now in the foreground
        // Don't navigate - just let the app open naturally
        // If user is locked, they'll see the unlock screen
        // If user is unlocked, they'll see wherever they were
      }
    );

    return true;
  } catch (error) {
    console.error('Failed to initialize push notifications:', error);
    return false;
  }
}

/**
 * Unregister push notifications (e.g., on logout)
 */
export async function unregisterPushNotifications(userId: string, token?: string): Promise<void> {
  if (!platform.isMobile()) {
    return;
  }

  try {
    // If token provided, remove it from backend
    if (token) {
      await fetch('/api/push-tokens', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, token }),
      });
    }

    // Remove all listeners
    await PushNotifications.removeAllListeners();
  } catch (error) {
    console.error('Failed to unregister push notifications:', error);
  }
}

/**
 * Check if push notifications are available and permitted
 */
export async function arePushNotificationsEnabled(): Promise<boolean> {
  if (!platform.isMobile()) {
    return false;
  }

  try {
    const permStatus = await PushNotifications.checkPermissions();
    return permStatus.receive === 'granted';
  } catch (error) {
    console.error('Failed to check push notification permissions:', error);
    return false;
  }
}
