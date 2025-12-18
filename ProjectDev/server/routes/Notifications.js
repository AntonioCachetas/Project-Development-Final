const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const authMiddleware = require('../middleware/authMiddleware');
const HelpRequest = require('../models/HelpRequest');

// GET user's notifications
router.get('/', authMiddleware, async (req, res) => {
  try {
    const notifications = await Notification.find({ toUser: req.user.email })
      .sort({ createdAt: -1 }); // Sort by newest first
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching notifications', error });
  }
});

// POST create a new notification
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { type, toUser, postId, postTitle } = req.body;
    
    // Prevent users from requesting help from themselves
    if (type === 'help_request' && toUser === req.user.email) {
      return res.status(400).json({ 
        message: 'You cannot request help from yourself' 
      });
    }
    
    // For help offers, check if the user is trying to offer help on their own help request
    if (type === 'help_offer') {
      // Find the help request to check if it belongs to the current user
      const helpRequest = await HelpRequest.findById(postId);
      if (helpRequest && helpRequest.email === req.user.email) {
        return res.status(400).json({ 
          message: 'You cannot offer help on your own help request' 
        });
      }
    }
    
    const newNotification = new Notification({
      type,
      fromUser: req.user.email,
      toUser,
      postId,
      postTitle
    });

    await newNotification.save();
    res.status(201).json({ message: 'Notification created', data: newNotification });
  } catch (error) {
    res.status(500).json({ message: 'Error creating notification', error });
  }
});

// PUT accept a notification
router.put('/:id/accept', authMiddleware, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    if (notification.toUser !== req.user.email) {
      return res.status(403).json({ message: 'Not authorized to update this notification' });
    }

    notification.status = 'accepted';
    await notification.save();
    
    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: 'Error accepting notification', error });
  }
});

// PUT decline a notification
router.put('/:id/decline', authMiddleware, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    if (notification.toUser !== req.user.email) {
      return res.status(403).json({ message: 'Not authorized to update this notification' });
    }

    notification.status = 'declined';
    await notification.save();
    
    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: 'Error declining notification', error });
  }
});

// DELETE a notification
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    if (notification.toUser !== req.user.email) {
      return res.status(403).json({ message: 'Not authorized to delete this notification' });
    }

    await Notification.findByIdAndDelete(req.params.id);
    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting notification', error });
  }
});

module.exports = router; 