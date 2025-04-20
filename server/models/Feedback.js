const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    encounterId: {
      type: String,
      required: true, // e.g., "PE" + appointmentId
    },
    answers: [
      {
        questionId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Question",
          required: true,
        },
        answer: {
          type: mongoose.Schema.Types.Mixed, // Can be number, string, or object (e.g., { value: "Yes", details: "Rash" })
          required: true,
        },
      },
    ],
    comments: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

const Feedback = mongoose.model("Feedback", feedbackSchema);

module.exports = Feedback;