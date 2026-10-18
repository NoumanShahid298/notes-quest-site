import { createFileRoute } from '@tanstack/react-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { ShieldAlert, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useStudentAuth } from '@/components/study/auth-provider';
import { StarRating } from '@/components/study/star-rating';

export const Route = createFileRoute('/_authenticated/admin')({
  head: () => ({ meta: [{ title: 'Admin Feedback Dashboard | StudyNotes Hub' }, { name: 'description', content: 'Private dashboard for StudyNotes Hub administrators.' }, { property: 'og:title', content: 'Admin Feedback Dashboard | StudyNotes Hub' }, { property: 'og:description', content: 'Private dashboard for StudyNotes Hub administrators.' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary' }, { name: 'robots', content: 'noindex' }] }),
  component: AdminPage,
});

const fmt = (d: string) => new Date(d).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });

function AdminPage() {
  const { user } = useStudentAuth();
  const qc = useQueryClient();
  const [tab, setTab] = useState<'student' | 'teacher'>('student');
  const role = useQuery({ queryKey: ['is-admin', user?.id], enabled: !!user, queryFn: async () => { if (!user) return false; const { data, error } = await supabase.rpc('has_role', { _user_id: user.id, _role: 'admin' }); if (error) throw error; return !!data; } });
  const students = useQuery({ queryKey: ['student-feedback'], enabled: role.data === true, queryFn: async () => { const { data, error } = await supabase.from('student_feedback').select('*').order('created_at', { ascending: false }); if (error) throw error; return data; } });
  const teachers = useQuery({ queryKey: ['teacher-feedback'], enabled: role.data === true, queryFn: async () => { const { data, error } = await supabase.from('teacher_feedback').select('*').order('created_at', { ascending: false }); if (error) throw error; return data; } });
  const remove = useMutation({
    mutationFn: async ({ table, id }: { table: 'student_feedback' | 'teacher_feedback'; id: string }) => { const { error } = await supabase.from(table).delete().eq('id', id); if (error) throw error; },
    onSuccess: () => { void qc.invalidateQueries({ queryKey: ['student-feedback'] }); void qc.invalidateQueries({ queryKey: ['teacher-feedback'] }); },
  });
  const del = (table: 'student_feedback' | 'teacher_feedback', id: string) => { if (window.confirm('Delete this feedback permanently?')) remove.mutate({ table, id }); };

  if (role.isLoading || !user) return <section className="section"><div className="site-container text-sm text-muted-foreground">Checking access…</div></section>;
  if (role.error) return <section className="section"><div className="site-container"><p role="alert" className="text-sm text-destructive">Could not check administrator access. Please try again.</p><Button variant="outline" className="mt-4" onClick={() => void role.refetch()}>Try again</Button></div></section>;
  if (!role.data) return <section className="section"><div className="site-container max-w-xl"><ShieldAlert size={34} className="mb-4 text-primary" /><h1 className="text-2xl font-bold">Administrators only</h1><p className="mt-3 text-sm leading-7 text-muted-foreground">Your account does not have administrator access, so feedback cannot be shown here.</p></div></section>;

  const avg = (rows?: { rating: number }[]) => rows?.length ? (rows.reduce((s, r) => s + r.rating, 0) / rows.length).toFixed(1) : '–';
  return <>
    <section className="page-intro"><div className="site-container"><span className="eyebrow">Administrator</span><h1>Feedback dashboard</h1><p className="text-muted-foreground">Private submissions from students and teachers.</p></div></section>
    <section className="section"><div className="site-container">
      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <div className="feedback-card"><p className="text-xs text-muted-foreground">Student feedback</p><p className="text-2xl font-bold">{students.data?.length ?? '–'} <span className="text-sm font-medium text-muted-foreground">· avg {avg(students.data)} ★</span></p></div>
        <div className="feedback-card"><p className="text-xs text-muted-foreground">Teacher feedback</p><p className="text-2xl font-bold">{teachers.data?.length ?? '–'} <span className="text-sm font-medium text-muted-foreground">· avg {avg(teachers.data)} ★</span></p></div>
      </div>
      <div role="tablist" aria-label="Feedback type" className="feedback-tabs">
        <Button variant="ghost" role="tab" type="button" aria-selected={tab === 'student'} onClick={() => setTab('student')}>Student feedback</Button>
        <Button variant="ghost" role="tab" type="button" aria-selected={tab === 'teacher'} onClick={() => setTab('teacher')}>Teacher feedback</Button>
      </div>
      {remove.error && <p role="alert" className="mb-4 text-sm text-destructive">Could not delete that item. Please try again.</p>}
      {tab === 'student' ? (
        students.error ? <p role="alert" className="text-sm text-destructive">Could not load student feedback.</p> :
        !students.data?.length ? <p className="text-sm text-muted-foreground">{students.isLoading ? 'Loading…' : 'No student feedback yet.'}</p> :
        <div className="grid gap-4">{students.data.map(f => <article key={f.id} className="feedback-card">
          <div className="flex flex-wrap items-center justify-between gap-3"><div className="flex flex-wrap items-center gap-3"><StarRating id={f.id} value={f.rating} /><span className="note-label tone-blue">{f.category}</span></div><span className="text-xs text-muted-foreground">{fmt(f.created_at)}</span></div>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-7">{f.comments}</p>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground"><span>{f.name || 'Anonymous'}{f.email ? ` · ${f.email}` : ''}</span><Button variant="ghost" size="sm" onClick={() => del('student_feedback', f.id)} aria-label="Delete student feedback"><Trash2 />Delete</Button></div>
        </article>)}</div>
      ) : (
        teachers.error ? <p role="alert" className="text-sm text-destructive">Could not load teacher feedback.</p> :
        !teachers.data?.length ? <p className="text-sm text-muted-foreground">{teachers.isLoading ? 'Loading…' : 'No teacher feedback yet.'}</p> :
        <div className="grid gap-4">{teachers.data.map(f => <article key={f.id} className="feedback-card">
          <div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="font-bold">{f.assignment_title}</h3><p className="text-xs text-muted-foreground">Teacher: {f.teacher_name}</p></div><span className="text-xs text-muted-foreground">{fmt(f.created_at)}</span></div>
          <div className="mt-2"><StarRating id={f.id} value={f.rating} /></div>
          <div className="mt-3 grid gap-3 text-sm leading-7 md:grid-cols-2"><div><p className="text-xs font-semibold text-primary">Strengths</p><p className="whitespace-pre-wrap">{f.strengths}</p></div><div><p className="text-xs font-semibold text-primary">Improvement suggestions</p><p className="whitespace-pre-wrap">{f.improvements}</p></div></div>
          {f.private_comments && <div className="mt-3 rounded-md bg-muted p-3 text-sm"><p className="text-xs font-semibold text-muted-foreground">Private comments</p><p className="whitespace-pre-wrap">{f.private_comments}</p></div>}
          <div className="mt-3 flex justify-end"><Button variant="ghost" size="sm" onClick={() => del('teacher_feedback', f.id)} aria-label="Delete teacher feedback"><Trash2 />Delete</Button></div>
        </article>)}</div>
      )}
    </div></section>
  </>;
}
