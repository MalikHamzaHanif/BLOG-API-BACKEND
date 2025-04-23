const { UNAUTHORIZED } = require("../error/error")


function testUserMidlleware(req, res, next) {
    if (req.user.testuser) {
        throw new UNAUTHORIZED("Test user found. You are not authorized to perform this action.")
    }
    next();

}

module.exports = testUserMidlleware