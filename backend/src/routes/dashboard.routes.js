const router = require("express").Router();
const authMiddleware = require("../middlewares/auth.middleware");
const adminMiddleware = require("../middlewares/admin.middleware");
const dashboardController = require("../controllers/dashboard.controller");


router.get("/", authMiddleware, dashboardController.getUserDashboard); //  ==> User Dashboard
router.get("/admin", adminMiddleware, dashboardController.getAdminDashboard); //  ==> Admin Dashboard

module.exports = router;
