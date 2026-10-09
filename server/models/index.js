/**
 * ══════════════════════════════════════════════════════════════
 *  Central Models Barrel Export — ParkSmart
 * ══════════════════════════════════════════════════════════════
 */

const User = require('./User');
const ParkingLot = require('./ParkingLot');
const Slot = require('./Slot');
const Reservation = require('./Reservation');
const Payment = require('./Payment');
const Review = require('./Review');

// Legacy backwards compatibility aliases
const ParkingSlot = require('./ParkingSlot');
const Booking = require('./Booking');

module.exports = {
  User,
  ParkingLot,
  Slot,
  Reservation,
  Payment,
  Review,
  ParkingSlot,
  Booking,
};
