import React from "react";

const DiscountBanner: React.FC = () => (
  <aside
    aria-label="Special offer: 10% off all tour packages"
    className="h-11 w-full overflow-hidden bg-emerald-600 text-white"
  >
    <div className="flex h-full items-center">
      <div className="discount-marquee flex min-w-max items-center gap-8 whitespace-nowrap px-4 text-sm font-semibold tracking-wide">
        {[0, 1, 2, 3].map((item) => (
          <span key={item} className="inline-flex items-center gap-8" aria-hidden={item > 0}>
            <span>10% OFF ALL TOUR PACKAGES</span>
            <span className="text-emerald-100">✦</span>
            <span className="font-medium">Plan your Pakistan adventure and save 10%</span>
            <span className="text-emerald-100">✦</span>
          </span>
        ))}
      </div>
    </div>
    <style>{`
      .discount-marquee {
        animation: discount-marquee-scroll 32s linear infinite;
      }
      @keyframes discount-marquee-scroll {
        from { transform: translateX(0); }
        to { transform: translateX(-50%); }
      }
      @media (prefers-reduced-motion: reduce) {
        .discount-marquee { animation: none; }
      }
    `}</style>
  </aside>
);

export default DiscountBanner;
