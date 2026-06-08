import { Capacitor } from '@capacitor/core';
import { MobileShell } from './MobileShell';
import { WebShell } from './WebShell';

export function PlatformShell() {
  if (Capacitor.isNativePlatform()) {
    return <MobileShell />;
  }
  return <WebShell />;
}
