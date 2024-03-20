const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
  {
    login: {
      email: String,
      phone: String,
      password: String,
    },
    info: {
      firstName: String,
      lastName: String,
      address: {
        adressNumber: Number,
        adressStreet: String,
        adressDetails: String,
      },
      contactInfo: {
        email: String,
        phone: String,
        hasSubscribed: Boolean,
      },
    },
    wishlist: [],
    orders: []
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
