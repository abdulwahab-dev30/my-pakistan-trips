import React from 'react';
import { motion } from 'framer-motion';
import { Clock, MapPin, Calendar, ArrowRight, CheckCircle2 } from 'lucide-react';

interface PackageCardProps {
  pkg: any;
  onSelect: (pkg: any) => void;
}

export const PackageCard: React.FC<PackageCardProps> = ({ pkg, onSelect }) => {
  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3 }}
      className="rounded-3xl bg-slate-900/70 border border-slate-800/90 hover:border-emerald-500/50 backdrop-blur-xl overflow-hidden shadow-xl flex flex-col justify-between group"
    >
      <div className="p-6 space-y-4">
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2">
          <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> {pkg.duration}
          </span>
          <span className="text-[11px] text-slate-400 truncate max-w-[150px]">
            {pkg.departure}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-white group-hover:text-emerald-400 transition-colors line-clamp-2">
          {pkg.title}
        </h3>

        {/* Main Attractions Preview */}
        <div className="space-y-2 pt-1">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Key Attractions:</p>
          <div className="flex flex-wrap gap-1.5">
            {pkg.main_attractions?.slice(0, 5).map((attraction: string, idx: number) => (
              <span 
                key={idx}
                className="px-2.5 py-1 rounded-lg bg-slate-950/80 text-[11px] text-slate-300 border border-slate-800"
              >
                {attraction}
              </span>
            ))}
            {pkg.main_attractions?.length > 5 && (
              <span className="px-2 py-1 rounded-lg bg-emerald-500/10 text-[11px] text-emerald-400 font-medium">
                +{pkg.main_attractions.length - 5} more
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Card Footer */}
      <div className="p-6 pt-0 border-t border-slate-800/60 mt-4 flex items-center justify-between">
        <div>
          <p className="text-[10px] text-slate-400 uppercase tracking-wider">Per Head (4-5 Sharing)</p>
          <p className="text-lg font-bold text-emerald-400">
            {pkg.pricing?.standard_4_5_sharing || "Inquire"}
          </p>
        </div>

        <button
          onClick={() => onSelect(pkg)}
          className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-emerald-500 text-slate-200 hover:text-slate-950 font-semibold text-xs transition-all duration-300 flex items-center gap-1.5 group/btn"
        >
          <span>View Details</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
        </button>
      </div>
    </motion.div>
  );
};