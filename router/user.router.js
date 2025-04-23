const express = require("express")
const router = express.Router();
const {rateLimit}=require("express-rate-limit")
const limiter = rateLimit({
	windowMs: 5 * 60 * 1000,
	limit: 10, 
	standardHeaders: 'draft-8', 
	legacyHeaders: false, 
	
})
const {getUserData,verifyUser,registerUser,loginUser,updateUser,verifyUserStatus, sendForgotPasswordEmail,checkResetPasswordRequest,setNewPassword}=require("../controller/user.controller");
const authenticationMidleware = require("../middleware/authentication.middleware");
const testUserMidlleware = require("../middleware/testUser.middlware");
router.route("/register").post(limiter,registerUser)
router.route("/login").post(limiter,loginUser)
router.route("/").get(authenticationMidleware,verifyUser)
router.route("/:id").get(authenticationMidleware,getUserData).patch(authenticationMidleware,testUserMidlleware,updateUser)
router.route("/:id/verify/:token").get(verifyUserStatus)
router.route("/forgotpassword").post(limiter,sendForgotPasswordEmail)
router.route("/forgotpassword/:id/:token").get(limiter,checkResetPasswordRequest).post(limiter,setNewPassword)
module.exports = router