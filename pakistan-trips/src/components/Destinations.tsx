import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Compass, Search, Star, ArrowUpRight, ChevronLeft, ChevronRight, X, Images } from 'lucide-react';

// Destination images are loaded from Cloudinary using each destination's tag.
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'lvv2vfug';
const PLACEHOLDER_IMAGE = "https://placehold.co/800x600/0f172a/94a3b8?text=No+destination+photos+yet";
const DESTINATIONS = [
  {
    id: 1,
    name: "Skardu Valley",
    region: "Gilgit-Baltistan",
    category: "Valleys",
    rating: 4.9,
    reviews: 128,
    tag: "skardu-valley",
    images: [PLACEHOLDER_IMAGE],
    description: "Gateway to the high Karakoram peaks, famous for Shangrila Lake, Cold Desert, and Deosai Plains.",
    highlight: "Cold Desert & Lakes"
  },
  {
    id: 2,
    name: "Hunza Valley",
    region: "Gilgit-Baltistan",
    category: "Valleys",
    rating: 5.0,
    reviews: 210,
    tag: "hunza-valley",
    images: [PLACEHOLDER_IMAGE],
    description: "Breathtaking landscapes with centuries-old Altit & Baltit Forts, Attabad Lake, and Passu Cones.",
    highlight: "Culture & Landscapes"
  },
  {
    id: 3,
    name: "Fairy Meadows",
    region: "Diamer District",
    category: "Adventure",
    rating: 4.8,
    reviews: 95,
    tag: "fairy-meadows",
    images: [PLACEHOLDER_IMAGE],
    description: "Lush green plateau offering the most stunning and dramatic views of Nanga Parbat peak.",
    highlight: "Nanga Parbat View"
  },
  {
    id: 4,
    name: "Swat Valley & Kalam",
    region: "Khyber Pakhtunkhwa",
    category: "Valleys",
    rating: 4.7,
    reviews: 164,
    tag: "swat-valley-kalam",
    images: [PLACEHOLDER_IMAGE],
    description: "Known as the Switzerland of Pakistan, offering lush forests, Mahodand Lake, and ski resorts.",
    highlight: "Lakes & Forests"
  },
  {
    id: 5,
    name: "Neelum Valley",
    region: "Azad Kashmir",
    category: "Valleys",
    rating: 4.9,
    reviews: 142,
    tag: "neelum-valley",
    images: [PLACEHOLDER_IMAGE],
    description: "A 144km-long bow-shaped valley with cascading waterfalls, thick pine forests, and Arang Kel.",
    highlight: "Greenery & Streams"
  },
  {
    id: 6,
    name: "Naran & Saif-ul-Malook",
    region: "Kaghan Valley",
    category: "Lakes",
    rating: 4.8,
    reviews: 180,
    tag: "naran-saif-ul-malook",
    images: [PLACEHOLDER_IMAGE],
    description: "Home to the legendary Saif-ul-Malook lake, Babusar Top, and scenic Babusar Pass drive.",
    highlight: "Fairytale Lakes"
  },
  {
    id: 7,
    name: "Gwadar & Coastal Highway",
    region: "Balochistan Coast",
    category: "Coastal",
    rating: 4.6,
    reviews: 88,
    tag: "gwadar-coastal-highway",
    images: [PLACEHOLDER_IMAGE],
    description: "Pristine beaches, Hingol National Park, and Princess of Hope along the Arabian Sea.",
    highlight: "Sea & Desert Cliffs"
  },
  {
    id: 8,
    name: "Chitral & Kalash Valley",
    region: "Khyber Pakhtunkhwa",
    category: "Culture",
    rating: 4.9,
    reviews: 76,
    tag: "chitral-kalash-valley",
    images: [PLACEHOLDER_IMAGE],
    description: "Unique cultural heritage, home to the ancient Kalasha tribe and Tirich Mir Karakoram views.",
    highlight: "Ancient Heritage"
  }
];

const CATEGORIES = ["All", "Valleys", "Adventure", "Lakes", "Coastal", "Culture"];

export const Destinations: React.FC = () => {
  const [destinationsWithImages, setDestinationsWithImages] = useState(DESTINATIONS);

  useEffect(() => {
    let cancelled = false;

    const loadTaggedImages = async () => {
      const results = await Promise.all(DESTINATIONS.map(async (destination) => {
        try {
          const response = await fetch(
            `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/list/${destination.tag}.json`
          );
          if (!response.ok) return { ...destination, images: [PLACEHOLDER_IMAGE] };

          const data = await response.json();
          const images = (data.resources || [])
            .filter((item: any) => item.public_id && item.format)
            .map((item: any) => `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/f_auto,q_auto,w_1000/v${item.version}/${item.public_id}.${item.format}`);

          return { ...destination, images: images.length ? images : [PLACEHOLDER_IMAGE] };
        } catch (error) {
          console.error(`Could not load Cloudinary tag "${destination.tag}":`, error);
          return { ...destination, images: [PLACEHOLDER_IMAGE] };
        }
      }));

      if (!cancelled) setDestinationsWithImages(results);
    };

    loadTaggedImages();
    return () => { cancelled = true; };
  }, []);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeGalleryDestination, setActiveGalleryDestination] = useState<any | null>(null);
  const [currentImageIdx, setCurrentImageIdx] = useState(0);

  const filteredDestinations = destinationsWithImages.filter((item) => {
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.region.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const openGallery = (destination: any) => {
    setActiveGalleryDestination(destination);
    setCurrentImageIdx(0);
  };

  const nextImage = () => {
    if (!activeGalleryDestination) return;
    setCurrentImageIdx((prev) => (prev + 1) % activeGalleryDestination.images.length);
  };

  const prevImage = () => {
    if (!activeGalleryDestination) return;
    setCurrentImageIdx((prev) => (prev - 1 + activeGalleryDestination.images.length) % activeGalleryDestination.images.length);
  };

  return (
    <section id="destinations" className="py-24 bg-slate-950 text-white relative overflow-hidden">
      {/* Background Ambient Lighting */}
      <div className="absolute top-1/4 -left-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 -right-40 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <motion.span 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-3"
            >
              <Compass className="w-3.5 h-3.5" />
              Explore Destinations
            </motion.span>
            
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-3xl sm:text-5xl font-extrabold tracking-tight"
            >
              Pakistan’s Most <br />
              <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
                Iconic Wonders
              </span>
            </motion.h2>
          </div>

          {/* Search Box */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="relative w-full md:w-80"
          >
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search valley, region..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-900/80 border border-slate-800 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500/80 transition-colors backdrop-blur-md"
            />
          </motion.div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-10 no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-emerald-500 text-slate-950 font-semibold shadow-lg shadow-emerald-500/20'
                  : 'bg-slate-900/60 hover:bg-slate-800 text-slate-300 border border-slate-800/80'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid of Destinations */}
        <motion.div 
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <AnimatePresence>
            {filteredDestinations.map((item) => (
              <motion.section
                aria-label={item.name}
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4 }}
                className="group relative rounded-3xl overflow-hidden bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl hover:border-emerald-500/50 transition-all duration-500 shadow-xl flex flex-col justify-between"
              >
                {/* Destination Image Box with Multiple Images indicator */}
                <div className="relative h-64 overflow-hidden">
                  <img height={600} width={800}
                    src={item.images[0]}
                    alt={`${item.name}, ${item.region} — scenic destination in Pakistan`}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                  loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />

                  {/* Rating Tag */}
                  <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-slate-950/70 backdrop-blur-md border border-slate-800 text-xs font-semibold text-white flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{item.rating}</span>
                  </div>

                  {/* Multi-images count badge */}
                  <button
                    onClick={() => openGallery(item)}
                    className="absolute top-4 right-4 px-3 py-1 rounded-full bg-slate-950/80 hover:bg-emerald-500 hover:text-slate-950 backdrop-blur-md border border-slate-800 text-[11px] font-medium text-slate-200 transition-colors flex items-center gap-1.5 shadow-md"
                  >
                    <Images className="w-3.5 h-3.5 text-emerald-400 group-hover:text-slate-950" />
                    <span>{item.images.length} Photos</span>
                  </button>

                  {/* Name and Region Overlay */}
                  <div className="absolute bottom-3 left-4 right-4">
                    <h2 className="text-xl font-bold text-white group-hover:text-emerald-400 transition-colors">
                      {item.name}
                    </h2>
                    <p className="text-xs text-slate-300 flex items-center gap-1 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                      {item.region}
                    </p>
                  </div>
                </div>

                {/* Card Content & Action */}
                <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                  <p className="text-xs text-slate-400 line-clamp-2 font-light leading-relaxed">
                    {item.description}
                  </p>

                  <button
                    onClick={() => openGallery(item)}
                    className="pt-2 w-full flex items-center justify-between text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors group/btn"
                  >
                    <span>View Destination Gallery</span>
                    <div className="p-2 rounded-xl bg-emerald-500/10 group-hover/btn:bg-emerald-500 group-hover/btn:text-slate-950 transition-colors">
                      <ArrowUpRight className="w-4 h-4" />
                    </div>
                  </button>
                </div>
              </motion.section>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Empty Search Fallback */}
        {filteredDestinations.length === 0 && (
          <div className="text-center py-16">
            <p className="text-slate-400 text-base">No destinations found matching "{searchQuery}".</p>
          </div>
        )}

      </div>

      {/* Interactive Multiple Images Modal / Gallery Viewer */}
      <AnimatePresence>
        {activeGalleryDestination && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveGalleryDestination(null)}
              className="fixed inset-0 bg-slate-950/90 backdrop-blur-xl"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col text-white"
            >
              {/* Modal Header */}
              <div className="p-6 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                    {activeGalleryDestination.name}
                  </h3>
                  <p className="text-xs text-emerald-400 flex items-center gap-1 mt-1">
                    <MapPin className="w-3.5 h-3.5" /> {activeGalleryDestination.region} ({activeGalleryDestination.highlight})
                  </p>
                </div>
                <button
                  onClick={() => setActiveGalleryDestination(null)}
                  className="p-2.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Active Large Image Display */}
              <div className="relative h-72 sm:h-96 bg-slate-950">
                <img height={600} width={800}
                  src={activeGalleryDestination.images[currentImageIdx]}
                  alt={activeGalleryDestination.name}
                  className="w-full h-full object-cover"
                loading="lazy" />

                {/* Left/Right Navigation Arrows */}
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-slate-950/80 hover:bg-emerald-500 hover:text-slate-950 text-white transition-colors border border-slate-700 shadow-lg"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-slate-950/80 hover:bg-emerald-500 hover:text-slate-950 text-white transition-colors border border-slate-700 shadow-lg"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>

                <div className="absolute bottom-4 right-4 px-3 py-1 rounded-full bg-slate-950/80 border border-slate-800 text-xs font-semibold text-emerald-400">
                  Photo {currentImageIdx + 1} of {activeGalleryDestination.images.length}
                </div>
              </div>

              {/* Thumbnails Row */}
              <div className="p-6 bg-slate-950 border-t border-slate-800 flex items-center gap-3 overflow-x-auto no-scrollbar">
                {activeGalleryDestination.images.map((imgUrl: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIdx(idx)}
                    className={`relative rounded-xl overflow-hidden w-24 h-16 flex-shrink-0 border-2 transition-all duration-300 ${
                      idx === currentImageIdx ? 'border-emerald-400 scale-105 shadow-lg shadow-emerald-500/20' : 'border-slate-800 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img height={600} width={800} src={imgUrl} alt={`Photo ${idx + 1} of ${activeGalleryDestination.name}`} className="w-full h-full object-cover" loading="lazy" />
                  </button>
                ))}
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </section>
  );
};

export default Destinations;