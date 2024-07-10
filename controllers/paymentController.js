const asyncHandler = require("express-async-handler");
const stripe = require("stripe")(process.env.STRIPE_KEY);
const Product = require("../models/productModel");
const YOUR_DOMAIN = "https://no-context.fr/checkout";
const PRICE_ID = "pr_1234";
const AUTH_PRICE_CODE = "price_1PagqXRp8cIHQ7lF82QNizr3"

const getStripeUrl = asyncHandler(async (req, res) => {
  let products = [];
  
  for (let i = 0; i < req.body.length; i++) {
    if (req.body[i].selectedDelivery !== "authenticated") {
      const item = await Product.findById(req.body[i]._id);
      products.push({ price: item.stripeId, quantity: 1 });
    } else {
      const item = await Product.findById(req.body[i]._id);
      products.push({ price: item.stripeId, quantity: 1 });
      products.push({price: AUTH_PRICE_CODE, quantity: 1})
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

const getStripeProductId = asyncHandler(async (req, res) => {
  const product = await stripe.products.create({
    name: "Livraison Authentifiée",
    default_price_data: {
      unit_amount: 1000,
      currency: 'eur',
    },
    expand: ['default_price'],
    // images: ["https://ncproducts.s3.eu-west-3.amazonaws.com/nike-shoe-square.jpg"],
  });
  if (product.default_price) {
    // return product.default_price.id
    res.status(200).json({stripeId: product.default_price.id})
  } else {
    return null
  }
})

module.exports = { getStripeUrl, getStripeProductId };
