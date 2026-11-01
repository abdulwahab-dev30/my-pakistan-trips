import { getAdminClient, requireAdmin, json } from "./_lib.js";
export default async function handler(req,res){
 if(req.method!=="GET")return json(res,405,{error:"Method not allowed"});
 try{
  const db=getAdminClient();await requireAdmin(req,db);
  const {data,error}=await db.from("whatsapp_conversations").select("id,wa_id,phone_number,customer_name,last_message,last_message_at,unread_count,last_inbound_at").order("last_message_at",{ascending:false}).limit(300);
  if(error)throw error;return json(res,200,{conversations:data||[]});
 }catch(e){return json(res,e.status||500,{error:e.message||"Unable to load conversations."});}
}
