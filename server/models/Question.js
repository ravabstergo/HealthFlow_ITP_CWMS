const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ["number", "yesNo", "multipleChoice", "text"],
    required: true,
  },
  options: {
    type: [String],
    default: [],
  },
  hasDetails: {
    type: Boolean,
    default: false, // For questions like "Did you experience side effects?" where "Yes" requires details
  },
});

const Question = mongoose.model("Question", questionSchema);

module.exports = Question;