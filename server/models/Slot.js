/**
 * ══════════════════════════════════════════════════════════════
 *  Slot Model — ParkSmart Schema
 * ══════════════════════════════════════════════════════════════
 *
 *  Academic Mapping:
 *    PO2  — Problem Analysis: Granular floor-plan spatial allocation
 *    PO3  — Design: Normalization of lot-to-slot relationship
 *    SDG 11 — Sustainable Cities: Smart slot management prevents congestion
 *    SDG 13 — Climate Action: Dedicated EV slot tracking for electrification
 */

const mongoose = require('mongoose');

const slotSchema = new mongoose.Schema(
  {
    lotId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ParkingLot',
      required: [true, 'Parking Lot ID reference is required'],
      index: true,
    },
    slotNumber: {
      type: String,
      required: [true, 'Slot number is required'],
      uppercase: true,
      trim: true,
    },
    floor: {
      type: Number,
      required: [true, 'Floor number is required'],
      default: 0,
      index: true,
    },
    type: {
      type: String,
      enum: {
        values: ['2-wheeler', '4-wheeler', 'EV', 'handicapped'],
        message: '{VALUE} is not a supported slot type',
      },
      required: [true, 'Slot type is required'],
      default: '4-wheeler',
      index: true,
    },
    isEVCharging: {
      type: Boolean,
      default: false,
      index: true,
    },
    status: {
      type: String,
      enum: {
        values: ['available', 'reserved', 'occupied', 'maintenance'],
        message: '{VALUE} is not a valid status',
      },
      default: 'available',
      index: true,
    },
    // 2D Coordinates on the interactive floor plan map
    coordinates: {
      floorPlan: {
        x: {
          type: Number,
          default: 0,
        },
        y: {
          type: Number,
          default: 0,
        },
      },
    },
    priceMultiplier: {
      type: Number,
      default: 1.0,
      min: [0.5, 'Multiplier cannot be below 0.5'],
      max: [3.0, 'Multiplier cannot exceed 3.0'],
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

// ═══════════════════════════════════════════
//  INDEXES
// ═══════════════════════════════════════════

// Unique slot identifier per lot (e.g. Lot A cannot have two "A1-001" slots)
slotSchema.index({ lotId: 1, slotNumber: 1 }, { unique: true });

// Compound filter index for real-time querying by lot, floor, type, and availability
slotSchema.index({ lotId: 1, floor: 1, type: 1, status: 1 });

// ─── Virtuals ───
slotSchema.virtual('currentReservation', {
  ref: 'Reservation',
  localField: '_id',
  foreignField: 'slotId',
  justOne: true,
  match: { status: { $in: ['active', 'pending'] } },
});

// ─── Pre-save Hook: Sync EV Charging boolean if type is EV ───
slotSchema.pre('save', function (next) {
  if (this.type === 'EV') {
    this.isEVCharging = true;
  }
  next();
});

module.exports = mongoose.model('Slot', slotSchema);
