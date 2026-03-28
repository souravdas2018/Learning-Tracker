// Author: Sourav Kumar Das
const router = require('express').Router();
const authMiddleware  = require('../middlewares/auth.middleware');
const adminMiddleware = require('../middlewares/admin.middleware');
const aiController    = require('../controllers/ai.controller');

// ── User routes (JWT auth) ───────────────────────────────────────────────────
router.post('/insights',        authMiddleware, aiController.getInsight);
router.post('/ask',             authMiddleware, aiController.askAssistant);
router.post('/quiz',            authMiddleware, aiController.getQuiz);
router.post('/recommendations', authMiddleware, aiController.getRecommendations);
router.post('/chat',            authMiddleware, aiController.generalChat);

// ── Admin routes (admin JWT auth) ────────────────────────────────────────────
router.post('/admin-summary',        adminMiddleware, aiController.getAdminSummary);
router.post('/at-risk-analysis',     adminMiddleware, aiController.getAtRiskAnalysis);
router.post('/course-description',   adminMiddleware, aiController.generateCourseDescription);
router.post('/admin-chat',           adminMiddleware, aiController.adminChat);
router.post('/content-gap',          adminMiddleware, aiController.getContentGapAnalysis);

module.exports = router;
