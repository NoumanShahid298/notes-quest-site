import { createFileRoute, Link } from '@tanstack/react-router';
import { useEffect, useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { pageHead } from '@/lib/study-data';
export const Route = createFileRoute('/reset-password')({ head: () => pageHead('Reset Password', 'Choose a new password for your StudyNotes Hub account.'), component: ResetPassword });
function ResetPassword() {
  const [valid, setValid] = useState(false);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  useEffect(() => {
    const recovery = new URLSearchParams(window.location.hash.slice(1)).get('type') === 'recovery';
    if (recovery) void supabase.auth.getUser().then(({ data }) => setValid(Boolean(data.user)));
  }, []);
  async function submit(e: FormEvent) {
    e.preventDefault(); setError('');
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) setError(error.message); else setDone(true);
  }
  return <section className="section"><div className="site-container"><div className="mx-auto max-w-md py-6"><h1 className="text-3xl font-bold">Set a new password</h1>{done ? <><p role="status" className="my-6 text-primary">Your password has been updated.</p><Button asChild><Link to="/">Continue learning</Link></Button></> : valid ? <form onSubmit={submit} className="mt-7 space-y-5"><label className="form-field">New password<input type="password" autoComplete="new-password" minLength={8} maxLength={128} required value={password} onChange={e => setPassword(e.target.value)} /></label><label className="form-field">Confirm password<input type="password" autoComplete="new-password" required value={confirm} onChange={e => setConfirm(e.target.value)} /></label>{error && <p role="alert" className="text-sm text-destructive">{error}</p>}<Button type="submit" disabled={busy}>{busy ? 'Updating…' : 'Update password'}</Button></form> : <><p className="my-6 text-sm text-muted-foreground">Open the password reset link from your email to continue.</p><Button asChild variant="outline"><Link to="/auth" search={{ mode: 'forgot' }}>Request a new link</Link></Button></>}</div></div></section>;
}