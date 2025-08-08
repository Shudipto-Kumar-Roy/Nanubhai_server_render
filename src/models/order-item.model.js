const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    orderId: {
      required: true,
      type: mongoose.Schema.Types.ObjectId,
    },
    productId: {
      required: true,
      type: mongoose.Schema.Types.ObjectId,
    },
    productVarientId: {
      required: false,
      type: mongoose.Schema.Types.ObjectId,
    },
    name: {
      required: true,
      type: String,
    },
    image: {
      required: false,
      type: String,
    },
    price: {
      required: true,
      type: Number,
    },
    quantity: {
      required: true,
      type: String,
    },
    total: {
      required: true,
      type: Number,
    },
  },
  { timestamps: true }
);

const OrderItem =
  mongoose.models.orderitems ?? mongoose.model("orderitems", orderItemSchema);
module.exports = OrderItem;
