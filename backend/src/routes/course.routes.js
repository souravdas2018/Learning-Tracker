const express = require("express");
const router = express.Router();
const { body } = require('express-validator');
const { handleValidation } = require('../middlewares/validation.middleware');

const courseController = require("../controllers/course.controller");
const adminMiddleware = require("../middlewares/admin.middleware");
const authMiddleware = require("../middlewares/auth.middleware");
const userCourseController = require("../controllers/userCourse.controller");

// Author: Sourav Kumar Das

const courseValidation = [
	body('title').notEmpty().withMessage('Course title is required').isString().trim().isLength({ max: 200 }).withMessage('Title must be under 200 characters'),
	body('description').optional().isString().trim().isLength({ max: 2000 }).withMessage('Description must be under 2000 characters'),
	body('fees').optional().isString().trim(),
	handleValidation,
];

const moduleValidation = [
	body('title').notEmpty().withMessage('Module title is required').isString().trim().isLength({ max: 200 }).withMessage('Title must be under 200 characters'),
	handleValidation,
];

// USER
router.get("/", authMiddleware, courseController.getAllCourses);  // ==> Get All Courses (USER)
router.get("/:courseId/modules", authMiddleware, courseController.getModulesByCourse);  // ==> Get All Modules Of a Course (User)
router.post("/:courseId/opt", authMiddleware, courseController.optForCourse);  //  ==> User opts for a course
router.get("/my-courses", authMiddleware, userCourseController.getMyCourses);  // ==> All the course the user has opt for
router.put("/modules/:moduleId/progress", authMiddleware, courseController.updateModuleProgress);  // ==> Updating the progress of each module by User

// ADMIN
router.post("/admin/create-course", adminMiddleware, courseValidation, courseController.createCourse);  // ==> Create Course (Admin)
router.put("/admin/:id", adminMiddleware, courseValidation, courseController.updateCourse);  // ==> Update Course (Admin)
router.delete("/admin/:id", adminMiddleware, courseController.deleteCourse); // ==> Delete Course (Admin)
router.post("/admin/:courseId/modules", adminMiddleware, moduleValidation, courseController.createModule);  // ==> Create Modules (Admin)
router.get("/admin/allcourse", adminMiddleware, courseController.getAllCourses);  // ==> Get All Courses (Admin)

module.exports = router;
