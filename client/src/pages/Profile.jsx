import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, 
  Book, 
  Calendar, 
  GraduationCap, 
  TrendingUp, 
  FileText, 
  Download,
  ChevronRight,
  Search,
  Star,
  Settings,
  Shield,
  X,
  Zap,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5050/api';

const Profile = () => {
  const { user } = useContext(AuthContext);
  const [myPapers, setMyPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aiInsights, setAiInsights] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [deepAnalysis, setDeepAnalysis] = useState(null);
  const [deepLoading, setDeepLoading] = useState(false);
  const [showDeepModal, setShowDeepModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [editData, setEditData] = useState({ 
    name: user?.name || '', 
    branch: user?.branch || '', 
    semester: user?.semester || 1 
  });

  const fetchAIInsights = async () => {
    setAiLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/ai/insights`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAiInsights(res.data.data);
      toast.success("AI Insights generated!");
    } catch (error) {
      console.error("AI Insights failed:", error);
      toast.error("Failed to generate AI insights");
    } finally {
      setAiLoading(false);
    }
  };

  const fetchDeepAnalysis = async (subjectCode) => {
    setDeepLoading(true);
    setShowDeepModal(true);
    setDeepAnalysis(null);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/ai/deep-analysis/${subjectCode}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDeepAnalysis(res.data.data);
    } catch (error) {
      console.error("Deep Analysis failed:", error);
      toast.error("AI couldn't analyze the PDFs at this moment.");
    } finally {
      setDeepLoading(false);
    }
  };

  const handleEditProfile = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/auth/profile`, editData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Profile updated successfully!");
      setShowEditModal(false);
      // We force a refresh to update the global auth state easily
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      toast.error("Update failed. Please try again.");
    }
  };

  useEffect(() => {
    const fetchMyPapers = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_URL}/papers/my-papers`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMyPapers(res.data.data);
      } catch (error) {
        console.error("Error fetching personalized papers:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchMyPapers();
    }
  }, [user]);

  if (!user) return null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 text-white min-h-screen">
      {/* Header Profile Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a] rounded-[40px] p-8 border border-white/5 mb-8 flex flex-col md:flex-row items-center gap-8 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-[100px] -mr-32 -mt-32" />
        
        <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center text-black text-4xl font-black shadow-[0_0_50px_rgba(255,255,255,0.1)] relative z-10">
          {user.name[0]}
        </div>
        
        <div className="text-center md:text-left flex-1 relative z-10">
          <h1 className="text-4xl font-black mb-2 tracking-tighter">{user.name}</h1>
          <p className="text-gray-400 mb-6 font-medium">{user.email}</p>
          <div className="flex flex-wrap justify-center md:justify-start gap-3">
            <div className="bg-white/5 px-4 py-2 rounded-2xl flex items-center gap-2 border border-white/5 backdrop-blur-md">
              <GraduationCap className="w-4 h-4 text-white/60" />
              <span className="text-sm font-bold uppercase tracking-wider">{user.branch}</span>
            </div>
            <div className="bg-white/5 px-4 py-2 rounded-2xl flex items-center gap-2 border border-white/5 backdrop-blur-md">
              <Calendar className="w-4 h-4 text-white/60" />
              <span className="text-sm font-bold">Semester {user.semester}</span>
            </div>
          </div>
        </div>

        <div className="hidden lg:block bg-white/5 p-6 rounded-[32px] border border-white/5 backdrop-blur-xl relative z-10">
          <TrendingUp className="w-8 h-8 mb-2 text-white/40" />
          <div className="text-3xl font-black">{myPapers.length}</div>
          <div className="text-[10px] text-gray-500 uppercase font-black tracking-[0.2em]">Available PYQs</div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Personalized Analysis */}
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-[#1a1a1a] rounded-[40px] border border-white/5 overflow-hidden shadow-2xl">
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-white text-black rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                    <Zap className="w-7 h-7 fill-current" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black tracking-tighter">Study Intelligence</h2>
                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em]">Powered by Llama 3.3 70B</p>
                  </div>
                </div>
                {!aiInsights && !aiLoading && (
                  <button 
                    onClick={fetchAIInsights}
                    className="bg-white text-black px-8 py-3 rounded-2xl font-black hover:scale-105 active:scale-95 transition-all text-sm shadow-xl flex items-center gap-2"
                  >
                    Analyze My Syllabus
                  </button>
                )}
              </div>

              {aiLoading ? (
                <div className="space-y-6 py-4">
                  <div className="h-20 bg-white/5 rounded-3xl animate-pulse" />
                  <div className="grid grid-cols-2 gap-4">
                    <div className="h-32 bg-white/5 rounded-3xl animate-pulse" />
                    <div className="h-32 bg-white/5 rounded-3xl animate-pulse" />
                  </div>
                </div>
              ) : aiInsights ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-8"
                >
                  <div className="p-6 bg-white/5 rounded-3xl border border-white/5 leading-relaxed text-gray-300 italic text-lg">
                    "{aiInsights.summary}"
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-6 bg-red-500/5 rounded-3xl border border-red-500/10 space-y-4">
                      <h3 className="text-xs font-black text-red-400 uppercase tracking-[0.2em] flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        Tough Subjects
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {aiInsights.toughSubjects.map(sub => (
                          <span key={sub} className="bg-red-500/10 text-red-400 px-4 py-2 rounded-xl text-[10px] font-black border border-red-500/10 uppercase">
                            {sub}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="p-6 bg-white/5 rounded-3xl border border-white/10 space-y-4">
                      <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" />
                        Priority Papers
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {aiInsights.priorityPapers.map(code => (
                          <span key={code} className="bg-white/10 text-white px-4 py-2 rounded-xl text-[10px] font-black border border-white/5 uppercase">
                            {code}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="p-8 bg-white text-black rounded-[40px] shadow-2xl">
                    <h3 className="text-xl font-black mb-6 flex items-center gap-2 tracking-tighter">
                      <Star className="w-6 h-6 fill-black" />
                      Success Strategy
                    </h3>
                    <p className="text-sm font-bold mb-8 leading-relaxed opacity-70">
                      {aiInsights.strategy}
                    </p>
                    <div className="space-y-4">
                      {aiInsights.tips.map((tip, idx) => (
                        <div key={idx} className="flex gap-4 items-center p-4 bg-black/5 rounded-2xl border border-black/5">
                          <div className="w-8 h-8 bg-black text-white rounded-xl flex items-center justify-center text-xs font-black shrink-0">
                            {idx + 1}
                          </div>
                          <p className="text-sm font-black opacity-60 tracking-tight">{tip}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="text-center py-20 border-2 border-dashed border-white/5 rounded-[40px] group hover:border-white/20 transition-all">
                  <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <Zap className="w-8 h-8 text-white/20" />
                  </div>
                  <p className="text-gray-500 font-bold italic max-w-xs mx-auto">Click analyze to let the AI build your custom roadmap for Semester {user.semester}.</p>
                </div>
              )}
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-8 px-2">
              <h2 className="text-2xl font-black tracking-tighter flex items-center gap-3">
                <FileText className="w-6 h-6" />
                Unit-Wise Deep Analysis
              </h2>
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Select a subject to analyze</span>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-32 bg-white/5 animate-pulse rounded-[32px]" />
                ))}
              </div>
            ) : myPapers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AnimatePresence>
                  {/* Group papers by subject code to show one button per subject */}
                  {Array.from(new Set(myPapers.map(p => p.subject_code))).slice(0, 6).map((code, idx) => {
                    const paper = myPapers.find(p => p.subject_code === code);
                    return (
                      <motion.div
                        key={code}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.05 }}
                        className="group bg-[#1a1a1a] p-6 rounded-[32px] border border-white/5 hover:border-white/20 transition-all relative overflow-hidden"
                      >
                        <div className="relative z-10">
                          <div className="flex justify-between items-start mb-4">
                            <span className="bg-white/10 px-3 py-1 rounded-xl text-[10px] font-black tracking-widest text-white/60">{code}</span>
                            <div className="flex gap-2">
                              <a href={paper.pdf_url} target="_blank" rel="noreferrer" className="p-2 bg-white/5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-all">
                                <Download className="w-4 h-4" />
                              </a>
                            </div>
                          </div>
                          <h3 className="font-black text-sm mb-6 line-clamp-2 leading-snug group-hover:text-white transition-colors">
                            {paper.subject_name}
                          </h3>
                          <button 
                            onClick={() => fetchDeepAnalysis(code)}
                            className="w-full py-3 bg-white text-black rounded-2xl text-xs font-black flex items-center justify-center gap-2 hover:bg-gray-200 transition-all shadow-xl"
                          >
                            <Star className="w-3 h-3 fill-current" />
                            Deep Analysis
                          </button>
                        </div>
                        <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-2xl -mr-12 -mt-12 group-hover:bg-white/10 transition-all" />
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            ) : (
              <div className="bg-white/5 p-16 rounded-[40px] border-2 border-dashed border-white/5 text-center">
                <Search className="w-16 h-16 mx-auto mb-6 text-gray-700" />
                <p className="text-gray-500 font-bold italic mb-6">No papers found for your semester yet.</p>
                <Link to="/papers" className="bg-white/5 px-8 py-3 rounded-2xl text-white text-xs font-black hover:bg-white/10 transition-all">Browse All Papers</Link>
              </div>
            )}
          </section>
        </div>

        {/* Right Column: Shortcuts & Stats */}
        <div className="space-y-8">
          <div className="bg-white text-black p-8 rounded-[40px] shadow-[0_0_50px_rgba(255,255,255,0.05)] relative overflow-hidden group">
            <div className="absolute -top-4 -right-4 w-32 h-32 bg-black/5 rounded-full blur-2xl group-hover:bg-black/10 transition-all" />
            <h2 className="text-2xl font-black mb-4 relative z-10 tracking-tighter">Fast Search</h2>
            <p className="text-black/60 text-sm mb-8 relative z-10 font-bold leading-relaxed">
              Find any subject, code, or year instantly. We have 500+ DCRUST papers archived.
            </p>
            <Link 
              to="/papers"
              className="flex items-center justify-center w-full py-5 bg-black text-white rounded-[24px] font-black shadow-2xl hover:-translate-y-1 active:scale-95 transition-all relative z-10 group"
            >
              Enter Repository
              <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="bg-[#1a1a1a] p-8 rounded-[40px] border border-white/5 shadow-2xl">
            <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-8">Account Control</h3>
            <div className="space-y-3">
              <button 
                onClick={() => setShowEditModal(true)}
                className="w-full flex items-center justify-between p-5 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all text-left"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center">
                    <User className="w-5 h-5 text-white/60" />
                  </div>
                  <span className="text-sm font-black tracking-tight">Edit Profile</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-600" />
              </button>

              <button 
                onClick={() => setShowPrivacyModal(true)}
                className="w-full flex items-center justify-between p-5 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all text-left"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center">
                    <Shield className="w-5 h-5 text-white/60" />
                  </div>
                  <span className="text-sm font-black tracking-tight">Privacy & Security</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-600" />
              </button>

              <div className="pt-4 px-2">
                <p className="text-[10px] text-gray-600 font-black uppercase tracking-widest leading-loose">
                  Your data is used only for personalizing your academic experience.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {showEditModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowEditModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-[#1a1a1a] border border-white/10 p-8 rounded-[40px] w-full max-w-md relative z-10 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-black tracking-tighter">Edit Profile</h2>
                <button onClick={() => setShowEditModal(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <form onSubmit={handleEditProfile} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 px-1">Full Name</label>
                  <input 
                    type="text" 
                    value={editData.name}
                    onChange={(e) => setEditData({...editData, name: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-white/20 transition-all font-bold"
                    placeholder="Enter your name"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 px-1">Branch</label>
                    <select 
                      value={editData.branch}
                      onChange={(e) => setEditData({...editData, branch: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 focus:outline-none focus:border-white/20 transition-all font-bold appearance-none"
                    >
                      <option value="BCA" className="bg-[#1a1a1a]">BCA</option>
                      <option value="CSE" className="bg-[#1a1a1a]">CSE</option>
                      <option value="ME" className="bg-[#1a1a1a]">ME</option>
                      <option value="ECE" className="bg-[#1a1a1a]">ECE</option>
                      <option value="CIVIL" className="bg-[#1a1a1a]">CIVIL</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 px-1">Semester</label>
                    <input 
                      type="number" 
                      min="1" max="8"
                      value={editData.semester}
                      onChange={(e) => setEditData({...editData, semester: parseInt(e.target.value)})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-white/20 transition-all font-bold"
                    />
                  </div>
                </div>
                <button type="submit" className="w-full py-5 bg-white text-black rounded-[24px] font-black shadow-xl hover:scale-[1.02] active:scale-95 transition-all mt-4">
                  Save Changes
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Privacy Modal */}
      <AnimatePresence>
        {showPrivacyModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPrivacyModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-[#1a1a1a] border border-white/10 p-8 rounded-[40px] w-full max-w-lg relative z-10 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-black tracking-tighter">Privacy & Safety</h2>
                <button onClick={() => setShowPrivacyModal(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="space-y-6">
                <div className="p-6 bg-white/5 rounded-3xl border border-white/5">
                  <h3 className="font-black mb-2 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-green-400" />
                    Data Encryption
                  </h3>
                  <p className="text-sm text-gray-500 font-bold leading-relaxed">
                    All your profile data and AI search history are encrypted using industry-standard AES-256 protocols.
                  </p>
                </div>
                <div className="p-6 bg-white/5 rounded-3xl border border-white/5">
                  <h3 className="font-black mb-2 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-400" />
                    Personalization Policy
                  </h3>
                  <p className="text-sm text-gray-500 font-bold leading-relaxed">
                    We only use your branch and semester to filter papers and generate AI study recommendations. We never sell your data to third parties.
                  </p>
                </div>
                <button onClick={() => setShowPrivacyModal(false)} className="w-full py-5 bg-white/5 border border-white/10 rounded-[24px] font-black hover:bg-white/10 transition-all">
                  Got it
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Deep Analysis Modal */}
      <AnimatePresence>
        {showDeepModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 overflow-y-auto py-8">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDeepModal(false)}
              className="fixed inset-0 bg-black/90 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              className="bg-[#1a1a1a] border border-white/10 p-4 md:p-10 rounded-[40px] w-full max-w-4xl relative z-10 shadow-2xl my-auto"
            >
              <div className="flex justify-between items-start mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-white text-black rounded-3xl flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                    <Star className="w-8 h-8 fill-current" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black tracking-tighter">Academic Deep Analysis</h2>
                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.3em]">Comprehensive PYQ Trend Report</p>
                  </div>
                </div>
                <button onClick={() => setShowDeepModal(false)} className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all">
                  <X className="w-6 h-6" />
                </button>
              </div>

              {deepLoading ? (
                <div className="py-20 text-center space-y-6">
                  <div className="w-20 h-20 border-4 border-white/5 border-t-white rounded-full animate-spin mx-auto" />
                  <p className="text-xl font-black tracking-tighter animate-pulse italic">AI is reading all papers for this subject...</p>
                  <p className="text-xs text-gray-500 font-bold">This usually takes 15-20 seconds to process all units.</p>
                </div>
              ) : deepAnalysis ? (
                <div className="space-y-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {deepAnalysis.analysis.map((unit, idx) => (
                      <div key={idx} className="p-8 bg-white/5 rounded-[32px] border border-white/5 hover:border-white/10 transition-all">
                        <div className="flex justify-between items-center mb-6">
                          <span className="text-xs font-black text-gray-500 uppercase tracking-widest">{unit.unit}</span>
                          <span className="bg-white/10 px-4 py-1.5 rounded-full text-[10px] font-black text-white/80">{unit.officialName}</span>
                        </div>
                        
                        <div className="space-y-6">
                          <div>
                            <h4 className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-4">Repeated Questions</h4>
                            {unit.repeatedQuestions.length > 0 ? (
                              <div className="space-y-3">
                                {unit.repeatedQuestions.map((q, qIdx) => (
                                  <div key={qIdx} className="p-4 bg-white/5 rounded-2xl border border-white/5 group">
                                    <p className="text-sm font-bold mb-2 leading-relaxed">{q.question}</p>
                                    <div className="flex gap-2">
                                      {q.years.map(y => (
                                        <span key={y} className="text-[10px] bg-white text-black px-2 py-0.5 rounded-lg font-black">{y}</span>
                                      ))}
                                      <span className="ml-auto text-[10px] text-yellow-500 font-black uppercase tracking-tighter">🔥 {q.frequency}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-xs text-gray-600 font-bold italic">No exact repeats found, focus on topics below.</p>
                            )}
                          </div>

                          <div>
                            <h4 className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-3">Important Topics</h4>
                            <div className="flex flex-wrap gap-2">
                              {unit.importantTopics.map(t => (
                                <span key={t} className="px-3 py-1.5 bg-white/5 rounded-xl text-[10px] font-black text-gray-400 border border-white/5">
                                  {t}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 p-8 bg-white text-black rounded-[40px]">
                      <h3 className="text-xl font-black mb-6 tracking-tighter flex items-center gap-2">
                        <Zap className="w-6 h-6 fill-black" />
                        Execution Roadmap
                      </h3>
                      <p className="text-sm font-bold leading-relaxed opacity-70 mb-8 whitespace-pre-wrap">
                        {deepAnalysis.roadmap}
                      </p>
                      <div className="flex items-center gap-4 p-5 bg-black/5 rounded-[24px]">
                        <div className="w-12 h-12 bg-black text-white rounded-2xl flex items-center justify-center shrink-0">
                          <Star className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-black/40 uppercase tracking-widest">Expert Tip</p>
                          <p className="text-sm font-black">{deepAnalysis.expertTip}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="p-8 bg-white/5 rounded-[40px] border border-white/10">
                        <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-6">Must Draw Diagrams</h3>
                        <div className="space-y-3">
                          {deepAnalysis.diagrams.map(d => (
                            <div key={d} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
                              <div className="w-2 h-2 bg-white/20 rounded-full" />
                              <span className="text-xs font-bold text-gray-300">{d}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <button 
                        onClick={() => window.print()}
                        className="w-full py-5 bg-white/10 border border-white/10 rounded-[30px] font-black hover:bg-white/20 transition-all flex items-center justify-center gap-3"
                      >
                        <Download className="w-5 h-5" />
                        Export Report
                      </button>
                    </div>
                  </div>
                </div>
              ) : null}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Profile;
