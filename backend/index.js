const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const collectionsRoutes = require('./routes/collections');
const testimonialRoutes = require('./routes/testimonials');
const profileRoutes = require('./routes/profiles');
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Configure CORS to allow both public and authenticated requests
app.use(cors({
  origin: '*',  // Allow all origins
  methods: ['GET', 'POST', 'PUT', 'DELETE'],  // Allow all necessary methods
  allowedHeaders: ['Content-Type', 'Authorization'],  // Allow Authorization header
  credentials: true  // Allow credentials
}));

app.use(express.json());


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
app.use('/api/testimonials', testimonialRoutes);

app.use('/api/profile', profileRoutes);
app.use((err, req, res, next) => {
  console.error('Global error handler:');
  console.error(err);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
const url = `https://testify-5dye.onrender.com/`;
const interval = 300000; 


app.get('/keep-alive', (req, res) => {
    res.status(200).send('Server is alive');
});


const keepAliveInterval = 5 * 60 * 1000; // 5 minutes

function keepAlive() {
    fetch(url + 'keep-alive')
        .then(response => console.log('Keep-alive response:', response.status))
        .catch(error => console.error('Keep-alive error:', error));
}

setInterval(keepAlive, keepAliveInterval);

