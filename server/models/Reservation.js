/**
 * ══════════════════════════════════════════════════════════════
 *  Reservation Model — ParkSmart Schema
 * ══════════════════════════════════════════════════════════════
 *
 *  Academic Mapping:
 *    PO2  — Problem Analysis: Double-booking prevention via compound indexes
 *    PO3  — Design: Lifecycle state machine (pending -> active -> completed)
 *    PO5  — Modern Tools: High-throughput compound index indexing
 *    SDG 11 — Sustainable Cities: Guaranteed spots eliminate search cruising
 *    SDG 13 — Climate Action: Idle minimization cuts greenhouse gas emission
 */

const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    slotId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Slot',
      required: [true, 'Slot ID is required'],
      index: true,
    },
    lotId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ParkingLot',
      required: [true, 'Parking Lot ID is required'],
      index: true,
    },
    startTime: {
      type: Date,
      required: [true, 'Reservation start time is required'],
    },
    endTime: {
      type: Date,
      required: [true, 'Reservation end time is required'],
      validate: {
        validator: function (val) {
          return val > this.startTime;
        },
        message: 'End time must be strictly after start time',
      },
    },
    duration: {
      type: Number, // in hours
      min: [0.25, 'Duration must be at least 15 minutes (0.25 hours)'],
    },
    totalAmount: {
      type: Number,
      required: [true, 'Total amount is required'],
      min: [0, 'Total amount cannot be negative'],
    },
    vehicleNumber: {
      type: String,
      required: [true, 'Vehicle registration plate number is required'],
      uppercase: true,
      trim: true,
    },
    status: {
      type: String,
      enum: {
        values: ['pending', 'active', 'completed', 'cancelled'],
        message: '{VALUE} is not a valid reservation status',
      },
      default: 'pending',
      index: true,
    },
    qrCode: {
      type: String, // Base64 encoded QR or unique secure verification hash
    },
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment',
    },
    penalty: {
      amount: {
        type: Number,
        default: 0,
        min: [0, 'Penalty amount cannot be negative'],
      },
      reason: {
        type: String,
        trim: true,
      },
      paid: {
        type: Boolean,
        default: false,
      },
    },
    checkInTime: {
      type: Date,
    },
    checkOutTime: {
      type: Date,
    },
    notifiedOnExpiry: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ═══════════════════════════════════════════
//  INDEXES FOR HIGH PERFORMANCE
// ═══════════════════════════════════════════

// 1. Mandatory compound index to detect overlapping bookings in O(log N)
//    (PO2: Critical collision prevention)
reservationSchema.index({ slotId: 1, startTime: 1, endTime: 1 });

// 2. User history lookup index
reservationSchema.index({ userId: 1, status: 1, createdAt: -1 });

// 3. Lot-level operational overview index
reservationSchema.index({ lotId: 1, status: 1, startTime: 1 });

// ─── Virtuals ───
reservationSchema.virtual('isExpired').get(function () {
  return new Date() > this.endTime && this.status === 'pending';
});

reservationSchema.virtual('overstayMinutes').get(function () {
  if (this.status === 'active' && new Date() > this.endTime) {
    return Math.round((new Date() - this.endTime) / (1000 * 60));
  }
  return 0;
});

// ─── Pre-save Hook: Auto-calculate duration & populate QR token ───
reservationSchema.pre('save', function (next) {
  if (this.startTime && this.endTime) {
    const diffMs = new Date(this.endTime) - new Date(this.startTime);
    this.duration = Math.max(0.25, Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100);
  }

  // Generate fallback QR payload if not present
  if (!this.qrCode) {
    this.qrCode = `PARK-${this._id}-${this.vehicleNumber}`;
  }

  next();
});

module.exports = mongoose.model('Reservation', reservationSchema);
