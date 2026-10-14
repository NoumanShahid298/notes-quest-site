import { Link } from '@tanstack/react-router';
import { BookOpen, Menu, X, LogOut } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useStudentAuth } from '@/components/study/auth-provider';

const links = [{ to: '/', label: 'Home' }, { to: '/subjects', label: 'Subjects' }, { to: '/notes', label: 'Notes' }, { to: '/about', label: 'About Us' }, { to: '/contact', label: 'Contact' }] as const;
export function Brand() { return <Link to="/" className="brand"><span className="brand-mark"><BookOpen size={23} strokeWidth={1.8} /></span><span>StudyNotes <span className="text-primary">Hub</span></span></Link>; }
export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { user, loading, signOut } = useStudentAuth();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  async function logout() { setBusy(true); setError(''); try { await signOut(); } catch { setError('Could not log out. Please try again.'); } finally { setBusy(false); } }
  return <header className="site-header relative z-20"><div className="site-container flex h-full items-center justify-between gap-3"><Brand /><nav aria-label="Main navigation" className="hidden items-center gap-6 lg:flex">{links.map(l => <Link key={l.to} to={l.to} activeOptions={{ exact: l.to === '/' }} className="nav-link">{l.label}</Link>)}</nav><div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2">{user ? <><span className="hidden max-w-36 truncate text-xs text-muted-foreground xl:block">{user.email}</span><Button variant="outline" size="sm" disabled={busy} onClick={logout}><LogOut />Log out</Button></> : <><Button asChild variant="ghost" size="sm" disabled={loading}><Link to="/auth" search={{ mode: 'login' }}>Log in</Link></Button><Button asChild size="sm" disabled={loading}><Link to="/auth" search={{ mode: 'signup' }}>Sign up</Link></Button></>}<Button variant="ghost" size="icon" className="lg:hidden" aria-label={open ? 'Close navigation' : 'Open navigation'} aria-expanded={open} onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</Button></div></div>{error && <p role="alert" className="absolute right-4 top-full bg-background p-3 text-sm text-destructive">{error}</p>}{open && <nav aria-label="Mobile navigation" className="absolute left-0 right-0 top-full border-b border-border bg-background p-5 shadow-sm lg:hidden">{links.map(l => <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="block py-3 text-sm font-medium" activeProps={{ className: 'text-primary' }}>{l.label}</Link>)}</nav>}</header>;
}
export function SiteFooter() { return <footer className="footer"><div className="site-container"><div className="flex flex-col justify-between gap-7 sm:flex-row"><div><Brand /><p className="mt-4 max-w-xs leading-6">Better notes. Deeper understanding.<br />One place for your learning journey.</p></div><div className="flex flex-wrap items-start gap-x-8 gap-y-4 pt-2">{links.slice(1).map(l => <Link key={l.to} to={l.to}>{l.label}</Link>)}</div></div><div className="mt-8 flex flex-col justify-between gap-3 border-t border-current/15 pt-5 sm:flex-row"><p>© {new Date().getFullYear()} StudyNotes Hub. All rights reserved.</p><p>Made for curious minds. <span className="ml-1">Keep learning.</span></p></div></div></footer>; }
