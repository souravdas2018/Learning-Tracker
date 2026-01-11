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

exports.getModulesByCourse = async (courseId, userId = null) => {
  // Fetch modules for the course
  const modulesResult = await courseRepo.getModulesByCourse(courseId);
  const modulesData = modulesResult.data || [];

  // If no userId provided, return modules as-is
  if (!userId) return modulesData;

  // Fetch user progress for these modules
  const moduleIds = modulesData.map((m) => m.id);
  const progressResult = await courseRepo.getUserModuleProgressForModules(userId, moduleIds);
  const progressData = progressResult.data || [];

  // Map progress by module_id for quick lookup
  const progressByModule = {};
  progressData.forEach((p) => {
    progressByModule[p.module_id] = p;
  });

  // Merge progress into modules
  const modulesWithProgress = modulesData.map((m) => ({
    ...m,
    progress: progressByModule[m.id]?.progress ?? 0,
    time_spent: progressByModule[m.id]?.time_spent ?? 0
  }));

  return modulesWithProgress;
};

exports.createModule = async (courseId, data, adminId) => {
  return courseRepo.createModule({
    ...data,
    course_id: courseId,
    created_by: adminId
  });
};

exports.updateModuleProgress = async (userId, moduleId) => {
  // Get current progress record to determine update count
  const currentProgress = await courseRepo.getModuleProgress(userId, moduleId);

  // Determine update count based on current progress
  // If no record exists or progress is 0 (initialized), it's the first update
  let nextUpdateCount;
  
  if (!currentProgress || currentProgress.progress === 0 || currentProgress.progress === null) {
    // First update: no record or initialized with 0
    nextUpdateCount = 1;
  } else {
    const currentProgressValue = currentProgress.progress;
    // Determine which update we're on based on current progress range
    // Handle boundary cases by checking ranges from highest to lowest
    if (currentProgressValue >= 100) {
      // Already at 100%, no more updates needed
      throw new Error("Module progress is already at 100%");
    } else if (currentProgressValue >= 85) {
      // Fifth update was done (85-99), so next would be 6th (cap at 100)
      nextUpdateCount = 6;
    } else if (currentProgressValue >= 70) {
      // Fourth update was done (70-84), so next is fifth
      nextUpdateCount = 5;
    } else if (currentProgressValue >= 50) {
      // Third update was done (50-69), so next is fourth
      nextUpdateCount = 4;
    } else if (currentProgressValue >= 30) {
      // Second update was done (30-49), so next is third
      nextUpdateCount = 3;
    } else if (currentProgressValue >= 10) {
      // First update was done (10-29), so next is second
      nextUpdateCount = 2;
    } else {
      // Progress is between 0-9 (initialized state), so next is first update
      nextUpdateCount = 1;
    }
  }

  // Generate random progress based on update count
  let progress;
  let timeSpent;

  if (nextUpdateCount === 1) {
    // First time: 10-30
    progress = Math.floor(Math.random() * (30 - 10 + 1)) + 10;
    timeSpent = Math.floor(Math.random() * (30 - 15 + 1)) + 15; // 15-30 minutes
  } else if (nextUpdateCount === 2) {
    // Second time: 30-50
    progress = Math.floor(Math.random() * (50 - 30 + 1)) + 30;
    timeSpent = Math.floor(Math.random() * (45 - 20 + 1)) + 20; // 20-45 minutes
  } else if (nextUpdateCount === 3) {
    // Third time: 50-70
    progress = Math.floor(Math.random() * (70 - 50 + 1)) + 50;
    timeSpent = Math.floor(Math.random() * (60 - 25 + 1)) + 25; // 25-60 minutes
  } else if (nextUpdateCount === 4) {
    // Fourth time: 70-85
    progress = Math.floor(Math.random() * (85 - 70 + 1)) + 70;
    timeSpent = Math.floor(Math.random() * (75 - 30 + 1)) + 30; // 30-75 minutes
  } else if (nextUpdateCount === 5) {
    // Fifth time: 85-100
    progress = Math.floor(Math.random() * (100 - 85 + 1)) + 85;
    timeSpent = Math.floor(Math.random() * (90 - 35 + 1)) + 35; // 35-90 minutes
  } else {
    // Beyond 5 updates, cap at 100%
    progress = 100;
    timeSpent = Math.floor(Math.random() * (100 - 40 + 1)) + 40; // 40-100 minutes
  }

  // Calculate total time spent (add to existing if record exists)
  const totalTimeSpent = currentProgress 
    ? (currentProgress.time_spent || 0) + timeSpent
    : timeSpent;

  const result = await courseRepo.updateModuleProgress({
    user_id: userId,
    module_id: moduleId,
    progress,
    time_spent: totalTimeSpent
  });

  if (result.error) {
    throw result.error;
  }

  return result;
};

exports.getAllCourses = async () => {
  const courses = await courseRepo.getAllCoursesWithModules();

  // Get enrollment counts
  const enrollmentCounts = await courseRepo.getEnrollmentCounts();

  // Add enrollment count to each course
  const coursesWithCounts = (courses || []).map(course => ({
    ...course,
    enrollmentCount: enrollmentCounts[course.id] || 0
  }));

  return coursesWithCounts;
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
