import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CloudinaryImage {
  public_id: string;
  secure_url: string;
}

export const Gallery: React.FC = () => {
  const [images, setImages] = useState<CloudinaryImage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  
  const [currentPage, setCurrentPage] = useState<number>(1);
  const imagesPerPage = 6;

  const cloudName = 'lvv2vfug';

  useEffect(() => {
    const fetchGalleryImages = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `https://res.cloudinary.com/${cloudName}/image/list/gallery.json`
        );

        if (response.ok) {
          const data = await response.json();
          const formattedImages = data.resources.map((item: any) => ({
            public_id: item.public_id,
            secure_url: `https://res.cloudinary.com/${cloudName}/image/upload/f_auto,q_auto,w_1000/v${item.version}/${item.public_id}.${item.format}`,
          }));
          setImages(formattedImages);
        }
      } catch (error) {
        console.error('Error fetching Cloudinary images:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGalleryImages();
  }, []);

  const indexOfLastImage = currentPage * imagesPerPage;
  const indexOfFirstImage = indexOfLastImage - imagesPerPage;
  const currentImages = images.slice(indexOfFirstImage, indexOfLastImage);
  const totalPages = Math.ceil(images.length / imagesPerPage);

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedIndex !== null) {
      setSelectedIndex(selectedIndex === 0 ? images.length - 1 : selectedIndex - 1);
    }
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedIndex !== null) {
      setSelectedIndex(selectedIndex === images.length - 1 ? 0 : selectedIndex + 1);
    }
  };

  const activeImage = selectedIndex !== null ? images[selectedIndex] : null;

  return (
    <section className="py-20 bg-slate-950 text-white relative" id="gallery">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-emerald-400 to-teal-200 bg-clip-text text-transparent">
            Captured Smiles
          </h2>
          <p className="text-slate-400 mt-2">
            Real moments & memories from our journey across Pakistan
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : images.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {currentImages.map((img, idx) => {
                const globalIndex = indexOfFirstImage + idx;
                return (
                  <motion.div
                    key={img.public_id || idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    onClick={() => setSelectedIndex(globalIndex)}
                    className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur-md shadow-xl cursor-pointer"
                  >
                    <img height={600} width={800}
                      src={img.secure_url}
                      alt="Travelers exploring scenic destinations in Pakistan"
                      className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                      decoding="async"
                    />
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                      <span className="text-xs text-slate-300">Click to preview</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-10">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-sm font-medium disabled:opacity-40 hover:bg-slate-800 transition-colors"
                >
                  Previous
                </button>
                <span className="text-sm text-slate-400 px-3">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-sm font-medium disabled:opacity-40 hover:bg-slate-800 transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-10 text-slate-500">
            No images found. Please assign the <code className="text-emerald-400">gallery</code> tag to your photos on Cloudinary.
          </div>
        )}
      </div>

      <AnimatePresence>
        {activeImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedIndex(null)}
            className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-lg flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-2xl aspect-square bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col p-5"
            >
              <div className="flex justify-end items-center mb-3 z-10">
                <button
                  onClick={() => setSelectedIndex(null)}
                  className="text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800 rounded-full w-9 h-9 flex items-center justify-center transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="relative flex-1 w-full bg-slate-950 rounded-2xl overflow-hidden flex items-center justify-center">
                <img height={600} width={800}
                  src={activeImage.secure_url}
                  alt="Expanded view of a Pakistan trip gallery photo"
                  className="w-full h-full object-contain"
                loading="lazy" />

                <button
                  onClick={handlePrev}
                  className="absolute left-3 top-1/2 -translate-y-1/2 bg-slate-900/80 hover:bg-slate-800 text-white p-3 rounded-full border border-slate-700 backdrop-blur-md transition-all shadow-lg"
                >
                  ❮
                </button>

                <button
                  onClick={handleNext}
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-slate-900/80 hover:bg-slate-800 text-white p-3 rounded-full border border-slate-700 backdrop-blur-md transition-all shadow-lg"
                >
                  ❯
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default Gallery;