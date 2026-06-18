import { useState, useEffect, useRef } from 'react';
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
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handleResize = () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(() => {
        setIsMobileScreen(window.innerWidth < 1024);
      }, 150);
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, []);

  if (Capacitor.isNativePlatform() || isMobileScreen) {
    return <MobileShell />;
  }
  return <WebShell />;
}
