const express = require("express");
const {
  addNewProduct,
  getProductInfo,
  getAllProducts,
  getProductsByCategory,
  getProductsBySubcategory,
  getProductsByBrand,
  getProductsBySize,
  getMostPopularProducts,
  getMostViewedProducts,
  getProductRecommendations,
  searchProductsWithFilters
} = require("../controllers/productsController");
const router = express.Router();

router.route('/').get(getAllProducts);
router.route('/post').post(addNewProduct);
router.route('/info/:productId').get(getProductInfo);
router.route('/category/:category').get(getProductsByCategory);
router.route('/subcategory/:subcategory').get(getProductsBySubcategory);
router.route('/brand/:brandName').get(getProductsByBrand);
router.route('/size/:size').get(getProductsBySize);
router.route('/popular').get(getMostPopularProducts);
router.route('/most-viewed').get(getMostViewedProducts);
router.route('/:productId/recommendations').get(getProductRecommendations);
router.route('/search').post(searchProductsWithFilters);

module.exports = router;
