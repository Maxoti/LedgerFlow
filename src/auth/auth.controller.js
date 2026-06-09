const authService = require("./auth.service");
const { sendOTP, verifyOTP } = require("../notifications/notifications.service");
const { successResponse } = require("../shared/response");
const { HTTP_STATUS } = require("../shared/constants");

async function register(req, res, next) {
  try {
    const { email, password, phone } = req.body;
    if (!email || !password || !phone) {
      throw new Error("Email, password and phone are required");
    }

    const user = await authService.register({ email, password, phone });
    successResponse(res, user, HTTP_STATUS.CREATED);
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) throw new Error("Email and password are required");

    const result = await authService.login({ email, password });
    successResponse(res, result);
  } catch (error) {
    next(error);
  }
}

async function sendOtp(req, res, next) {
  try {
    const { phone } = req.body;
    if (!phone) throw new Error("Phone number is required");
    const result = await sendOTP(phone);
    successResponse(res, result);
  } catch (error) {
    next(error);
  }
}

async function verifyOtp(req, res, next) {
  try {
    const { phone, otp } = req.body;
    if (!phone || !otp) throw new Error("Phone and OTP are required");
    const result = await verifyOTP(phone, otp);
    successResponse(res, result);
  } catch (error) {
    next(error);
  }
}

module.exports = { register, login, sendOtp, verifyOtp };