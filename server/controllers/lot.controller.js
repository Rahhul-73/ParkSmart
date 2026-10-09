/**
 * ══════════════════════════════════════════════════════════════
 *  Parking Lot Controller (PO3 — Design, SDG 11 — Sustainable Cities)
 * ══════════════════════════════════════════════════════════════
 */

const { ParkingLot } = require('../models');

// ─── GET /api/lots (Filters & Pagination) ───
exports.getAllLots = async (req, res, next) => {
  try {
    const {
      city,
      minPrice,
      maxPrice,
      hasAvailable,
      amenities,
      search,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    const filter = { isActive: true };

    if (city) {
      filter['address.city'] = { $regex: new RegExp(city, 'i') };
    }

    if (minPrice || maxPrice) {
      filter.pricePerHour = {};
      if (minPrice) filter.pricePerHour.$gte = parseFloat(minPrice);
      if (maxPrice) filter.pricePerHour.$lte = parseFloat(maxPrice);
    }

    if (hasAvailable === 'true') {
      filter.availableSlots = { $gt: 0 };
    }

    if (amenities) {
      filter.amenities = { $all: amenities.split(',') };
    }

    if (search) {
      filter.$text = { $search: search };
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const sortOption = {};
    sortOption[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [lots, total] = await Promise.all([
      ParkingLot.find(filter)
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum),
      ParkingLot.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: {
        lots,
        pagination: {
          total,
          page: pageNum,
          pages: Math.ceil(total / limitNum),
          limit: limitNum,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/lots/nearby?lat=&lng=&radius= (Geospatial 2dsphere) ───
exports.getNearbyLots = async (req, res, next) => {
  try {
    const { lat, lng, radius = 5000 } = req.query; // radius in meters (default 5km)

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: 'Both latitude (lat) and longitude (lng) are required',
      });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    const maxDistanceMeters = parseFloat(radius);

    // MongoDB 2dsphere $near query
    const nearbyLots = await ParkingLot.find({
      isActive: true,
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [longitude, latitude], // GeoJSON order: [lng, lat]
          },
          $maxDistance: maxDistanceMeters,
        },
      },
    }).limit(20);

    res.status(200).json({
      success: true,
      count: nearbyLots.length,
      data: { lots: nearbyLots },
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/lots/:id ───
exports.getLotById = async (req, res, next) => {
  try {
    const lot = await ParkingLot.findById(req.params.id)
      .populate('slots')
      .populate({
        path: 'reviews',
        populate: { path: 'userId', select: 'name avatar' },
      });

    if (!lot) {
      return res.status(404).json({
        success: false,
        message: 'Parking lot not found',
      });
    }

    res.status(200).json({
      success: true,
      data: { lot },
    });
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/lots (Admin only) ───
exports.createLot = async (req, res, next) => {
  try {
    const lotData = { ...req.body };

    // Set availableSlots initially to totalSlots if not specified
    if (lotData.availableSlots === undefined) {
      lotData.availableSlots = lotData.totalSlots;
    }

    // Handle uploaded images if any
    if (req.files && req.files.length > 0) {
      lotData.images = req.files.map((f) => `/uploads/${f.filename}`);
    }

    const lot = await ParkingLot.create(lotData);

    res.status(201).json({
      success: true,
      message: 'Parking lot created successfully',
      data: { lot },
    });
  } catch (error) {
    next(error);
  }
};

// ─── PATCH /api/lots/:id (Admin only) ───
exports.updateLot = async (req, res, next) => {
  try {
    const updateData = { ...req.body };

    if (req.files && req.files.length > 0) {
      const newImages = req.files.map((f) => `/uploads/${f.filename}`);
      updateData.$push = { images: { $each: newImages } };
    }

    const lot = await ParkingLot.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!lot) {
      return res.status(404).json({
        success: false,
        message: 'Parking lot not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Parking lot updated successfully',
      data: { lot },
    });
  } catch (error) {
    next(error);
  }
};

// ─── DELETE /api/lots/:id (Admin only - soft delete) ───
exports.deleteLot = async (req, res, next) => {
  try {
    const lot = await ParkingLot.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!lot) {
      return res.status(404).json({
        success: false,
        message: 'Parking lot not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Parking lot deactivated successfully',
    });
  } catch (error) {
    next(error);
  }
};
