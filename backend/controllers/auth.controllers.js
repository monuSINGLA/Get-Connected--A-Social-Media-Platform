import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import generateTokenAndSetCookie from "../utils/generateTokenAndSetCookie.js";

const signup = async (req, res) => {
  try {
    const { fullName, username, email, password } = req.body;

    // Check for empty fields
    if (!username || !fullName || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Validate email format
    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    // Check for existing username
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ error: "Username is already taken" });
    }

    // Check for existing email
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ error: "Email is already taken" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ error: "Password length must be 6 or more" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create a new user
    const newUser = new User({
      fullName,
      username,
      email,
      password: hashedPassword,
    });

    // Save the user
    await newUser.save();

    // Generate token and set cookie
    generateTokenAndSetCookie(newUser._id, res);

    // Send response
    res.status(201).json({
      _id: newUser._id,
      username: newUser.username,
      fullName: newUser.fullName,
      email: newUser.email,
      followers: newUser.followers,
      following: newUser.following,
      profileImg: newUser.profileImg,
      coverImg: newUser.coverImg,
    });
  } catch (error) {
    console.log("Error in signup controller", error.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const login = async (req, res) => {
  try {
    const {username, password} = req.body

    if(!username || !password){
      return res.status(400).json({ error: "All fileds are required" });
    }

    const user = await User.findOne({username})

    if(!user){
      return res.status(400).json({ error: "Invalid username" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user?.password || "")

    if(!isPasswordCorrect){
      return res.status(400).json({ error: "Invalid password" });
    }

    generateTokenAndSetCookie(user._id, res)

    res.status(200).json({
      _id: user._id,
      username: user.username,
      fullName: user.fullName,
      email: user.email,
      followers: user.followers,
      following: user.following,
      profileImg: user.profileImg,
      coverImg: user.coverImg,
    });
  } catch (error) {
    console.log("Error in login controller", error.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const logout = async (req, res) => {
  try {
    res.cookie("jwt","", {maxAge: 0})
    res.status(200).json({message:"Logged out successfully"})
  } catch (error) {
    console.log("Error in logout controller", error.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const getMe = async (req, res)=>{
  try {
    const user = await User.findById(req.user._id).select("-password")
    res.status(200).json(user)
  } catch (error) {
    console.log("Error in getMe controller", error.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

export { signup, login, logout, getMe };
