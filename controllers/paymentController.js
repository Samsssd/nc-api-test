const asyncHandler = require("express-async-handler");
const stripe = require("stripe")(process.env.STRIPE_KEY);
const Product = require("../models/productModel");
const YOUR_DOMAIN = "https://192.0.0.2:3000/checkout";
const PRICE_ID = "pr_1234";
const DHL_PRICE_CODE = "price_1Ou3mPP4BVWfguzeetd2YV5b"

const getStripeUrl = asyncHandler(async (req, res) => {
  let products = [];
  let caca = 2;
  
  for (let i = 0; i < req.body.length; i++) {
    if (req.body[i] !== "dhl-delivery") {
      const item = await Product.findById(req.body[i]);
      products.push({ price: item.stripeId, quantity: 1 });
    } else {
      products.push({price: DHL_PRICE_CODE, quantity: 1})
    }
  }
  
  const session = await stripe.checkout.sessions.create({
    line_items: products,
    // [
    //   {
    //     // Provide the exact Price ID (for example, pr_1234) of the product you want to sell
    //     price: 'price_1OtV7lP4BVWfguzew01RSS0v',
    //     quantity: 1,
    //   },
    // ],
    mode: "payment",
    success_url: `${YOUR_DOMAIN}?success=true`,
    cancel_url: `${YOUR_DOMAIN}?canceled=true`,
  });

  res.status(200).json({ url: session.url });
});

module.exports = { getStripeUrl };
