const { Router } = require("express");

const {
    bookConference,
    getBookingStatus,
    confirmWaitlistBooking,
    cancelBooking
} = require("../controllers/booking.js");

const router = Router();

router.post("/book-conference", (req, res) => {
    const conferenceName = req.body.conferenceName;
    const userID = req.body.userID;
    bookConference(conferenceName, userID)
        .then((response) => {
            res.status(response.code).json(response);
        })
        .catch((err) => {
            res.status(500).json(err);
        });
});

router.get("/get-booking-status", (req, res) => {
    const bookingID = req.query.bookingID;
    getBookingStatus(bookingID)
        .then((response) => {
            res.status(response.code).json(response);
        })
        .catch((err) => {
            res.status(500).json(err);
        });
});

router.put("/confirm-waitlist-booking", (req, res) => {
    const bookingID = req.body.bookingID;
    confirmWaitlistBooking(bookingID)
        .then((response) => {
            res.status(response.code).json(response);
        })
        .catch((err) => {
            res.status(500).json(err);
        });
});

router.put("/cancel-booking", (req, res) => {
    const bookingID = req.body.bookingID;
    cancelBooking(bookingID)
        .then((response) => {
            res.status(response.code).json(response);
        })
        .catch((err) => {
            res.status(500).json(err);
        });
});

module.exports = router;