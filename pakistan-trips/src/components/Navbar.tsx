import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, Menu, X, Phone, Sparkles } from 'lucide-react';
import DiscountBanner from './DiscountBanner';
import newLogo from '../assets/IMG-20261014-WA0033.jpg';

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Scroll handler to change navbar background
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Destinations', href: '/#destinations' },
    { name: 'Tours', href: '/tours' },
    { name: 'Gallery', href: '/#gallery' },
    { name: 'About', href: '/#about' },
    { name: 'FAQ', href: '/#faq' },
  ];

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-[#F5F5F5] text-slate-900 ${
        isScrolled
          ? 'backdrop-blur-xl border-b border-slate-200 shadow-sm'
          : 'backdrop-blur-md'
      }`}
    >
      <div className={`max-w-7xl mx-auto px-6 lg:px-12 flex items-center justify-between transition-all duration-300 ${
        isScrolled ? 'py-3' : 'py-5'
      }`}>
        {/* Brand Logo */}
        <a href="/" className="flex flex-col items-center justify-center group shrink-0 leading-none" aria-label="My Pakistan Trips home">
          <img
            height={56}
            width={99}
            src={newLogo}
            alt=""
            className="h-12 sm:h-14 w-auto object-contain"
          />
        </a>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="text-sm font-medium text-slate-700 hover:text-emerald-700 transition-colors duration-200 relative group py-1"
            >
              {link.name}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-emerald-500 transition-all duration-300 group-hover:w-full rounded-full" />
            </a>
          ))}
        </nav>

        {/* Right Action CTA Button */}
        <div className="hidden md:flex items-center gap-4">
          <motion.a
            href="/#contact"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold text-sm flex items-center gap-2 shadow-md shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all duration-300 border border-emerald-400/30"
          >
            <Phone className="w-4 h-4" />
            <span>Book Inquiries</span>
          </motion.a>
        </div>

        {/* Mobile Menu Toggle Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-emerald-700 hover:bg-slate-100 transition-colors"
          aria-label="Toggle Menu"
          aria-expanded={isMobileMenuOpen}
        >
          {isMobileMenuOpen ? <X className="w-6 h-6 text-emerald-600" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Discount banner stays attached to the fixed header while scrolling */}
      <DiscountBanner />

      {/* Mobile Responsive Menu Popup */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-[#F5F5F5] border-b border-slate-200 overflow-hidden"
          >
            <div className="px-6 py-6 space-y-4 flex flex-col">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-base font-medium text-slate-700 hover:text-emerald-700 transition-colors py-2 border-b border-slate-200 flex items-center justify-between"
                >
                  <span>{link.name}</span>
                  <Sparkles className="w-4 h-4 text-emerald-600/50" />
                </a>
              ))}
              <div className="pt-2">
                <a
                  href="#contact"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full py-3 rounded-xl bg-emerald-500 text-white font-bold text-center block shadow-lg shadow-emerald-500/20"
                >
                  Book Inquiries
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Navbar;
