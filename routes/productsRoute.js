const express = require("express");
const { addNewProduct, getProductInfo, getAllProducts } = require("../controllers/productsController");
const router = express.Router();

// router.route("/post").post((req, res) => {
//     res.status(200).send("WALA ZEBI CA MARCHE");
//   });
router
    .route('/')
    .get(getAllProducts)

router
    .route('/post')
    .post(addNewProduct)

router
    .route('/info/:productId')
    .get(getProductInfo)

module.exports = router;
