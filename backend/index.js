const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const collectionsRoutes = require('./routes/collections');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: 'http://localhost:5173', 
  credentials: true
}));
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
  autoIndex: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => {
  console.error('Error connecting to MongoDB:', err);
  console.error('MongoDB URI:', process.env.MONGODB_URI);
  process.exit(1);
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/collections', collectionsRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error handler:');
  console.error(err);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
