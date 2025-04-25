const { BAD_REQUEST, UNAUTHORIZED, NOT_FOUND } = require("../error/error")
const asyncWrapper = require("../middleware/asyncWrapper.middleware")
const token = require("../model/token.model")
const userModel = require("../model/user.model")
const crypto = require('crypto')
const sendEmail = require("./send.email")
const { StatusCodes } = require("http-status-codes")
const bcrypt = require("bcryptjs")
const passwordresetModel = require("../model/passwordreset.model")

const registerUser = asyncWrapper(async (req, res) => {
    const { name, email, password } = req.body

    if (!name || !email || !password) {
        throw new BAD_REQUEST("Please fill all the fields.");
    }
    
    if (password.length<6) {        
        throw new BAD_REQUEST("Password length should be atleast 6 chars");
    }
    if (password.length>15) {
        throw new BAD_REQUEST("Password length can not be greator then 15 chars");
    }

    const user = await userModel.findOne({ email: email })

    if (user) {
        throw new BAD_REQUEST("User already exist. Please login")
    }

    const createUser = await userModel.create({ name, email, password });
    const cryptoToken = await token.create({ createdBy: createUser._id, token: crypto.randomBytes(32).toString("hex") })
    await sendEmail(email, "Verify your email please", `${process.env.BASE_URL}/user/${createUser._id}/verify/${cryptoToken.token}`)
    return res.status(StatusCodes.OK).json({
        success: true, data: {
            msg: "Email sent succefully."
        }
    })

});
const loginUser = asyncWrapper(async (req, res) => {
    const { email, password } = req.body
    if (!email || !password) {
        throw new BAD_REQUEST("Please fill all the fields.");
    }

    const user = await userModel.findOne({ email: email })

    if (!user) {
        throw new BAD_REQUEST("User not exist.")
    }
    if (user.isVerified !== true) {
        const checkToken = await token.findOne({ createdBy: user._id })
        if (checkToken) {
            await sendEmail(email, "Verify your email please", `${process.env.BASE_URL}/user/${user._id}/verify/${checkToken.token}`)
            return res.status(StatusCodes.OK).json({
                success: true, data: {
                    msg: "Your email is not verified please open your email and verify."
                }
            })
        }
        const newToken = await token.create({ createdBy: user._id, token: crypto.randomBytes(32).toString("hex") })
        await sendEmail(email, "Verify your email please", `${process.env.BASE_URL}/user/${user._id}/verify/${newToken.token}`)
        return res.status(StatusCodes.OK).json({
            success: true, data: {
                msg: "Your email is not verified please open your email and verify."
            }
        })
    }
    const isVarified = await user.verifyUser(password);
    if (!isVarified) {
        throw new UNAUTHORIZED("Invailed credentials.")
    }
    const jwtToken = user.generateToken()

    const newUser = {
        "userId": user._id,
        "name": user.name,
        "email": user.email,
        "isVerified": user.isVerified,
        "token": jwtToken
    }
    return res.status(StatusCodes.OK).json({
        success: true, data: {
            msg: "Login request successfull.",
            user: newUser
        }
    })
});


const verifyUserStatus = asyncWrapper(async (req, res) => {
    const { id, token: userCryptoToken } = req.params
    if (!id || !userCryptoToken) {
        throw new BAD_REQUEST("invailed link")
    }
    const user = await userModel.findOne({ _id: id })
    if (!user) {
        throw new NOT_FOUND("No user found ")
    }

    const cryptoToken = await token.findOne({ createdBy: user._id })
    if (!cryptoToken) {
        throw new NOT_FOUND("No user token found ")
    }
    if (cryptoToken.token === userCryptoToken) {
        user.isVerified = true;
        await user.save()
        res.status(StatusCodes.OK).json({
            success: true, data: {
                msg: "User got verified successfully"
            }
        })
    } else {
        throw new BAD_REQUEST("User not verified")
    }


});
const getUserData = asyncWrapper(async (req, res) => {
    const { id } = req.params
    if (!id) {
        throw new BAD_REQUEST("No user with this id")
    }
    const user = await userModel.findOne({ _id: id })
    if (!user) {
        throw new NOT_FOUND("No user found ")
    }
    const newUser = {
        "userId": user._id,
        "name": user.name,
        "email": user.email,
        "isVerified": user.isVerified,
    }
    return res.status(StatusCodes.OK).json({
        success: true, data: {
            msg: "get request for user data successfull.",
            user: newUser
        }
    })

});
const updateUser = asyncWrapper(async (req, res) => {
    const { userId } = req.user
    const { newPassword, oldPassword, name } = req.body
    let updateObject = {

    }
    if (!userId) {
        throw new BAD_REQUEST("No user with this id")
    }
    const user = await userModel.findOne({ _id: userId })
    if (!user) {
        throw new NOT_FOUND("No user found ")
    }

    if (name) {
        updateObject.name = name
    }
    if (newPassword.length<6&&newPassword.length>15) {

        throw new BAD_REQUEST("Password length must be in between 6 and 15");
    }
    if (newPassword && oldPassword) {
        const isPrevPasswordCorrect = await user.verifyUser(oldPassword)
        if (!isPrevPasswordCorrect) {
            throw new UNAUTHORIZED("Your old password is incorrect");
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        updateObject.password = hashedPassword;

    }

    const updatedUser = await userModel.findOneAndUpdate({ _id: user._id }, updateObject, { runValidators: true, new: true })
    const newUser = {
        "userId": updatedUser._id,
        "name": updatedUser.name,
        "email": updatedUser.email,
        "isVerified": updatedUser.isVerified,
    }
    return res.status(StatusCodes.OK).json({
        success: true, data: {
            msg: "User updated successfully.",
            user: newUser
        }
    })
});
const verifyUser = asyncWrapper(async (req, res) => {
    const { userId } = req.user
    if (!userId) {
        throw new BAD_REQUEST("No user with this id")
    }
    const user = await userModel.findOne({ _id: userId })
    if (!user) {
        throw new NOT_FOUND("No user found ")
    }
    const newUser = {
        "userId": user._id,
        "name": user.name,
        "email": user.email,
        "isVerified": user.isVerified,
    }
    return res.status(StatusCodes.OK).json({
        success: true, data: {
            msg: "verifying user successfull.",
            user: newUser
        }
    })
});


const sendForgotPasswordEmail = asyncWrapper(async (req, res) => {
    const { email } = req.body
    if (!email) {
        throw new BAD_REQUEST("email is required");
    }
    const userExist = await userModel.findOne({ email });

    if (!userExist) {
        throw new NOT_FOUND("No user found with this email")
    }
    if (userExist.email === "test@example.com") {
        throw new BAD_REQUEST("You are not allowed to modify test user credentials.");
    }
    if (userExist.isVerified === false) {
        throw new BAD_REQUEST("first of all verify your email");
    }
    const check = await passwordresetModel.findOne({ createdBy: userExist._id })
    if (!check) {
        const token = crypto.randomBytes(32).toString("hex")
        const passwordToken = await passwordresetModel.create({ createdBy: userExist._id, token })
        await sendEmail(email, "Password reset request", `${process.env.BASE_URL_RESET_PASSWORD}/forgotpassword/${userExist._id}/${passwordToken.token}`)
        return res.status(StatusCodes.OK).json({
            success: true, data: {
                msg: "Password reset email sent successfully.For new request try after 15 minutes."
            }
        })
    }
    return res.status(StatusCodes.OK).json({
        success: true, data: {
            msg: "Email is already sent .try after sometime for new request"
        }
    })
})
const checkResetPasswordRequest = asyncWrapper(async (req, res) => {
    const { id, token } = req.params
    
    
    if (!id || !token) {
        throw new BAD_REQUEST("invailed link");
    }
    const passwordResetTokenExist = await passwordresetModel.findOne({ createdBy: id, token:token });
   
    
    if (!passwordResetTokenExist) {
        throw new BAD_REQUEST("Invailed link.Please make another password reset request")
    }
    return res.status(StatusCodes.OK).json({
        success: true, data: {
            msg: "Enter your new password"
        }
    })
})
const setNewPassword = asyncWrapper(async (req, res) => {
    const { id, token } = req.params
    if (!id || !token) {
        throw new BAD_REQUEST("invailed link");
    }
    const passwordResetTokenExist = await passwordresetModel.findOne({ createdBy: id, token });
    if (!passwordResetTokenExist) {
        throw new BAD_REQUEST("Invailed link.Password reset request failed.try again")
    }
    const{newPassword}=req.body
    if(!newPassword){
        throw new BAD_REQUEST("new password is required")
    }
    
    if (newPassword.length<6&&newPassword.length>15) {

        throw new BAD_REQUEST("Password length must be in between 6 and 15");
    }
    const user=await userModel.findOne({_id:id})
    if(!user){
        throw new BAD_REQUEST("No user found")
    }
    user.password=newPassword
    await user.save();
    await passwordresetModel.findOneAndDelete({createdBy:id})
    return res.status(StatusCodes.OK).json({
        success: true, data: {
            msg: "Password updated successfully"
        }
    })

})

module.exports = { getUserData, verifyUser, registerUser, loginUser, updateUser, verifyUserStatus, sendForgotPasswordEmail, checkResetPasswordRequest, setNewPassword };