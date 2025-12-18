// server/routes/auth.js

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

// Register route
router.post('/register', async (req, res) => {
  try {
    console.log("Registration request received:", req.body);
    const { name, email, password } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      console.log("Missing required fields:", { name, email, password: password ? "provided" : "missing" });
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log("User already exists:", email);
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    const newUser = new User({
      name,
      email,
      password
    });

    console.log("Saving new user:", { name, email });
    await newUser.save();
    console.log("User saved successfully");

    // Check if JWT_SECRET is set
    if (!process.env.JWT_SECRET) {
      console.error("ERROR: JWT_SECRET is not set in environment variables");
      return res.status(500).json({ message: 'Server configuration error' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: newUser._id, email: newUser.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    console.log("JWT token generated successfully");
    res.status(201).json({ 
      message: 'User registered successfully',
      token,
      user: {
        name: newUser.name,
        email: newUser.email
      }
    });
  } catch (error) {
    console.error('Error during registration:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ message: 'Error during registration', error: error.message });
  }
});

// Login route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Compare the password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({ message: 'Login successful', token });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Error during login' });
  }
});

// Protected route to test middleware
router.get('/protected', (req, res) => {
  res.status(200).json({ message: 'Access granted to protected route' });
});

module.exports = router;
