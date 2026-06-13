const Ride = require('../models/Ride');
const Bicycle = require('../models/Bicycle');

// Haversine formula — calculates distance in km between two GPS points
const haversineKm = (coord1, coord2) => {
  const R = 6371;
  const dLat = (coord2.lat - coord1.lat) * Math.PI / 180;
  const dLon = (coord2.lng - coord1.lng) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(coord1.lat * Math.PI / 180) *
    Math.cos(coord2.lat * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

// Sums distance across all GPS breadcrumbs
const calcTotalDistanceKm = (coordinates) => {
  if (!coordinates || coordinates.length < 2) return 0;
  let total = 0;
  for (let i = 1; i < coordinates.length; i++) {
    total += haversineKm(coordinates[i - 1], coordinates[i]);
  }
  return Math.round(total * 100) / 100; // 2 decimal places
};

// @desc    Book and start a ride
// @route   POST /api/rides/start
// @access  Private
const startRide = async (req, res) => {
  try {
    const { bikeId, destinationStationId } = req.body;
    
    // Check if user already has an active ride
    const activeRide = await Ride.findOne({ userId: req.user._id, status: 'active' });
    if (activeRide) {
      return res.status(400).json({ message: 'You already have an active ride' });
    }

    const bicycle = await Bicycle.findById(bikeId);
    if (!bicycle) {
      return res.status(404).json({ message: 'Bicycle not found' });
    }

    if (bicycle.status !== 'available') {
      return res.status(400).json({ message: 'Bicycle is not available' });
    }

    // Update bike status
    bicycle.status = 'riding';
    await bicycle.save();

    // Create ride
    const ride = new Ride({
      userId: req.user._id,
      bikeId: bicycle._id,
      destinationStation: destinationStationId
    });
    const createdRide = await ride.save();

    res.status(201).json(createdRide);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Track a GPS coordinate during an active ride
// @route   POST /api/rides/track
// @access  Private
const trackRide = async (req, res) => {
  try {
    const { rideId, lat, lng } = req.body;

    if (!rideId || lat === undefined || lng === undefined) {
      return res.status(400).json({ message: 'rideId, lat and lng are required' });
    }

    const ride = await Ride.findById(rideId);
    if (!ride) return res.status(404).json({ message: 'Ride not found' });

    if (ride.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    if (ride.status !== 'active') {
      return res.status(400).json({ message: 'Ride is not active' });
    }

    ride.coordinates.push({ lat, lng, timestamp: new Date() });
    await ride.save();

    // Return live distance calculated so far
    const liveDistanceKm = calcTotalDistanceKm(ride.coordinates);
    res.json({ success: true, liveDistanceKm, totalPoints: ride.coordinates.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    End a ride
// @route   POST /api/rides/end
// @access  Private
const endRide = async (req, res) => {
  try {
    const { rideId, returnStationId } = req.body;

    const ride = await Ride.findById(rideId);
    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    if (ride.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized to end this ride' });
    }

    if (ride.status !== 'active') {
      return res.status(400).json({ message: 'Ride is already completed or cancelled' });
    }

    // Update ride
    ride.endTime = Date.now();
    ride.status = 'completed';
    ride.duration = Math.round((ride.endTime - ride.startTime) / 60000);

    // Calculate real distance from GPS coordinates
    ride.distanceKm = calcTotalDistanceKm(ride.coordinates);

    await ride.save();

    // Update bike status
    const bicycle = await Bicycle.findById(ride.bikeId);
    if (bicycle) {
      bicycle.status = 'available';
      await bicycle.save();
    }

    res.json(ride);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user rides
// @route   GET /api/rides/myrides
// @access  Private
const getMyRides = async (req, res) => {
  try {
    const rides = await Ride.find({ userId: req.user._id })
      .populate({
        path: 'bikeId',
        select: 'bikeId bicycleName station',
        populate: {
          path: 'station',
          select: 'stationName'
        }
      })
      .populate('destinationStation', 'stationName')
      .sort({ startTime: -1 });
    res.json(rides);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all rides
// @route   GET /api/rides
// @access  Private/Admin
const getRides = async (req, res) => {
  try {
    const rides = await Ride.find({})
      .populate('userId', 'name rollNumber')
      .populate('bikeId', 'bikeId bicycleName')
      .sort({ startTime: -1 });
    res.json(rides);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get dashboard stats
// @route   GET /api/rides/stats
// @access  Private/Admin
const getStats = async (req, res) => {
  try {
    const totalBicycles = await Bicycle.countDocuments({});
    const availableBicycles = await Bicycle.countDocuments({ status: 'available' });
    const activeRides = await Ride.countDocuments({ status: 'active' });
    const totalUsers = await require('../models/User').countDocuments({ role: 'student' });

    res.json({
      totalBicycles,
      availableBicycles,
      activeRides,
      totalUsers
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get leaderboard (ranked by eco points = total ride minutes, includes real distance)
// @route   GET /api/rides/leaderboard
// @access  Private
const getLeaderboard = async (req, res) => {
  try {
    const leaderboard = await Ride.aggregate([
      { $match: { status: 'completed', duration: { $exists: true, $gt: 0 } } },
      {
        $group: {
          _id: '$userId',
          totalMinutes: { $sum: '$duration' },
          totalRides: { $sum: 1 },
          totalDistanceKm: { $sum: '$distanceKm' }
        }
      },
      { $sort: { totalMinutes: -1 } },
      { $limit: 20 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $project: {
          _id: 0,
          userId: '$_id',
          name: '$user.name',
          rollNumber: '$user.rollNumber',
          totalMinutes: 1,
          totalRides: 1,
          totalDistanceKm: { $round: ['$totalDistanceKm', 2] },
          ecoPoints: '$totalMinutes'
        }
      }
    ]);
    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Rate a completed ride
// @route   POST /api/rides/:id/rate
// @access  Private
const rateRide = async (req, res) => {
  try {
    const { rating, feedback } = req.body;
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Valid rating between 1 and 5 is required' });
    }

    const ride = await Ride.findById(req.params.id);
    if (!ride) return res.status(404).json({ message: 'Ride not found' });

    if (ride.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to rate this ride' });
    }

    if (ride.status !== 'completed') {
      return res.status(400).json({ message: 'Can only rate completed rides' });
    }

    if (ride.rating) {
      return res.status(400).json({ message: 'Ride has already been rated' });
    }

    ride.rating = rating;
    if (feedback) ride.feedback = feedback;

    await ride.save();
    res.json(ride);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get recent low-rated rides for admin
// @route   GET /api/rides/feedback
// @access  Private/Admin
const getRecentFeedback = async (req, res) => {
  try {
    const rides = await Ride.find({ rating: { $lte: 3 } }) // 3 stars or below
      .populate('userId', 'name')
      .populate('bikeId', 'bikeId bicycleName')
      .sort({ createdAt: -1 })
      .limit(10);
    res.json(rides);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { startRide, trackRide, endRide, getMyRides, getRides, getStats, getLeaderboard, rateRide, getRecentFeedback };
