import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';

export const hapticService = {
  async impact(style: ImpactStyle = ImpactStyle.Medium) {
    if (!Capacitor.isNativePlatform()) return;
    try {
      await Haptics.impact({ style });
    } catch (e) {
      console.warn('Haptics not available', e);
    }
  },

  async notificationSuccess() {
    if (!Capacitor.isNativePlatform()) return;
    try {
      await Haptics.notification({ type: 'SUCCESS' as any });
    } catch (e) {
      console.warn('Haptics not available', e);
    }
  },

  async selection() {
    if (!Capacitor.isNativePlatform()) return;
    try {
      await Haptics.selectionStart();
    } catch (e) {
      console.warn('Haptics not available', e);
    }
  }
};
