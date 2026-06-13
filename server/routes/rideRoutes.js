const express = require('express');
const router = express.Router();
const { 
  startRide, trackRide, endRide, getMyRides, 
  getRides, getStats, getLeaderboard, rateRide, getRecentFeedback 
} = require('../controllers/rideController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/stats', protect, admin, getStats);
router.get('/feedback', protect, admin, getRecentFeedback);
router.get('/leaderboard', protect, getLeaderboard);
router.post('/start', protect, startRide);
router.post('/track', protect, trackRide);
router.post('/end', protect, endRide);
router.post('/:id/rate', protect, rateRide);
router.route('/myrides').get(protect, getMyRides);
router.route('/').get(protect, admin, getRides);

module.exports = router;
