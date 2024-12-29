import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js";
import {APIResponse} from "../utils/ApiResponse.js"
const registerUser = asyncHandler(async (req, res) => {
  const { username, fullName, email, password } = req.body;
  console.log("email ", email);
  if ([fullName, email, username, password].some((fields) => fields?.trim() === "")) {
    throw new ApiError(400, "All filed are required");
  }
  if (email.includes("@") === false) {
    throw new ApiError(400, "email is not correct!");
  }
  const existedUser = User.findOne({
    $or: [{ username }],
  });
  const existedEmail = User.findOne({
    $or:[{email}]
  })
  if(existedUser){throw new ApiError(409,"UserName alerady exists")}
  if(existedEmail){throw new ApiError(409,"Email already registered")}
  
  const avatarLocalPath = req.files?.avatar[0]?.path;
  const coverImageLocalPath = req.files?.coverImage[0]?.path;
  if (!avatarLocalPath){
    throw new ApiError(400, "Avatar file is required")
  }
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);
  if(!avatar){
    throw new ApiError(400, "Avatar file is required")
  }
  const user = await User.create({
    password,
    fullName,
    username,
    avatar: avatar.url,
    coverImage: coverImage?.url|| "",
    email,
    username: username.toLowercase()
  })
  const userCreated  = await User.findById(user._id).select("-password -refreshToken");
  if(!userCreated){
    throw new ApiError(500,"Something went wrong while registering the user")
  }
  return res.status(201).json(
    new APIResponse(200,userCreated,"User registered Successfully!!")  
  )
});
export { registerUser };
