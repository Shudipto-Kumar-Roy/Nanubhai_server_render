const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema(
  {
    userId: {
      required: true,
      type: mongoose.Schema.Types.ObjectId,
    },
    productId: {
      required: true,
      type: mongoose.Schema.Types.ObjectId,
    },
    quantity: {
      required: true,
      type: Number,
    },
  },
  { timestamps: true }
);

const Cart = mongoose.models.carts ?? mongoose.model("carts", cartSchema);
module.exports = Cart;
