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
    <section className="relative min-h-[88svh] sm:min-h-[92svh] w-full overflow-hidden bg-[#061510] text-white">
      {/* Full-width cinematic background — no framed container or tour card */}
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
        <div className="absolute inset-0 bg-gradient-to-r from-[#061510]/85 via-[#061510]/45 to-[#061510]/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/25" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_12%_78%,rgba(16,185,129,0.22),transparent_48%)]" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-[88svh] max-w-7xl items-center px-6 py-16 sm:min-h-[92svh] sm:px-10 lg:px-16">
        <motion.div
          className="w-full max-w-2xl"
          variants={containerVariants}
          initial={isMobile ? false : "hidden"}
          animate="visible"
        >
          <motion.div variants={itemVariants} className="mb-6 inline-flex">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-[10px] font-semibold tracking-wide text-emerald-100 shadow-lg backdrop-blur-xl sm:text-xs">
              <Sparkles className="h-4 w-4 text-emerald-300" />
              A MORE PERSONAL WAY TO EXPLORE PAKISTAN
            </span>
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="max-w-2xl text-[3.1rem] font-extrabold leading-[0.99] tracking-[-0.05em] drop-shadow-xl sm:text-6xl lg:text-[5.25rem]"
          >
            Travel <br />
            Beyond the <br />
            <span className="bg-gradient-to-r from-emerald-300 via-teal-200 to-white bg-clip-text text-transparent">
              Expected.
            </span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="mt-6 max-w-lg text-sm font-light leading-relaxed text-slate-100/90 sm:text-base lg:text-lg"
          >
            Journey through Hunza, Skardu, Naran and Pakistan’s most breathtaking landscapes with thoughtfully planned tours and unforgettable local experiences.
          </motion.p>

          <motion.div variants={itemVariants} className="mt-7 flex flex-wrap items-center gap-3">
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
              className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-5 py-3.5 text-sm font-semibold text-white backdrop-blur-xl transition hover:bg-white/20"
            >
              Plan Your Trip
            </a>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="mt-9 grid max-w-lg grid-cols-3 gap-4 border-t border-white/25 pt-5 sm:mt-12 sm:gap-7"
          >
            <div>
              <p className="text-2xl font-bold text-white sm:text-3xl">{heroPackages.length}+</p>
              <p className="mt-1 text-[10px] text-slate-200/80 sm:text-xs">Tour Packages</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white sm:text-3xl">{Math.floor(attractionCount / 10) * 10}+</p>
              <p className="mt-1 text-[10px] text-slate-200/80 sm:text-xs">Places to Explore</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white sm:text-3xl">{departureCityCount}</p>
              <p className="mt-1 text-[10px] text-slate-200/80 sm:text-xs">Pickup Locations</p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );

};

export default Hero;