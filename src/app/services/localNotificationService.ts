import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';
import { toast } from 'sonner';

export const localNotificationService = {
  async init() {
    if (!Capacitor.isNativePlatform()) {
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
      }
      return false;
    }

    try {
      const { display } = await LocalNotifications.requestPermissions();
      return display === 'granted';
    } catch (e) {
      console.error('Local notifications initialization failed:', e);
      return false;
    }
  },

  async scheduleRestockReminder(productName: string, daysDelay: number = 30) {
    try {
      const hasPermission = await this.init();
      if (!hasPermission) {
        console.warn('Notification permission not granted');
        return;
      }

      // 1. Schedule the real production reminder (e.g. 30 days)
      const prodTime = new Date();
      prodTime.setDate(prodTime.getDate() + daysDelay);

      // 2. Schedule a quick test reminder (10 seconds) for instant verification/demo
      const testTime = new Date();
      testTime.setSeconds(testTime.getSeconds() + 10);

      if (Capacitor.isNativePlatform()) {
        // Schedule on mobile using Capacitor LocalNotifications
        await LocalNotifications.schedule({
          notifications: [
            {
              title: 'Restock Alert! 📦',
              body: `Your jar of ${productName} might be running low. Tap to restock in one click!`,
              id: Math.floor(Math.random() * 100000),
              schedule: { at: testTime },
              sound: 'default',
              extra: { productName }
            },
            {
              title: 'Restock Alert! 📦',
              body: `Your jar of ${productName} might be running low. Tap to restock in one click!`,
              id: Math.floor(Math.random() * 100000),
              schedule: { at: prodTime },
              sound: 'default',
              extra: { productName }
            }
          ]
        });
        console.log(`[Capacitor] Scheduled restock reminders for ${productName} (Test in 10s, Prod in ${daysDelay} days)`);
      } else {
        // Schedule on Web using standard HTML5 Notification API
        if ('Notification' in window && Notification.permission === 'granted') {
          // Test notification (10s)
          setTimeout(() => {
            new Notification('Restock Alert! 📦', {
              body: `Your jar of ${productName} might be running low. Tap to restock in one click!`,
              icon: '/favicon.ico'
            });
          }, 10000);

          // Prod notification
          const prodDelayMs = daysDelay * 24 * 60 * 60 * 1000;
          setTimeout(() => {
            new Notification('Restock Alert! 📦', {
              body: `Your jar of ${productName} might be running low. Tap to restock in one click!`,
              icon: '/favicon.ico'
            });
          }, prodDelayMs);
          console.log(`[Web] Scheduled restock reminders for ${productName} (Test in 10s, Prod in ${daysDelay} days)`);
        }
      }
    } catch (e) {
      console.error('Failed to schedule local notification:', e);
    }
  },

  async sendWelcomeNotification() {
    try {
      const hasPermission = await this.init();
      if (!hasPermission) {
        toast.error('Please enable notifications in your browser or system settings.');
        return;
      }

      const triggerTime = new Date();
      triggerTime.setSeconds(triggerTime.getSeconds() + 2); // 2 seconds delay

      if (Capacitor.isNativePlatform()) {
        await LocalNotifications.schedule({
          notifications: [
            {
              title: 'Notifications Enabled! 🔔',
              body: 'Welcome to Dry Fruit Hub. We will notify you of delivery status and smart restock alerts!',
              id: 11111,
              schedule: { at: triggerTime },
              sound: 'default'
            }
          ]
        });
        console.log('[Capacitor] Scheduled welcome notification');
      } else {
        if ('Notification' in window && Notification.permission === 'granted') {
          setTimeout(() => {
            new Notification('Notifications Enabled! 🔔', {
              body: 'Welcome to Dry Fruit Hub. We will notify you of delivery status and smart restock alerts!',
              icon: '/favicon.ico'
            });
          }, 2000);
          console.log('[Web] Scheduled welcome notification');
        }
      }
      toast.success('Notifications enabled! Watch out for a test alert in 2 seconds.');
    } catch (e) {
      console.error('Failed to send welcome notification:', e);
      toast.error('Failed to register notifications.');
    }
  }
};
