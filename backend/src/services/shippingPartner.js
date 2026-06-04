/**
 * Shipping partner integration (Shiprocket / Delhivery)
 *
 * To enable real shipping:
 * 1. Set SHIPPING_PROVIDER=shiprocket|delhivery in .env
 * 2. Add the provider's API key and secret to .env
 * 3. Uncomment the provider-specific code below
 */

export async function createShipment(order, shippingAddress) {
  // const provider = process.env.SHIPPING_PROVIDER;

  // if (provider === 'shiprocket') {
  //   return createShiprocketShipment(order, shippingAddress);
  // }
  // if (provider === 'delhivery') {
  //   return createDelhiveryShipment(order, shippingAddress);
  // }

  // Mock response when no provider is configured
  return {
    courierName: 'Standard Shipping',
    trackingId: `TRK${Date.now().toString(36).toUpperCase()}`,
    estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
  };
}

export async function trackShipment(trackingId) {
  // const provider = process.env.SHIPPING_PROVIDER;
  // if (provider === 'shiprocket') return trackShiprocket(trackingId);
  // if (provider === 'delhivery') return trackDelhivery(trackingId);

  return null;
}

// --- Shiprocket Integration (uncomment and add SHIPROCKET_EMAIL, SHIPROCKET_PASSWORD to .env) ---

// import axios from 'axios';

// let shiprocketToken = null;

// async function getShiprocketToken() {
//   if (shiprocketToken) return shiprocketToken;
//   const res = await axios.post('https://apiv2.shiprocket.in/v1/external/auth/login', {
//     email: process.env.SHIPROCKET_EMAIL,
//     password: process.env.SHIPROCKET_PASSWORD,
//   });
//   shiprocketToken = res.data.token;
//   return shiprocketToken;
// }

// async function createShiprocketShipment(order, address) {
//   const token = await getShiprocketToken();
//   const res = await axios.post('https://apiv2.shiprocket.in/v1/external/orders/create/adhoc', {
//     order_id: order._id.toString(),
//     order_date: order.createdAt,
//     billing_customer_name: address.fullName,
//     billing_phone: address.phone,
//     billing_address: address.addressLine1,
//     billing_city: address.city,
//     billing_state: address.state,
//     billing_pincode: address.pincode,
//     order_items: order.items.map(item => ({
//       name: item.name,
//       quantity: item.quantity,
//       price: item.price,
//     })),
//     payment_method: order.paymentMethod === 'cod' ? 'COD' : 'Prepaid',
//     sub_total: order.subtotal,
//     total: order.total,
//   }, {
//     headers: { Authorization: `Bearer ${token}` },
//   });
//   return {
//     courierName: 'Shiprocket',
//     trackingId: res.data.shipment_id,
//     estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
//   };
// }

// async function trackShiprocket(trackingId) {
//   const token = await getShiprocketToken();
//   const res = await axios.get(`https://apiv2.shiprocket.in/v1/external/courier/track/shipment/${trackingId}`, {
//     headers: { Authorization: `Bearer ${token}` },
//   });
//   return res.data;
// }

// --- Delhivery Integration (uncomment and add DELHIVERY_API_KEY to .env) ---

// async function createDelhiveryShipment(order, address) {
//   const res = await axios.post('https://track.delhivery.com/api/p/create', {
//     // Delhivery API payload
//   }, {
//     headers: { Authorization: `Token ${process.env.DELHIVERY_API_KEY}` },
//   });
//   return { courierName: 'Delhivery', trackingId: res.data.packages?.[0]?.waybill, estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) };
// }
