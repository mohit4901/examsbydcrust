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

      {/* ================= PREMIUM HERO ================= */}
      <section className="relative w-full min-h-screen flex items-center justify-center pt-20 pb-32">
        {/* Abstract Background Decoration */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full -z-10 pointer-events-none overflow-hidden">
          <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-50 rounded-full blur-[120px] opacity-60" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-50 rounded-full blur-[120px] opacity-60" />
        </div>

        <div className="container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/5 border border-black/5 text-[10px] font-black uppercase tracking-[0.2em] text-black/60 mb-8">
              <Sparkles className="w-3 h-3 text-blue-600" />
              Powered by Multi-Model AI
            </div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-black leading-[0.95] tracking-tighter mb-8">
              CRACK EXAMS <br />
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent italic">WITHOUT STRESS</span>
            </h1>

            <p className="max-w-2xl mx-auto text-lg md:text-xl text-gray-500 font-medium leading-relaxed mb-12">
              DCRUST's smartest exam companion. Access 10,000+ papers and get 
              AI-powered roadmaps, repeated question analysis, and 24/7 expert chat.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 px-4">
              <Link
                to="/papers"
                className="w-full sm:w-auto flex items-center justify-center gap-3 bg-black text-white px-10 py-5 rounded-2xl text-base font-black shadow-2xl hover:scale-105 active:scale-95 transition-all"
              >
                <Search className="w-5 h-5" />
                Browse Papers
              </Link>
              
              <Link
                to="/papers"
                className="w-full sm:w-auto flex items-center justify-center gap-3 bg-white text-black border-2 border-black/5 px-10 py-5 rounded-2xl text-base font-black shadow-xl hover:bg-gray-50 transition-all"
              >
                <BrainCircuit className="w-5 h-5 text-purple-600" />
                AI Deep Analysis
              </Link>
            </div>

            <div className="mt-12 flex flex-col items-center gap-4">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map(i => (
                  <img key={i} className="h-10 w-10 rounded-full border-4 border-white object-cover shadow-lg" src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="Student" />
                ))}
              </div>
              <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">
                Trusted by <span className="text-black">1200+ DCRUST Students</span>
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ================= INFINITE SCROLLER ================= */}
      <div className="w-full bg-black py-12 rotate-[-1deg] scale-110 shadow-2xl z-10">
        <InfiniteScroller />
      </div>

      {/* ================= AI REVOLUTION SECTION ================= */}
      <section className="py-32 bg-white relative">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div>
              <div className="w-16 h-1 w-20 bg-blue-600 mb-8" />
              <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-black mb-8 leading-none">
                THE AI <br />
                REVOLUTION <br />
                IN EXAMS.
              </h2>
              <p className="text-xl text-gray-500 font-medium mb-12">
                We don't just give you papers. We give you the answers before the exam even starts. 
                Our triple-engine AI pipeline (Gemini, NVIDIA, Groq) works together to analyze years of trends.
              </p>

              <div className="space-y-6">
                <FeatureItem 
                  icon={<BarChart3 className="w-6 h-6 text-blue-600" />}
                  title="Repeated Question Tracker"
                  desc="Instantly find questions that appear every single year with frequency counts."
                />
                <FeatureItem 
                  icon={<MessageCircle className="w-6 h-6 text-purple-600" />}
                  title="24/7 AI Exam Sage"
                  desc="Chat with an AI trained specifically on DCRUST syllabus and past papers."
                />
                <FeatureItem 
                  icon={<Zap className="w-6 h-6 text-orange-500" />}
                  title="Success Roadmaps"
                  desc="Get unit-wise study plans based on what actually matters for the 75-mark exam."
                />
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-blue-600/5 rounded-[40px] blur-3xl" />
              <div className="relative bg-black rounded-[40px] p-8 md:p-12 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.3)] border border-white/10 overflow-hidden group">
                 {/* Mock UI for AI */}
                 <div className="space-y-6">
                    <div className="flex items-center gap-4 border-b border-white/10 pb-6">
                      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-black">
                        <BrainCircuit className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="text-white font-black text-lg">CSE Deep Analysis</div>
                        <div className="text-white/40 text-xs uppercase font-bold tracking-widest">Llama 3.1 405B Active</div>
                      </div>
                    </div>

                    <div className="space-y-3 opacity-60">
                       <div className="h-4 bg-white/10 rounded-full w-[80%]" />
                       <div className="h-4 bg-white/10 rounded-full w-[60%]" />
                    </div>

                    <div className="bg-white/5 rounded-3xl p-6 border border-white/5 transform group-hover:scale-[1.02] transition-transform">
                       <div className="text-blue-400 text-xs font-black uppercase tracking-widest mb-3">Unit I Analysis</div>
                       <div className="text-white font-bold mb-2">Repeated Question (5 times):</div>
                       <div className="text-white/60 text-sm italic">"Define Waterfall Model and discuss its advantages and disadvantages in real-world projects."</div>
                    </div>

                    <div className="flex gap-3 pt-6">
                       <div className="h-12 flex-1 bg-white/5 rounded-2xl border border-white/5" />
                       <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-black">
                          <ChevronRight className="w-5 h-5" />
                       </div>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= TOOLS STACK SECTION ================= */}
      <section className="bg-gray-50 py-32 border-y border-black/5">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-black mb-6">EVERYTHING YOU NEED.</h2>
            <p className="text-gray-500 font-medium max-w-xl mx-auto">From first semester to final year, we've got every branch covered with precise resources.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
             <ToolCard 
               icon={<Search className="w-6 h-6" />}
               title="Smart Search"
               desc="Find any paper in 0.4 seconds using our optimized indexing."
               badge="ULTRA FAST"
             />
             <ToolCard 
               icon={<BookOpen className="w-6 h-6" />}
               title="Organized Library"
               desc="10,000+ papers categorized by branch, year and session."
               badge="10K+ PAPERS"
             />
             <ToolCard 
               icon={<BarChart3 className="w-6 h-6" />}
               title="Trend Analysis"
               desc="Visual data on which subjects are the hardest and most failed."
               badge="LIVE STATS"
             />
          </div>
        </div>
      </section>

      {/* Footer / CTA */}
      <section className="py-24 bg-white text-center">
         <div className="container mx-auto px-6">
            <h3 className="text-3xl md:text-5xl font-black mb-8 tracking-tighter">READY TO GET AN 'O' GRADE?</h3>
            <Link
              to="/register"
              className="inline-flex items-center gap-3 bg-black text-white px-12 py-6 rounded-3xl text-lg font-black shadow-2xl hover:scale-105 active:scale-95 transition-all"
            >
              Get Started Now <ChevronRight className="w-5 h-5" />
            </Link>
         </div>
      </section>

      <style>
        {`
          .custom-scrollbar::-webkit-scrollbar {
            width: 4px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.05);
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.2);
            border-radius: 10px;
          }
        `}
      </style>
    </div>
  );
}

function FeatureItem({ icon, title, desc }) {
  return (
    <div className="flex gap-6 items-start">
      <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center shrink-0 border border-black/5">
        {icon}
      </div>
      <div>
        <h4 className="text-lg font-black text-black mb-1">{title}</h4>
        <p className="text-gray-500 font-medium text-sm leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

function ToolCard({ icon, title, desc, badge }) {
  return (
    <div className="bg-white p-10 rounded-[32px] border border-black/5 shadow-sm hover:shadow-xl transition-all group">
      <div className="flex justify-between items-start mb-10">
        <div className="w-14 h-14 bg-black text-white rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
          {icon}
        </div>
        <span className="text-[10px] font-black tracking-widest text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase">
          {badge}
        </span>
      </div>
      <h4 className="text-2xl font-black text-black mb-4">{title}</h4>
      <p className="text-gray-500 font-medium leading-relaxed">{desc}</p>
    </div>
  );
}

export default Home;

