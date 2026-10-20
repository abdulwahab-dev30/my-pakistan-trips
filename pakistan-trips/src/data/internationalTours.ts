export type InternationalTourDay = { day: string; title: string; description: string };

export type InternationalTour = {
  slug: string;
  title: string;
  duration: string;
  label: string;
  overview: string;
  image: string;
  priceFromUsd: number;
  priceNote: string;
  highlights: string[];
  itinerary: InternationalTourDay[];
  included: string[];
  excluded: string[];
  whatsappLink: string;
};

const demoMessage = encodeURIComponent(
  "Hello My Pakistan Trips, I am an international traveller interested in the 7-day Pakistan Highlights demo package. Please share the latest itinerary, availability, visa guidance, and a confirmed quotation."
);

export const internationalTours: InternationalTour[] = [
  {
    slug: "pakistan-highlights-7-days",
    title: "Pakistan Highlights: Mountains, Culture & Heritage",
    duration: "7 days · 6 nights",
    label: "Demo package",
    overview:
      "A sample journey for visitors discovering Pakistan for the first time, combining Islamabad, the historic streets of Lahore, and the mountain scenery around Hunza. The route, transport, accommodation, access and final price must be confirmed with our team before booking.",
    image:
      "https://images.unsplash.com/photo-1566837497312-7be4f6c1b2b5?auto=format&fit=crop&w=1400&q=80",
    priceFromUsd: 899,
    priceNote: "Illustrative price per person, based on two sharing. Not a live quote.",
    highlights: [
      "Lahore's historic architecture and food culture",
      "Islamabad and the Faisal Mosque area",
      "Scenic journey towards Hunza Valley",
      "Local guide and cultural experiences",
    ],
    itinerary: [
      { day: "Day 1", title: "Arrival in Islamabad", description: "Meet-and-greet by arrangement, hotel check-in, and a relaxed orientation depending on arrival time." },
      { day: "Day 2", title: "Islamabad to Lahore", description: "Travel to Lahore and explore selected heritage landmarks with a local guide." },
      { day: "Day 3", title: "Discover Lahore", description: "Visit the Walled City area, Badshahi Mosque surroundings, and local food spots subject to opening hours." },
      { day: "Day 4", title: "Journey towards the north", description: "Transfer towards the northern region with comfort stops; overnight location depends on the confirmed route." },
      { day: "Day 5", title: "Hunza Valley", description: "Enjoy mountain views and explore Karimabad and nearby cultural sites as conditions allow." },
      { day: "Day 6", title: "Hunza and scenic viewpoints", description: "Visit selected viewpoints and local communities; final stops depend on road and weather conditions." },
      { day: "Day 7", title: "Return and departure plan", description: "Transfer to the agreed airport or onward connection; exact arrangements depend on flight details." },
    ],
    included: [
      "Sample itinerary planning",
      "Proposed private ground transport",
      "Proposed accommodation on twin-sharing basis",
      "Local guiding for selected sightseeing",
    ],
    excluded: [
      "International flights and visa fees",
      "Meals unless explicitly confirmed in the final quote",
      "Travel insurance and personal expenses",
      "Unconfirmed entrance tickets, domestic flights, and optional activities",
    ],
    whatsappLink: `https://wa.me/923494886076?text=${demoMessage}`,
  },
];

export const internationalTourAudienceNote =
  "Designed as a sample for international visitors. Visa requirements, route accessibility, dates, accommodation, inclusions, and final pricing must be confirmed individually before any booking.";
