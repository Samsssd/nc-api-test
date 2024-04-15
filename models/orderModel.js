const mongoose = require("mongoose");

const orderSchema = mongoose.Schema(
  {
    orderState: String, // placed, expedited, delivered, success, issue (WILL NEED CRON JOB AFTER 14x DAYS)
    customerId: String,
    content: [], //LIST OF PRODUCTS IDs to fetch later (or keep minimal info so as not to ping db too much)
    customer: {
      firstName: String,
      lastName: String,
      adressStreetLine: String,
      city: String,
      region: String,
      country: String,
      postalCode: String,
      notes: String,
      contactInfo: {
        email: String,
        phone: String,
        hasSubscribed: Boolean,
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Order", orderSchema);
