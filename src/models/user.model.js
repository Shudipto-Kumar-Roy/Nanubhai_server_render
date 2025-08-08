const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      required: true,
      type: String,
    },
    email: {
      required: true,
      unique: true,
      type: String,
    },
    password: {
      required: true,
      type: String,
    },
    phone: {
      required: false,
      type: String,
    },
    image: {
      type: String,
      default: "",
    },
    status: {
      required: true,
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    role: {
      required: true,
      type: String,
      enum: ["admin", "customer"],
      default: "customer",
    },
    provider: {
      required: true,
      type: String,
      default: "credentials",
    },
    isVerified: {
      required: true,
      type: Boolean,
      enum: [true, false],
      default: false,
    },
    refreshToken: String,
    emailVerifyToken: String,
    emailVerifyExpire: Date,
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  { timestamps: true }
);

const User = mongoose.models.users ?? mongoose.model("users", userSchema);
module.exports = User;
