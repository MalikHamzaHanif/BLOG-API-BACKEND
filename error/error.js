const NOT_FOUND = require("./notFound.Error");
const BAD_REQUEST = require("./badRequest.Error");
const INTERNAL_SERVER_ERROR = require("./internalServer.Error");
const UNAUTHORIZED = require("./unAuthorized.Error");
const CUSTOM_ERROR = require("./customError")

module.exports={NOT_FOUND,BAD_REQUEST,INTERNAL_SERVER_ERROR,UNAUTHORIZED,CUSTOM_ERROR}