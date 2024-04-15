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

const updateOrder = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.orderId);

  if (!order) {
    res.status(400).json({message: "Impossible de trouver l'utilisateur."});
  }

  if (req.body.delivery.deliveryStatus) {
    order.delivery.deliveryStatus = req.body.delivery.deliveryStatus;
  }

  await order.save()
  res.status(200).json({message: "success"})
})

module.exports = {createOrder, updateOrder}