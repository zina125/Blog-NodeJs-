const express = require("express");
const router = express.Router();
const postsController = require("../controllers/posts");
const authMiddleware = require("../middlewares/auth");
const restrictTo = require("../middlewares/restrictTo");
const { protect } = require("../middlewares/auth"); 

// Protect all routes
router.use(authMiddleware.protect);
router.use(protect); 

// Routes for posts
router.post("/", postsController.createPost);
router.get("/", postsController.getPosts);
router.get("/:id", postsController.getPostById);

// Allow only the post owner to update or delete
router.put("/:id", postsController.updatePost);
router.delete("/:id", postsController.deletePost);

module.exports = router;
