import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import cookieParser from "cookie-parser";
import {uploadOnCloudinary} from "../utils/cloudinary.js";
import {APIResponse} from "../utils/ApiResponse.js"
import mongoose from "mongoose";


const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId)
    const accessToken = user.generateAccessToken()//.generateAccessToken
    const refreshToken = user.generateRefreshToken()
    user.refreshToken = refreshToken
    await user.save({validateBeforeSave:false})

    return {refreshToken,accessToken}
  } catch (error) {
    throw new ApiError (500,"Something went wrong while referesh and access token")
  }
}

const registerUser = asyncHandler(async (req, res) => {
  console.log(req.body,req.files);
  const { username, fullName, email, password } = req.body;
  console.log("email ", email);
  if ([fullName, email, username, password].some((fields) => fields?.trim() === "")) {
    throw new ApiError(400, "All filed are required");
  }
  if (email.includes("@") === false) {
    throw new ApiError(400, "email is not correct!");
  }
  const existedUser = await User.findOne({
    $or: [{ username }],
  });
  const existedEmail = await User.findOne({
    $or:[{email}]
  })
  if(existedUser){throw new ApiError(409,"UserName alerady exists")}
  if(existedEmail){throw new ApiError(409,"Email already registered")}
  
  const avatarLocalPath = req.files?.avatar[0]?.path;
  console.log(avatarLocalPath);
  const coverImageLocalPath = req.files?.coverImage?.[0]?.path;
  console.log(coverImageLocalPath);
  if (!avatarLocalPath){
    throw new ApiError(400, "Avatar file is required")
  }
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  let coverImage = await uploadOnCloudinary(coverImageLocalPath);
  
  if(!avatar){
    throw new ApiError(500, " failed to upload avatar")
  }
  if(!coverImage){
    coverImage ="none";
  }
  console.log(avatar,coverImage);
  const user = await User.create({
    password,
    fullName,
    username,
    avatar: avatar,
    coverImage: coverImage ,
    email,
    username: username
  })
  const userCreated  = await User.findById(user._id).select("-password -refreshToken");
  if(!userCreated){
    throw new ApiError(500,"Something went wrong while registering the user")
  }
  return res.status(201).json(
    new APIResponse(200,userCreated,"User registered Successfully!!")  
  )
});

const loginUser = asyncHandler(async (req,res) => {
  //req bod  ->  data
  // giving access to username or email
  // find user in db
  // password check
  // gernate access token refersh toke
  // sending these toke in cookies
  const {username , email , password} = req.body
  console.log(email,username,password);
  if (!username && !email) {
    throw new ApiError(400,"Email or Username required")
  }
  const user =await User.findOne({
    $or:[{username},{email}]
  })
  if(!user){
    throw new ApiError(404,"User not registered")
  }
  const isPasswordValid = await user.isPasswordCorrect(password)//user.isPasswordCorrect(password)
  if(!isPasswordValid){
    throw new ApiError(404,"Password incorect")
  }
  const {accessToken,refreshToken} =await generateAccessAndRefreshTokens(user._id)
  console.log(accessToken,refreshToken);
  const loggedInUser = await User.findById(user._id).select("-password -refresToken")

  const options = {
    httpOnly: true,
    secure: false
  };
  
  return res
  .status(200)
  .cookie("accessToken",accessToken,options)
  .cookie("refreshToken",refreshToken,options)
  .json(
    new APIResponse(
      200,
      {
        user:loggedInUser,accessToken,refreshToken
      },
      "User logged in Successfully"
    )
  )
})

const logoutUser = asyncHandler(async(req,res) => {
  console.log(req.cookies);
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set:{
        refreshToken:undefined
      },
      
    },
    {
      new:true
    }
  )
  const option = {
    httpOnly:true,
    secure:true,
  }
  return res.status(200).clearCookie("accessToken",option).clearCookie("refreshToken",option)
  .json(new APIResponse(200,{},"User Logged Out successfully"))
})
export { registerUser,loginUser,logoutUser };
