const express = require('express');
const router = express.Router();
const User = require('../models/User');
const HelpRequest = require('../models/HelpRequest');
const Post = require('../models/Post');
const Rating = require('../models/Rating');
const authMiddleware = require('../middleware/authMiddleware');

// GET user profile
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Get counts
    const helpRequestCount = await HelpRequest.countDocuments({ email: user.email });
    const postCount = await Post.countDocuments({ createdBy: user.email });
    
    // Get reviews
    const reviews = await Rating.find({ toUser: user.email });
    
    // Calculate average rating
    let averageRating = 0;
    if (reviews.length > 0) {
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      averageRating = totalRating / reviews.length;
    }
    
    // Add counts and reviews to user object
    const userWithStats = {
      ...user.toObject(),
      helpRequestCount,
      postCount,
      reviews,
      averageRating
    };
    
    res.json(userWithStats);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user profile', error });
  }
});

// GET user profile by email
router.get('/profile/:email', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email }).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Get counts
    const helpRequestCount = await HelpRequest.countDocuments({ email: user.email });
    const postCount = await Post.countDocuments({ createdBy: user.email });
    
    // Get reviews
    const reviews = await Rating.find({ toUser: user.email });
    
    // Calculate average rating
    let averageRating = 0;
    if (reviews.length > 0) {
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      averageRating = totalRating / reviews.length;
    }
    
    // Add counts and reviews to user object
    const userWithStats = {
      ...user.toObject(),
      helpRequestCount,
      postCount,
      reviews,
      averageRating
    };
    
    res.json(userWithStats);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user profile', error });
  }
});

// PUT update user profile
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { name, bio, location, education, skills, skillsToLearn, profilePicture } = req.body;
    
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update fields if provided
    if (name) user.name = name;
    if (bio) user.bio = bio;
    if (location) user.location = location;
    if (education) user.education = education;
    if (skills) user.skills = skills;
    if (skillsToLearn) user.skillsToLearn = skillsToLearn;
    if (profilePicture) user.profilePicture = profilePicture;
    
    await user.save();
    
    // Return updated user without password
    const updatedUser = await User.findById(req.user.id).select('-password');
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: 'Error updating user profile', error });
  }
});

// GET all users (for admin purposes)
router.get('/', authMiddleware, async (req, res) => {
  try {
    // Check if user is admin (you might want to implement admin role)
    // For now, we'll just return all users
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error });
  }
});

module.exports = router; 