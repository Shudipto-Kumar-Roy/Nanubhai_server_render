// ==> external import <==

// ==> internal import <==
const { catchAsyncError } = require("../middlewares/catchAsync.middleware");
const Varient = require("../models/varient.model");
const ErrorHandler = require("../helper/error.helper");

// ==> create a new varient <==
exports.createVarient = catchAsyncError(async (req, res, next) => {
  const { name, value } = req.body;

  const isVarientExist = await Varient.findOne({ name, value });
  if (isVarientExist) {
    return next(new ErrorHandler("Varient already exists!", 200));
  }

  await Varient.create({
    name,
    value,
  });

  return res.status(201).json({
    success: true,
    message: `Varient created successfully!`,
  });
});

// ==> get all varients <==
exports.getAllVarients = catchAsyncError(async (req, res, next) => {
  const pageno = req?.query?.page ? Number(req?.query?.page) : 1;
  const perpage = req?.query?.limit ? Number(req?.query?.limit) : 10;
  const skip = (pageno - 1) * perpage;
  const resData = await Varient.aggregate([
    {
      $facet: {
        varients: [{ $skip: skip }, { $limit: perpage }],
        total: [{ $count: "count" }],
      },
    },
  ]);

  if (resData[0].varients.length === 0) {
    return res.status(200).json({
      success: true,
      varients: [],
      total: 0,
    });
  }
  return res.status(200).json({
    success: true,
    varients: resData[0].varients,
    total: resData[0].total[0].count,
  });
});

// ==> delete a varient  <==
exports.deleteVarient = catchAsyncError(async (req, res, next) => {
  const id = req?.params?.id;
  if (!id) {
    return new ErrorHandler("Varient id is requried!");
  }
  const existVarient = await Varient.findById(id);
  if (!existVarient) {
    return next(new ErrorHandler("Varient not found!", 404));
  }
  await existVarient.deleteOne();

  return res.status(200).json({
    success: true,
    message: `Varient deleted successfully!`,
  });
});
