import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { pushService } from '../services/pushService';
import { deepLinkService } from '../services/deepLinkService';
import { networkService } from '../services/networkService';
import { toast } from 'sonner';

export function useMobileFeatures() {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    pushService.init();
    pushService.registerListeners((token) => {
      console.log('FCM Token:', token);
      localStorage.setItem('fcm_token', token);
    });

    deepLinkService.init();

    const networkListener = networkService.addListener((status) => {
      if (!status.connected) {
        toast.error('You are offline. Some features may be unavailable.');
      } else {
        toast.success('Back online!');
      }
    });

    return () => {
      networkListener.remove();
    };
  }, []);
}
