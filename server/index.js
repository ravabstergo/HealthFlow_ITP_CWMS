const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/DB");

const appointmentRoutes = require("./routes/appointmentRoutes");
const encounterRoutes = require("./routes/encounterRoutes");
const prescriptionRoutes = require("./routes/PrescriptionRoute");
const aiModelRoute = require("./routes/aiModelRoute");
const authRoutes = require("./routes/authRoutes");
const recordRoutes = require("./routes/recordRoutes");
const DocRoutes = require("./routes/DocumentRoutes");
const feedbackRoutes = require("./routes/feedbackRoutes"); // Add this line to import feedbackRoutes
const roleRoutes = require("./routes/roleRoutes");
const preRegisterRoutes = require("./routes/preRegisterRoutes");
const chatRoutes = require('./routes/chatRoutes');
const patientRoutes = require('./routes/patientRoutes');
const financialRoutes = require('./routes/financialRoutes'); // Import financial routes

const app = express();
const PORT = process.env.PORT || 5000;

// Load environment variables
dotenv.config();

// DB Connection
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
console.log("Setting up routes...");
app.use("/api/auth", authRoutes);
app.use("/api/records", recordRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/prescriptions", prescriptionRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/document", DocRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/roles", roleRoutes);
app.use("/api/preregistration", preRegisterRoutes);
app.use("/api/encounters", encounterRoutes);
app.use('/api/appointments',appointmentRoutes);
app.use('/api/finance', financialRoutes); // Use financial routes

require("./aiModel");
app.use("/api/ai", aiModelRoute);


// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
