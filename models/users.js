const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true, 
      match: [
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        "Please enter a valid email"
      ]
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false 
    },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user"
    },
    posts: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post"
    }]
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next(); 
  this.password = await bcrypt.hash(this.password, 12);
  console.log("🔹 Hashed Password Before Saving:", this.password); 
  next();
});

const User = mongoose.model("User", userSchema);

module.exports = User;
