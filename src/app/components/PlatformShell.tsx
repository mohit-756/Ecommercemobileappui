import { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { MobileShell } from './MobileShell';
import { WebShell } from './WebShell';

export function PlatformShell() {
  const [isMobileScreen, setIsMobileScreen] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 1024;
    }
    return false;
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobileScreen(window.innerWidth < 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (Capacitor.isNativePlatform() || isMobileScreen) {
    return <MobileShell />;
  }
  return <WebShell />;
}
