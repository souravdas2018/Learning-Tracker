// Author: Sourav Kumar Das
const aiService = require('../services/ai.service');

// ── User endpoints ───────────────────────────────────────────────────────────

exports.getInsight = async (req, res) => {
  try {
    const { dashboardData } = req.body;
    if (!dashboardData) return res.status(400).json({ error: 'dashboardData is required' });
    const insight = await aiService.generateInsight(dashboardData);
    res.json({ insight });
  } catch (err) {
    console.error('[AI] getInsight error:', err);
    res.status(500).json({ error: 'Failed to generate insight' });
  }
};

exports.askAssistant = async (req, res) => {
  try {
    const { moduleTitle, courseTitle, question, history } = req.body;
    if (!question?.trim()) return res.status(400).json({ error: 'question is required' });
    const answer = await aiService.askStudyAssistant(
      moduleTitle || 'Unknown Module',
      courseTitle || 'Unknown Course',
      question.trim(),
      Array.isArray(history) ? history : []
    );
    res.json({ answer });
  } catch (err) {
    console.error('[AI] askAssistant error:', err);
    res.status(500).json({ error: 'Failed to get answer' });
  }
};

exports.getQuiz = async (req, res) => {
  try {
    const { moduleTitle, courseTitle } = req.body;
    if (!moduleTitle) return res.status(400).json({ error: 'moduleTitle is required' });
    const quiz = await aiService.generateQuiz(
      moduleTitle,
      courseTitle || 'Unknown Course'
    );
    res.json(quiz);
  } catch (err) {
    console.error('[AI] getQuiz error:', err);
    res.status(500).json({ error: 'Failed to generate quiz' });
  }
};

exports.getRecommendations = async (req, res) => {
  try {
    const { enrolledTitles, availableCourses } = req.body;
    const result = await aiService.getRecommendations(
      enrolledTitles || [],
      availableCourses || []
    );
    res.json(result);
  } catch (err) {
    console.error('[AI] getRecommendations error:', err);
    res.status(500).json({ error: 'Failed to get recommendations' });
  }
};

exports.generalChat = async (req, res) => {
  try {
    const { question, history, dashboardContext } = req.body;
    if (!question?.trim()) return res.status(400).json({ error: 'question is required' });
    const answer = await aiService.generalChat(
      question.trim(),
      Array.isArray(history) ? history : [],
      dashboardContext || null
    );
    res.json({ answer });
  } catch (err) {
    console.error('[AI] generalChat error:', err);
    res.status(500).json({ error: 'Failed to get answer' });
  }
};

// ── Admin endpoints ──────────────────────────────────────────────────────────

exports.getAdminSummary = async (req, res) => {
  try {
    const { dashboardData } = req.body;
    if (!dashboardData) return res.status(400).json({ error: 'dashboardData is required' });
    const summary = await aiService.generateAdminSummary(dashboardData);
    res.json({ summary });
  } catch (err) {
    console.error('[AI] getAdminSummary error:', err);
    res.status(500).json({ error: 'Failed to generate summary' });
  }
};

exports.getAtRiskAnalysis = async (req, res) => {
  try {
    const { dashboardData } = req.body;
    if (!dashboardData) return res.status(400).json({ error: 'dashboardData is required' });
    const analysis = await aiService.getAtRiskAnalysis(dashboardData);
    res.json(analysis);
  } catch (err) {
    console.error('[AI] getAtRiskAnalysis error:', err);
    res.status(500).json({ error: 'Failed to generate risk analysis' });
  }
};

exports.generateCourseDescription = async (req, res) => {
  try {
    const { courseTitle } = req.body;
    if (!courseTitle?.trim()) return res.status(400).json({ error: 'courseTitle is required' });
    const description = await aiService.generateCourseDescription(courseTitle.trim());
    res.json({ description });
  } catch (err) {
    console.error('[AI] generateCourseDescription error:', err);
    res.status(500).json({ error: 'Failed to generate description' });
  }
};

exports.adminChat = async (req, res) => {
  try {
    const { question, history, dashboardContext } = req.body;
    if (!question?.trim()) return res.status(400).json({ error: 'question is required' });
    const answer = await aiService.adminChat(
      question.trim(),
      Array.isArray(history) ? history : [],
      dashboardContext || null
    );
    res.json({ answer });
  } catch (err) {
    console.error('[AI] adminChat error:', err);
    res.status(500).json({ error: 'Failed to get answer' });
  }
};

exports.getContentGapAnalysis = async (req, res) => {
  try {
    const { dashboardData } = req.body;
    if (!dashboardData) return res.status(400).json({ error: 'dashboardData is required' });
    const analysis = await aiService.getContentGapAnalysis(dashboardData);
    res.json(analysis);
  } catch (err) {
    console.error('[AI] getContentGapAnalysis error:', err);
    res.status(500).json({ error: 'Failed to generate content gap analysis' });
  }
};
