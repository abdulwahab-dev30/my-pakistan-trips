import React from 'react';
import { motion } from 'framer-motion';
import { Compass, Sparkles } from 'lucide-react';

export const Loader: React.FC = () => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950 text-white overflow-hidden">
      {/* Background Decorative Glow */}
      <div className="absolute w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none animate-pulse" />

      <div className="relative z-10 flex flex-col items-center space-y-6 px-6 text-center">
        
        {/* Animated Compass Icon Container */}
        <div className="relative flex items-center justify-center">
          {/* Outer Pulsing Ring */}
          <motion.div 
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute w-24 h-24 rounded-full border border-emerald-500/40 bg-emerald-500/10"
          />

          {/* Rotating Compass Circle */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl shadow-2xl shadow-emerald-500/20 text-emerald-400"
          >
            <Compass className="w-10 h-10" />
          </motion.div>
        </div>

        {/* Brand & Loading Text */}
        <div className="space-y-2">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-1.5 text-xs font-semibold text-emerald-400 uppercase tracking-widest"
          >
            <Sparkles className="w-3.5 h-3.5" />
            My Pakistan Trips
          </motion.div>

          <motion.h3 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl sm:text-2xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent"
          >
            Preparing Your Adventure...
          </motion.h3>
        </div>

        {/* Animated Progress Bar */}
        <div className="w-48 h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800/80 relative">
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="w-full h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 rounded-full"
          />
        </div>

      </div>
    </div>
  );
};

export default Loader;