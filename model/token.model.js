const mongo = require('mongoose')
const token = new mongo.Schema({
    createdBy: {
        type: mongo.Types.ObjectId,
        required: true,
        ref: "user",
        unique: true
    },
    token: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now(),
        expires: 3600
    }

});


module.exports = mongo.model("token", token)