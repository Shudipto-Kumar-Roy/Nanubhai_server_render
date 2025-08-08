// ==> external import <==
const fs = require("fs");
const path = require("path");
const slugify = require("slugify");
const mongoose = require("mongoose");

// ==> internal import <==
const { catchAsyncError } = require("../middlewares/catchAsync.middleware");
const Product = require("../models/product.model");
const ProductImage = require("../models/product-image.model");
const ProductVarient = require("../models/product-varient.model");
const ErrorHandler = require("../helper/error.helper");
const Category = require("../models/category.model");

// ==> create a product <==
exports.createProduct = catchAsyncError(async (req, res) => {
  const {
    name,
    categoryId,
    brandId,
    description,
    price,
    previousPrice,
    stock,
    featured,
  } = req.body;
  // Check if product already exists
  const existProduct = await Product.findOne({ name });
  if (existProduct) {
    await Product.updateOne(
      { _id: existProduct._id },
      { $set: { stock: existProduct.stock + stock } }
    );
    return res.status(200).json({
      succeeded: true,
      message: "Product already exists! Updated the stock.",
    });
  } else {
    await Product.create({
      name,
      slug: slugify(name, { lower: true }),
      categoryId,
      brandId,
      description,
      price,
      previousPrice: previousPrice ? previousPrice : null,
      stock,
      featured: featured ? true : false,
    });
    return res.status(201).json({
      succeeded: true,
      message: "Product created successfully!",
    });
  }
});

// ==> update a product <==
exports.updateProduct = catchAsyncError(async (req, res, next) => {
  const {
    name,
    categoryId,
    brandId,
    description,
    price,
    previousPrice,
    stock,
    featured,
    freeDelivery,
    status,
  } = req.body;
  const id = req.params.id;
  const existProduct = await Product.findById(id);
  if (!existProduct) {
    return next(new ErrorHandler("Product not found!", 404));
  }

  let updateData = {};
  if (name) {
    updateData.name = name;
    updateData.slug = slugify(name, { lower: true });
  }
  if (categoryId) {
    updateData.categoryId = categoryId;
  }
  if (brandId) {
    updateData.brandId = brandId;
  }
  if (description) {
    updateData.description = description;
  }
  if (price) {
    updateData.price = price;
  }
  if (previousPrice) {
    updateData.previousPrice = previousPrice ? previousPrice : null;
  }
  if (featured) {
    updateData.featured = featured === "true" ? true : false;
  }
  if (stock) {
    updateData.stock = stock;
  }
  if (freeDelivery) {
    updateData.freeDelivery = freeDelivery === "true" ? true : false;
  }

  if (status) {
    updateData.status = status;
  }

  await Product.updateOne({ _id: id }, { $set: updateData });

  return res.status(200).json({
    succeeded: true,
    message: "Product updated successfully!",
  });
});

// ==> get all products  <==
exports.getAllProduct = catchAsyncError(async (req, res, next) => {
  // Get pagination parameters from query
  const pageno = req?.query?.page ? Number(req?.query?.page) : 1;
  const perpage = req?.query?.limit ? Number(req.query?.limit) : 15;
  const skip = (pageno - 1) * perpage;

  // Get filter parameters
  const showActiveOnly = req?.query?.activeOnly === "true";
  const isFeatured = req?.query?.type === "featured" ? true : false;
  const isNewArrived = req?.query?.type === "new" ? true : false;
  const isTopRated = req?.query?.type === "top-rated" ? true : false;
  const isRelated = req?.query?.type === "related" ? true : false;
  const isBestSelling = req?.query?.type === "best-selling" ? true : false;
  const name = req?.query?.name ? req?.query?.name : "";
  const catId = req?.query?.category ? req?.query?.category : "";
  let resData = [];

  if (catId && mongoose.Types.ObjectId.isValid(catId)) {
    const category = await Category.findOne({ parentId: catId });
    const childId = new mongoose.Types.ObjectId(
      category?._id ? category?._id : catId
    );
    resData = await Product.aggregate([
      {
        $facet: {
          products: [
            {
              $match: {
                status: "active",
                $or: [
                  {
                    categoryId: new mongoose.Types.ObjectId(catId),
                  },
                  {
                    categoryId: childId,
                  },
                ],
              },
            },
            {
              $lookup: {
                from: "categories",
                localField: "categoryId",
                foreignField: "_id",
                as: "category",
              },
            },
            {
              $lookup: {
                from: "brands",
                localField: "brandId",
                foreignField: "_id",
                as: "brand",
              },
            },
            {
              $lookup: {
                from: "productimages",
                localField: "_id",
                foreignField: "productId",
                as: "images",
              },
            },
            {
              $lookup: {
                from: "productvarients",
                localField: "_id",
                foreignField: "productId",
                as: "varients",
              },
            },
            { $skip: skip },
            { $limit: perpage },
          ],
          total: [
            {
              $match: {
                status: "active",
                $or: [
                  {
                    categoryId: new mongoose.Types.ObjectId(catId),
                  },
                  {
                    categoryId: childId,
                  },
                ],
              },
            },
            { $count: "count" },
          ],
        },
      },
    ]);
  } else if (isFeatured) {
    resData = await Product.aggregate([
      {
        $facet: {
          products: [
            {
              $match: {
                status: "active",
                featured: true,
              },
            },
            {
              $lookup: {
                from: "categories",
                localField: "categoryId",
                foreignField: "_id",
                as: "category",
              },
            },
            {
              $lookup: {
                from: "brands",
                localField: "brandId",
                foreignField: "_id",
                as: "brand",
              },
            },
            {
              $lookup: {
                from: "productimages",
                localField: "_id",
                foreignField: "productId",
                as: "images",
              },
            },
            {
              $lookup: {
                from: "productvarients",
                localField: "_id",
                foreignField: "productId",
                as: "variants",
              },
            },
            { $skip: skip },
            { $limit: perpage },
          ],
          total: [
            {
              $match: {
                status: "active",
                featured: true,
              },
            },
            { $count: "count" },
          ],
        },
      },
    ]);
  } else if (isNewArrived) {
    resData = await Product.aggregate([
      {
        $facet: {
          products: [
            {
              $match: {
                status: "active",
              },
            },
            {
              $lookup: {
                from: "categories",
                localField: "categoryId",
                foreignField: "_id",
                as: "category",
              },
            },
            {
              $lookup: {
                from: "brands",
                localField: "brandId",
                foreignField: "_id",
                as: "brand",
              },
            },
            {
              $lookup: {
                from: "productimages",
                localField: "_id",
                foreignField: "productId",
                as: "images",
              },
            },
            {
              $lookup: {
                from: "productvarients",
                localField: "_id",
                foreignField: "productId",
                as: "variants",
              },
            },
            {
              $sort: {
                createdAt: -1,
              },
            },
            { $skip: skip },
            { $limit: perpage },
          ],
          total: [
            {
              $match: {
                status: "active",
              },
            },
            { $count: "count" },
          ],
        },
      },
    ]);
  } else if (isTopRated) {
    resData = await Product.aggregate([
      {
        $facet: {
          products: [
            {
              $match: {
                status: "active",
              },
            },
            {
              $lookup: {
                from: "categories",
                localField: "categoryId",
                foreignField: "_id",
                as: "category",
              },
            },
            {
              $lookup: {
                from: "brands",
                localField: "brandId",
                foreignField: "_id",
                as: "brand",
              },
            },
            {
              $lookup: {
                from: "productimages",
                localField: "_id",
                foreignField: "productId",
                as: "images",
              },
            },
            {
              $lookup: {
                from: "productvarients",
                localField: "_id",
                foreignField: "productId",
                as: "variants",
              },
            },
            {
              $sort: {
                rating: -1, // Sort by rating in descending order
              },
            },
            { $skip: skip },
            { $limit: perpage },
          ],
          total: [
            {
              $match: {
                status: "active",
              },
            },
            { $count: "count" },
          ],
        },
      },
    ]);
  } else if (isBestSelling) {
    resData = await Product.aggregate([
      {
        $facet: {
          products: [
            {
              $match: {
                status: "active",
              },
            },
            {
              $lookup: {
                from: "categories",
                localField: "categoryId",
                foreignField: "_id",
                as: "category",
              },
            },
            {
              $lookup: {
                from: "brands",
                localField: "brandId",
                foreignField: "_id",
                as: "brand",
              },
            },
            {
              $lookup: {
                from: "productimages",
                localField: "_id",
                foreignField: "productId",
                as: "images",
              },
            },
            {
              $lookup: {
                from: "productvarients",
                localField: "_id",
                foreignField: "productId",
                as: "variants",
              },
            },
            {
              $sort: {
                sold: -1, // Sort by sold in descending order
              },
            },
            { $skip: skip },
            { $limit: perpage },
          ],
          total: [
            {
              $match: {
                status: "active",
              },
            },
            { $count: "count" },
          ],
        },
      },
    ]);
  } else if (isRelated && name) {
    resData = await Product.aggregate([
      {
        $facet: {
          products: [
            {
              $match: {
                status: "active",
                name: { $regex: name, $options: "i" }, // Partial match for product name (case-insensitive)
              },
            },
            {
              $lookup: {
                from: "categories",
                localField: "categoryId",
                foreignField: "_id",
                as: "category",
              },
            },
            {
              $lookup: {
                from: "brands",
                localField: "brandId",
                foreignField: "_id",
                as: "brand",
              },
            },
            {
              $lookup: {
                from: "productimages",
                localField: "_id",
                foreignField: "productId",
                as: "images",
              },
            },
            {
              $lookup: {
                from: "productvarients",
                localField: "_id",
                foreignField: "productId",
                as: "variants",
              },
            },
            { $skip: skip },
            { $limit: perpage },
          ],
          total: [
            {
              $match: {
                status: "active",
                name: { $regex: name, $options: "i" }, // Partial match for product name (case-insensitive)
              },
            },
            { $count: "count" },
          ],
        },
      },
    ]);
  } else {
    resData = await Product.aggregate([
      {
        $facet: {
          products: [
            {
              $match: showActiveOnly ? { status: "active" } : {},
            },
            {
              $lookup: {
                from: "categories",
                localField: "categoryId",
                foreignField: "_id",
                as: "category",
              },
            },
            {
              $lookup: {
                from: "brands",
                localField: "brandId",
                foreignField: "_id",
                as: "brand",
              },
            },
            {
              $lookup: {
                from: "productimages",
                localField: "_id",
                foreignField: "productId",
                as: "images",
              },
            },
            {
              $lookup: {
                from: "productvarients",
                localField: "_id",
                foreignField: "productId",
                as: "variants",
              },
            },
            { $skip: skip },
            { $limit: perpage },
          ],
          total: [
            {
              $match: showActiveOnly ? { status: "active" } : {},
            },
            { $count: "count" },
          ],
        },
      },
    ]);
  }

  if (resData[0].products.length === 0) {
    return res.status(200).json({
      success: true,
      products: [],
      total: 0,
    });
  }

  return res.status(200).json({
    success: true,
    products: resData[0].products,
    total: resData[0].total[0].count,
  });
});

// ==> get a product  <==
exports.getSingleProduct = catchAsyncError(async (req, res, next) => {
  const id = req?.params?.id;
  if (!id) {
    return next(new ErrorHandler("Product id is requried!", 404));
  }
  const product = await Product.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(id),
        status: "active",
      },
    },
    {
      $lookup: {
        from: "categories",
        localField: "categoryId",
        foreignField: "_id",
        as: "category",
      },
    },
    {
      $lookup: {
        from: "brands",
        localField: "brandId",
        foreignField: "_id",
        as: "brand",
      },
    },
    {
      $lookup: {
        from: "productimages",
        localField: "_id",
        foreignField: "productId",
        as: "images",
      },
    },
    {
      $lookup: {
        from: "productvariants",
        let: { productId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$productId", "$$productId"] },
            },
          },
          {
            $lookup: {
              from: "variants", // actual variant data
              localField: "varientId",
              foreignField: "_id",
              as: "variantDetails",
            },
          },
        ],
        as: "variants",
      },
    },
  ]);

  if (product.length === 0) {
    return res.status(200).json({
      success: false,
      message: "Product not found!",
    });
  }
  return res.status(200).json({
    success: true,
    product: product[0],
  });
});

// ==> active / inactive a product <==
exports.activeInactiveProduct = catchAsyncError(async (req, res, next) => {
  const { status } = req.body;
  const id = req?.params?.id;
  if (!id) {
    return new ErrorHandler("Product id is requried!");
  }
  const existProduct = await Product.findById(id);
  if (!existProduct) {
    return next(new ErrorHandler("Product not found!", 404));
  }

  await Product.updateOne(
    {
      _id: id,
    },
    { $set: { status } }
  );
  return res.status(200).json({
    success: true,
    message: "Product status updated!",
  });
});

// ==> add a varient to the product <==
exports.addVarient = catchAsyncError(async (req, res, next) => {
  const { productId, varientId } = req.body;

  await ProductVarient.create({ productId, varientId });

  return res.status(201).json({
    success: true,
    message: "One varient added to the product!",
  });
});

// ==> remove a varient to the product <==
exports.removeVarient = catchAsyncError(async (req, res, next) => {
  const { productId } = req.body;

  const existVarient = await ProductVarient.findOne({ productId });
  if (!existVarient) {
    return next(new ErrorHandler("Product varient not found!", 404));
  }
  await existVarient.deleteOne();
  return res.status(200).json({
    success: true,
    message: "Varient removed from the product!",
  });
});

// ==> delete a product <==
exports.deleteProduct = catchAsyncError(async (req, res, next) => {
  const id = req?.params?.id;
  if (!id) {
    return next(new ErrorHandler("Product id is requried!", 400));
  }
  const existProduct = await Product.findById(id);
  if (!existProduct) {
    return next(new ErrorHandler("Product not found!", 404));
  }

  await existProduct.deleteOne();

  const productImages = await ProductImage.find({ productId: id });
  if (productImages.length > 0) {
    productImages.forEach(async (imageItem) => {
      // removing existing file
      const existFilePath = path.join(
        __dirname,
        "../uploads/image/",
        imageItem.image
      );
      fs.access(existFilePath, fs.constants.F_OK, (err) => {
        if (!err) {
          fs.unlink(existFilePath, (err) => {
            if (err) {
              return next(new ErrorHandler("Product image not deleted!", 400));
            }
          });
        }
      });

      await ProductImage.deleteOne({
        _id: imageItem._id,
        productId: id,
      });
    });
  }

  return res.status(200).json({
    success: true,
    message: "Product deleted successfully!",
  });
});
