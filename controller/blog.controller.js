const mongo = require("mongoose");
const { BAD_REQUEST, NOT_FOUND } = require("../error/error");
const asyncWrapper = require("../middleware/asyncWrapper.middleware");
const fs = require("fs")
const { uploadImageToCloudinaryMidlleware, deleteFromImageCloudinary } = require("../middleware/uploadToCloud.middleware");
const blogModel = require("../model/blog.model");
const { StatusCodes } = require("http-status-codes");
const moment = require("moment");
const createBlog = asyncWrapper(async (req, res) => {
    const { title, content, category } = req.body
    const { userId } = req.user
    const img = req.files.image
    if (!img) {
        throw new BAD_REQUEST("Image is missing")
    }
    if (!userId) {
        fs.unlinkSync(img.tempFilePath)
        throw new BAD_REQUEST("Something went wrong with the token or invailed blog id.")
    } else if (!title || !content || !category) {
        fs.unlinkSync(img.tempFilePath)
        throw new BAD_REQUEST("Title, content or category missing");
    }
    const result = await uploadImageToCloudinaryMidlleware(img)
    if (result.success === false) {
        throw new BAD_REQUEST(result.data.msg)
    }


    let createdObject = { title, content, category, createdBy: userId }
    createdObject = { ...createdObject, image: { ...result } }

    const blog = await blogModel.create(createdObject);
    
    return res.status(StatusCodes.OK).json({
        success: true,
        msg: "blog created request successfull!",
        data: blog

    });
});
const getAllBlogs = asyncWrapper(async (req, res) => {
    let { category, page, sort, search, createdBy } = req.query

    let searchObject = {
    }
    if (category && category !== "All") {
        searchObject.category = { $regex: category, $options: 'i' }
    }
    if (search) {
        searchObject.$or = [
            { content: { $regex: search, $options: 'i' } },
            { title: { $regex: search, $options: 'i' } }
        ]
    }
    if (createdBy) {
        searchObject.createdBy = createdBy

    }
    let blogs = blogModel.find(searchObject);

    if (sort === "a-z") {
        blogs = blogs.sort("title")
    }
    if (sort === "z-a") {
        blogs = blogs.sort("-title")

    }
    if (sort === "latest") {
        blogs = blogs.sort("-createdAt")

    }
    if (sort === "oldest") {
        blogs = blogs.sort("createdAt")

    }
    if (!page) {
        page = 1;
    } else {
        page = Number(page)
    }
    const limit = 10;
    const skip = (page - 1) * limit
    blogs = await blogs.skip(skip).limit(limit)
    const totalDocs = await blogModel.countDocuments(searchObject)
    const totalPages = Math.ceil(totalDocs / limit)
    if (blogs.length <= 0) {
        throw new NOT_FOUND("No blog created yet.")
    }
    return res.status(StatusCodes.OK).json({
        success: true,
        totalPages,
        msg: "blog data request successfull!",
        data: blogs

    });
});

const getSingleBlog = asyncWrapper(async (req, res) => {
    const { id } = req.params
    if (!id) {
        throw new BAD_REQUEST("Id no provided")
    }
    const blog = await blogModel.findOne({ _id: id })
    if (!blog) {

        throw new NOT_FOUND("No blog found.")
    }
    return res.status(StatusCodes.OK).json({
        success: true,
        msg: "blog data request successfull!",
        data: blog

    });
});
const updateBlog = asyncWrapper(async (req, res) => {
    const { title, content, category } = req.body
    const img = req.files?.image
    const { id } = req.params
    const { userId } = req.user
    let updateObject = { title, content, category }
    if (!userId || !id) {
        throw new BAD_REQUEST("Something went wrong with the token or invailed blog id.")
    } else if (!title || !content || !category) {
        throw new BAD_REQUEST("Title, content or category missing");
    }


    if (img) {
        const result = await uploadImageToCloudinaryMidlleware(img)
        updateObject = { ...updateObject, image: { ...result } }
        const blog = await blogModel.findOne({ _id: id, createdBy: userId })
        const deleted = await deleteFromImageCloudinary(blog.image.publicId)
        if (deleted.sucess === false) {
            throw new BAD_REQUEST(deleted.data.msg)
        }
    }
    const blog = await blogModel.findOneAndUpdate({ _id: id, createdBy: userId }, updateObject, { runValidators: true, new: true });

    if (!blog) {
        throw new NOT_FOUND("No blog found.")
    }
    return res.status(StatusCodes.OK).json({
        success: true,
        msg: "blog update request successfull!",
        data: blog

    });
});
const deleteBlog = asyncWrapper(async (req, res) => {
    const { id } = req.params;
    const { userId } = req.user;
    if (!id || !userId) {
        throw new BAD_REQUEST("Id required")
    }
    const blogForPublicId = await blogModel.findOne({ _id: id, createdBy: userId });
    const deleted = await deleteFromImageCloudinary(blogForPublicId.image.publicId)

    if (deleted.sucess === false) {
        throw new BAD_REQUEST(deleted.data.msg)
    }
    const blog = await blogModel.findOneAndDelete({ _id: id, createdBy: userId });
    if (!blog) {
        throw new NOT_FOUND("No blog found.")
    }
    return res.status(StatusCodes.OK).json({
        success: true,
        msg: "blog delete request successfull!",
        data: blog

    });
});
const getBlogsByCategory = asyncWrapper(async (req, res) => {

    const data = await blogModel.aggregate([
        {
            $match: { createdBy: new mongo.Types.ObjectId(req.user.userId) }
        },
        {
            $group: { _id: "$category", count: { $sum: 1 } }
        }
    ]);
    const stats = data.reduce((acc, cur) => {
        const { _id: title, count } = cur
        acc[title] = count
        return acc
    }, {})
    const defaultValues = {
        fashion: stats.fashion || 0,
        technology: stats.tech || 0,
        travel: stats.travel || 0,
        health: stats.health || 0,
        education: stats.education || 0,
        other: stats.other || 0,
    }

    let monthlyCategory = await blogModel.aggregate([
        { $match: { createdBy: new mongo.Types.ObjectId(req.user.userId) } },
        { $group: { _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } }, count: { $sum: 1 } } },
        { $sort: { "_id.year": -1, "_id.month": -1 } },
        { $limit: 6 }
    ]);

    monthlyCategory = monthlyCategory.map((item) => {
        const { _id: { month, year }, count } = item
        const date = moment().month(month - 1).year(year).format("MMM Y");
        return { date, count }
    }).reverse();

    return res.status(StatusCodes.OK).json({
        success: true,
        msg: "Request successfull",
        data: {
            defaultValues,
            monthlyCategory
        }
    })

});

module.exports = { getAllBlogs, getSingleBlog, updateBlog, deleteBlog, createBlog, getBlogsByCategory };