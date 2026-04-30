import React, { useState, useEffect } from "react";
import axios from "axios";
import { Users } from "lucide-react";

export default function GraphyFooterCTA() {
  const [totalUsers, setTotalUsers] = useState(0);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5050/api';
        const res = await axios.get(`${API_URL}/stats/users`);
        setTotalUsers(res.data.total);
      } catch (error) {
        console.error("Failed to fetch user stats", error);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="w-full bg-white py-12 md:py-16">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6">

        {/* CTA SECTION */}
        <div className="relative mb-16 overflow-hidden rounded-3xl bg-black">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.35),rgba(0,0,0,1)_70%)]" />
          
          <div className="relative flex flex-col items-center justify-center px-6 py-16 md:py-24 text-center">
            <div className="mb-6 flex items-center justify-center gap-2 bg-white/10 px-4 py-2 rounded-full border border-white/20">
              <Users className="w-4 h-4 text-green-400" />
              <span className="text-sm font-medium text-white">{totalUsers.toLocaleString()}+ Active Users</span>
            </div>

            <h2 className="mb-4 text-[22px] sm:text-[26px] md:text-[28px] font-semibold text-white">
              Ready to Write Your First Code?
            </h2>

            <p className="mb-8 max-w-[520px] text-[14px] sm:text-[15px] text-[#cfcfcf]">
              Join Google Developers Group on Campus DCRUST to kickstart your
              career in the tech field.
            </p>

            <button className="w-full sm:w-auto rounded-xl bg-white px-8 py-3 text-[14px] font-medium text-black transition-transform hover:scale-105 active:scale-95">
              Join Our Community
            </button>
          </div>
        </div>

        {/* MAIN FOOTER */}
        <div className=" bg-white px-6 sm:px-8 md:px-10 py-10 sm:py-12 ">

          {/* TOP GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">
            <div>
              <span className="mb-4 block text-[16px] font-semibold">
                Exams Of DCRUST
              </span>

              <p className="text-[14px] leading-relaxed text-[#666666]">
                Exams Of DCRUST helps students find previous year question papers
                within seconds — so you focus on CGPA, not subject codes.
              </p>
            </div>

            <div>
              <h4 className="mb-4 text-[14px] font-semibold">Product</h4>
              <ul className="space-y-3 text-[14px] text-[#666666]">
                <li>Features</li>
                <li>Integrations</li>
                <li>Changelog</li>
              </ul>
            </div>

            <div>
              <h4 className="mb-4 text-[14px] font-semibold">Resources</h4>
              <ul className="space-y-3 text-[14px] text-[#666666]">
                <li>Documentation</li>
                <li>Tutorials</li>
                <li>Blog</li>
                <li>Support</li>
              </ul>
            </div>

            <div>
              <h4 className="mb-4 text-[14px] font-semibold">Platform</h4>
              <ul className="space-y-3 text-[14px] text-[#666666]">
                <li>About</li>
                <li>Careers</li>
                <li>Contact</li>
                <li>Partners</li>
              </ul>
            </div>
          </div>

          {/* BOTTOM BAR */}
          <div className="mt-10 flex flex-col gap-4 border-t border-[#e5e5e5] pt-6 text-[13px] text-[#777777] md:flex-row md:items-center md:justify-between">
            <span className="text-center md:text-left">
              © 2026 Exams Of DCRUST. All rights reserved.
            </span>

            <span className="text-center">
              Made with ❤️ by Mohit Mudgil
            </span>

            <div className="flex flex-wrap justify-center gap-4 md:justify-end">
              <span>Privacy Policy</span>
              <span>Terms of Service</span>
              <span>Cookies Settings</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
