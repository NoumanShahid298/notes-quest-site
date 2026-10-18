import { describe, expect, it } from 'vitest';
import { feedbackCategories, studentFeedbackSchema, teacherFeedbackSchema } from '@/lib/feedback';
import { shouldPromptReview } from '@/lib/review-session';

const student = { rating: 5, category: 'Study Notes', name: '', email: '', comments: 'Useful notes for revision.' };
const teacher = { teacher_name: 'Test teacher', assignment_title: 'Test assignment', rating: 4, strengths: 'Clear explanations', improvements: 'Add more examples', private_comments: '' };
describe('feedback requirements', () => {
  it('accepts only whole ratings from 1 to 5', () => {
    for (const rating of [1, 2, 3, 4, 5]) expect(studentFeedbackSchema.safeParse({ ...student, rating }).success).toBe(true);
    for (const rating of [0, 6, 2.5]) expect(studentFeedbackSchema.safeParse({ ...student, rating }).success).toBe(false);
  });
  it('accepts the five requested categories only', () => {
    expect(feedbackCategories).toEqual(['Website Design', 'Study Notes', 'Chatbot', 'Ease of Use', 'Suggestions']);
    for (const category of feedbackCategories) expect(studentFeedbackSchema.safeParse({ ...student, category }).success).toBe(true);
    expect(studentFeedbackSchema.safeParse({ ...student, category: 'Other' }).success).toBe(false);
  });
  it('allows omitted personal details but validates provided email', () => {
    expect(studentFeedbackSchema.parse(student)).toMatchObject({ name: null, email: null });
    expect(studentFeedbackSchema.safeParse({ ...student, email: 'invalid' }).success).toBe(false);
  });
  it('requires written student comments', () => {
    expect(studentFeedbackSchema.safeParse({ ...student, comments: '' }).success).toBe(false);
  });
  it('requires teacher name, assignment, strengths and improvements', () => {
    expect(teacherFeedbackSchema.safeParse(teacher).success).toBe(true);
    for (const field of ['teacher_name', 'assignment_title', 'strengths', 'improvements']) expect(teacherFeedbackSchema.safeParse({ ...teacher, [field]: '' }).success).toBe(false);
  });
  it('never automatically prompts again after dismissal or submission', () => {
    expect(shouldPromptReview(true, 999999, false, 1)).toBe(false);
    expect(shouldPromptReview(true, 999999, true, 1)).toBe(false);
  });
  it('waits for engagement before desktop exit or mobile invitation', () => {
    expect(shouldPromptReview(false, 19999, false, 0)).toBe(false);
    expect(shouldPromptReview(false, 20000, false, 0)).toBe(true);
    expect(shouldPromptReview(false, 45000, true, 0.59)).toBe(false);
    expect(shouldPromptReview(false, 44999, true, 1)).toBe(false);
    expect(shouldPromptReview(false, 45000, true, 0.6)).toBe(true);
  });
});