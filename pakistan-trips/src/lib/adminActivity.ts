export type AdminActivityInput={action:string;entity:string;description:string;metadata?:Record<string,unknown>};
export async function logAdminActivity(accessToken:string,input:AdminActivityInput){
 try{
  const response=await fetch("/api/admin-activity",{method:"POST",headers:{"Content-Type":"application/json",Authorization:"Bearer "+accessToken},credentials:"same-origin",body:JSON.stringify(input)});
  if(!response.ok){const data=await response.json().catch(()=>({}));console.warn("Admin activity log was not saved:",data.error||response.statusText);}
 }catch(error){console.warn("Admin activity log request failed:",error);}
}
