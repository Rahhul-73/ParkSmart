/**
 * ══════════════════════════════════════════════════════════════
 *  Payment Model — ParkSmart Schema
 * ══════════════════════════════════════════════════════════════
 *
 *  Academic Mapping:
 *    PO3  — Design: Secure transaction state machine
 *    PO6  — Engineer & Society: Audit trails and financial transaction safety
 *    PSO2 — Software Engineering: Non-repudiation with unique transactionId
 *    SDG 11 — Sustainable Cities: Contactless automated smart tolling
 */

const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    reservationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Reservation',
      required: [true, 'Reservation ID is required'],
      index: true,
    },
    amount: {
      type: Number,
      required: [true, 'Payment amount is required'],
      min: [0, 'Amount cannot be negative'],
    },
    currency: {
      type: String,
      default: 'INR',
    },
    method: {
      type: String,
      enum: {
        values: ['wallet', 'card', 'upi'],
        message: '{VALUE} is not a supported payment method',
      },
      required: [true, 'Payment method is required'],
    },
    status: {
      type: String,
      enum: {
        values: ['pending', 'completed', 'failed', 'refunded'],
        message: '{VALUE} is not a valid payment status',
      },
      default: 'pending',
      index: true,
    },
    transactionId: {
      type: String,
      required: [true, 'Transaction reference ID is required'],
      unique: true,
      trim: true,
      index: true,
    },
    invoiceUrl: {
      type: String,
      trim: true,
    },
    refundDetails: {
      refundId: String,
      reason: String,
      refundedAt: Date,
      amount: Number,
    },
    metadata: {
      type: Map,
      of: String,
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
paymentSchema.index({ userId: 1, createdAt: -1 });
paymentSchema.index({ status: 1, method: 1 });

// ─── Virtuals ───
paymentSchema.virtual('isSuccessful').get(function () {
  return this.status === 'completed';
});

module.exports = mongoose.model('Payment', paymentSchema);
