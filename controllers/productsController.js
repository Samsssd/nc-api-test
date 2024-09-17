const Product = require("../models/productModel");
const asyncHandler = require("express-async-handler");
const { getStripeProductId } = require("./paymentController");

/**
 * @desc    Add a new product
 * @route   POST /api/v1/products/post
 * @access  Private/Admin
 */
const addNewProduct = asyncHandler(async (req, res) => {
  const product = await Product.create({...req.body, stripeId: ""});
  if (product) {
    product.stripeId = await getStripeProductId(product.name, product.price * 100, product.assets.mainImage)
    await product.save()
    if(getStripeProductId(product.name, product.price * 100) !== null) {
      res.status(200).json({
        message: "success",
        id: product._id,
      });
    }
  } else {
    res.status(400).json({
      message:
        "Impossible d'ajouter le produit. Veuillez réessayer ultérieurement.",
      status: "error",
    });
  }
});

/**
 * @desc    Get product information by ID
 * @route   GET /api/v1/products/info/:productId
 * @access  Public
 */
const getProductInfo = asyncHandler(async (req, res) => {
  try {
    const productExists = await Product.findById(req.params.productId);
    if (productExists === null) {
      res.status(400).json({
        message:
          "Impossible de trouver le produit. Veuillez réessayer ultérieurement.",
        status: "error",
      });
    } else {
      res.status(200).json(productExists);
    }
  } catch (err) {
    res.status(400).json({
      message: "Une erreur est survenue. Veuillez réessayer ultérieurement.",
      status: "error",
    });
  }
});

/**
 * @desc    Update a product
 * @route   PUT /api/v1/products/:productId
 * @access  Private/Seller
 */
const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.productId);

  if (!product) {
    return res.status(404).json({ message: "Produit non trouvé." });
  }

  // Check if the logged-in seller owns this product
  if (product.sellerId.toString() !== req.user.id) {
    return res.status(403).json({ message: "Non autorisé à modifier ce produit." });
  }

  const updatedProduct = await Product.findByIdAndUpdate(
    req.params.productId,
    req.body,
    { new: true, runValidators: true }
  );

  res.status(200).json(updatedProduct);
});

/**
 * @desc    Delete a product
 * @route   DELETE /api/v1/products/:productId
 * @access  Private/Seller
 */
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.productId);

  if (!product) {
    return res.status(404).json({ message: "Produit non trouvé." });
  }

  // Check if the logged-in seller owns this product
  if (product.sellerId.toString() !== req.user.id) {
    return res.status(403).json({ message: "Non autorisé à supprimer ce produit." });
  }

  await product.remove();

  res.status(200).json({ message: "Produit supprimé avec succès." });
});

/**
 * @desc    Get all products (randomly ordered)
 * @route   GET /api/v1/products
 * @access  Public
 */
const getAllProducts = asyncHandler(async (req, res) => {
  try {
    const products = await Product.aggregate([{ $sample: { size: await Product.countDocuments() } }]);
    if (products.length > 0) {
      res.status(200).json(products);
    } else {
      res.status(400).json({ status: "error", message: "No products found." });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ status: "error", message: "Server error" });
  }
});

/**
 * @desc    Get products by category
 * @route   GET /api/v1/products/category/:category
 * @access  Public
 */
const getProductsByCategory = asyncHandler(async (req, res) => {
  const { category } = req.params;
  const products = await Product.find({ category });
  res.status(200).json(products);
});

/**
 * @desc    Get products by subcategory
 * @route   GET /api/v1/products/subcategory/:subcategory
 * @access  Public
 */
const getProductsBySubcategory = asyncHandler(async (req, res) => {
  const { subcategory } = req.params;
  const products = await Product.find({ subCategory: subcategory });
  res.status(200).json(products);
});

/**
 * @desc    Get products by brand
 * @route   GET /api/v1/products/brand/:brandName
 * @access  Public
 */
const getProductsByBrand = asyncHandler(async (req, res) => {
  const { brandName } = req.params;
  const products = await Product.find({ 'additionalInfo.brand.name': brandName });
  res.status(200).json(products);
});

/**
 * @desc    Get products by size
 * @route   GET /api/v1/products/size/:size
 * @access  Public
 */
const getProductsBySize = asyncHandler(async (req, res) => {
  const { size } = req.params;
  const products = await Product.find({ 'additionalInfo.size.availableSizes': size });
  res.status(200).json(products);
});

/**
 * @desc    Get most popular products
 * @route   GET /api/v1/products/popular
 * @access  Public
 */
const getMostPopularProducts = asyncHandler(async (req, res) => {
  const products = await Product.find().sort({ 'analytics.popularity': -1 }).limit(10);
  res.status(200).json(products);
});

/**
 * @desc    Get most viewed products
 * @route   GET /api/v1/products/most-viewed
 * @access  Public
 */
const getMostViewedProducts = asyncHandler(async (req, res) => {
  const products = await Product.find().sort({ 'analytics.views': -1 }).limit(10);
  res.status(200).json(products);
});

/**
 * @desc    Get product recommendations based on a product
 * @route   GET /api/v1/products/:productId/recommendations
 * @access  Public
 */
const getProductRecommendations = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const product = await Product.findById(productId);

  if (!product) {
    return res.status(404).json({ message: "Produit non trouvé." });
  }

  const recommendations = await Product.find({
    $and: [
      { _id: { $ne: productId } },
      { 
        $or: [
          { category: product.category },
          { subCategory: product.subCategory },
          { 'additionalInfo.brand.name': { $in: product.additionalInfo.brand.map(b => b.name) } }
        ]
      }
    ]
  }).limit(5);

  res.status(200).json(recommendations);
});

/**
 * @desc    Search products with filters
 * @route   POST /api/v1/products/search
 * @access  Public
 */
const searchProductsWithFilters = asyncHandler(async (req, res) => {
  const { 
    query, 
    category, 
    subCategory, 
    brands, 
    sizes, 
    minPrice, 
    maxPrice 
  } = req.body;

  let filter = {};

  if (query) {
    filter.$or = [
      { name: { $regex: query, $options: 'i' } },
      { mainDesc: { $regex: query, $options: 'i' } },
      { shortDesc: { $regex: query, $options: 'i' } }
    ];
  }

  if (category) filter.category = category;
  if (subCategory) filter.subCategory = subCategory;
  if (brands && brands.length > 0) filter['additionalInfo.brand.name'] = { $in: brands };
  if (sizes && sizes.length > 0) filter['additionalInfo.size.availableSizes'] = { $in: sizes };
  if (minPrice !== undefined || maxPrice !== undefined) {
    filter.price = {};
    if (minPrice !== undefined) filter.price.$gte = minPrice;
    if (maxPrice !== undefined) filter.price.$lte = maxPrice;
  }

  const products = await Product.find(filter);
  res.status(200).json(products);
});

const deleteRecentProducts = asyncHandler(async (req, res) => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  try {
    const result = await Product.deleteMany({ createdAt: { $gte: yesterday } });
    res.status(200).json({
      message: `Successfully deleted ${result.deletedCount} products created since yesterday.`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Error deleting recent products:', error);
    res.status(500).json({ message: "An error occurred while deleting recent products." });
  }
});

module.exports = {
  addNewProduct,
  getProductInfo,
  updateProduct,
  deleteProduct,
  getAllProducts,
  getProductsByCategory,
  getProductsBySubcategory,
  getProductsByBrand,
  getProductsBySize,
  getMostPopularProducts,
  getMostViewedProducts,
  getProductRecommendations,
  searchProductsWithFilters,
  deleteRecentProducts
};
