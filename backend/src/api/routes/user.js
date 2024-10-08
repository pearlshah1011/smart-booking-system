const { Router } = require("express");

const {
    addUser
} = require("../controllers/user.js");

const router = Router();

router.post("/add-user", (req, res) => {
    const userID = req.body.userID;
    let interestedTopics = req.body.interestedTopics;

    // Convert topics to an array of strings
    if (typeof interestedTopics === "string") {
        interestedTopics = interestedTopics.split(",");
        interestedTopics = interestedTopics.map((topic) => topic.trim());
    }

    addUser(userID, interestedTopics)
        .then((response) => {
            res.status(response.code).json(response);
        })
        .catch((err) => {
            res.status(500).json(err);
        });
});

module.exports = router;