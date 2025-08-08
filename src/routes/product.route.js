// ==>external import<==
const express = require("express");
const productRouter = express.Router();

// ==>internal import<==
const fileUploadMiddleware = require("../middlewares/file-upload.middleware");
const ProductController = require("../controllers/product.controller");
const { authCheck, roleCheck } = require("../middlewares/auth.middleware");
const dtoValidate = require("../middlewares/validate.middleware");
const ProductDTO = require("../validation/product.dto");

productRouter
  .route("/create")
  .post(
    dtoValidate(ProductDTO.createProductSchema),
    ProductController.createProduct
  );
productRouter.route("/all").get(ProductController.getAllProduct);

productRouter
  .route("/varient-add")
  .post(
    dtoValidate(ProductDTO.addProductVarientSchema),
    authCheck,
    roleCheck("admin"),
    ProductController.addVarient
  );
productRouter
  .route("/remove-varient")
  .delete(
    dtoValidate(ProductDTO.removeProductVarientSchema),
    authCheck,
    roleCheck("admin"),
    ProductController.removeVarient
  );

productRouter
  .route("/:id")
  .put(
    dtoValidate(ProductDTO.updateProductSchema),
    authCheck,
    roleCheck("admin"),
    ProductController.updateProduct
  )
  .get(ProductController.getSingleProduct)
  .delete(authCheck, roleCheck("admin"), ProductController.deleteProduct);

productRouter
  .route("/active-inactive/:id")
  .put(
    dtoValidate(ProductDTO.activeInactiveProductSchema),
    authCheck,
    roleCheck("admin"),
    ProductController.activeInactiveProduct
  );

module.exports = productRouter;
