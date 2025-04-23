const mongo = require('mongoose')
const image = new mongo.Schema({
    url: {
        type: String,
        required: true,
    },
    publicId: {
        type: String,
        required: true,
    },
}, { _id: false });
const blog = new mongo.Schema({
    title: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 30,
    },
    content: {
        type: String,
        required: true,
        minlength: 20,
        maxlength: 300
    },
    image: image,
    category: {
        type: String,
        enum: ["tech", "fashion", "travel", "health", "education", "other"],
        default: "other"
    },
    createdBy: {
        type: mongo.Types.ObjectId,
        ref: "user",
        required: true
    }
}, { timestamps: true });




module.exports = mongo.model("blog", blog);