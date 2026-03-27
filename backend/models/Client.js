const mongoose = require("mongoose");

const clientSchema = new mongoose.Schema({
  clientName: String,
  clientPocName: String,
  clientPocEmail: String,
  clientPocMobile: String,
  clientVandorEmail: String,
  ourPocName: String,
  startDate: String,
  paymentTerms: String,
  attachments: Array,
  createdBy: String,
  createdByEmail: String,
  createdByName: String,
  createdByEmployeeId: String
}, { timestamps: true }); // 🔥 IMPORTANT

module.exports = mongoose.model("Client", clientSchema);