/**
 * Firebase Admin SDK Initialization
 * Used for sending push notifications from the backend
 */

import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK (singleton pattern)
if (!admin.apps.length) {
  try {
    // Check if running in production (Vercel) or local
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      // Production: Use environment variable (JSON string)
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      console.log('Firebase Admin initialized from environment variable');
    } else {
      // Local development: Use file
      const serviceAccount = require('../../firebase-service-account.json');
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      console.log('Firebase Admin initialized from service account file');
    }
  } catch (error) {
    console.error('Failed to initialize Firebase Admin:', error);
    console.warn('Push notifications will not work without Firebase Admin SDK');
  }
}

/**
 * Send a push notification to a specific device token
 */
export async function sendPushNotification(params: {
  token: string;
  title: string;
  body: string;
  data?: Record<string, string>;
}): Promise<boolean> {
  const { token, title, body, data = {} } = params;

  try {
    const message: admin.messaging.Message = {
      notification: {
        title,
        body,
      },
      data,
      token,
      android: {
        priority: 'high',
        notification: {
          sound: 'default',
          priority: 'high',
        },
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
            badge: 1,
          },
        },
      },
    };

    const response = await admin.messaging().send(message);
    console.log('Successfully sent push notification:', response);
    return true;
  } catch (error) {
    console.error('Error sending push notification:', error);
    return false;
  }
}

/**
 * Send push notifications to multiple tokens
 */
export async function sendPushNotificationToMultipleTokens(params: {
  tokens: string[];
  title: string;
  body: string;
  data?: Record<string, string>;
}): Promise<{ successCount: number; failureCount: number }> {
  const { tokens, title, body, data = {} } = params;

  if (tokens.length === 0) {
    return { successCount: 0, failureCount: 0 };
  }

  try {
    const message: admin.messaging.MulticastMessage = {
      notification: {
        title,
        body,
      },
      data,
      tokens,
      android: {
        priority: 'high',
        notification: {
          sound: 'default',
          priority: 'high',
        },
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
            badge: 1,
          },
        },
      },
    };

    const response = await admin.messaging().sendEachForMulticast(message);
    console.log(`Push notifications sent: ${response.successCount} successful, ${response.failureCount} failed`);

    return {
      successCount: response.successCount,
      failureCount: response.failureCount,
    };
  } catch (error) {
    console.error('Error sending push notifications:', error);
    return { successCount: 0, failureCount: tokens.length };
  }
}

export default admin;
