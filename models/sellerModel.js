const mongoose = require("mongoose");

const sellerSchema = mongoose.Schema(
  {
    loginInfo: {
        password: String,
    },
    generalInfo: {
      username: String,
      email: String,
      businessName: String,
      description: String,
      logo: String,
      contactEmail: String,
      contactPhone: String,
    },
    address: {
      street: String,
      city: String,
      state: String,
      postalCode: String,
      country: String,
    },
    ratings: {
      averageRating: {
        type: Number,
        default: 0,
      },
      totalReviews: {
        type: Number,
        default: 0,
      },
    },
    reviews: [],
    isVerified: {
      type: Boolean,
      default: false,
    },
    preferredCategories: [String],
    shippingMethods: [String],
    returnPolicy: String,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Seller", sellerSchema);
