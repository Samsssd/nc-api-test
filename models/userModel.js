const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
  {
    login: {
      email: String,
      phone: String,
      password: String,
    },
    info: {
      username: String,
      profilePicture: String,
      firstName: String,
      lastName: String,
      address: {
        adressNumber: Number,
        adressStreet: String,
        postalCode: String,
        city: String,
        region: String,
        adressDetails: String,
      },
    },
    mySize: {
      tops: [String],
      bottoms: [String],
      dresses: [String],
      shoes: [String],
    },
    wishlist: [],
    orders: [],
    notifications: [],
    misc: {
      isFirstTimeLogin: Boolean,
      isVerified: Boolean,
      verificationCode: String,
      hasSubscribedNewsletter: String,
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
