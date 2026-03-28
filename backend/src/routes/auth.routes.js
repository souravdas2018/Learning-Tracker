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
	body('password')
		.isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
		.matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
		.matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
		.matches(/[0-9]/).withMessage('Password must contain at least one number'),
	body('first_name').notEmpty().withMessage('First name is required').isString().trim(),
	body('last_name').notEmpty().withMessage('Last name is required').isString().trim(),
	body('phone').isMobilePhone('any').withMessage('Valid phone number required'),
	handleValidation,
];

const loginValidation = [
	body('email').isEmail().withMessage('Valid email required'),
	body('password').notEmpty().withMessage('Password required'),
	handleValidation,
];

router.post("/signup", signupValidation, authController.signup);  //  ==> User Sign-up
router.post("/login", loginValidation, authController.login);  //  ==> User Login
router.post("/logout", authMiddleware, authController.logout);  //  ==> User Logout

module.exports = router;
