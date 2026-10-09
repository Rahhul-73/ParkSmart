const router = require('express').Router();
const {
  getDashboardStats, getAllUsers, getAllBookings, toggleUserStatus,
} = require('../controllers/admin.controller');
const { protect, authorize } = require('../middleware/auth');

// All admin routes require auth + admin role
router.use(protect, authorize('admin'));

router.get('/dashboard', getDashboardStats);
router.get('/users', getAllUsers);
router.get('/bookings', getAllBookings);
router.patch('/users/:id/toggle-status', toggleUserStatus);

module.exports = router;
