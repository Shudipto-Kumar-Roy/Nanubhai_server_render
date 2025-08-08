const { default: zod } = require("zod");

const createUserSchema = zod.object({
  name: zod
    .string("Name must be a string!")
    .trim()
    .nonempty("Name is required!")
    .max(30, "Name length maximum 30 character!"),

  email: zod.email("Invalid email!").trim().nonempty("Email is required!"),

  password: zod
    .string("Password must be a string!")
    .nonempty("Password is required!")
    .min(8, "Password must be at least 8 character!"),

  phone: zod
    .string("Phone number must be a string!")
    .nonempty("Phone number is required!")
    .regex(
      /^(01)[0-9]{9}$/,
      "Phone number must be 11 digits and start with 01!"
    ),
});

const loginUserSchema = zod.object({
  email: zod.email("Invalid email!").trim().nonempty("Email is required!"),
  password: zod
    .string("Password must be a string!")
    .trim()
    .nonempty("Password is required!"),
});

const updateUserProfileSchema = zod.object({
  name: zod.string("Name must be a string!").trim().optional(),
  phone: zod
    .string("Phone number must be a string!")
    .trim()
    .regex(/^(01)[0-9]{9}$/, "Invalid phone number!")
    .optional(),
});

const updateUserPasswordSchema = zod.object({
  oldPassword: zod
    .string("Old password must be a string!")
    .trim()
    .nonempty("Old password is required!")
    .min(8, "Old password must be at least 8 character!"),
  newPassword: zod
    .string("New password must be a string!")
    .trim()
    .nonempty("New password is required!")
    .min(8, "New password must be at least 8 character!"),
  confirmPassword: zod
    .string("Confirm password must be a string!")
    .trim()
    .nonempty("Confirm password is required!")
    .min(8, "Confirm password must be at least 8 character!"),
});

const formgetPasswordSchema = zod.object({
  email: zod.email("Invalid email!").trim().nonempty("Email is required!"),
});

const resetUserPasswordSchema = zod.object({
  newPassword: zod
    .string()
    .min(8, "New password must be at least 8 character!")
    .nonempty("New password is required!"),
  confirmPassword: zod
    .string()
    .min(8, "Confirm password must be at least 8 character!")
    .nonempty("Confirm password is required!"),
});

const blockUnblockUserSchema = zod.object({
  status: zod.enum(["active", "inactive"], "Invalid status!"),
});

module.exports = {
  createUserSchema,
  loginUserSchema,
  updateUserProfileSchema,
  updateUserPasswordSchema,
  formgetPasswordSchema,
  resetUserPasswordSchema,
  blockUnblockUserSchema,
};
