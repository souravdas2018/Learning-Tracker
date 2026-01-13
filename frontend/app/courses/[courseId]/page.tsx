const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5500';

export async function generateStaticParams() {
  try {
    const res = await fetch(`${API_BASE}/courses`);
    if (!res.ok) return [];
    const data = await res.json();
    const courses = data?.data || data || [];
    if (!Array.isArray(courses)) return [];
    return courses.map((c: any) => ({ courseId: String(c.id) }));
  } catch (e) {
    return [];
  }
}

export default function CoursePage() {
  return null;
}
