import { PushNotifications, type PushNotificationSchema, type ActionPerformed } from '@capacitor/push-notifications';
import { toast } from 'sonner';

export const pushService = {
  async init() {
    try {
      const { receive } = await PushNotifications.requestPermissions();
      if (receive !== 'granted') return;

      // Only attempt to register if we are on a native platform
      // and ideally we should have google-services.json configured.
      await PushNotifications.register();
    } catch (error) {
      console.error('Push initialization failed:', error);
      // We don't want to crash the whole app if push fails
    }
  },

  async registerListeners(onToken: (token: string) => void) {
    await PushNotifications.addListener('registration', (token) => {
      onToken(token.value);
    });

    await PushNotifications.addListener('registrationError', (err) => {
      console.error('Push registration error:', err);
    });

    await PushNotifications.addListener('pushNotificationReceived', (notification: PushNotificationSchema) => {
      const { title, body } = notification;
      if (title) toast.info(`${title}: ${body || ''}`);
    });

    await PushNotifications.addListener('pushNotificationActionPerformed', (action: ActionPerformed) => {
      const notification = action.notification;
      if (notification.data?.orderId) {
        window.location.href = `/tracking?orderId=${notification.data.orderId}`;
      }
    });
  },

  async getDeliveredNotifications() {
    return PushNotifications.getDeliveredNotifications();
  },

  async removeAllDelivered() {
    return PushNotifications.removeAllDeliveredNotifications();
  },
};
