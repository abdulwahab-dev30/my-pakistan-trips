import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Star, Quote } from 'lucide-react';

const TESTIMONIALS = [
  {
    id: 1,
    name: "Ahmed Khan",
    trip: "Skardu & Hunza Autumn Special",
    rating: 5,
    comment: "An absolute masterpiece of a journey! The hotels, transport, and overall management by My Pakistan Trips were top-notch."
  },
  {
    id: 2,
    name: "Ayesha Malik",
    trip: "5 Days Trip to Hunza Valley",
    rating: 5,
    comment: "Safety and comfort were up to the mark. Our tour captain was extremely cooperative and informative throughout the trip."
  },
  {
    id: 3,
    name: "Usman Ali",
    trip: "3 Days Trip to Naran & Shogran",
    rating: 5,
    comment: "Lake Saif-ul-Malook and Babusar Top views were breathtaking. Highly recommend their services to everyone!"
  }
];

export const Testimonials: React.FC = () => {
  return (
    <section className="py-24 bg-slate-950 text-white relative overflow-hidden">
      {/* Background Decorative Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <motion.span 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-semibold uppercase tracking-wider"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Guest Voices
          </motion.span>

          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-5xl font-extrabold tracking-tight"
          >
            What Our Travelers <br />
            <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
              Say About Us
            </span>
          </motion.h2>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {TESTIMONIALS.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl relative flex flex-col justify-between shadow-xl group hover:border-emerald-500/50 transition-colors"
            >
              <Quote className="w-10 h-10 text-emerald-500/20 absolute top-6 right-6" />

              <div className="space-y-4">
                {/* Stars Rating */}
                <div className="flex items-center gap-1">
                  {[...Array(item.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>

                <p className="text-slate-300 text-sm font-light leading-relaxed">
                  "{item.comment}"
                </p>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-800/80">
                <h4 className="text-base font-bold text-white">{item.name}</h4>
                <p className="text-xs text-emerald-400 font-medium mt-0.5">{item.trip}</p>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default Testimonials;