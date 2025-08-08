const mongoose = require("mongoose");

const wishlistSchema = new mongoose.Schema(
  {
    userId: {
      required: true,
      type: mongoose.Schema.Types.ObjectId,
    },
    productId: {
      required: true,
      type: mongoose.Schema.Types.ObjectId,
    },
  },
  { timestamps: true }
);

const Wishlist =
  mongoose.models.wishlists ?? mongoose.model("wishlists", wishlistSchema);
module.exports = Wishlist;
