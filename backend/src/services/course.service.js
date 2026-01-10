const courseRepo = require("../repositories/course.repo");

exports.createCourse = async (data, adminId) => {
  return courseRepo.createCourse({ ...data, created_by: adminId });
};

exports.updateCourse = async (id, data) => {
  return courseRepo.updateCourse(id, data);
};

exports.deleteCourse = async (id) => {
  return courseRepo.deleteCourse(id);
};

exports.getAllCourses = async () => {
  return courseRepo.getAllCourses();
};

exports.getModulesByCourse = async (courseId) => {
  return courseRepo.getModulesByCourse(courseId);
};

exports.createModule = async (courseId, data, adminId) => {
  return courseRepo.createModule({
    ...data,
    course_id: courseId,
    created_by: adminId
  });
};

exports.updateModuleProgress = async (userId, moduleId, data) => {
  return courseRepo.updateModuleProgress({
    user_id: userId,
    module_id: moduleId,
    ...data
  });
};

exports.getAllCourses = async () => {
  return courseRepo.getAllCoursesWithModules();
};


exports.optForCourse = async (userId, courseId) => {
  // 1. Check if already opted
  const existing = await courseRepo.getUserCourse(userId, courseId);
  if (existing) {
    throw new Error("Course already opted");
  }

  // 2. Enroll user
  await courseRepo.optForCourse(userId, courseId);

  // 3. Fetch modules of course
  const modules = await courseRepo.getModulesByCourse(courseId);

  // 4. Initialize progress for each module
  await courseRepo.initializeModuleProgress(userId, modules);
};
