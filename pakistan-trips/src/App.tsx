import React from "react";
import Navbar from "./components/Navbar";
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
  return (
    <div className="bg-slate-950 text-white min-h-screen selection:bg-emerald-500 selection:text-slate-950">
      <Navbar />
      <main className="pt-[148px]">
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
