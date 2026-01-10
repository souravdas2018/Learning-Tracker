const dashboardRepo = require("../repositories/dashboard.repo");

exports.getDashboard = async (userId) => {
  const progress = await dashboardRepo.getProgress(userId);

  const overallProgress =
    progress.length === 0
      ? 0
      : Math.round(
          progress.reduce((a, b) => a + b.progress, 0) / progress.length
        );

  const totalTimeSpent = progress.reduce(
    (a, b) => a + b.time_spent,
    0
  );

  return {
    overallProgress,
    totalTimeSpent
  };
};
