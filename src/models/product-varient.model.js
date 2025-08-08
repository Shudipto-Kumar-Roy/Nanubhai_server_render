const mongoose = require("mongoose");

const productVarientSchema = new mongoose.Schema(
  {
    productId: {
      required: true,
      type: mongoose.Schema.Types.ObjectId,
    },
    varientId: {
      required: true,
      type: mongoose.Schema.Types.ObjectId,
    },
  },
  { timestamps: true }
);

const ProductVarient =
  mongoose.models.productvarients ??
  mongoose.model("productvarients", productVarientSchema);
module.exports = ProductVarient;
