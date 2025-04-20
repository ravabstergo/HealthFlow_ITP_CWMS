const mongoose = require("mongoose");

const allergySchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  allergen: {
    type: String,
    required: true,
  },
  reaction: {
    type: String,
    required: true,
  },
  severity: {
    type: String,
    enum: ["mild", "moderate", "severe"],
    required: true,
  },
});

const Allergy = mongoose.model("Allergy", allergySchema);

module.exports = Allergy;