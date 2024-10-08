const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    userID: {
        unique: true,
        type: String,
        required: true,
    },
    interestedTopics: {
        type: [String],
        required: true
    },
});

const User = mongoose.model('User', userSchema);

module.exports = User;