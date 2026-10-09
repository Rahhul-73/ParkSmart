/**
 * ══════════════════════════════════════════════════════════════
 *  User Model — ParkSmart Schema
 * ══════════════════════════════════════════════════════════════
 *
 *  Academic Mapping:
 *    PO3  — Design/Development: Identity and Access Management
 *    PO6  — Engineer & Society: Secure credential handling & privacy
 *    PSO1 — Modern Software Engineering: Schema design with Mongoose
 *    SDG 11 — Sustainable Cities: User profiles enable EV preference
 *             routing and digital wallet micropayments
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
      index: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Omitted from queries by default for security
    },
    phone: {
      type: String,
      trim: true,
      match: [/^\+?[\d\s-]{7,15}$/, 'Please provide a valid phone number'],
    },
    role: {
      type: String,
      enum: {
        values: ['user', 'admin', 'operator'],
        message: '{VALUE} is not a valid role',
      },
      default: 'user',
      index: true,
    },
    vehicleNumber: {
      type: String,
      uppercase: true,
      trim: true,
    },
    vehicleType: {
      type: String,
      enum: ['2-wheeler', '4-wheeler', 'EV', 'handicapped', 'car', 'bike', 'truck'],
      default: '4-wheeler',
    },
    wallet: {
      balance: {
        type: Number,
        default: 0,
        min: [0, 'Wallet balance cannot be negative'],
      },
      currency: {
        type: String,
        default: 'INR',
      },
    },
    avatar: {
      type: String,
      default: '',
    },
    refreshToken: {
      type: String,
      select: false,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationOTP: {
      otp: {
        type: String,
        select: false,
      },
      expiresAt: {
        type: Date,
        select: false,
      },
    },
    resetPasswordToken: {
      type: String,
      select: false,
    },
    resetPasswordExpires: {
      type: Date,
      select: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Virtuals ───
userSchema.virtual('reservations', {
  ref: 'Reservation',
  localField: '_id',
  foreignField: 'userId',
});

userSchema.virtual('walletBalance').get(function () {
  return this.wallet?.balance || 0;
});

// ─── Pre-save Hook: Password Hashing (PO6) ───
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ─── Instance Methods ───

/**
 * Compare plain text candidate password with stored hash
 */
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

/**
 * Generate a 6-digit verification OTP valid for 10 minutes
 */
userSchema.methods.generateOTP = function () {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  this.verificationOTP = {
    otp: crypto.createHash('sha256').update(otp).digest('hex'),
    expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
  };
  return otp;
};

/**
 * Generate Password Reset Token (hashed in DB, raw returned for email)
 */
userSchema.methods.generateResetPasswordToken = function () {
  const rawToken = crypto.randomBytes(32).toString('hex');
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(rawToken)
    .digest('hex');
  this.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins
  return rawToken;
};

module.exports = mongoose.model('User', userSchema);
