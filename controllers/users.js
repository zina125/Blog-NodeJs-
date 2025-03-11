// const APIError = require("../util/APIError");
// const User = require("../models/users");

// const createUser = async (req, res, next) => {
//   try {
//     const data = req.body;
//     const user = await User.create({ ...data, role: "user" });
//     res.status(201).json({ status: "success", data: { user } });
//   } catch (error) {
//     next(error);
//   }
// };

// const getUsers = async (req, res) => {
//   const users = await User.find({ role: "user" });
//   if (!users) {
//     throw new APIError("No users found", 404);
//   }
//   res
//     .status(200)
//     .json({ status: "success", data: { length: users.length, users } });
// };

// const getUserById = async (req, res) => {
//   const userId = req.params.id;
//   const user = await User.findById(userId).populate("posts");
//   if (!user) {
//     throw new APIError(`user with id: ${userId} is not found`, 404);
//   }
//   res.status(200).json({ status: "success", data: { user } });
// };

// const updateUserById = async (req, res) => {
//   const userId = req.params.id;
//   const userData = req.body;

//   const updatedUser = await User.findOneAndUpdate(
//     { _id: userId },
//     { name: userData.name, email: userData.email },
//     {
//       new: true,
//       runValidators: true,
//     }
//   );

//   if (!updatedUser) {
//     throw new APIError(`user with id: ${userId} is not found`, 404);
//   }

//   res.status(200).json({ status: "success", data: { user: updatedUser } });
// };

// const deleteUserById = async (req, res) => {
//   const userId = req.params.id;
//   const deletedUser = await User.findByIdAndDelete(userId);

//   if (!deletedUser) {
//     throw new APIError(`user with id: ${userId} is not found`, 404);
//   }
//   res.status(204).json();
// };

// module.exports = {
//   createUser,
//   getUsers,
//   getUserById,
//   updateUserById,
//   deleteUserById,
// };


const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/users"); 
require("dotenv").config();

const signToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

exports.signup = async (req, res, next) => {
  try {
    const { name, email, password, passwordConfirm, role } = req.body;

    if (!name || !email || !password || !passwordConfirm) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (password !== passwordConfirm) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    console.log("🔹 Hashed Password Before Storing:", hashedPassword); 
    
    const user = await User.create({ name, email, password: hashedPassword, role });

    const token = signToken(user._id, user.role);
    res.status(201).json({ token, user });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    console.log("🔹 Login Attempt:", email, password);

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
    console.log("🔹 Retrieved User:", user);

    if (!user) {
      console.log("❌ Invalid credentials: User not found");
      return res.status(401).json({ message: "Incorrect email or password" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log("🔹 Stored Hashed Password:", user.password);
    console.log("🔹 Password Match Result:", isPasswordValid); 

    if (!isPasswordValid) {
      console.log("❌ Invalid credentials: Password mismatch");
      return res.status(401).json({ message: "Incorrect email or password" });
    }

    const token = signToken(user._id, user.role);
    console.log("✅ JWT token generated successfully");

    res.status(200).json({
      status: "success",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error("❌ Error during login:", error);
    next(error);
  }
};

exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json({ status: "success", count: users.length, data: users });
  } catch (error) {
    next(error);
  }
};

exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).populate("posts").select("-password");
    if (!user) return res.status(404).json({ message: "User not found!" });

    res.status(200).json({ status: "success", data: user });
  } catch (error) {
    next(error);
  }
};

exports.updateUserById = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name: req.body.name, email: req.body.email },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }

    res.status(200).json({ status: "success", data: { user } });
  } catch (error) {
    next(error);
  }
};

exports.deleteUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found!" });

    await user.deleteOne();
    res.status(204).json({ status: "success", data: null });
  } catch (error) {
    next(error);
  }
};



