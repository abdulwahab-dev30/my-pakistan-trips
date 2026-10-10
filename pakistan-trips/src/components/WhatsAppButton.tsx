import React from 'react';
import { MessageCircle } from 'lucide-react';

// Import central JSON data for official contact number
import tripData from '../data/trips-data.json';

export const WhatsAppButton: React.FC = () => {
  // Safe WhatsApp number extraction from JSON
  const rawContact = tripData.contact_numbers?.[0] || '03494886076';
  const whatsappNumber = '92' + String(rawContact).replace(/[^0-9]/g, '').replace(/^0/, '');

  // Default pre-filled message text
  const defaultMessage = "Assalam-o-Alaikum! I am visiting the My Pakistan Trips website and I would like to get more details about your upcoming tour packages and availability.";

  // Use direct phone number with encoded text query parameter
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(defaultMessage)}`;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        className="relative flex items-center justify-center w-14 h-14 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-2xl shadow-emerald-500/50 transition-all duration-300 hover:scale-110 group"
      >
        {/* Pulse Ring Animation */}
        <span className="absolute inset-0 rounded-full bg-emerald-400 opacity-75 animate-ping -z-10" />

        <MessageCircle className="w-7 h-7 fill-current" />

        {/* Tooltip on Hover */}
        <span className="absolute right-16 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl pointer-events-none">
          Chat on WhatsApp
        </span>
      </a>
    </div>
  );
};

export default WhatsAppButton;