import { Network } from '@capacitor/network';

export interface NetworkStatus {
  connected: boolean;
  connectionType: string;
}

export const networkService = {
  async getStatus(): Promise<NetworkStatus> {
    const status = await Network.getStatus();
    return {
      connected: status.connected,
      connectionType: status.connectionType,
    };
  },

  addListener(callback: (status: NetworkStatus) => void) {
    return Network.addListener('networkStatusChange', (status) => {
      callback({
        connected: status.connected,
        connectionType: status.connectionType,
      });
    });
  },
};
