import twilio from 'twilio';

let twilioClient = null;

function getTwilioClient() {
  if (twilioClient) return twilioClient;

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const apiKey = process.env.TWILIO_API_KEY;
  const apiSecret = process.env.TWILIO_API_SECRET;
  const authToken = process.env.TWILIO_AUTH_TOKEN;

  if (apiKey && apiSecret && accountSid) {
    twilioClient = twilio(apiKey, apiSecret, { accountSid });
  } else if (accountSid && authToken) {
    twilioClient = twilio(accountSid, authToken);
  }
  return twilioClient;
}

/**
 * Validates that all required Twilio environment variables are configured.
 * Throws an Error if configuration is incomplete.
 */
export function validateTwilioConfig() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID;
  const apiKey = process.env.TWILIO_API_KEY;
  const apiSecret = process.env.TWILIO_API_SECRET;
  const authToken = process.env.TWILIO_AUTH_TOKEN;

  if (!accountSid) {
    throw new Error('Twilio Configuration Error: TWILIO_ACCOUNT_SID is missing.');
  }
  if (!serviceSid) {
    throw new Error('Twilio Configuration Error: TWILIO_VERIFY_SERVICE_SID is missing.');
  }

  const hasApiCredentials = apiKey && apiSecret;
  const hasAuthToken = !!authToken;

  if (!hasApiCredentials && !hasAuthToken) {
    throw new Error('Twilio Configuration Error: Either TWILIO_AUTH_TOKEN or both TWILIO_API_KEY and TWILIO_API_SECRET must be configured.');
  }
}

/**
 * Starts Twilio Verify OTP flow (SMS).
 * @param {string} phone - Target phone number in E.164 format.
 * @returns {Promise<object>} Verification object.
 */
export async function startVerifyVerification(phone) {
  const client = getTwilioClient();
  const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

  if (!client || !serviceSid) {
    throw new Error('Twilio Verify client is not initialized. Check your environment variables.');
  }

  try {
    const verification = await client.verify.v2
      .services(serviceSid)
      .verifications.create({ to: phone, channel: 'sms' });
    return verification;
  } catch (error) {
    console.error('Failed to start Twilio Verify verification:', error.message);
    throw error;
  }
}

/**
 * Checks Twilio Verify OTP code.
 * @param {string} phone - Target phone number in E.164 format.
 * @param {string} code - The OTP code.
 * @returns {Promise<object>} Verification check object.
 */
export async function checkVerifyVerification(phone, code) {
  const client = getTwilioClient();
  const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

  if (!client || !serviceSid) {
    throw new Error('Twilio Verify client is not initialized. Check your environment variables.');
  }

  try {
    const check = await client.verify.v2
      .services(serviceSid)
      .verificationChecks.create({ to: phone, code });
    return check;
  } catch (error) {
    console.error('Failed to check Twilio Verify verification:', error.message);
    throw error;
  }
}
