const mongoose = require("mongoose");

const varientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: false,
    },
    value: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Varient =
  mongoose.models.varients ?? mongoose.model("varients", varientSchema);
module.exports = Varient;
