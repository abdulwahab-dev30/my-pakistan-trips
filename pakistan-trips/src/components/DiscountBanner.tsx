import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Sparkles, Tag } from "lucide-react";

const offerMessages = [
  "10% OFF ALL TOUR PACKAGES",
  "Your next adventure starts with a little saving",
  "Explore Pakistan's mountains, valleys and lakes for less",
];

const DiscountBanner: React.FC = () => {
  const reduceMotion = useReducedMotion();

  return (
    <section
      aria-label="Special offer: 10 percent off all tour packages"
      className="relative z-40 overflow-hidden border-y border-emerald-300/20 bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-700 text-white shadow-lg shadow-emerald-950/20"
    >
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6 lg:px-12">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/20">
          <Tag className="h-4 w-4" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1 overflow-hidden">
          <motion.div
            className="flex w-max items-center gap-8 whitespace-nowrap"
            animate={reduceMotion ? undefined : { x: ["0%", "-35%"] }}
            transition={reduceMotion ? undefined : { duration: 24, ease: "linear", repeat: Infinity }}
          >
            {[...offerMessages, ...offerMessages].map((message, index) => (
              <span key={`${message}-${index}`} className="inline-flex items-center gap-2">
                {index % offerMessages.length === 0 ? (
                  <strong className="text-sm font-extrabold tracking-wide sm:text-base">{message}</strong>
                ) : (
                  <span className="text-sm font-medium text-emerald-50 sm:text-base">{message}</span>
                )}
                <Sparkles className="h-4 w-4 shrink-0 text-amber-200" aria-hidden="true" />
              </span>
            ))}
          </motion.div>
        </div>
        <a
          href="#tours"
          className="inline-flex shrink-0 items-center gap-1 rounded-full bg-white px-3 py-2 text-xs font-bold text-emerald-800 transition hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:px-4 sm:text-sm"
          aria-label="Explore tour packages and see the 10 percent offer"
        >
          <span className="hidden sm:inline">Explore tours</span>
          <span className="sm:hidden">Explore</span>
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </a>
      </div>
    </section>
  );
};

export default DiscountBanner;
