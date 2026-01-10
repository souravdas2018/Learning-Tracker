const dashboardService = require("../services/dashboard.service");

exports.getDashboard = async (req, res) => {
  const data = await dashboardService.getDashboard(req.user.id);
  res.json(data);
};
