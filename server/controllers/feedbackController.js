const Feedback = require("../models/Feedback");
const User = require("../models/User");
const Appointment = require("../models/Appointment");

exports.createFeedback = async (req, res) => {
  const { encounterId, answers, comments } = req.body;
  const patientId = req.user.id;

  try {
    const appointment = await Appointment.findOne({ _id: encounterId.split("PE")[1], patientId });
    if (!appointment) {
      return res.status(404).json({ message: "Encounter not found" });
    }

    const feedback = new Feedback({
      patientId,
      doctorId: appointment.doctorId,
      encounterId,
      answers,
      comments,
    });

    await feedback.save();
    res.status(201).json(feedback);
  } catch (error) {
    res.status(500).json({ message: "Error creating feedback", error: error.message });
  }
};

exports.getFeedback = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const feedback = await Feedback.findById(id).populate("answers.questionId");
    if (!feedback || feedback.patientId.toString() !== userId) {
      return res.status(403).json({ message: "Unauthorized or feedback not found" });
    }
    res.status(200).json(feedback);
  } catch (error) {
    res.status(500).json({ message: "Error fetching feedback", error: error.message });
  }
};

exports.getPatientFeedbacks = async (req, res) => {
  const userId = req.user.id;

  try {
    const feedbacks = await Feedback.find({ patientId: userId }).populate("answers.questionId");
    res.status(200).json(feedbacks);
  } catch (error) {
    res.status(500).json({ message: "Error fetching feedbacks", error: error.message });
  }
};

exports.getDoctorFeedbacks = async (req, res) => {
  const doctorId = req.user.id;

  try {
    const feedbacks = await Feedback.find({ doctorId }).populate("patientId", "name email");
    res.status(200).json(feedbacks);
  } catch (error) {
    res.status(500).json({ message: "Error fetching feedbacks", error: error.message });
  }
};

exports.updateFeedback = async (req, res) => {
  const { id } = req.params;
  const { answers, comments } = req.body;
  const userId = req.user.id;

  try {
    const feedback = await Feedback.findById(id);
    if (!feedback || feedback.patientId.toString() !== userId) {
      return res.status(403).json({ message: "Unauthorized or feedback not found" });
    }

    const createdAt = new Date(feedback.createdAt);
    const now = new Date();
    const diffInMinutes = (now - createdAt) / (1000 * 60);
    if (diffInMinutes > 10) {
      return res.status(403).json({ message: "Edit window has expired (10 minutes)" });
    }

    feedback.answers = answers;
    feedback.comments = comments;
    await feedback.save();
    res.status(200).json(feedback);
  } catch (error) {
    res.status(500).json({ message: "Error updating feedback", error: error.message });
  }
};

exports.deleteFeedback = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const feedback = await Feedback.findById(id);
    if (!feedback || feedback.patientId.toString() !== userId) {
      return res.status(403).json({ message: "Unauthorized or feedback not found" });
    }

    const createdAt = new Date(feedback.createdAt);
    const now = new Date();
    const diffInMinutes = (now - createdAt) / (1000 * 60);
    if (diffInMinutes > 10) {
      return res.status(403).json({ message: "Delete window has expired (10 minutes)" });
    }

    await Feedback.deleteOne({ _id: id });
    res.status(200).json({ message: "Feedback deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting feedback", error: error.message });
  }
};

exports.getMetrics = async (req, res) => {
  const doctorId = req.user.id;

  try {
    const appointments = await Appointment.find({ doctorId, status: "completed" });
    const feedbacks = await Feedback.find({ doctorId }).populate("answers.questionId");

    const totalConsultations = appointments.length;

    const totalFeedbackReceived = feedbacks.length;

    const healthImprovementScores = feedbacks
      .map(f => f.answers.find(a => a.questionId.text.includes("overall health improvement"))?.answer)
      .filter(score => score !== undefined);
    const patientSatisfactionRate = healthImprovementScores.length
      ? (healthImprovementScores.reduce((sum, score) => sum + parseInt(score), 0) / healthImprovementScores.length / 5 * 100).toFixed(0) + "%"
      : "0%";

    const appointmentDates = appointments.map(a => new Date(a.createdAt).toISOString().split("T")[0]);
    const peakConsultationDay = appointmentDates.length
      ? Object.entries(
          appointmentDates.reduce((acc, date) => {
            acc[date] = (acc[date] || 0) + 1;
            return acc;
          }, {})
        )
        .sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A"
      : "N/A";

    const treatmentSuccessRate = healthImprovementScores.length
      ? (healthImprovementScores.filter(score => parseInt(score) >= 3).length / healthImprovementScores.length * 100).toFixed(0) + "%"
      : "0%";

    res.status(200).json({
      totalConsultations,
      totalFeedbackReceived,
      patientSatisfactionRate,
      peakConsultationDay,
      treatmentSuccessRate,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching metrics", error: error.message });
  }
};