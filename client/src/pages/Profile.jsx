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
  Star
} from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5050/api';

const Profile = () => {
  const { user } = useContext(AuthContext);
  const [myPapers, setMyPapers] = useState([]);
  const [loading, setLoading] = useState(true);

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
        toast.error("Failed to load personalized papers");
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
    <div className="max-w-6xl mx-auto px-4 py-8 text-white">
      {/* Header Profile Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#2a2a2a] rounded-3xl p-8 border border-white/5 mb-8 flex flex-col md:flex-row items-center gap-8 shadow-2xl"
      >
        <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center text-black text-4xl font-black shadow-lg">
          {user.name[0]}
        </div>
        <div className="text-center md:text-left flex-1">
          <h1 className="text-3xl font-black mb-2">{user.name}</h1>
          <p className="text-gray-400 mb-6">{user.email}</p>
          <div className="flex flex-wrap justify-center md:justify-start gap-4">
            <div className="bg-white/5 px-4 py-2 rounded-xl flex items-center gap-2 border border-white/5">
              <GraduationCap className="w-4 h-4 text-white" />
              <span className="text-sm font-bold">{user.branch}</span>
            </div>
            <div className="bg-white/5 px-4 py-2 rounded-xl flex items-center gap-2 border border-white/5">
              <Calendar className="w-4 h-4 text-white" />
              <span className="text-sm font-bold">Semester {user.semester}</span>
            </div>
          </div>
        </div>
        <div className="hidden lg:block bg-white/5 p-6 rounded-3xl border border-white/5">
          <TrendingUp className="w-8 h-8 mb-2 text-white" />
          <div className="text-2xl font-black">{myPapers.length}</div>
          <div className="text-xs text-gray-500 uppercase font-bold tracking-widest">Available PYQs</div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Personalized Analysis */}
        <div className="lg:col-span-2 space-y-8">
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Personalized PYQ Analysis
              </h2>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-24 bg-white/5 animate-pulse rounded-2xl" />
                ))}
              </div>
            ) : myPapers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AnimatePresence>
                  {myPapers.slice(0, 8).map((paper, idx) => (
                    <motion.div
                      key={paper._id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.05 }}
                      className="group bg-[#2a2a2a] p-5 rounded-2xl border border-white/5 hover:border-white/20 transition-all cursor-pointer relative overflow-hidden"
                    >
                      <div className="relative z-10">
                        <div className="text-xs font-bold text-gray-500 mb-2 flex items-center gap-2 uppercase tracking-tighter">
                          <span className="bg-white/10 px-2 py-0.5 rounded text-[10px]">{paper.subject_code}</span>
                          {paper.year} • {paper.session}
                        </div>
                        <h3 className="font-bold text-sm mb-3 line-clamp-1 group-hover:text-white transition-colors">
                          {paper.subject_name}
                        </h3>
                        <a 
                          href={paper.pdf_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center w-full py-2 bg-white/5 group-hover:bg-white group-hover:text-black rounded-lg text-xs font-bold transition-all gap-2"
                        >
                          <Download className="w-3 h-3" />
                          Download PDF
                        </a>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <div className="bg-white/5 p-12 rounded-3xl border border-dashed border-white/10 text-center">
                <Search className="w-12 h-12 mx-auto mb-4 text-gray-600" />
                <p className="text-gray-500 font-bold italic text-sm">No papers found for your semester yet.</p>
                <Link to="/papers" className="text-white text-xs underline mt-2 inline-block">Browse all papers</Link>
              </div>
            )}
          </section>

          {/* Subjects Overview (Based on User's current Semester) */}
          <section className="bg-white/5 p-8 rounded-3xl border border-white/5">
            <h2 className="text-lg font-black mb-6 flex items-center gap-2">
              <Book className="w-5 h-5" />
              Semester {user.semester} Curriculum
            </h2>
            <div className="space-y-3">
              {user.semester <= 2 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(user.semester === 1 ? sem1Subjects : sem2Subjects).map(sub => (
                    <div key={sub.code} className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors">
                      <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center text-[10px] font-black shrink-0">
                        {sub.code.slice(0, 3)}
                      </div>
                      <div>
                        <div className="text-xs font-bold line-clamp-1">{sub.name}</div>
                        <div className="text-[10px] text-gray-500 font-bold">{sub.code}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm italic">Curriculum details for Semester {user.semester} coming soon.</p>
              )}
            </div>
          </section>
        </div>

        {/* Right Column: Shortcuts & Stats */}
        <div className="space-y-8">
          <div className="bg-gradient-to-br from-white/10 to-transparent p-8 rounded-3xl border border-white/10 shadow-xl relative overflow-hidden group">
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-all" />
            <h2 className="text-xl font-black mb-4 relative z-10">Quick Search</h2>
            <p className="text-gray-400 text-sm mb-6 relative z-10 leading-relaxed">
              Find papers by subject code like <span className="text-white font-mono">HUM101C</span> or <span className="text-white font-mono">MATH101C</span>.
            </p>
            <Link 
              to="/papers"
              className="flex items-center justify-center w-full py-4 bg-white text-black rounded-2xl font-black shadow-lg hover:-translate-y-1 transition-all relative z-10"
            >
              Start Searching
              <ChevronRight className="w-5 h-5 ml-2" />
            </Link>
          </div>

          <div className="bg-[#2a2a2a] p-6 rounded-3xl border border-white/5">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Account Settings</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer">
                <span className="text-sm font-bold">Edit Profile</span>
                <ChevronRight className="w-4 h-4 text-gray-600" />
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer">
                <span className="text-sm font-bold">Privacy</span>
                <ChevronRight className="w-4 h-4 text-gray-600" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const sem1Subjects = [
  { code: "HUM101C", name: "English Language Skills" },
  { code: "MATH101C", name: "Mathematics - I (CSE)" },
  { code: "CH101C", name: "Physics / Chemistry" },
  { code: "CSE101C", name: "Programming for Problem Solving" },
  { code: "EE101C", name: "Basic Electrical Engineering" },
  { code: "ME101C", name: "Engineering Graphics & Design" },
];

const sem2Subjects = [
  { code: "HUM101C", name: "English Language Skills" },
  { code: "MATH102C", name: "Mathematics - II (CSE)" },
  { code: "CH101C", name: "Physics / Chemistry" },
  { code: "CSE103C", name: "Programming Lab" },
  { code: "ME103C", name: "Workshop Practices" },
];

export default Profile;
