const { BAD_REQUEST, UNAUTHORIZED } = require("../error/error")
const jwt = require("jsonwebtoken")
function authenticationMidleware(req, res, next) {
    const authorization = req.headers.authorization

    if (!authorization || !authorization.startsWith("Bearer ")) {
        throw new BAD_REQUEST("Invailed token.");
    }
    const token = authorization.split(" ")[1]
    if (!token) throw new BAD_REQUEST("No token found.");
    try {
        const payload = jwt.verify(token, process.env.SECRET_KEY);
        req.user = { userId: payload.userId, email: payload.emai, testuser: false };
        if (payload.userId === "6801da7abb603f0d1a19a95f") {
            req.user.testuser = true
        }
        next();
    } catch (error) {
        throw new UNAUTHORIZED("You are not authorized to access this resource.")
    }
}

module.exports = authenticationMidleware