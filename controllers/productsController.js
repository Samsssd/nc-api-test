const Product = require("../models/productModel");
const asyncHandler = require("express-async-handler");
const { getStripeProductId } = require("./paymentController");

// CREATE PRODUCT, UPDATE/DELETE PRODUCTS, GET/FILTER (or do you put it client side????) PRODUCTS
// https://ncproducts.s3.eu-west-3.amazonaws.com/nike-shoe-square.jpg
const addNewProduct = asyncHandler(async (req, res) => {
  // INPUT VALIDATION
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

const getAllProducts = asyncHandler(async (req, res) => {
  try {
    const products = await Product.find();
    if (products.length > 0) {
      res.status(200).json(products);
    } else {
      res.status(400).json({ status: "error", message: "No products found." });
    }
  } catch (err) {
    console.log(err);
  }
});
module.exports = { addNewProduct, getProductInfo, getAllProducts };
