// Author: Sourav Kumar Das
const express = require("express");
const router = express.Router();


const authController = require("../controllers/auth.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const { body } = require('express-validator');
const { handleValidation } = require('../middlewares/validation.middleware');

// Validation rules
const signupValidation = [
	body('email').isEmail().withMessage('Valid email required'),
	body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
	body('first_name').optional().isString(),
	body('last_name').optional().isString(),
	handleValidation,
];

const loginValidation = [
	body('email').isEmail().withMessage('Valid email required'),
	body('password').exists().withMessage('Password required'),
	handleValidation,
];

router.post("/signup", signupValidation, authController.signup);  //  ==> User Sign-up
router.post("/login", loginValidation, authController.login);  //  ==> User Login
router.post("/logout", authMiddleware, authController.logout);  //  ==> User Logout

module.exports = router;
