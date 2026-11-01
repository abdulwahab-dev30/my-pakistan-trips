import type { ApiRequest, ApiResponse } from "./_lib/search-console.js";
import { verifyCmsAdmin } from "./_lib/search-console.js";
import loginAlertHandler from "./_lib/admin-login.js";

const base = () => (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "").replace(/\/$/, "");
const key = () => process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";
function token(req: ApiRequest) { const h=req.headers.authorization; const value=Array.isArray(h)?h[0]||"":h||""; return value.startsWith("Bearer ")?value.slice(7):""; }
export default async function handler(req: ApiRequest,res: ApiResponse) {
 if (req.query?.action === "login") return loginAlertHandler(req, res);
 res.setHeader("Cache-Control","no-store");
 if(req.method!=="GET"&&req.method!=="POST"){res.setHeader("Allow","GET, POST");return res.status(405).json({error:"Method not allowed."});}
 const admin=await verifyCmsAdmin(req); if(!admin.ok)return res.status(admin.status).json({error:admin.error});
 const access=token(req), root=base(), apiKey=key();
 if(!root||!apiKey)return res.status(503).json({error:"Supabase server configuration is missing."});
 try{
  if(req.method==="POST"){
   const body:any=req.body||{};
   const action=String(body.action||"").trim().slice(0,80), entity=String(body.entity||"").trim().slice(0,80);
   const description=String(body.description||"").trim().slice(0,240);
   if(!action||!entity||!description)return res.status(400).json({error:"Action, entity and description are required."});
   const response=await fetch(root+"/rest/v1/admin_activity_logs",{method:"POST",headers:{apikey:apiKey,Authorization:"Bearer "+access,"Content-Type":"application/json",Prefer:"return=minimal"},body:JSON.stringify({actor_id:admin.userId,action,entity,description,metadata:body.metadata&&typeof body.metadata==="object"?body.metadata:{}})});
   if(!response.ok){const data:any=await response.json().catch(()=>({}));return res.status(response.status).json({error:data.message||data.details||"Could not save activity log. Run supabase/admin-activity-logs.sql first."});}
   return res.status(201).json({success:true});
  }
  const url=root+"/rest/v1/admin_activity_logs?select=id,actor_id,action,entity,description,metadata,created_at&order=created_at.desc&limit=100";
  const response=await fetch(url,{headers:{apikey:apiKey,Authorization:"Bearer "+access}});
  const data:any=await response.json(); if(!response.ok)return res.status(response.status).json({error:data.message||"Could not load activity logs."});
  return res.status(200).json({logs:Array.isArray(data)?data:[]});
 }catch(error:any){return res.status(502).json({error:error?.message||"Activity log service is unavailable."});}
}
