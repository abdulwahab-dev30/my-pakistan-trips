import React,{useEffect,useState}from"react";
import{Navigate}from"react-router-dom";
import{supabase,supabaseConfigured}from"../lib/supabase";

export default function AdminRouteGuard({permission,ownerOnly=false,children}:{permission?:string;ownerOnly?:boolean;children:React.ReactNode}){
 const[state,setState]=useState<"checking"|"allowed"|"denied">("checking");
 useEffect(()=>{let live=true;(async()=>{try{
  if(!supabaseConfigured||!supabase)throw new Error("No session");
  const{data:{session}}=await supabase.auth.getSession();if(!session)throw new Error("No session");
  const{data:{user},error:userError}=await supabase.auth.getUser();if(userError||!user)throw new Error("Invalid session");
  const{data:owner,error:ownerError}=await supabase.from("tour_cms_admins").select("user_id").eq("user_id",user.id).maybeSingle();if(ownerError)throw ownerError;
  if(owner?.user_id){if(live)setState("allowed");return;}
  if(ownerOnly)throw new Error("Owner access required");
  const{data:member,error:memberError}=await supabase.from("team_members").select("role,status,permissions").eq("user_id",user.id).maybeSingle();
  if(memberError||member?.role!=="team_member"||member?.status!=="active")throw new Error("No active team access");
  if(permission&&member.permissions?.[permission]!==true)throw new Error("Module permission missing");
  if(live)setState("allowed");
 }catch{if(live)setState("denied");}})();return()=>{live=false;}},[permission,ownerOnly]);
 if(state==="checking")return <div className="grid min-h-screen place-items-center bg-slate-950 text-white">Checking module permissions…</div>;
 if(state==="denied")return <div className="grid min-h-screen place-items-center bg-slate-950 px-5 text-white"><div className="max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 text-center"><h1 className="text-xl font-bold">Access restricted</h1><p className="mt-2 text-sm leading-6 text-slate-400">Your account does not have permission to open this module. Use a module assigned by the Owner.</p><a href="/admin/gallery" className="mt-4 inline-flex rounded-xl bg-emerald-400 px-4 py-2.5 text-sm font-bold text-slate-950">Open Gallery</a></div></div>;
 return <>{children}</>;
}
