import React from "react";

const DiscountBanner: React.FC = () => (
  <aside
    aria-label="Special offer: 10% off all tour packages"
    className="h-11 w-full overflow-hidden bg-emerald-600 text-white"
  >
    <div className="flex h-full items-center">
      <div className="discount-marquee flex w-max items-center whitespace-nowrap text-sm font-semibold tracking-wide">
        {[0, 1].map((item) => (
          <div
            key={item}
            className="discount-marquee-group flex shrink-0 items-center gap-8 pl-4 pr-8"
            aria-hidden={item === 1}
          >
            <span>10% OFF ALL TOUR PACKAGES</span>
            <span className="text-emerald-100" aria-hidden="true">✦</span>
            <span className="font-medium">Plan your Pakistan adventure and save 10%</span>
            <span className="text-emerald-100" aria-hidden="true">✦</span>
          </div>
        ))}
      </div>
    </div>
    <style>{`
      .discount-marquee {
        animation: discount-marquee-scroll 32s linear infinite;
        will-change: transform;
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
