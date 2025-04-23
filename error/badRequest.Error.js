const { StatusCodes } = require("http-status-codes");
const CustomError = require("./customError");

class Bad_Request extends CustomError {
    constructor(msg) {
        super(msg)
        this.status = StatusCodes.BAD_REQUEST
    }
}

module.exports = Bad_Request