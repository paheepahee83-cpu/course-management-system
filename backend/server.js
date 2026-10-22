
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Existing routes
const authRoutes = require("./routes/authRoutes");
const authMiddleware = require("./middleware/authMiddleware");
const userRoutes = require("./routes/userRoutes");
const courseRoutes = require("./routes/courseRoutes");
const enrollmentRoutes = require("./routes/enrollmentRoutes");

// CR-009 reporting routes
const reportRoutes = require("./routes/reportRoutes");

// Public login and authentication routes
app.use("/api/auth", authRoutes);

// Course routes; authorization remains in the course router
app.use("/api/courses", courseRoutes);

// Existing protected routes
app.use("/api/users", authMiddleware, userRoutes);
app.use("/api/enrollments", authMiddleware, enrollmentRoutes);

// Reporting routes have their own authentication and role checks
app.use("/api/reports", reportRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
