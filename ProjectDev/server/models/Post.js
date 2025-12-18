const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
  subject: { type: String, required: true },
  description: { type: String, required: true },
  createdBy: { type: String, required: true }, // User who created the post
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Post', PostSchema);
