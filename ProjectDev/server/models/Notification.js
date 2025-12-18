const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  type: { 
    type: String, 
    required: true,
    enum: ['help_request', 'help_offer']
  },
  fromUser: { 
    type: String, 
    required: true 
  },
  toUser: { 
    type: String, 
    required: true 
  },
  postId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Post',
    required: true 
  },
  postTitle: {
    type: String,
    required: true
  },
  status: { 
    type: String, 
    required: true,
    enum: ['pending', 'accepted', 'declined', 'rated'],
    default: 'pending'
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('Notification', NotificationSchema); 