import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';

interface CloudinaryImage {
  public_id: string;
  secure_url: string;
}

const AUTO_ADVANCE_MS = 5000;

export const Gallery: React.FC = () => {
  const [images, setImages] = useState<CloudinaryImage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
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

        if (!response.ok) {
          throw new Error(`Gallery request failed with status ${response.status}`);
        }

        const data = await response.json();
        const formattedImages: CloudinaryImage[] = (data.resources ?? []).map((item: any) => ({
          public_id: item.public_id,
          secure_url: `https://res.cloudinary.com/${cloudName}/image/upload/f_auto,q_auto,w_1600/v${item.version}/${item.public_id}.${item.format}`,
        }));
        setImages(formattedImages);
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error('Error fetching Cloudinary gallery images:', error);
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    fetchGalleryImages();
    return () => controller.abort();
  }, []);

  const goTo = useCallback((nextIndex: number) => {
    if (!images.length) return;
    setCurrentIndex((nextIndex + images.length) % images.length);
  }, [images.length]);

  const handlePrev = useCallback(() => goTo(currentIndex - 1), [currentIndex, goTo]);
  const handleNext = useCallback(() => goTo(currentIndex + 1), [currentIndex, goTo]);

  // Advance automatically; restarting the interval after manual navigation
  // gives visitors a full five seconds to view the newly selected photo.
  useEffect(() => {
    if (images.length < 2 || isPaused) return;
    const interval = window.setInterval(() => {
      setCurrentIndex((index) => (index + 1) % images.length);
    }, AUTO_ADVANCE_MS);
    return () => window.clearInterval(interval);
  }, [images.length, currentIndex, isPaused]);

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
    // Only treat a clearly horizontal gesture as a slide, so vertical page scrolling works.
    if (Math.abs(deltaX) > 45 && Math.abs(deltaX) > Math.abs(deltaY) * 1.2) {
      if (deltaX < 0) handleNext();
      else handlePrev();
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  const activeImage = images[currentIndex];

  return (
    <section className="py-14 sm:py-20 bg-slate-950 text-white relative" id="gallery">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12">
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
            className="relative mx-auto w-full max-w-5xl"
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onFocusCapture={() => setIsPaused(true)}
            onBlurCapture={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setIsPaused(false);
            }}
          >
            <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-700/80 bg-slate-900 shadow-2xl aspect-[4/3] sm:aspect-[16/10] md:aspect-[16/9]">
              <AnimatePresence mode="wait">
                <motion.img
                  key={activeImage.public_id || currentIndex}
                  src={activeImage.secure_url}
                  alt={`Travel memory ${currentIndex + 1} of ${images.length} from Pakistan`}
                  className="absolute inset-0 w-full h-full object-cover"
                  initial={{ opacity: 0, scale: 1.015 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                  width={1600}
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
                    className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-10 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full border border-white/25 bg-slate-950/65 text-white shadow-lg backdrop-blur-sm transition hover:bg-emerald-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                  >
                    <ChevronLeft size={25} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    aria-label="Next gallery image"
                    className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-10 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full border border-white/25 bg-slate-950/65 text-white shadow-lg backdrop-blur-sm transition hover:bg-emerald-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                  >
                    <ChevronRight size={25} aria-hidden="true" />
                  </button>
                  <div className="absolute bottom-0 inset-x-0 h-1 bg-white/20 z-10" aria-hidden="true">
                    <motion.div
                      key={currentIndex + (isPaused ? '-paused' : '-playing')}
                      className="h-full bg-emerald-400"
                      initial={{ width: '0%' }}
                      animate={{ width: isPaused ? '0%' : '100%' }}
                      transition={{ duration: isPaused ? 0 : AUTO_ADVANCE_MS / 1000, ease: 'linear' }}
                    />
                  </div>
                </>
              )}
            </div>

            <div className="mt-4 flex items-center justify-between gap-3">
              <span className="text-sm text-slate-400 tabular-nums" aria-live="polite">
                {String(currentIndex + 1).padStart(2, '0')} <span className="text-slate-600">/</span> {String(images.length).padStart(2, '0')}
              </span>

              <div className="flex items-center justify-center gap-1.5 sm:gap-2" aria-label="Choose gallery image">
                {images.map((image, index) => (
                  <button
                    key={image.public_id || index}
                    type="button"
                    onClick={() => goTo(index)}
                    aria-label={`Show image ${index + 1}`}
                    aria-current={currentIndex === index ? 'true' : undefined}
                    className={`h-2.5 rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 ${currentIndex === index ? 'w-7 bg-emerald-400' : 'w-2.5 bg-slate-600 hover:bg-slate-400'}`}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={() => setIsPaused((paused) => !paused)}
                aria-label={isPaused ? 'Resume automatic slideshow' : 'Pause automatic slideshow'}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-700 bg-slate-900 text-slate-300 transition hover:border-emerald-500 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
              >
                {isPaused ? <Play size={16} aria-hidden="true" /> : <Pause size={16} aria-hidden="true" />}
              </button>
            </div>
            <p className="mt-3 text-center text-xs sm:text-sm text-slate-500">
              Swipe to explore · Photos change every 5 seconds
            </p>
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
