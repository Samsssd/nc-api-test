const express = require("express");
const { addToWishlist, removeFromWishlist, getMyUserInfo, findUserInfo, updateMyUserInfo, getMyWishlistProducts } = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");
const router = express.Router();

router
    .route("/me")
    .get(protect, getMyUserInfo)
    .put(protect, updateMyUserInfo)

router
    .route("/find/:userId")
    .get(protect, findUserInfo)

router
    .route("/wishlist/:productId")
    .get(protect, getMyWishlistProducts)
    .post(protect, addToWishlist)
    .delete(protect, removeFromWishlist)



module.exports = router;
