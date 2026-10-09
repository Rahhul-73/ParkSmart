/**
 * Booking Model  (PO2 — Problem Analysis: Reservation conflict resolution)
 *
 * SDG 11 — Sustainable Cities: Reservation-based parking
 *          eliminates cruising and optimizes lot utilization.
 */
const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
    },
    slot: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ParkingSlot',
      required: [true, 'Parking slot is required'],
    },
    vehicleNumber: {
      type: String,
      required: [true, 'Vehicle number is required'],
      uppercase: true,
      trim: true,
    },
    vehicleType: {
      type: String,
      enum: ['car', 'bike', 'ev', 'truck'],
      required: true,
    },
    startTime: {
      type: Date,
      required: [true, 'Start time is required'],
    },
    endTime: {
      type: Date,
      required: [true, 'End time is required'],
    },
    duration: {
      type: Number, // in hours
      min: [0.5, 'Minimum booking is 30 minutes'],
    },
    totalAmount: {
      type: Number,
      min: [0, 'Amount cannot be negative'],
    },
    status: {
      type: String,
      enum: ['pending', 'active', 'completed', 'cancelled', 'expired'],
      default: 'pending',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'refunded'],
      default: 'pending',
    },
    checkInTime: Date,
    checkOutTime: Date,
    notes: String,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Calculate duration & total before saving ───
bookingSchema.pre('save', async function (next) {
  if (this.startTime && this.endTime) {
    const diffMs = new Date(this.endTime) - new Date(this.startTime);
    this.duration = Math.max(0.5, diffMs / (1000 * 60 * 60)); // hours

    if (!this.totalAmount) {
      const ParkingSlot = mongoose.model('ParkingSlot');
      const slot = await ParkingSlot.findById(this.slot);
      if (slot) {
        this.totalAmount = parseFloat((this.duration * slot.pricePerHour).toFixed(2));
      }
    }
  }
  next();
});

// Indexes for common queries
bookingSchema.index({ user: 1, status: 1 });
bookingSchema.index({ slot: 1, startTime: 1, endTime: 1 });
bookingSchema.index({ status: 1, endTime: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
