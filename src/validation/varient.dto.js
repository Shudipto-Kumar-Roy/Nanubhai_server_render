const { default: zod } = require("zod");

const createVarientSchema = zod.object({
  name: zod
    .string("Varient name must be string")
    .trim()
    .nonempty("Varient name is required"),
  value: zod
    .string("Varient value must be string")
    .trim()
    .nonempty("Varient Value is required"),
});

module.exports = { createVarientSchema };
