const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const UserData = require('../models/UserData');

const auth = (req, res, next) => {
  const token = req.header('x-auth-token');
  if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

router.get('/', auth, async (req, res) => {
  try {
    let data = await UserData.findOne({ user: req.user.id });
    if (!data) {
      data = new UserData({ user: req.user.id });
      await data.save();
    }
    res.json(data);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const updates = req.body;
    let data = await UserData.findOne({ user: req.user.id });
    if (!data) {
      data = new UserData({ user: req.user.id, ...updates });
    } else {
      data = await UserData.findOneAndUpdate(
        { user: req.user.id },
        { $set: updates },
        { new: true }
      );
    }
    await data.save();
    res.json(data);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
