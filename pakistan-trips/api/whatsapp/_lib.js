import { createClient } from "@supabase/supabase-js";
import crypto from "node:crypto";

export function getAdminClient(){
 const url=process.env.SUPABASE_URL||process.env.VITE_SUPABASE_URL;
 const key=process.env.SUPABASE_SERVICE_ROLE_KEY;
 if(!url||!key)throw new Error("Server Supabase environment variables are missing.");
 return createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
}
export async function requireAdmin(req,supabase){
 const header=req.headers.authorization||"";
 const token=header.startsWith("Bearer ")?header.slice(7):"";
 if(!token)throw Object.assign(new Error("Admin authentication required."),{status:401});
 const {data,error}=await supabase.auth.getUser(token);
 if(error||!data?.user)throw Object.assign(new Error("Admin session is invalid or expired."),{status:401});
 const {data:admin,error:adminError}=await supabase.from("tour_cms_admins").select("user_id").eq("user_id",data.user.id).maybeSingle();
 if(adminError||!admin)throw Object.assign(new Error("You are not authorized to use the WhatsApp inbox."),{status:403});
 return data.user;
}
export function verifyMetaSignature(rawBody,signature){
 const secret=process.env.WHATSAPP_APP_SECRET;
 if(!secret||!signature)return false;
 const expected="sha256="+crypto.createHmac("sha256",secret).update(rawBody).digest("hex");
 const a=Buffer.from(expected),b=Buffer.from(signature);
 return a.length===b.length&&crypto.timingSafeEqual(a,b);
}
export function json(res,status,body){res.status(status).setHeader("Content-Type","application/json").send(JSON.stringify(body));}
