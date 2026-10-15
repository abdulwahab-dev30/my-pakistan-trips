import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Send, Phone, Mail, MapPin, User, Users, Calendar, MessageSquare } from 'lucide-react';

// Import central JSON data
import tripData from '../data/trips-data.json';
import { useContactInfo } from '../lib/contactInfo';

export const CTA: React.FC = () => {
  const contact = useContactInfo();
  const packages = tripData.trip_packages || [];

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    selectedTrip: packages[0]?.title || '',
    departureCity: 'Lahore',
    groupSize: '2 People',
    notes: ''
  });

  const rawContact = contact.whatsapp || contact.phone || tripData.contact_numbers?.[0] || '03494886076';
  const whatsappNumber = '92' + String(rawContact).replace(/[^0-9]/g, '').replace(/^0/, '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const message = `*New Trip Booking Inquiry*\n\n` +
      `👤 *Name:* ${formData.name}\n` +
      `📞 *Phone/WhatsApp:* ${formData.phone}\n` +
      `🏔️ *Selected Trip:* ${formData.selectedTrip}\n` +
      `📍 *Departure City:* ${formData.departureCity}\n` +
      `👥 *Group Size:* ${formData.groupSize}\n` +
      (formData.notes ? `💬 *Notes:* ${formData.notes}\n` : '');

    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <section id="contact" className="py-24 bg-slate-950 text-white relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <motion.span 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-semibold uppercase tracking-wider"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Plan Your Journey
          </motion.span>

          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-5xl font-extrabold tracking-tight"
          >
            Ready to Explore <br />
            <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
              Pakistan's Best Valleys?
            </span>
          </motion.h2>

          <p className="text-slate-400 text-sm sm:text-base font-light">
            Fill out your details below to instantly reserve your seats or get a customized itinerary on WhatsApp.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Column: Direct Contact Info Badges */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-5 space-y-6"
          >
            <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl space-y-6 shadow-xl">
              <h3 className="text-xl font-bold text-white">Contact & Support</h3>

              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                  <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Call / WhatsApp</p>
                    <p className="text-sm font-bold text-white mt-0.5">{contact.phone || contact.contact_numbers[0] || '0349-4886076'}</p>
                    <p className="text-xs text-emerald-400">{contact.secondary_phone || contact.contact_numbers[1] || '0349-4369937'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                  <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Email Us</p>
                    <p className="text-sm font-bold text-white mt-0.5">{contact.email}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                  <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Head Office</p>
                    <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{contact.address}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Pickup Terminals Card */}
            <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl space-y-3">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">Standard Departure Terminals</h4>
              <p className="text-xs text-slate-300"><strong className="text-emerald-400">Lahore:</strong> {tripData.pickup_points?.lahore}</p>
              <p className="text-xs text-slate-300"><strong className="text-emerald-400">Islamabad:</strong> {tripData.pickup_points?.islamabad_rawalpindi}</p>
            </div>
          </motion.div>

          {/* Right Column: Glassmorphism Booking Form */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-7"
          >
            <form id="contact-form" onSubmit={handleSubmit} className="scroll-mt-36 p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900/95 to-slate-900/75 border border-emerald-500/20 backdrop-blur-xl shadow-[0_20px_70px_-20px_rgba(16,185,129,0.16)] space-y-6">
              <div className="mb-3"><span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-xs font-semibold tracking-wide text-emerald-300"><Sparkles className="w-3.5 h-3.5" /> PERSONALIZED TRIP PLANNING</span><h3 className="mt-4 text-2xl sm:text-3xl font-extrabold tracking-tight text-white">Customize Your Pakistan Tour</h3><p className="mt-2 text-sm leading-relaxed text-slate-400">Share your trip preferences and our team will help you plan a journey that fits your group and needs.</p></div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Full Name */}
                <div className="space-y-2">
                  <label htmlFor="contact-name" className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-emerald-400" /> Full Name
                  </label>
                  <input
                    id="contact-name"
                    name="name"
                    autoComplete="name"
                    type="text"
                    required
                    placeholder="Enter your name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>

                {/* Phone / WhatsApp */}
                <div className="space-y-2">
                  <label htmlFor="contact-phone" className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-emerald-400" /> WhatsApp Number
                  </label>
                  <input
                    id="contact-phone"
                    name="phone"
                    autoComplete="tel"
                    type="tel"
                    required
                    placeholder="e.g. 03001234567"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>

              {/* Package Select */}
              <div className="space-y-2">
                <label htmlFor="contact-trip" className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-emerald-400" /> Select Tour Package
                </label>
                <select
                  id="contact-trip"
                  name="selectedTrip"
                  value={formData.selectedTrip}
                  onChange={(e) => setFormData({ ...formData, selectedTrip: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors cursor-pointer"
                >
                  {packages.map((pkg: any, idx: number) => (
                    <option key={idx} value={pkg.title} className="bg-slate-900 text-white">
                      {pkg.title} ({pkg.duration})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Departure City */}
                <div className="space-y-2">
                  <label htmlFor="contact-departure-city" className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" /> Departure From
                  </label>
                  <select
                    id="contact-departure-city"
                    name="departureCity"
                    value={formData.departureCity}
                    onChange={(e) => setFormData({ ...formData, departureCity: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors cursor-pointer"
                  >
                    <option value="Lahore" className="bg-slate-900 text-white">Lahore</option>
                    <option value="Islamabad / Rawalpindi" className="bg-slate-900 text-white">Islamabad / Rawalpindi</option>
                    <option value="Other City" className="bg-slate-900 text-white">Other City</option>
                  </select>
                </div>

                {/* Group Size */}
                <div className="space-y-2">
                  <label htmlFor="contact-group-size" className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-emerald-400" /> Group Size / Persons
                  </label>
                  <select
                    id="contact-group-size"
                    name="groupSize"
                    value={formData.groupSize}
                    onChange={(e) => setFormData({ ...formData, groupSize: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors cursor-pointer"
                  >
                    <option value="1 Solo Person" className="bg-slate-900 text-white">1 Solo Person</option>
                    <option value="2 Persons (Couple)" className="bg-slate-900 text-white">2 Persons (Couple)</option>
                    <option value="3-5 Persons" className="bg-slate-900 text-white">3-5 Persons</option>
                    <option value="6-10 Persons" className="bg-slate-900 text-white">6-10 Persons</option>
                    <option value="10+ Persons (Group Discount)" className="bg-slate-900 text-white">10+ Persons (Group Discount)</option>
                  </select>
                </div>
              </div>

              {/* Special Requests / Notes */}
              <div className="space-y-2">
                <label htmlFor="contact-notes" className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-400" /> Additional Notes (Optional)
                </label>
                <textarea
                  id="contact-notes"
                  name="notes"
                  rows={3}
                  placeholder="Ask about private dates, hotel upgrades, or specific requirements..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors resize-none"
                />
              </div>

              {/* Submit Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all duration-300"
              >
                <Send className="w-4 h-4" />
                Submit & Send Booking Request on WhatsApp
              </motion.button>
            </form>
          </motion.div>

        </div>

      </div>
    </section>
  );
};

export default CTA;