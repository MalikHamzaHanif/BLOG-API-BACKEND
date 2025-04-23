const { StatusCodes } = require("http-status-codes");
const CustomError = require("./customError");

class  Not_Found extends CustomError {
    constructor(msg){
        super(msg)
        this.status=StatusCodes.NOT_FOUND
    }
}

module.exports=Not_Found