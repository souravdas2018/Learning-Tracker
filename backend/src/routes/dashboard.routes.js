const router = require("express").Router();
const authMiddleware = require("../middlewares/auth.middleware");
const dashboardController = require("../controllers/dashboard.controller");

router.get("/", authMiddleware, dashboardController.getDashboard);

module.exports = router;
