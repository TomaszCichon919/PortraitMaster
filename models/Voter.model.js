
const mongoose = require('mongoose');

const voterSchema = new mongoose.Schema({
  user: {
    type: String, // Store the IP address or any identifier for the user
    required: true,
    unique: true,
  },
  votes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Photo' }],
});

module.exports = mongoose.model('Voter', voterSchema);