import { Link } from "react-router-dom";
import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import InfiniteScroller from "../components/Scroller";
import LoginModal from "../components/LoginModal";
import { motion } from "framer-motion";
import { Sparkles, Search, BookOpen, BrainCircuit, MessageCircle, BarChart3, ChevronRight, Zap } from "lucide-react";

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
    <div className="w-full flex-1 bg-white overflow-hidden">
      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />

      {/* ================= REFINED HERO ================= */}
      <section className="relative w-full min-h-screen flex items-center justify-center pt-20 pb-32 bg-white">
        {/* Subtle Gradient Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full -z-10 pointer-events-none">
          <div className="absolute top-[10%] left-[20%] w-[400px] h-[400px] bg-blue-400/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-[20%] right-[20%] w-[400px] h-[400px] bg-purple-400/10 rounded-full blur-[100px]" />
        </div>

        <div className="container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-blue-50 border border-blue-100 text-[11px] font-black uppercase tracking-[0.25em] text-blue-600 mb-10 shadow-sm">
              <Sparkles className="w-3.5 h-3.5" />
              DCRUST's Most Advanced Exam AI
            </div>

            <h1 className="text-6xl md:text-8xl lg:text-9xl font-black text-black leading-[0.9] tracking-tighter mb-10">
              EXAMS KI <br />
              <span className="text-blue-600">CHINTA KHATAM.</span>
            </h1>

            <p className="max-w-2xl mx-auto text-xl md:text-2xl text-gray-400 font-bold leading-tight mb-14 tracking-tight">
              Access 10,000+ papers, AI-powered repeated question counts, 
              and custom success roadmaps for every subject.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-5 px-4">
              <Link
                to="/papers"
                className="w-full sm:w-auto flex items-center justify-center gap-3 bg-black text-white px-12 py-6 rounded-[24px] text-lg font-black shadow-[0_20px_50px_-10px_rgba(0,0,0,0.3)] hover:scale-105 active:scale-95 transition-all"
              >
                <Search className="w-5 h-5" />
                Find Papers
              </Link>
              
              <Link
                to="/profile"
                className="w-full sm:w-auto flex items-center justify-center gap-3 bg-white text-black border-2 border-black/5 px-12 py-6 rounded-[24px] text-lg font-black shadow-xl hover:bg-gray-50 transition-all"
              >
                <BrainCircuit className="w-6 h-6 text-blue-600" />
                Deep AI Analysis
              </Link>
            </div>

            <div className="mt-16 flex flex-col items-center gap-5">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map(i => (
                  <img key={i} className="h-12 w-12 rounded-full border-4 border-white object-cover shadow-xl" src={`https://i.pravatar.cc/150?img=${i + 20}`} alt="Student" />
                ))}
              </div>
              <p className="text-xs font-black text-gray-300 uppercase tracking-[0.3em]">
                TRUSTED BY <span className="text-black">120+ DCRUST STUDENTS</span>
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ================= INFINITE SCROLLER ================= */}
      <div className="w-full bg-white py-14 border-y border-black/5">
        <InfiniteScroller />
      </div>

      {/* ================= AI REVOLUTION SECTION ================= */}
      <section className="py-32 bg-white relative">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-24 items-center">
            <div>
              <div className="w-20 h-1.5 bg-blue-600 mb-10 rounded-full" />
              <h2 className="text-5xl md:text-7xl font-black tracking-tighter text-black mb-10 leading-[0.9]">
                HOW IT <br />
                WORKS.
              </h2>
              <p className="text-2xl text-gray-400 font-bold mb-14 tracking-tight leading-snug">
                We use a triple-engine AI pipeline to analyze years of question paper trends so you don't have to.
              </p>

              <div className="space-y-10">
                <FeatureItem 
                  icon={<BarChart3 className="w-7 h-7 text-blue-600" />}
                  title="Question Frequency"
                  desc="Instantly see which questions are repeated most in the last 10 years."
                />
                <FeatureItem 
                  icon={<MessageCircle className="w-7 h-7 text-purple-600" />}
                  title="AI Exam Sage"
                  desc="Chat with an expert AI trained on your specific DCRUST syllabus."
                />
                <FeatureItem 
                  icon={<Zap className="w-7 h-7 text-orange-500" />}
                  title="Success Roadmaps"
                  desc="Get unit-wise study priorities to score maximum marks in minimum time."
                />
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-blue-600/5 rounded-[48px] blur-3xl" />
              <div className="relative bg-white rounded-[48px] p-10 md:p-14 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.1)] border border-black/5 overflow-hidden group">
                 <div className="space-y-8">
                    <div className="flex items-center gap-5 border-b border-black/5 pb-8">
                      <div className="w-14 h-14 bg-black rounded-2xl flex items-center justify-center text-white">
                        <BrainCircuit className="w-7 h-7" />
                      </div>
                      <div>
                        <div className="text-black font-black text-xl">AI Deep Analysis</div>
                        <div className="text-blue-600 text-[10px] uppercase font-black tracking-widest">NVIDIA 405B Powered</div>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-3xl p-8 border border-black/5 transform group-hover:scale-[1.02] transition-transform">
                       <div className="text-blue-600 text-[10px] font-black uppercase tracking-widest mb-4">Most Repeated Topic</div>
                       <div className="text-2xl font-black text-black mb-3">Waterfall Model</div>
                       <div className="text-gray-500 font-bold italic text-base leading-relaxed">"Appeared in 2021, 2022, 2023 and 2024 (CSE-301)."</div>
                    </div>

                    <div className="flex gap-4">
                       <div className="h-14 flex-1 bg-gray-50 rounded-2xl border border-black/5" />
                       <div className="w-14 h-14 bg-black text-white rounded-2xl flex items-center justify-center">
                          <ChevronRight className="w-6 h-6" />
                       </div>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= TOOLS STACK SECTION ================= */}
      <section className="bg-white py-32 border-t border-black/5">
        <div className="container mx-auto px-6">
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-black mb-8">BUILT FOR DCRUSTIANS.</h2>
            <p className="text-xl text-gray-400 font-bold max-w-2xl mx-auto tracking-tight">Access papers for CSE, ECE, ME, CE and all other branches in one place.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
             <ToolCard 
               icon={<Search className="w-7 h-7" />}
               title="Smart Search"
               desc="Find papers by subject code or name in under 10 seconds."
               badge="INSTANT"
             />
             <ToolCard 
               icon={<BookOpen className="w-7 h-7" />}
               title="Full Archive"
               desc="Access papers from 2018 to 2024 for all semesters."
               badge="10K+ PAPERS"
             />
             <ToolCard 
               icon={<BarChart3 className="w-7 h-7" />}
               title="Exam Trends"
               desc="Understand the marking scheme and pattern for each subject."
               badge="ANALYTICS"
             />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 bg-white text-center">
         <div className="container mx-auto px-6">
            <h3 className="text-5xl md:text-7xl font-black mb-12 tracking-tighter leading-none">START PREPARING <br /> THE SMART WAY.</h3>
            <Link
              to="/papers"
              className="inline-flex items-center gap-4 bg-black text-white px-14 py-7 rounded-[32px] text-xl font-black shadow-2xl hover:scale-105 active:scale-95 transition-all"
            >
              Access All Papers <ChevronRight className="w-6 h-6" />
            </Link>
         </div>
      </section>
    </div>
  );
}

function FeatureItem({ icon, title, desc }) {
  return (
    <div className="flex gap-8 items-start group">
      <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center shrink-0 border border-blue-100 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <div>
        <h4 className="text-2xl font-black text-black mb-1 leading-tight">{title}</h4>
        <p className="text-gray-400 font-bold text-base leading-relaxed tracking-tight">{desc}</p>
      </div>
    </div>
  );
}

function ToolCard({ icon, title, desc, badge }) {
  return (
    <div className="bg-white p-12 rounded-[48px] border border-black/5 shadow-sm hover:shadow-2xl transition-all group">
      <div className="flex justify-between items-start mb-12">
        <div className="w-16 h-16 bg-black text-white rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-transform">
          {icon}
        </div>
        <span className="text-[10px] font-black tracking-[0.2em] text-blue-600 bg-blue-50 px-4 py-1.5 rounded-full uppercase">
          {badge}
        </span>
      </div>
      <h4 className="text-3xl font-black text-black mb-5 tracking-tight">{title}</h4>
      <p className="text-gray-400 font-bold leading-relaxed tracking-tight text-lg">{desc}</p>
    </div>
  );
}

export default Home;


