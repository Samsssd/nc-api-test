const User = require("../models/userModel");
const Product = require("../models/productModel");
const asyncHandler = require("express-async-handler");

/**
 * @desc    Get current user's information
 * @route   GET /api/v1/user/me
 * @access  Private
 */
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

/**
 * @desc    Update current user's information
 * @route   PUT /api/v1/user/me
 * @access  Private
 */
const updateMyUserInfo = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé." });
    }

    // Update login information
    if (req.body.login) {
      if (req.body.login.email) {
        // Check if email is already in use
        const existingUser = await User.findOne({ 'login.email': req.body.login.email });
        if (existingUser && existingUser._id.toString() !== user._id.toString()) {
          return res.status(400).json({ message: "Cette adresse e-mail est déjà utilisée." });
        }
        user.login.email = req.body.login.email;
      }
      if (req.body.login.phone) user.login.phone = req.body.login.phone;
    }

    // Update info
    if (req.body.info) {
      if (req.body.info.username) {
        // Check if username is already in use
        const existingUser = await User.findOne({ 'info.username': req.body.info.username });
        if (existingUser && existingUser._id.toString() !== user._id.toString()) {
          return res.status(400).json({ message: "Ce nom d'utilisateur est déjà pris." });
        }
        user.info.username = req.body.info.username;
      }
      if (req.body.info.profilePicture) user.info.profilePicture = req.body.info.profilePicture;
      if (req.body.info.firstName) user.info.firstName = req.body.info.firstName;
      if (req.body.info.lastName) user.info.lastName = req.body.info.lastName;
      
      // Update address
      if (req.body.info.address) {
        Object.keys(req.body.info.address).forEach(key => {
          if (user.info.address.hasOwnProperty(key)) {
            user.info.address[key] = req.body.info.address[key];
          }
        });
      }
    }

    // Update wishlist, orders, and notifications
    ['wishlist', 'orders', 'notifications'].forEach(field => {
      if (Array.isArray(req.body[field])) {
        user[field] = req.body[field];
      }
    });

    // Update misc information
    if (req.body.misc) {
      ['isFirstTimeLogin', 'isVerified', 'hasSubscribedNewsletter'].forEach(field => {
        if (typeof req.body.misc[field] === 'boolean') {
          user.misc[field] = req.body.misc[field];
        }
      });
      if (req.body.misc.verificationCode) user.misc.verificationCode = req.body.misc.verificationCode;
    }

    // Update mySize information
    if (req.body.mySize) {
      ['tops', 'bottoms', 'dresses', 'shoes'].forEach(category => {
        if (Array.isArray(req.body.mySize[category])) {
          user.mySize[category] = req.body.mySize[category];
        }
      });
    }

    await user.save();
    res.status(200).json({ message: "Informations utilisateur mises à jour avec succès.", user: user });
  } catch (error) {
    console.error('Erreur lors de la mise à jour des informations utilisateur:', error);
    res.status(500).json({ message: "Une erreur est survenue lors de la mise à jour des informations utilisateur." });
  }
});

/**
 * @desc    Find user information by ID
 * @route   GET /api/v1/user/find/:userId
 * @access  Private
 */
const findUserInfo = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.userId).select("-login");

  if (!user) {
    res.status(400).json({ message: "Impossible de trouver l'utilisateur." });
  }

  res.status(200).json(user);
});

/**
 * @desc    Add a product to user's wishlist
 * @route   POST /api/v1/user/wishlist/:productId
 * @access  Private
 */
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

/**
 * @desc    Remove a product from user's wishlist
 * @route   DELETE /api/v1/user/wishlist/:productId
 * @access  Private
 */
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

/**
 * @desc    Get all products in user's wishlist
 * @route   GET /api/v1/user/wishlist
 * @access  Private
 */
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
