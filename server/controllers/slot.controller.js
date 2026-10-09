/**
 * ══════════════════════════════════════════════════════════════
 *  Slot Controller (PO2 — Conflict Checking, PO3 — Slot Operations)
 * ══════════════════════════════════════════════════════════════
 */

const { Slot, Reservation, ParkingLot } = require('../models');

// ─── GET /api/slots/lot/:lotId?startTime=&endTime= ───
exports.getSlotsByLot = async (req, res, next) => {
  try {
    const { lotId } = req.params;
    const { startTime, endTime, type, floor } = req.query;

    const filter = { lotId, isActive: true };
    if (type) filter.type = type;
    if (floor !== undefined) filter.floor = parseInt(floor, 10);

    const allSlots = await Slot.find(filter).sort({ floor: 1, slotNumber: 1 });

    // If specific time range requested, compute exact real-time availability
    let bookedSlotIds = new Set();

    if (startTime && endTime) {
      const start = new Date(startTime);
      const end = new Date(endTime);

      const conflictingReservations = await Reservation.find({
        lotId,
        status: { $in: ['pending', 'active'] },
        $or: [
          { startTime: { $lt: end }, endTime: { $gt: start } },
        ],
      }).select('slotId');

      conflictingReservations.forEach((r) => bookedSlotIds.add(r.slotId.toString()));
    }

    // Map computed real-time status
    const slotsWithComputedStatus = allSlots.map((slot) => {
      const slotObj = slot.toObject();
      if (slot.status === 'maintenance') {
        slotObj.liveStatus = 'maintenance';
      } else if (bookedSlotIds.has(slot._id.toString())) {
        slotObj.liveStatus = 'reserved';
      } else {
        slotObj.liveStatus = slot.status;
      }
      return slotObj;
    });

    res.status(200).json({
      success: true,
      count: slotsWithComputedStatus.length,
      data: { slots: slotsWithComputedStatus },
    });
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/slots (Admin only) ───
exports.createSlot = async (req, res, next) => {
  try {
    const { lotId, slotNumber, floor, type, isEVCharging, coordinates, priceMultiplier } = req.body;

    const slot = await Slot.create({
      lotId,
      slotNumber,
      floor,
      type,
      isEVCharging: type === 'EV' ? true : isEVCharging,
      coordinates,
      priceMultiplier,
    });

    // Increment totalSlots and availableSlots in ParkingLot
    await ParkingLot.findByIdAndUpdate(lotId, {
      $inc: { totalSlots: 1, availableSlots: 1 },
    });

    res.status(201).json({
      success: true,
      message: 'Slot created successfully',
      data: { slot },
    });
  } catch (error) {
    next(error);
  }
};

// ─── PATCH /api/slots/:id/status (Admin / Operator) ───
exports.updateSlotStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!['available', 'reserved', 'occupied', 'maintenance'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid slot status value',
      });
    }

    const previousSlot = await Slot.findById(req.params.id);
    if (!previousSlot) {
      return res.status(404).json({
        success: false,
        message: 'Slot not found',
      });
    }

    const updatedSlot = await Slot.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    // Adjust lot available slots if transitioning to or from available
    if (previousSlot.status === 'available' && status !== 'available') {
      await ParkingLot.findByIdAndUpdate(updatedSlot.lotId, { $inc: { availableSlots: -1 } });
    } else if (previousSlot.status !== 'available' && status === 'available') {
      await ParkingLot.findByIdAndUpdate(updatedSlot.lotId, { $inc: { availableSlots: 1 } });
    }

    res.status(200).json({
      success: true,
      message: 'Slot status updated successfully',
      data: { slot: updatedSlot },
    });
  } catch (error) {
    next(error);
  }
};
