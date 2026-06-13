const Issue = require('../models/Issue');
const Bicycle = require('../models/Bicycle');

// @desc    Report an issue
// @route   POST /api/issues
// @access  Private (Student)
const reportIssue = async (req, res) => {
  try {
    const { bicycleId, issueType, description } = req.body;
    
    const bicycle = await Bicycle.findById(bicycleId);
    if (!bicycle) {
      return res.status(404).json({ message: 'Bicycle not found' });
    }

    if (bicycle.status === 'riding') {
      return res.status(400).json({ message: 'Cannot report an issue while the bike is currently being ridden by someone.' });
    }

    const issue = await Issue.create({
      bicycle: bicycleId,
      reportedBy: req.user._id,
      issueType,
      description
    });

    // Take the bike offline
    bicycle.status = 'maintenance';
    await bicycle.save();

    res.status(201).json(issue);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all issues
// @route   GET /api/issues
// @access  Private/Admin
const getIssues = async (req, res) => {
  try {
    const issues = await Issue.find({})
      .populate({
        path: 'bicycle',
        select: 'bikeId bicycleName station status',
        populate: { path: 'station', select: 'stationName' }
      })
      .populate('reportedBy', 'name rollNumber email')
      .sort({ createdAt: -1 });
      
    res.json(issues);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Resolve an issue
// @route   PUT /api/issues/:id/resolve
// @access  Private/Admin
const resolveIssue = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    issue.status = 'resolved';
    await issue.save();

    // Check if there are other pending issues for this bike
    const pendingIssues = await Issue.countDocuments({ bicycle: issue.bicycle, status: 'pending' });
    
    // If no other pending issues, make the bike available again
    if (pendingIssues === 0) {
      const bicycle = await Bicycle.findById(issue.bicycle);
      if (bicycle && bicycle.status === 'maintenance') {
        bicycle.status = 'available';
        await bicycle.save();
      }
    }

    const updatedIssue = await Issue.findById(issue._id)
      .populate({
        path: 'bicycle',
        select: 'bikeId bicycleName station status',
        populate: { path: 'station', select: 'stationName' }
      })
      .populate('reportedBy', 'name rollNumber email');

    res.json(updatedIssue);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { reportIssue, getIssues, resolveIssue };
