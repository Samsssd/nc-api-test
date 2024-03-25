const mongoose = require("mongoose");

const productSchema = mongoose.Schema(
  {
    name: String,
    stripeId: String,
    sellerId: String,
    price: String,
    category: String,
    subCategory: String,
    assets: {
      mainImage: String,
      square: [],
      vertical: [],
    },
    mainDesc: String,
    shortDesc: String,
    additionalInfo: {
      size: {
        sizeType: String,
        availableSizes: []
      },
      material: [],
      brand: [{ name: String, id: String, asset: String }],
      color: []
    },
    stock : {},
    delivery: {},
    additionalMedia : {
      mediaType: String,
      mediaUrl: String
    },
    analytics: {
      views: Number,
      likes: [],
      addToCarts: Number,
      initiatedCheckouts: Number,
      sales: Number,
      popularity: Number
    },
    reviews: {
      reviewsGrade: Number,
      allReviews: []
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Product", productSchema);
