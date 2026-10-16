import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useEffect, useState, type FormEvent } from 'react';
import { BookOpen, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable';
import { useStudentAuth } from '@/components/study/auth-provider';
import { pageHead } from '@/lib/study-data';

export const Route = createFileRoute('/auth')({
  validateSearch: (search: Record<string, unknown>): { mode: 'login' | 'signup' | 'forgot' } => { const mode = search['mode']; return { mode: mode === 'signup' || mode === 'forgot' ? mode : 'login' }; },
  head: () => pageHead('Student Account', 'Log in or create your StudyNotes Hub student account.'),
  component: AuthPage,
});
function AuthPage() {
  const { mode } = Route.useSearch();
  const { user } = useStudentAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  useEffect(() => { setError(''); setMessage(''); setPassword(''); }, [mode]);
  useEffect(() => { if (user) void navigate({ to: '/', replace: true }); }, [user, navigate]);
  async function submit(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError(''); setMessage('');
    try {
      if (mode === 'forgot') {
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: `${window.location.origin}/reset-password` });
        if (error) throw error;
        setMessage('If an account exists for this email, you’ll receive a password reset link.');
      } else if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({ email: email.trim(), password, options: { emailRedirectTo: window.location.origin } });
        if (error) throw error;
        if (!data.session) setMessage('Check your email to confirm your account before logging in.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw error;
        await navigate({ to: '/', replace: true });
      }
    } catch (err) { setError(err instanceof Error ? err.message : 'Unable to continue. Please try again.'); }
    finally { setBusy(false); }
  }
  async function google() {
    setBusy(true); setError('');
    try {
      const result = await lovable.auth.signInWithOAuth('google', { redirect_uri: window.location.origin });
      if (result.error) throw result.error;
      if (!result.redirected) await navigate({ to: '/', replace: true });
    } catch (err) { setError(err instanceof Error ? err.message : 'Google login failed. Please try again.'); }
    finally { setBusy(false); }
  }
  const title = mode === 'signup' ? 'Create your account' : mode === 'forgot' ? 'Reset your password' : 'Welcome back';
  return <section className="section bg-muted"><div className="site-container"><div className="mx-auto max-w-md py-6"><BookOpen className="mb-5 text-primary" size={36} /><h1 className="text-3xl font-bold">{title}</h1><p className="mt-3 text-sm text-muted-foreground">{mode === 'signup' ? 'Join StudyNotes Hub.' : mode === 'forgot' ? 'Enter the email address for your account.' : 'Log in to StudyNotes Hub.'}</p>
    {mode !== 'forgot' && <><Button variant="outline" className="mt-7 w-full" onClick={google} disabled={busy}>Continue with Google</Button><div className="my-5 flex items-center gap-4 text-xs text-muted-foreground"><span className="h-px flex-1 bg-border" />or use email<span className="h-px flex-1 bg-border" /></div></>}
    <form onSubmit={submit} className="mt-6 space-y-5"><label className="form-field">Email<input type="email" autoComplete="email" required maxLength={254} value={email} onChange={e => setEmail(e.target.value)} /></label>
      {mode !== 'forgot' && <label className="form-field">Password<div className="relative"><input className="pr-12!" type={show ? 'text' : 'password'} autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} required minLength={mode === 'signup' ? 8 : 1} maxLength={128} value={password} onChange={e => setPassword(e.target.value)} /><Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1" aria-label={show ? 'Hide password' : 'Show password'} title={show ? 'Hide password' : 'Show password'} onClick={() => setShow(!show)}>{show ? <EyeOff /> : <Eye />}</Button></div>{mode === 'signup' && <span className="text-xs font-normal text-muted-foreground">At least 8 characters.</span>}</label>}
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}{message && <p role="status" className="text-sm text-primary">{message}</p>}
      <Button type="submit" className="h-11 w-full" disabled={busy}>{busy && <Loader2 className="animate-spin" />}{mode === 'signup' ? 'Sign up' : mode === 'forgot' ? 'Send reset link' : 'Log in'}</Button>
    </form>
    {mode === 'login' && <Button asChild variant="link" className="mt-3 px-0"><Link to="/auth" search={{ mode: 'forgot' }}>Forgot password?</Link></Button>}
    <p className="mt-5 text-sm text-muted-foreground">{mode === 'signup' ? 'Already have an account? ' : mode === 'forgot' ? '' : 'New to StudyNotes Hub? '}<Link to="/auth" search={{ mode: mode === 'login' ? 'signup' : 'login' }} className="font-semibold text-primary">{mode === 'login' ? 'Sign up' : 'Log in'}</Link></p>
  </div></div></section>;
}