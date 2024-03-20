const User = require("../models/userModel");
const Product = require("../models/productModel");
const asyncHandler = require("express-async-handler");

// CREATE ACCOUNT, UPDATE/DELETE ACCOUNT, GET

const addToWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  const product = await Product.findById(req.params.productId);

  if (user) {
    try {
      await user.wishlist.push(req.params.productId);
      await product.analytics.likes.push(req.user.id);
      await user.save();
      await product.save();
      res.status(200).json({status: "success"})
    } catch (err) {
        res.status(400).json({status: "error", message: "Une erreur est survenue. Veuillez réessayer ultérieurement."})
    }
  } else {
    res
      .status(400)
      .json({ message: "Impossible d'obtenir les informations utilisateur." });
  }
});

module.exports = {addToWishlist};
