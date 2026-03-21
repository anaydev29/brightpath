const mongoose = require('mongoose');

const UserDataSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  moods: { type: Array, default: [] },
  journal: { type: Array, default: [] },
  badges: { type: Array, default: [] },
  habits: { type: Array, default: [] },
  community: { type: Array, default: [] },
  streak: { type: Number, default: 0 },
  posStreak: { type: Number, default: 0 },
  points: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  settings: { type: Object, default: {} }
});

module.exports = mongoose.model('UserData', UserDataSchema);
