/**
 * ══════════════════════════════════════════════════════════════
 *  ParkingLot Model — ParkSmart Schema
 * ══════════════════════════════════════════════════════════════
 *
 *  Academic Mapping:
 *    PO2  — Problem Analysis: Modeling complex multi-tier parking lots
 *    PO3  — Design: Geo-spatial data structures for proximity queries
 *    PO5  — Modern Tools: MongoDB 2dsphere geospatial and text indexes
 *    SDG 11 — Sustainable Cities: Smart routing to nearest available facility
 *    SDG 13 — Climate Action: Reduces urban fuel burn from cruising
 */

const mongoose = require('mongoose');

const parkingLotSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Parking lot name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    address: {
      street: { type: String, trim: true },
      city: { type: String, required: true, trim: true },
      state: { type: String, trim: true },
      zipCode: { type: String, trim: true },
      country: { type: String, default: 'India' },
      fullAddress: { type: String, required: true, trim: true },
    },
    // Explicit lat/lng pair for frontend/client convenience
    coordinates: {
      lat: {
        type: Number,
        required: [true, 'Latitude is required'],
        min: [-90, 'Latitude must be between -90 and 90'],
        max: [90, 'Latitude must be between -90 and 90'],
      },
      lng: {
        type: Number,
        required: [true, 'Longitude is required'],
        min: [-180, 'Longitude must be between -180 and 180'],
        max: [180, 'Longitude must be between -180 and 180'],
      },
    },
    // GeoJSON Point format required for MongoDB 2dsphere index
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude] in GeoJSON order
        required: true,
        default: [0, 0],
      },
    },
    totalSlots: {
      type: Number,
      required: [true, 'Total slots count is required'],
      min: [1, 'Must have at least 1 slot'],
      default: 0,
    },
    availableSlots: {
      type: Number,
      required: true,
      min: [0, 'Available slots cannot be negative'],
      default: 0,
    },
    pricePerHour: {
      type: Number,
      required: [true, 'Base price per hour is required'],
      min: [0, 'Price cannot be negative'],
    },
    images: [
      {
        type: String,
        trim: true,
      },
    ],
    amenities: [
      {
        type: String,
        enum: [
          'covered',
          'ev-charging',
          'cctv',
          'valet',
          'disabled-access',
          'security-guard',
          'restroom',
          'car-wash',
          'automated-barrier',
        ],
      },
    ],
    operatingHours: {
      open: { type: String, default: '00:00' },
      close: { type: String, default: '23:59' },
      is24x7: { type: Boolean, default: true },
    },
    rating: {
      type: Number,
      default: 0,
      min: [0, 'Rating cannot be less than 0'],
      max: [5, 'Rating cannot exceed 5'],
      set: (val) => Math.round(val * 10) / 10,
    },
    reviewsCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
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

// 1. Geospatial 2dsphere index for radius/proximity searches ($near, $geoWithin)
parkingLotSchema.index({ location: '2dsphere' });

// 2. Full-text search index on name and address fields
parkingLotSchema.index(
  {
    name: 'text',
    'address.fullAddress': 'text',
    'address.city': 'text',
    'address.street': 'text',
  },
  {
    weights: {
      name: 10,
      'address.city': 5,
      'address.fullAddress': 3,
    },
    name: 'ParkingLotTextIndex',
  }
);

// 3. Status and availability index
parkingLotSchema.index({ isActive: 1, availableSlots: 1, pricePerHour: 1 });

// ─── Virtuals ───
parkingLotSchema.virtual('slots', {
  ref: 'Slot',
  localField: '_id',
  foreignField: 'lotId',
});

parkingLotSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'lotId',
});

parkingLotSchema.virtual('occupancyRate').get(function () {
  if (!this.totalSlots || this.totalSlots === 0) return 0;
  const occupied = this.totalSlots - this.availableSlots;
  return Math.round((occupied / this.totalSlots) * 100);
});

// ─── Pre-save Hook: Sync GeoJSON with coordinates ───
parkingLotSchema.pre('save', function (next) {
  if (this.coordinates?.lng !== undefined && this.coordinates?.lat !== undefined) {
    this.location = {
      type: 'Point',
      coordinates: [this.coordinates.lng, this.coordinates.lat], // [lng, lat]
    };
  }
  next();
});

module.exports = mongoose.model('ParkingLot', parkingLotSchema);
