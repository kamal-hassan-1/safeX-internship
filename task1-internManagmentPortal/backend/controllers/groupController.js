const Group = require('../models/Group');
const Candidate = require('../models/Candidate');

// @desc    Get all groups
// @route   GET /api/groups
// @access  Public
exports.getGroups = async (req, res) => {
  try {
    const groups = await Group.find();
    // For each group, let's fetch candidate count or candidates
    const groupsWithCandidates = await Promise.all(groups.map(async (group) => {
      const candidates = await Candidate.find({ group: group._id });
      return {
        ...group._doc,
        candidates
      };
    }));

    res.status(200).json({
      success: true,
      count: groupsWithCandidates.length,
      data: groupsWithCandidates
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get single group
// @route   GET /api/groups/:id
// @access  Public
exports.getGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }

    const candidates = await Candidate.find({ group: group._id });

    res.status(200).json({
      success: true,
      data: {
        ...group._doc,
        candidates
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Create new group
// @route   POST /api/groups
// @access  Public
exports.createGroup = async (req, res) => {
  try {
    const group = await Group.create(req.body);
    res.status(201).json({
      success: true,
      data: group
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Group name already exists'
      });
    }
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update group
// @route   PUT /api/groups/:id
// @access  Public
exports.updateGroup = async (req, res) => {
  try {
    const group = await Group.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }

    res.status(200).json({
      success: true,
      data: group
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete group
// @route   DELETE /api/groups/:id
// @access  Public
exports.deleteGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }

    // Set group reference of candidates in this group to null
    await Candidate.updateMany({ group: group._id }, { group: null });

    await group.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Group deleted and associated candidates unassigned'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
