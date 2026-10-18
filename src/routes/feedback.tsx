import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { MessageSquareHeart } from 'lucide-react';
import { pageHead } from '@/lib/study-data';
import { Button } from '@/components/ui/button';
import { StudentForm, TeacherForm } from '@/components/study/feedback-forms';

export const Route = createFileRoute('/feedback')({
  head: () => pageHead('Feedback', 'Rate StudyNotes Hub and share student or teacher feedback to help us improve our notes and tools.'),
  component: FeedbackPage,
});

function FeedbackPage() {
  const [tab, setTab] = useState<'student' | 'teacher'>('student');
  return <>
    <section className="page-intro"><div className="site-container"><span className="eyebrow">Help us improve</span><h1>Share your feedback.</h1><p className="text-muted-foreground">Students and teachers can tell us what works and what could be better.</p></div></section>
    <section className="section"><div className="site-container grid gap-10 md:grid-cols-[1fr_1.6fr]">
      <div><MessageSquareHeart size={32} className="mb-5 text-primary" /><h2 className="text-2xl font-bold">Every opinion counts.</h2><p className="mt-4 max-w-sm text-sm leading-7 text-muted-foreground">Feedback is saved securely. Names, emails, and comments are never shown publicly — only site administrators can read them.</p></div>
      <div>
        <div role="tablist" aria-label="Feedback type" className="feedback-tabs">
          <Button variant="ghost" role="tab" type="button" aria-selected={tab === 'student'} onClick={() => setTab('student')}>Student Feedback</Button>
          <Button variant="ghost" role="tab" type="button" aria-selected={tab === 'teacher'} onClick={() => setTab('teacher')}>Teacher Feedback</Button>
        </div>
        <div role="tabpanel">{tab === 'student' ? <StudentForm /> : <TeacherForm />}</div>
      </div>
    </div></section>
  </>;
}
