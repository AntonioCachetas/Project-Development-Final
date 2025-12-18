const mongoose = require('mongoose');

const RatingSchema = new mongoose.Schema({
  fromUser: { 
    type: String, 
    required: true 
  },
  toUser: { 
    type: String, 
    required: true 
  },
  rating: { 
    type: Number, 
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    default: ''
  },
  notificationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Notification',
    required: true
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('Rating', RatingSchema); 