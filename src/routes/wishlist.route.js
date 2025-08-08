// ==>external import<==
const express = require("express");
const wishlistRouter = express.Router();

// ==>internal import<==
const { authCheck } = require("../middlewares/auth.middleware");
const WishlistController = require("../controllers/wishlist.controller");
const dtoValidate = require("../middlewares/validate.middleware");
const WishlistDTO = require("../validation/wishlist.dto");

wishlistRouter
  .route("/add")
  .post(
    authCheck,
    dtoValidate(WishlistDTO.addToWishlistSchema),
    WishlistController.addToWishlist
  );

wishlistRouter
  .route("/empty")
  .delete(authCheck, WishlistController.emptyWishlistProduct);

wishlistRouter
  .route("/all")
  .get(authCheck, WishlistController.getAllWishlistProduct);

wishlistRouter
  .route("/:id")
  .post(authCheck, WishlistController.addWishlistToCart)
  .delete(authCheck, WishlistController.removeFromWishlist);

module.exports = wishlistRouter;
