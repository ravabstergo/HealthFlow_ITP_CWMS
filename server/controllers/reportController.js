const Feedback = require("../models/Feedback");
const User = require("../models/User");
const Prescription = require("../models/Prescription");
const Allergy = require("../models/Allergy");
const runAI = require("../alModel");

exports.generateReport = async (req, res) => {
  const doctorId = req.user.id;

  try {
    const feedbacks = await Feedback.find({ doctorId })
      .populate("patientId", "name email")
      .populate("answers.questionId");
    const patientIds = feedbacks.map(f => f.patientId._id);
    const prescriptions = await Prescription.find({ patientId: { $in: patientIds } });
    const allergies = await Allergy.find({ patientId: { $in: patientIds } });

    const reportData = feedbacks.map(feedback => {
      const patientPrescriptions = prescriptions.filter(p => p.patientId.toString() === feedback.patientId._id.toString());
      const patientAllergies = allergies.filter(a => a.patientId.toString() === feedback.patientId._id.toString());
      return {
        patient: feedback.patientId,
        feedback: feedback.answers.map(a => ({
          question: a.questionId.text,
          answer: a.answer,
        })),
        comments: feedback.comments,
        prescriptions: patientPrescriptions,
        allergies: patientAllergies,
      };
    });

    const prompt = `
Analyze the following patient feedback, prescriptions, and allergies to provide an overall summary of patient outcomes and treatment effectiveness:

${JSON.stringify(reportData, null, 2)}

Provide a concise summary focusing on trends, common issues, and recommendations for improving patient care.
`;
    const aiAnalysis = await runAI(prompt);

    res.status(200).json({ reportData, aiAnalysis });
  } catch (error) {
    res.status(500).json({ message: "Error generating report", error: error.message });
  }
};