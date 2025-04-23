const { StatusCodes } = require("http-status-codes");
const CustomError = require("./customError");

class  Internal_Server_Error extends CustomError {
    constructor(msg){
        super(msg)
        this.status=StatusCodes.INTERNAL_SERVER_ERROR
    }
}

module.exports= Internal_Server_Error