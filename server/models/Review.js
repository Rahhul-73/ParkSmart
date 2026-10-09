/**
 * ══════════════════════════════════════════════════════════════
 *  Review Model — ParkSmart Schema
 * ══════════════════════════════════════════════════════════════
 *
 *  Academic Mapping:
 *    PO3  — Design: Aggregation pipeline for live reputation metrics
 *    PO6  — Engineer & Society: User feedback loop on safety, cleanliness & EV uptime
 *    SDG 11 — Sustainable Cities: Community-driven rating of urban infrastructure
 */

const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    lotId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ParkingLot',
      required: [true, 'Parking Lot ID is required'],
      index: true,
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1 star'],
      max: [5, 'Rating cannot exceed 5 stars'],
    },
    comment: {
      type: String,
      trim: true,
      maxlength: [1000, 'Review comment cannot exceed 1000 characters'],
    },
    images: [
      {
        type: String,
        trim: true,
      },
    ],
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

// Prevent duplicate reviews: 1 user can only review a specific parking lot once
reviewSchema.index({ lotId: 1, userId: 1 }, { unique: true });

// Fast sorting by lot and latest reviews
reviewSchema.index({ lotId: 1, createdAt: -1 });

// ═══════════════════════════════════════════
//  STATIC METHODS: Live Rating Aggregation
// ═══════════════════════════════════════════

/**
 * Calculates average rating and reviews count for a parking lot
 * and automatically updates the ParkingLot document
 */
reviewSchema.statics.calculateAverageRating = async function (lotId) {
  const stats = await this.aggregate([
    {
      $match: { lotId: new mongoose.Types.ObjectId(lotId) },
    },
    {
      $group: {
        _id: '$lotId',
        reviewsCount: { $sum: 1 },
        averageRating: { $avg: '$rating' },
      },
    },
  ]);

  const ParkingLot = mongoose.model('ParkingLot');

  if (stats.length > 0) {
    await ParkingLot.findByIdAndUpdate(lotId, {
      rating: Math.round(stats[0].averageRating * 10) / 10,
      reviewsCount: stats[0].reviewsCount,
    });
  } else {
    // Reset if all reviews were deleted
    await ParkingLot.findByIdAndUpdate(lotId, {
      rating: 0,
      reviewsCount: 0,
    });
  }
};

// ─── Post-save Hook: Recalculate rating on create or update ───
reviewSchema.post('save', async function () {
  await this.constructor.calculateAverageRating(this.lotId);
});

// ─── Post-remove / Post-delete Hook ───
reviewSchema.post('findOneAndDelete', async function (doc) {
  if (doc) {
    await doc.constructor.calculateAverageRating(doc.lotId);
  }
});

module.exports = mongoose.model('Review', reviewSchema);
