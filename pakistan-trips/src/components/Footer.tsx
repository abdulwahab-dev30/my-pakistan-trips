import React from 'react';
import { Compass, Phone, Mail, MapPin, ShieldCheck, Heart } from 'lucide-react';

// Import central JSON data for official footer info
import tripData from '../data/trips-data.json';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-900 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          
          {/* Col 1: Brand Info */}
          <div className="space-y-4">
            <a href="/" className="inline-flex items-center" aria-label="My Pakistan Trips home">
              <img src="/my-pakistan-trips-logo.svg" alt="My Pakistan Trips" width="99" height="56" className="h-12 w-auto object-contain" />
            </a>
            <p className="text-xs text-slate-400 leading-relaxed">
              {tripData.company} — Your trusted partner for unforgettable and safe adventures across the northern valleys of Pakistan.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
              <ShieldCheck className="w-4 h-4" />
              <span>License No: {tripData.license_number}</span>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Quick Links</h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#tours" className="hover:text-emerald-400 transition-colors">Tour Packages</a></li>
              <li><a href="#destinations" className="hover:text-emerald-400 transition-colors">Explore Destinations</a></li>
              <li><a href="#gallery" className="hover:text-emerald-400 transition-colors">Visual Journal</a></li>
              <li><a href="#about" className="hover:text-emerald-400 transition-colors">Our Philosophy</a></li>
              <li><a href="#faq" className="hover:text-emerald-400 transition-colors">FAQs & Policies</a></li>
            </ul>
          </div>

          {/* Col 3: Contact Info */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Contact Us</h4>
            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>{tripData.contact_numbers?.[0]}, {tripData.contact_numbers?.[1]}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>{tripData.email}</span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span className="leading-relaxed">{tripData.address}</span>
              </div>
            </div>
          </div>

          {/* Col 4: Website Info */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Official Portal</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Visit our official website for instant bookings and live schedule updates:
            </p>
            <a 
              href={`https://${tripData.website}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-emerald-400 text-xs font-semibold hover:border-emerald-500/50 transition-colors"
            >
              {tripData.website}
            </a>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} {tripData.company}. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Crafted with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for Pakistan Travelers
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;