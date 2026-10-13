import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { Compass, Sparkles, ArrowRight, Play, ChevronLeft, ChevronRight, MapPin, Clock } from 'lucide-react';

// Import central JSON data
import tripData from '../data/trips-data.json';

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
  const [heroBackgroundImage, setHeroBackgroundImage] = useState("");
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

  // Use Cloudinary gallery photos for the hero background. Advance only after
  // the next image has loaded successfully, so a failed request never advances
  // the saved position.
  useEffect(() => {
    let cancelled = false;
    const cloudName = "lvv2vfug";
    const storageIndexKey = "mpt-hero-cloudinary-index";
    const storageUrlKey = "mpt-hero-cloudinary-url";

    const loadNextBackground = async () => {
      let lastIndex = -1;
      let previousUrl = "";

      try {
        lastIndex = Number(window.localStorage.getItem(storageIndexKey) ?? -1);
        previousUrl = window.localStorage.getItem(storageUrlKey) ?? "";
      } catch {
        // Storage may be unavailable; the background can still load for this visit.
      }

      // Show the last successfully loaded image immediately on repeat visits.
      // Refresh it in the background; never make the first render wait for the API.
      if (previousUrl && !cancelled) setHeroBackgroundImage(previousUrl);

      try {
        const response = await fetch(`https://res.cloudinary.com/${cloudName}/image/list/gallery.json`);
        if (!response.ok) throw new Error("Cloudinary gallery list request failed");

        const data = await response.json();
        const resources = (data.resources || []).filter(
          (item: any) => item.public_id && item.format && item.version
        );
        if (!resources.length || cancelled) return;

        const nextIndex = (lastIndex + 1) % resources.length;
        const item = resources[nextIndex];
        const imageWidth = window.matchMedia("(max-width: 767px)").matches ? 900 : 1600;
        const nextUrl = `https://res.cloudinary.com/${cloudName}/image/upload/f_auto,q_auto,w_${imageWidth}/v${item.version}/${item.public_id}.${item.format}`;
        const preload = new window.Image();
        preload.onload = () => {
          if (cancelled) return;
          setHeroBackgroundImage(nextUrl);
          try {
            window.localStorage.setItem(storageIndexKey, String(nextIndex));
            window.localStorage.setItem(storageUrlKey, nextUrl);
          } catch {
            // Keep the successfully loaded image even if storage is unavailable.
          }
        };
        preload.onerror = () => {
          if (cancelled) return;
          // Keep the last successful background and retry this same candidate next visit.
          if (previousUrl) setHeroBackgroundImage(previousUrl);
        };
        preload.src = nextUrl;
      } catch (error) {
        if (!cancelled && previousUrl) setHeroBackgroundImage(previousUrl);
        console.error("Could not load the Cloudinary hero background:", error);
      }
    };

    loadNextBackground();
    return () => {
      cancelled = true;
    };
  }, []);

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
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-slate-950 text-white pt-20">
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
            fetchPriority="high"
            className="w-full h-full object-cover scale-105"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/70 to-slate-950/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/50" />
      </motion.div>

      {/* Main Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 py-16 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* Left Side: Hero Text */}
        <motion.div 
          className="lg:col-span-7 space-y-8"
          variants={containerVariants}
          initial={isMobile ? false : "hidden"}
          animate="visible"
        >
          <motion.div variants={itemVariants} className="inline-flex">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 backdrop-blur-md text-emerald-400 text-sm font-medium shadow-lg shadow-emerald-500/5">
              <Sparkles className="w-4 h-4 animate-pulse" />
              {tripData.company || "My Pakistan Trips"}
            </span>
          </motion.div>

          <motion.h1 
            variants={itemVariants}
            className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1]"
          >
            Luxury Trips in Pakistan <br />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
              Unseen Beauty
            </span>
          </motion.h1>

          <motion.p 
            variants={itemVariants}
            className="text-lg sm:text-xl text-slate-300 max-w-2xl font-light leading-relaxed"
          >
            Unforgettable journeys across Hunza, Skardu, Swat, and Kumrat. Luxury transport, premium hotels, and expert guide services.
          </motion.p>

          <motion.div 
            variants={itemVariants}
            className="flex flex-wrap items-center gap-4 pt-2"
          >
            <motion.a
              href="#tours"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold flex items-center gap-3 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all duration-300"
            >
              Browse Packages
              <ArrowRight className="w-5 h-5" />
            </motion.a>

            <motion.a
              href="#destinations"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 rounded-xl bg-slate-900/80 border border-slate-700/80 hover:border-slate-500 text-white font-semibold flex items-center gap-3 backdrop-blur-md transition-all duration-300"
            >
              <Play className="w-4 h-4 fill-current text-emerald-400" />
              View Wonders
            </motion.a>
          </motion.div>

          {/* Quick Info Stats */}
          <motion.div 
            variants={itemVariants}
            className="pt-8 grid grid-cols-3 gap-6 border-t border-slate-800/80 max-w-lg"
          >
            <div>
              <p className="text-2xl sm:text-3xl font-bold text-white">{heroPackages.length}+</p>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">Tour Packages</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-bold text-white">4.9 ★</p>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">Traveler Rating</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-bold text-white">100%</p>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">Guided Experience</p>
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
            <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-emerald-500 to-teal-500 opacity-25 blur-2xl -z-10" />

            <div className="relative p-6 sm:p-8 rounded-3xl bg-slate-900/70 border border-slate-700/60 backdrop-blur-xl shadow-2xl overflow-hidden">
              
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
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
                  <div className="relative h-60 rounded-2xl overflow-hidden mb-5 group">
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
                      href="#tours"
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
              <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between">
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