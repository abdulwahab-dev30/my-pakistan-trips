import type { VercelRequest,VercelResponse } from "@vercel/node";
import { randomBytes } from "node:crypto";
import { verifyCmsAdmin } from "./_lib/search-console.js";
const root=()=> (process.env.SUPABASE_URL||process.env.VITE_SUPABASE_URL||"").replace(/\/$/,"");
const service=()=>process.env.SUPABASE_SERVICE_ROLE_KEY||"";
const allowed=new Set(["dashboard","tours","international","gallery","homepage","faqs","founder","legal","contact","leads","inbox","analytics","growth","activity"]);
function cleanPermissions(value:any){const result:Record<string,boolean>={};for(const key of allowed)result[key]=value?.[key]===true;return result;}
export default async function handler(req:VercelRequest,res:VercelResponse){
 res.setHeader("Cache-Control","no-store");
 if(!["GET","POST","PATCH"].includes(req.method||"")){res.setHeader("Allow","GET, POST, PATCH");return res.status(405).json({error:"Method not allowed."});}
 const admin=await verifyCmsAdmin(req as any);if(!admin.ok)return res.status(admin.status).json({error:admin.error});
 const url=root(),key=service();if(!url||!key)return res.status(503).json({error:"Add SUPABASE_SERVICE_ROLE_KEY to Vercel Environment Variables before managing team invitations."});
 const headers={apikey:key,Authorization:"Bearer "+key,"Content-Type":"application/json"};
 try{
  if(req.method==="GET"){
   const response=await fetch(url+"/rest/v1/team_members?select=user_id,email,full_name,role,status,permissions,created_at&order=created_at.asc",{headers});
   const data:any=await response.json();if(!response.ok)throw new Error(data.message||"Could not load team members.");
   return res.status(200).json({members:data});
  }
  const body:any=req.body||{};
  if(req.method==="POST"){
   const email=String(body.email||"").trim().toLowerCase(),name=String(body.full_name||"").trim();
   if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||!name)return res.status(400).json({error:"Enter a valid email and full name."});
   const temporaryPassword="MPT-"+randomBytes(18).toString("base64url")+"!9a";
   const created=await fetch(url+"/auth/v1/admin/users",{method:"POST",headers,body:JSON.stringify({email,password:temporaryPassword,email_confirm:true,user_metadata:{full_name:name}})});
   const user:any=await created.json();if(!created.ok)return res.status(created.status).json({error:user.msg||user.message||user.error_description||"Could not create account. This email may already be registered."});
   const permissions=cleanPermissions(body.permissions);
   const saved=await fetch(url+"/rest/v1/team_members",{method:"POST",headers:{...headers,Prefer:"return=representation"},body:JSON.stringify({user_id:user.id,email,full_name:name,role:"team_member",status:"active",permissions,invited_by:admin.userId})});
   const result:any=await saved.json();if(!saved.ok){await fetch(url+"/auth/v1/admin/users/"+encodeURIComponent(user.id),{method:"DELETE",headers});return res.status(saved.status).json({error:result.message||"Account creation was rolled back because the team record could not be saved."});}
   return res.status(201).json({member:result[0],temporary_password:temporaryPassword});
  }
  const userId=String(body.user_id||"");if(!userId||userId===admin.userId)return res.status(400).json({error:"Invalid team member."});
  const existing=await fetch(url+"/rest/v1/team_members?select=user_id,role&user_id=eq."+encodeURIComponent(userId),{headers});
  const rows:any=await existing.json();if(!existing.ok||!rows.length||rows[0].role==="owner")return res.status(404).json({error:"Team member not found."});
  const patch:any={updated_at:new Date().toISOString()};
  if(body.permissions&&typeof body.permissions==="object")patch.permissions=cleanPermissions(body.permissions);
  if(["active","disabled"].includes(body.status))patch.status=body.status;
  if(Object.keys(patch).length===1)return res.status(400).json({error:"No valid changes provided."});
  const saved=await fetch(url+"/rest/v1/team_members?user_id=eq."+encodeURIComponent(userId),{method:"PATCH",headers:{...headers,Prefer:"return=representation"},body:JSON.stringify(patch)});
  const result:any=await saved.json();if(!saved.ok)return res.status(saved.status).json({error:result.message||"Could not update team member."});
  return res.status(200).json({member:result[0]});
 }catch(error:any){return res.status(502).json({error:error?.message||"Team management service is unavailable."});}
}
