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
 if(state==="denied")return <Navigate to="/admin/dashboard" replace/>;
 return <>{children}</>;
}
