const router = require('express').Router();
const { protect } = require('../middleware/auth');

// User-specific routes can be extended here
// Currently profile is handled in auth routes
router.get('/profile', protect, (req, res) => {
  res.status(200).json({ success: true, data: { user: req.user } });
});

module.exports = router;
