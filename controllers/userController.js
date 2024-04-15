const User = require("../models/userModel");
const Product = require("../models/productModel");
const asyncHandler = require("express-async-handler");

// CREATE ACCOUNT, UPDATE/DELETE ACCOUNT, GET

const getMyUserInfo = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select("-login");

  if (user) {
    res.status(200).json(user);
  } else {
    res
      .status(400)
      .json({ message: "Impossible d'obtenir les informations utilisateur." });
  }
});

const updateMyUserInfo = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    res.status(400).json({ message: "Impossible de trouver l'utilisateur." });
  }

  if (req.body.info.username) {
    user.info.user = req.body.info.username;
  }

  await user.save();
  res.status(200).json({ message: "success" });
});

const findUserInfo = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.userId).select("-login");

  if (!user) {
    res.status(400).json({ message: "Impossible de trouver l'utilisateur." });
  }

  res.status(200).json(user);
});

const addToWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  const product = await Product.findById(req.params.productId);

  if (user && product) {
    try {
      await user.wishlist.push(req.params.productId);
      await product.analytics.likes.push(req.user.id);
      await user.save();
      await product.save();
      res.status(200).json({ status: "success" });
    } catch (err) {
      res
        .status(400)
        .json({
          status: "error",
          message:
            "Une erreur est survenue. Veuillez réessayer ultérieurement.",
        });
    }
  } else {
    res
      .status(400)
      .json({
        message:
          "Impossible d'obtenir les informations utilisateur et/ou produit.",
      });
  }
});

const removeFromWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  const product = await Product.findById(req.params.productId);

  if (user && product) {
    try {
      user.wishlist = user.wishlist.filter((id) => id != req.params.productId);
      product.analytics.likes = product.analytics.likes.filter(
        (id) => id != req.user.id
      );
      await user.save();
      await product.save();
      res.status(200).json({ status: "success" });
    } catch (err) {
      res
        .status(400)
        .json({
          status: "error",
          message:
            "Une erreur est survenue. Veuillez réessayer ultérieurement.",
        });
    }
  } else {
    res
      .status(400)
      .json({
        message:
          "Impossible d'obtenir les informations utilisateur et/ou produit.",
      });
  }
});

const getMyWishlistProducts = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  let results = [];

  try {
    for (let i = 0; i < user.wishlist.length; i++) {
      const result = await Product.findById(user.wishlist[i]);
      if (result) {
        results.push(result);
      }
    }
    res.status(200).json(results);
  } catch (err) {
    console.log(err);
    res.status(400);
  }
});

module.exports = {
  getMyUserInfo,
  updateMyUserInfo,
  findUserInfo,
  addToWishlist,
  removeFromWishlist,
  getMyWishlistProducts
};
