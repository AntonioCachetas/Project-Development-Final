const express = require('express');
const router = express.Router();
const Rating = require('../models/Rating');
const Notification = require('../models/Notification');
const authMiddleware = require('../middleware/authMiddleware');

// GET user's ratings
router.get('/', authMiddleware, async (req, res) => {
  try {
    const ratings = await Rating.find({ toUser: req.user.email })
      .sort({ createdAt: -1 }); // Sort by newest first
    res.json(ratings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching ratings', error });
  }
});

// GET user's average rating
router.get('/average/:email', async (req, res) => {
  try {
    const ratings = await Rating.find({ toUser: req.params.email });
    
    if (ratings.length === 0) {
      return res.json({ average: 0, count: 0 });
    }
    
    const sum = ratings.reduce((acc, rating) => acc + rating.rating, 0);
    const average = sum / ratings.length;
    
    res.json({ average, count: ratings.length });
  } catch (error) {
    res.status(500).json({ message: 'Error calculating average rating', error });
  }
});

// POST create a new rating
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { toUser, rating, comment, notificationId } = req.body;
    
    // Check if notification exists and belongs to the user
    const notification = await Notification.findById(notificationId);
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    if (notification.toUser !== req.user.email) {
      return res.status(403).json({ message: 'Not authorized to rate for this notification' });
    }
    
    // Check if rating already exists for this notification
    const existingRating = await Rating.findOne({ notificationId });
    
    if (existingRating) {
      return res.status(400).json({ message: 'Rating already exists for this notification' });
    }
    
    const newRating = new Rating({
      fromUser: req.user.email,
      toUser,
      rating,
      comment,
      notificationId
    });

    await newRating.save();
    
    // Update notification status to 'rated'
    notification.status = 'rated';
    await notification.save();
    
    res.status(201).json({ message: 'Rating created', data: newRating });
  } catch (error) {
    res.status(500).json({ message: 'Error creating rating', error });
  }
});

module.exports = router; 