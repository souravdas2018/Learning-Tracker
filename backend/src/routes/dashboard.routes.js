const router = require("express").Router();
const authMiddleware = require("../middlewares/auth.middleware");
const adminMiddleware = require("../middlewares/admin.middleware");
const dashboardController = require("../controllers/dashboard.controller");

router.get("/", authMiddleware, dashboardController.getDashboard); //  ==> User Dashboard
router.get("/", adminMiddleware); //  ==> Admin Dashboard

module.exports = router;
