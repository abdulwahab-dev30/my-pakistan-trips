import React,{useEffect,useState}from"react";
import{Navigate}from"react-router-dom";
import{Helmet}from"react-helmet-async";
import{KeyRound,Menu,ShieldCheck,Eye,EyeOff,CheckCircle2}from"lucide-react";
import{supabase,supabaseConfigured}from"../lib/supabase";
import AdminSidebar from "../components/AdminSidebar";

export default function AdminPassword(){
 const[session,setSession]=useState<any>(undefined);
 const[menuOpen,setMenuOpen]=useState(false);
 const[currentPassword,setCurrentPassword]=useState("");
 const[newPassword,setNewPassword]=useState("");
 const[confirmPassword,setConfirmPassword]=useState("");
 const[showCurrent,setShowCurrent]=useState(false);
 const[showNew,setShowNew]=useState(false);
 const[busy,setBusy]=useState(false);
 const[error,setError]=useState("");
 const[notice,setNotice]=useState("");
 useEffect(()=>{if(!supabaseConfigured){setSession(null);return;}supabase.auth.getSession().then(({data})=>setSession(data.session));const{data:{subscription}}=supabase.auth.onAuthStateChange((_event,s)=>setSession(s));return()=>subscription.unsubscribe();},[]);
 async function submit(e:React.FormEvent){e.preventDefault();setError("");setNotice("");
  if(!supabaseConfigured){setError("Supabase is not configured.");return;}
  if(newPassword.length<8){setError("New password must be at least 8 characters long.");return;}
  if(newPassword!==confirmPassword){setError("New password and confirmation do not match.");return;}
  if(currentPassword===newPassword){setError("Choose a password different from your current password.");return;}
  const email=session?.user?.email;if(!email){setError("Could not verify the admin email. Please sign in again.");return;}
  setBusy(true);
  try{
   const{error:verifyError}=await supabase.auth.signInWithPassword({email,password:currentPassword});
   if(verifyError)throw new Error("Current password is incorrect. Please check it and try again.");
   const{error:updateError}=await supabase.auth.updateUser({password:newPassword});
   if(updateError)throw updateError;
   setCurrentPassword("");setNewPassword("");setConfirmPassword("");
   setNotice("Password updated successfully. Use your new password next time you log in.");
  }catch(err:any){setError(err?.message||"Could not update password. Please try again.");}
  finally{setBusy(false);}
 }
 if(session===undefined)return <div className="grid min-h-screen place-items-center bg-slate-950 text-white">Checking admin session…</div>;
 if(!session)return <Navigate to="/admin/login" replace/>;
 return <main className="min-h-screen bg-slate-950 text-white"><Helmet><title>Change Admin Password | My Pakistan Trips</title><meta name="robots" content="noindex,nofollow"/></Helmet>
  <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-900/95 backdrop-blur"><div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 sm:px-6"><div className="flex min-w-0 items-center gap-3"><button type="button" onClick={()=>setMenuOpen(true)} aria-label="Open admin menu" aria-expanded={menuOpen} className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-700 lg:hidden"><Menu size={20}/></button><div><p className="text-xs font-bold uppercase tracking-widest text-emerald-300">My Pakistan Trips</p><h1 className="mt-1 text-xl font-bold sm:text-2xl">Security settings</h1></div></div><div className="hidden items-center gap-2 text-xs text-slate-400 sm:flex"><ShieldCheck size={16} className="text-emerald-300"/> Admin account</div></div></header>
  <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:flex-row"><AdminSidebar active="password" open={menuOpen} onClose={()=>setMenuOpen(false)}/>
   <section className="min-w-0 flex-1"><div className="max-w-3xl rounded-3xl border border-slate-800 bg-slate-900/70 p-5 sm:p-8"><div className="flex items-start gap-4"><div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-emerald-400/20 bg-emerald-400/10 text-emerald-300"><KeyRound size={23}/></div><div><h2 className="text-2xl font-bold">Change password</h2><p className="mt-2 text-sm leading-6 text-slate-400">Update the password for your admin login. For security, confirm your current password first.</p><p className="mt-2 text-sm text-slate-300">{session.user.email}</p></div></div>
   <form onSubmit={submit} className="mt-7 space-y-5">
    <label className="block text-sm font-semibold text-slate-200">Current password<div className="relative mt-2"><input type={showCurrent?"text":"password"} autoComplete="current-password" required value={currentPassword} onChange={e=>setCurrentPassword(e.target.value)} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 pr-12 outline-none focus:border-emerald-400" placeholder="Enter current password"/><button type="button" onClick={()=>setShowCurrent(v=>!v)} aria-label={showCurrent?"Hide current password":"Show current password"} className="absolute inset-y-0 right-0 px-4 text-slate-400">{showCurrent?<EyeOff size={18}/>:<Eye size={18}/>}</button></div></label>
    <label className="block text-sm font-semibold text-slate-200">New password<div className="relative mt-2"><input type={showNew?"text":"password"} autoComplete="new-password" required minLength={8} value={newPassword} onChange={e=>setNewPassword(e.target.value)} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 pr-12 outline-none focus:border-emerald-400" placeholder="At least 8 characters"/><button type="button" onClick={()=>setShowNew(v=>!v)} aria-label={showNew?"Hide new password":"Show new password"} className="absolute inset-y-0 right-0 px-4 text-slate-400">{showNew?<EyeOff size={18}/>:<Eye size={18}/>}</button></div><span className="mt-2 block text-xs font-normal text-slate-500">Use a long, unique password that you do not use on other websites.</span></label>
    <label className="block text-sm font-semibold text-slate-200">Confirm new password<input type="password" autoComplete="new-password" required minLength={8} value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-emerald-400" placeholder="Enter the new password again"/></label>
    {error&&<p role="alert" className="rounded-xl border border-red-900 bg-red-950/50 p-3 text-sm text-red-200">{error}</p>}
    {notice&&<p role="status" className="flex items-start gap-2 rounded-xl border border-emerald-900 bg-emerald-950/50 p-3 text-sm text-emerald-200"><CheckCircle2 size={18} className="mt-0.5 shrink-0"/>{notice}</p>}
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-800 pt-5"><p className="text-xs text-slate-500">Your password is updated securely through Supabase Auth.</p><button disabled={busy} className="inline-flex items-center gap-2 rounded-xl bg-emerald-400 px-5 py-3 font-bold text-slate-950 disabled:cursor-wait disabled:opacity-60"><KeyRound size={17}/>{busy?"Updating password…":"Update password"}</button></div>
   </form></div></section>
  </div>
 </main>;
}
