import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { pushService } from '../services/pushService';
import { deepLinkService } from '../services/deepLinkService';
import { networkService } from '../services/networkService';
import { toast } from 'sonner';

export function useMobileFeatures() {
  const navigate = useNavigate();
  const location = useLocation();

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

    let lastTimeBackPress = 0;
    const timePeriodToExit = 2000;

    const backButtonListener = App.addListener('backButton', ({ canGoBack }) => {
      // Priority 1: If user is on Home or Login, standard exit logic
      if (location.pathname === '/home' || location.pathname === '/login') {
        if (Date.now() - lastTimeBackPress < timePeriodToExit) {
          App.exitApp();
        } else {
          lastTimeBackPress = Date.now();
          toast('Press back again to exit', { duration: 2000 });
        }
        return;
      }

      // Priority 2: If we can go back in history, do it
      if (canGoBack) {
        window.history.back();
      }
      // Priority 3: Safety net - if stuck, always go to Home instead of exiting
      else {
        navigate('/home', { replace: true });
      }
    });

    return () => {
      networkListener.remove();
      backButtonListener.remove();
    };
  }, [navigate, location.pathname]);
}
