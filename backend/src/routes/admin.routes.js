// Author: Sourav Kumar Das
const express = require("express");
const router = express.Router();

const adminController = require("../controllers/admin.controller");
const adminMiddleware = require("../middlewares/admin.middleware");


router.post("/adminsignup", adminController.signup);  // ==>  Admin Sign-up
router.post("/adminlogin", adminController.login);  // ==>  Admin Login
router.post("/adminlogout", adminMiddleware, adminController.logout);// ==> Admin Logout
router.post("/giveadminaccess", adminMiddleware, adminController.giveAdminAccess);  // ==>  Existing Admin gives admin access to another user
router.get("/pendingadmins", adminMiddleware, adminController.getPendingAdmins);  // ==> Get all admins with access = false

module.exports = router;
