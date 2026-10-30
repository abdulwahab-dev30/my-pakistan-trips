import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, Sparkles, ArrowRight, SlidersHorizontal, ChevronLeft, ChevronRight, MapPin, Clock } from 'lucide-react';

// Import central JSON data
import tripData from '../data/trips-data.json';
import { tours } from '../data/tours.js';
import { getPublishedTours } from '../lib/tourRepository';
import { supabase, supabaseConfigured } from '../lib/supabase';
import TourImage from './TourImage';



export const Hero: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [publishedTours, setPublishedTours] = useState<any[]>([]);
  const [heroBackgroundImages, setHeroBackgroundImages] = useState<string[]>(['https://images.unsplash.com/photo-1611821824288-95e977eab064?auto=format&fit=crop&crop=entropy&w=1920&h=1200&q=85']);
  const [mobileHeroBackground, setMobileHeroBackground] = useState('https://images.unsplash.com/photo-1611821824288-95e977eab064?auto=format&fit=crop&crop=entropy&w=900&h=1600&q=85');
  const [backgroundIndex, setBackgroundIndex] = useState(0);

  // Load the same published tour records used by the homepage tour cards,
  // so the hero uses the exact same image URL/tag as the listing.
  useEffect(() => {
    let active = true;
    getPublishedTours().then((data) => {
      if (active) setPublishedTours(data);
    }).catch(() => {
      if (active) setPublishedTours([]);
    });
    return () => { active = false; };
  }, []);

  // Load the active hero artwork from Supabase. Static image URLs remain as a fast fallback.
  useEffect(() => {
    let active = true;
    if (!supabaseConfigured || !supabase) return;
    supabase.from('hero_content')
      .select('background_image_url,mobile_background_image_url')
      .eq('is_active', true)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data, error }) => {
        if (!active || error || !data?.background_image_url) return;
        setHeroBackgroundImages([data.background_image_url]);
        setMobileHeroBackground(data.mobile_background_image_url || data.background_image_url);
      });
    return () => { active = false; };
  }, []);

  // Keep desktop motion effects, but avoid costly parallax and entrance animations on phones.
  useEffect(() => {
    const media = window.matchMedia('(max-width: 767px)');
    const updateMobile = () => setIsMobile(media.matches);
    updateMobile();
    media.addEventListener('change', updateMobile);
    return () => media.removeEventListener('change', updateMobile);
  }, []);

  // Use a wide, high-resolution Hunza Valley landscape for the hero background.
  const rawPackages = tripData.trip_packages || [];

  // Combine package data with its Cloudinary image and default badges.
  const heroPackages = rawPackages.map((pkg: any, idx: number) => ({
    ...pkg,
    location: pkg.main_attractions?.[0] || "Northern Pakistan",
    tag: idx % 2 === 0 ? "Best Seller" : "Trending"
  }));
  const attractionCount = new Set(
    rawPackages.flatMap((pkg: any) => pkg.main_attractions || [])
      .map((name: string) => String(name).trim().toLowerCase())
      .filter(Boolean)
  ).size;
  const departureCityCount = Object.keys(tripData.pickup_points || {}).length;


  // Auto slide timer (5 seconds)
  useEffect(() => {
    if (isPaused || heroPackages.length === 0) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % heroPackages.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [isPaused, heroPackages.length]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % heroPackages.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + heroPackages.length) % heroPackages.length);
  };

  const currentPkg = heroPackages[currentIndex] || heroPackages[0];
  const normalizeTitle = (value?: string) => (value || "").toLowerCase().replace(/[^a-z0-9]+/g, "");
  const currentCmsTour = publishedTours.find(
    (tour) => normalizeTitle(tour.title) === normalizeTitle(currentPkg?.title)
  );
  // Tour-card prices must come only from the Supabase CMS, never from static fallback JSON.
  const currentTour = currentCmsTour || tours.find(
    (tour) => normalizeTitle(tour.title) === normalizeTitle(currentPkg?.title)
  );
  const currentStartingPrice = supabaseConfigured
    ? currentCmsTour?.pricingOptions?.standard_4_5_sharing ||
      currentCmsTour?.pricing_options?.standard_4_5_sharing ||
      currentCmsTour?.pricing?.standard_4_5_sharing ||
      currentCmsTour?.priceNote ||
      "Price unavailable"
    : "Price unavailable";

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.3 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] }
    }
  };

  return (
    <section className="relative min-h-[88svh] w-full overflow-hidden bg-[#061510] text-white sm:min-h-[92svh]">
      {/* Full-bleed scenic artwork */}
      <div className="absolute inset-0 z-0">
        {heroBackgroundImages.map((image, index) => (
          <React.Fragment key={image}>
            <motion.img
              src={mobileHeroBackground}
              alt=""
              aria-hidden="true"
              width={900}
              height={1600}
              fetchPriority="high"
              loading="eager"
              decoding="async"
              animate={{ opacity: index === backgroundIndex ? 1 : 0 }}
              transition={{ duration: 1.2, ease: "easeInOut" }}
              className="absolute inset-0 block h-full w-full object-cover object-center sm:hidden"
            />
            <motion.img
              src={image}
              alt=""
              aria-hidden="true"
              width={1920}
              height={1200}
              fetchPriority="auto"
              loading="eager"
              decoding="async"
              animate={{ opacity: index === backgroundIndex ? 1 : 0 }}
              transition={{ duration: 1.2, ease: "easeInOut" }}
              className="absolute inset-0 hidden h-full w-full object-cover object-center sm:block"
            />
          </React.Fragment>
        ))}
        <div className="absolute inset-0 bg-gradient-to-r from-[#061510]/80 via-[#061510]/35 to-[#061510]/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-transparent to-slate-950/35" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_18%_80%,rgba(16,185,129,0.20),transparent_48%)]" />
      </div>

      {/* Reference composition: left headline, small centered tour tile, right-side trust badge */}
      <div className="relative z-10 mx-auto grid min-h-[88svh] max-w-[1440px] grid-cols-1 items-center gap-7 px-6 py-16 sm:min-h-[92svh] sm:px-10 lg:grid-cols-12 lg:gap-5 lg:px-12 lg:py-20">
        <motion.div
          className="lg:col-span-4"
          variants={containerVariants}
          initial={isMobile ? false : "hidden"}
          animate="visible"
        >
          <motion.div variants={itemVariants} className="mb-5 inline-flex">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3.5 py-2 text-[10px] font-semibold tracking-wide text-emerald-100 shadow-lg backdrop-blur-xl sm:text-xs">
              <Sparkles className="h-3.5 w-3.5 text-emerald-300" />
              A MORE PERSONAL WAY TO EXPLORE PAKISTAN
            </span>
          </motion.div>
          <motion.h1
            variants={itemVariants}
            className="max-w-xl text-[2.8rem] font-extrabold leading-[1.01] tracking-[-0.05em] drop-shadow-xl sm:text-6xl lg:text-[4.15rem]"
          >
            Travel <br />
            Beyond the <br />
            <span className="bg-gradient-to-r from-emerald-300 via-teal-200 to-white bg-clip-text text-transparent">
              Expected.
            </span>
          </motion.h1>
          <motion.p
            variants={itemVariants}
            className="mt-5 max-w-md text-sm font-light leading-relaxed text-slate-100/90 sm:text-base"
          >
            Journey through Hunza, Skardu, Naran and Pakistan’s most breathtaking landscapes with thoughtfully planned tours and unforgettable local experiences.
          </motion.p>
          <motion.div variants={itemVariants} className="mt-6 flex flex-wrap items-center gap-3">
            <motion.a
              href="#tours"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-emerald-300 to-teal-400 px-5 py-3 text-xs font-bold text-slate-950 shadow-xl shadow-emerald-950/40 transition-all hover:shadow-emerald-500/30 sm:text-sm"
            >
              Explore Journeys
              <ArrowRight className="h-4 w-4" />
            </motion.a>
            <a
              href="#contact-form"
              className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-3 text-xs font-semibold text-white backdrop-blur-xl transition hover:bg-white/20 sm:text-sm"
            >
              Plan Your Trip
            </a>
          </motion.div>
        </motion.div>

        {currentPkg && (
          <div
            role="region"
            aria-label={`Featured tour ${currentIndex + 1} of ${heroPackages.length}`}
            className="mx-auto w-[218px] sm:w-[245px] lg:col-span-3 lg:col-start-6 lg:mx-0 lg:mt-16"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            <div className="relative rounded-[1.25rem] border-[3px] border-white/90 bg-white p-1.5 text-slate-900 shadow-[0_25px_75px_-20px_rgba(0,0,0,0.8)]">
              <div className="relative h-[145px] overflow-hidden rounded-[0.9rem] bg-slate-200 sm:h-[165px]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentPkg.title}
                    initial={isMobile ? false : { opacity: 0, scale: 1.03 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.35 }}
                    className="absolute inset-0"
                  >
                    <TourImage
                      src={currentTour?.images?.[0]?.src}
                      tag={currentTour?.imageTag || currentTour?.images?.[0]?.tag}
                      alt={currentTour?.images?.[0]?.alt || `Scenic landscape for ${currentPkg.title}`}
                      className="h-full w-full object-cover"
                      loading="eager"
                    />
                  </motion.div>
                </AnimatePresence>
                <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/70 to-transparent px-2 pb-2 pt-5 text-[9px] font-semibold text-white">
                  <span className="flex items-center gap-1"><Sparkles className="h-3 w-3 text-emerald-300" /> Featured tour</span>
                  <span>{currentPkg.tag}</span>
                </div>
              </div>
              <div className="flex items-center justify-between gap-2 px-2 pb-2 pt-2.5">
                <div className="min-w-0">
                  <p className="line-clamp-1 text-[11px] font-bold leading-tight">{currentPkg.title}</p>
                  <p className="mt-0.5 line-clamp-1 text-[9px] text-slate-500">{currentPkg.location} · {currentPkg.duration}</p>
                </div>
                <a
                  href={currentTour ? `/tours/${currentTour.slug}` : "/tours"}
                  aria-label={`View ${currentPkg.title}`}
                  className="shrink-0 rounded-full bg-emerald-500 p-2 text-slate-950 transition hover:bg-emerald-400"
                >
                  <ArrowRight className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
            <div className="mt-2 flex items-center justify-center gap-3 text-white">
              <button onClick={handlePrev} aria-label="Previous featured tour" className="rounded-full border border-white/50 bg-black/25 p-1.5 backdrop-blur transition hover:bg-emerald-500 hover:text-slate-950">
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              <div className="flex items-center gap-1">
                {heroPackages.map((_, idx) => (
                  <button key={idx} onClick={() => setCurrentIndex(idx)} aria-label={`Show tour ${idx + 1}`} className={`h-1.5 rounded-full transition-all ${idx === currentIndex ? "w-5 bg-emerald-300" : "w-1.5 bg-white/60"}`} />
                ))}
              </div>
              <button onClick={handleNext} aria-label="Next featured tour" className="rounded-full border border-white/50 bg-black/25 p-1.5 backdrop-blur transition hover:bg-emerald-500 hover:text-slate-950">
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}

        <div className="mx-auto hidden w-full max-w-[205px] lg:col-span-2 lg:col-start-11 lg:mb-1 lg:block">
          <div className="rounded-2xl border border-white/20 bg-black/35 p-3.5 text-white shadow-xl backdrop-blur-xl">
            <div className="flex items-center gap-1.5">
              <div className="flex -space-x-2">
                {[0,1,2].map((n) => <span key={n} className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#173c30] bg-emerald-200 text-[9px] font-bold text-[#062d24]">{["M","A","T"][n]}</span>)}
              </div>
              <span className="text-lg font-semibold">Trusted</span>
            </div>
            <p className="mt-2 text-[10px] leading-relaxed text-white/80">Thoughtfully planned journeys across Pakistan’s most beautiful places.</p>
          </div>
        </div>
      </div>
    </section>
  );

};

export default Hero;