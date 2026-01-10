const express = require("express");
const router = express.Router();

const authController = require("../controllers/auth.controller");
const authMiddleware = require("../middlewares/auth.middleware");


router.get("/", (req, res) => {
  res.json({ message: "User route working" });
});

router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.post("/logout", authMiddleware, authController.logout);

module.exports = router;
