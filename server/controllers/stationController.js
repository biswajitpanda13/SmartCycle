const Station = require('../models/Station');
const Bicycle = require('../models/Bicycle');

// @desc    Get all stations
// @route   GET /api/stations
// @access  Private
const getStations = async (req, res) => {
  try {
    const stations = await Station.find({});
    // Attach available bikes count
    const stationsWithCounts = await Promise.all(stations.map(async (station) => {
      const availableBikes = await Bicycle.countDocuments({ station: station._id, status: 'available' });
      return { ...station._doc, availableBikes };
    }));
    res.json(stationsWithCounts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get station by ID
// @route   GET /api/stations/:id
// @access  Private
const getStationById = async (req, res) => {
  try {
    const station = await Station.findById(req.params.id);
    if (station) {
      const availableBikes = await Bicycle.countDocuments({ station: station._id, status: 'available' });
      res.json({ ...station._doc, availableBikes });
    } else {
      res.status(404).json({ message: 'Station not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a station
// @route   POST /api/stations
// @access  Private/Admin
const createStation = async (req, res) => {
  try {
    const { stationName, location } = req.body;
    
    const stationExists = await Station.findOne({ stationName });
    if (stationExists) {
      return res.status(400).json({ message: 'Station already exists' });
    }

    const station = new Station({ stationName, location });
    const createdStation = await station.save();

    res.status(201).json(createdStation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a station
// @route   PUT /api/stations/:id
// @access  Private/Admin
const updateStation = async (req, res) => {
  try {
    const { stationName, location } = req.body;
    const station = await Station.findById(req.params.id);

    if (station) {
      station.stationName = stationName || station.stationName;
      station.location = location || station.location;

      const updatedStation = await station.save();
      res.json(updatedStation);
    } else {
      res.status(404).json({ message: 'Station not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a station
// @route   DELETE /api/stations/:id
// @access  Private/Admin
const deleteStation = async (req, res) => {
  try {
    const station = await Station.findById(req.params.id);

    if (station) {
      // Check if there are bikes at this station
      const bikesCount = await Bicycle.countDocuments({ station: station._id });
      if (bikesCount > 0) {
        return res.status(400).json({ message: 'Cannot delete station with assigned bicycles. Move them first.' });
      }
      await station.deleteOne();
      res.json({ message: 'Station removed' });
    } else {
      res.status(404).json({ message: 'Station not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getStations, getStationById, createStation, updateStation, deleteStation };
