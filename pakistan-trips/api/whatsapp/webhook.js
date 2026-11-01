import { getAdminClient, verifyMetaSignature, json } from "./_lib.js";
export const config={api:{bodyParser:false}};
async function readRaw(req){const chunks=[];for await(const chunk of req)chunks.push(Buffer.isBuffer(chunk)?chunk:Buffer.from(chunk));return Buffer.concat(chunks);}
export default async function handler(req,res){
 if(req.method==="GET"){
  const mode=req.query["hub.mode"],token=req.query["hub.verify_token"],challenge=req.query["hub.challenge"];
  if(mode==="subscribe"&&token&&token===process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN)return res.status(200).send(challenge);
  return res.status(403).send("Webhook verification failed.");
 }
 if(req.method!=="POST")return res.status(405).send("Method not allowed");
 try{
  const raw=await readRaw(req);
  if(!verifyMetaSignature(raw,req.headers["x-hub-signature-256"]))return res.status(401).send("Invalid webhook signature");
  const payload=JSON.parse(raw.toString("utf8"));const db=getAdminClient();
  for(const entry of payload.entry||[])for(const change of entry.changes||[]){
   if(change.field!=="messages")continue;
   const value=change.value||{};
   for(const item of value.messages||[]){
    const waId=item.from;if(!waId)continue;
    const contact=(value.contacts||[]).find(c=>c.wa_id===waId);
    const body=item.text?.body||item.button?.text||item.interactive?.button_reply?.title||item.interactive?.list_reply?.title||(`[${item.type||"unsupported"} message]`);
    const timestamp=item.timestamp?new Date(Number(item.timestamp)*1000).toISOString():new Date().toISOString();
    const {data:conv,error:convError}=await db.from("whatsapp_conversations").upsert({wa_id:waId,phone_number:waId,customer_name:contact?.profile?.name||null,last_message:body,last_message_at:timestamp,last_inbound_at:timestamp,unread_count:1,updated_at:new Date().toISOString()},{onConflict:"wa_id"}).select("id,unread_count").single();
    if(convError)throw convError;
    const {error:msgError}=await db.from("whatsapp_messages").upsert({conversation_id:conv.id,wa_message_id:item.id,direction:"inbound",message_type:item.type||"text",body,status:"received",created_at:timestamp},{onConflict:"wa_message_id"});
    if(msgError)throw msgError;
   }
   for(const status of value.statuses||[]){
    const {error}=await db.from("whatsapp_messages").update({status:status.status,updated_at:new Date().toISOString(),error_detail:status.errors?.[0]?.title||null}).eq("wa_message_id",status.id);
    if(error)throw error;
   }
  }
  return res.status(200).send("EVENT_RECEIVED");
 }catch(e){console.error("WhatsApp webhook error",e);return res.status(500).send("Webhook processing failed");}
}
