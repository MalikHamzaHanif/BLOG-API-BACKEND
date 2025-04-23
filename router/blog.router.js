const express = require("express")
const router = express.Router();
const {getAllBlogs,getSingleBlog,updateBlog,deleteBlog,createBlog,getBlogsByCategory}=require("../controller/blog.controller");
const testUserMidlleware = require("../middleware/testUser.middlware");
const {rateLimit}=require("express-rate-limit")
const limiter = rateLimit({
    windowMs: 5 * 60 * 1000,
    limit: 10, 
    standardHeaders: 'draft-8', 
    legacyHeaders: false, 
    
})
router.route("/").get(getAllBlogs).post(limiter,testUserMidlleware,createBlog)
router.route("/category").get(getBlogsByCategory)
router.route("/:id").get(getSingleBlog).patch(testUserMidlleware,updateBlog).delete(testUserMidlleware,deleteBlog)

module.exports = router