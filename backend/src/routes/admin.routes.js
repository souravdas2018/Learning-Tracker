const express = require("express");
const router = express.Router();

const adminController = require("../controllers/admin.controller");
const adminMiddleware = require("../middlewares/admin.middleware");

router.get("/", (req, res) => {
  res.json({ message: "Admin route working" });
});


// Admin signup
router.post("/adminsignup", adminController.signup);
// Admin login
router.post("/adminlogin", adminController.login);
// Admin logout → MUST be logged in
router.post("/adminlogout", adminMiddleware, adminController.logout);

/**
 * Existing admin gives admin access to another user
 * Protected route
 */
router.post("/giveadminaccess", adminMiddleware, adminController.giveAdminAccess);

// Route to get all admins with access = false
router.get("/pendingadmins", adminMiddleware, adminController.getPendingAdmins);

module.exports = router;
