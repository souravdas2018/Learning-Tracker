const courseService = require("../services/course.service");

exports.createCourse = async (req, res) => {
  try {
    const course = await courseService.createCourse(req.body, req.admin.id);
    res.json(course);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.updateCourse = async (req, res) => {
  try {
    await courseService.updateCourse(req.params.id, req.body);
    res.json({ message: "Course updated" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteCourse = async (req, res) => {
  try {
    await courseService.deleteCourse(req.params.id);
    res.json({ message: "Course deleted" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getAllCourses = async (req, res) => {
  const courses = await courseService.getAllCourses();
  res.json(courses);
};

exports.getModulesByCourse = async (req, res) => {
  const modules = await courseService.getModulesByCourse(req.params.courseId);
  res.json(modules);
};

exports.createModule = async (req, res) => {
  const module = await courseService.createModule(
    req.params.courseId,
    req.body,
    req.admin.id
  );
  res.json(module);
};

exports.updateModuleProgress = async (req, res) => {
  await courseService.updateModuleProgress(
    req.user.id,
    req.params.moduleId,
    req.body
  );
  res.json({ message: "Progress updated" });
};

exports.getAllCourses = async (req, res) => {
  try {
    const courses = await courseService.getAllCourses();
    res.json(courses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.optForCourse = async (req, res) => {
  try {
    const userId = req.user.id;
    const { courseId } = req.params;

    await courseService.optForCourse(userId, courseId);

    res.json({ message: "Course opted successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
