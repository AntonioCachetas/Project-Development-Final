const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const authMiddleware = require('../middleware/authMiddleware');

// GET all posts
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find();
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching posts', error });
  }
});

// GET user's posts
router.get('/my-posts', authMiddleware, async (req, res) => {
  try {
    console.log('User email from token:', req.user.email); // Debug log
    const posts = await Post.find({ createdBy: req.user.email });
    console.log('Found posts:', posts); // Debug log
    res.status(200).json(posts);
  } catch (error) {
    console.error('Error in my-posts route:', error); // Debug log
    res.status(500).json({ message: 'Error fetching your posts', error: error.message });
  }
});

// POST create a new post
router.post('/', authMiddleware, async (req, res) => {
  try {
    const newPost = new Post({
      subject: req.body.subject,
      description: req.body.description,
      createdBy: req.user.email,
    });

    await newPost.save();
    res.status(201).json({ message: 'Post created', data: newPost });
  } catch (error) {
    res.status(500).json({ message: 'Error creating post', error });
  }
});

// PUT update a post
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    if (post.createdBy !== req.user.email) {
      return res.status(403).json({ message: 'Not authorized to update this post' });
    }

    const updatedPost = await Post.findByIdAndUpdate(
      req.params.id,
      {
        subject: req.body.subject,
        description: req.body.description
      },
      { new: true }
    );

    res.json(updatedPost);
  } catch (error) {
    res.status(500).json({ message: 'Error updating post', error });
  }
});

// DELETE a post
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    if (post.createdBy !== req.user.email) {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }

    await Post.findByIdAndDelete(req.params.id);
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting post', error });
  }
});

module.exports = router;
