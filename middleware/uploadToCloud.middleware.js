const cloudinary = require("cloudinary").v2
const fs = require("fs");

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME || 'hamzahanif717',
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
});
async function uploadImageToCloudinaryMidlleware(img) {

    let errorObject = {}
    try {
        if (img.size > 1024 * 1024) {
            errorObject = {
                sucess: false, data: {
                    msg: "Image size should be less then 1Mb."
                }
            }
            return errorObject
        }

        if (!img.mimetype.startsWith("image/")) {
            errorObject = {
                sucess: false, data: {
                    msg: "Image files are only accepted."
                }
            }
            return errorObject

        }

        const uploadResult = await cloudinary.uploader.upload(
            img.tempFilePath, {
            use_filename: true,
            folder: "blog-images"
        }
        )

        if (!uploadResult.secure_url && !uploadResult.public_id) {
            errorObject = {
                sucess: false, data: {
                    msg: "file not uploaded succefully."
                }
            }
            return errorObject

        }
        fs.unlinkSync(img.tempFilePath);


        const imageData = {
            url: uploadResult.secure_url,
            publicId: uploadResult.public_id
        }


        return imageData;

    } catch (error) {
        return errorObject = {
            sucess: false, data: {
                msg: "some thing went wrong while uploading image to cloud."
            }
        }
    }

}
async function deleteFromImageCloudinary(public_id) {
    let errorObject = {}
    try {
        const { result } = await cloudinary.uploader.destroy(
            public_id
        )
        if (result === "ok") {
            
         return   {
                sucess: true, data: {
                    msg: "successfully deleted"
                }
            }
          

        } else {
            errorObject = {
                sucess: false, data: {
                    msg: "File Deletion failed"
                }
            }
            return errorObject


        }
    } catch (error) {
        errorObject = {
            sucess: false, data: {
                msg: "File Deletion failed"
            }
        }
        return errorObject
    }

}


module.exports = { uploadImageToCloudinaryMidlleware, deleteFromImageCloudinary }
