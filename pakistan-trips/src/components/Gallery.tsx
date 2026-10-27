import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CloudinaryImage {
  public_id: string;
  secure_url: string;
}

const AUTO_ADVANCE_MS = 5000;

export const Gallery: React.FC = () => {
  const [images, setImages] = useState<CloudinaryImage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const cloudName = 'lvv2vfug';

  useEffect(() => {
    const controller = new AbortController();
    const fetchGalleryImages = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `https://res.cloudinary.com/${cloudName}/image/list/gallery.json`,
          { signal: controller.signal }
        );
        if (!response.ok) throw new Error(`Gallery request failed with status ${response.status}`);
        const data = await response.json();
        setImages((data.resources ?? []).map((item: any) => ({
          public_id: item.public_id,
          secure_url: `https://res.cloudinary.com/${cloudName}/image/upload/f_auto,q_auto,w_1800/v${item.version}/${item.public_id}.${item.format}`,
        })));
      } catch (error) {
        if (!controller.signal.aborted) console.error('Error fetching Cloudinary gallery images:', error);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };
    fetchGalleryImages();
    return () => controller.abort();
  }, []);

  const goTo = useCallback((nextIndex: number) => {
    if (images.length) setCurrentIndex((nextIndex + images.length) % images.length);
  }, [images.length]);
  const handlePrev = useCallback(() => goTo(currentIndex - 1), [currentIndex, goTo]);
  const handleNext = useCallback(() => goTo(currentIndex + 1), [currentIndex, goTo]);

  useEffect(() => {
    if (images.length < 2) return;
    const interval = window.setInterval(() => {
      setCurrentIndex((index) => (index + 1) % images.length);
    }, AUTO_ADVANCE_MS);
    return () => window.clearInterval(interval);
  }, [images.length, currentIndex]);

  useEffect(() => {
    if (!images.length) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') handlePrev();
      if (event.key === 'ArrowRight') handleNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev, images.length]);

  const onTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    touchStartX.current = event.touches[0]?.clientX ?? null;
    touchStartY.current = event.touches[0]?.clientY ?? null;
  };
  const onTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const deltaX = (event.changedTouches[0]?.clientX ?? touchStartX.current) - touchStartX.current;
    const deltaY = (event.changedTouches[0]?.clientY ?? touchStartY.current) - touchStartY.current;
    if (Math.abs(deltaX) > 45 && Math.abs(deltaX) > Math.abs(deltaY) * 1.2) {
      if (deltaX < 0) handleNext();
      else handlePrev();
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  const activeImage = images[currentIndex];

  return (
    <section className="py-12 sm:py-16 bg-slate-950 text-white relative" id="gallery">
      <div className="w-full px-0 sm:px-5 lg:px-8">
        <div className="text-center mb-7 sm:mb-10 px-4">
          <h2 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-emerald-400 to-teal-200 bg-clip-text text-transparent">
            Captured Smiles
          </h2>
          <p className="text-slate-400 mt-3 text-base sm:text-lg">
            Real moments & memories from our journey across Pakistan
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12" aria-label="Loading gallery">
            <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : activeImage ? (
          <div
            className="relative w-full"
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
          >
            <div className="relative overflow-hidden sm:rounded-2xl border-y sm:border border-slate-700/70 bg-slate-900 shadow-2xl aspect-[4/3] sm:aspect-[16/9] lg:aspect-[21/9]">
              <AnimatePresence mode="wait">
                <motion.img
                  key={activeImage.public_id || currentIndex}
                  src={activeImage.secure_url}
                  alt="Travel memory from Pakistan"
                  className="absolute inset-0 w-full h-full object-cover"
                  initial={{ opacity: 0, scale: 1.01 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                  width={1800}
                  height={900}
                  loading={currentIndex === 0 ? 'eager' : 'lazy'}
                  decoding="async"
                  draggable={false}
                />
              </AnimatePresence>

              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={handlePrev}
                    aria-label="Previous gallery image"
                    className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-10 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full border border-white/30 bg-slate-950/45 text-white shadow-md backdrop-blur-sm transition hover:bg-slate-950/75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                  >
                    <ChevronLeft size={25} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    aria-label="Next gallery image"
                    className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-10 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full border border-white/30 bg-slate-950/45 text-white shadow-md backdrop-blur-sm transition hover:bg-slate-950/75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                  >
                    <ChevronRight size={25} aria-hidden="true" />
                  </button>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-10 text-slate-500">
            No images found. Please assign the <code className="text-emerald-400">gallery</code> tag to your photos on Cloudinary.
          </div>
        )}
      </div>
    </section>
  );
};

export default Gallery;
