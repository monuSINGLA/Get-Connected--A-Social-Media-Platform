import { Router } from "express";
import { commentOnPost, createPost, deletePost, likeUnlikePost } from "../controllers/post.controllers.js";
import protectRoute from "../middleware/protectRoute.js";

const router = Router()

router.post("/create",protectRoute, createPost)
router.post("/like/:id",protectRoute, likeUnlikePost)
router.post("/comment/:id",protectRoute, commentOnPost)
router.delete("/:id",protectRoute, deletePost)

export default router