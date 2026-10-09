/**
 * Parking Controller  (PO2 — Problem Analysis: Slot management)
 *
 * SDG 11 — Sustainable Cities: Real-time slot availability
 *          reduces traffic from drivers searching for parking.
 */
const ParkingSlot = require('../models/ParkingSlot');

// ─── Get all slots (with filters) ───
exports.getAllSlots = async (req, res, next) => {
  try {
    const { type, zone, floor, status, features } = req.query;
    const filter = { isActive: true };

    if (type) filter.type = type;
    if (zone) filter.zone = zone.toUpperCase();
    if (floor !== undefined) filter.floor = parseInt(floor);
    if (status) filter.status = status;
    if (features) filter.features = { $all: features.split(',') };

    const slots = await ParkingSlot.find(filter).sort({ zone: 1, floor: 1, slotNumber: 1 });

    res.status(200).json({
      success: true,
      count: slots.length,
      data: { slots },
    });
  } catch (error) {
    next(error);
  }
};

// ─── Get single slot ───
exports.getSlot = async (req, res, next) => {
  try {
    const slot = await ParkingSlot.findById(req.params.id).populate('currentBooking');
    if (!slot) {
      return res.status(404).json({ success: false, message: 'Slot not found' });
    }
    res.status(200).json({ success: true, data: { slot } });
  } catch (error) {
    next(error);
  }
};

// ─── Create slot (Admin) ───
exports.createSlot = async (req, res, next) => {
  try {
    const slot = await ParkingSlot.create(req.body);
    res.status(201).json({ success: true, message: 'Slot created', data: { slot } });
  } catch (error) {
    next(error);
  }
};

// ─── Update slot (Admin) ───
exports.updateSlot = async (req, res, next) => {
  try {
    const slot = await ParkingSlot.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!slot) {
      return res.status(404).json({ success: false, message: 'Slot not found' });
    }
    res.status(200).json({ success: true, message: 'Slot updated', data: { slot } });
  } catch (error) {
    next(error);
  }
};

// ─── Delete slot (Admin) ───
exports.deleteSlot = async (req, res, next) => {
  try {
    const slot = await ParkingSlot.findByIdAndDelete(req.params.id);
    if (!slot) {
      return res.status(404).json({ success: false, message: 'Slot not found' });
    }
    res.status(200).json({ success: true, message: 'Slot deleted' });
  } catch (error) {
    next(error);
  }
};

// ─── Get slot availability summary ───
exports.getAvailabilitySummary = async (req, res, next) => {
  try {
    const summary = await ParkingSlot.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const zoneSummary = await ParkingSlot.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: { zone: '$zone', status: '$status' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.zone': 1 } },
    ]);

    res.status(200).json({
      success: true,
      data: { summary, zoneSummary },
    });
  } catch (error) {
    next(error);
  }
};
