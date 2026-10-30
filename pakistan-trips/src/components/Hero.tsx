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
    location: pkg.main_attractions?.[0] || "the Ordinary",
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
    <div className="relative min-h-[100svh] sm:min-h-[92svh] flex items-center justify-center overflow-hidden bg-slate-950 text-white pt-8 pb-10 sm:pt-24 sm:pb-10">
      {/* Background Parallax */}
      <div className="absolute inset-0 z-0">
        {heroBackgroundImages.map((image, index) => (
          <React.Fragment key={image}>
            {/* Dedicated portrait crop prevents the desktop landscape from being awkwardly cropped on phones. */}
            <motion.img
              src={mobileHeroBackground}
              alt=""
              aria-hidden={index !== backgroundIndex}
              width={900}
              height={1600}
              fetchPriority="high"
              loading="eager"
              decoding="async"
              animate={{ opacity: index === backgroundIndex ? 1 : 0 }}
              transition={{ duration: 1.2, ease: "easeInOut" }}
              className="absolute inset-0 block sm:hidden w-full h-full object-cover object-center scale-100 will-change-[opacity]"
            />
            <motion.img
              src={image}
              alt=""
              aria-hidden={index !== backgroundIndex}
              width={1920}
              height={1200}
              fetchPriority="auto"
              loading="eager"
              decoding="async"
              animate={{ opacity: index === backgroundIndex ? 1 : 0 }}
              transition={{ duration: 1.2, ease: "easeInOut" }}
              className="absolute inset-0 hidden sm:block w-full h-full object-cover object-center scale-100 sm:scale-105 will-change-[opacity]"
            />
          </React.Fragment>
        ))}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/35 via-[#061510]/55 to-slate-950/95 sm:bg-gradient-to-r sm:from-[#061510]/90 sm:via-slate-950/65 sm:to-slate-950/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-slate-950/15 sm:from-slate-950/90 sm:to-slate-950/35" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_18%_45%,rgba(16,185,129,0.18),transparent_42%)]" />
      </div>

      {/* Main Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-6 lg:px-12 py-0 sm:py-16 w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        
        {/* Left Side: Hero Text */}
        <motion.div 
          className="lg:col-span-7 space-y-6 sm:space-y-8"
          variants={containerVariants}
          initial={isMobile ? false : "hidden"}
          animate="visible"
        >
          <motion.div variants={itemVariants} className="inline-flex">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/20 bg-white/10 backdrop-blur-xl text-emerald-200 text-xs sm:text-sm font-semibold tracking-wide shadow-lg shadow-black/10">
              <Sparkles className="w-4 h-4 animate-pulse" />
              A MORE PERSONAL WAY TO EXPLORE PAKISTAN
            </span>
          </motion.div>

          <motion.h1 
            variants={itemVariants}
            className="text-[2.65rem] sm:text-6xl lg:text-[4.5rem] font-extrabold tracking-[-0.045em] leading-[1.06] drop-shadow-lg"
          >
            Pakistan, Beyond <br />
            <span className="bg-gradient-to-r from-emerald-300 via-teal-200 to-white bg-clip-text text-transparent">
              Northern Pakistan
            </span>
          </motion.h1>

          <motion.p 
            variants={itemVariants}
            className="text-base sm:text-lg lg:text-xl text-slate-200/95 max-w-xl font-light leading-relaxed"
          >
            Journey through Hunza, Skardu, Naran and the country’s most breathtaking landscapes. Thoughtfully planned tours, handpicked stays and local experiences — all in one place.
          </motion.p>

          <motion.div 
            variants={itemVariants}
            className="flex flex-wrap items-center gap-4 pt-2"
          >
            <motion.a
              href="#tours"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 sm:px-8 py-3.5 sm:py-4 rounded-full bg-gradient-to-r from-emerald-300 to-teal-400 text-slate-950 font-bold flex items-center gap-3 shadow-xl shadow-emerald-900/30 hover:shadow-emerald-500/30 transition-all duration-300"
            >
              Explore Our Tours
              <ArrowRight className="w-5 h-5" />
            </motion.a>

            <motion.a
              href="#contact-form"
              aria-label="Customize your Pakistan tour package"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 sm:px-7 py-3.5 sm:py-4 rounded-full bg-white/[0.07] border border-white/25 hover:bg-white/15 hover:border-white/40 text-white font-semibold flex items-center gap-3 backdrop-blur-xl transition-all duration-300"
            >
              <SlidersHorizontal className="w-4 h-4 text-emerald-400" />
              Plan Your Journey
            </motion.a>
          </motion.div>

          {/* Quick Info Stats */}
          <motion.div 
            variants={itemVariants}
            className="pt-6 sm:pt-8 grid grid-cols-3 gap-4 sm:gap-6 border-t border-white/20 max-w-xl"
          >
            <div>
              <p className="text-2xl sm:text-3xl font-bold text-white">{heroPackages.length}+</p>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">Tour Packages</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-bold text-white">{Math.floor(attractionCount / 10) * 10}+</p>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">Places to Explore</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-bold text-white">{departureCityCount}</p>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">Pickup Locations</p>
            </div>
          </motion.div>
        </motion.div>

        {/* Right Side: Auto-Playing Real Packages Carousel */}
        {currentPkg && (
          <div
            role="region"
            aria-label={`Featured tour package ${currentIndex + 1} of ${heroPackages.length}`}
            className="lg:col-span-5 relative lg:pl-3"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            <div className="absolute -inset-3 rounded-[2rem] bg-gradient-to-br from-emerald-400/35 via-teal-500/15 to-cyan-400/25 opacity-80 blur-2xl -z-10" />

            <div className="relative p-4 sm:p-6 lg:p-7 rounded-[2rem] bg-[#071510]/75 border border-emerald-100/20 backdrop-blur-2xl shadow-[0_30px_100px_-30px_rgba(0,0,0,0.9)] overflow-hidden">
              
              {/* Header */}
              <div className="flex items-center justify-between mb-4 gap-3">
                <span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-emerald-200"><span className="text-emerald-400" aria-hidden="true">
                  <Compass className="w-4 h-4 animate-spin-slow" />
                </span>
                
                {/* Navigation Arrows */}
                <div className="flex items-center gap-2">
                  <button 
                    onClick={handlePrev}
                    className="p-2 rounded-full bg-slate-800/80 hover:bg-emerald-500 text-slate-300 hover:text-slate-950 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={handleNext}
                    className="p-2 rounded-full bg-slate-800/80 hover:bg-emerald-500 text-slate-300 hover:text-slate-950 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Package Content Card */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentPkg.title}
                  initial={isMobile ? false : { opacity: 0, x: 20 }}
                  animate={isMobile ? undefined : { opacity: 1, x: 0 }}
                  exit={isMobile ? undefined : { opacity: 0, x: -20 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                >
                  <div className="relative h-[19rem] xs:h-[20rem] sm:h-[21rem] rounded-[1.5rem] overflow-hidden mb-5 group ring-1 ring-white/15 bg-slate-800">
                    <TourImage
                      src={currentTour?.images?.[0]?.src}
                      tag={currentTour?.imageTag || currentTour?.images?.[0]?.tag}
                      alt={currentTour?.images?.[0]?.alt || `Scenic landscape for ${currentPkg.title}`}
                      className="w-full h-full object-cover object-center sm:group-hover:scale-105 transition-transform duration-500"
                      loading="eager"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/10 to-transparent" />
                    
                    <span className="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500 text-slate-950 shadow-md">
                      {currentPkg.tag}
                    </span>

                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-lg font-bold text-white line-clamp-1">{currentPkg.title}</h3>
                      <div className="flex items-center gap-4 text-xs text-slate-300 mt-1">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                          {currentPkg.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-emerald-400" />
                          {currentPkg.duration}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider">Starting price per person</p>
                      <p className="text-[10px] text-slate-500">Listed price before discounts</p>
                      <p className="text-xl font-bold text-emerald-400">
                        {currentStartingPrice}
                      </p>
                    </div>
                    <motion.a
                      href={currentTour ? `/tours/${currentTour.slug}` : "/tours"}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-sm transition-colors shadow-md shadow-emerald-500/20"
                    >
                      View Trip
                    </motion.a>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Navigation Indicators */}
              <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  {heroPackages.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentIndex(idx)}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        idx === currentIndex 
                          ? 'w-6 bg-emerald-400' 
                          : 'w-1.5 bg-slate-700 hover:bg-slate-500'
                      }`}
                    />
                  ))}
                </div>

              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Hero;