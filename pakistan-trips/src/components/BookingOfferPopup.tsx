import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Check, Sparkles, X } from "lucide-react";

export default function BookingOfferPopup() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Show the offer whenever the homepage loads.
    setIsOpen(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-slate-950/70 p-3 backdrop-blur-sm sm:p-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setIsOpen(false);
          }}
          role="presentation"
        >
          <motion.section
            role="dialog"
            aria-modal="true"
            aria-labelledby="booking-offer-title"
            aria-describedby="booking-offer-description"
            className="relative my-auto w-full max-w-sm overflow-hidden rounded-2xl border border-white/15 bg-white text-slate-900 shadow-2xl sm:max-w-md sm:rounded-3xl"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
          >
            <div className="relative overflow-hidden bg-gradient-to-br from-emerald-700 via-emerald-600 to-teal-600 px-5 pb-5 pt-6 text-center text-white sm:px-9 sm:pb-8 sm:pt-9">
              <div className="pointer-events-none absolute -right-12 -top-14 h-44 w-44 rounded-full border-[24px] border-white/10" />
              <div className="pointer-events-none absolute -bottom-20 -left-10 h-40 w-40 rounded-full bg-teal-400/20 blur-2xl" />
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="absolute right-2 top-2 z-10 rounded-full p-2 text-white/80 transition hover:bg-white/15 hover:text-white focus:outline-none focus:ring-2 focus:ring-white sm:right-4 sm:top-4"
                aria-label="Close booking offer"
              >
                <X className="h-5 w-5" />
              </button>
              <div className="relative mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-white/25 bg-white/15 shadow-lg backdrop-blur sm:mb-4 sm:h-14 sm:w-14 sm:rounded-2xl">
                <Sparkles className="h-5 w-5 sm:h-7 sm:w-7" aria-hidden="true" />
              </div>
              <p className="relative mb-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-50 sm:mb-2 sm:text-xs sm:tracking-[0.22em]">
                A special offer for you
              </p>
              <h2 id="booking-offer-title" className="relative text-2xl font-bold leading-tight sm:text-4xl">
                Your next adventure,
                <span className="mt-0.5 block text-amber-200 sm:mt-1">15% OFF</span>
              </h2>
              <p className="relative mx-auto mt-2 max-w-xs text-xs leading-5 text-white/90 sm:mt-3 sm:text-sm sm:leading-6">
                Book your tour directly on our website and get an extra 5% off on top of our existing 10% discount.
              </p>
            </div>

            <div className="px-5 pb-5 pt-4 sm:px-9 sm:pb-7 sm:pt-6">
              <div className="mb-4 flex items-start gap-2.5 rounded-xl bg-emerald-50 p-3 sm:mb-5 sm:gap-3 sm:rounded-2xl sm:p-4">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white sm:h-6 sm:w-6">
                  <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </span>
                <div>
                  <p className="font-semibold text-slate-900">Book direct. Save more.</p>
                  <p id="booking-offer-description" className="mt-1 text-xs leading-4 text-slate-600 sm:text-sm sm:leading-5">
                    Explore our Pakistan tour packages and plan your getaway.
                  </p>
                </div>
              </div>
              <a
                href="/tours"
                onClick={() => setIsOpen(false)}
                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-center text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition duration-200 hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-emerald-700/30 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2 sm:px-5 sm:py-3.5 sm:text-base"
              >
                Explore Tour Packages
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 sm:h-5 sm:w-5" />
              </a>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="mt-1 w-full rounded-xl px-4 py-2 text-xs font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 sm:mt-3 sm:py-2.5 sm:text-sm"
              >
                Maybe later
              </button>
            </div>
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
