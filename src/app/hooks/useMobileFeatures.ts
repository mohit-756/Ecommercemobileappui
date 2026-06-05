import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { pushService } from '../services/pushService';
import { deepLinkService } from '../services/deepLinkService';
import { networkService } from '../services/networkService';
import { toast } from 'sonner';

export function useMobileFeatures() {
  const navigate = useNavigate();

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    // Push initialization can crash if google-services.json is missing
    pushService.init().catch(err => console.warn('Push init error:', err));

    pushService.registerListeners((token) => {
      console.log('FCM Token:', token);
      localStorage.setItem('fcm_token', token);
    }).catch(err => console.warn('Push listeners error:', err));

    deepLinkService.init();

    let wasOffline = false;
    const networkListener = networkService.addListener((status) => {
      if (!status.connected) {
        toast.error('You are offline. Some features may be unavailable.');
        wasOffline = true;
      } else if (wasOffline) {
        toast.success('Back online!');
        wasOffline = false;
      }
    });

    const backButtonListener = App.addListener('backButton', ({ canGoBack }) => {
      if (canGoBack) {
        window.history.back();
      } else {
        App.exitApp();
      }
    });

    return () => {
      networkListener.remove();
      backButtonListener.remove();
    };
  }, [navigate]);
}
