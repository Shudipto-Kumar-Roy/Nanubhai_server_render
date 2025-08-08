const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      required: true,
      type: String,
    },
    slug: {
      required: true,
      type: String,
      unique: true,
    },
    categoryId: {
      required: true,
      type: mongoose.Schema.Types.ObjectId,
    },
    brandId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    description: {
      required: true,
      type: String,
    },
    price: {
      required: true,
      type: Number,
    },
    previousPrice: {
      type: Number,
      default: null,
    },
    stock: {
      required: true,
      type: Number,
      default: 0,
    },
    sold: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    featured: {
      type: Boolean,
      required: false,
      default: false,
    },
    freeDelivery: {
      type: Boolean,
      required: false,
      default: false,
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

const Product =
  mongoose.models.products ?? mongoose.model("products", productSchema);
module.exports = Product;
