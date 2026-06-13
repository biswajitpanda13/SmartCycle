const Bicycle = require('../models/Bicycle');
const Station = require('../models/Station');

// @desc    Get all bicycles
// @route   GET /api/bicycles
// @access  Private
const getBicycles = async (req, res) => {
  try {
    const bicycles = await Bicycle.find({}).populate('station', 'stationName location');
    res.json(bicycles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get bicycle by ID
// @route   GET /api/bicycles/:id
// @access  Private
const getBicycleById = async (req, res) => {
  try {
    const bicycle = await Bicycle.findById(req.params.id).populate('station', 'stationName location');
    if (bicycle) {
      res.json(bicycle);
    } else {
      res.status(404).json({ message: 'Bicycle not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a bicycle
// @route   POST /api/bicycles
// @access  Private/Admin
const createBicycle = async (req, res) => {
  try {
    const { bikeId, bicycleName, station } = req.body;
    
    const stationExists = await Station.findById(station);
    if (!stationExists) {
      return res.status(404).json({ message: 'Station not found' });
    }

    const bicycleExists = await Bicycle.findOne({ bikeId });
    if (bicycleExists) {
      return res.status(400).json({ message: 'Bicycle with this ID already exists' });
    }

    const bicycle = new Bicycle({ bikeId, bicycleName, station });
    const createdBicycle = await bicycle.save();

    // Increment station bike count
    stationExists.totalBikes += 1;
    await stationExists.save();

    res.status(201).json(createdBicycle);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a bicycle
// @route   PUT /api/bicycles/:id
// @access  Private/Admin
const updateBicycle = async (req, res) => {
  try {
    const { bicycleName, station, status } = req.body;
    const bicycle = await Bicycle.findById(req.params.id);

    if (bicycle) {
      if (station && station !== bicycle.station.toString()) {
        const oldStation = await Station.findById(bicycle.station);
        if (oldStation) {
          oldStation.totalBikes -= 1;
          await oldStation.save();
        }
        const newStation = await Station.findById(station);
        if (newStation) {
          newStation.totalBikes += 1;
          await newStation.save();
        }
        bicycle.station = station;
      }
      
      bicycle.bicycleName = bicycleName || bicycle.bicycleName;
      bicycle.status = status || bicycle.status;

      const updatedBicycle = await bicycle.save();
      res.json(updatedBicycle);
    } else {
      res.status(404).json({ message: 'Bicycle not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a bicycle
// @route   DELETE /api/bicycles/:id
// @access  Private/Admin
const deleteBicycle = async (req, res) => {
  try {
    const bicycle = await Bicycle.findById(req.params.id);

    if (bicycle) {
      const station = await Station.findById(bicycle.station);
      if (station) {
        station.totalBikes -= 1;
        await station.save();
      }
      await bicycle.deleteOne();
      res.json({ message: 'Bicycle removed' });
    } else {
      res.status(404).json({ message: 'Bicycle not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getBicycles, getBicycleById, createBicycle, updateBicycle, deleteBicycle };
