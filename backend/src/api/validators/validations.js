const User = require("../../models/user");
const Conference = require("../../models/conference");
const Booking = require("../../models/booking");

const checkIfConferenceExists = async (conferenceName) => {
    const conference = await Conference.findOne({ name: conferenceName });
    if (!conference) {
        return false;
    }
    return true;
};

const checkIfConferenceStarted = async (conferenceName) => {
    const conference = await Conference.findOne({ name: conferenceName });
    const currentTime = new Date();
    if (currentTime >= conference.timing.startTime) {
        return true;
    }
    return false;
};

const checkIfBookingAlreadyMade = async (userID, conferenceName) => {
    const booking = await Booking.findOne({ userID: userID, conferenceName: conferenceName });
    if (!booking) {
        return false;
    }
    return true;
}

const checkIfBookingExists = async (booking) => {
    if (!booking) {
        return false;
    }
    return true;
}

const checkIfBookingWaitlisted = async (booking) => {
    if (booking.status === 'waitlisted') {
        return true;
    }
    return false;
}

const checkIfBookingCancelled = async (booking) => {
    if (booking.status === 'cancelled') {
        return true;
    }
    return false;
}

const checkIfSlotAvailable = async (conferenceName) => {
    const conference = await Conference.findOne({ name: conferenceName });
    if (conference.availableSlots <= 0) {
        return false;
    }
    return true;
};

const checkIfUserExists = async (userID) => {
    const user = await User.findOne({ userID: userID });
    if (!user) {
        return false;
    }
    return true;
}

const checkUserHasNoOverlap = async (userID, conferenceName) => {
    // Get conference timing
    const conference = await Conference.findOne({ name: conferenceName });
    const conferenceStartTime = conference.timing.startTime;
    const conferenceEndTime = conference.timing.endTime;

    // Get user's bookings
    const userBookings = await Booking.find({ userID: userID });
    // Check if the conference overlaps with any of the user's bookings
    for (const booking of userBookings) {
        const bookingConference = await Conference.findOne({ name: booking.conferenceName });
        const bookingStartTime = bookingConference.timing.startTime;
        const bookingEndTime = bookingConference.timing.endTime;

        if (conferenceStartTime >= bookingStartTime && conferenceStartTime <= bookingEndTime) {
            return false;
        }
        if (conferenceEndTime >= bookingStartTime && conferenceEndTime <= bookingEndTime) {
            return false;
        }
    }

    return true;
}

const validateName = (name) => {
    // Check if the name is alphanumeric and has only spaces as special characters
    const regex = /^[a-zA-Z0-9 ]+$/;
    return regex.test(name);
}

const validateTime = (startTime, endTime) => {
    // Check if the start time is before the end time and duration is not more than 12 hours
    if (startTime >= endTime) {
        return false;
    }
    const duration = endTime - startTime;
    if (duration > 43200000) {
        return false;
    }
    return true;
}

module.exports = {
    checkIfConferenceExists,
    checkIfConferenceStarted,
    checkIfBookingAlreadyMade,
    checkIfBookingExists,
    checkIfBookingWaitlisted,
    checkIfBookingCancelled,
    checkIfSlotAvailable,
    checkIfUserExists,
    checkUserHasNoOverlap,
    validateName,
    validateTime,
};