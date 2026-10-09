const router = require('express').Router();
const {
  getAllSlots, getSlot, createSlot, updateSlot, deleteSlot, getAvailabilitySummary,
} = require('../controllers/parking.controller');
const { protect, authorize } = require('../middleware/auth');

router.get('/slots', getAllSlots);
router.get('/slots/summary', getAvailabilitySummary);
router.get('/slots/:id', getSlot);
router.post('/slots', protect, authorize('admin'), createSlot);
router.put('/slots/:id', protect, authorize('admin'), updateSlot);
router.delete('/slots/:id', protect, authorize('admin'), deleteSlot);

module.exports = router;
