const express = require('express');
const router = express.Router();
const UserData = require('../models/UserData');

// GET /api/community
router.get('/', async (req, res) => {
  try {
    const usersData = await UserData.find({}, 'community');
    let allPosts = [];
    usersData.forEach(ud => {
      if(ud.community && ud.community.length > 0) {
        ud.community.forEach(p => {
          allPosts.push({
            text: p.text,
            ts: p.ts || p.timestamp
          });
        });
      }
    });
    
    // Sort descending by timestamp (ts)
    allPosts.sort((a, b) => b.ts - a.ts);
    
    // Return top 50 recent posts to avoid huge payloads
    res.json(allPosts.slice(0, 50));
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
