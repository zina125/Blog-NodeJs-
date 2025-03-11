// const APIError = require("../util/APIError");
// const Post = require("../models/posts");
// const User = require("../models/users");

// const createPost = async (req, res, next) => {
//   console.log('Creating post with data:', req.body);
//   try {
//     const newPost = new Post(req.body);
//     await newPost.save();
//     console.log('Post created successfully:', newPost);
//     res.status(201).json({ status: "success", data: { post: newPost } });
//   } catch (err) {
//     console.error('Error creating post:', err);
//     next(err);
//   }
// };

// const getPosts = async (req, res, next) => {
//   console.log('Fetching all posts...');
//   try {
//     const posts = await Post.find();
//     console.log(`Found ${posts.length} posts`);
//     res.status(200).json({ status: "success", data: { posts } });
//   } catch (err) {
//     console.error('Error fetching posts:', err);
//     next(err);
//   }
// };

// const getPostById = async (req, res, next) => {
//   console.log(`Fetching post with ID: ${req.params.id}`);
//   try {
//     const post = await Post.findById(req.params.id);
//     if (!post) {
//       return res.status(404).json({ status: "failure", message: "Post not found" });
//     }
//     res.status(200).json({ status: "success", data: { post } });
//   } catch (err) {
//     console.error("Error fetching post:", err);
//     next(err);
//   }
// };


// const updatePost = async (req, res, next) => {
//   console.log(`Updating post with ID: ${req.params.id}`);
//   try {
//     const post = await Post.findByIdAndUpdate(req.params.id, req.body, {
//       new: true, // Return the updated post
//       runValidators: true, // Ensure validation rules are applied
//     });

//     if (!post) {
//       return res.status(404).json({ status: "failure", message: "Post not found" });
//     }

//     res.status(200).json({ status: "success", data: { post } });
//   } catch (err) {
//     console.error("Error updating post:", err);
//     next(err);
//   }
// };


// const deletePost = async (req, res, next) => {
//   console.log(`Deleting post with ID: ${req.params.id}`);
//   try {
//     const post = await Post.findByIdAndDelete(req.params.id);

//     if (!post) {
//       return res.status(404).json({ status: "failure", message: "Post not found" });
//     }

//     res.status(200).json({ status: "success", message: "Post deleted successfully" });
//   } catch (err) {
//     console.error("Error deleting post:", err);
//     next(err);
//   }
// };


// module.exports = {
//   createPost,
//   getPosts,
//   getPostById,
//   updatePost,
//   deletePost
// };


const Post = require("../models/posts");

// Create a Post
exports.createPost = async (req, res, next) => {
  try {
    req.body.userId = req.user.id; 
    const newPost = await Post.create(req.body);
    res.status(201).json({ status: "success", data: { post: newPost } });
  } catch (err) {
    next(err);
  }
};


exports.getPosts = async (req, res, next) => {
  try {
    const posts = await Post.find().populate("userId").lean();

    if (!posts.length) {
      return res.status(404).json({ message: "No posts found" });
    }

    const userPosts = posts.map(post => ({
      ...post,
      isUserPost: post.userId && post.userId._id 
        ? post.userId._id.toString() === req.user.id.toString() 
        : false 
    }));

    res.status(200).json({ status: "success", data: { posts: userPosts } });
  } catch (err) {
    next(err);
  }
};


// Get a Single Post by ID
exports.getPostById = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id).populate("userId").lean();

    if (!post) {
      return res.status(404).json({ status: "failure", message: "Post not found" });
    }

    res.status(200).json({
      status: "success",
      data: {
        post,
        isUserPost: post.userId && post.userId._id 
          ? post.userId._id.toString() === req.user.id.toString() 
          : false
      },
    });
  } catch (err) {
    next(err);
  }
};


// Update a Post (Only the Creator Can Update)
exports.updatePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    
    if (post.userId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: "You can only update your own posts!" });
    }

    Object.assign(post, req.body);
    await post.save();

    res.status(200).json({ status: "success", data: { post } });
  } catch (err) {
    next(err);
  }
};


// Delete a Post (Only the Creator Can Delete)
exports.deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    if (post.userId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: "You can only delete your own posts!" });
    }

    await post.deleteOne();
    res.status(200).json({ message: "Post deleted successfully!" });
  } catch (err) {
    next(err);
  }
};
