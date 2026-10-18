import React from 'react';
import { Landmark, Users, CheckCircle, ArrowRight, Building2, HelpCircle, ShieldCheck, Scale, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BackButton } from '../../components/ui/BackButton';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 text-left">
      <div>
        <BackButton fallbackUrl="/" />
      </div>

      {/* Official Header */}
      <div className="bg-white dark:bg-[#131E2D] p-6 sm:p-8 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs border-t-4 border-t-[#C59B27] space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#0F2537] text-[#C59B27] text-[10px] font-bold uppercase tracking-wider">
          <Landmark className="w-3.5 h-3.5" />
          Official Citizen Charter & Redressal Framework
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-[#0F2537] dark:text-white">
          About ComplaintHub Civic Redressal Portal
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl">
          ComplaintHub is an official digital public services platform designed to bridge residents with municipal departments and field engineering teams. The portal operationalizes citizen-first accountability, automated department allocation, and verified proof-of-work resolution.
        </p>
      </div>

      {/* Three Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-[#131E2D] p-6 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs">
          <div className="w-10 h-10 rounded-lg bg-[#0F2537] text-[#C59B27] flex items-center justify-center border border-[#C59B27]/40">
            <Users className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-[#0F2537] dark:text-white uppercase tracking-tight">Citizen-First Reporting</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Citizens can lodge geotagged grievances with photo evidence, monitor real-time officer dispatch, and track SLA resolution without physical office visits.
          </p>
        </div>

        <div className="bg-white dark:bg-[#131E2D] p-6 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs">
          <div className="w-10 h-10 rounded-lg bg-[#1B365D] text-white flex items-center justify-center border border-blue-400/40">
            <Building2 className="w-5 h-5 text-amber-300" />
          </div>
          <h3 className="font-bold text-sm text-[#0F2537] dark:text-white uppercase tracking-tight">Departmental SLA Routing</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Every grievance is routed automatically to designated division heads (Roads, Water, Solid Waste, Streetlights) with defined time-bound turnaround standards.
          </p>
        </div>

        <div className="bg-white dark:bg-[#131E2D] p-6 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs">
          <div className="w-10 h-10 rounded-lg bg-emerald-900/20 text-[#059669] flex items-center justify-center border border-emerald-500/40">
            <CheckCircle className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-[#0F2537] dark:text-white uppercase tracking-tight">Verified Photographic Closure</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Officers must upload completion photos upon resolving issues. Resolution is logged into an immutable audit trail accessible to the complainant and community.
          </p>
        </div>
      </div>

      {/* Citizen Charter Service Standards Table */}
      <div className="bg-white dark:bg-[#131E2D] rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-[#C59B27]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#0F2537] dark:text-white">
              Citizen Charter: Standard Redressal Timelines (SLA)
            </h3>
          </div>
          <span className="text-[10px] font-semibold text-slate-500 font-mono">Civic Benchmark</span>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
          <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-2 items-center">
            <span className="font-bold text-slate-800 dark:text-slate-200">Street Lighting & Electrical Hazards</span>
            <span className="text-slate-500 dark:text-slate-400">Public Safety Division</span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> 24 to 48 Hours
            </span>
          </div>
          <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-2 items-center">
            <span className="font-bold text-slate-800 dark:text-slate-200">Solid Waste Dumping & Overflowing Bins</span>
            <span className="text-slate-500 dark:text-slate-400">Sanitation Engineering Wing</span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> 24 Hours
            </span>
          </div>
          <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-2 items-center">
            <span className="font-bold text-slate-800 dark:text-slate-200">Potable Water Leakage & Main Pipeline Bursts</span>
            <span className="text-slate-500 dark:text-slate-400">Water Supply & Drainage Board</span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> 12 to 24 Hours
            </span>
          </div>
          <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-2 items-center">
            <span className="font-bold text-slate-800 dark:text-slate-200">Pothole Repair & Road Resurfacing</span>
            <span className="text-slate-500 dark:text-slate-400">Municipal Roads & Bridges</span>
            <span className="font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> 3 to 7 Days
            </span>
          </div>
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <div className="bg-white dark:bg-[#131E2D] p-6 sm:p-8 rounded-xl border border-slate-200 dark:border-slate-800 space-y-6 shadow-xs">
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
          <HelpCircle className="w-4 h-4 text-[#C59B27]" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#0F2537] dark:text-white">
            Frequently Asked Public Grievance Questions
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
          <div className="space-y-1.5">
            <h4 className="font-bold text-xs text-[#0F2537] dark:text-slate-200">
              Are all registered complaints publicly visible?
            </h4>
            <p>
              Yes. In accordance with open governance principles, all civic complaints are visible in the public registry. Fellow citizens can upvote and follow issues in their neighborhood.
            </p>
          </div>
          <div className="space-y-1.5">
            <h4 className="font-bold text-xs text-[#0F2537] dark:text-slate-200">
              How are field officers held accountable?
            </h4>
            <p>
              Municipal supervisors monitor active case aging in real-time. Overdue complaints that surpass SLA limits trigger administrative escalation alerts to executive engineers.
            </p>
          </div>
          <div className="space-y-1.5">
            <h4 className="font-bold text-xs text-[#0F2537] dark:text-slate-200">
              How do I verify that an issue is resolved satisfactorily?
            </h4>
            <p>
              When an officer marks an issue as resolved, they must attach photo proof of repair. Complainants receive a notification with the photo proof and can comment on the resolution.
            </p>
          </div>
          <div className="space-y-1.5">
            <h4 className="font-bold text-xs text-[#0F2537] dark:text-slate-200">
              Can ComplaintHub handle emergency distress calls?
            </h4>
            <p>
              No. ComplaintHub is intended strictly for municipal civil works and civic maintenance. For immediate emergencies involving police, fire, or medical rescue, please dial national helpline <strong>112</strong>.
            </p>
          </div>
        </div>
      </div>

      <div className="text-center pt-2">
        <Link
          to="/complaints/new"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#1B365D] hover:bg-[#0F2537] text-white font-bold text-xs uppercase tracking-wider shadow-xs transition-colors border border-blue-900"
        >
          Lodge Grievance Now <ArrowRight className="w-4 h-4 text-[#C59B27]" />
        </Link>
      </div>
    </div>
  );
};
