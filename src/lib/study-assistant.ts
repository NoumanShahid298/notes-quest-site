import { notes, subjects, getSubject } from '@/lib/study-data';

export type AssistantLink = { label: string; noteId?: string; subject?: string };
export type AssistantReply = { text: string; links: AssistantLink[] };

const stop = new Set(['the', 'a', 'an', 'is', 'are', 'what', 'how', 'why', 'of', 'to', 'in', 'and', 'for', 'me', 'about', 'explain', 'tell', 'find', 'notes', 'note', 'please', 'can', 'you', 'i', 'my', 'on', 'do', 'does', 'with', 'want', 'learn', 'study', 'help']);
const words = (s: string) => s.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(w => w.length > 1 && !stop.has(w));
const noteLink = (n: (typeof notes)[number]): AssistantLink => ({ label: n.title, noteId: n.id });

export const quickReplies = ['Find Study Notes', 'Explore Subjects', 'Explain a Topic', 'Exam Preparation'] as const;

/** Answers only from the website's own notes; never invents content. */
export function answerQuestion(input: string): AssistantReply {
  const q = input.trim().toLowerCase();
  if (!q) return { text: 'Please type a question or choose an option below.', links: [] };
  if (q === 'find study notes') return { text: `We have ${notes.length} study notes. Here they are — tap one to read it, or type a topic to search.`, links: notes.map(noteLink) };
  if (q === 'explore subjects') return { text: `StudyNotes Hub covers ${subjects.length} subjects. Choose one to see its notes:`, links: subjects.map(s => ({ label: s.name, subject: s.id })) };
  if (q === 'explain a topic') return { text: 'Sure! Type a topic, for example "Big O", "derivative", "Newton’s second law", "overfitting", or "p-value", and I’ll explain it using our notes.', links: [] };
  if (q === 'exam preparation') return { text: 'Exam tips from our notes:\n• Calculus: a stationary point has f′(x) = 0, but check both sides to confirm a maximum or minimum.\n• Data Structures: always state whether a Big O bound is worst-case, average-case, or amortized.\n• Writing: revise for argument and organization first, then grammar.\nReview a note’s “check” sections and practise explaining each idea in your own words.', links: [noteLink(notes[1]!), noteLink(notes[0]!), noteLink(notes[2]!)] };
  if (/^(hi|hello|hey|salam|assalam)/.test(q)) return { text: 'Hello! Ask me about any topic in our notes, or pick an option below.', links: [] };

  const terms = words(q);
  const subject = subjects.find(s => q.includes(s.name.toLowerCase()) || (s.id === 'artificial-intelligence' && /\bai\b/.test(q)) || (s.id === 'computer-science' && /\bcs\b/.test(q)) || (s.id === 'mathematics' && /\bmaths?\b/.test(q)));
  const sections = notes.flatMap(n => n.sections.map(sec => {
    const hay = `${n.title} ${sec.title} ${sec.text}`.toLowerCase();
    const score = terms.reduce((t, w) => t + (hay.includes(w) ? (`${n.title} ${sec.title}`.toLowerCase().includes(w) ? 3 : 1) : 0), 0);
    return { n, sec, score };
  })).filter(x => x.score > 0).sort((a, b) => b.score - a.score);
  const best = sections[0];
  if (best && best.score >= 2 && (!subject || best.n.subject === subject.id)) {
    return { text: `From “${best.n.title}” — ${best.sec.title}:\n${best.sec.text}`, links: [noteLink(best.n), ...(sections[1] && sections[1].n.id !== best.n.id ? [noteLink(sections[1].n)] : [])] };
  }
  if (subject) {
    const list = notes.filter(n => n.subject === subject.id);
    return { text: `Here’s what we have for ${subject.name}:`, links: [...list.map(noteLink), { label: `All ${subject.name} notes`, subject: subject.id }] };
  }
  if (best) return { text: `I found a related section in “${best.n.title}” (${getSubject(best.n.subject)?.name}), but it may not fully answer your question:\n${best.sec.text}`, links: [noteLink(best.n)] };
  return { text: 'Sorry, I couldn’t find that in StudyNotes Hub’s notes, so I won’t guess. Try another topic, or browse the subjects below.', links: subjects.map(s => ({ label: s.name, subject: s.id })) };
}
