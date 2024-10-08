const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    bookingID: {
        type: String,
        required: true,
        unique: true,
    },
    conferenceName: {
        type: String,
        required: true,
    },
    userID: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        required: true,
        enum: ['confirmed', 'waitlisted', 'cancelled'],
    },
    waitlistNumber: {
        type: Number,
        required: false,
    },
    slotAvailable: {
        type: Boolean,
        required: false,
        default: false,
    },
    requestedAt: {
        type: Date,
        required: false,
        default: Date.now,
    },
});

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;