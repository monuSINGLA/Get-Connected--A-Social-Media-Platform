import bcrypt from 'bcryptjs'
import {v2 as cloudinary} from 'cloudinary'

//models
import Notification from "../models/notification.model.js";
import User from "../models/user.model.js";

const getUserProfile = async (req, res) => {
  try {
    const { username } = req.params;

    const user = await User.findOne({ username }).select("-password");

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.log("Error in getUserProfile controller", error.message);
    return res.status(500).json({ error: error.message });
  }
};

const getSuggestedUsers = async (req, res) => {
  try {
    const userId = req.user._id;

    const userFollowedByMe = await User.findById(userId).select("following");

    const users = await User.aggregate([
      {
        $match: {
          _id: { $ne: userId },
        },
      },
      { $sample: { size: 10 } },
    ]);

    const filteredUsers = users.filter(
      (user) => !userFollowedByMe.following.includes(user._id)
    );
    const suggestedUsers = filteredUsers.slice(0, 4);

    suggestedUsers.forEach((user) => (user.password = null));

    res.status(200).json(suggestedUsers);
  } catch (error) {
    console.log("Error in getUserProfile controller", error.message);
    return res.status(500).json({ error: error.message });
  }
};

const followUnfollowUser = async (req, res) => {
  try {
    const { id } = req.params;
    const currentUserId = req.user._id;

    const userToFollowUnfollow = await User.findById(id);
    const currentUser = await User.findById(currentUserId);

    if (id.toString() === currentUserId.toString()) {
      return res
        .status(400)
        .json({ error: "You can't follow/unfollow yourself" });
    }

    if (!userToFollowUnfollow || !currentUser) {
      return res.status(400).json({ error: "User not found" });
    }

    const isFollowing = currentUser.following.includes(id);

    if (isFollowing) {
      // Unfollow the user
      await User.findByIdAndUpdate(id, { $pull: { followers: currentUserId } });
      await User.findByIdAndUpdate(currentUserId, { $pull: { following: id } });

      res.status(200).json({ message: "User unFollowed successfully" });
    } else {
      // Follow the user
      await User.findByIdAndUpdate(id, { $push: { followers: currentUserId } });
      await User.findByIdAndUpdate(currentUserId, { $push: { following: id } });
      // send notification to the user

      const notification = new Notification({
        type: "follow",
        from: currentUserId,
        to: userToFollowUnfollow._id,
      });

      await notification.save();

      res.status(200).json({ message: "User followed successfully" });
    }
  } catch (error) {
    console.log("Error in getUserProfile controller", error.message);
    return res.status(500).json({ error: error.message });
  }
};

const updateUser = async (req, res) => {
  const { fullName, email, username, currentPassword, newPassword, bio, link } =req.body;
  let { profileImg, coverImg } = req.body;

  const userId = req.user._id;

  try {

    let user = await User.findById(userId)
    if(!user){
        return res.status(404).json({error: "User not found"})
    }

    const usernameAlreadyExist = await User.findOne({username})
    if(usernameAlreadyExist){
      return res.status(400).json({error: "Username is Already Taken"})
    }

    const emailAlreadyExist = await User.findOne({email})
    if(emailAlreadyExist){
      return res.status(400).json({error: "Email is Already Taken"})
    }

    if((!newPassword && currentPassword) || (!currentPassword && newPassword)){
        return res.status(400).json({error: "Please provide both current password and new password"})
    }

    if(currentPassword && newPassword){
      const isPasswordMatch =await bcrypt.compare(currentPassword, user.password || "")
      if(!isPasswordMatch){
        return res.status(400).json({error: "Current password is incorrect"})
      }
      if(newPassword.length < 6){
        return res.status(400).json({error: "Password length must be 6 or more"})
      }

      const salt = await bcrypt.genSalt(10)
      user.password = await bcrypt.hash(newPassword, salt)
    }

    if(profileImg){
      if(user.profileImg){
        await cloudinary.uploader.destroy(user.profileImg.split("/").pop().split(".")[0]);
      }

      const uploadResposne = await cloudinary.uploader.upload(profileImg)
      profileImg = uploadResposne.secure_url
    }
    if(coverImg){
      if(user.coverImg){
        await cloudinary.uploader.destroy(user.coverImg.split("/").pop().split(".")[0]);
      }

      const uploadResposne = await cloudinary.uploader.upload(coverImg)
      coverImg = uploadResposne.secure_url
    }

    user.fullName = fullName || user.fullName
    user.username = username || user.username
    user.email = email || user.email
    user.bio = bio || user.bio
    user.link = link || user.link
    user.profileImg = profileImg || user.profileImg
    user.coverImg = coverImg || user.coverImg

    user = await user.save()

    //password should be null in response
    user.password = null

    return res.status(200).json(user)

  } catch (error) {
    console.log("Error in updateUser controller", error.message);
    return res.status(500).json({ error: error.message });
  }
};

export { getUserProfile, getSuggestedUsers, followUnfollowUser, updateUser };
