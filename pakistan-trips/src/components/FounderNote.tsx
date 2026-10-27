import React from "react";
import { motion } from "framer-motion";
import { Quote, Sparkles } from "lucide-react";
import heroFallbackImage from "../assets/hero-bg.webp";

const FounderNote: React.FC = () => (
  <section id="founder-note" className="relative overflow-hidden bg-slate-950 py-20 text-white sm:py-24">
    <div className="pointer-events-none absolute -right-24 top-10 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />
    <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-6 lg:grid-cols-12 lg:gap-14 lg:px-12">
      <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.55 }} className="relative mx-auto w-full max-w-md lg:col-span-5">
        <div className="absolute -inset-1 rounded-3xl bg-gradient-to-br from-emerald-500/40 to-teal-400/10 blur-xl" />
        <div className="relative overflow-hidden rounded-3xl border border-slate-700 bg-slate-900 p-3 shadow-2xl">
          <img src={heroFallbackImage} alt="Pakistan's beautiful northern landscapes" width="800" height="1000" loading="lazy" className="h-[340px] w-full rounded-2xl object-cover sm:h-[420px]" />
          <div className="absolute inset-x-3 bottom-3 rounded-b-2xl bg-gradient-to-t from-slate-950 via-slate-950/90 to-transparent px-5 pb-5 pt-12">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">Founder &amp; CEO</p>
            <h3 className="mt-1 text-2xl font-extrabold text-white">Shabeer Ahmad</h3>
            <p className="mt-1 text-sm text-slate-300">My Pakistan Trips</p>
          </div>
        </div>
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.55 }} className="lg:col-span-7">
        <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-emerald-300"><Sparkles className="h-4 w-4" /> A Note from Our Founder</span>
        <h2 className="mt-5 text-3xl font-extrabold leading-tight tracking-tight sm:text-5xl">Every journey deserves <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">care and meaning.</span></h2>
        <div className="mt-7 flex gap-4">
          <Quote className="mt-1 h-8 w-8 shrink-0 text-emerald-400" />
          <div className="space-y-4 text-base leading-8 text-slate-300">
            <p>At My Pakistan Trips, our vision is to help people experience the beauty of Pakistan with confidence, comfort, and genuine care.</p>
            <p>From the first conversation to the final day of your trip, we believe every detail matters. Our goal is to make travel planning straightforward, create memorable experiences, and help every traveller feel welcomed and looked after.</p>
            <p>Thank you for considering us for your next adventure. We look forward to helping you discover Pakistan, one unforgettable journey at a time.</p>
          </div>
        </div>
        <div className="mt-8 border-t border-slate-800 pt-5"><p className="font-bold text-white">Shabeer Ahmad</p><p className="mt-1 text-sm text-emerald-300">Founder &amp; CEO, My Pakistan Trips</p></div>
      </motion.div>
    </div>
  </section>
);

export default FounderNote;
