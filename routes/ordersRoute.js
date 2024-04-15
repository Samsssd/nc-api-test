const express = require("express");
const { createOrder, updateOrder } = require("../controllers/ordersController");
const router = express.Router();

router
  .route("/create")
  .post(createOrder)

router
  .route("/update")
  .put(updateOrder)

module.exports = router;
