import api from './api';

export const shippingService = {
  checkPincode: (pincode: string) =>
    api.get(`/shipping/pincode/${pincode}`),

  calculateShipping: (pincode: string, subtotal: number) =>
    api.post('/shipping/calculate', { pincode, subtotal }),
};
