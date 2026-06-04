import { App } from '@capacitor/app';

export const deepLinkService = {
  async init() {
    await App.addListener('appUrlOpen', (data) => {
      const url = new URL(data.url);
      const path = url.pathname + url.search;
      const timeout = setTimeout(() => {
        clearTimeout(timeout);
        window.location.href = path;
      }, 500);
    });
  },
};
