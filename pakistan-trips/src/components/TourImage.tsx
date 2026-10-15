import React,{useEffect,useState}from"react";
const CLOUD=import.meta.env.VITE_CLOUDINARY_CLOUD_NAME||"lvv2vfug";
const FALLBACK="https://placehold.co/800x600/0f172a/94a3b8?text=Image+Coming+Soon";
const isPlaceholder=(value?:string)=>!value||value.includes("placehold.co/")||value.includes("Image+Coming+Soon");
export default function TourImage({src,tag,alt,className="",loading="lazy"}:{src?:string;tag?:string;alt:string;className?:string;loading?:"lazy"|"eager"}) {
 const [resolved,setResolved]=useState(isPlaceholder(src)?FALLBACK:src!);
 useEffect(()=>{
  let cancelled=false;
  if(!isPlaceholder(src)){setResolved(src!);return()=>{cancelled=true}};
  if(!tag){setResolved(FALLBACK);return()=>{cancelled=true}};
  setResolved(FALLBACK);
  fetch(`https://res.cloudinary.com/${CLOUD}/image/list/${tag}.json`)
   .then(r=>r.ok?r.json():null)
   .then(data=>{
    const item=data?.resources?.find((x:any)=>x?.public_id&&x?.format&&x?.version);
    if(!cancelled&&item)setResolved(`https://res.cloudinary.com/${CLOUD}/image/upload/f_auto,q_auto,w_1200/v${item.version}/${item.public_id}.${item.format}`);
   }).catch(()=>{});
  return()=>{cancelled=true};
 },[src,tag]);
 return <img src={resolved} alt={alt} width="1200" height="800" loading={loading} decoding="async" onError={()=>{if(resolved!==FALLBACK)setResolved(FALLBACK)}} className={className}/>;
}
