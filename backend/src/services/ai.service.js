// Author: Sourav Kumar Das
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Groq = require('groq-sdk');

const GEMINI_MODEL = process.env.GEMINI_MODEL;
const GROQ_MODEL   = process.env.GROQ_MODEL;

// ── Internal helpers ────────────────────────────────────────────────────────

async function callGemini(system, messages, maxTokens) {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({
    model: GEMINI_MODEL,
    systemInstruction: system,
    generationConfig: { maxOutputTokens: maxTokens },
  });

  const history = messages.slice(0, -1).map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

  const chat = model.startChat({ history });
  const last = messages[messages.length - 1];
  const result = await chat.sendMessage(last.content);
  return result.response.text();
}

async function callGroq(system, messages, maxTokens) {
  const client = new Groq({ apiKey: process.env.GROQ_API_KEY });
  const res = await client.chat.completions.create({
    model: GROQ_MODEL,
    max_tokens: maxTokens,
    messages: [{ role: 'system', content: system }, ...messages],
  });
  return res.choices[0].message.content;
}

// Try Gemini first; fall back to Groq on any error
async function callAI(system, messages, maxTokens = 300) {
  try {
    return await callGemini(system, messages, maxTokens);
  } catch (err) {
    console.warn('[AI] Gemini failed, falling back to Groq:', err.message);
    return await callGroq(system, messages, maxTokens);
  }
}

// Extract JSON from AI response (handles markdown code fences)
function extractJSON(text) {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenced) return JSON.parse(fenced[1].trim());
  const inline = text.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
  if (inline) return JSON.parse(inline[1].trim());
  return JSON.parse(text.trim());
}

// ── 1. User: Personalised learning insight ──────────────────────────────────

exports.generateInsight = async (dashboardData) => {
  const system = `You are an encouraging learning coach on an online education platform.
Given a learner's progress data, write exactly 2-3 sentences of personalised, specific, and motivating insight.
Focus on one concrete achievement and one actionable next step. Keep it warm, direct, and positive.
Do NOT use bullet points or headings — just plain prose.`;

  const d = dashboardData;
  const topCourse = d.courseProgress?.[0];
  const userMsg = `Learner stats:
- Overall progress: ${d.overallProgress}%
- Total time spent: ${d.totalTimeSpent} minutes
- Enrolled: ${d.enrolledCoursesCount}, Completed: ${d.completedCoursesCount}, In progress: ${d.coursesInProgress}
- Modules: ${d.moduleStats?.completed ?? 0} of ${d.moduleStats?.total ?? 0} completed
- Last active course: ${d.lastActiveCourse?.title ?? 'None'}
- Top course: ${topCourse ? `"${topCourse.title}" at ${topCourse.progress}%` : 'None'}
Write a short personalised insight.`;

  return callAI(system, [{ role: 'user', content: userMsg }], 200);
};

// ── 2. User: Study assistant ────────────────────────────────────────────────

exports.askStudyAssistant = async (moduleTitle, courseTitle, question, history = []) => {
  const system = `You are a helpful AI study assistant on an online learning platform.
The student is studying the module "${moduleTitle}" in the course "${courseTitle}".
Answer questions clearly and concisely. Use markdown for code blocks, lists, and emphasis where helpful.
If a question is completely unrelated to learning, gently redirect the student.`;

  const messages = [
    ...history.map(h => ({ role: h.role, content: h.content })),
    { role: 'user', content: question },
  ];

  return callAI(system, messages, 800);
};

// ── 3. User: Quiz generator ─────────────────────────────────────────────────

exports.generateQuiz = async (moduleTitle, courseTitle) => {
  const system = `You are an educational quiz generator.
Generate exactly 5 multiple-choice questions about the given topic.
Return ONLY a valid JSON object — no markdown, no explanation, no extra text.
Schema: { "questions": [ { "question": "...", "options": ["A","B","C","D"], "correct": 0 } ] }
"correct" is the 0-based index of the correct option.`;

  const userMsg = `Generate a 5-question quiz for the module "${moduleTitle}" in the course "${courseTitle}".
Return valid JSON only.`;

  const raw = await callAI(system, [{ role: 'user', content: userMsg }], 900);
  return extractJSON(raw);
};

// ── 4. User: Course recommendations ────────────────────────────────────────

exports.getRecommendations = async (enrolledTitles, availableCourses) => {
  if (!availableCourses || availableCourses.length === 0) return { recommendations: [] };

  const system = `You are a smart learning advisor on an online education platform.
Given courses the user is already enrolled in and a list of available courses,
recommend up to 3 courses they should take next.
Return ONLY valid JSON — no markdown, no explanation.
Schema: { "recommendations": [ { "title": "...", "reason": "..." } ] }
Only recommend courses from the available list. Keep each reason to 1-2 sentences.`;

  const userMsg = `Enrolled courses: ${enrolledTitles.length > 0 ? enrolledTitles.join(', ') : 'None yet'}
Available courses to recommend from: ${availableCourses.map(c => c.title).join(', ')}
Return JSON recommendations.`;

  const raw = await callAI(system, [{ role: 'user', content: userMsg }], 500);
  return extractJSON(raw);
};

// ── 5. Admin: Platform health summary ──────────────────────────────────────

exports.generateAdminSummary = async (dashboardData) => {
  const system = `You are a data analyst assistant for an online learning platform admin.
Given platform statistics, write a concise 3-4 sentence executive summary highlighting:
- Overall platform health
- One positive trend or achievement
- One area that needs attention or action
Be specific, data-driven, and professional. Plain prose only — no bullet points or headings.`;

  const d = dashboardData;
  const userMsg = `Platform stats:
- Total users: ${d.users?.total}, Active: ${d.users?.active}, Inactive: ${d.users?.inactive}
- New users this month: ${d.users?.newThisMonth}
- Users with no enrollments: ${d.users?.withNoEnrollments}
- Total courses: ${d.courses?.total}, Total modules: ${d.courses?.totalModules}
- Courses with 0 enrollments: ${d.courses?.withNoEnrollments}
- Total enrollments: ${d.enrollments?.total}, Active: ${d.enrollments?.active}
- Avg progress across all users: ${d.engagement?.averageProgress}%
- Total learning time: ${d.engagement?.totalLearningTime} minutes
- Avg learning time per user: ${d.engagement?.averageLearningTimePerUser} minutes
- Most popular course: ${d.mostPopularCourse?.title ?? 'N/A'} (${d.mostPopularCourse?.enrollmentCount ?? 0} enrollments)
Write an executive summary.`;

  return callAI(system, [{ role: 'user', content: userMsg }], 300);
};

// ── 6. Admin: At-risk engagement analysis ──────────────────────────────────

exports.getAtRiskAnalysis = async (dashboardData) => {
  const system = `You are a learning engagement analyst.
Based on platform data, identify engagement risk areas and provide actionable recommendations.
Return ONLY valid JSON — no markdown, no extra text.
Schema: {
  "riskLevel": "low" | "medium" | "high",
  "summary": "2-sentence overview",
  "risks": [ { "area": "...", "detail": "...", "action": "..." } ]
}
Provide 2-4 risk items. Each action should be specific and implementable.`;

  const d = dashboardData;
  const inactiveRatio = d.users?.total > 0
    ? Math.round((d.users?.inactive / d.users?.total) * 100) : 0;
  const unenrolledRatio = d.users?.total > 0
    ? Math.round((d.users?.withNoEnrollments / d.users?.total) * 100) : 0;

  const userMsg = `Platform engagement data:
- ${inactiveRatio}% of users are inactive (${d.users?.inactive}/${d.users?.total})
- ${unenrolledRatio}% of users have never enrolled in a course
- Average progress: ${d.engagement?.averageProgress}%
- ${d.courses?.withNoEnrollments} courses have zero enrollments
- Active enrollments: ${d.enrollments?.active} of ${d.enrollments?.total} total
- Avg learning time per active user: ${d.engagement?.averageLearningTimePerUser} minutes
Return JSON risk analysis.`;

  const raw = await callAI(system, [{ role: 'user', content: userMsg }], 600);
  return extractJSON(raw);
};

// ── 7. User: General learning assistant (dashboard chat) ────────────────────

exports.generalChat = async (question, history = [], dashboardContext = null) => {
  const contextLine = dashboardContext
    ? `The user's current stats: ${dashboardContext.enrolledCoursesCount} courses enrolled, ` +
      `${dashboardContext.completedCoursesCount} completed, ${dashboardContext.overallProgress}% overall progress.`
    : '';

  const system = `You are a friendly and knowledgeable AI learning assistant on an online education platform.
${contextLine}
Help the user with study strategies, course questions, motivation, learning tips, or anything related to their education.
Keep responses concise and encouraging. Use markdown for lists and emphasis where helpful.
Do not answer questions completely unrelated to learning or education.`;

  const messages = [
    ...history.map(h => ({ role: h.role, content: h.content })),
    { role: 'user', content: question },
  ];

  return callAI(system, messages, 600);
};

// ── 8. Admin: Course description generator ──────────────────────────────────

exports.generateCourseDescription = async (courseTitle) => {
  const system = `You are a course content writer for an online learning platform.
Write a compelling, professional course description in 2-3 sentences.
Highlight what students will learn and why the course is valuable.
Write in second person ("You will..."). Plain text only, no markdown.`;

  const userMsg = `Write a course description for: "${courseTitle}"`;

  return callAI(system, [{ role: 'user', content: userMsg }], 200);
};

// ── 9. Admin: Admin-aware chat ───────────────────────────────────────────────

exports.adminChat = async (question, history = [], dashboardContext = null) => {
  const ctx = dashboardContext
    ? `Current platform snapshot — Users: ${dashboardContext.users?.total} total (${dashboardContext.users?.active} active, ${dashboardContext.users?.inactive} inactive), ` +
      `Courses: ${dashboardContext.courses?.total}, Enrollments: ${dashboardContext.enrollments?.total} (${dashboardContext.enrollments?.active} active), ` +
      `Avg progress: ${dashboardContext.engagement?.averageProgress}%, ` +
      `Total learning time: ${dashboardContext.engagement?.totalLearningTime} minutes.`
    : '';

  const system = `You are an intelligent AI assistant for platform administrators of an online learning management system.
${ctx}
Help the admin with platform strategy, user engagement, course management, data interpretation, and operational decisions.
You can discuss metrics, suggest actions, explain trends, and help draft communications.
Keep responses concise, data-driven, and actionable. Use markdown for structure where helpful.
Do not answer questions unrelated to platform management, education, or administration.`;

  const messages = [
    ...history.map(h => ({ role: h.role, content: h.content })),
    { role: 'user', content: question },
  ];

  return callAI(system, messages, 700);
};

// ── 10. Admin: Content gap analysis ─────────────────────────────────────────

exports.getContentGapAnalysis = async (dashboardData) => {
  const system = `You are a curriculum strategist for an online learning platform.
Analyze the platform's course and enrollment data to identify content gaps and growth opportunities.
Return ONLY valid JSON — no markdown, no extra text.
Schema: {
  "gaps": [ { "topic": "...", "rationale": "...", "priority": "high" | "medium" | "low" } ],
  "insight": "1-2 sentence overall assessment"
}
Suggest 3-5 specific course topics that are likely missing or under-served. Base priorities on enrollment patterns and user numbers.`;

  const d = dashboardData;
  const courseList = (d.top5Courses || []).map(c => c.title).join(', ') || 'No course data';

  const userMsg = `Platform data:
- Total courses: ${d.courses?.total}, Avg modules per course: ${d.courses?.averageModulesPerCourse}
- Courses with 0 enrollments: ${d.courses?.withNoEnrollments}
- Total users: ${d.users?.total}, Users not enrolled in any course: ${d.users?.withNoEnrollments}
- Most popular courses: ${courseList}
- Most popular course: ${d.mostPopularCourse?.title ?? 'N/A'} (${d.mostPopularCourse?.enrollmentCount ?? 0} enrollments)
- Avg progress: ${d.engagement?.averageProgress}%
Identify content gaps and suggest new course topics.`;

  const raw = await callAI(system, [{ role: 'user', content: userMsg }], 600);
  return extractJSON(raw);
};
