const Booking = require("../../models/booking");
const Conference = require("../../models/conference");
const { uuid } = require('uuidv4');
const { checkIfBookingCancelled, checkIfBookingWaitlisted, checkIfBookingExists, checkIfConferenceExists, checkIfUserExists, checkIfConferenceStarted, checkIfBookingAlreadyMade, checkUserHasNoOverlap, checkIfSlotAvailable } = require("../validators/validations");

/*
    * This function is used to book a conference
    * @param {String} conferenceName - The name of the conference
    * @param {String} userID - The ID of the user
    * @returns {String} - The booking ID
*/
const bookConference = async (conferenceName, userID) => {
    
    // Validate the input
    // Check if the conference exists
    if (!await checkIfConferenceExists(conferenceName)) {
        return {
            code: 404,
            message: "Conference Name not found",
            data: null,
        }
    }
    // Check if the user exists
    if (!await checkIfUserExists(userID)) {
        return {
            code: 404,
            message: "UserID not found",
            data: null,
        }
    }
    // Check if the conference has started
    if (await checkIfConferenceStarted(conferenceName)) {
        return {
            code: 400,
            message: "Conference has already started",
            data: null,
        }
    }
    // Check if the user has already booked the conference
    if (await checkIfBookingAlreadyMade(userID, conferenceName)) {
        return {
            code: 400,
            message: "User has already booked the conference",
            data: null,
        }
    }
    // Check if the user has any overlap with the conference
    if (await checkUserHasNoOverlap(userID, conferenceName)) {
        return {
            code: 400,
            message: "User has overlap with the conference",
            data: null,
        }
    }
    // Check if the conference has available slots
    if (!await checkIfSlotAvailable(conferenceName)) {
        // We will have to waitlist the user
        const waitlistNumber = await getWaitlistNumber(conferenceName);
        // Create the booking
        const bookingID = await createBooking(conferenceName, userID, 'waitlisted', waitlistNumber);
        return {
            code: 200,
            message: "User has been waitlisted",
            data: {
                bookingID: bookingID,
                waitlistNumber: waitlistNumber,
            },
        }
    }
    // We can confirm the booking
    // Update the available slots
    await updateAvailableSlots(conferenceName, -1);
    // Create the booking
    const bookingID = await createBooking(conferenceName, userID, 'confirmed', null);
    return {
        code: 200,
        message: "User has been confirmed",
        data: {
            bookingID: bookingID,
        }
    }
};

const getBookingStatus = async (bookingID) => {
    const booking = await Booking.findOne({ bookingID: bookingID });
    if (checkIfBookingExists(booking)) {
        return {
            code: 404,
            message: "Booking ID not found",
            data: null,
        }
    }
    return {
        code: 200,
        message: "Booking Status",
        data: {
            status: booking.status,
        }
    }
}

const confirmWaitlistBooking = async (bookingID) => {
    const booking = await Booking.findOne({ bookingID: bookingID });
    if (!checkIfBookingExists(booking)) {
        return {
            code: 404,
            message: "Booking ID not found",
            data: null,
        }
    }
    if (!checkIfBookingWaitlisted(booking)) {
        return {
            code: 400,
            message: "Booking is not waitlisted",
            data: null,
        }
    }
    // Check if slot is available for waitlisted booking
    if (booking.slotAvailable === false) {
        return {
            code: 404,
            message: "Slot is not available",
            data: null,
        }
    }
    // Update the booking status
    await Booking.updateOne({ bookingID: bookingID }, { status: 'confirmed' });
    // Update the available slots
    await updateAvailableSlots(booking.conferenceName, -1);
    return {
        code: 200,
        message: "Booking has been confirmed",
        data: null,
    }
}

const cancelBooking = async (bookingID) => {
    const booking = await Booking.findOne({ bookingID: bookingID });
    if (!checkIfBookingExists(booking)) {
        return {
            code: 404,
            message: "Booking ID not found",
            data: null,
        }
    }
    if (checkIfBookingCancelled(booking)) {
        return {
            code: 400,
            message: "Booking already cancelled",
            data: null,
        }
    }
    // If the booking was confirmed, update the available slots
    if (booking.status === 'confirmed') {
        await updateAvailableSlots(booking.conferenceName, 1);
        // Update the slot of the first waitlisted booking
        await updateAvailability(booking.conferenceName);
    }
    // Update the booking status
    await Booking.updateOne({ bookingID: bookingID }, { status: 'cancelled' });
    return {
        code: 200,
        message: "Booking has been cancelled",
        data: null,
    }
}

const getWaitlistNumber = async (conferenceName) => {
    // Get the conference data
    const conference = await Conference.findOne({ name: conferenceName });
    // Get the count of waitlisted bookings
    const waitlistNumber = conference.waitlistCount + 1;
    // Update the waitlist count
    await Conference.updateOne({ name: conferenceName }, { waitlistCount: waitlistNumber });
    return waitlistNumber;
}

const updateAvailability = async (conferenceName) => {
    // get all waitlisted bookings which dont have a slot to be confirmed
    let waitlistedBookings = await Booking.find({ conferenceName: conferenceName, status: 'waitlisted', slotAvailable: false });
    // find the first waitlisted booking
    waitlistedBookings = waitlistedBookings.sort((a, b) => a.requestedAt - b.requestedAt);
    const firstBooking = waitlistedBookings[0];
    firstBooking.slotAvailable = true;
    await firstBooking.save();
    // Call the expiry timout
    await setAvailabilityExpiry(firstBooking.bookingID);
}

const setAvailabilityExpiry = async (bookingID) => {
    // Get the booking data
    const booking = await Booking.findOne({ bookingID: bookingID });
    // Set the expiry time
    const expiryTime = 1 * 60 * 60 * 1000; // 1 hour
    // Set a timeout to expire the availability
    setTimeout(async () => {
        // Update the booking
        // After expiry, make the waitlist number to last
        let newWaitlistNumber = -1;
        // Get all waitlisted bookings
        let waitlistedBookings = await Booking.find({ conferenceName: booking.conferenceName, status: 'waitlisted' });
        // Find the last waitlist number
        for (const waitlistedBooking of waitlistedBookings) {
            if (waitlistedBooking.waitlistNumber > newWaitlistNumber) {
                newWaitlistNumber = waitlistedBooking.waitlistNumber;
            }
        }
        // Update the booking
        await Booking.updateOne({ bookingID: bookingID }, { slotAvailable: false, waitlistNumber: newWaitlistNumber });
        // Update the availability of the next booking
        await updateAvailability(booking.conferenceName);
    }, expiryTime);
}

const updateAvailableSlots = async (conferenceName, offset) => {
    // Get the conference data
    const conference = await Conference.findOne({ name: conferenceName });
    // Get the count of available slots
    const availableSlots = conference.availableSlots + offset;
    // Update the available slots
    await Conference.updateOne({ name: conferenceName }, { availableSlots: availableSlots });
}

const createBooking = async (conferenceName, userID, status, waitlistNumber) => {
    const bookingID = uuid();
    const booking = new Booking({
        bookingID: bookingID,
        conferenceName: conferenceName,
        userID: userID,
        status: status,
        waitlistNumber: waitlistNumber,
    });
    await booking.save();
    return bookingID;
}

module.exports = {
    bookConference,
    getBookingStatus,
    confirmWaitlistBooking,
    cancelBooking,
};