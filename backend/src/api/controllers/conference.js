const { checkIfConferenceExists, validateName, validateTime } = require("../validators/validations");
const Conference = require("../../models/conference");

const addConference = async (name, location, topics, startTime, endTime, availableSlots) => {
    // Validate the input
    // Check if the conference already exists
    if (await checkIfConferenceExists(name)) {
        return {
            code: 400,
            message: "Conference already exists",
            data: null,
        }
    }
    // Validate name
    if (!validateName(name)) {
        return {
            code: 400,
            message: "Invalid conference name, must be alphanumeric with only spaces",
            data: null,
        }
    }
    if (!validateName(location)) {
        return {
            code: 400,
            message: "Invalid location, must be alphanumeric with only spaces",
            data: null,
        }
    }
    // Validate timing
    if (!validateTime(startTime, endTime)) {
        return {
            code: 400,
            message: "Invalid timing, start time must be before end time",
            data: null,
        }
    }
    // Validate topics
    for (const topic of topics) {
        if (!validateName(topic)) {
            return {
                code: 400,
                message: "Invalid topic name, must be alphanumeric with only spaces",
                data: null,
            }
        }
    }
    if (topics.length > 10) {
        return {
            code: 400,
            message: "Too many topics, must be at most 10",
            data: null,
        }
    }

    // Create the conference
    const conference = new Conference({
        name: name,
        location: location,
        topics: topics,
        timing: {
            startTime: startTime,
            endTime: endTime
        },
        availableSlots: availableSlots
    });
    await conference.save();
    return {
        code: 200,
        message: "Conference added successfully",
        data: null,
    }
}

module.exports = {
    addConference,
}


