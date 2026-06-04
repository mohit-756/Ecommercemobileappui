import { PushNotifications, type PushNotificationSchema, type ActionPerformed } from '@capacitor/push-notifications';
import { toast } from 'sonner';

export const pushService = {
  async init() {
    const { geolocation } = await PushNotifications.requestPermissions();
    if (geolocation !== 'granted') return;

    await PushNotifications.register();
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
