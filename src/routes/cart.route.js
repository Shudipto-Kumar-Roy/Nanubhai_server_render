// ==>external import<==
const express = require("express");
const cartRouter = express.Router();

// ==>internal import<==
const { authCheck } = require("../middlewares/auth.middleware");
const CartController = require("../controllers/cart.controller");
const dtoValidate = require("../middlewares/validate.middleware");
const CartDTO = require("../validation/cart.dto");

cartRouter
  .route("/add")
  .post(
    authCheck,
    dtoValidate(CartDTO.addToCartSchema),
    CartController.addToCart
  );

cartRouter.route("/empty").delete(authCheck, CartController.emptyCartProduct);

cartRouter.route("/all").get(authCheck, CartController.getAllCartProduct);

cartRouter
  .route("/change-quantity")
  .put(
    authCheck,
    dtoValidate(CartDTO.changeCartQuantitySchema),
    CartController.changeCartQuantity
  );

cartRouter.route("/:id").delete(authCheck, CartController.removeFromCart);

module.exports = cartRouter;
