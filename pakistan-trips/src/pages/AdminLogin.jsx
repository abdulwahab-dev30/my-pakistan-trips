import React, { useState, useCallback, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { LockKeyhole, ShieldCheck, Fingerprint } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { supabase, supabaseConfigured } from "../lib/supabase";
import { isCmsAdmin } from "../lib/adminAuth";

export default function AdminLogin() {
  const [session, setSession] = useState(undefined);
  const [authorized, setAuthorized] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [passkeyBusy, setPasskeyBusy] = useState(false);
  const [error, setError] = useState("");
  const [alertWarning, setAlertWarning] = useState("");
  const location = useLocation();

  const verifySession = useCallback(async (nextSession) => {
    if (!nextSession) {
      setSession(null);
      setAuthorized(false);
      return false;
    }
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData?.user) throw new Error("Your session could not be verified.");
      const allowed = await isCmsAdmin(userData.user.id);
      if (!allowed) {
        await supabase.auth.signOut();
        setSession(null);
        setAuthorized(false);
        return false;
      }
      setSession(nextSession);
      setAuthorized(true);
      return true;
    } catch (err) {
      await supabase.auth.signOut();
      setSession(null);
      setAuthorized(false);
      setError(err?.message || "Could not verify admin access.");
      return false;
    }
  }, []);

  useEffect(() => {
    if (!supabaseConfigured) {
      setSession(null);
      return;
    }
    supabase.auth.getSession().then(({ data }) => verifySession(data.session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      // Defer network work until after the auth event callback has completed.
      Promise.resolve().then(() => verifySession(nextSession));
    });
    return () => subscription.unsubscribe();
  }, [verifySession]);

  async function sendAlert(payload, token) {
    const headers = { "Content-Type": "application/json" };
    if (token) headers.Authorization = "Bearer " + token;
    const response = await fetch("/api/admin-login", {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });
    const raw = await response.text();
    let result = {};
    try { result = JSON.parse(raw); } catch {}
    if (!response.ok || result.sent !== true) {
      throw new Error(result.error || ("HTTP " + response.status + (raw ? " — " + raw.slice(0, 180) : "")));
    }
  }

  async function submit(e) {
    e.preventDefault();
    setError("");
    setAlertWarning("");
    setBusy(true);
    try {
      if (!supabaseConfigured) throw new Error("Supabase is not configured. Check the Vercel environment variables.");
      const attemptedEmail = email.trim();
      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email: attemptedEmail,
        password,
      });
      if (loginError) {
        try {
          await sendAlert({ event: "failed", email: attemptedEmail });
        } catch (alertError) {
          console.error("Failed-login security alert did not send:", alertError);
          setAlertWarning("Security alert email failed: " + (alertError.message || "Unknown error"));
        }
        throw loginError;
      }

      const allowed = data.user?.id ? await isCmsAdmin(data.user.id) : false;
      if (!allowed) {
        await supabase.auth.signOut();
        throw new Error("This account is not an authorized My Pakistan Trips admin.");
      }
      setSession(data.session);
      setAuthorized(true);
      if (data.session) {
        try {
          await sendAlert({ event: "success", email: attemptedEmail }, data.session.access_token);
        } catch (alertError) {
          console.error("Successful-login security alert did not send:", alertError);
          setAlertWarning("Login succeeded, but security alert email failed: " + (alertError.message || "Unknown error"));
        }
      }
    } catch (err) {
      setError(err.message || "Unable to sign in.");
    } finally {
      setBusy(false);
    }
  }

  async function loginWithPasskey() {
    setError("");
    setAlertWarning("");
    setPasskeyBusy(true);
    try {
      if (!supabaseConfigured) throw new Error("Supabase is not configured. Check the Vercel environment variables.");
      if (!window.PublicKeyCredential) {
        throw new Error("This browser does not support passkeys. Please use password login.");
      }
      const { data, error: passkeyError } = await supabase.auth.signInWithPasskey();
      if (passkeyError) throw passkeyError;

      const user = data?.user;
      if (!user?.id) throw new Error("Passkey sign-in did not return a valid user.");
      const allowed = await isCmsAdmin(user.id);
      if (!allowed) {
        await supabase.auth.signOut();
        throw new Error("This passkey belongs to an account that is not an authorized CMS admin.");
      }

      setSession(data.session);
      setAuthorized(true);
      if (data.session) {
        try {
          await sendAlert({ event: "success", email: user.email || "Passkey admin" }, data.session.access_token);
        } catch (alertError) {
          console.error("Passkey login alert did not send:", alertError);
          setAlertWarning("Login succeeded, but security alert email failed: " + (alertError.message || "Unknown error"));
        }
      }
    } catch (err) {
      setError(err.message || "Passkey login failed. You can still use your password.");
    } finally {
      setPasskeyBusy(false);
    }
  }

  if (session && authorized) return <Navigate to={location.state?.from || "/admin/tours"} replace />;

  return (
    <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-5 py-12">
      <Helmet><title>Admin Login | My Pakistan Trips</title><meta name="robots" content="noindex,nofollow" /></Helmet>
      <section className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900/80 p-7 shadow-2xl sm:p-9">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-400/10 text-emerald-300"><ShieldCheck size={30} /></div>
        <p className="text-center text-xs font-bold uppercase tracking-[.22em] text-emerald-300">Private workspace</p>
        <h1 className="mt-3 text-center text-3xl font-bold">Tour CMS Login</h1>
        <p className="mt-3 text-center text-sm leading-6 text-slate-400">Sign in with your authorized CMS admin account.</p>

        <button type="button" disabled={busy || passkeyBusy} onClick={loginWithPasskey} className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-400/50 bg-emerald-400/10 px-5 py-3 font-bold text-emerald-200 transition hover:bg-emerald-400/15 disabled:opacity-50">
          <Fingerprint size={19} />{passkeyBusy ? "Waiting for device…" : "Login with Passkey"}
        </button>
        <div className="my-5 flex items-center gap-3 text-xs uppercase tracking-widest text-slate-500"><span className="h-px flex-1 bg-slate-800" />or use password<span className="h-px flex-1 bg-slate-800" /></div>

        <form onSubmit={submit} className="space-y-4">
          <label className="block text-sm font-medium text-slate-200">Email
            <input type="email" autoComplete="username" required value={email} onChange={e => setEmail(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-emerald-400" placeholder="admin@example.com" />
          </label>
          <label className="block text-sm font-medium text-slate-200">Password
            <input type="password" autoComplete="current-password" required value={password} onChange={e => setPassword(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-emerald-400" placeholder="Your admin password" />
          </label>
          {error && <p role="alert" className="rounded-xl border border-red-900 bg-red-950/50 p-3 text-sm text-red-200">{error}</p>}
          {alertWarning && <p role="status" className="rounded-xl border border-amber-800 bg-amber-950/50 p-3 text-sm text-amber-200">{alertWarning}</p>}
          <button disabled={busy || passkeyBusy} className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-400 px-5 py-3 font-bold text-slate-950 disabled:opacity-60"><LockKeyhole size={17} />{busy ? "Signing in…" : "Login with Password"}</button>
        </form>
        <a href="/" className="mt-6 block text-center text-sm text-slate-400 hover:text-white">← Back to website</a>
      </section>
    </main>
  );
}
