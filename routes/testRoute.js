const express = require("express");
const { getStripeUrl, getStripeProductId } = require("../controllers/paymentController");
const { sendTestEmail, sendTestos } = require("../middleware/emailMiddleware");
const router = express.Router();

router.route("/").get((req, res) => {
  res.status(200).send("WALA ZEBI CA MARCHE");
});

router
    .route('/pay')
    .post(getStripeUrl)

router
    .route("/create-product")
    .post(getStripeProductId)

router
    .route('/email')
    .get(sendTestos)



module.exports = router;
