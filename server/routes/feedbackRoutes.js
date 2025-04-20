const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  createFeedback,
  getFeedback,
  getPatientFeedbacks,
  getDoctorFeedbacks,
  updateFeedback,
  deleteFeedback,
  getMetrics,
} = require("../controllers/feedbackController");
const { getQuestions } = require("../controllers/questionController");
const { generateReport } = require("../controllers/reportController");

router.post("/", protect, createFeedback);
router.get("/:id", protect, getFeedback);
router.get("/patient/me", protect, getPatientFeedbacks);
router.get("/doctor/me", protect, getDoctorFeedbacks);
router.put("/:id", protect, updateFeedback);
router.delete("/:id", protect, deleteFeedback);
router.get("/questions/all", protect, getQuestions);
router.get("/metrics/me", protect, getMetrics);
router.get("/report/generate", protect, generateReport);

module.exports = router;