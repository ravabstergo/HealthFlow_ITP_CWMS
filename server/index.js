const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/DB");

const authRoutes = require("./routes/authRoutes");
const DocRoutes = require("./routes/DocumentRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

//Load environment variables
dotenv.config();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
console.log("Setting up routes...");
app.use("/api/auth", authRoutes);

app.use("/api/document", DocRoutes);

// DB Connection
connectDB();

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
