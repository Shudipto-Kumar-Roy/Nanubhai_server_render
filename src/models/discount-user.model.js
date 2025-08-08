const mongoose = require("mongoose");

const discountUserSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
  },
  { timestamps: true }
);

const DiscountUser =
  mongoose.models.discountusers ??
  mongoose.model("discountusers", discountUserSchema);
module.exports = DiscountUser;
