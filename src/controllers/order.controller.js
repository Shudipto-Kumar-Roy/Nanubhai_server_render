// ==> external import <==
const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

// ==> internal import <==
const { catchAsyncError } = require("../middlewares/catchAsync.middleware");
const Order = require("../models/order.model");
const Product = require("../models/product.model");
const Cart = require("../models/cart.model");
const OrderItem = require("../models/order-item.model");
const ErrorHandler = require("../helper/error.helper");
const User = require("../models/user.model");
const ProductImages = require("../models/product-image.model");

// ==> create a new order <==
exports.createOrder = catchAsyncError(async (req, res, next) => {
  const {
    phone,
    shippingAddressId,
    totalAmount,
    discountAmount,
    shippingAmount,
    paymentType,
    transactionId,
  } = req.body;

  const userId = req?.user?._id;
  if (phone) {
    await User.updateOne({ _id: userId }, { $set: { phone } });
  }
  const orderId = "ORD-" + uuidv4().substring(0, 20);
  const cartProducts = await Cart.find({ userId });
  if (cartProducts.length === 0) {
    return next(new ErrorHandler("Products not found in cart!"));
  }
  let grossAmount = totalAmount;
  if (discountAmount > 0) {
    grossAmount = grossAmount - discountAmount;
  }
  let netAmount = grossAmount + shippingAmount;
  const newOrder = await Order.create({
    orderId,
    userId,
    shippingAddressId,
    totalAmount,
    discountAmount,
    grossAmount,
    shippingAmount,
    netAmount,
    paymentType,
    transactionId,
  });

  cartProducts.forEach(async (product) => {
    let existProduct = await Product.findById(product.productId);
    if (!existProduct) {
      return next(new ErrorHandler("Product not found!", 400));
    }
    let existProductImages = await ProductImages.find({
      productId: product?.productId,
    });

    await OrderItem.create({
      orderId: newOrder?._id,
      productId: product?.productId,
      name: existProduct?.name,
      image: existProductImages?.[0]?.image || "",
      price: existProduct?.price,
      quantity: product?.quantity,
      total: existProduct?.price * product?.quantity,
    });
    await Cart.deleteOne({ userId, productId: product.productId });
  });

  return res.status(201).json({
    success: true,
    message: `Order placed successfully!`,
  });
});

// ==> get all orders <==
exports.getAllOrders = catchAsyncError(async (req, res, next) => {
  const pageno = req?.query?.page ? Number(req?.query?.page) : 1;
  const perpage = req?.query?.limit ? Number(req?.query?.limit) : 10;
  const skip = (pageno - 1) * perpage;
  const resData = await Order.aggregate([
    {
      $facet: {
        orders: [
          {
            $lookup: {
              from: "users",
              localField: "userId",
              foreignField: "_id",
              as: "user",
            },
          },
          {
            $lookup: {
              from: "orderitems",
              localField: "_id",
              foreignField: "orderId",
              as: "orderitems",
            },
          },
          {
            $lookup: {
              from: "shippingaddresses",
              localField: "shippingAddressId",
              foreignField: "_id",
              as: "shippingaddress",
            },
          },
          {
            $project: {
              __v: 0,
              "user.refreshToken": 0,
              "user.password": 0,
              "user.resetPasswordExpire": 0,
              "user.__v": 0,
              "user.resetPasswordToken": 0,
              "user.emailVerifyExpire": 0,
              "user.emailVerifyToken": 0,
              "orderitems.__v": 0,
              "shippingaddress.__v": 0,
            },
          },
          { $skip: skip },
          { $limit: perpage },
        ],
        total: [{ $count: "count" }],
      },
    },
  ]);

  if (resData[0].orders.length === 0) {
    return res.status(200).json({
      success: true,
      orders: [],
      total: 0,
    });
  }
  return res.status(200).json({
    success: true,
    orders: resData[0].orders,
    total: resData[0].total[0].count,
  });
});

// ==> get all my orders <==
exports.getMyOrders = catchAsyncError(async (req, res, next) => {
  const pageno = req?.query?.page ? Number(req?.query?.page) : 1;
  const perpage = req?.query?.limit ? Number(req?.query?.limit) : 10;
  const skip = (pageno - 1) * perpage;

  const userId = req?.user?._id;
  const resData = await Order.aggregate([
    {
      $facet: {
        orders: [
          {
            $match: { userId },
          },
          {
            $lookup: {
              from: "orderitems",
              localField: "_id",
              foreignField: "orderId",
              as: "orderitems",
            },
          },
          {
            $lookup: {
              from: "shippingaddresses",
              localField: "shippingAddressId",
              foreignField: "_id",
              as: "shippingaddress",
            },
          },
          {
            $project: {
              __v: 0,
              "orderitems.__v": 0,
              "shippingaddress.__v": 0,
            },
          },
          { $skip: skip },
          { $limit: perpage },
        ],
        total: [
          {
            $match: { userId },
          },
          { $count: "count" },
        ],
      },
    },
  ]);

  if (resData[0].orders.length === 0) {
    return res.status(200).json({
      success: true,
      orders: [],
      total: 0,
    });
  }
  return res.status(200).json({
    success: true,
    orders: resData[0].orders,
    total: resData[0].total[0].count,
  });
});

// ==> get single order <==
exports.getSingleOrder = catchAsyncError(async (req, res, next) => {
  const id = req.params.id;
  if (!id) {
    return new ErrorHandler("Order id is requried");
  }
  const existOrder = await Order.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(id),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "user",
      },
    },
    {
      $lookup: {
        from: "orderitems",
        localField: "_id",
        foreignField: "orderId",
        as: "orderitems",
      },
    },
    {
      $lookup: {
        from: "shippingaddresses",
        localField: "shippingAddressId",
        foreignField: "_id",
        as: "shippingaddress",
      },
    },
    {
      $project: {
        __v: 0,
        "user.refreshToken": 0,
        "user.password": 0,
        "user.resetPasswordExpire": 0,
        "user.__v": 0,
        "user.resetPasswordToken": 0,
        "user.emailVerifyExpire": 0,
        "user.emailVerifyToken": 0,
        "orderitems.__v": 0,
        "shippingaddress.__v": 0,
      },
    },
  ]);
  if (existOrder.length === 0) {
    return next(new ErrorHandler("Order not found!", 404));
  }

  return res.status(200).json({
    success: true,
    order: existOrder[0],
  });
});

// ==> change order status <==
exports.changeOrderStatus = catchAsyncError(async (req, res, next) => {
  const { status, paymentStatus } = req.body;
  const id = req.params.id;

  if (!id) {
    return next(new ErrorHandler("Order id is required!", 400));
  }

  const existOrder = await Order.findById(id);
  if (!existOrder) {
    return next(new ErrorHandler("Order not found!", 404));
  }
  let updateDate = {};
  if (status) {
    updateDate.status = status;
  }
  if (paymentStatus) {
    updateDate.paymentStatus = paymentStatus;
  }
  await Order.updateOne(
    {
      _id: new mongoose.Types.ObjectId(id),
    },
    { $set: updateDate }
  );

  return res.status(200).json({
    success: true,
    message: "Order status updated!",
  });
});

// ==> delete a order  <==
exports.deleteOrder = catchAsyncError(async (req, res, next) => {
  const id = req.params.id;
  if (!id) {
    return new ErrorHandler("Order id is requried");
  }
  const existOrder = await Order.findById(id);
  if (!existOrder) {
    return next(new ErrorHandler("Order not found!", 404));
  }
  await existOrder.deleteOne();
  await OrderItem.deleteMany({ orderId: id });
  return res.status(200).json({
    success: true,
    message: `Order deleted successfully!`,
  });
});
