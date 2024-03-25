const Order = require("../models/orderModel");
const asyncHandler = require("express-async-handler");

// CREATE ORDER, UPDATE ORDER, GET/CANCEL

const createOrder = asyncHandler(async (req, res) => {
    // INPUT VALIDATION
  const order = await Order.create(req.body);
  if (order) {
    res.status(200).json({
      id: order._id,
      status: "success",
    });
  } else {
    res.status(400).json({
      message:
        "Impossible de créer la commande. Veuillez réessayer ultérieurement.",
      status: "error",
    });
  }
})

module.exports = {createOrder}