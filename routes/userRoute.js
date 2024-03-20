const express = require("express");
const { addToWishlist } = require("../controllers/userController");
const router = express.Router();

router.route("/").get((req, res) => {
  res.status(200).send("WALA ZEBI CA MARCHE");
});

router
    .route("/wishlist/add/:productId")
    .post(addToWishlist);

module.exports = router;
