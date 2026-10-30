import React, { useCallback, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { Fingerprint, KeyRound, Menu, ShieldCheck, Trash2, RefreshCw, Smartphone, Laptop, AlertCircle, CheckCircle2 } from "lucide-react";
import { Helmet } from "react-helmet-async";
import AdminSidebar from "../components/AdminSidebar";
import { supabase, supabaseConfigured } from "../lib/supabase";
import { isCmsAdmin } from "../lib/adminAuth";

export default function AdminSecurity() {
  const [session, setSession] = useState<any>(undefined);
  const [checking, setChecking] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [passkeys, setPasskeys] = useState<any[]>([]);
  const [busy, setBusy] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadPasskeys = useCallback(async () => {
    if (!supabase) throw new Error("Supabase is not configured.");
    const { data, error: listError } = await supabase.auth.passkey.list();
    if (listError) throw listError;
    setPasskeys(Array.isArray(data) ? data : []);
  }, []);

  useEffect(() => {
    let active = true;
    if (!supabaseConfigured || !supabase) {
      setSession(null);
      setChecking(false);
      return;
    }

    async function verifyAdmin(nextSession: any) {
      if (!nextSession?.user?.id) {
        if (active) {
          setSession(null);
          setAuthorized(false);
          setChecking(false);
          setPasskeys([]);
        }
        return;
      }

      if (active) {
        setSession(nextSession);
        setChecking(true);
      }

      try {
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError || !userData?.user) throw new Error("Your session could not be verified.");
        const allowed = await isCmsAdmin(userData.user.id);
        if (!allowed) {
          await supabase.auth.signOut();
          throw new Error("This account is not an authorized My Pakistan Trips admin.");
        }
        if (active) setAuthorized(true);
        try {
          await loadPasskeys();
        } catch (listError: any) {
          if (active) setError(listError?.message || "Passkey management is not available yet. Enable Passkey Authentication in Supabase settings.");
        }
      } catch (err: any) {
        if (active) {
          setAuthorized(false);
          setError(err?.message || "Could not verify admin access.");
        }
      } finally {
        if (active) setChecking(false);
      }
    }

    supabase.auth.getSession().then(({ data }) => verifyAdmin(data.session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      verifyAdmin(nextSession);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [loadPasskeys]);

  async function addPasskey() {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      if (!supabase) throw new Error("Supabase is not configured.");
      const { data, error: registerError } = await supabase.auth.registerPasskey();
      if (registerError) throw registerError;
      await loadPasskeys();
      setNotice("Passkey registered successfully. You can now use it on the admin login page.");
    } catch (err: any) {
      setError(err?.message || "Passkey registration failed. Check that this browser and device support passkeys.");
    } finally {
      setBusy(false);
    }
  }

  async function removePasskey(passkey: any) {
    const label = passkey.friendly_name || "this passkey";
    if (!supabase) return;
    if (!window.confirm(`Remove ${label}? This device will no longer be able to sign in with this passkey.`)) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const { error: deleteError } = await supabase.auth.passkey.delete({ passkeyId: passkey.id });
      if (deleteError) throw deleteError;
      await loadPasskeys();
      setNotice("Passkey removed successfully.");
    } catch (err) {
      setError(err?.message || "Could not remove this passkey.");
    } finally {
      setBusy(false);
    }
  }

  async function renamePasskey(passkey: any) {
    const nextName = window.prompt("Enter a name for this device:", passkey.friendly_name || "My device");
    if (!nextName || !nextName.trim() || !supabase) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const { error: updateError } = await supabase.auth.passkey.update({
        passkeyId: passkey.id,
        friendlyName: nextName.trim().slice(0, 120),
      });
      if (updateError) throw updateError;
      await loadPasskeys();
      setNotice("Device name updated.");
    } catch (err) {
      setError(err?.message || "Could not rename this passkey.");
    } finally {
      setBusy(false);
    }
  }

  if (checking || session === undefined) {
    return <div className="grid min-h-screen place-items-center bg-slate-950 text-white">Checking admin session…</div>;
  }
  if (!session) return <Navigate to="/admin/login" replace />;
  if (!authorized) return <Navigate to="/admin/login" replace />;

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <Helmet><title>Security & Passkeys | My Pakistan Trips Admin</title><meta name="robots" content="noindex,nofollow" /></Helmet>
      <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-900/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-4 sm:px-6">
          <button type="button" onClick={() => setMenuOpen(true)} aria-label="Open admin menu" className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-700 lg:hidden"><Menu size={20} /></button>
          <div><p className="text-xs font-bold uppercase tracking-widest text-emerald-300">My Pakistan Trips</p><h1 className="mt-1 text-xl font-bold sm:text-2xl">Security & Passkeys</h1></div>
        </div>
      </header>
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:flex-row">
        <AdminSidebar active="security" open={menuOpen} onClose={() => setMenuOpen(false)} />
        <section className="min-w-0 flex-1">
          <div className="max-w-3xl rounded-3xl border border-slate-800 bg-slate-900/70 p-5 sm:p-8">
            <div className="flex items-start gap-4">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-emerald-400/20 bg-emerald-400/10 text-emerald-300"><Fingerprint size={25} /></div>
              <div><h2 className="text-2xl font-bold">Passkey login</h2><p className="mt-2 text-sm leading-6 text-slate-400">Register this device to sign in to the admin dashboard using your device biometrics, screen lock PIN, or a supported security key. Your fingerprint data never leaves your device.</p></div>
            </div>

            {error && <p role="alert" className="mt-5 flex items-start gap-2 rounded-xl border border-red-900 bg-red-950/50 p-3 text-sm text-red-200"><AlertCircle size={17} className="mt-0.5 shrink-0" />{error}</p>}
            {notice && <p role="status" className="mt-5 flex items-start gap-2 rounded-xl border border-emerald-900 bg-emerald-950/50 p-3 text-sm text-emerald-200"><CheckCircle2 size={17} className="mt-0.5 shrink-0" />{notice}</p>}

            <div className="mt-7 rounded-2xl border border-slate-800 bg-slate-950/70 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div><h3 className="font-bold">Register a device</h3><p className="mt-1 text-sm text-slate-400">Use the fingerprint or screen-lock prompt on this device.</p></div>
                <button type="button" disabled={busy} onClick={addPasskey} className="inline-flex items-center gap-2 rounded-xl bg-emerald-400 px-4 py-3 text-sm font-bold text-slate-950 disabled:opacity-50"><Fingerprint size={17} />{busy ? "Please wait…" : "Enable passkey"}</button>
              </div>
            </div>

            <div className="mt-7">
              <div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="text-lg font-bold">Registered devices</h3><p className="mt-1 text-sm text-slate-400">Manage the passkeys linked to your admin account.</p></div><button type="button" disabled={busy} onClick={() => loadPasskeys().catch(err => setError(err.message || "Could not refresh devices."))} className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm hover:border-slate-500 disabled:opacity-50"><RefreshCw size={15} /> Refresh</button></div>
              <div className="mt-4 space-y-3">
                {passkeys.map((passkey) => <article key={passkey.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                  <div className="flex min-w-0 items-center gap-3"><div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-800 text-emerald-300"><Smartphone size={19} /></div><div className="min-w-0"><p className="truncate font-semibold">{passkey.friendly_name || "Registered passkey"}</p><p className="mt-1 text-xs text-slate-500">Added {passkey.created_at ? new Date(passkey.created_at).toLocaleDateString() : "date unavailable"}{passkey.last_used_at ? ` · Last used ${new Date(passkey.last_used_at).toLocaleDateString()}` : ""}</p></div></div>
                  <div className="flex items-center gap-2"><button type="button" disabled={busy} onClick={() => renamePasskey(passkey)} className="rounded-lg border border-slate-700 px-3 py-2 text-xs font-semibold hover:border-emerald-400 disabled:opacity-50">Rename</button><button type="button" disabled={busy} onClick={() => removePasskey(passkey)} aria-label="Remove passkey" className="rounded-lg border border-slate-700 p-2 text-red-300 hover:border-red-500 disabled:opacity-50"><Trash2 size={16} /></button></div>
                </article>)}
                {!passkeys.length && <div className="rounded-xl border border-dashed border-slate-700 p-6 text-center"><Laptop size={24} className="mx-auto text-slate-500" /><p className="mt-3 font-semibold">No passkeys registered</p><p className="mt-1 text-sm text-slate-500">Select Enable passkey to register this device.</p></div>}
              </div>
            </div>

            <div className="mt-7 rounded-xl border border-slate-800 bg-slate-950/50 p-4 text-sm leading-6 text-slate-400"><div className="flex items-center gap-2 font-semibold text-slate-200"><ShieldCheck size={17} className="text-emerald-300" /> Password login remains available</div><p className="mt-2">You can continue using your existing email and password at any time. Keep at least one recovery method available and remove passkeys from devices you no longer control.</p></div>
          </div>
        </section>
      </div>
    </main>
  );
}
