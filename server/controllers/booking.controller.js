/**
 * Booking Controller  (PO2 — Problem Analysis: Reservation logic)
 *
 * SDG 11 — Sustainable Cities: Reservation system prevents
 *          over-crowding and enables predictable lot usage.
 * SDG 13 — Climate Action: Reducing idle time = lower emissions.
 */
const Booking = require('../models/Booking');
const ParkingSlot = require('../models/ParkingSlot');
const { sendBookingConfirmation } = require('../services/email.service');

// ─── Create booking ───
exports.createBooking = async (req, res, next) => {
  try {
    const { slotId, vehicleNumber, vehicleType, startTime, endTime } = req.body;

    // Check slot exists & is available
    const slot = await ParkingSlot.findById(slotId);
    if (!slot) {
      return res.status(404).json({ success: false, message: 'Parking slot not found' });
    }

    // Check for conflicting bookings
    const conflict = await Booking.findOne({
      slot: slotId,
      status: { $in: ['pending', 'active'] },
      $or: [
        { startTime: { $lt: new Date(endTime) }, endTime: { $gt: new Date(startTime) } },
      ],
    });

    if (conflict) {
      return res.status(409).json({
        success: false,
        message: 'Slot is already booked for the requested time range',
      });
    }

    const booking = await Booking.create({
      user: req.user._id,
      slot: slotId,
      vehicleNumber,
      vehicleType,
      startTime,
      endTime,
    });

    // Update slot status
    await ParkingSlot.findByIdAndUpdate(slotId, { status: 'reserved' });

    // Populate for response
    const populatedBooking = await Booking.findById(booking._id)
      .populate('slot', 'slotNumber zone floor type pricePerHour')
      .populate('user', 'name email');

    // Send confirmation email (non-blocking)
    sendBookingConfirmation(req.user.email, {
      slotNumber: slot.slotNumber,
      startTime,
      endTime,
      totalAmount: booking.totalAmount,
      vehicleNumber,
    });

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: { booking: populatedBooking },
    });
  } catch (error) {
    next(error);
  }
};

// ─── Get user's bookings ───
exports.getMyBookings = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const filter = { user: req.user._id };
    if (status) filter.status = status;

    const bookings = await Booking.find(filter)
      .populate('slot', 'slotNumber zone floor type pricePerHour features')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Booking.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: {
        bookings,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── Get single booking ───
exports.getBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('slot')
      .populate('user', 'name email phone');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Users can only see their own bookings (admins can see all)
    if (req.user.role !== 'admin' && booking.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.status(200).json({ success: true, data: { booking } });
  } catch (error) {
    next(error);
  }
};

// ─── Cancel booking ───
exports.cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (req.user.role !== 'admin' && booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (['completed', 'cancelled'].includes(booking.status)) {
      return res.status(400).json({ success: false, message: `Booking is already ${booking.status}` });
    }

    booking.status = 'cancelled';
    await booking.save();

    // Free up the slot
    await ParkingSlot.findByIdAndUpdate(booking.slot, { status: 'available' });

    res.status(200).json({ success: true, message: 'Booking cancelled', data: { booking } });
  } catch (error) {
    next(error);
  }
};

// ─── Check in ───
exports.checkIn = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    booking.status = 'active';
    booking.checkInTime = new Date();
    await booking.save();

    await ParkingSlot.findByIdAndUpdate(booking.slot, { status: 'occupied' });

    res.status(200).json({ success: true, message: 'Checked in', data: { booking } });
  } catch (error) {
    next(error);
  }
};

// ─── Check out ───
exports.checkOut = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    booking.status = 'completed';
    booking.checkOutTime = new Date();
    booking.paymentStatus = 'paid';
    await booking.save();

    await ParkingSlot.findByIdAndUpdate(booking.slot, { status: 'available' });

    res.status(200).json({ success: true, message: 'Checked out', data: { booking } });
  } catch (error) {
    next(error);
  }
};
