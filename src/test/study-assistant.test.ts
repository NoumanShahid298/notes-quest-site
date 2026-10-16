import { describe, expect, it } from 'vitest';
import { answerQuestion } from '@/lib/study-assistant';
describe('Study assistant', () => {
  it('lists all six subjects', () => { expect(answerQuestion('Explore Subjects').links).toHaveLength(6); });
  it('answers from notes', () => { expect(answerQuestion('What is overfitting?').links[0]?.noteId).toBe('machine-learning'); });
  it('finds a subject’s notes', () => { expect(answerQuestion('physics').links.some(l => l.noteId === 'newtons-laws')).toBe(true); });
  it('admits missing information', () => { expect(answerQuestion('photosynthesis in plants').text).toMatch(/couldn’t find/); });
});
