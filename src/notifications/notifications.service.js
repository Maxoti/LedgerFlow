const axios = require("axios");
const { client: redisClient } = require("../config/redis");
const env = require("../config/env");

const MOBIWAVE_URL = process.env.MOBIWAVE_API_URL || "https://sms.mobiwave.co.ke/api/v3/sms";
const MOBIWAVE_TOKEN = process.env.MOBIWAVE_API_TOKEN;
const SENDER_ID = process.env.MOBIWAVE_SENDER_ID || "LEDGER";
const OTP_EXPIRY = 300; // 5 minutes

// ─── Phone Formatter ────────────────────────────────────────────
function formatPhone(phone) {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.startsWith("0")) return "254" + cleaned.slice(1);
  if (cleaned.startsWith("254")) return cleaned;
  return cleaned;
}

// ─── Send SMS via Mobiwave ──────────────────────────────────────
async function sendSMS(phone, message) {
  try {
    const response = await axios.post(
      MOBIWAVE_URL,
      {
        recipient: formatPhone(phone),
        sender_id: SENDER_ID,
        type: "plain",
        message,
      },
      {
        headers: {
          Authorization: `Bearer ${MOBIWAVE_TOKEN}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        timeout: 30000,
      }
    );

    console.log("[SMS] Sent:", response.data);
    return { success: true, data: response.data };
  } catch (error) {
    console.error("[SMS] Failed:", error.response?.data || error.message);
    return { success: false, error: error.response?.data || error.message };
  }
}

// ─── Generate OTP ───────────────────────────────────────────────
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6 digits
}

// ─── Send OTP ───────────────────────────────────────────────────
async function sendOTP(phone) {
  const otp = generateOTP();
  const key = `otp:${formatPhone(phone)}`;

  // Store in Redis with 5 minute expiry
  await redisClient.set(key, otp, { EX: OTP_EXPIRY });

  const message = `Your LedgerFlow verification code is: ${otp}. Valid for 5 minutes. Do not share this code.`;
  const result = await sendSMS(phone, message);

  if (!result.success) {
    throw new Error("Failed to send OTP. Please try again.");
  }

  console.log(`[OTP] Sent to ${phone}`);
  return { success: true, message: "OTP sent successfully" };
}

// ─── Verify OTP ─────────────────────────────────────────────────
async function verifyOTP(phone, otp) {
  const key = `otp:${formatPhone(phone)}`;
  const stored = await redisClient.get(key);

  if (!stored) {
    throw new Error("OTP expired or not found. Please request a new one.");
  }

  if (stored !== otp) {
    throw new Error("Invalid OTP.");
  }

  // Delete after successful verification — one time use
  await redisClient.del(key);

  return { success: true, message: "OTP verified successfully" };
}

module.exports = { sendOTP, verifyOTP, sendSMS };