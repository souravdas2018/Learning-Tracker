const userCourseRepo = require("../repositories/userCourse.repo");

exports.getMyCourses = async (userId) => {
  return userCourseRepo.getMyCourses(userId);
};