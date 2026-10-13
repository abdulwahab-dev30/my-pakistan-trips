import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ChevronDown, HelpCircle, PhoneCall } from 'lucide-react';

// Import central JSON data
import tripData from '../data/trips-data.json';

interface FAQItem {
  question: string;
  answer: string;
}

export const FAQ: React.FC = () => {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const toggleFAQ = (idx: number) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  // Safe WhatsApp contact number extraction
  const contactNumbers = (tripData as any).contact_numbers || ["03494886076"];
  const rawContact = contactNumbers[0] || "03494886076";
  const whatsappNumber = "92" + String(rawContact).replace(/[^0-9]/g, "").replace(/^0/, "");

  const pickupPoints = (tripData as any).pickup_points || {};
  const childrenPolicy = (tripData as any).children_policy || {};
  const discountPolicy = (tripData as any).discount_policy || {};
  const paymentMethods = (tripData as any).payment_methods || [];

  // Structured FAQs using JSON policies
  const faqs: FAQItem[] = [
    {
      question: "Where are the pickup points in Lahore and Islamabad?",
      answer: `Lahore Pickup: ${pickupPoints.lahore || 'Thokar Niaz Baig'}.\nIslamabad Pickup: ${pickupPoints.islamabad_rawalpindi || 'Daewoo Terminal EME'}.`
    },
    {
      question: "What is the policy and charges for children?",
      answer: `• Under 3 Years: ${childrenPolicy.under_3_years || 'Free'}\n• 3 to 8 Years: ${childrenPolicy['3_to_8_years'] || 'Half Charges'}\n• Above 8 Years: ${childrenPolicy.above_8_years || 'Full Charges'}`
    },
    {
      question: "Are there any group or traveler discounts available?",
      answer: `• Group Discount: ${discountPolicy.group_discount || 'Available'}\n• Children Discount: ${discountPolicy.children_discount || '50% off'}\n• Lifetime Card: ${discountPolicy.lifetime_membership_card || '10% off'}\n• Traveler Card: ${discountPolicy.traveller_card || '10% off'}`
    },
    {
      question: "What payment methods and bank accounts are accepted?",
      answer: `We accept online bank transfers and mobile wallets:\n• Meezan Bank Title: ${paymentMethods[0]?.account_title || 'N/A'} (${paymentMethods[0]?.account_number || 'N/A'})\n• Easypaisa: ${paymentMethods[3]?.account_title || 'N/A'} (${paymentMethods[3]?.account || 'N/A'})\n• Nayapay: ${paymentMethods[4]?.account_title || 'N/A'} (${paymentMethods[4]?.account || 'N/A'})`
    },
    {
      question: "What services are included in standard tour packages?",
      answer: "All standard tour packages include AC private transportation (Coaster Saloon or Grand Cabin), quality hygienic meals (Breakfasts & Dinners), fuel/road toll expenses, hotel stay, and expert guided tour service."
    },
    {
      question: "Are jeep charges and fort entry tickets included?",
      answer: "Boating, fort entry tickets, chairlifts, and 4x4 jeep safari charges are generally self-based, unless you have booked a Deluxe Package where jeep services are included."
    }
  ];

  return (
    <section id="faq" className="py-24 bg-slate-950 text-white relative overflow-hidden">
      {/* Background Decorative Lighting */}
      <div className="absolute top-1/4 -right-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-4xl mx-auto px-6 lg:px-12 relative z-10">
        
        {/* Section Header */}
        <div className="text-center space-y-4 mb-16">
          <motion.span 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-semibold uppercase tracking-wider"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Got Questions?
          </motion.span>

          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-5xl font-extrabold tracking-tight"
          >
            Frequently Asked <br />
            <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
              Questions & Policies
            </span>
          </motion.h2>
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                className="rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl overflow-hidden transition-colors"
              >
                <button
                  id={`faq-trigger-${idx}`}
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={`faq-panel-${idx}`}
                  onClick={() => toggleFAQ(idx)}
                  className="w-full p-6 text-left flex items-center justify-between gap-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400"
                >
                  <span className="text-base sm:text-lg font-bold text-white flex items-center gap-3">
                    <HelpCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                    {faq.question}
                  </span>
                  <div className={`p-2 rounded-full bg-slate-800 transition-transform duration-300 ${isOpen ? 'rotate-180 bg-emerald-500 text-slate-950' : 'text-slate-400'}`}>
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      id={`faq-panel-${idx}`}
                      role="region"
                      aria-labelledby={`faq-trigger-${idx}`}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="px-6 pb-6 text-xs sm:text-sm text-slate-300 font-light leading-relaxed whitespace-pre-line border-t border-slate-800/60 pt-4"
                    >
                      {faq.answer}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {/* Still Have Questions Box */}
        <div className="mt-12 p-6 rounded-3xl bg-slate-900/80 border border-slate-800 text-center space-y-3">
          <p className="text-sm text-slate-300">Have more questions about custom dates or private group booking?</p>
          <a
            href={`https://wa.me/${whatsappNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 transition-colors"
          >
            <PhoneCall className="w-4 h-4" /> Direct WhatsApp Support
          </a>
        </div>

      </div>
    </section>
  );
};

export default FAQ;