const { Router } = require("express");

const {
    addConference
} = require("../controllers/conference.js");

const router = Router();

router.post("/add-conference", (req, res) => {
    const name = req.body.name;
    const location = req.body.location;
    let topics = req.body.topics;
    const startTime = req.body.startTime;
    const endTime = req.body.endTime;
    const availableSlots = req.body.availableSlots;

    // Convert topics to an array of strings
    if (typeof topics === "string") {
        topics = topics.split(",");
    }

    addConference(name, location, topics, startTime, endTime, availableSlots)
        .then((response) => {
            res.status(response.code).json(response);
        })
        .catch((err) => {
            res.status(500).json(err);
        });
});

module.exports = router;