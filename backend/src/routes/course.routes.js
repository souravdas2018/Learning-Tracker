const express = require("express");
const router = express.Router();

const courseController = require("../controllers/course.controller");
const adminMiddleware = require("../middlewares/admin.middleware");
const authMiddleware = require("../middlewares/auth.middleware");
const userCourseController = require("../controllers/userCourse.controller");

// USER
router.get("/", authMiddleware, courseController.getAllCourses);  // ==> Get All Courses (USER)
router.get("/:courseId/modules", authMiddleware, courseController.getModulesByCourse);  // ==> Get All Modules Of a Course (User)
router.post("/:courseId/opt", authMiddleware, courseController.optForCourse);  //  ==> User opts for a course
router.get("/my-courses", authMiddleware, userCourseController.getMyCourses);  // ==> All the course the user has opt for 
router.put("/modules/:moduleId/progress", authMiddleware, courseController.updateModuleProgress);  // ==> Updating the progress of each module by User

// ADMIN
router.post("/", adminMiddleware, courseController.createCourse);  // ==> Create Course (Admin)
// router.put("/:id", adminMiddleware, courseController.updateCourse);  // ==> Update Course (Admin)
// router.delete("/:id", adminMiddleware, courseController.deleteCourse); // ==> Delete Course (Admin)
router.post("/:courseId/modules", adminMiddleware, courseController.createModule);  // ==> Create Modules (Admin)
router.get("/", adminMiddleware, courseController.getAllCourses);  // ==> Get All Courses (Admin)

module.exports = router;
