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
    <section className="relative bg-[#061510] px-3 py-4 sm:px-6 sm:py-7 lg:px-8">
      <div className="relative isolate mx-auto min-h-[780px] max-w-[1500px] overflow-hidden rounded-[1.6rem] border border-white/10 bg-slate-950 text-white shadow-2xl sm:min-h-[650px] sm:rounded-[2rem] lg:min-h-[680px]">
        {/* Full-bleed scenic background inside the framed hero */}
        <div className="absolute inset-0 -z-20">
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
        </div>
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#061510]/90 via-[#061510]/55 to-[#061510]/15" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-slate-950/85 via-transparent to-slate-950/20" />
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_15%_75%,rgba(16,185,129,0.22),transparent_45%)]" />

        {/* Layout follows the supplied reference: copy left, compact featured tour center, trust panel right */}
        <div className="relative grid min-h-[780px] grid-cols-1 content-start gap-8 px-6 pb-7 pt-14 sm:min-h-[650px] sm:px-10 sm:py-12 lg:min-h-[680px] lg:grid-cols-12 lg:items-center lg:gap-5 lg:px-12 lg:py-14">
          <motion.div
            className="lg:col-span-5 lg:pr-5"
            variants={containerVariants}
            initial={isMobile ? false : "hidden"}
            animate="visible"
          >
            <motion.div variants={itemVariants} className="mb-5 inline-flex">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-2 text-[10px] font-semibold tracking-wide text-emerald-100 shadow-lg backdrop-blur-xl sm:text-xs">
                <Sparkles className="h-3.5 w-3.5 text-emerald-300" />
                A MORE PERSONAL WAY TO EXPLORE PAKISTAN
              </span>
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="max-w-[620px] text-[2.7rem] font-extrabold leading-[1.02] tracking-[-0.045em] drop-shadow-lg sm:text-6xl lg:text-[4.1rem]"
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
              Journey through Hunza, Skardu, Naran and Pakistan’s most breathtaking landscapes with thoughtfully planned tours and memorable local experiences.
            </motion.p>

            <motion.div variants={itemVariants} className="mt-6 flex flex-wrap items-center gap-3">
              <motion.a
                href="#tours"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className="inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-emerald-300 to-teal-400 px-6 py-3.5 text-sm font-bold text-slate-950 shadow-xl shadow-emerald-950/40 transition-all hover:shadow-emerald-500/30"
              >
                Explore Journeys
                <ArrowRight className="h-4 w-4" />
              </motion.a>
              <a
                href="#contact-form"
                className="hidden items-center gap-2 rounded-full border border-white/30 bg-white/10 px-5 py-3.5 text-sm font-semibold text-white backdrop-blur-xl transition hover:bg-white/20 sm:inline-flex"
              >
                Plan Your Trip
              </a>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="mt-7 grid max-w-md grid-cols-3 gap-4 border-t border-white/25 pt-5 sm:mt-9"
            >
              <div>
                <p className="text-2xl font-bold text-white">{heroPackages.length}+</p>
                <p className="mt-1 text-[10px] text-slate-200/75 sm:text-xs">Tour Packages</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{Math.floor(attractionCount / 10) * 10}+</p>
                <p className="mt-1 text-[10px] text-slate-200/75 sm:text-xs">Places to Explore</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{departureCityCount}</p>
                <p className="mt-1 text-[10px] text-slate-200/75 sm:text-xs">Pickup Locations</p>
              </div>
            </motion.div>
          </motion.div>

          {currentPkg && (
            <div
              role="region"
              aria-label={`Featured tour package ${currentIndex + 1} of ${heroPackages.length}`}
              className="mx-auto w-full max-w-[250px] lg:col-span-3 lg:col-start-7 lg:mx-0 lg:mt-8 lg:max-w-[230px]"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              <div className="rounded-[1.35rem] border border-white/70 bg-white p-2.5 text-slate-900 shadow-[0_25px_70px_-20px_rgba(0,0,0,0.75)]">
                <div className="relative h-[170px] overflow-hidden rounded-[1rem] bg-slate-200 sm:h-[190px]">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentPkg.title}
                      initial={isMobile ? false : { opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.3 }}
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
                  <span className="absolute bottom-2 left-2 rounded-full bg-black/60 px-2 py-1 text-[9px] font-semibold text-white backdrop-blur">
                    {currentPkg.tag}
                  </span>
                </div>
                <div className="px-2 pb-1 pt-3">
                  <p className="line-clamp-1 text-xs font-bold">{currentPkg.title}</p>
                  <p className="mt-0.5 line-clamp-1 text-[10px] text-slate-500">{currentPkg.location} · {currentPkg.duration}</p>
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-[9px] uppercase tracking-wide text-slate-400">Starting from</p>
                      <p className="truncate text-xs font-extrabold text-emerald-700">{currentStartingPrice}</p>
                    </div>
                    <a
                      href={currentTour ? `/tours/${currentTour.slug}` : "/tours"}
                      className="shrink-0 rounded-full bg-emerald-500 p-2 text-slate-950 transition hover:bg-emerald-400"
                      aria-label={`View ${currentPkg.title}`}
                    >
                      <ArrowRight className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-center gap-3">
                <button onClick={handlePrev} className="rounded-full border border-white/30 bg-black/25 p-2 text-white backdrop-blur transition hover:bg-emerald-500 hover:text-slate-950" aria-label="Previous tour">
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <div className="flex items-center gap-1.5">
                  {heroPackages.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentIndex(idx)}
                      aria-label={`Show tour ${idx + 1}`}
                      className={`h-1.5 rounded-full transition-all ${idx === currentIndex ? "w-6 bg-emerald-300" : "w-1.5 bg-white/60"}`}
                    />
                  ))}
                </div>
                <button onClick={handleNext} className="rounded-full border border-white/30 bg-black/25 p-2 text-white backdrop-blur transition hover:bg-emerald-500 hover:text-slate-950" aria-label="Next tour">
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          <div className="hidden lg:col-span-3 lg:col-start-10 lg:flex lg:items-end lg:justify-end lg:self-end">
            <div className="max-w-[210px] rounded-2xl border border-white/20 bg-black/30 p-4 text-white shadow-xl backdrop-blur-xl">
              <p className="text-xs font-semibold text-emerald-200">Made for memorable journeys</p>
              <p className="mt-2 text-sm leading-relaxed text-white/90">Explore curated trips, beautiful destinations and experiences across Pakistan.</p>
              <a href="#tours" className="mt-3 inline-flex items-center gap-2 text-xs font-bold text-emerald-300 hover:text-white">
                Discover packages <ArrowRight className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );

};

export default Hero;