const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema({
  patentid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Patent",
    required: false,
  },
  doctorid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Doctor",
    required: false,
  },
  documentName: {
    type: String,
    required: true,
  },
  documentUrl: {
    type: String,
    required: true,
  },
  documentType: {
    type: String,
    enum: ["Scan", "Lab Report", "Prescription", "System Generated"],
    required: true,
  },
  status: {
    type: String,
    enum: ["Pending", "Doctor Review", "Approved", "Rejected"],
    default: "Pending",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  modifiedAt: {
    type: Date,
    default: null,
  },
});

const Document = mongoose.model("Document", documentSchema);

module.exports = Document;
