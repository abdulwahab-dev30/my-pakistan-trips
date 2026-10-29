import React,{useCallback,useEffect,useState}from"react";
import{Navigate,Link}from"react-router-dom";
import{Helmet}from"react-helmet-async";
import{ArrowDown,ArrowUp,Images,LogOut,RefreshCw,Save,Upload,Menu,X,Trash2,CheckSquare,Square}from"lucide-react";
import{supabase,supabaseConfigured}from"../lib/supabase";

const CLOUD_NAME=import.meta.env.VITE_CLOUDINARY_CLOUD_NAME||"lvv2vfug";
const GALLERY_TAG="gallery";
type GalleryImage={public_id:string;version:number;format:string;secure_url?:string;created_at?:string};
const imageUrl=(image:GalleryImage)=>image.secure_url||`https://res.cloudinary.com/${CLOUD_NAME}/image/upload/f_auto,q_auto,w_480/v${image.version}/${image.public_id}.${image.format}`;

export default function AdminGallery(){
 const[session,setSession]=useState<any>(undefined);
 const[images,setImages]=useState<GalleryImage[]>([]);
 const[loading,setLoading]=useState(true);
 const[saving,setSaving]=useState(false);
 const[uploading,setUploading]=useState(false);
 const[deleting,setDeleting]=useState(false);
 const[selected,setSelected]=useState<string[]>([]);
 const[menuOpen,setMenuOpen]=useState(false);
 const[notice,setNotice]=useState("");
 const[error,setError]=useState("");
 const[hasOrder,setHasOrder]=useState(true);
 const cloudName=import.meta.env.VITE_CLOUDINARY_CLOUD_NAME||"lvv2vfug";
 const uploadPreset=import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

 useEffect(()=>{
  if(!supabaseConfigured){setSession(null);return;}
  supabase.auth.getSession().then(({data})=>setSession(data.session));
  const{data:{subscription}}=supabase.auth.onAuthStateChange((_event,s)=>setSession(s));
  return()=>subscription.unsubscribe();
 },[]);

 const load=useCallback(async()=>{
  setLoading(true);setError("");setNotice("");
  try{
   const response=await fetch(`https://res.cloudinary.com/${cloudName}/image/list/${GALLERY_TAG}.json?t=${Date.now()}`);
   if(!response.ok)throw new Error("Cloudinary gallery list is not available. Check that the 'gallery' tag is public/listable in Cloudinary.");
   const data=await response.json();
   const found:GalleryImage[]=(data.resources||[]).filter((x:any)=>x.public_id&&x.version&&x.format);
   let order:string[]=[];
   const{data:setting,error:settingsError}=await supabase!.from("gallery_settings").select("image_order").eq("id",1).maybeSingle();
   if(settingsError){
    if(settingsError.code==="42P01"||settingsError.code==="PGRST205"){setHasOrder(false);setImages(found);setError("Gallery ordering database setup is missing. Run supabase/gallery-cms.sql in Supabase SQL Editor to enable saving order.");return;}
    throw settingsError;
   }
   setHasOrder(true);
   order=Array.isArray(setting?.image_order)?setting.image_order:[];
   const byId=new Map(found.map(x=>[x.public_id,x]));
   const ordered=order.map(id=>byId.get(id)).filter(Boolean) as GalleryImage[];
   const orderedIds=new Set(ordered.map(x=>x.public_id));
   setImages([...ordered,...found.filter(x=>!orderedIds.has(x.public_id))]);
  }catch(e:any){setError(e?.message||"Could not load gallery images.");}
  finally{setLoading(false);}
 },[cloudName]);

 useEffect(()=>{if(session)load();},[session,load]);
 if(session===undefined)return <div className="min-h-screen bg-slate-950 text-white grid place-items-center">Checking admin session…</div>;
 if(!session)return <Navigate to="/admin/login" replace/>;
 async function logout(){await supabase!.auth.signOut();window.location.href="/admin/login";}
 function toggleSelected(id:string){setSelected(current=>current.includes(id)?current.filter(item=>item!==id):[...current,id]);}
 function toggleAll(){setSelected(current=>current.length===images.length?[]:images.map(image=>image.public_id));}
 async function deleteSelected(){
  if(!selected.length)return;
  if(!window.confirm("Permanently delete "+selected.length+" selected image(s) from Cloudinary? This cannot be undone."))return;
  setDeleting(true);setError("");setNotice("");
  try{
   const response=await fetch("/api/gallery-delete",{method:"POST",headers:{"Content-Type":"application/json",Authorization:"Bearer "+session.access_token},body:JSON.stringify({public_ids:selected})});
   const result=await response.json();
   if(!response.ok&&response.status!==207)throw new Error(result.error||"Could not delete selected images.");
   const deleted:string[]=result.deleted||[];
   const remaining=images.filter(image=>!deleted.includes(image.public_id));
   setImages(remaining);setSelected(current=>current.filter(id=>!deleted.includes(id)));
   if(deleted.length){const{error:orderError}=await supabase!.from("gallery_settings").upsert({id:1,image_order:remaining.map(image=>image.public_id),updated_at:new Date().toISOString()},{onConflict:"id"});if(orderError)throw orderError;}
   setNotice("Deleted "+deleted.length+" image(s)."+((result.failed||[]).length?" Some images could not be deleted.":""));
  }catch(e:any){setError(e?.message||"Could not delete selected images.");}
  finally{setDeleting(false);}
 }
 function move(index:number,delta:number){setImages(current=>{const next=[...current];const target=index+delta;if(target<0||target>=next.length)return current;[next[index],next[target]]=[next[target],next[index]];return next;});setNotice("");}
 async function saveOrder(){
  setSaving(true);setError("");setNotice("");
  try{
   const{error:saveError}=await supabase!.from("gallery_settings").upsert({id:1,image_order:images.map(x=>x.public_id),updated_at:new Date().toISOString()},{onConflict:"id"});
   if(saveError)throw saveError;
   setNotice("Gallery order saved. The public gallery will now use this order after its update is deployed.");
  }catch(e:any){setError(e?.message||"Could not save the gallery order. Check the gallery-cms.sql setup and admin permissions.");}
  finally{setSaving(false);}
 }
 async function uploadImages(fileList?:FileList|null){
  if(!fileList||!fileList.length)return;
  const files=Array.from(fileList);
  if(!cloudName||!uploadPreset){setError("Configure VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET in Vercel first.");return;}
  if(files.some(file=>!file.type.startsWith("image/"))){setError("Please select image files only.");return;}
  setUploading(true);setError("");setNotice("");
  try{
   const uploaded:GalleryImage[]=[];
   for(const file of files){
    const body=new FormData();body.append("file",file);body.append("upload_preset",uploadPreset);body.append("tags",GALLERY_TAG);body.append("folder","my-pakistan-trips/gallery");
    const response=await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,{method:"POST",body});
    const result=await response.json();
    if(!response.ok)throw new Error(result.error?.message||"Cloudinary upload failed for "+file.name);
    uploaded.push({public_id:result.public_id,version:result.version,format:result.format,secure_url:result.secure_url,created_at:result.created_at});
   }
   setImages(current=>[...current,...uploaded]);
   setNotice("Uploaded "+uploaded.length+" image(s) with the fixed gallery tag. Save order to keep their position.");
  }catch(e:any){setError(e?.message||"Image upload failed.");}
  finally{setUploading(false);}
 }
 return <main className="min-h-screen bg-slate-950 text-white">
 <Helmet><title>Gallery Management | Admin | My Pakistan Trips</title><meta name="robots" content="noindex,nofollow"/></Helmet>
 <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-900/95 backdrop-blur"><div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-5"><div className="flex items-center gap-3"><button type="button" onClick={()=>setMenuOpen(true)} aria-label="Open admin menu" className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-700 lg:hidden"><Menu size={20}/></button><div><p className="text-xs font-bold uppercase tracking-widest text-emerald-300">My Pakistan Trips</p><h1 className="mt-1 text-xl font-bold sm:text-2xl">Gallery Management</h1></div></div><button onClick={logout} className="inline-flex items-center gap-2 rounded-xl border border-slate-700 px-3 py-2 text-sm"><LogOut size={16}/> Logout</button></div></header>
 <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 sm:px-5 lg:flex-row lg:gap-8">
 {menuOpen&&<button type="button" aria-label="Close admin menu" onClick={()=>setMenuOpen(false)} className="fixed inset-0 z-40 bg-black/60 lg:hidden"/>}
 <aside className={"w-full shrink-0 rounded-2xl border border-slate-800 bg-slate-900/95 p-3 lg:sticky lg:top-24 lg:h-fit lg:w-64 "+(menuOpen?"fixed inset-y-0 left-0 z-50 w-[min(19rem,85vw)] rounded-none lg:static lg:w-64 lg:rounded-2xl":"hidden lg:block")}><div className="flex items-center justify-between px-3 pb-3 pt-2"><p className="text-xs font-bold uppercase tracking-widest text-slate-500">Admin workspace</p><button onClick={()=>setMenuOpen(false)} className="p-2 lg:hidden" aria-label="Close menu"><X size={18}/></button></div><nav aria-label="Admin navigation" className="space-y-1"><Link to="/admin/tours" className="flex items-center rounded-xl px-3 py-3 text-sm text-slate-300 hover:bg-slate-800">Tours</Link><Link to="/admin/international-tours" className="flex items-center rounded-xl px-3 py-3 text-sm text-slate-300 hover:bg-slate-800">International tours</Link><Link to="/admin/gallery" aria-current="page" className="flex items-center rounded-xl bg-emerald-400/10 px-3 py-3 text-sm font-semibold text-emerald-300 ring-1 ring-inset ring-emerald-400/20">Gallery <span className="ml-auto">Active</span></Link><Link to="/admin/founder-profile" className="flex items-center rounded-xl px-3 py-3 text-sm text-slate-300 hover:bg-slate-800">Founder &amp; CEO Note</Link><Link to="/admin/faqs" className="flex items-center rounded-xl px-3 py-3 text-sm text-slate-300 hover:bg-slate-800">FAQs</Link><Link to="/admin/legal-pages" className="flex items-center rounded-xl px-3 py-3 text-sm text-slate-300 hover:bg-slate-800">Terms &amp; Privacy</Link><Link to="/admin/contact-info" className="flex items-center rounded-xl px-3 py-3 text-sm text-slate-300 hover:bg-slate-800">Contact information</Link></nav></aside>
 <section className="min-w-0 flex-1">
  <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-5 sm:p-7"><div className="flex flex-wrap items-center justify-between gap-3"><div><div className="flex items-center gap-2 text-emerald-300"><Images size={20}/><span className="text-xs font-bold uppercase tracking-widest">Website gallery</span></div><h2 className="mt-2 text-2xl font-bold">Manage images & order</h2><p className="mt-2 text-sm leading-6 text-slate-400">Move images up or down to set their display order. New uploads automatically request the existing <code className="text-emerald-300">gallery</code> tag.</p></div><button onClick={load} disabled={loading} className="inline-flex items-center gap-2 rounded-xl border border-slate-700 px-3 py-2 text-sm disabled:opacity-50"><RefreshCw size={16}/> Refresh</button></div>
  <div className="mt-5 flex flex-wrap gap-3"><label className={"inline-flex cursor-pointer items-center gap-2 rounded-xl bg-emerald-400 px-4 py-3 text-sm font-bold text-slate-950 "+(uploading?"pointer-events-none opacity-60":"")}><Upload size={17}/>{uploading?"Uploading image…":"Add images"}<input type="file" accept="image/*" multiple className="hidden" disabled={uploading||saving} onChange={e=>{void uploadImages(e.target.files);e.currentTarget.value="";}}/></label><button onClick={saveOrder} disabled={saving||loading||!images.length||!hasOrder} className="inline-flex items-center gap-2 rounded-xl border border-emerald-400/50 px-4 py-3 text-sm font-bold text-emerald-300 disabled:cursor-not-allowed disabled:opacity-40"><Save size={17}/>{saving?"Saving order…":"Save order"}</button><button type="button" onClick={toggleAll} disabled={!images.length||loading} className="inline-flex items-center gap-2 rounded-xl border border-slate-700 px-4 py-3 text-sm font-semibold text-slate-200 disabled:opacity-40">{selected.length===images.length&&images.length>0?<CheckSquare size={17}/>:<Square size={17}/>} {selected.length===images.length&&images.length>0?"Deselect all":"Select all"}</button><button type="button" onClick={deleteSelected} disabled={!selected.length||deleting||saving} className="inline-flex items-center gap-2 rounded-xl border border-red-500/40 px-4 py-3 text-sm font-bold text-red-300 hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-40"><Trash2 size={17}/>{deleting?"Deleting…":"Delete selected ("+selected.length+")"}</button><span className="self-center text-xs text-slate-500">{images.length} image{images.length===1?"":"s"}</span></div>
  {notice&&<p role="status" className="mt-4 rounded-xl border border-emerald-900 bg-emerald-950/50 p-3 text-sm text-emerald-200">{notice}</p>}{error&&<p role="alert" className="mt-4 break-words rounded-xl border border-amber-900 bg-amber-950/40 p-3 text-sm text-amber-100">{error}</p>}
  {loading?<div className="grid min-h-40 place-items-center text-sm text-slate-400">Loading Cloudinary gallery…</div>:images.length?<div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">{images.map((image,index)=><article key={image.public_id} className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950"><div className="relative"><label className="absolute right-3 top-3 z-10 flex cursor-pointer items-center gap-2 rounded-lg bg-slate-950/85 px-2.5 py-2 text-xs font-semibold text-white"><input type="checkbox" checked={selected.includes(image.public_id)} onChange={()=>toggleSelected(image.public_id)} aria-label={"Select image "+(index+1)} className="h-4 w-4 accent-emerald-400"/><span>Select</span></label><img src={imageUrl(image)} alt={image.public_id.split("/").pop()?.replace(/[-_]/g," ")||"Gallery image"} loading="lazy" className="h-48 w-full object-cover"/><span className="absolute left-3 top-3 rounded-lg bg-slate-950/80 px-2.5 py-1 text-xs font-bold text-white">#{index+1}</span></div><div className="flex items-center justify-between gap-2 p-3"><div className="min-w-0"><p className="truncate text-xs font-medium text-slate-200">{image.public_id.split("/").pop()}</p><p className="mt-1 text-[11px] text-slate-500">Cloudinary · gallery</p></div><div className="flex shrink-0 gap-1"><button type="button" onClick={()=>move(index,-1)} disabled={index===0} aria-label="Move image up" title="Move up" className="rounded-lg border border-slate-700 p-2 text-slate-200 hover:border-emerald-400 disabled:opacity-25"><ArrowUp size={16}/></button><button type="button" onClick={()=>move(index,1)} disabled={index===images.length-1} aria-label="Move image down" title="Move down" className="rounded-lg border border-slate-700 p-2 text-slate-200 hover:border-emerald-400 disabled:opacity-25"><ArrowDown size={16}/></button></div></div></article>)}</div>:!error?<div className="mt-6 rounded-2xl border border-dashed border-slate-700 p-10 text-center text-sm text-slate-400">No images found with the <code className="text-emerald-300">gallery</code> tag in Cloudinary.</div>:null}
  <p className="mt-6 text-xs leading-5 text-slate-500">Note: saving the order requires the <code>gallery_settings</code> table. Run <code>supabase/gallery-cms.sql</code> in your Supabase SQL Editor if the setup warning appears.</p>
  </div>
 </section></div></main>;
}
