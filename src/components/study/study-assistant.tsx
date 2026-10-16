import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link } from '@tanstack/react-router';
import { GraduationCap, MessageCircle, Send, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { answerQuestion, quickReplies, type AssistantLink } from '@/lib/study-assistant';

type Msg = { id: number; role: 'bot' | 'user'; text: string; links?: AssistantLink[] };
const welcome = 'Hi! Welcome to StudyNotes Hub. I can help you find notes, explore subjects, and understand study topics. What would you like to learn today?';

export function StudyAssistant() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [msgs, setMsgs] = useState<Msg[]>([{ id: 0, role: 'bot', text: welcome }]);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { if (open) { endRef.current?.scrollIntoView({ block: 'end' }); inputRef.current?.focus(); } }, [msgs, open]);
  function ask(text: string) {
    const clean = text.trim().slice(0, 300);
    if (!clean) return;
    const reply = answerQuestion(clean);
    setMsgs(m => [...m, { id: m.length, role: 'user', text: clean }, { id: m.length + 1, role: 'bot', ...reply }]);
    setInput('');
  }
  const submit = (e: FormEvent) => { e.preventDefault(); ask(input); };
  const close = () => setOpen(false);
  return <>
    {open && <section className="assistant-panel fade-in" role="dialog" aria-label="StudyNotes AI Assistant">
      <header className="assistant-head"><span className="brand-mark"><GraduationCap size={20} /></span><div className="min-w-0 flex-1"><h2 className="text-sm font-bold">StudyNotes AI Assistant</h2><p className="text-xs opacity-80">Answers from our study notes</p></div><Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-foreground/15 hover:text-primary-foreground" aria-label="Close chat" onClick={close}><X /></Button></header>
      <div className="assistant-body" aria-live="polite">
        {msgs.map(m => <div key={m.id} className={`assistant-msg ${m.role}`}><p className="whitespace-pre-line">{m.text}</p>{m.links && m.links.length > 0 && <div className="mt-2 flex flex-wrap gap-1.5">{m.links.map(l => l.noteId ? <Link key={l.label} to="/notes/$noteId" params={{ noteId: l.noteId }} onClick={close} className="assistant-chip">{l.label}</Link> : <Link key={l.label} to="/notes" search={{ q: '', subject: l.subject ?? 'all' }} onClick={close} className="assistant-chip">{l.label}</Link>)}</div>}</div>)}
        <div ref={endRef} />
      </div>
      <div className="flex flex-wrap gap-1.5 border-t border-border px-3 pt-3">{quickReplies.map(q => <Button key={q} type="button" variant="secondary" size="sm" className="h-7 text-xs" onClick={() => ask(q)}>{q}</Button>)}</div>
      <form onSubmit={submit} className="flex gap-2 p-3"><input ref={inputRef} aria-label="Type your question" maxLength={300} value={input} onChange={e => setInput(e.target.value)} placeholder="Ask about a topic…" className="assistant-input" /><Button type="submit" size="icon" className="h-10 w-10 shrink-0" aria-label="Send message" disabled={!input.trim()}><Send /></Button></form>
    </section>}
    <Button className="assistant-fab" size="icon" aria-label={open ? 'Close StudyNotes AI Assistant' : 'Open StudyNotes AI Assistant'} aria-expanded={open} onClick={() => setOpen(!open)}>{open ? <X /> : <MessageCircle />}</Button>
  </>;
}
