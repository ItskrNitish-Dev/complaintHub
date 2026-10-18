import React from 'react';
import { Link } from 'react-router-dom';
import { Landmark, ShieldCheck, FileText, HelpCircle, PhoneCall } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#0F2537] text-slate-300 border-t-4 border-[#C59B27] mt-auto">
      {/* Upper Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Column 1: Portal Identification */}
          <div className="space-y-3.5 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-md bg-[#1B365D] border border-[#C59B27] flex items-center justify-center text-[#C59B27]">
                <Landmark className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-lg text-white tracking-tight">
                Complaint<span className="text-amber-400">Hub</span>
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Official Civic Grievance Redressal and Municipal Oversight System. Facilitating rapid, accountable, and transparent public resolution between citizens and municipal departments.
            </p>
            <div className="pt-2 flex items-center gap-2 text-[11px] text-amber-300 font-semibold">
              <ShieldCheck className="w-4 h-4 text-[#C59B27]" />
              Verified Public Administration System
            </div>
          </div>

          {/* Column 2: Citizen Redressal Services */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3.5 border-b border-slate-700 pb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-[#C59B27]" />
              Citizen Services
            </h4>
            <ul className="space-y-2 text-xs text-slate-300">
              <li>
                <Link to="/complaints/new" className="hover:text-amber-300 transition-colors">
                  Lodge New Grievance
                </Link>
              </li>
              <li>
                <Link to="/complaints" className="hover:text-amber-300 transition-colors">
                  Track Grievance Status
                </Link>
              </li>
              <li>
                <Link to="/complaints" className="hover:text-amber-300 transition-colors">
                  Public Redressal Registry
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-amber-300 transition-colors">
                  Citizen Charter & SLA Timelines
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Municipal Departments */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3.5 border-b border-slate-700 pb-1.5">
              Civic Departments
            </h4>
            <ul className="space-y-2 text-xs text-slate-300">
              <li>Roads, Potholes & Footpaths</li>
              <li>Solid Waste & Sanitation Engineering</li>
              <li>Water Works, Drainage & Sewerage</li>
              <li>Street Lighting & Public Electricals</li>
              <li>Parks, Horticulture & Public Trees</li>
            </ul>
          </div>

          {/* Column 4: Help, Guidelines & Portals */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3.5 border-b border-slate-700 pb-1.5 flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-[#C59B27]" />
              Portals & Support
            </h4>
            <ul className="space-y-2 text-xs text-slate-300">
              <li>
                <Link to="/login" className="hover:text-amber-300 transition-colors">
                  Citizen Sign In
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-amber-300 transition-colors">
                  Officer Redressal Workbench
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-amber-300 transition-colors">
                  Administration Oversight
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-amber-300 transition-colors">
                  Grievance Escalation Matrix
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Public Notice Disclaimer Banner */}
        <div className="mt-10 p-4 rounded-lg bg-[#142C42] border border-slate-700 text-[11px] text-slate-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <PhoneCall className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>Public Notice:</strong> This portal is designed for civic and municipal public works grievances. For immediate life-safety emergencies, please dial national helpline <strong>112</strong>.
            </span>
          </div>
          <span className="text-[10px] text-slate-400 whitespace-nowrap">
            Operating under Civic Transparency Standards
          </span>
        </div>

        {/* Bottom Legal / Accessibility Bar */}
        <div className="border-t border-slate-800 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© {new Date().getFullYear()} ComplaintHub. Civic Grievance Redressal Portal.</p>
          <div className="flex items-center gap-4 text-[11px]">
            <Link to="/about" className="hover:text-amber-300">Citizen Charter</Link>
            <span>•</span>
            <Link to="/about" className="hover:text-amber-300">Privacy Policy</Link>
            <span>•</span>
            <Link to="/about" className="hover:text-amber-300">Terms of Redressal</Link>
            <span>•</span>
            <Link to="/about" className="hover:text-amber-300">Accessibility Statement</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
