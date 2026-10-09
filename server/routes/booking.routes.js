const router = require('express').Router();
const {
  createBooking, getMyBookings, getBooking, cancelBooking, checkIn, checkOut,
} = require('../controllers/booking.controller');
const { protect } = require('../middleware/auth');

router.post('/', protect, createBooking);
router.get('/my', protect, getMyBookings);
router.get('/:id', protect, getBooking);
router.patch('/:id/cancel', protect, cancelBooking);
router.patch('/:id/checkin', protect, checkIn);
router.patch('/:id/checkout', protect, checkOut);

module.exports = router;
