const express = require('express');
const router = express.Router();
const HelpRequest = require('../models/HelpRequest');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware, async (req, res) => {
  try {
    const newRequest = new HelpRequest({
      subject: req.body.subject,
      description: req.body.description,
      email: req.user.email
    });

    await newRequest.save();
    res.status(201).json({ message: 'Help request created', data: newRequest });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create help request', error });
  }
});


// GET route to fetch all help requests
router.get('/', async (req, res) => {
  try {
    const helpRequests = await HelpRequest.find();
    res.status(200).json(helpRequests);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching help requests', error });
  }
});

// GET route to fetch user's help requests
router.get('/my-requests', authMiddleware, async (req, res) => {
  try {
    const helpRequests = await HelpRequest.find({ email: req.user.email });
    res.status(200).json(helpRequests);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching your help requests', error });
  }
});

// DELETE route to remove a help request
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const request = await HelpRequest.findById(req.params.id);
    
    // Check if request exists and belongs to user
    if (!request) {
      return res.status(404).json({ message: 'Help request not found' });
    }
    if (request.email !== req.user.email) {
      return res.status(403).json({ message: 'Not authorized to delete this request' });
    }

    await HelpRequest.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Help request deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting help request', error });
  }
});

// PUT route to update a help request
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const request = await HelpRequest.findById(req.params.id);
    
    // Check if request exists and belongs to user
    if (!request) {
      return res.status(404).json({ message: 'Help request not found' });
    }
    if (request.email !== req.user.email) {
      return res.status(403).json({ message: 'Not authorized to update this request' });
    }

    const updatedRequest = await HelpRequest.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        subject: req.body.subject,
        description: req.body.description
      },
      { new: true }
    );

    res.status(200).json(updatedRequest);
  } catch (error) {
    res.status(500).json({ message: 'Error updating help request', error });
  }
});

module.exports = router;