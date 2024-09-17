const Order = require("../models/orderModel");
const asyncHandler = require("express-async-handler");

/**
 * Create a new order
 * @route POST /api/orders
 * @param {Object} req.body - The order data
 * @returns {Object} 200 - An object with the new order ID and success status
 * @returns {Object} 400 - An error object with a message
 */
const createOrder = asyncHandler(async (req, res) => {
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
});

/**
 * Update an existing order
 * @route PUT /api/orders/:orderId
 * @param {string} req.params.orderId - The ID of the order to update
 * @param {Object} req.body - The updated order data
 * @returns {Object} 200 - An object with success message and updated order
 * @returns {Object} 404 - An error object if the order is not found
 */
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
});

/**
 * Delete an order
 * @route DELETE /api/orders/:orderId
 * @param {string} req.params.orderId - The ID of the order to delete
 * @returns {Object} 200 - A success message
 * @returns {Object} 404 - An error object if the order is not found
 */
const deleteOrder = asyncHandler(async (req, res) => {
    const { orderId } = req.params;

    const order = await Order.findByIdAndDelete(orderId);

    if (!order) {
        return res.status(404).json({ message: "Commande introuvable.", status: "error" });
    }

    res.status(200).json({ message: "Commande supprimée avec succès.", status: "success" });
});

/**
 * Get orders for the authenticated user
 * @route GET /api/orders/my-orders
 * @access Private
 * @returns {Object} 200 - An array of order objects
 * @returns {Object} 404 - An error object if no orders are found
 */
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({
    $or: [
      { sellerId: req.user.id },
      { customerId: req.user.id }
    ]
  }).sort({ createdAt: -1 });

  if (orders.length === 0) {
    return res.status(404).json({ message: "Aucune commande trouvée." });
  }

  res.status(200).json(orders);
});

module.exports = { createOrder, updateOrder, deleteOrder, getMyOrders };