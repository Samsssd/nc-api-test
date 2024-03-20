const mongoose = require("mongoose");

const creatorSchema = mongoose.Schema(
  {
    login: {
      email: String,
      phone: String,
      password: String,
    },
    info: {
        name: String,
        mainDescription: String,
        shortDescription: String,
        profilePic: String,
        general: {
            firstName: String,
            lastName: String
        },
        legal: {
            companyName: String
        }  
    },
    products: [],
    orders: []
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Creator", creatorSchema);
