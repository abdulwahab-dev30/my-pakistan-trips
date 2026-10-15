import React from 'react';
import { Compass, Phone, Mail, MapPin, ShieldCheck, Heart } from 'lucide-react';

// Import central JSON data for official footer info
import tripData from '../data/trips-data.json';
import { useContactInfo } from '../lib/contactInfo';
import newLogo from '../assets/logosss (1).png';

export const Footer: React.FC = () => {
  const contactInfo = useContactInfo();
  return (
    <footer className="bg-[#F5F5F5] text-slate-700 border-t border-slate-200 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          
          {/* Col 1: Brand Info */}
          <div className="space-y-4">
            <a href="/" className="inline-flex items-center" aria-label="My Pakistan Trips home">
              <div className="flex flex-col items-center leading-none">
                <img src={newLogo} alt="My Pakistan Trips" width="99" height="56" className="h-10 w-auto object-contain" />
              </div>
            </a>
            <p className="text-xs text-slate-600 leading-relaxed">
              {contactInfo.company_name} — Your trusted partner for unforgettable and safe adventures across the northern valleys of Pakistan.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-700 font-medium">
              <ShieldCheck className="w-4 h-4" />
              <span>License No: {contactInfo.license_number}</span>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Quick Links</h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#tours" className="hover:text-emerald-700 transition-colors">Tour Packages</a></li>
              <li><a href="#destinations" className="text-slate-700 hover:text-emerald-700 transition-colors">Explore Destinations</a></li>
              <li><a href="#gallery" className="hover:text-emerald-400 transition-colors">Visual Journal</a></li>
              <li><a href="#about" className="hover:text-emerald-400 transition-colors">Our Philosophy</a></li>
              <li><a href="#faq" className="hover:text-emerald-400 transition-colors">FAQs & Policies</a></li>
            </ul>
          </div>

          {/* Col 3: Contact Info */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Contact Us</h4>
            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-700 flex-shrink-0" />
                <span>{contactInfo.contact_numbers.filter(Boolean).join(', ')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-700 flex-shrink-0" />
                <span>{contactInfo.email}</span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-emerald-700 flex-shrink-0 mt-0.5" />
                <span className="leading-relaxed">{contactInfo.address}</span>
              </div>
            </div>
          </div>

          {/* Col 4: Website Info */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Official Portal</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Visit our official website for instant bookings and live schedule updates:
            </p>
            <a 
              href={contactInfo.website ? (contactInfo.website.startsWith('http') ? contactInfo.website : `https://${contactInfo.website}`) : '#contact'}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-4 py-2 rounded-xl bg-white border border-slate-200 text-emerald-700 text-xs font-semibold hover:border-emerald-500/50 transition-colors"
            >
              {contactInfo.website}
            </a>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600">
          <p>© {new Date().getFullYear()} {contactInfo.company_name}. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Crafted with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for Pakistan Travelers
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;