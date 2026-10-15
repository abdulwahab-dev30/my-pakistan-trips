import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ShieldCheck, Award, Users, Compass } from 'lucide-react';

// Import JSON file for official company details
import tripData from '../data/trips-data.json';
import { useContactInfo } from '../lib/contactInfo';

export const About: React.FC = () => {
  const contact = useContactInfo();
  return (
    <section id="about" className="py-24 bg-slate-950 text-white relative overflow-hidden">
      {/* Background Decorative Glow */}
      <div className="absolute top-1/3 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Side: Visual Experience Card */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-6 relative"
          >
            <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-emerald-500 to-teal-500 opacity-30 blur-2xl -z-10" />
            
            <div className="relative rounded-3xl overflow-hidden border border-slate-800 bg-slate-900/60 backdrop-blur-xl p-4 sm:p-6 shadow-2xl">
              <div className="relative h-80 sm:h-96 rounded-2xl overflow-hidden group">
                <img height={600} width={800} 
                  src="https://images.unsplash.com/photo-1586375300773-8384e3e4916f?auto=format&fit=crop&q=80&w=1000" 
                  alt="Northern Pakistan Landscape"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent" />
                
                {/* Floating Official Badge */}
                <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-slate-900/80 backdrop-blur-md border border-slate-700/80">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">Registered & Licensed Agency</h4>
                      <p className="text-xs text-emerald-400 font-medium">License No: {contact.license_number}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Side: Philosophy Content */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-6 space-y-6"
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              Our Philosophy
            </span>

            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-[1.1]">
              Redefining Travel Across <br />
              <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
                The Valleys of Pakistan
              </span>
            </h2>

            <p className="text-slate-300 text-sm sm:text-base font-light leading-relaxed">
              Operating as <strong className="text-white font-semibold">{contact.company_name}</strong>, hamara maqsad har traveler ko safe, comfortable aur memorable adventures provide karna hai. Hum believe karte hain ke safar sirf aik destination par pohochne ka naam nahi, balkay raaste ke har lamhe ko enjoy karne ka tajurba hai.
            </p>

            {/* Core Pillars Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 w-fit mb-3 border border-emerald-500/20">
                  <Compass className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white mb-1">Expert Guidance</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Experienced tour captains jo har valley aur route ki mukammal maloomat rakhte hain.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 w-fit mb-3 border border-emerald-500/20">
                  <Award className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white mb-1">Quality Stays</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Top-rated hotels aur comfortable transport jo aapke trip ko tension-free banate hain.
                </p>
              </div>
            </div>

            {/* Official Company Address info */}
            <div className="pt-4 border-t border-slate-800 text-xs text-slate-400">
              <p>🏢 <strong className="text-slate-300">Head Office:</strong> {contact.address}</p>
            </div>

          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default About;