const Seller = require("../models/sellerModel");
const asyncHandler = require("express-async-handler");

/**
 * @desc    Get current seller's information
 * @route   GET /api/v1/seller/me
 * @access  Private
 */
const getMySellerInfo = asyncHandler(async (req, res) => {
  const seller = await Seller.findById(req.user.id).select("-loginInfo.password");

  if (seller) {
    res.status(200).json(seller);
  } else {
    res
      .status(400)
      .json({ message: "Impossible d'obtenir les informations du vendeur." });
  }
});

/**
 * @desc    Get all products for the current seller
 * @route   GET /api/v1/seller/products
 * @access  Private
 */
const getSellerProducts = asyncHandler(async (req, res) => {
    const sellerId = req.user.id;
  
    const products = await Product.find({ sellerId });
  
    if (products.length === 0) {
      return res.status(404).json({ message: "Aucun produit trouvé pour ce vendeur." });
    }
  
    res.status(200).json(products);
  });

/**
 * @desc    Update current seller's information
 * @route   PUT /api/v1/seller/me
 * @access  Private
 */
const updateMySellerInfo = asyncHandler(async (req, res) => {
  try {
    const seller = await Seller.findById(req.user.id);

    if (!seller) {
      return res.status(404).json({ message: "Vendeur non trouvé." });
    }

    // Update general info
    if (req.body.generalInfo) {
      Object.keys(req.body.generalInfo).forEach(key => {
        if (seller.generalInfo.hasOwnProperty(key)) {
          seller.generalInfo[key] = req.body.generalInfo[key];
        }
      });
    }

    // Update address
    if (req.body.address) {
      Object.keys(req.body.address).forEach(key => {
        if (seller.address.hasOwnProperty(key)) {
          seller.address[key] = req.body.address[key];
        }
      });
    }

    // Update other fields
    ['preferredCategories', 'shippingMethods', 'returnPolicy'].forEach(field => {
      if (req.body[field]) {
        seller[field] = req.body[field];
      }
    });

    await seller.save();
    res.status(200).json({ message: "Informations du vendeur mises à jour avec succès.", seller: seller });
  } catch (error) {
    console.error('Erreur lors de la mise à jour des informations du vendeur:', error);
    res.status(500).json({ message: "Une erreur est survenue lors de la mise à jour des informations du vendeur." });
  }
});

/**
 * @desc    Add a review to a seller
 * @route   POST /api/v1/seller/:sellerId/reviews
 * @access  Private
 */
const addSellerReview = asyncHandler(async (req, res) => {
    const { rating, comment } = req.body;
    const sellerId = req.params.sellerId;
  
    if (!rating || !comment) {
      return res.status(400).json({ message: "La note et le commentaire sont requis." });
    }
  
    const seller = await Seller.findById(sellerId);
  
    if (!seller) {
      return res.status(404).json({ message: "Vendeur non trouvé." });
    }
  
    // Check if the user has already reviewed this seller
    const alreadyReviewed = seller.reviews.find(
      (review) => review.user.toString() === req.user.id.toString()
    );
  
    if (alreadyReviewed) {
      return res.status(400).json({ message: "Vous avez déjà évalué ce vendeur." });
    }
  
    const review = {
      user: req.user.id,
      name: req.user.info.username,
      rating: Number(rating),
      comment,
    };
  
    seller.reviews.push(review);
  
    // Update average rating
    seller.ratings.totalReviews = seller.reviews.length;
    seller.ratings.averageRating =
      seller.reviews.reduce((acc, item) => item.rating + acc, 0) /
      seller.reviews.length;
  
    await seller.save();
  
    res.status(201).json({ message: "Avis ajouté avec succès." });
  });

module.exports = {
  getMySellerInfo,
  updateMySellerInfo,
  addSellerReview,
  getSellerProducts
};
