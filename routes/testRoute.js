const express = require("express");
const { getStripeUrl } = require("../controllers/paymentController");
const router = express.Router();

router.route("/").get((req, res) => {
  res.status(200).send("WALA ZEBI CA MARCHE");
});

router
    .route('/pay')
    .post(getStripeUrl)

module.exports = router;
