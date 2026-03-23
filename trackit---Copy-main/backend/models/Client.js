const mongoose = require("mongoose");

const clientSchema = new mongoose.Schema({
  clientName: String,
  clientPocName: String,
  clientPocEmail: String,
  clientPocMobile: String,
  clientVanderEmail: String,
  ourPocName: String,
  startDate: String,
  paymentTerms: String,
  attachments: Array,
  createdBy: String
}, { timestamps: true });

module.exports = mongoose.model("Client", clientSchema);