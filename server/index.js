const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");


const appointmentRoutes = require("./routes/appointmentRoutes");
const encounterRoutes = require("./routes/encounterRoutes");

const connectDB = require("./config/DB");
const prescriptionRoutes = require('./routes/PrescriptionRoute');
const aiModelRoute = require('./routes/aiModelRoute');
const drugsRoute = require('./routes/drugsdb');

const authRoutes = require("./routes/authRoutes");

const recordRoutes = require("./routes/recordRoutes");

const DocRoutes = require("./routes/DocumentRoutes");
const feedbackRoutes = require("./routes/feedbackRoutes"); 





const app = express();
const PORT = process.env.PORT || 5000;

// Load environment variables
dotenv.config();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
console.log("Setting up routes...");
app.use("/api/auth", authRoutes);

app.use("/api/records", recordRoutes);

app.use("/api/feedback", feedbackRoutes);

app.use('/api/prescriptions', prescriptionRoutes);
require('./aiModel');
app.use("/api/ai", aiModelRoute);
app.use("/api/drugs", drugsRoute);

app.use("/api/document", DocRoutes);

app.use("/api/encounters", encounterRoutes);


// DB Connection
connectDB();


app.use('/api/appointments',appointmentRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});