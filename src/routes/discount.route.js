// ==>external import<==
const express = require("express");
const discountRouter = express.Router();

// ==>internal import<==
const { authCheck, roleCheck } = require("../middlewares/auth.middleware");
const DiscountController = require("../controllers/discount.controller");
const dtoValidate = require("../middlewares/validate.middleware");
const DiscountDTO = require("../validation/discount.dto");

discountRouter
  .route("/create")
  .post(
    authCheck,
    roleCheck("admin"),
    dtoValidate(DiscountDTO.createDiscountSchema),
    DiscountController.createDiscount
  );

discountRouter
  .route("/apply")
  .post(
    authCheck,
    dtoValidate(DiscountDTO.applyDiscountSchema),
    DiscountController.applyDiscount
  );

discountRouter.route("/all").get(DiscountController.getAllDiscount);
discountRouter
  .route("/active-inactive/:id")
  .put(
    authCheck,
    roleCheck("admin"),
    dtoValidate(DiscountDTO.activeInactiveDiscountSchema),
    DiscountController.activeInactiveDiscount
  );

discountRouter
  .route("/:id")
  .get(authCheck, roleCheck("admin"), DiscountController.getSingleDiscount)
  .put(
    authCheck,
    roleCheck("admin"),
    dtoValidate(DiscountDTO.updateDiscountSchema),
    DiscountController.updateDiscount
  )
  .delete(authCheck, roleCheck("admin"), DiscountController.deleteDiscount);

module.exports = discountRouter;
