import { Link } from '@tanstack/react-router';
import { useState, type ReactNode } from 'react';
import { CheckCircle2, GraduationCap, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useStudentAuth } from '@/components/study/auth-provider';
import { StarRating } from '@/components/study/star-rating';
import { feedbackCategories, issuesToErrors, studentFeedbackSchema, teacherFeedbackSchema } from '@/lib/feedback';
import { reviewSubmittedEvent } from '@/lib/review-session';

function friendly(message: string) {
  return message.includes('Too many') ? message : 'Something went wrong while saving your feedback. Please try again.';
}

function Field({ id, label, error, children, hint }: { id: string; label: string; error?: string | undefined; children: ReactNode; hint?: string | undefined }) {
  return <div className="form-field"><label htmlFor={id}>{label}{hint && <span className="ml-1 font-normal text-muted-foreground">{hint}</span>}</label>{children}{error && <span id={`${id}-error`} role="alert" className="text-xs font-normal text-destructive">{error}</span>}</div>;
}

function Success({ title, text, onReset }: { title: string; text: string; onReset: () => void }) {
  return <div role="status" className="feedback-card flex flex-col items-start"><CheckCircle2 size={36} className="mb-4 text-primary" /><h2 className="text-xl font-bold">{title}</h2><p className="mt-3 text-sm leading-7 text-muted-foreground">{text}</p><Button variant="outline" className="mt-6" onClick={onReset}>Send more feedback</Button></div>;
}

export function StudentForm({ onSubmitted, embedded = false }: { onSubmitted?: () => void; embedded?: boolean }) {
  const empty = { rating: 0, category: '', name: '', email: '', comments: '', website: '' };
  const [v, setV] = useState(empty);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<'idle' | 'busy' | 'done'>('idle');
  const [formError, setFormError] = useState('');
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setFormError('');
    if (v.website) { setFormError('Unable to submit feedback. Please try again.'); return; } // spam trap
    const r = studentFeedbackSchema.safeParse(v);
    if (!r.success) { setErrors(issuesToErrors(r.error.issues)); return; }
    setErrors({}); setStatus('busy');
    try {
      const { error } = await supabase.from('student_feedback').insert(r.data);
      if (error) throw error;
      setStatus('done'); onSubmitted?.(); window.dispatchEvent(new Event(reviewSubmittedEvent));
    } catch (error) { setStatus('idle'); setFormError(friendly(error instanceof Error ? error.message : String((error as { message?: string })?.message ?? ''))); }
  }
  if (status === 'done') return <Success title="Thank you for your feedback!" text="Your feedback was saved. Only site administrators can read it." onReset={() => { setV(empty); setStatus('idle'); }} />;
  const ia = (k: string) => ({ 'aria-invalid': !!errors[k], 'aria-describedby': errors[k] ? `${k}-error` : undefined });
  return (
    <form noValidate onSubmit={submit} className={embedded ? "space-y-4" : "feedback-card space-y-5"} aria-label="Student feedback form">
      <Field id="rating" label="Your rating" error={errors['rating']}><StarRating id="rating" value={v.rating} onChange={n => setV({ ...v, rating: n })} error={errors['rating']} /></Field>
      <Field id="category" label="Category" error={errors['category']}>
        <select id="category" value={v.category} onChange={e => setV({ ...v, category: e.target.value })} {...ia('category')}><option value="">Choose a category</option>{feedbackCategories.map(c => <option key={c}>{c}</option>)}</select>
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="name" label="Name" hint="(optional)" error={errors['name']}><input id="name" maxLength={100} autoComplete="name" value={v.name} onChange={e => setV({ ...v, name: e.target.value })} {...ia('name')} /></Field>
        <Field id="email" label="Email" hint="(optional)" error={errors['email']}><input id="email" type="email" maxLength={255} autoComplete="email" value={v.email} onChange={e => setV({ ...v, email: e.target.value })} {...ia('email')} /></Field>
      </div>
      <Field id="comments" label="Comments" error={errors['comments']}><textarea id="comments" rows={5} maxLength={2000} value={v.comments} onChange={e => setV({ ...v, comments: e.target.value })} placeholder="What did you like? What could be better?" {...ia('comments')} /></Field>
      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" value={v.website} onChange={e => setV({ ...v, website: e.target.value })} />
      {formError && <p role="alert" className="text-sm text-destructive">{formError}</p>}
      <Button type="submit" className="h-11 px-7" disabled={status === 'busy'}>{status === 'busy' ? 'Submitting…' : 'Submit Feedback'} <Send size={16} /></Button>
    </form>
  );
}

export function TeacherForm() {
  const { user, loading } = useStudentAuth();
  const empty = { teacher_name: '', assignment_title: '', rating: 0, strengths: '', improvements: '', private_comments: '', website: '' };
  const [v, setV] = useState(empty);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<'idle' | 'busy' | 'done'>('idle');
  const [formError, setFormError] = useState('');
  if (loading) return <div className="feedback-card text-sm text-muted-foreground">Loading…</div>;
  if (!user) return <div className="feedback-card"><GraduationCap size={32} className="mb-4 text-primary" /><h2 className="text-xl font-bold">Teachers, please log in first</h2><p className="mt-3 text-sm leading-7 text-muted-foreground">Teacher feedback is private, so we ask teachers to sign in before submitting. It is only visible to site administrators.</p><div className="mt-6 flex gap-3"><Button asChild><Link to="/auth" search={{ mode: 'login' }}>Log in</Link></Button><Button asChild variant="outline"><Link to="/auth" search={{ mode: 'signup' }}>Sign up</Link></Button></div></div>;
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setFormError('');
    if (v.website) { setFormError('Unable to submit feedback. Please try again.'); return; }
    const r = teacherFeedbackSchema.safeParse(v);
    if (!r.success) { setErrors(issuesToErrors(r.error.issues)); return; }
    setErrors({}); setStatus('busy');
    if (!user) { setStatus('idle'); setFormError('Please log in before submitting teacher feedback.'); return; }
    try {
      const { error } = await supabase.from('teacher_feedback').insert({ ...r.data, submitted_by: user.id });
      if (error) throw error;
      setStatus('done'); window.dispatchEvent(new Event(reviewSubmittedEvent));
    } catch (error) { setStatus('idle'); setFormError(friendly(error instanceof Error ? error.message : String((error as { message?: string })?.message ?? ''))); }
  }
  if (status === 'done') return <Success title="Teacher feedback saved" text="Thank you. Your feedback was stored privately and is visible only to site administrators." onReset={() => { setV(empty); setStatus('idle'); }} />;
  const ia = (k: string) => ({ 'aria-invalid': !!errors[k], 'aria-describedby': errors[k] ? `${k}-error` : undefined });
  const text = (k: 'strengths' | 'improvements' | 'private_comments', label: string, hint?: string) => <Field id={k} label={label} hint={hint} error={errors[k]}><textarea id={k} rows={4} maxLength={2000} value={v[k]} onChange={e => setV({ ...v, [k]: e.target.value })} {...ia(k)} /></Field>;
  return (
    <form noValidate onSubmit={submit} className="feedback-card space-y-5" aria-label="Teacher feedback form">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="teacher_name" label="Teacher name" error={errors['teacher_name']}><input id="teacher_name" maxLength={100} value={v.teacher_name} onChange={e => setV({ ...v, teacher_name: e.target.value })} {...ia('teacher_name')} /></Field>
        <Field id="assignment_title" label="Assignment or project title" error={errors['assignment_title']}><input id="assignment_title" maxLength={200} value={v.assignment_title} onChange={e => setV({ ...v, assignment_title: e.target.value })} {...ia('assignment_title')} /></Field>
      </div>
      <Field id="t-rating" label="Rating" error={errors['rating']}><StarRating id="t-rating" value={v.rating} onChange={n => setV({ ...v, rating: n })} error={errors['rating']} /></Field>
      {text('strengths', 'Strengths')}
      {text('improvements', 'Improvement suggestions')}
      {text('private_comments', 'Private comments', '(optional, admins only)')}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" value={v.website} onChange={e => setV({ ...v, website: e.target.value })} />
      {formError && <p role="alert" className="text-sm text-destructive">{formError}</p>}
      <Button type="submit" className="h-11 px-7" disabled={status === 'busy'}>{status === 'busy' ? 'Submitting…' : 'Submit Teacher Feedback'} <Send size={16} /></Button>
    </form>
  );
}

