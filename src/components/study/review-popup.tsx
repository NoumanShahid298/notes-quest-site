import { useEffect, useRef, useState } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { MessageSquareHeart, Star, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogDescription, DialogPortal, DialogTitle } from '@/components/ui/dialog';
import { StudentForm } from '@/components/study/feedback-forms';
import { reviewOpenEvent, reviewSessionKey, reviewSubmittedEvent, shouldPromptReview } from '@/lib/review-session';

export function ReviewPopup() {
  const [open, setOpen] = useState(false);
  const [nudge, setNudge] = useState(false);
  const [automatic, setAutomatic] = useState(false);
  const suppressed = useRef(false);
  const started = useRef(0);

  function suppress() {
    suppressed.current = true;
    setNudge(false);
    try { sessionStorage.setItem(reviewSessionKey, 'dismissed'); } catch { /* In-memory fallback when storage is unavailable. */ }
  }
  function changeOpen(value: boolean) {
    setOpen(value);
    if (!value) suppress();
  }

  useEffect(() => {
    started.current = Date.now();
    try { suppressed.current = sessionStorage.getItem(reviewSessionKey) !== null; } catch { /* Keep the in-memory session state. */ }
    const mobile = () => !window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const ready = () => {
      const height = document.documentElement.scrollHeight - window.innerHeight;
      return shouldPromptReview(suppressed.current, Date.now() - started.current, mobile(), height > 0 ? window.scrollY / height : 0);
    };
    const exit = (event: MouseEvent) => {
      if (event.relatedTarget !== null || event.clientY > 8 || mobile() || !ready()) return;
      // Do not interrupt another open form or the chatbot.
      if (document.querySelector('[role="dialog"], .assistant-panel') || /INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName ?? '')) return;
      suppress(); setAutomatic(true); setOpen(true);
    };
    const checkMobile = () => {
      if (mobile() && ready() && !document.querySelector('[role="dialog"], .assistant-panel')) {
        suppress(); setNudge(true);
      }
    };
    const manual = () => { suppress(); setAutomatic(false); setOpen(true); };
    const submitted = () => suppress();
    document.addEventListener('mouseout', exit);
    window.addEventListener('scroll', checkMobile, { passive: true });
    window.addEventListener(reviewOpenEvent, manual);
    window.addEventListener(reviewSubmittedEvent, submitted);
    const timer = window.setInterval(checkMobile, 5000);
    return () => {
      document.removeEventListener('mouseout', exit);
      window.removeEventListener('scroll', checkMobile);
      window.removeEventListener(reviewOpenEvent, manual);
      window.removeEventListener(reviewSubmittedEvent, submitted);
      window.clearInterval(timer);
    };
  }, []);

  return <>
    {nudge && <aside className="review-nudge" aria-label="Feedback invitation">
      <Button variant="ghost" size="sm" onClick={() => { setNudge(false); setAutomatic(true); setOpen(true); }}><Star />Share feedback</Button>
      <Button variant="ghost" size="icon" aria-label="Dismiss feedback invitation" onClick={suppress}><X /></Button>
    </aside>}
    <Dialog modal={false} open={open} onOpenChange={changeOpen}>
      <DialogPortal>
        <DialogPrimitive.Content className="review-popup" onOpenAutoFocus={e => { if (automatic) e.preventDefault(); }} onInteractOutside={e => e.preventDefault()}>
          <div className="review-popup-header">
            <MessageSquareHeart className="text-primary" size={26} aria-hidden="true" />
            <DialogTitle className="text-xl font-bold">{automatic ? 'Before You Go!' : 'Review & Feedback'}</DialogTitle>
            <Button variant="ghost" size="icon" className="ml-auto shrink-0" aria-label="Close review popup" onClick={() => changeOpen(false)}><X /></Button>
          </div>
          <DialogDescription className="mb-5 leading-6">Please take a moment to share your experience and help us improve StudyNotes Hub.</DialogDescription>
          <StudentForm embedded onSubmitted={suppress} />
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3">
            <a href="/feedback" className="text-sm font-medium text-primary" onClick={() => changeOpen(false)}>Teacher feedback</a>
            <Button variant="ghost" size="sm" onClick={() => changeOpen(false)}>Maybe Later</Button>
          </div>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  </>;
}