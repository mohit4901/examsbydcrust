function InfiniteScroller() {
    return (
      <div className="w-full overflow-hidden py-8">
        <div className="relative flex">
          <div className="flex shrink-0 animate-marquee-left">
            {Array.from({ length: 6 }).map((_, i) => (
              <span
                key={i}
                className="mx-12 text-6xl font-bold text-gray-900 tracking-tight whitespace-nowrap"
              >
                EXAM KI CHINTA KHATAM
              </span>
            ))}
          </div>
  
          <div
            className="flex shrink-0 animate-marquee-left"
            aria-hidden="true"
          >
            {Array.from({ length: 6 }).map((_, i) => (
              <span
                key={i}
                className="mx-12 text-6xl font-bold text-gray-900 tracking-tight whitespace-nowrap"
              >
                EXAM KI CHINTA KHATAM
              </span>
            ))}
          </div>
        </div>
  
        <style>
          {`
            @keyframes marquee-left {
              0% {
                transform: translateX(0);
              }
              100% {
                transform: translateX(-100%);
              }
            }
            .animate-marquee-left {
              animation: marquee-left 50s linear infinite;
              will-change: transform;
            }
            @media (prefers-reduced-motion: reduce) {
              .animate-marquee-left {
                animation: none;
              }
            }
          `}
        </style>
      </div>
    );
  }
  
  export default InfiniteScroller;
  