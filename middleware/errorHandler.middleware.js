const { StatusCodes } = require("http-status-codes")
const { CUSTOM_ERROR } = require("../error/error")

function errorHandlerMiddleware(err, req, res, next) {

    if (err instanceof CUSTOM_ERROR) {
        return res.status(err.status).json({
            sucess: false, data: {
                msg: err.message
            }
        })
    }

    
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        sucess: false, data: {
            msg: "Internal server error.",
        }
    })
}

module.exports = errorHandlerMiddleware