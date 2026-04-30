import { Link } from "react-router-dom";
import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import InfiniteScroller from "../components/Scroller";
import LoginModal from "../components/LoginModal";

function Home() {
  const { user, loading } = useContext(AuthContext);
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      const timer = setTimeout(() => setShowLoginModal(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [user, loading]);

  return (
    <div className="w-full flex-1 bg-white">
      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />

   {/* ================= FULLSCREEN HERO ================= */}
<section className="w-screen min-h-screen bg-gray-50">
  <div className="w-full h-full">

    <div className="
      w-full min-h-screen
      bg-white
      flex items-center justify-center
      px-4 sm:px-8
    ">

      <div className="text-center max-w-5xl w-full">

        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight tracking-tight mb-6">
          Find Past Year Question Papers
          <br />
          <span className="text-primary-600">
            In Under 10 Seconds
          </span>
        </h1>

        <p className="mx-auto max-w-2xl text-base sm:text-lg md:text-xl text-gray-600 leading-relaxed mb-10">
          Access thousands of previous year question papers from your college.
          Search by subject, filter by branch, semester, and year.
        </p>

        {/* CTA + Trust */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
          <Link
            to="/papers"
            className="inline-flex items-center justify-center rounded-full bg-gray-900 px-7 py-4 text-white text-base font-semibold shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl"
          >
            Browse Question Papers →
          </Link>

          <div className="flex items-center gap-3 text-sm text-gray-600">
            <div className="flex -space-x-2">
              <img className="h-8 w-8 rounded-full border-2 border-white" src="https://i.pravatar.cc/32?img=1" />
              <img className="h-8 w-8 rounded-full border-2 border-white" src="https://i.pravatar.cc/32?img=2" />
              <img className="h-8 w-8 rounded-full border-2 border-white" src="https://i.pravatar.cc/32?img=3" />
            </div>
            <span>
              ⭐⭐⭐⭐⭐ <br className="sm:hidden" />
              Trusted by 1000+ students
            </span>
          </div>
        </div>

        {/* Branch Strip */}
        <div className="mt-16 border-t pt-10">
          <p className="mb-6 text-sm text-gray-500">
            Loved by students across all branches
          </p>

          <div className="flex flex-wrap items-center justify-center gap-10 opacity-70">
            <span className="font-semibold">CSE</span>
            <span className="font-semibold">ECE</span>
            <span className="font-semibold">ME</span>
            <span className="font-semibold">CE</span>
            <span className="font-semibold">EE</span>
          </div>
        </div>

      </div>
    </div>
  </div>
</section>


      {/* ================= INFINITE SCROLLER ================= */}
      <div className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] mt-16">
        <InfiniteScroller />
      </div>
{/* ================= TOOLS STACK SECTION ================= */}
<section className="w-full bg-white py-20 sm:py-28">
  <div className="mx-auto max-w-7xl px-4 sm:px-6">

    {/* Top Badge */}
    <div className="flex justify-center mb-6">
      <span className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-4 py-1.5 text-xs font-medium text-gray-600">
        ⚙️ BUILT IN TOOLS
      </span>
    </div>

    {/* Heading */}
    <h2 className="text-center text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-gray-900 mb-10">
      An entire stack of tools that keep
      <br />
      <span className="inline-flex items-center gap-2">
        your
        exams moving
      </span>
    </h2>

    {/* Tabs */}
    <div className="flex flex-wrap justify-center gap-2 mb-16">
      {[
        "All Branches",
        "CSE",
        "ECE",
        "ME",
        "CE",
        "EE",
      ].map((item, i) => (
        <span
          key={i}
          className={`rounded-full px-4 py-2 text-sm ${
            i === 0
              ? "bg-gray-900 text-white"
              : "bg-gray-100 text-gray-600"
          }`}
        >
          {item}
        </span>
      ))}
    </div>

    {/* Cards */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">

      {/* Card 1 */}
      <div className="relative rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
        <span className="absolute top-6 left-6 flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold">
          1
        </span>

        <h3 className="mt-10 text-xl font-semibold text-gray-900 mb-3">
          Smart Paper Search
        </h3>
        <p className="text-gray-600 leading-relaxed">
          Instantly search previous year question papers by subject, semester,
          year and session — zero confusion.
        </p>

        {/* Floating UI */}
        <div className="mt-8 rounded-2xl bg-gray-50 p-4 text-sm shadow-inner">
          🔍 Results found in <strong>0.4s</strong>
        </div>
      </div>

      {/* Card 2 */}
      <div className="relative rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
        <span className="absolute top-6 left-6 flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold">
          2
        </span>

        <h3 className="mt-10 text-xl font-semibold text-gray-900 mb-3">
          Organized Inventory
        </h3>
        <p className="text-gray-600 leading-relaxed">
          Papers are auto-categorized by branch, semester, subject code and exam
          year for quick access.
        </p>

        <div className="mt-8 rounded-2xl bg-gray-50 p-4 text-sm shadow-inner">
          📂 10,200+ papers indexed
        </div>
      </div>

      {/* Card 3 */}
      <div className="relative rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
        <span className="absolute top-6 left-6 flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold">
          3
        </span>

        <h3 className="mt-10 text-xl font-semibold text-gray-900 mb-3">
          Performance Dashboard
        </h3>
        <p className="text-gray-600 leading-relaxed">
          Track most searched subjects, trending exams, and paper availability
          across branches.
        </p>

        <div className="mt-8 rounded-2xl bg-gray-50 p-4 text-sm shadow-inner">
          📊 Updated Monthly
        </div>
      </div>

    </div>
  </div>
</section>


      {/* ================= ANIMATIONS ================= */}
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0 }
            to { opacity: 1 }
          }
          @keyframes slideUp {
            from { opacity: 0; transform: translateY(12px) }
            to { opacity: 1; transform: translateY(0) }
          }
        `}
      </style>
    </div>
  );
}

function Feature({ icon, title, desc }) {
  return (
    <div className="group bg-white p-6 sm:p-8 rounded-xl border border-gray-100 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-gray-200">
      <div className="text-4xl sm:text-5xl mb-4 transition-transform duration-300 group-hover:scale-105">
        {icon}
      </div>
      <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 tracking-tight">
        {title}
      </h3>
      <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
        {desc}
      </p>
    </div>
  );
}

export default Home;
