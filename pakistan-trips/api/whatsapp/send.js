import { getAdminClient, requireAdmin, json } from "./_lib.js";
export default async function handler(req,res){
 if(req.method!=="POST")return json(res,405,{error:"Method not allowed"});
 let reservation=null;
 try{
  const db=getAdminClient();const admin=await requireAdmin(req,db);
  const {to,text}=req.body||{};
  const recipient=String(to||"").replace(/[^0-9]/g,"");
  const message=String(text||"").trim();
  if(!recipient||recipient.length<8||recipient.length>20)return json(res,400,{error:"Valid WhatsApp recipient number is required."});
  if(!message||message.length>4096)return json(res,400,{error:"Message must contain 1 to 4,096 characters."});
  const token=process.env.WHATSAPP_ACCESS_TOKEN,phoneId=process.env.WHATSAPP_PHONE_NUMBER_ID,version=process.env.WHATSAPP_API_VERSION||"v23.0";
  if(!token||!phoneId)return json(res,503,{error:"WhatsApp Cloud API credentials are not configured in Vercel yet."});
  const {data:quota,error:quotaError}=await db.rpc("reserve_whatsapp_message_for_admin",{p_admin_user_id:admin.id});
  if(quotaError)throw quotaError;
  reservation=quota?.[0];
  if(!reservation?.allowed)return json(res,429,{error:"Monthly website WhatsApp limit of 1,000 messages reached.",quota:reservation});
  const apiResponse=await fetch(`https://graph.facebook.com/${version}/${phoneId}/messages`,{method:"POST",headers:{"Authorization":`Bearer ${token}`,"Content-Type":"application/json"},body:JSON.stringify({messaging_product:"whatsapp",recipient_type:"individual",to:recipient,type:"text",text:{preview_url:false,body:message}})});
  const payload=await apiResponse.json();
  if(!apiResponse.ok)throw Object.assign(new Error(payload?.error?.message||"Meta rejected the WhatsApp message."),{status:apiResponse.status,metaError:payload?.error});
  const waId=payload?.messages?.[0]?.id;
  const {data:conversation,error:convError}=await db.from("whatsapp_conversations").upsert({wa_id:recipient,phone_number:recipient,last_message:message,last_message_at:new Date().toISOString(),updated_at:new Date().toISOString()},{onConflict:"wa_id"}).select("id").single();
  if(convError)throw convError;
  const {error:msgError}=await db.from("whatsapp_messages").insert({conversation_id:conversation.id,wa_message_id:waId||null,direction:"outbound",message_type:"text",body:message,status:"sent"});
  if(msgError)throw msgError;
  return json(res,200,{success:true,message_id:waId,quota:reservation});
 }catch(e){return json(res,e.status||500,{error:e.message||"WhatsApp send failed.",details:e.metaError?.error_data?.details});}
}
