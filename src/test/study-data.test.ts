import { describe, expect, it } from 'vitest';
import { filterNotes, notes, subjects } from '@/lib/study-data';

describe('Study notes filtering', () => {
  it('includes a reading resource for every subject', () => {
    for (const subject of subjects) {
      expect(notes.some(note => note.subject === subject.id)).toBe(true);
    }
  });
  it('searches titles without case or surrounding whitespace sensitivity', () => {
    expect(filterNotes('  CALCULUS ')).toHaveLength(1);
  });
  it('searches subject names', () => {
    expect(filterNotes('Physics')[0]?.id).toBe('newtons-laws');
  });
  it('combines category and search filters', () => {
    expect(filterNotes('calculus', 'physics')).toEqual([]);
    expect(filterNotes('', 'computer-science')).toHaveLength(1);
  });
  it('returns all notes for an empty search', () => {
    expect(filterNotes('')).toHaveLength(6);
  });
});