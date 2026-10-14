import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { Compass, Sparkles, ArrowRight, Play, ChevronLeft, ChevronRight, MapPin, Clock } from 'lucide-react';

// Import central JSON data and the optimized local hero image
import tripData from '../data/trips-data.json';
import { tours } from '../data/tours.js';
import localHeroBackground from '../assets/hero-bg.webp';

// Each package uses its own Cloudinary tag. Add these exact tags to package photos.
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "lvv2vfug";
const PLACEHOLDER_IMAGE = "https://placehold.co/800x600/0f172a/94a3b8?text=Image+Coming+Soon";
const PACKAGE_IMAGE_TAGS: Record<string, string> = {
  "3 Days Trip to Naran, Shogran and Babusar top": "package-naran-shogran-babusar",
  "5 Days Trip to Hunza Valley": "package-hunza-valley",
  "8 Days Trip to Skardu Valley & Hunza": "package-skardu-hunza",
  "6 Days Trip to Skardu Valley": "package-skardu-valley",
  "4 Days Kumrat, Jahaz Banda and Katora Lake": "package-kumrat-jahaz-banda-katora-lake",
  "4 Days Trip to Sharda, Toubat & Aurang Kel (Neelum Valley)": "package-neelum-valley-sharda-taobat-aurang-kel",
  "6 Days Trip to Astore & Minimerg & Rama Meadows": "package-astore-minimerg-rama-meadows",
  "3 Days Trip to Swat & Malam Jabba": "package-swat-malam-jabba"
};

export const Hero: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [packageImages, setPackageImages] = useState<Record<string, string>>({});
  const [isMobile, setIsMobile] = useState(false);

  // Keep desktop motion effects, but avoid costly parallax and entrance animations on phones.
  useEffect(() => {
    const media = window.matchMedia('(max-width: 767px)');
    const updateMobile = () => setIsMobile(media.matches);
    updateMobile();
    media.addEventListener('change', updateMobile);
    return () => media.removeEventListener('change', updateMobile);
  }, []);

  // Keep the locally bundled WebP as the fixed hero background.
  // Cloudinary remains in use for the separate package carousel images.
  const heroBackgroundImage = localHeroBackground;

  const rawPackages = tripData.trip_packages || [];

  // Fetch only the active package's tagged image, rather than making eight requests on page load.
  // Missing tags/photos fall back to a neutral placeholder instead of Unsplash images.
  useEffect(() => {
    const pkg = rawPackages[currentIndex];
    if (!pkg) return;

    const tag = PACKAGE_IMAGE_TAGS[pkg.title];
    if (!tag) {
      setPackageImages((previous) => ({ ...previous, [pkg.title]: PLACEHOLDER_IMAGE }));
      return;
    }
    if (packageImages[pkg.title]) return;

    let cancelled = false;
    const loadPackageImage = async () => {
      try {
        const response = await fetch(
          `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/list/${tag}.json`
        );
        if (!response.ok) throw new Error(`No public Cloudinary list for tag: ${tag}`);

        const data = await response.json();
        const item = (data.resources || []).find(
          (resource: any) => resource.public_id && resource.format && resource.version
        );
        const imageUrl = item
          ? `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/f_auto,q_auto,w_800/v${item.version}/${item.public_id}.${item.format}`
          : PLACEHOLDER_IMAGE;

        if (!cancelled) {
          setPackageImages((previous) => ({ ...previous, [pkg.title]: imageUrl }));
        }
      } catch {
        if (!cancelled) {
          setPackageImages((previous) => ({ ...previous, [pkg.title]: PLACEHOLDER_IMAGE }));
        }
      }
    };

    loadPackageImage();
    return () => {
      cancelled = true;
    };
  }, [currentIndex, rawPackages, packageImages]);

  // Combine package data with its Cloudinary image and default badges.
  const heroPackages = rawPackages.map((pkg: any, idx: number) => ({
    ...pkg,
    image: packageImages[pkg.title] || PLACEHOLDER_IMAGE,
    location: pkg.main_attractions?.[0] || "Northern Pakistan",
    tag: idx % 2 === 0 ? "Best Seller" : "Trending"
  }));

  const { scrollY } = useScroll();
  const yBg = useTransform(scrollY, [0, 500], [0, 150]);
  const opacityBg = useTransform(scrollY, [0, 300], [1, 0.4]);

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
  const currentTour = tours.find((tour) => tour.title === currentPkg?.title);

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
    <div className="relative min-h-[92svh] flex items-center justify-center overflow-hidden bg-slate-950 text-white pt-24 pb-10">
      {/* Background Parallax */}
      <motion.div 
        style={isMobile ? undefined : { y: yBg, opacity: opacityBg }}
        className="absolute inset-0 z-0"
      >
        {heroBackgroundImage && (
          <img
            src={heroBackgroundImage}
            alt="Scenic travel photography from Pakistan"
            width={1600}
            height={1000}
            fetchPriority="high"
            decoding="async"
            className="w-full h-full object-cover scale-105"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-[#061510]/95 via-slate-950/75 to-slate-950/35" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-transparent to-slate-950/35" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_18%_45%,rgba(16,185,129,0.18),transparent_42%)]" />
      </motion.div>

      {/* Main Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-6 lg:px-12 py-12 sm:py-16 w-full grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
        
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
              Explore Pakistan · {tripData.company || "My Pakistan Trips"}
            </span>
          </motion.div>

          <motion.h1 
            variants={itemVariants}
            className="text-[2.65rem] sm:text-6xl lg:text-[4.5rem] font-extrabold tracking-[-0.045em] leading-[1.06] drop-shadow-lg"
          >
            Find Your Escape in <br />
            <span className="bg-gradient-to-r from-emerald-300 via-teal-200 to-white bg-clip-text text-transparent">
              Northern Pakistan
            </span>
          </motion.h1>

          <motion.p 
            variants={itemVariants}
            className="text-base sm:text-lg lg:text-xl text-slate-200/95 max-w-xl font-light leading-relaxed"
          >
            From Hunza’s towering peaks to Skardu’s serene lakes, discover unforgettable journeys with comfortable transport, handpicked stays, and local guidance.
          </motion.p>

          <motion.div 
            variants={itemVariants}
            className="flex flex-wrap items-center gap-4 pt-2"
          >
            <motion.a
              href="#tours"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-500 text-slate-950 font-bold flex items-center gap-3 shadow-xl shadow-emerald-900/30 hover:shadow-emerald-500/30 transition-all duration-300"
            >
              Browse Packages
              <ArrowRight className="w-5 h-5" />
            </motion.a>

            <motion.a
              href="#destinations"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 sm:px-7 py-3.5 sm:py-4 rounded-2xl bg-white/10 border border-white/25 hover:bg-white/15 hover:border-white/40 text-white font-semibold flex items-center gap-3 backdrop-blur-xl transition-all duration-300"
            >
              <Play className="w-4 h-4 fill-current text-emerald-400" />
              View Wonders
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
              <p className="text-2xl sm:text-3xl font-bold text-white">North</p>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">Pakistan Destinations</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-bold text-white">Trip</p>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">Planning Support</p>
            </div>
          </motion.div>
        </motion.div>

        {/* Right Side: Auto-Playing Real Packages Carousel */}
        {currentPkg && (
          <div 
            className="lg:col-span-5 relative"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            <div className="absolute -inset-3 rounded-[2rem] bg-gradient-to-br from-emerald-400/35 via-teal-500/15 to-cyan-400/25 opacity-80 blur-2xl -z-10" />

            <div className="relative p-4 sm:p-6 lg:p-7 rounded-[1.75rem] bg-slate-950/65 border border-white/15 backdrop-blur-2xl shadow-[0_25px_90px_-25px_rgba(0,0,0,0.75)] overflow-hidden">
              
              {/* Header */}
              <div className="flex items-center justify-between mb-4 gap-3">
                <span className="text-xs font-semibold tracking-wider text-emerald-400 uppercase flex items-center gap-2">
                  <Compass className="w-4 h-4 animate-spin-slow" />
                  Package ({currentIndex + 1}/{heroPackages.length})
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
                  <div className="relative h-60 sm:h-64 rounded-2xl overflow-hidden mb-5 group ring-1 ring-white/10">
                    <img height={600} width={800} 
                      src={currentPkg.image} 
                      alt={`Scenic landscape for ${currentPkg.title}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    loading="lazy" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent" />
                    
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
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider">Per Head Starting</p>
                      <p className="text-xl font-bold text-emerald-400">
                        {currentPkg.pricing?.standard_4_5_sharing || "Rs. Contact"}
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
                <span className="text-[10px] text-slate-400">
                  {isPaused ? 'Paused' : 'Auto-playing'}
                </span>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Hero;