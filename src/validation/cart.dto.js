const { default: zod } = require("zod");

const addToCartSchema = zod.object({
  productId: zod
    .string("Product id must be string")
    .trim()
    .nonempty("Product id is required!"),
  quantity: zod
    .number("Quantity must be number")
    .min(1, "Quantity must be at least 1"),
});

const changeCartQuantitySchema = zod.object({
  productId: zod
    .string("Product id must be string")
    .trim()
    .nonempty("Product id is required!"),
  quantity: zod
    .number("Quantity must be number")
    .min(1, "Quantity must be at least 1"),
  type: zod.enum(["INC", "DEC"], "Invalid type"),
});

module.exports = {
  addToCartSchema,
  changeCartQuantitySchema,
};
