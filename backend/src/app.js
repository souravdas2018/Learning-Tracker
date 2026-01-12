// Author: Sourav Kumar Das
const express = require("express");
const app = express();

// CORS configuration
app.use((req, res, next) => {
  const origin = process.env.FRONTEND_ORIGIN || "http://localhost:3500";
  res.header("Access-Control-Allow-Origin", origin);
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("Access-Control-Allow-Credentials", "true");
  
  // Handle preflight requests
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  
  next();
});

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Learning Tracker Backend is running");
});

app.use("/admin", require("./routes/admin.routes"));
app.use("/auth", require("./routes/auth.routes"));
app.use("/courses", require("./routes/course.routes"));
app.use("/dashboard", require("./routes/dashboard.routes"));

module.exports = app;


