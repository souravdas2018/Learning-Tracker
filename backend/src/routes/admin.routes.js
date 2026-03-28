// Author: Sourav Kumar Das
const express = require("express");
const router = express.Router();

const adminController = require("../controllers/admin.controller");
const adminMiddleware = require("../middlewares/admin.middleware");
const { body } = require('express-validator');
const { handleValidation } = require('../middlewares/validation.middleware');

const adminSignupValidation = [
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

const adminLoginValidation = [
	body('email').isEmail().withMessage('Valid email required'),
	body('password').notEmpty().withMessage('Password required'),
	handleValidation,
];

router.post("/adminsignup", adminSignupValidation, adminController.signup);  // ==>  Admin Sign-up
router.post("/adminlogin", adminLoginValidation, adminController.login);  // ==>  Admin Login
router.post("/adminlogout", adminMiddleware, adminController.logout);// ==> Admin Logout
router.post("/giveadminaccess", adminMiddleware, adminController.giveAdminAccess);  // ==>  Existing Admin gives admin access to another user
router.get("/pendingadmins", adminMiddleware, adminController.getPendingAdmins);  // ==> Get all admins with access = false

module.exports = router;
