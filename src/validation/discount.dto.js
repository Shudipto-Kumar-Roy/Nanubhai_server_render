const { default: zod } = require("zod");

const createDiscountSchema = zod.object({
  coupon: zod
    .string("Coupon must be string")
    .trim()
    .nonempty("Coupon is required!"),
  type: zod.enum(["flat", "percent"], "Invalid status"),
  value: zod
    .number("Value must be number")
    .positive("Value must be positive")
    .min(1, "Value is required"),
  startDate: zod.preprocess(
    (arg) => new Date(arg),
    zod.date("Invalid start date")
  ),
  endDate: zod.preprocess((arg) => new Date(arg), zod.date("Invalid end date")),
});
const updateDiscountSchema = zod.object({
  coupon: zod.string("Coupon must be string").trim().optional(),
  type: zod.enum(["flat", "percent"], "Invalid status").optional(),
  value: zod
    .number("Value must be number")
    .positive("Value must be positive")
    .optional(),
  startDate: zod
    .preprocess((arg) => new Date(arg), zod.date("Invalid start date"))
    .optional(),
  endDate: zod
    .preprocess((arg) => new Date(arg), zod.date("Invalid end date"))
    .optional(),
});

const applyDiscountSchema = zod.object({
  coupon: zod
    .string("Coupon must be string")
    .trim()
    .nonempty("Coupon is required!"),
  productId: zod
    .string("Product id is required")
    .trim()
    .nonempty("Product id is required!"),
});

const activeInactiveDiscountSchema = zod.object({
  status: zod.enum(["active", "inactive"], "Invalid status"),
});

module.exports = {
  createDiscountSchema,
  updateDiscountSchema,
  applyDiscountSchema,
  activeInactiveDiscountSchema,
};
