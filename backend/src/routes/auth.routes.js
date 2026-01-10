const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.json({ message: "Auth route working" });
});

// router.post("/signup", authController.signup);
// router.post("/login", authController.login);

module.exports = router;
