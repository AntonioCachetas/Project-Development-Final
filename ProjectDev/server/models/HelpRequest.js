const mongoose = require('mongoose');

const HelpRequestSchema = new mongoose.Schema({
  subject: { type: String, required: true },
  description: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  email: { type: String, required: true },
});

module.exports = mongoose.model('HelpRequest', HelpRequestSchema);