import React from "react";
import { AlertTriangle, X, Trash2 } from "lucide-react";

type Props = { open:boolean; title:string; message:string; confirmLabel?:string; busy?:boolean; onConfirm:()=>void; onCancel:()=>void };

export default function AdminConfirmDialog({open,title,message,confirmLabel="Delete",busy=false,onConfirm,onCancel}:Props) {
  if (!open) return null;
  return <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm" onMouseDown={e=>{if(e.target===e.currentTarget&&!busy)onCancel();}}>
    <section role="alertdialog" aria-modal="true" aria-labelledby="admin-confirm-title" aria-describedby="admin-confirm-message" className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl shadow-black/40">
      <div className="flex items-start gap-4 p-5 sm:p-6"><div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-red-500/20 bg-red-500/10 text-red-300"><AlertTriangle size={22}/></div><div className="min-w-0 flex-1"><h2 id="admin-confirm-title" className="text-lg font-bold text-white">{title}</h2><p id="admin-confirm-message" className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-300">{message}</p></div><button type="button" onClick={onCancel} disabled={busy} aria-label="Close confirmation" className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white disabled:opacity-50"><X size={18}/></button></div>
      <div className="flex justify-end gap-3 border-t border-slate-800 bg-slate-950/50 p-4"><button type="button" onClick={onCancel} disabled={busy} className="rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-200 hover:bg-slate-800 disabled:opacity-50">Cancel</button><button type="button" onClick={onConfirm} disabled={busy} className="inline-flex items-center gap-2 rounded-xl bg-red-500 px-4 py-2.5 text-sm font-bold text-white hover:bg-red-400 disabled:cursor-wait disabled:opacity-60"><Trash2 size={16}/>{busy?"Deleting…":confirmLabel}</button></div>
    </section>
  </div>;
}
