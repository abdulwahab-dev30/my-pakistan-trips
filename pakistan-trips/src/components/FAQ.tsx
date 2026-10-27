import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ChevronDown, HelpCircle, PhoneCall } from 'lucide-react';
import tripData from '../data/trips-data.json';
import { supabase, supabaseConfigured } from '../lib/supabase';

interface FAQItem {
  id?: string;
  question: string;
  answer: string;
  sort_order?: number;
}

const legacyFAQs: FAQItem[] = (() => {
  const contactNumbers = (tripData as any).contact_numbers || ['03494886076'];
  const pickupPoints = (tripData as any).pickup_points || {};
  const childrenPolicy = (tripData as any).children_policy || {};
  const discountPolicy = (tripData as any).discount_policy || {};

  return [
    {
      question: 'Where are the pickup points in Lahore and Islamabad?',
      answer: `Lahore Pickup: ${pickupPoints.lahore || 'Thokar Niaz Baig'}.
Islamabad Pickup: ${pickupPoints.islamabad_rawalpindi || 'Daewoo Terminal EME'}.`
    },
    {
      question: 'What is the policy and charges for children?',
      answer: `• Under 3 Years: ${childrenPolicy.under_3_years || 'Free'}
• 3 to 8 Years: ${childrenPolicy['3_to_8_years'] || 'Half Charges'}
• Above 8 Years: ${childrenPolicy.above_8_years || 'Full Charges'}`
    },
    {
      question: 'Are there any group or traveler discounts available?',
      answer: `• Group Discount: ${discountPolicy.group_discount || 'Available'}
• Children Discount: ${discountPolicy.children_discount || '50% off'}
• Lifetime Card: ${discountPolicy.lifetime_membership_card || '10% off'}
• Traveler Card: ${discountPolicy.traveller_card || '10% off'}`
    },
    {
      question: 'What is the Meezan Bank account number for payment?',
      answer: 'Meezan Bank Account Number: 6402 0114 9075 75'
    },
    {
      question: 'What services are included in standard tour packages?',
      answer: 'All standard tour packages include AC private transportation (Coaster Saloon or Grand Cabin), quality hygienic meals (Breakfasts & Dinners), fuel/road toll expenses, hotel stay, and expert guided tour service.'
    },
    {
      question: 'Are jeep charges and fort entry tickets included?',
      answer: 'Boating, fort entry tickets, chairlifts, and 4x4 jeep safari charges are generally self-based, unless you have booked a Deluxe Package where jeep services are included.'
    }
  ];
})();

export const FAQ: React.FC = () => {
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  const [faqs, setFaqs] = useState<FAQItem[]>(legacyFAQs);

  useEffect(() => {
    if (!supabaseConfigured || !supabase) return;
    let active = true;

    const loadFAQs = async () => {
      const { data, error } = await supabase
        .from('faqs')
        .select('id, question, answer, sort_order')
        .eq('published', true)
        .order('sort_order', { ascending: true });

      if (!active) return;
      // Keep the existing homepage FAQs visible if the table is not set up yet
      // or a request fails. Once rows exist, the published database list is used.
      if (!error && data && data.length > 0) {
        setFaqs(data as FAQItem[]);
      }
    };

    void loadFAQs();
    return () => { active = false; };
  }, []);

  const contactNumbers = (tripData as any).contact_numbers || ['03494886076'];
  const rawContact = contactNumbers[0] || '03494886076';
  const whatsappNumber = '92' + String(rawContact).replace(/[^0-9]/g, '').replace(/^0/, '');

  return (
    <section id="faq" className="py-24 bg-slate-950 text-white relative overflow-hidden scroll-mt-32">
      <div className="absolute top-1/4 -right-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="max-w-4xl mx-auto px-6 lg:px-12 relative z-10">
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

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <motion.div
                key={faq.id || faq.question}
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
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
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
