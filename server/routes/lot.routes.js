/**
 * ══════════════════════════════════════════════════════════════
 *  Parking Lot Routes (/api/lots)
 * ══════════════════════════════════════════════════════════════
 */

const router = require('express').Router();
const {
  getAllLots,
  getNearbyLots,
  getLotById,
  createLot,
  updateLot,
  deleteLot,
} = require('../controllers/lot.controller');
const { verifyToken } = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/roleMiddleware');
const { validateCreateLot } = require('../middleware/validate');
const upload = require('../middleware/upload');

// Public endpoints
router.get('/', getAllLots);
router.get('/nearby', getNearbyLots);
router.get('/:id', getLotById);

// Admin-only management endpoints
router.post('/', verifyToken, requireAdmin, upload.array('images', 5), validateCreateLot, createLot);
router.patch('/:id', verifyToken, requireAdmin, upload.array('images', 5), updateLot);
router.delete('/:id', verifyToken, requireAdmin, deleteLot);

module.exports = router;
