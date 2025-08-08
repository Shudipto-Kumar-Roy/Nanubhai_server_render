const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const ErrorHandler = require("../helper/error.helper");

// Generating a unique email verification token
async function getEmailVerificationToken(user) {
  // generating a token
  const token = crypto.randomBytes(20).toString("hex");

  // hashing and adding to userSchema
  user.emailVerifyToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
  user.emailVerifyExpire =
    Date.now() + process.env.VARIFICATION_EMAIL_EXPIRE * 60 * 1000;
  await user.save();
  return token;
}

// creating a refresh token
function refreshJWT(email) {
  const token = jwt.sign(
    {
      email: email,
    },
    process.env.JWT_SECRET_KEY,
    {
      expiresIn: process.env.REFRESH_JWT_TOKEN_EXPIRE,
    }
  );
  return token;
}

// creating a access token
function createJWT(email) {
  const token = jwt.sign(
    {
      email: email,
    },
    process.env.JWT_SECRET_KEY,
    {
      expiresIn: process.env.JWT_TOKEN_EXPIRE,
    }
  );
  return token;
}
// creating a new access token with refresh token
async function generateNewAccessToken(req, res, next) {
  const refreshToken = req.cookies[process.env.REFRESH_COOKIE_NAME];
  if (!refreshToken) {
    return next(new ErrorHandler("Refresh token missing!", 403));
  }
  const user = await User.findOne({ refreshToken });

  if (!user) {
    return next(new ErrorHandler("Invalid refresh token!", 403));
  }

  try {
    const { email } = jwt.verify(refreshToken, process.env.JWT_SECRET_KEY);

    const access_token = createJWT(email);
    return access_token;
  } catch (error) {
    return next(new ErrorHandler("Invalid refresh token!", 403));
  }
}

// Generating reset password token
async function getResetPasswordToken(user) {
  // generating reset token
  const resetToken = crypto.randomBytes(20).toString("hex");

  // hashing and adding to userSchema
  user.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  user.resetPasswordExpire =
    Date.now() + 1000 * 60 * process.env.RESET_PASSWORD_EXPIRE;
  await user.save();
  return resetToken;
}

// from flat categories create nested category
function nestCategories(categories) {
  // Initialize the map with each category
  const modifiedCategories = categories.map((category) => ({
    ...category?._doc,
    subcategories: [], // Add a subcategories array to each category
  }));

  // Create a map for efficient lookups
  const categoryMap = new Map();

  // Populate the map with the categories by their IDs
  modifiedCategories.forEach((category) => {
    categoryMap.set(category._id.toString(), category);
  });

  // Initialize an array to hold the root categories
  const rootCategories = [];

  // Build the nested structure
  modifiedCategories.forEach((category) => {
    if (category.parentId) {
      // If the category has a parent, add it to the parent's subcategories
      const parentCategory = categoryMap.get(category.parentId.toString());
      if (parentCategory) {
        parentCategory.subcategories.push(category);
      }
    } else {
      // If no parentId, this is a root category
      rootCategories.push(category);
    }
  });

  return rootCategories;
}

module.exports = {
  getEmailVerificationToken,
  refreshJWT,
  createJWT,
  generateNewAccessToken,
  getResetPasswordToken,
  nestCategories,
};
