import React from "react";
import { Link } from "react-router-dom";
import { Globe, Eye, Edit3, X } from "lucide-react";

type AdminSection = "tours" | "international" | "gallery" | "founder" | "faqs" | "legal" | "contact";
type Props = { active: AdminSection; open: boolean; onClose: () => void };

const links: { id: AdminSection; label: string; href: string; meta?: string; icon: typeof Globe }[] = [
  { id:"tours", label:"Tours", href:"/admin/tours", icon:Globe },
  { id:"international", label:"International tours", href:"/admin/international-tours", meta:"CMS", icon:Globe },
  { id:"gallery", label:"Gallery", href:"/admin/gallery", meta:"Manage", icon:Eye },
  { id:"founder", label:"Founder & CEO Note", href:"/admin/founder-profile", meta:"Edit", icon:Edit3 },
  { id:"faqs", label:"FAQs", href:"/admin/faqs", meta:"Manage", icon:Edit3 },
  { id:"legal", label:"Terms & Privacy", href:"/admin/legal-pages", meta:"Manage", icon:Edit3 },
  { id:"contact", label:"Contact information", href:"/admin/contact-info", meta:"Soon", icon:Edit3 },
];

export default function AdminSidebar({ active, open, onClose }: Props) {
  return <>
    {open && <button type="button" aria-label="Close admin menu overlay" onClick={onClose} className="fixed inset-0 z-[1000] bg-slate-950/70 backdrop-blur-sm lg:hidden" />}
    <aside aria-label="Admin workspace navigation" className={"w-full shrink-0 rounded-2xl border border-slate-700 bg-slate-900 p-3 text-slate-100 lg:sticky lg:top-24 lg:h-fit lg:w-64 " + (open ? "fixed inset-y-0 left-0 z-[1001] w-[min(19rem,85vw)] overflow-y-auto overscroll-contain rounded-r-2xl rounded-l-none shadow-2xl lg:static lg:w-64 lg:rounded-2xl lg:shadow-none" : "hidden lg:block")}>
      <div className="flex items-center justify-between px-3 pb-3 pt-2">
        <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Admin workspace</p>
        <button type="button" onClick={onClose} aria-label="Close admin menu" className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 lg:hidden"><X size={18}/></button>
      </div>
      <nav aria-label="Admin navigation" className="space-y-1">
        {links.map(item => { const Icon=item.icon; const selected=item.id===active; return <Link key={item.id} to={item.href} onClick={onClose} aria-current={selected?"page":undefined} className={"flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition " + (selected ? "bg-emerald-400/10 font-semibold text-emerald-300 ring-1 ring-inset ring-emerald-400/20" : "font-medium text-slate-300 hover:bg-slate-800 hover:text-white")}><Icon size={17}/><span>{item.label}</span>{(selected||item.meta)&&<span className={"ml-auto text-xs "+(selected?"":"text-slate-500")}>{selected?"Active":item.meta}</span>}</Link>; })}
      </nav>
      <p className="mt-5 border-t border-slate-800 px-3 pt-4 text-xs leading-5 text-slate-500">More admin features can be added here later.</p>
    </aside>
  </>;
}
