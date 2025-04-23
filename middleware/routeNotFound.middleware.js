const { StatusCodes } = require("http-status-codes")

function routeNotFound(req,res){
res.status(StatusCodes.OK).json("Route not found")
}

module.exports=routeNotFound