import User from '../models/User.js';

// @desc    Get total registered users count
// @route   GET /api/stats/users
// @access  Public
export const getTotalUsers = async (req, res) => {
  try {
    const count = await User.countDocuments();
    res.json({ total: count });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user stats' });
  }
};
