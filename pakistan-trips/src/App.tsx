import React, { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import Loader from "./components/Loader";
import Navbar from "./components/Navbar";
import DiscountBanner from "./components/DiscountBanner";
import Hero from "./components/Hero";
import Destinations from "./components/Destinations";
import Tours from "./components/Tours";
import Gallery from "./components/Gallery";
import About from "./components/About";
import Testimonials from "./components/Testimonials";
import FAQ from "./components/FAQ";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import WhatsAppButton from "./components/WhatsAppButton";

export const App: React.FC = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Keep the branded intro while rendering page content for prerendering and accessibility.
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="bg-slate-950 text-white min-h-screen selection:bg-emerald-500 selection:text-slate-950">
      <AnimatePresence>
        {loading && <Loader key="loader" />}
      </AnimatePresence>
      <Navbar />
      <div className="pt-20 sm:pt-24">
        <DiscountBanner />
      </div>
      <main>
        <Hero />
        <Destinations />
        <Tours />
        <Gallery />
        <About />
        <Testimonials />
        <FAQ />
        <Contact />
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default App;
