const mongo = require('mongoose')
const jwt=require("jsonwebtoken")
const bcrypt=require("bcryptjs")
const user = new mongo.Schema({
    name: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 20,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        match: [
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            'Please provide a valid email'],
    },
    password: {
        type: String,
        required: true,
    },
    isVerified: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

user.pre("save",async function () {
    if(!this.isModified("password"))return;
    const salt=await bcrypt.genSalt(10);
    this.password=await bcrypt.hash(this.password,salt);
})

user.methods.verifyUser=async function(password){
    return await bcrypt.compare(password,this.password)
}

user.methods.generateToken=function(){
    return jwt.sign({userId:this._id,email:this.email},process.env.SECRET_KEY,{expiresIn:'2d'})
}
module.exports = mongo.model("user", user)