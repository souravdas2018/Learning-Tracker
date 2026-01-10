const express = require("express");
const router = express.Router();

const adminController = require("../controllers/admin.controller");
const adminMiddleware = require("../middlewares/admin.middleware");

router.get("/", (req, res) => {
  res.json({ message: "Admin route working" });
});


// Admin Auth
router.post("/adminsignup", adminController.signup);
router.post("/adminlogin", adminController.login);

// Admin logout → MUST be logged in
router.post("/adminlogout", adminMiddleware, adminController.logout);

/**
 * Existing admin gives admin access to another user
 * Protected route
 */
router.post("/giveadminaccess", adminController.giveAdminAccess);

module.exports = router;
