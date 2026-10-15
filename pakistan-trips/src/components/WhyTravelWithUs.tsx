import React from 'react';
import { motion } from 'framer-motion';
import { Compass, ShieldCheck, Map, HeartHandshake, BadgeCheck, Clock3, Sparkles } from 'lucide-react';

const reasons = [
  {
    icon: Compass,
    title: 'Professional Tour Guides',
    description: 'Explore with knowledgeable, professional guides who help make your journey informative, comfortable, and memorable.',
    number: '01',
  },
  {
    icon: ShieldCheck,
    title: 'Safe & Reliable Travel',
    description: 'Travel with a team that puts your comfort, safety, and peace of mind first.',
    number: '02',
  },
  {
    icon: Map,
    title: 'Local Destination Expertise',
    description: 'Explore Pakistan with thoughtful itineraries and guidance from people who know the routes.',
    number: '03',
  },
  {
    icon: HeartHandshake,
    title: 'Personalized Packages',
    description: 'Choose a trip that fits your interests, schedule, and group—not a one-size-fits-all plan.',
    number: '04',
  },
  {
    icon: BadgeCheck,
    title: 'Comfort You Can Count On',
    description: 'We focus on dependable arrangements, comfortable stays, and a smoother travel experience.',
    number: '05',
  },
  {
    icon: Clock3,
    title: 'Clear Trip Planning',
    description: 'Get helpful details about itineraries, inclusions, departure points, and booking before you go.',
    number: '06',
  },
];

const WhyTravelWithUs: React.FC = () => (
  <section id="why-travel-with-us" className="relative overflow-hidden bg-slate-900/45 py-20 sm:py-24 text-white">
    <div className="pointer-events-none absolute -left-32 top-10 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />
    <div className="pointer-events-none absolute -right-32 bottom-0 h-72 w-72 rounded-full bg-teal-500/10 blur-3xl" />

    <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-12">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.45 }}
        className="mx-auto mb-12 max-w-3xl text-center sm:mb-16"
      >
        <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-emerald-300">
          <Sparkles className="h-4 w-4" />
          The My Pakistan Trips Difference
        </span>
        <h2 className="text-3xl font-extrabold tracking-tight sm:text-5xl">
          Why Travel <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">With Us?</span>
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-slate-300 sm:text-base">
          From your first enquiry to the journey home, we make discovering Pakistan simpler, more comfortable, and more memorable.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
        {reasons.map((reason, index) => {
          const Icon = reason.icon;
          return (
            <motion.article
              key={reason.number}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.4, delay: index % 3 * 0.06 }}
              className="group relative rounded-2xl border border-slate-800 bg-slate-950/70 p-6 transition-colors duration-300 hover:border-emerald-500/40 sm:p-7"
            >
              <div className="mb-6 flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 transition-colors group-hover:bg-emerald-500/15">
                  <Icon className="h-6 w-6" />
                </div>
                <span className="text-sm font-semibold tracking-widest text-slate-600">{reason.number}</span>
              </div>
              <h3 className="text-lg font-bold text-white sm:text-xl">{reason.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-400">{reason.description}</p>
              <div className="mt-6 h-0.5 w-10 rounded-full bg-emerald-500/60 transition-all duration-300 group-hover:w-16 group-hover:bg-emerald-400" />
            </motion.article>
          );
        })}
      </div>
    </div>
  </section>
);

export default WhyTravelWithUs;
