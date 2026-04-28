const mongoose = require('mongoose');

const SymptomCheckSchema = new mongoose.Schema({
  userId: { type: String, required: false },
  userName: { type: String, required: false },
  symptoms: String,
  suggestions: String,
  specialties: [String],
  urgency: String,
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SymptomCheck', SymptomCheckSchema);