import nodemailer from 'nodemailer';
import dns from 'dns';

let transporter = null;

async function getTransporter() {
  if (transporter) return transporter;

  if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
    let host = 'smtp.gmail.com';
    try {
      const lookupResult = await dns.promises.lookup(host, { family: 4 });
      host = lookupResult.address;
      console.log(`[EmailService] Resolved smtp.gmail.com manually to IPv4: ${host}`);
    } catch (err) {
      console.warn(`[EmailService] DNS resolution failed for smtp.gmail.com, falling back to hostname:`, err.message);
    }

    transporter = nodemailer.createTransport({
      host: host,
      port: 587,
      secure: false,
      tls: {
        servername: 'smtp.gmail.com'
      },
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });
  } else if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    let host = process.env.EMAIL_HOST;
    try {
      const lookupResult = await dns.promises.lookup(host, { family: 4 });
      host = lookupResult.address;
      console.log(`[EmailService] Resolved ${process.env.EMAIL_HOST} manually to IPv4: ${host}`);
    } catch (err) {
      console.warn(`[EmailService] DNS resolution failed for ${process.env.EMAIL_HOST}, falling back to hostname:`, err.message);
    }

    transporter = nodemailer.createTransport({
      host: host,
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: process.env.EMAIL_SECURE === 'true',
      tls: {
        servername: process.env.EMAIL_HOST
      },
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  return transporter;
}

export function hasTransporter() {
  return !!(
    (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) ||
    (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS)
  );
}

export function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function sendOtpEmail(email, otp) {
  const transport = await getTransporter();

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
    throw error;
  }
}
