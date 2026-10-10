import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Compass, Sparkles } from 'lucide-react';

// Fetola path ye go šomiša leina le lefsa la faele ya JSON
import tripData from '../data/trips-data.json';
import { PackageCard } from './PackageCard';
import { PackageModal } from './PackageModal';

export const Tours: React.FC = () => {
  const [selectedPackage, setSelectedPackage] = useState<any | null>(null);

  const packages = tripData.trip_packages || [];

  return (
    <section id="tours" className="py-24 bg-slate-950 text-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
        
        {/* Section Title */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <motion.span 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-semibold uppercase tracking-wider"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Curated Tour Packages
          </motion.span>

          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-5xl font-extrabold tracking-tight"
          >
            Choose Your Next <br />
            <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
              Unforgettable Adventure
            </span>
          </motion.h2>
        </div>

        {/* Dynamic Grid of Package Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {packages.map((pkg: any, index: number) => (
            <PackageCard 
              key={index} 
              pkg={pkg} 
              onSelect={(p) => setSelectedPackage(p)} 
            />
          ))}
        </div>

      </div>

      {/* Detail Modal Component */}
      {selectedPackage && (
        <PackageModal 
          pkg={selectedPackage} 
          companyInfo={tripData} 
          onClose={() => setSelectedPackage(null)} 
        />
      )}
    </section>
  );
};

export default Tours;