import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Calendar, MapPin, CheckCircle, XCircle, Hotel, 
  Sparkles, Phone, ShieldAlert, CreditCard, ChevronDown, ChevronUp 
} from 'lucide-react';

interface PackageModalProps {
  pkg: any;
  companyInfo: any;
  onClose: () => void;
}

export const PackageModal: React.FC<PackageModalProps> = ({ pkg, companyInfo, onClose }) => {
  const [activeTab, setActiveTab] = useState<'itinerary' | 'details' | 'pricing' | 'policies'>('itinerary');

  if (!pkg) return null;

  // Format WhatsApp message link
  const whatsappNumber = companyInfo.contact_numbers?.[0]?.replace(/[^0-9]/g, '') || "923494886076";
  const whatsappUrl = `https://wa.me/92${whatsappNumber.replace(/^0/, '')}?text=${encodeURIComponent(`Hi, I am interested in booking: ${pkg.title}`)}`;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        
        {/* Backdrop overlay */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
        />

        {/* Main Modal Box */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3 }}
          className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden z-10 max-h-[90vh] flex flex-col text-slate-200"
        >

          {/* Header Banner */}
          <div className="relative p-6 sm:p-8 bg-gradient-to-r from-emerald-900/60 via-slate-900 to-slate-900 border-b border-slate-800">
            <button 
              onClick={onClose}
              className="absolute top-5 right-5 p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-3">
              <Calendar className="w-3.5 h-3.5" />
              {pkg.duration}
            </span>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-white pr-8">{pkg.title}</h2>
            <p className="text-xs sm:text-sm text-emerald-400 font-medium mt-1">
              Departure: {pkg.departure}
            </p>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center border-b border-slate-800 bg-slate-950/50 px-6 gap-2 overflow-x-auto no-scrollbar">
            {[
              { id: 'itinerary', label: 'Itinerary' },
              { id: 'details', label: 'Attractions & Hotels' },
              { id: 'pricing', label: 'Pricing & Inclusions' },
              { id: 'policies', label: 'Discount & Policy' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3.5 px-4 text-xs sm:text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-emerald-400 text-emerald-400 font-semibold'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Scrollable Content Area */}
          <div className="p-6 overflow-y-auto space-y-6 flex-1">

            {/* TAB 1: ITINERARY */}
            {activeTab === 'itinerary' && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-emerald-400" /> Day-by-Day Travel Plan
                </h3>
                <div className="space-y-3 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-800">
                  {Object.entries(pkg.itinerary).map(([dayKey, dayValue], idx) => (
                    <div key={dayKey} className="relative pl-10">
                      <div className="absolute left-0 top-1.5 w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-400 text-emerald-400 flex items-center justify-center text-xs font-bold">
                        {idx}
                      </div>
                      <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                        <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 block mb-1">
                          {dayKey.replace('_', ' ')}
                        </span>
                        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                          {dayValue as string}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 2: ATTRACTIONS & HOTELS */}
            {activeTab === 'details' && (
              <div className="space-y-6">
                {/* Main Attractions */}
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2 mb-3">
                    <MapPin className="w-5 h-5 text-emerald-400" /> Main Attractions Visited
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {pkg.main_attractions?.map((place: string, idx: number) => (
                      <span 
                        key={idx}
                        className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 text-xs font-medium"
                      >
                        📍 {place}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Hotels List */}
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2 mb-3">
                    <Hotel className="w-5 h-5 text-emerald-400" /> Accommodations / Hotel Stay Options
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {pkg.hotel_names?.map((hotel: string, idx: number) => (
                      <div key={idx} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                        {hotel}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: PRICING & INCLUSIONS */}
            {activeTab === 'pricing' && (
              <div className="space-y-6">
                {/* Pricing Cards */}
                <div>
                  <h3 className="text-base font-bold text-white mb-3">Package Pricing Options</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {Object.entries(pkg.pricing).map(([tierKey, priceValue]) => (
                      <div key={tierKey} className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
                        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                          {tierKey.replace(/_/g, ' ')}
                        </span>
                        <p className="text-base font-bold text-emerald-400">{priceValue as string}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Services Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                  <div>
                    <h4 className="text-sm font-bold text-emerald-400 flex items-center gap-2 mb-3">
                      <CheckCircle className="w-4 h-4" /> Services Included
                    </h4>
                    <ul className="space-y-2">
                      {pkg.services_included?.map((item: string, idx: number) => (
                        <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                          <span className="text-emerald-400 font-bold">•</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-rose-400 flex items-center gap-2 mb-3">
                      <XCircle className="w-4 h-4" /> Services Not Included
                    </h4>
                    <ul className="space-y-2">
                      {pkg.services_not_included?.map((item: string, idx: number) => (
                        <li key={idx} className="text-xs text-slate-400 flex items-start gap-2">
                          <span className="text-rose-400 font-bold">•</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: DISCOUNTS & POLICIES */}
            {activeTab === 'policies' && (
              <div className="space-y-6">
                {/* Children Policy */}
                <div>
                  <h3 className="text-base font-bold text-white mb-3">Children Policy</h3>
                  <div className="space-y-2">
                    {Object.entries(companyInfo.children_policy || {}).map(([key, val]) => (
                      <div key={key} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs flex justify-between">
                        <span className="font-semibold text-slate-300 capitalize">{key.replace(/_/g, ' ')}:</span>
                        <span className="text-emerald-400">{val as string}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Discounts */}
                <div>
                  <h3 className="text-base font-bold text-white mb-3">Discounts & Privileges</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {Object.entries(companyInfo.discount_policy || {}).map(([key, val]) => (
                      <div key={key} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
                        <span className="font-bold text-emerald-400 uppercase block mb-1">{key.replace(/_/g, ' ')}</span>
                        <span className="text-slate-300">{val as string}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pickup Points */}
                <div>
                  <h3 className="text-base font-bold text-white mb-2">Pickup Locations</h3>
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs space-y-2">
                    <p><strong className="text-emerald-400">Lahore:</strong> {companyInfo.pickup_points?.lahore}</p>
                    <p><strong className="text-emerald-400">Islamabad:</strong> {companyInfo.pickup_points?.islamabad_rawalpindi}</p>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Footer Action Bar */}
          <div className="p-4 sm:p-6 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-xs text-slate-400">Starting Price</p>
              <p className="text-xl font-bold text-emerald-400">
                {pkg.pricing?.standard_4_5_sharing || "Rs. Contact for Price"}
              </p>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 sm:flex-none px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm text-center transition-colors flex items-center justify-center gap-2"
              >
                <Phone className="w-4 h-4" /> Book On WhatsApp
              </a>
            </div>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};