import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Clock3, Globe2, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { getPublishedInternationalTours, type InternationalTour } from "../lib/internationalTourRepository";

export default function InternationalToursSection() {
  const [tours, setTours] = useState<InternationalTour[]>([]);
  useEffect(() => {
    let active = true;
    getPublishedInternationalTours().then(data => { if (active) setTours(data); });
    return () => { active = false; };
  }, []);
  if (!tours.length) return null;
  return <section id="international-tours" className="relative overflow-hidden bg-slate-900 py-24 text-white">
    <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-12">
      <div className="mx-auto mb-14 max-w-3xl space-y-4 text-center">
        <motion.span initial={{opacity:0,y:10}} whileInView={{opacity:1,y:0}} viewport={{once:true}} className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-400"><Globe2 className="h-3.5 w-3.5"/> For international travellers</motion.span>
        <motion.h2 initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:.1}} className="text-3xl font-extrabold tracking-tight sm:text-5xl">Discover Pakistan, <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">your way</span></motion.h2>
        <p className="text-sm leading-relaxed text-slate-400">Curated journeys, cultural discoveries and mountain escapes for guests visiting Pakistan from around the world.</p>
      </div>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {tours.slice(0,6).map((tour,index)=><motion.article key={tour.id||tour.slug} initial={{opacity:0,y:18}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:Math.min(index*.04,.2)}} className="flex flex-col overflow-hidden rounded-3xl border border-slate-700/80 bg-slate-950/70 shadow-xl transition hover:border-emerald-500/50">
          <div className="relative h-52 overflow-hidden bg-slate-800"><img src={tour.images?.[0]?.src || "https://placehold.co/800x600/0f172a/94a3b8?text=Pakistan+Tour"} alt={tour.images?.[0]?.alt || tour.title} loading="lazy" className="h-full w-full object-cover transition duration-500 hover:scale-105"/><span className="absolute left-4 top-4 rounded-full border border-emerald-300/30 bg-slate-950/85 px-3 py-1.5 text-xs font-bold text-emerald-300">{tour.label || "International package"}</span></div>
          <div className="flex flex-1 flex-col p-6"><div className="flex items-center gap-2 text-xs text-emerald-400"><Clock3 className="h-3.5 w-3.5"/>{tour.duration_days} days · {tour.duration_nights} nights</div><h3 className="mt-3 text-xl font-bold">{tour.title}</h3><p className="mt-3 flex-1 text-sm leading-relaxed text-slate-300">{tour.overview}</p><p className="mt-4 text-lg font-bold text-emerald-400">From US$ {Number(tour.price_usd||0).toLocaleString("en-US")} <span className="text-xs font-medium text-slate-400">/ person</span></p><Link to={"/international-tours/"+tour.slug} className="mt-5 inline-flex items-center justify-between rounded-xl bg-slate-800 px-4 py-3 text-sm font-semibold transition hover:bg-emerald-500 hover:text-slate-950">View package details <ArrowRight className="h-4 w-4"/></Link></div>
        </motion.article>)}
      </div>
      <div className="mt-10 text-center"><Link to="/international-tours" className="inline-flex items-center gap-2 font-semibold text-emerald-400 hover:text-emerald-300">Explore all international packages <ArrowRight className="h-4 w-4"/></Link></div>
    </div>
  </section>;
}
