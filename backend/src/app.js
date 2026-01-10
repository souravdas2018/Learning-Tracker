const express = require("express");
const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Learning Tracker Backend is running");
});

app.use("/auth", require("./routes/auth.routes"));
app.use("/courses", require("./routes/course.routes"));
app.use("/dashboard", require("./routes/dashboard.routes"));

module.exports = app;


