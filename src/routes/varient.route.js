// ==>external import<==
const express = require("express");
const varientRouter = express.Router();

// ==>internal import<==
const { authCheck, roleCheck } = require("../middlewares/auth.middleware");
const VarientController = require("../controllers/varient.controller");
const dtoValidate = require("../middlewares/validate.middleware");
const VarientDTO = require("../validation/varient.dto");

varientRouter
  .route("/create")
  .post(
    dtoValidate(VarientDTO.createVarientSchema),
    authCheck,
    roleCheck("admin"),
    VarientController.createVarient
  );
varientRouter
  .route("/all")
  .get(authCheck, roleCheck("admin"), VarientController.getAllVarients);

varientRouter
  .route("/:id")
  .delete(authCheck, roleCheck("admin"), VarientController.deleteVarient);

module.exports = varientRouter;
