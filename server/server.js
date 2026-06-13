require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const seedDatabase = require('./utils/seeder');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Connect to database and seed
connectDB().then(() => {
  seedDatabase();
});

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Basic route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Routes mapping
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/bicycles', require('./routes/bicycleRoutes'));
app.use('/api/stations', require('./routes/stationRoutes'));
app.use('/api/rides', require('./routes/rideRoutes'));
app.use('/api/issues', require('./routes/issueRoutes'));

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
