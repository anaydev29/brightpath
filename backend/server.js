const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const dataRoutes = require('./routes/data');
const adminRoutes = require('./routes/admin');
const aiRoutes = require('./routes/ai');
const communityRoutes = require('./routes/community');


const app = express();

// INCREASE PAYLOAD LIMIT FOR SCREENSHOT UPLOADS (Base64 is huge)
app.use(express.json({ limit: '10mb' }));
app.use(cors());

// Check for MONGO_URI
if (!process.env.MONGO_URI || process.env.MONGO_URI.includes('<username>')) {
  console.warn("⚠️ WARNING: MONGO_URI is not set properly in .env!");
} else {
  mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ MongoDB Connected'))
    .catch(err => console.error('❌ MongoDB Connection Error:', err));
}

app.use('/api/auth', authRoutes);
app.use('/api/data', dataRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/community', communityRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
