const express = require("express");
const { createOrder, updateOrder, deleteOrder, getMyOrders } = require("../controllers/ordersController");
const { protect } = require("../middleware/authMiddleware");
const router = express.Router();

router.route("/")
  .post(createOrder);

router.route("/my-orders")
  .get(protect, getMyOrders);

router.route("/:orderId")
  .put(updateOrder)
  .delete(deleteOrder);

module.exports = router;
