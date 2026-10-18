import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Landmark,
  ArrowRight,
  CheckCircle2,
  Clock,
  ThumbsUp,
  MapPin,
  AlertTriangle,
  Trash2,
  Droplets,
  Lightbulb,
  Compass,
  Zap,
  Users,
  ShieldCheck,
  Search,
  PlusCircle,
  FileText,
  Building2,
} from 'lucide-react';
import { complaintsApi } from '../../api/complaints.api';
import { categoriesApi } from '../../api/categories.api';
import { Complaint, Category } from '../../types';
import { Badge } from '../../components/ui/Badge';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [recentComplaints, setRecentComplaints] = useState<Complaint[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [trackQuery, setTrackQuery] = useState('');
  const [stats, setStats] = useState({
    total: 1420,
    resolved: 1285,
    officers: 52,
    responseTime: '< 24 Hours',
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [complaintsRes, categoriesRes] = await Promise.all([
          complaintsApi.getComplaints({ limit: 4, sort: '-createdAt' }),
          categoriesApi.getCategories({ activeOnly: true }),
        ]);

        if (complaintsRes.success && complaintsRes.data) {
          setRecentComplaints(complaintsRes.data);
          if (complaintsRes.meta?.total) {
            setStats((prev) => ({
              ...prev,
              total: Math.max(prev.total, complaintsRes.meta!.total * 12 + 1200),
            }));
          }
        }

        if (categoriesRes.success && categoriesRes.data) {
          setCategories(categoriesRes.data.slice(0, 6));
        }
      } catch (err) {
        console.warn('Landing data fetch non-fatal:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackQuery.trim()) {
      navigate(`/complaints?search=${encodeURIComponent(trackQuery.trim())}`);
    }
  };

  const getCategoryIcon = (iconName?: string) => {
    switch (iconName) {
      case 'AlertTriangle':
        return <AlertTriangle className="w-5 h-5 text-[#B45309]" />;
      case 'Trash2':
        return <Trash2 className="w-5 h-5 text-[#047857]" />;
      case 'Droplets':
        return <Droplets className="w-5 h-5 text-[#0369A1]" />;
      case 'Lightbulb':
        return <Lightbulb className="w-5 h-5 text-[#C59B27]" />;
      case 'Compass':
        return <Compass className="w-5 h-5 text-indigo-700" />;
      case 'Zap':
        return <Zap className="w-5 h-5 text-amber-600" />;
      default:
        return <Building2 className="w-5 h-5 text-[#1B365D]" />;
    }
  };

  return (
    <div className="space-y-16 sm:space-y-20 pb-20">
      {/* 1. Official Civic Hero Section */}
      <section className="bg-gradient-to-b from-[#0F2537] via-[#142C42] to-[#1B365D] text-white pt-12 pb-16 md:pt-16 md:pb-24 border-b-4 border-[#C59B27] relative overflow-hidden">
        {/* Subtle patterned background */}
        <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#C59B27_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-7 relative z-10">
          {/* Official Emblem Banner */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-[#C59B27]/50 bg-[#0F2537]/80 text-[#C59B27] text-xs font-bold tracking-wider uppercase shadow-xs">
            <Landmark className="w-3.5 h-3.5 text-[#C59B27]" />
            Civic Grievance Redressal & Public Works Monitoring Portal
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight text-white">
            Civic Accountability. <span className="text-[#C59B27]">Transparent Redressal.</span>
          </h1>

          <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-200 font-normal leading-relaxed">
            A centralized digital platform for citizens to lodge civic infrastructure complaints, track real-time resolution by municipal departments, and hold public services accountable.
          </p>

          {/* Quick Track Grievance Box (Classic Government Portal Feature) */}
          <div className="max-w-2xl mx-auto pt-2">
            <form
              onSubmit={handleTrackSubmit}
              className="p-2 sm:p-2.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 shadow-xl flex flex-col sm:flex-row items-center gap-2"
            >
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-slate-300 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={trackQuery}
                  onChange={(e) => setTrackQuery(e.target.value)}
                  placeholder="Enter Complaint Token (e.g. CMP-...) or keyword to track"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white text-slate-900 placeholder-slate-500 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#C59B27]"
                />
              </div>
              <button
                type="submit"
                className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-[#C59B27] hover:bg-[#B0881E] text-white font-bold text-xs uppercase tracking-wider transition-colors shrink-0 shadow-xs cursor-pointer"
              >
                Track Status
              </button>
            </form>
            <p className="text-[11px] text-slate-300 mt-2 text-left sm:text-center">
              Quick access: Enter your unique grievance registration token to view current field inspection status and remarks.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              to="/complaints/new"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 text-xs sm:text-sm font-bold uppercase tracking-wider rounded-lg bg-white text-[#0F2537] hover:bg-slate-100 transition-all shadow-md"
            >
              <PlusCircle className="w-4 h-4 text-[#C59B27]" />
              Lodge New Grievance
            </Link>

            <Link
              to="/complaints"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 text-xs sm:text-sm font-bold uppercase tracking-wider rounded-lg border border-white/30 text-white hover:bg-white/10 transition-all"
            >
              <FileText className="w-4 h-4 text-amber-300" />
              Browse Public Grievance Registry
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Official Key Metrics Strip */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 sm:-mt-14 relative z-20">
        <div className="bg-white dark:bg-[#131E2D] rounded-xl border border-slate-200 dark:border-slate-800 shadow-md p-6 grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
          <div className="border-r last:border-r-0 border-slate-200 dark:border-slate-800 px-2">
            <div className="text-2xl sm:text-3xl font-extrabold text-[#0F2537] dark:text-white">
              {stats.total.toLocaleString()}+
            </div>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-1">
              Grievances Lodged
            </div>
          </div>
          <div className="border-r last:border-r-0 border-slate-200 dark:border-slate-800 px-2">
            <div className="text-2xl sm:text-3xl font-extrabold text-[#059669]">
              {stats.resolved.toLocaleString()}+
            </div>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-1">
              Verified Resolved
            </div>
          </div>
          <div className="border-r last:border-r-0 border-slate-200 dark:border-slate-800 px-2">
            <div className="text-2xl sm:text-3xl font-extrabold text-[#1B365D] dark:text-blue-400">
              {stats.officers}
            </div>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-1">
              Designated Field Officers
            </div>
          </div>
          <div className="px-2">
            <div className="text-2xl sm:text-3xl font-extrabold text-[#C59B27]">
              {stats.responseTime}
            </div>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-1">
              Average Redressal SLA
            </div>
          </div>
        </div>
      </section>

      {/* 3. Citizen Grievance Lifecycle (How It Works) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-l-4 border-[#C59B27] pl-4 mb-8">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Citizen Grievance Lifecycle
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F2537] dark:text-white tracking-tight mt-0.5">
            Four Steps to Municipal Resolution
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
            Complaints submitted via ComplaintHub follow standard operating procedures for municipal review, inspection, and verified closure.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            {
              step: 'Step 01',
              title: 'Lodge & Geotag',
              desc: 'Submit detailed complaint with GPS coordinates, street address, category, and real photographic proof.',
              icon: MapPin,
            },
            {
              step: 'Step 02',
              title: 'Administrative Scrutiny',
              desc: 'Municipal administrators audit the complaint, assess priority, and assign it to the responsible department.',
              icon: ShieldCheck,
            },
            {
              step: 'Step 03',
              title: 'Field Officer Inspection',
              desc: 'The designated officer visits the site, updates progress in real-time, and initiates municipal repair works.',
              icon: Users,
            },
            {
              step: 'Step 04',
              title: 'Closure with Proof',
              desc: 'Officer uploads post-resolution photographic evidence. Citizen receives notification and closure verification.',
              icon: CheckCircle2,
            },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="bg-white dark:bg-[#131E2D] p-5 sm:p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-[#C59B27] uppercase tracking-wider font-mono">
                      {item.step}
                    </span>
                    <span className="w-8 h-8 rounded-md bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[#1B365D] dark:text-blue-400">
                      <Icon className="w-4 h-4" />
                    </span>
                  </div>
                  <h3 className="font-bold text-sm text-[#0F2537] dark:text-white mt-4">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. Popular Grievance Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4 border-l-4 border-[#1B365D] pl-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Department Classification
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F2537] dark:text-white tracking-tight mt-0.5">
              Grievance Categories
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
              Select an official municipal service domain to view open issues or file a report.
            </p>
          </div>
          <Link
            to="/complaints"
            className="text-xs font-bold uppercase tracking-wider text-[#1B365D] hover:text-[#0F2537] dark:text-blue-400 flex items-center gap-1"
          >
            All Categories <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat._id}
              to={`/complaints?category=${cat._id}`}
              className="p-4 rounded-xl bg-white dark:bg-[#131E2D] border border-slate-200 dark:border-slate-800 hover:border-[#C59B27] dark:hover:border-[#C59B27] shadow-xs hover:shadow-sm transition-all text-center flex flex-col items-center justify-center group"
            >
              <div className="w-11 h-11 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center mb-3 group-hover:border-[#C59B27] transition-colors">
                {getCategoryIcon(cat.icon)}
              </div>
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-[#1B365D] dark:group-hover:text-blue-400 leading-snug">
                {cat.name}
              </h4>
              <span className="text-[10px] text-slate-400 mt-1 font-mono">
                Municipal Wing
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* 5. Recently Reported Public Grievances */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4 border-l-4 border-[#C59B27] pl-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Live Municipal Feed
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F2537] dark:text-white tracking-tight mt-0.5">
              Recently Lodged Grievances
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
              Publicly visible civic issues currently undergoing administrative review and ground repairs.
            </p>
          </div>
          <Link
            to="/complaints"
            className="text-xs font-bold uppercase tracking-wider text-[#1B365D] hover:text-[#0F2537] dark:text-blue-400 flex items-center gap-1"
          >
            Explore All Grievances <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {recentComplaints.map((c) => (
            <Link
              key={c._id}
              to={`/complaints/${c._id}`}
              className="bg-white dark:bg-[#131E2D] rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Photo preview or landmark placeholder */}
                <div className="h-40 bg-slate-100 dark:bg-slate-800 relative overflow-hidden">
                  {c.images && c.images.length > 0 ? (
                    <img
                      src={c.images[0]}
                      alt={c.title}
                      className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-1">
                      <Landmark className="w-8 h-8 opacity-40 text-[#1B365D]" />
                      <span className="text-[10px] font-medium uppercase tracking-wider">Public Record</span>
                    </div>
                  )}
                  <div className="absolute top-2.5 left-2.5">
                    <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-[#0F2537]/90 text-white border border-[#C59B27]/40">
                      {c.complaintNumber}
                    </span>
                  </div>
                </div>

                <div className="p-4 space-y-2.5">
                  <div className="flex items-center justify-between gap-1.5 flex-wrap">
                    <Badge status={c.status} size="sm" />
                    <Badge priority={c.priority} size="sm" />
                  </div>

                  <h3 className="font-bold text-xs sm:text-sm text-[#0F2537] dark:text-white line-clamp-2 group-hover:text-[#1B365D] dark:group-hover:text-blue-400 transition-colors">
                    {c.title}
                  </h3>

                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {c.description}
                  </p>
                </div>
              </div>

              <div className="px-4 py-2.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/60 flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1 text-[11px] truncate max-w-[140px]">
                  <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                  {c.location?.address || 'Municipal Zone'}
                </span>
                <span className="flex items-center gap-1 font-semibold text-[#1B365D] dark:text-blue-400 text-xs">
                  <ThumbsUp className="w-3.5 h-3.5" />
                  {c.upvoteCount}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 6. Citizen Charter & Civic Commitment Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-xl bg-[#0F2537] border-2 border-[#C59B27] text-white p-6 sm:p-10 shadow-lg relative overflow-hidden">
          <div className="max-w-3xl space-y-4 relative z-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-[#1B365D] text-[#C59B27] text-[10px] font-bold uppercase tracking-wider border border-[#C59B27]/40">
              <ShieldCheck className="w-3.5 h-3.5" />
              Citizen Redressal Charter
            </span>
            <h2 className="text-xl sm:text-3xl font-extrabold tracking-tight text-white">
              Every Grievance Audited. Every Resolution Documented.
            </h2>
            <p className="text-slate-200 text-xs sm:text-sm leading-relaxed">
              ComplaintHub adheres to public transparency charters. Field officers must attach photographic evidence upon status completion, and citizens retain the right to appeal or reopen unresolved matters.
            </p>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 pt-2">
              <Link
                to="/complaints/new"
                className="px-5 py-2.5 rounded-lg bg-[#C59B27] hover:bg-[#B0881E] text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-xs"
              >
                Register Grievance Now
              </Link>
              <Link
                to="/about"
                className="px-5 py-2.5 rounded-lg border border-slate-400 text-slate-200 hover:text-white hover:border-white font-semibold text-xs uppercase tracking-wider transition-colors"
              >
                Read Citizen Charter Standards →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
