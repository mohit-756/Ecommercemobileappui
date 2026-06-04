import { BiometricAuth } from '@aparajita/capacitor-biometric-auth';

export interface BiometricResult {
  available: boolean;
  success: boolean;
  error?: string;
}

export const biometricService = {
  async checkAvailability(): Promise<BiometricResult> {
    try {
      const result = await BiometricAuth.checkBiometry();
      return {
        available: result.isAvailable,
        success: true,
      };
    } catch (error: any) {
      return {
        available: false,
        success: false,
        error: error.message || 'Biometric check failed',
      };
    }
  },

  async authenticate(reason?: string): Promise<BiometricResult> {
    try {
      const result = await BiometricAuth.authenticate({
        reason: reason || 'Authenticate to continue',
      });
      return {
        available: true,
        success: result.success,
      };
    } catch (error: any) {
      return {
        available: true,
        success: false,
        error: error.message || 'Authentication failed',
      };
    }
  },
};
