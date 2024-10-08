const User = require("../../models/user");
const { checkIfUserExists, validateName } = require("../validators/validations");

const addUser = async (userID, interestedTopics) => {
    // Validate the input
    // Check if the user already exists
    if (await checkIfUserExists(userID)) {
        return {
            code: 400,
            message: "User already exists",
            data: null,
        }
    }
    // Validate the userID
    if (!validateName(userID)) {
        return {
            code: 400,
            message: "Invalid userID, must be alphanumeric with only spaces",
            data: null,
        }
    }
    // Validate the interested topics
    for (const topic of interestedTopics) {
        if (!validateName(topic)) {
            return {
                code: 400,
                message: `Invalid interested topic, must be alphanumeric with only spaces: ${topic}`,
                data: null,
            }
        }
    }
    if (interestedTopics.length > 50) {
        return {
            code: 400,
            message: "Too many interested topics, must be at most 50",
            data: null,
        }
    }

    // Create the user
    const user = new User({
        userID: userID,
        interestedTopics: interestedTopics,
    });
    await user.save();
    return {
        code: 200,
        message: "User added successfully",
        data: {
            id: user._id,
        },
    }

}

module.exports = {
    addUser,
}