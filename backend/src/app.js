// Author: Sourav Kumar Das

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const { rateLimiter } = require("./middlewares/rateLimit.middleware");

const app = express();

// Security headers
app.use(helmet());

// CORS - allow configured frontend origin
const corsOptions = {
  origin: process.env.FRONTEND_ORIGIN || "http://localhost:3500",
  credentials: true,
};
app.use(cors(corsOptions));

// Basic rate-limiting for all requests
app.use(rateLimiter);

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Learning Tracker Backend is running");
});

app.use("/admin", require("./routes/admin.routes"));
app.use("/auth", require("./routes/auth.routes"));
app.use("/courses", require("./routes/course.routes"));
app.use("/dashboard", require("./routes/dashboard.routes"));

module.exports = app;


