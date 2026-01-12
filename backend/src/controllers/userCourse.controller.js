// Author: Sourav Kumar Das
const userCourseService = require("../services/userCourse.service");

exports.getMyCourses = async (req, res) => {
  try {
    const userId = req.user.id;

    const courses = await userCourseService.getMyCourses(userId);

    res.json(courses);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
