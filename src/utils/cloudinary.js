import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_CLOUD_API,
  api_secret: process.env.CLOUDINARY_CLOUD_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath)
      return console.log(
        "Error during sending File : Cloud not access the path of file"
      );
    const respose = await cloudinary.uploader.upload(localFilePath, {
      resource_type: auto,
    });
    console.log("File is success fully uploaded", respose.url);
    return respose;
  } catch (error) {
    fs.unlinkSync(localFilePath);
    return console.log("Error : ",error);
  }
};

export {uploadOnCloudinary}
