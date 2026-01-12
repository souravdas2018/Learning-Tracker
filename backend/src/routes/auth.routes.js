// Author: Sourav Kumar Das
const express = require("express");
const router = express.Router();

const authController = require("../controllers/auth.controller");
const authMiddleware = require("../middlewares/auth.middleware");


router.post("/signup", authController.signup);  //  ==> User Sign-up
router.post("/login", authController.login);  //  ==> User Login
router.post("/logout", authMiddleware, authController.logout);  //  ==> User Logout

module.exports = router;
