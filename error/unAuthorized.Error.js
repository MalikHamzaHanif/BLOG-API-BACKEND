const { StatusCodes } = require("http-status-codes");
const CustomError = require("./customError");

class  Un_Authorized extends CustomError {
    constructor(msg){
        super(msg)
        this.status=StatusCodes.UNAUTHORIZED
    }
}

module.exports=Un_Authorized