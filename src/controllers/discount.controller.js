// ==> external import <==
const dayjs = require("dayjs");

// ==> internal import <==
const { catchAsyncError } = require("../middlewares/catchAsync.middleware");
const Discount = require("../models/discount.model");
const Product = require("../models/product.model");
const DiscountUser = require("../models/discount-user.model");
const ErrorHandler = require("../helper/error.helper");

// ==> create a product discount <==
exports.createDiscount = catchAsyncError(async (req, res, next) => {
  const { coupon, type, value, startDate, endDate } = req.body;

  const existDisount = await Discount.findOne({
    coupon,
  });
  if (existDisount) {
    return next(new ErrorHandler("Discount already exist!", 400));
  }

  await Discount.create({
    coupon,
    type,
    value,
    startDate,
    endDate,
  });

  return res.status(201).json({
    success: true,
    message: `One discount coupon created successfully!`,
  });
});

// ==> update a product discount  <==
exports.updateDiscount = catchAsyncError(async (req, res, next) => {
  const { coupon, type, value, startDate, endDate } = req.body;
  const id = req.params.id;
  if (!id) {
    return new ErrorHandler("Product discount id is requried");
  }

  const existDisount = await Discount.findById(id);
  if (!existDisount) {
    return next(new ErrorHandler("Discount coupon not found!", 404));
  }
  let updateData = {};
  if (coupon) {
    updateData.coupon = coupon;
  }
  if (type) {
    updateData.type = type;
  }
  if (value) {
    updateData.value = value;
  }
  if (startDate) {
    updateData.startDate = startDate;
  }
  if (endDate) {
    updateData.endDate = endDate;
  }

  await Discount.updateOne({ _id: id }, { $set: updateData });
  res.status(200).json({
    success: true,
    message: "Discount coupon updated successfully!",
  });
});

// ==> get all product discount  <==
exports.getAllDiscount = catchAsyncError(async (req, res, next) => {
  const pageno = req?.query?.page ? Number(req?.query?.page) : 1;
  const perpage = req?.query?.limit ? Number(req?.query?.limit) : 10;
  const skip = (pageno - 1) * perpage;

  const resData = await Discount.aggregate([
    {
      $facet: {
        discounts: [
          { $match: { status: "active" } },
          { $skip: skip },
          { $limit: perpage },
        ],
        total: [{ $match: { status: "active" } }, { $count: "count" }],
      },
    },
  ]);

  if (resData[0].discounts.length === 0) {
    return res.status(200).json({
      success: true,
      discounts: [],
      total: 0,
    });
  }
  return res.status(200).json({
    success: true,
    discounts: resData[0].discounts,
    total: resData[0].total[0].count,
  });
});

// ==> get a product discount  <==
exports.getSingleDiscount = catchAsyncError(async (req, res, next) => {
  const id = req.params.id;
  if (!id) {
    return new ErrorHandler("Product discount id is requried");
  }
  const existDisount = await Discount.findOne({ _id: id, status: "active" });
  if (!existDisount) {
    return next(new ErrorHandler("Product discount not found!", 404));
  }
  return res.status(200).json({
    success: true,
    discount: existDisount,
  });
});

// ==> delete a product discount  <==
exports.deleteDiscount = catchAsyncError(async (req, res, next) => {
  const id = req.params.id;
  if (!id) {
    return new ErrorHandler("Product discount id is requried");
  }
  const existDisount = await Discount.findById(id);
  if (!existDisount) {
    return next(new ErrorHandler("Product discount not found!", 404));
  }

  await existDisount.deleteOne();

  return res.status(200).json({
    success: true,
    message: "Product discount deleted successfully!",
  });
});

// ==> active / inactive a product discount <==
exports.activeInactiveDiscount = catchAsyncError(async (req, res, next) => {
  const id = req.params.id;
  if (!id) {
    return new ErrorHandler("Product discount id is requried");
  }
  const { status } = req.body;

  const existDisount = await Discount.findById(id);
  if (!existDisount) {
    return next(new ErrorHandler("Product discount not found!", 404));
  }
  await Discount.updateOne(
    {
      _id: id,
    },
    { $set: { status } }
  );
  return res.status(200).json({
    success: true,
    message: "Product discount status updated!",
  });
});

// ==> apply a product discount <==
exports.applyDiscount = catchAsyncError(async (req, res, next) => {
  const { coupon, productId } = req.body;
  const userId = req.user._id;
  const existDisount = await Discount.findOne({ coupon, status: "active" });
  if (!existDisount) {
    return next(new ErrorHandler("Product discount not found!", 404));
  }
  const existProduct = await Product.findOne({
    _id: productId,
    status: "active",
  });
  if (!existProduct) {
    return next(new ErrorHandler("Product not found!", 404));
  }

  if (
    !dayjs().isAfter(dayjs(existDisount.startDate)) &&
    !dayjs().isBefore(dayjs(existDisount.endDate))
  ) {
    return next(new ErrorHandler("Coupon is invalid or expired!", 400));
  } else {
    const existCoupon = await DiscountUser.findOne({
      productId,
      userId,
    });

    if (existCoupon) {
      return next(
        new ErrorHandler("Coupon is already applied for this product!", 400)
      );
    }
    await DiscountUser.create({ productId, userId: req.user._id });
    return res.status(200).json({
      success: true,
      message: "Discount coupon applied successfully!",
    });
  }
});
