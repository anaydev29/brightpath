const express = require('express');
const router = express.Router();
const User = require('../models/User');
const UserData = require('../models/UserData');
// Admin Auth Middleware
const adminAuth = (req, res, next) => {
  const adminSecret = process.env.ADMIN_SECRET || 'brightpath2026';
  const token = req.header('x-admin-token');
  if (token !== adminSecret) {
    return res.status(401).json({ msg: 'Unauthorized Admin Access' });
  }
  next();
};

// GET /api/admin/stats
router.get('/stats', adminAuth, async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    
    // Aggregate community posts directly from UserData
    const usersData = await UserData.find({}, 'community user');
    let allPosts = [];
    usersData.forEach(ud => {
      if(ud.community && ud.community.length > 0) {
        ud.community.forEach(p => {
          allPosts.push({ ...p, userId: ud.user });
        });
      }
    });
    
    allPosts.sort((a, b) => b.timestamp - a.timestamp);

    res.json({
      totalUsers: userCount,
      totalPosts: allPosts.length,
      posts: allPosts
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// DELETE /api/admin/community/:userId/:postId
router.delete('/community/:userId/:postId', adminAuth, async (req, res) => {
  try {
    const { userId, postId } = req.params;
    const userData = await UserData.findOne({ user: userId });
    
    if (!userData) {
      return res.status(404).json({ msg: 'User data not found' });
    }

    userData.community = userData.community.filter(p => p.id !== postId);
    await userData.save();

    res.json({ msg: 'Post securely deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});



module.exports = router;
