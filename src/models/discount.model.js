const mongoose = require("mongoose");

const discountSchema = new mongoose.Schema(
  {
    coupon: {
      required: true,
      type: String,
      unique: true,
    },
    type: {
      required: true,
      type: String,
      enum: ["fixed", "percent"],
    },
    value: {
      required: true,
      type: Number,
    },
    startDate: {
      required: true,
      type: Date,
    },
    endDate: {
      required: true,
      type: Date,
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

const Discount =
  mongoose.models.discounts ?? mongoose.model("discounts", discountSchema);
module.exports = Discount;
