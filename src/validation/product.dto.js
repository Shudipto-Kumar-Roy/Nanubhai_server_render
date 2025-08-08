const { default: zod } = require("zod");

const createProductSchema = zod.object({
  name: zod
    .string("Product name must be a string")
    .trim()
    .nonempty("Product name is required!"),
  categoryId: zod
    .string("Category id must be a string")
    .trim()
    .nonempty("Category id is required!"),
  brandId: zod
    .string("Brand id must be a string")
    .trim()
    .nonempty("Brand id is required!"),
  description: zod
    .string("Product description must be a string")
    .trim()
    .nonempty("Product description is required!"),
  price: zod
    .number("Product price must be a number")
    .positive("Product price must be positive")
    .min(1, "Product price is required!"),
  previousPrice: zod
    .number("Previous price must be a number")
    .positive("Previous price must be positive")
    .optional(),
  stock: zod
    .number("Stock must be a number")
    .positive("Stock must be positive")
    .min(1, "Product stock is required!"),
  featured: zod.enum(["true", "false"], "Invalid featured status").optional(),
});

const updateProductSchema = zod.object({
  name: zod.string("Product name must be string").trim().optional(),
  categoryId: zod.string("Category id must be string").trim().optional(),
  brandId: zod.string("Brand id must be string").trim().optional(),
  description: zod
    .string("Product description must be string")
    .trim()
    .optional(),
  price: zod
    .number("Product price must be a number")
    .positive("Product price must be positive")
    .optional(),
  previousPrice: zod
    .number("Previous price must be a number")
    .positive("Previous price must be positive")
    .optional(),
  stock: zod
    .number("Stock must be a number")
    .positive("Stock must be positive")
    .optional(),
  featured: zod.enum(["true", "false"], "Invalid featured status").optional(),
  freeDelivery: zod
    .enum(["true", "false"], "Invalid free delivery status")
    .optional(),
  status: zod.enum(["active", "inactive"], "Invalid status").optional(),
});

const activeInactiveProductSchema = zod.object({
  status: zod.enum(["active", "inactive"], "Invalid status"),
});

const productImageUploadSchema = zod.object({
  productId: zod
    .string("Product id must be string")
    .trim()
    .nonempty("Product id is required!"),
});

const addProductVarientSchema = zod.object({
  productId: zod
    .string("Product id must be string")
    .trim()
    .nonempty("Product id is required!"),
  varientId: zod
    .string("Varient id must be string")
    .trim()
    .nonempty("Varient id is required!"),
});
const removeProductVarientSchema = zod.object({
  productId: zod
    .string("Product id must be string")
    .trim()
    .nonempty("Product id is required!"),
});

module.exports = {
  createProductSchema,
  updateProductSchema,
  activeInactiveProductSchema,
  productImageUploadSchema,
  addProductVarientSchema,
  removeProductVarientSchema,
};
