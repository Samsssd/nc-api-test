const express = require("express");
const { getMySellerInfo, updateMySellerInfo, addSellerReview, getSellerProducts } = require("../controllers/sellerController");
const { protect } = require("../middleware/authMiddleware");
const router = express.Router();

router
  .route("/me")
  .get(protect, getMySellerInfo)
  .put(protect, updateMySellerInfo);

router
  .route("/:sellerId/reviews")
  .post(protect, addSellerReview);

router
  .route("/products")
  .get(protect, getSellerProducts);

module.exports = router;
