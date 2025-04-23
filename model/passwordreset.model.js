const mongo = require('mongoose')
const passwordresettoken = new mongo.Schema({
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
        expires: 900
    }

});


module.exports = mongo.model("passwordresettoken", passwordresettoken)