import nodemailer from 'nodemailer';

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
    transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });
  } else if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  return transporter;
}

export function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function sendOtpEmail(email, otp) {
  const transport = getTransporter();

  if (!transport) {
    console.log('========================================');
    console.log('DEV MODE — No email config found.');
    console.log(`OTP for ${email}: ${otp}`);
    console.log('========================================');
    return { messageId: 'dev-mode' };
  }

  const fromEmail = process.env.EMAIL_FROM || process.env.GMAIL_USER || 'noreply@dryfruithub.com';

  try {
    const info = await transport.sendMail({
      from: `"DryFruit Hub" <${fromEmail}>`,
      to: email,
      subject: 'Your OTP for Email Verification',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #1a1a2e; font-size: 24px; margin: 0;">DryFruit Hub</h1>
            <p style="color: #64748b; margin: 4px 0 0;">Email Verification</p>
          </div>
          <div style="background: #f8fafc; border-radius: 16px; padding: 32px; text-align: center;">
            <h2 style="color: #1a1a2e; font-size: 18px; margin: 0 0 16px;">Your OTP Code</h2>
            <div style="background: white; border-radius: 12px; padding: 16px; margin-bottom: 16px; border: 1px solid #e2e8f0;">
              <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #2563eb;">${otp}</span>
            </div>
            <p style="color: #64748b; font-size: 14px; margin: 0;">
              This code expires in <strong>5 minutes</strong>. Do not share it with anyone.
            </p>
          </div>
          <p style="color: #94a3b8; font-size: 12px; text-align: center; margin-top: 24px;">
            If you didn't request this, please ignore this email.
          </p>
        </div>
      `,
    });
    return info;
  } catch (error) {
    console.error('Failed to send email:', error.message);
    console.log('========================================');
    console.log('DEV MODE FALLBACK — Email sending failed.');
    console.log(`OTP for ${email}: ${otp}`);
    console.log('========================================');
    return { messageId: 'dev-mode' };
  }
}

/**
 * Formats a price number as Indian Rupees.
 */
function formatPrice(amount) {
  if (amount % 1 === 0) return `₹${amount}`;
  return `₹${Number(amount).toFixed(2)}`;
}

/**
 * Shared email wrapper — silently no-ops in dev mode.
 */
async function sendEmail(to, subject, html) {
  const transport = getTransporter();
  if (!transport) {
    console.log(`[DEV EMAIL] To: ${to} | Subject: ${subject}`);
    return { messageId: 'dev-mode' };
  }
  const fromEmail = process.env.EMAIL_FROM || process.env.GMAIL_USER || 'noreply@dryfruithub.com';
  try {
    return await transport.sendMail({ from: `"DryFruit Hub" <${fromEmail}>`, to, subject, html });
  } catch (err) {
    console.error(`Failed to send email to ${to}:`, err.message);
    return { messageId: 'dev-mode' };
  }
}

/**
 * Shared branded header/footer HTML wrappers.
 */
function emailWrapper(content) {
  return `
  <div style="font-family:'Segoe UI',Arial,sans-serif;background:#f8fafc;padding:32px 0;min-height:100vh;">
    <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.07);">
      <div style="background:linear-gradient(135deg,#1e3a8a 0%,#2563eb 100%);padding:28px 32px;text-align:center;">
        <h1 style="color:#ffffff;font-size:22px;font-weight:900;margin:0;letter-spacing:-0.5px;">🌰 DryFruit Hub</h1>
        <p style="color:rgba(255,255,255,0.75);font-size:12px;margin:4px 0 0;font-weight:500;">Premium Dry Fruits Delivered</p>
      </div>
      <div style="padding:32px;">
        ${content}
      </div>
      <div style="background:#f1f5f9;padding:20px 32px;text-align:center;border-top:1px solid #e2e8f0;">
        <p style="color:#94a3b8;font-size:11px;margin:0;">© 2026 DryFruit Hub. All rights reserved.</p>
        <p style="color:#94a3b8;font-size:11px;margin:6px 0 0;">Questions? Reply to this email or visit our <a href="#" style="color:#2563eb;text-decoration:none;">Help Center</a>.</p>
      </div>
    </div>
  </div>`;
}

function orderItemsTable(items) {
  return `
  <table style="width:100%;border-collapse:collapse;margin:16px 0;">
    <thead>
      <tr style="background:#f8fafc;">
        <th style="text-align:left;padding:10px 12px;font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;border-bottom:1px solid #e2e8f0;">Product</th>
        <th style="text-align:center;padding:10px 12px;font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;border-bottom:1px solid #e2e8f0;">Qty</th>
        <th style="text-align:right;padding:10px 12px;font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;border-bottom:1px solid #e2e8f0;">Price</th>
      </tr>
    </thead>
    <tbody>
      ${(items || []).map(item => `
        <tr>
          <td style="padding:12px;border-bottom:1px solid #f1f5f9;font-size:14px;color:#1e293b;font-weight:600;">
            ${item.name}${item.weight ? `<br><span style="font-size:11px;color:#64748b;font-weight:400;">${item.weight}</span>` : ''}
          </td>
          <td style="padding:12px;border-bottom:1px solid #f1f5f9;font-size:14px;color:#64748b;text-align:center;">×${item.quantity}</td>
          <td style="padding:12px;border-bottom:1px solid #f1f5f9;font-size:14px;color:#1e293b;font-weight:700;text-align:right;">${formatPrice(item.price * item.quantity)}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>`;
}

function orderTotalsSection(order) {
  return `
  <div style="background:#f8fafc;border-radius:12px;padding:16px;margin-top:8px;">
    <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
      <span style="font-size:13px;color:#64748b;">Subtotal</span>
      <span style="font-size:13px;color:#1e293b;font-weight:600;">${formatPrice(order.subtotal || 0)}</span>
    </div>
    <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
      <span style="font-size:13px;color:#64748b;">Delivery Fee</span>
      <span style="font-size:13px;color:${order.shippingCost === 0 ? '#10b981' : '#1e293b'};font-weight:600;">${order.shippingCost === 0 ? 'FREE' : formatPrice(order.shippingCost)}</span>
    </div>
    ${order.fees > 0 ? `<div style="display:flex;justify-content:space-between;margin-bottom:8px;"><span style="font-size:13px;color:#64748b;">Handling</span><span style="font-size:13px;color:#1e293b;font-weight:600;">${formatPrice(order.fees)}</span></div>` : ''}
    ${order.tax > 0 ? `<div style="display:flex;justify-content:space-between;margin-bottom:8px;"><span style="font-size:13px;color:#64748b;">GST (8%)</span><span style="font-size:13px;color:#1e293b;font-weight:600;">${formatPrice(order.tax)}</span></div>` : ''}
    <div style="display:flex;justify-content:space-between;padding-top:10px;border-top:1px dashed #cbd5e1;margin-top:6px;">
      <span style="font-size:15px;color:#1e293b;font-weight:800;">Total</span>
      <span style="font-size:15px;color:#2563eb;font-weight:900;">${formatPrice(order.total || 0)}</span>
    </div>
  </div>`;
}

function addressSection(addr) {
  if (!addr) return '';
  return `
  <div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:12px;padding:16px;margin:16px 0;">
    <p style="font-size:11px;font-weight:800;color:#0369a1;text-transform:uppercase;letter-spacing:1px;margin:0 0 8px;">📍 Delivery Address</p>
    <p style="font-size:14px;font-weight:700;color:#1e293b;margin:0 0 4px;">${addr.fullName}</p>
    <p style="font-size:13px;color:#64748b;margin:0 0 2px;">${addr.addressLine1}${addr.addressLine2 ? ', ' + addr.addressLine2 : ''}</p>
    <p style="font-size:13px;color:#64748b;margin:0 0 2px;">${addr.city}, ${addr.state} — ${addr.pincode}</p>
    <p style="font-size:13px;color:#64748b;margin:0;">📞 ${addr.phone}</p>
  </div>`;
}

/**
 * Sends order confirmation email after order is placed.
 */
export async function sendOrderConfirmationEmail(userEmail, userName, order) {
  const displayId = order._id.toString().slice(-6).toUpperCase();
  const paymentBadge = order.paymentMethod === 'cod'
    ? `<span style="background:#fef3c7;color:#92400e;font-size:11px;font-weight:700;padding:3px 10px;border-radius:20px;display:inline-block;">💵 Cash on Delivery</span>`
    : `<span style="background:#d1fae5;color:#065f46;font-size:11px;font-weight:700;padding:3px 10px;border-radius:20px;display:inline-block;">✅ Paid Online</span>`;

  const html = emailWrapper(`
    <div style="text-align:center;margin-bottom:28px;">
      <div style="width:64px;height:64px;background:#d1fae5;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:28px;margin-bottom:12px;">✅</div>
      <h2 style="font-size:22px;font-weight:900;color:#1e293b;margin:0 0 6px;">Order Confirmed!</h2>
      <p style="font-size:14px;color:#64748b;margin:0;">Hi ${userName}, your order has been placed successfully.</p>
    </div>

    <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;padding:16px;margin-bottom:20px;display:flex;justify-content:space-between;align-items:center;">
      <div>
        <p style="font-size:11px;color:#3b82f6;font-weight:800;text-transform:uppercase;letter-spacing:1px;margin:0 0 4px;">Order ID</p>
        <p style="font-size:18px;font-weight:900;color:#1e3a8a;margin:0;">#ORD-${displayId}</p>
      </div>
      <div style="text-align:right;">${paymentBadge}</div>
    </div>

    ${orderItemsTable(order.items)}
    ${orderTotalsSection(order)}
    ${addressSection(order.shippingAddress)}

    <div style="text-align:center;margin-top:28px;">
      <p style="font-size:13px;color:#64748b;margin:0 0 16px;">We'll send you another email when your order is picked up for delivery.</p>
      <div style="background:#f1f5f9;border-radius:12px;padding:14px;font-size:13px;color:#475569;">
        📦 Estimated delivery: <strong style="color:#1e293b;">3–5 business days</strong>
      </div>
    </div>
  `);

  return sendEmail(userEmail, `✅ Order Confirmed — #ORD-${displayId} | DryFruit Hub`, html);
}

/**
 * Sends shipment dispatched / out-for-delivery email.
 */
export async function sendOrderShippedEmail(userEmail, userName, order, status) {
  const displayId = order._id.toString().slice(-6).toUpperCase();
  const isOutForDelivery = status === 'out_for_delivery';

  const emoji = isOutForDelivery ? '🛵' : '📦';
  const title = isOutForDelivery ? 'Out for Delivery!' : 'Order Shipped!';
  const subtitle = isOutForDelivery
    ? `Great news! Your order will arrive today.`
    : `Your order is on its way to you.`;
  const badge = isOutForDelivery
    ? `<span style="background:#fef3c7;color:#92400e;font-size:11px;font-weight:700;padding:3px 10px;border-radius:20px;">🛵 Out for Delivery</span>`
    : `<span style="background:#ede9fe;color:#5b21b6;font-size:11px;font-weight:700;padding:3px 10px;border-radius:20px;">📦 Shipped</span>`;

  const courierInfo = order.courierDetails?.trackingId
    ? `<div style="background:#f8fafc;border-radius:12px;padding:16px;margin:16px 0;border:1px solid #e2e8f0;">
        <p style="font-size:11px;font-weight:800;color:#64748b;text-transform:uppercase;letter-spacing:1px;margin:0 0 8px;">🚚 Tracking Info</p>
        <p style="font-size:14px;color:#1e293b;margin:0 0 4px;">Courier: <strong>${order.courierDetails.name || 'Standard Shipping'}</strong></p>
        <p style="font-size:14px;color:#1e293b;margin:0;">Tracking ID: <strong>${order.courierDetails.trackingId}</strong></p>
      </div>`
    : '';

  const html = emailWrapper(`
    <div style="text-align:center;margin-bottom:28px;">
      <div style="width:64px;height:64px;background:#ede9fe;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:28px;margin-bottom:12px;">${emoji}</div>
      <h2 style="font-size:22px;font-weight:900;color:#1e293b;margin:0 0 6px;">${title}</h2>
      <p style="font-size:14px;color:#64748b;margin:0;">${subtitle}</p>
    </div>

    <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;padding:16px;margin-bottom:20px;display:flex;justify-content:space-between;align-items:center;">
      <div>
        <p style="font-size:11px;color:#3b82f6;font-weight:800;text-transform:uppercase;letter-spacing:1px;margin:0 0 4px;">Order ID</p>
        <p style="font-size:18px;font-weight:900;color:#1e3a8a;margin:0;">#ORD-${displayId}</p>
      </div>
      <div>${badge}</div>
    </div>

    ${courierInfo}
    ${addressSection(order.shippingAddress)}

    <div style="text-align:center;margin-top:24px;padding:16px;background:#f0fdf4;border-radius:12px;border:1px solid #bbf7d0;">
      <p style="font-size:14px;font-weight:700;color:#15803d;margin:0;">${isOutForDelivery ? '🏠 Please be available to receive your order today!' : '⏱️ Estimated delivery: 1–3 business days'}</p>
    </div>
  `);

  return sendEmail(userEmail, `${emoji} Order ${isOutForDelivery ? 'Out for Delivery' : 'Shipped'} — #ORD-${displayId} | DryFruit Hub`, html);
}

/**
 * Sends order delivered confirmation email.
 */
export async function sendOrderDeliveredEmail(userEmail, userName, order) {
  const displayId = order._id.toString().slice(-6).toUpperCase();

  const html = emailWrapper(`
    <div style="text-align:center;margin-bottom:28px;">
      <div style="width:64px;height:64px;background:#d1fae5;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:28px;margin-bottom:12px;">🎉</div>
      <h2 style="font-size:22px;font-weight:900;color:#1e293b;margin:0 0 6px;">Order Delivered!</h2>
      <p style="font-size:14px;color:#64748b;margin:0;">Hi ${userName}, your order has been delivered. Enjoy your dry fruits!</p>
    </div>

    <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;padding:16px;margin-bottom:20px;">
      <p style="font-size:11px;color:#3b82f6;font-weight:800;text-transform:uppercase;letter-spacing:1px;margin:0 0 4px;">Order ID</p>
      <p style="font-size:18px;font-weight:900;color:#1e3a8a;margin:0;">#ORD-${displayId}</p>
    </div>

    ${orderItemsTable(order.items)}
    ${orderTotalsSection(order)}

    <div style="text-align:center;margin-top:28px;padding:20px;background:#fffbeb;border-radius:12px;border:1px solid #fde68a;">
      <p style="font-size:15px;font-weight:700;color:#92400e;margin:0 0 8px;">⭐ How was your experience?</p>
      <p style="font-size:13px;color:#78350f;margin:0;">Open the DryFruit Hub app to rate your order and leave a review. Your feedback helps us improve!</p>
    </div>
  `);

  return sendEmail(userEmail, `🎉 Order Delivered — #ORD-${displayId} | DryFruit Hub`, html);
}

/**
 * Sends order cancellation email.
 */
export async function sendOrderCancelledEmail(userEmail, userName, order, reason) {
  const displayId = order._id.toString().slice(-6).toUpperCase();
  const refundNote = order.paymentMethod === 'cod'
    ? ''
    : `<div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;padding:16px;margin:16px 0;">
        <p style="font-size:13px;font-weight:700;color:#1d4ed8;margin:0;">💳 Refund Information</p>
        <p style="font-size:13px;color:#3b82f6;margin:6px 0 0;">If payment was made online, a full refund of <strong>${formatPrice(order.total)}</strong> will be processed to your original payment method within 5–7 business days.</p>
      </div>`;

  const html = emailWrapper(`
    <div style="text-align:center;margin-bottom:28px;">
      <div style="width:64px;height:64px;background:#fee2e2;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:28px;margin-bottom:12px;">❌</div>
      <h2 style="font-size:22px;font-weight:900;color:#1e293b;margin:0 0 6px;">Order Cancelled</h2>
      <p style="font-size:14px;color:#64748b;margin:0;">Hi ${userName}, your order has been cancelled.</p>
    </div>

    <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:12px;padding:16px;margin-bottom:20px;">
      <p style="font-size:11px;color:#dc2626;font-weight:800;text-transform:uppercase;letter-spacing:1px;margin:0 0 4px;">Cancelled Order</p>
      <p style="font-size:18px;font-weight:900;color:#991b1b;margin:0 0 8px;">#ORD-${displayId}</p>
      ${reason ? `<p style="font-size:13px;color:#64748b;margin:0;">Reason: <strong>${reason}</strong></p>` : ''}
    </div>

    ${orderItemsTable(order.items)}
    ${refundNote}

    <div style="text-align:center;margin-top:24px;">
      <p style="font-size:13px;color:#64748b;">Need help? Contact our support team. We're sorry for any inconvenience.</p>
    </div>
  `);

  return sendEmail(userEmail, `❌ Order Cancelled — #ORD-${displayId} | DryFruit Hub`, html);
}
