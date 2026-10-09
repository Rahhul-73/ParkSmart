/**
 * ParkingSlot Model  (PO3 — Design: Schema for parking infrastructure)
 *
 * SDG 11 — Sustainable Cities: Structured slot data enables
 *          real-time availability, reducing circling.
 * SDG 13 — Climate Action: EV slot type promotes electric
 *          vehicle adoption.
 */
const mongoose = require('mongoose');

const parkingSlotSchema = new mongoose.Schema(
  {
    slotNumber: {
      type: String,
      required: [true, 'Slot number is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    floor: {
      type: Number,
      required: [true, 'Floor number is required'],
      min: [0, 'Floor cannot be negative'],
    },
    zone: {
      type: String,
      required: [true, 'Zone is required'],
      enum: ['A', 'B', 'C', 'D', 'E'],
      uppercase: true,
    },
    type: {
      type: String,
      enum: ['car', 'bike', 'ev', 'truck', 'handicapped'],
      default: 'car',
    },
    status: {
      type: String,
      enum: ['available', 'occupied', 'reserved', 'maintenance'],
      default: 'available',
    },
    pricePerHour: {
      type: Number,
      required: [true, 'Price per hour is required'],
      min: [0, 'Price cannot be negative'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    features: [{
      type: String,
      enum: ['covered', 'ev-charging', 'cctv', 'valet', 'near-exit', 'wide'],
    }],
    location: {
      building: { type: String, default: 'Main' },
      description: String,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual: current booking
parkingSlotSchema.virtual('currentBooking', {
  ref: 'Booking',
  localField: '_id',
  foreignField: 'slot',
  justOne: true,
  match: { status: 'active' },
});

module.exports = mongoose.model('ParkingSlot', parkingSlotSchema);
