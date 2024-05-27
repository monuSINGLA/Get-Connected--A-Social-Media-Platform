import { v2 as cloudinary } from "cloudinary";

import Post from "../models/post.model.js";
import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";


const createPost = async (req, res) => {
  try {
    const { text } = req.body;
    let { img } = req.body;
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (!text && !img) {
      return res.status(400).json({ error: "Post must have text or image" });
    }

    if (img) {
      const uplodedResponse = await cloudinary.uploader.upload(img);
      img = uplodedResponse.secure_url;
    }

    const newPost = new Post({
      user: userId,
      text,
      img,
    });

    await newPost.save();
    res.status(200).json(newPost);
  } catch (error) {
    console.log("Error in createPost controller", error.message);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const likeUnlikePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user._id;

    let post = await Post.findById(postId);
    if (!post) {
      return res.status(400).json({ error: "Post not found" });
    }

    const isLiked = post.likes.includes(userId);

    if (isLiked) {
      // unlike post
      await Post.updateOne({ _id: postId }, { $pull: { likes: userId } });
      await User.updateOne({_id: userId}, {$pull: {likedPosts: postId}})

      const updatedLikes = post.likes.filter((id)=> id.toString() !== userId.toString())
      res.status(200).json(updatedLikes);
    } else {
      // like post
      post.likes.push(userId);
      await User.updateOne({_id: userId}, {$push: {likedPosts: postId}})
      await post.save();

      const notification = new Notification({
        type: "like",
        from: userId,
        to: post.user,
      });
      await notification.save()

      const updatedLikes = post.likes
      res.status(200).json(updatedLikes);
    }
  } catch (error) {
    console.log("Error in likeUnlikePost controller", error.message);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const commentOnPost = async (req, res) => {
  try {
    const postId = req.params.id;
    const { text } = req.body;
    const userId = req.user._id;

    if (!text) {
      return res.status(400).json({ error: "Text field is required" });
    }

    let post = await Post.findById(postId).populate({
      path : "comments.user",
      select: "-password"

    })
    if (!post) {
      return res.status(400).json({ error: "Post not found" });
    }

    const comment = { user: userId, text };

    post.comments.push(comment);
    await post.save();

    res.status(200).json(post);
  } catch (error) {
    console.log("Error in commentOnPost controller", error.message);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const currentUserId = req.user._id;

    const post = await Post.findById(id);
    if (!post) {
      return res.status(400).json({ error: "Post not found" });
    }

    if (post.user.toString() !== currentUserId.toString()) {
      return res
        .status(400)
        .json({ error: "You are not authorized to delete this post" });
    }

    if (post.img) {
      await cloudinary.uploader.destroy(
        post.img.split("/").pop().split(".")[0]
      );
    }

    await Post.findByIdAndDelete(id);

    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    console.log("Error in deletePost controller", error.message);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const getAllPosts = async (req,res) => {
  try {
    const userId = req.user._id
    const user = await User.findById(userId)

    if(!user){
      return res.status(404).json({error: "User not found"})
    }

    const allPosts = await Post.find().sort({createdAt: -1}).populate({
      path: "user",
      select: "-password"
    }).populate({
      path: "comments.user",
      select: "-password"
    })
    if(allPosts.length === 0){
      return res.status(200).json([])
    }

    res.status(200).json(allPosts)
    
  } catch (error) {
    console.log("Error in getAllPosts controller", error.message);
    return res.status(500).json({ error: "Internal server error" });
  }
}

const getLikedPosts = async (req,res) => {

  const userId = req.params.id 
  try {
    const user = await User.findById(userId)

    if(!user){
      return res.status(404).json({error: "User not found"})
    }
    
    const likedPosts = await Post.find({_id : {$in : user.likedPosts}})
    .populate({
      path: "user",
      select: "-password"
    })
    .populate({
      path: "comments.user",
      select: "-paasword"
    })

    res.status(200).json(likedPosts)
    
  } catch (error) {
    console.log("Error in getLikedPosts controller", error.message);
    return res.status(500).json({ error: "Internal server error" });
  }

}

const getFollowingPosts = async (req, res) => {
  try {
    const userId = req.user._id
    
    const user = await User.findById(userId)
    if(!user){
      return res.status(404).json({error: "User not found"})
    }

    const followingPost = await Post.find({user : {$in: user.following}})
    .sort({createdAt: -1})
    .populate({
      path: "user",
      select: "-password"
    })
    .populate({
      path: "comments.user",
      select: "-password"
    })
    
    res.status(200).json(followingPost)

  } catch (error) {
    console.log("Error in getFollowingPosts controller", error.message);
    return res.status(500).json({ error: "Internal server error" });  
  }
}

const getUserPosts = async (req, res) => {
  const {username} = req.params

  try {

    const user = await User.findOne({username})

    if(!user){
      return res.status(404).json({error: "User not found"})
    }

    const userPosts = await Post.find({user: user._id})
    .sort({createdAt: -1})
    .populate({
      path : "user",
      select: "-passowrd"
    })
    .populate({
      path: "comments.user",
      select: "-password"
    })

    res.status(200).json(userPosts)
    
  } catch (error) {
    console.log("Error in getUserPosts controller", error.message);
    return res.status(500).json({ error: "Internal server error" });  
  }
}


export { createPost, likeUnlikePost, commentOnPost, deletePost, getAllPosts ,getLikedPosts, getFollowingPosts, getUserPosts};
