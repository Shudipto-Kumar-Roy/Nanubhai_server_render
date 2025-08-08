const { default: zod } = require("zod");

const createCategorySchema = zod.object({
  name: zod
    .string("Category name must be string")
    .trim()
    .nonempty("Category name is required"),
  parentId: zod.string("Parent ID must be string").trim().optional(),
});

const updateCategorySchema = zod.object({
  name: zod.string("Category name must be string").trim().optional(),
  parentId: zod.string("Parent ID must be string").trim().optional(),
});
const activeInactiveCategorySchema = zod.object({
  status: zod.enum(["active", "inactive"], "Invalid status!"),
});

module.exports = {
  createCategorySchema,
  updateCategorySchema,
  activeInactiveCategorySchema,
};
