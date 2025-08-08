// ==> external import <==

// ==> internal import <==
const { catchAsyncError } = require("../middlewares/catchAsync.middleware");
const Cart = require("../models/cart.model");
const Product = require("../models/product.model");
const ErrorHandler = require("../helper/error.helper");

// ==> add a product to cart <==
exports.addToCart = catchAsyncError(async (req, res, next) => {
  const { productId, quantity } = req.body;
  const userId = req.user._id;

  const existProduct = await Product.findById(productId);

  if (!existProduct) {
    return next(new ErrorHandler("Product not found!", 400));
  }

  const existCart = await Cart.findOne({ userId, productId });
  if (existCart) {
    let newQuantity = existCart.quantity + quantity;
    await Cart.updateOne({ userId, productId }, { quantity: newQuantity });
  } else {
    await Cart.create({
      userId,
      productId,
      quantity,
    });
  }

  return res.status(201).json({
    success: true,
    message: `Product added to cart!`,
  });
});

// ==> get all products from cart  <==
exports.getAllCartProduct = catchAsyncError(async (req, res, next) => {
  const pageno = req?.query?.page ? Number(req?.query?.page) : 1;
  const perpage = req?.query?.limit ? Number(req?.query?.limit) : 10;
  const skip = (pageno - 1) * perpage;
  const resData = await Cart.aggregate([
    {
      $facet: {
        cart: [
          { $match: { userId: req.user._id } },
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
              quantity: 1,
              createdAt: 1,
              "products._id": 1,
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
        total: [{ $match: { userId: req.user._id } }, { $count: "count" }],
      },
    },
  ]);

  if (resData[0].cart.length === 0) {
    return res.status(200).json({
      success: true,
      cart: [],
      total: 0,
    });
  }
  return res.status(200).json({
    success: true,
    cart: resData[0].cart,
    total: resData[0].total[0]?.count,
  });
});

// ==> remove a product from cart  <==
exports.removeFromCart = catchAsyncError(async (req, res, next) => {
  const id = req.params.id;
  if (!id) {
    return next(new ErrorHandler("Cart id is requried", 400));
  }
  const existCart = await Cart.findById(id);
  if (!existCart) {
    return next(new ErrorHandler("Product not found in cart!", 404));
  }
  await existCart.deleteOne();
  return res.status(200).json({
    success: true,
    message: `Product removed from cart!`,
  });
});

// ==> empty product cart  <==
exports.emptyCartProduct = catchAsyncError(async (req, res, next) => {
  const userId = req.user._id;
  await Cart.deleteMany({ userId });
  return res.status(200).json({
    success: true,
    message: `All product removed from cart!`,
  });
});

// ==> change product cart quantity <==
exports.changeCartQuantity = catchAsyncError(async (req, res, next) => {
  const { productId, quantity, type } = req.body;
  const userId = req.user._id;

  const existProduct = await Product.findById(productId);

  if (!existProduct) {
    return next(new ErrorHandler("Product not found!", 400));
  }
  const existCart = await Cart.findOne({
    userId,
    productId,
  });
  if (!existCart) {
    return next(new ErrorHandler("Product not found in cart!", 404));
  }

  if (type === "INC") {
    let newQuantity = existCart.quantity + quantity;
    if (newQuantity > existProduct.stock) {
      return next(
        new ErrorHandler("Stock is not sufficient to match the quantity!", 400)
      );
    }
    await Cart.updateOne(
      {
        productId,
        userId,
      },
      { $set: { quantity: newQuantity } }
    );
  }
  if (type === "DEC") {
    let newQuantity = existCart.quantity - quantity;

    if (newQuantity < 1) {
      return next(new ErrorHandler("Quantity need to be at least 1", 400));
    }
    await Cart.updateOne(
      {
        productId,
        userId,
      },
      { $set: { quantity: newQuantity } }
    );
  }

  return res.status(200).json({
    success: true,
  });
});
