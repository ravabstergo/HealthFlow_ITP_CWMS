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
const paymentRoutes = require('./routes/paymentRoutes'); // Import payment routes

const app = express();
const PORT = process.env.PORT || 5000;

// Load environment variables
dotenv.config();

// DB Connection
connectDB();

// CORS Configuration - Allow PayHere notifications
app.use(cors({
  origin: ['http://localhost:3000', 'https://sandbox.payhere.lk', 'https://www.payhere.lk'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
}));

// Middleware
app.use(express.json());

// Log all incoming requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
  if (req.body) {
    console.log('Request body:', JSON.stringify(req.body, null, 2));
  }
  next();
});

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
app.use('/api/finance', financialRoutes); // Use financial routes
app.use('/api/payments', paymentRoutes); // Use payment routes

require("./aiModel");
app.use("/api/ai", aiModelRoute);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  res.status(500).json({ message: 'Internal server error', error: err.message });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
