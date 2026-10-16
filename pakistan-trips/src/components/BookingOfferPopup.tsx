import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Sparkles, X } from "lucide-react";

const offerImage =
  "https://images.unsplash.com/photo-1514558427911-8e293bebf18c?auto=format&fit=crop&w=1000&q=80";

export default function BookingOfferPopup() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setIsOpen(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    // Lock background scrolling while the popup is visible, and restore both
    // document elements on every close/unmount (important for mobile browsers).
    const body = document.body;
    const html = document.documentElement;
    const previousBodyOverflow = body.style.overflow;
    const previousHtmlOverflow = html.style.overflow;

    body.style.overflow = "hidden";
    html.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      body.style.overflow = previousBodyOverflow;
      html.style.overflow = previousHtmlOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-slate-950/75 p-3 backdrop-blur-[3px] sm:p-5"
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
            className="relative my-auto w-full max-w-[340px] overflow-hidden rounded-[22px] border border-white/15 bg-[#0c1718] text-white shadow-[0_24px_90px_rgba(0,0,0,0.5)] sm:max-w-sm sm:rounded-[28px]"
            initial={{ opacity: 0, y: 18, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            <div className="relative h-[142px] overflow-hidden sm:h-[168px]">
              <img
                src={offerImage}
                alt="Scenic mountains in northern Pakistan"
                className="h-full w-full object-cover object-center"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0c1718] via-[#0c1718]/15 to-black/20" />
              <div className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-black/30 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-white backdrop-blur-md sm:left-5 sm:top-5">
                <Sparkles className="h-3 w-3 text-amber-300" />
                Website exclusive
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="absolute right-3 top-3 rounded-full border border-white/25 bg-black/35 p-2 text-white backdrop-blur-md transition hover:bg-black/60 focus:outline-none focus:ring-2 focus:ring-white"
                aria-label="Close booking offer"
              >
                <X className="h-4 w-4" />
              </button>
              <div className="absolute bottom-3 left-5 right-5 sm:bottom-4 sm:left-6 sm:right-6">
                <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-emerald-200 sm:text-[11px]">
                  Your Pakistan escape starts here
                </p>
              </div>
            </div>

            <div className="px-5 pb-5 pt-1 sm:px-6 sm:pb-6">
              <div className="flex items-end justify-between gap-3">
                <div className="min-w-0">
                  <h2 id="booking-offer-title" className="text-[27px] font-bold leading-none tracking-tight sm:text-3xl">
                    Get <span className="text-amber-300">15% OFF</span>
                  </h2>
                  <p className="mt-2 text-xs leading-5 text-slate-300 sm:text-sm">
                    Book directly on our website and save more.
                  </p>
                </div>
                <div className="shrink-0 rounded-xl border border-amber-300/30 bg-amber-300/10 px-2.5 py-2 text-center">
                  <span className="block text-xl font-extrabold leading-none text-amber-300">+5%</span>
                  <span className="mt-1 block text-[9px] font-semibold uppercase tracking-wide text-amber-100/80">Extra off</span>
                </div>
              </div>

              <div className="my-4 h-px bg-white/10 sm:my-5" />
              <p id="booking-offer-description" className="mb-4 text-xs leading-5 text-slate-400 sm:mb-5 sm:text-[13px]">
                Enjoy our existing 10% discount, plus an extra 5% when you book your tour with us online.
              </p>

              <a
                href="/tours"
                onClick={() => setIsOpen(false)}
                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-400 px-4 py-3 text-sm font-bold text-[#06251c] transition hover:bg-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:ring-offset-2 focus:ring-offset-[#0c1718] sm:py-3.5"
              >
                Explore Tour Packages
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </a>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="mt-2 w-full py-1.5 text-xs font-medium text-slate-400 transition hover:text-white"
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
