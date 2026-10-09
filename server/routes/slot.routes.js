/**
 * ══════════════════════════════════════════════════════════════
 *  Slot Routes (/api/slots)
 * ══════════════════════════════════════════════════════════════
 */

const router = require('express').Router();
const {
  getSlotsByLot,
  createSlot,
  updateSlotStatus,
} = require('../controllers/slot.controller');
const { verifyToken } = require('../middleware/authMiddleware');
const { requireAdmin, requireOperatorOrAdmin } = require('../middleware/roleMiddleware');
const { validateCreateSlot } = require('../middleware/validate');

// Public live slot availability
router.get('/lot/:lotId', getSlotsByLot);

// Slot administrative endpoints
router.post('/', verifyToken, requireAdmin, validateCreateSlot, createSlot);
router.patch('/:id/status', verifyToken, requireOperatorOrAdmin, updateSlotStatus);

module.exports = router;
