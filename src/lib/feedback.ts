import { z } from 'zod';

export const feedbackCategories = ['Website Design', 'Study Notes', 'Chatbot', 'Ease of Use', 'Suggestions'] as const;

const optional = (max: number) => z.string().trim().max(max).transform(v => (v === '' ? null : v));

export const studentFeedbackSchema = z.object({
  rating: z.number().int().min(1, 'Please choose a rating from 1 to 5 stars.').max(5),
  category: z.enum(feedbackCategories, { message: 'Please choose a category.' }),
  name: optional(100),
  email: z.string().trim().max(255).refine(v => v === '' || z.string().email().safeParse(v).success, 'Please enter a valid email address or leave it empty.').transform(v => (v === '' ? null : v)),
  comments: z.string().trim().min(5, 'Please write at least 5 characters.').max(2000, 'Please keep comments under 2000 characters.'),
});

export const teacherFeedbackSchema = z.object({
  teacher_name: z.string().trim().min(2, 'Please enter the teacher’s name.').max(100),
  assignment_title: z.string().trim().min(2, 'Please enter the assignment or project title.').max(200),
  rating: z.number().int().min(1, 'Please choose a rating from 1 to 5 stars.').max(5),
  strengths: z.string().trim().min(5, 'Please describe at least one strength (5+ characters).').max(2000),
  improvements: z.string().trim().min(5, 'Please add an improvement suggestion (5+ characters).').max(2000),
  private_comments: optional(2000),
});

export function issuesToErrors(issues: { path: PropertyKey[]; message: string }[]) {
  const out: Record<string, string> = {};
  for (const i of issues) { const k = String(i.path[0]); if (!out[k]) out[k] = i.message; }
  return out;
}
