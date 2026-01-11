const dashboardService = require("../services/dashboard.service");

exports.getUserDashboard = async (req, res) => {
  try {
    const data = await dashboardService.getUserDashboard(req.user.id);
  res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAdminDashboard = async (req, res) => {
  try {
    const data = await dashboardService.getAdminDashboard();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
