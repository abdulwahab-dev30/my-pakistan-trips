import React from "react";
import { Helmet } from "react-helmet-async";
import { ArrowRight, CheckCircle2, Clock3, Globe2, MapPin, MessageCircle, Plane, ShieldCheck, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import WhatsAppButton from "../components/WhatsAppButton";
import { internationalTours, internationalTourAudienceNote } from "../data/internationalTours";

const SITE = "https://mypakistantrips.com";

export default function InternationalTours() {
  const tour = internationalTours[0];
  const title = "Pakistan Tours for International Travellers | My Pakistan Trips";
  const description = "Explore a sample Pakistan tour for international travellers, with cultural heritage, scenic landscapes, and a personalised travel inquiry.";

  return (
    <>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={SITE + "/international-tours"} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={tour.image} />
        <meta property="og:url" content={SITE + "/international-tours"} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "TouristTrip",
          name: tour.title,
          description: tour.overview,
          touristType: "International travellers",
          itinerary: { "@type": "ItemList", itemListElement: tour.itinerary.map((day, index) => ({
            "@type": "ListItem", position: index + 1, name: day.title, description: day.description,
          })) },
        })}</script>
      </Helmet>
      <div className="min-h-screen bg-slate-950 text-white">
        <Navbar />
        <main className="pt-36 pb-20">
          <section className="relative isolate overflow-hidden">
            <div className="absolute inset-0 -z-10">
              <img src={tour.image} alt="Mountain scenery in northern Pakistan" className="h-full w-full object-cover opacity-25" fetchPriority="high" />
              <div className="absolute inset-0 bg-gradient-to-b from-slate-950/55 via-slate-950/90 to-slate-950" />
            </div>
            <div className="mx-auto max-w-7xl px-6 py-14 lg:px-12 lg:py-20">
              <div className="max-w-3xl">
                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-emerald-300"><Globe2 className="h-4 w-4" /> For international travellers</span>
                <h1 className="mt-6 text-4xl font-extrabold leading-tight tracking-tight sm:text-6xl">See Pakistan from a <span className="bg-gradient-to-r from-emerald-300 to-teal-200 bg-clip-text text-transparent">new perspective.</span></h1>
                <p className="mt-6 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">Thoughtfully planned journeys that bring together Pakistan’s living heritage, generous hospitality, and extraordinary mountain scenery.</p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <a href="#international-demo" className="inline-flex items-center gap-2 rounded-xl bg-emerald-400 px-5 py-3 font-bold text-slate-950 transition hover:bg-emerald-300">Explore sample package <ArrowRight className="h-4 w-4" /></a>
                  <a href={tour.whatsappLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-5 py-3 font-semibold text-white transition hover:bg-white/10"><MessageCircle className="h-4 w-4" /> Ask us a question</a>
                </div>
              </div>
            </div>
          </section>

          <section className="mx-auto max-w-7xl px-6 py-12 lg:px-12">
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { icon: MapPin, title: "Culture & heritage", detail: "Discover cities, historic places and local traditions." },
                { icon: Plane, title: "Personal trip planning", detail: "Discuss arrival plans, dates and travel preferences with our team." },
                { icon: ShieldCheck, title: "Details confirmed upfront", detail: "Confirm routes, inclusions and final pricing before booking." },
              ].map((item) => <article key={item.title} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
                <item.icon className="h-6 w-6 text-emerald-400" /><h2 className="mt-4 font-bold text-white">{item.title}</h2><p className="mt-2 text-sm leading-relaxed text-slate-400">{item.detail}</p>
              </article>)}
            </div>
          </section>

          <section id="international-demo" className="mx-auto max-w-7xl scroll-mt-36 px-6 py-10 lg:px-12">
            <div className="mb-8 max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-widest text-emerald-400">Sample itinerary</p>
              <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl">A first journey through Pakistan</h2>
              <p className="mt-4 leading-relaxed text-slate-400">We’re starting with one demo package. This is illustrative content to show the kind of journey we can discuss with international guests, not a confirmed departure or live quote.</p>
            </div>
            <article className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/60">
              <div className="grid lg:grid-cols-2">
                <div className="relative min-h-72 lg:min-h-full">
                  <img src={tour.image} alt="Mountain landscape in Pakistan" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
                  <div className="absolute left-5 top-5 rounded-full border border-emerald-300/30 bg-slate-950/80 px-3 py-1.5 text-xs font-bold text-emerald-300"><Sparkles className="mr-1 inline h-3.5 w-3.5" /> {tour.label}</div>
                </div>
                <div className="p-6 sm:p-8 lg:p-10">
                  <div className="flex flex-wrap items-center gap-3 text-sm text-slate-400"><span className="inline-flex items-center gap-1.5"><Clock3 className="h-4 w-4 text-emerald-400" /> {tour.duration}</span><span>·</span><span>Culture and nature</span></div>
                  <h3 className="mt-4 text-2xl font-extrabold leading-tight sm:text-3xl">{tour.title}</h3>
                  <p className="mt-4 text-sm leading-relaxed text-slate-300">{tour.overview}</p>
                  <div className="mt-6 rounded-2xl border border-emerald-400/20 bg-emerald-400/5 p-4">
                    <p className="text-xs uppercase tracking-wider text-slate-400">Illustrative starting estimate</p>
                    <p className="mt-1 text-3xl font-extrabold text-emerald-300">US$ {tour.priceFromUsd.toLocaleString("en-US")} <span className="text-sm font-medium text-slate-300">/ person</span></p>
                    <p className="mt-2 text-xs leading-relaxed text-slate-400">{tour.priceNote}</p>
                  </div>
                  <div className="mt-6">
                    <h4 className="font-bold text-white">Highlights</h4>
                    <ul className="mt-3 space-y-2">{tour.highlights.map((highlight) => <li key={highlight} className="flex gap-2 text-sm text-slate-300"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />{highlight}</li>)}</ul>
                  </div>
                  <a href={tour.whatsappLink} target="_blank" rel="noopener noreferrer" className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-400 px-5 py-3.5 font-bold text-slate-950 transition hover:bg-emerald-300 sm:w-auto"><MessageCircle className="h-4 w-4" /> Enquire about this trip</a>
                </div>
              </div>
            </article>
          </section>

          <section className="mx-auto max-w-7xl px-6 py-10 lg:px-12">
            <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
              <div><p className="text-sm font-semibold uppercase tracking-widest text-emerald-400">The journey</p><h2 className="mt-3 text-3xl font-extrabold">Sample 7-day itinerary</h2><p className="mt-4 text-sm leading-relaxed text-slate-400">The final route may change with flight times, road access, weather and guest preferences.</p></div>
              <ol className="space-y-3">{tour.itinerary.map((day) => <li key={day.day} className="grid gap-3 rounded-2xl border border-slate-800 bg-slate-900/50 p-4 sm:grid-cols-[75px_1fr]"><span className="text-sm font-bold text-emerald-400">{day.day}</span><div><h3 className="font-bold">{day.title}</h3><p className="mt-1 text-sm leading-relaxed text-slate-400">{day.description}</p></div></li>)}</ol>
            </div>
          </section>

          <section className="mx-auto max-w-7xl px-6 py-10 lg:px-12">
            <div className="grid gap-5 md:grid-cols-2">
              <article className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6"><h2 className="text-xl font-bold">Proposed inclusions</h2><ul className="mt-4 space-y-3">{tour.included.map((item) => <li key={item} className="flex gap-2 text-sm text-slate-300"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />{item}</li>)}</ul></article>
              <article className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6"><h2 className="text-xl font-bold">Not included in this estimate</h2><ul className="mt-4 space-y-3">{tour.excluded.map((item) => <li key={item} className="flex gap-2 text-sm text-slate-300"><span className="text-amber-300">•</span>{item}</li>)}</ul></article>
            </div>
            <p className="mt-6 rounded-xl border border-amber-300/20 bg-amber-300/5 p-4 text-sm leading-relaxed text-amber-100/80">{internationalTourAudienceNote}</p>
            <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/70 p-6"><div><h2 className="text-xl font-bold">Planning a visit to Pakistan?</h2><p className="mt-2 text-sm text-slate-400">Tell us your travel dates, group size and interests. We’ll discuss options and confirm a tailored quotation.</p></div><a href={tour.whatsappLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-emerald-400 px-5 py-3 font-bold text-slate-950 hover:bg-emerald-300"><MessageCircle className="h-4 w-4" /> Contact on WhatsApp</a></div>
            <p className="mt-8 text-sm text-slate-500"><Link to="/tours" className="text-emerald-400 hover:text-emerald-300">Looking for our existing Pakistan tour packages? View domestic tours →</Link></p>
          </section>
        </main>
        <Footer />
        <WhatsAppButton />
      </div>
    </>
  );
}
