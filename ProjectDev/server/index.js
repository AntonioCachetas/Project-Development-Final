// server/index.js


require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Check if JWT_SECRET is set
if (!process.env.JWT_SECRET) {
  console.error("ERROR: JWT_SECRET is not set in environment variables");
} else {
  console.log("JWT_SECRET is set");
}

app.use(express.json());
app.use(cors());

// Connect to MongoDB
console.log("Attempting to connect to MongoDB with URI:", process.env.MONGO_URI);
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("Connected to MongoDB"))
.catch(err => {
  console.error("MongoDB connection error:", err);
  console.error("Error details:", err.message);
});


app.get('/', (req, res) => {
  res.send("Server is running");
});

// Import routes
const helpRequests = require('./routes/HelpRequest');
const posts = require('./routes/Posts');
const notifications = require('./routes/Notifications');
const ratings = require('./routes/Ratings');
const users = require('./routes/Users');

// Use routes
app.use('/help-requests', helpRequests);
app.use('/posts', posts);
app.use('/notifications', notifications);
app.use('/ratings', ratings);
app.use('/users', users);

const authRoutes = require('./routes/auth');
app.use('/auth', authRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
