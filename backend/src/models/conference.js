const mongoose = require('mongoose');

const timingSchema = new mongoose.Schema({
    startTime: {
        type: Date,
        required: true
    },
    endTime: {
        type: Date,
        required: true
    }
});

const conferenceSchema = new mongoose.Schema({
    name: {
        unique: true,
        type: String,
        required: true,
    },
    location: {
        type: String,
        required: true
    },
    topics: {
        type: [String],
        required: true
    }, 
    timing: {
        type: timingSchema,
        required: true
    },
    availableSlots: {
        type: Number,
        required: true
    },
    waitlistCount: {
        type: Number,
        required: true,
        default: 0
    }
});

const Conference = mongoose.model('Conference', conferenceSchema);

module.exports = Conference;