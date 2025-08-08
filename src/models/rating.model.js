const mongoose = require("mongoose");

const ratingSchema = new mongoose.Schema(
  {
    productId: {
      required: true,
      type: mongoose.Schema.Types.ObjectId,
    },
    userId: {
      required: true,
      type: mongoose.Schema.Types.ObjectId,
    },
    rating: {
      required: true,
      type: Number,
    },
    review: {
      required: true,
      type: String,
    },
    status: {
      required: true,
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  { timestamps: true }
);

const Rating =
  mongoose.models.ratings ?? mongoose.model("ratings", ratingSchema);
module.exports = Rating;
