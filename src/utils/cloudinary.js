import {v2 as cloudinary } from 'cloudinary';
import fs from 'fs'; 

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_CLOUD_API, 
    api_secret: process.env.CLOUDINARY_CLOUD_SECRET
});

const uploadOnCloudinary = async (file) => {
    try{
        if(!file) return null;
        const response = await cloudinary.uploader.upload(file,{
            resource_type: "auto",
        })
        console.log("Uploaded on cloudinary");
        console.log(response);
        return response
    }
    catch(error){
        fs.unlinkSync(file);
        return null;
    }
}

export {uploadOnCloudinary}