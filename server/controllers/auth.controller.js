/**
 * ══════════════════════════════════════════════════════════════
 *  Auth Controller (PO5 — Modern Tool Usage, PO6 — Security)
 * ══════════════════════════════════════════════════════════════
 */

const crypto = require('crypto');
const { User } = require('../models');
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} = require('../utils/jwt');
const { sendNotification } = require('../services/email.service');

// ─── POST /api/auth/register ───
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, phone, role, vehicleNumber, vehicleType } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address is already registered',
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: role || 'user',
      vehicleNumber,
      vehicleType: vehicleType || '4-wheeler',
    });

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Save refresh token
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    // HTTP-only Cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          walletBalance: user.wallet?.balance || 0,
          vehicleNumber: user.vehicleNumber,
        },
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/auth/login ───
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email address or password provided',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated. Please contact support.',
      });
    }

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Refresh token rotation in database
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          walletBalance: user.wallet?.balance || 0,
          vehicleNumber: user.vehicleNumber,
          vehicleType: user.vehicleType,
        },
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/auth/refresh-token (Token Rotation) ───
exports.refreshToken = async (req, res, next) => {
  try {
    const rawToken = req.body.refreshToken || req.cookies.refreshToken;
    if (!rawToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token is required',
      });
    }

    let decoded;
    try {
      decoded = verifyRefreshToken(rawToken);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired refresh token',
      });
    }

    const user = await User.findById(decoded.id).select('+refreshToken');
    if (!user || user.refreshToken !== rawToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token reuse detected or session revoked',
      });
    }

    // Generate new pair (Token Rotation)
    const newAccessToken = generateAccessToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);

    user.refreshToken = newRefreshToken;
    await user.save({ validateBeforeSave: false });

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      message: 'Token rotated successfully',
      data: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/auth/logout ───
exports.logout = async (req, res, next) => {
  try {
    if (req.user) {
      await User.findByIdAndUpdate(req.user._id, { refreshToken: '' });
    }
    res.clearCookie('refreshToken');
    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/auth/forgot-password ───
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      // Return 200 to avoid email enumeration
      return res.status(200).json({
        success: true,
        message: 'If the email exists, a verification OTP has been dispatched.',
      });
    }

    const rawOtp = user.generateOTP();
    await user.save({ validateBeforeSave: false });

    // Send email notification (non-blocking)
    sendNotification(
      user.email,
      'ParkSmart — Password Reset OTP',
      `<p>Your verification code is: <strong>${rawOtp}</strong>. It will expire in 10 minutes.</p>`
    );

    res.status(200).json({
      success: true,
      message: 'Verification OTP sent to your registered email address',
      ...(process.env.NODE_ENV === 'development' && { devOtp: rawOtp }),
    });
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/auth/verify-otp ───
exports.verifyOtp = async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body;

    const user = await User.findOne({ email }).select('+verificationOTP.otp +verificationOTP.expiresAt');
    if (!user || !user.verificationOTP?.otp) {
      return res.status(400).json({
        success: false,
        message: 'No pending OTP verification request found for this account',
      });
    }

    if (new Date() > user.verificationOTP.expiresAt) {
      return res.status(400).json({
        success: false,
        message: 'Verification OTP has expired. Please request a new code.',
      });
    }

    const hashedInputOtp = crypto.createHash('sha256').update(otp).digest('hex');
    if (hashedInputOtp !== user.verificationOTP.otp) {
      return res.status(400).json({
        success: false,
        message: 'Incorrect verification OTP entered',
      });
    }

    // OTP verified
    user.isVerified = true;
    user.verificationOTP = undefined;

    // If resetting password
    if (newPassword) {
      user.password = newPassword;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: newPassword
        ? 'Password successfully reset. You may now login.'
        : 'Account successfully verified.',
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/auth/me ───
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.status(200).json({
      success: true,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};
