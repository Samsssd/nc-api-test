const mongoose = require("mongoose");

const gameSchema = mongoose.Schema(
  {
    orderState: String, // placed, expedited, delivered, success, issue (WILL NEED CRON JOB AFTER 14x DAYS)
    content: [], //LIST OF PRODUCTS IDs to fetch later (or keep minimal info so as not to ping db too much)
    customer: {
      userId: String,
      firstName: String,
      lastName: String,
      adressNumber: Number,
      adressStreet: String,
      adressDetails: String,
      notes: String,
      contactInfo: {
        email: String,
        phone: String,
        hasSubscribed: Boolean,
      },
    },
    delivery: {
      deliveryType: String,
      deliveryStatus: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Game", gameSchema);
