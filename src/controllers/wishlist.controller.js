// ==> external import <==

// ==> internal import <==
const { catchAsyncError } = require("../middlewares/catchAsync.middleware");
const Wishlist = require("../models/wishlist.model");
const Cart = require("../models/cart.model");
const ErrorHandler = require("../helper/error.helper");
const Product = require("../models/product.model");

// ==> add a product to wishlist <==
exports.addToWishlist = catchAsyncError(async (req, res, next) => {
  const { productId } = req.body;
  const userId = req.user._id;

  const existProduct = await Product.findById(productId);

  if (!existProduct) {
    return next(new ErrorHandler("Product not found!", 400));
  }
  const existWishlist = await Wishlist.findOne({ userId, productId });
  if (existWishlist) {
    return next(
      new ErrorHandler("Product already exist in the wishlist!", 400)
    );
  }

  await Wishlist.create({
    userId,
    productId,
  });

  return res.status(201).json({
    success: true,
    message: `Product added to wishlist!`,
  });
});

// ==> add a product from wishlist to cart<==
exports.addWishlistToCart = catchAsyncError(async (req, res, next) => {
  const id = req.params.id;
  if (!id) {
    return new ErrorHandler("Wishlist id is requried");
  }
  const existWishlist = await Wishlist.findById(id);
  if (!existWishlist) {
    return next(new ErrorHandler("Product not found in wishlist!", 404));
  }

  const existProduct = await Cart.findOne({
    userId: existWishlist.userId,
    productId: existWishlist.productId,
  });

  if (existProduct) {
    let newQuantity = existProduct.quantity + 1;
    await Cart.updateOne(
      { userId: existWishlist.userId, productId: existWishlist.productId },
      { quantity: newQuantity }
    );
  } else {
    await Cart.create({
      userId: existWishlist.userId,
      productId: existWishlist.productId,
      quantity: 1,
    });
  }
  await existWishlist.deleteOne();
  return res.status(201).json({
    success: true,
    message: `Product added from wishlist to cart!`,
  });
});

// ==> get all products from wishlist  <==
exports.getAllWishlistProduct = catchAsyncError(async (req, res, next) => {
  const userId = req.user._id;
  const pageno = req?.query?.page ? Number(req?.query?.page) : 1;
  const perpage = req?.query?.limit ? Number(req?.query?.limit) : 10;
  const skip = (pageno - 1) * perpage;
  const resData = await Wishlist.aggregate([
    {
      $facet: {
        wishlist: [
          { $match: { userId } },
          {
            $lookup: {
              from: "products",
              localField: "productId",
              foreignField: "_id",
              as: "products",
            },
          },
          {
            $lookup: {
              from: "productimages",
              localField: "productId",
              foreignField: "productId",
              as: "images",
            },
          },
          {
            $project: {
              userId: 1,
              createdAt: 1,
              "products.name": 1,
              "products.price": 1,
              "products.rating": 1,
              "products.stock": 1,
              firstImage: {
                image: { $arrayElemAt: ["$images.image", 0] },
                createdAt: { $arrayElemAt: ["$images.createdAt", 0] },
              },
            },
          },
          { $skip: skip },
          { $limit: perpage },
        ],
        total: [{ $match: { userId } }, { $count: "count" }],
      },
    },
  ]);

  if (resData[0].wishlist.length === 0) {
    return res.status(200).json({
      success: true,
      wishlist: [],
      total: 0,
    });
  }
  return res.status(200).json({
    success: true,
    wishlist: resData[0].wishlist,
    total: resData[0].total[0].count,
  });
});

// ==> remove a product from wishlist  <==
exports.removeFromWishlist = catchAsyncError(async (req, res, next) => {
  const id = req.params.id;
  if (!id) {
    return new ErrorHandler("Wishlist id is requried");
  }
  const existWishlist = await Wishlist.findById(id);
  if (!existWishlist) {
    return next(new ErrorHandler("Product not found in wishlist!", 404));
  }
  await existWishlist.deleteOne();
  return res.status(200).json({
    success: true,
    message: `Product removed from wishlist!`,
  });
});

// ==> empty wishlist  <==
exports.emptyWishlistProduct = catchAsyncError(async (req, res, next) => {
  const userId = req.user._id;
  await Wishlist.deleteMany({ userId });
  return res.status(200).json({
    success: true,
    message: `All product removed from wishlist!`,
  });
});
