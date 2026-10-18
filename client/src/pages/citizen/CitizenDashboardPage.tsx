import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  PlusCircle,
  ArrowRight,
  Bookmark,
  Bell,
  ThumbsUp,
  MapPin,
  Landmark,
  ShieldCheck,
} from 'lucide-react';
import { complaintsApi } from '../../api/complaints.api';
import { notificationsApi } from '../../api/notifications.api';
import { useAuth } from '../../features/auth/AuthContext';
import { Complaint, NotificationItem } from '../../types';
import { Badge } from '../../components/ui/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';

export const CitizenDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [myComplaints, setMyComplaints] = useState<Complaint[]>([]);
  const [followedComplaints, setFollowedComplaints] = useState<Complaint[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'mine' | 'followed'>('mine');

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;
      try {
        const userId = user.id || user._id;
        const [complaintsRes, followedRes, notifsRes] = await Promise.all([
          complaintsApi.getComplaints({ createdBy: userId, limit: 10 }),
          complaintsApi.getComplaints({ followedBy: userId, limit: 10 } as any),
          notificationsApi.getNotifications(),
        ]);

        if (complaintsRes.success && complaintsRes.data) setMyComplaints(complaintsRes.data);
        if (followedRes.success && followedRes.data) setFollowedComplaints(followedRes.data);
        if (notifsRes.success && notifsRes.data) setNotifications(notifsRes.data.slice(0, 5));
      } catch (err) {
        console.error('Error loading dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  // Compute stats
  const totalCount = myComplaints.length;
  const pendingCount = myComplaints.filter(
    (c) => c.status === 'SUBMITTED' || c.status === 'UNDER_REVIEW'
  ).length;
  const inProgressCount = myComplaints.filter(
    (c) => c.status === 'ASSIGNED' || c.status === 'IN_PROGRESS'
  ).length;
  const resolvedCount = myComplaints.filter(
    (c) => c.status === 'RESOLVED' || c.status === 'CLOSED'
  ).length;

  return (
    <div className="space-y-6 text-left">
      {/* Top Welcome Header & Quick Action */}
      <div className="bg-white dark:bg-[#131E2D] p-5 sm:p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-l-4 border-l-[#1B365D]">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-[#0F2537] text-[#C59B27] text-[10px] font-bold uppercase tracking-wider mb-1.5">
            <Landmark className="w-3 h-3" />
            Citizen Redressal Workbench
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#0F2537] dark:text-white">
            Welcome, {user?.name}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Official municipal tracking portal for your neighborhood grievances
          </p>
        </div>

        <Link
          to="/complaints/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#1B365D] hover:bg-[#0F2537] text-white text-xs font-bold uppercase tracking-wider shadow-xs transition-colors border border-blue-900 self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4 text-[#C59B27]" />
          Lodge New Grievance
        </Link>
      </div>

      {/* 4 Stat Counter Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#131E2D] p-4 sm:p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-lg bg-slate-100 dark:bg-slate-800 text-[#0F2537] dark:text-slate-200 flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-700">
            <FileText className="w-5 h-5 text-[#1B365D] dark:text-blue-400" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Lodged</p>
            <h3 className="text-xl sm:text-2xl font-extrabold text-[#0F2537] dark:text-white mt-0.5">
              {totalCount}
            </h3>
          </div>
        </div>

        <div className="bg-white dark:bg-[#131E2D] p-4 sm:p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-[#B45309] dark:text-amber-300 flex items-center justify-center shrink-0 border border-amber-200 dark:border-amber-800">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Under Review</p>
            <h3 className="text-xl sm:text-2xl font-extrabold text-[#B45309] dark:text-amber-400 mt-0.5">
              {pendingCount}
            </h3>
          </div>
        </div>

        <div className="bg-white dark:bg-[#131E2D] p-4 sm:p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-[#1B365D] dark:text-blue-300 flex items-center justify-center shrink-0 border border-blue-200 dark:border-blue-800">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">In Progress</p>
            <h3 className="text-xl sm:text-2xl font-extrabold text-[#1B365D] dark:text-blue-400 mt-0.5">
              {inProgressCount}
            </h3>
          </div>
        </div>

        <div className="bg-white dark:bg-[#131E2D] p-4 sm:p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-[#047857] dark:text-emerald-300 flex items-center justify-center shrink-0 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Verified Resolved</p>
            <h3 className="text-xl sm:text-2xl font-extrabold text-[#047857] dark:text-emerald-400 mt-0.5">
              {resolvedCount}
            </h3>
          </div>
        </div>
      </div>

      {/* Main Grid: My Complaints & Recent Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left 2 Cols: My Complaints List */}
        <div className="lg:col-span-2 space-y-4">
          {/* Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-200/70 dark:bg-slate-800/80 rounded-lg p-1 w-fit">
            <button
              type="button"
              onClick={() => setActiveTab('mine')}
              className={`px-3.5 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'mine'
                  ? 'bg-[#1B365D] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
              }`}
            >
              My Lodged Grievances ({myComplaints.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('followed')}
              className={`px-3.5 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'followed'
                  ? 'bg-[#1B365D] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
              }`}
            >
              <Bookmark className="w-3 h-3 inline mr-1 text-[#C59B27]" />
              Followed Grievances ({followedComplaints.length})
            </button>
          </div>

          <div className="flex items-center justify-between pt-1">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#0F2537] dark:text-white">
              {activeTab === 'mine' ? 'Official Case Dossier' : 'Community Cases Under Watch'}
            </h2>
            <Link to="/complaints" className="text-xs font-bold text-[#1B365D] hover:text-[#0F2537] dark:text-blue-400 flex items-center gap-1">
              Public Registry <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Complaint List - tab-aware */}
          {(() => {
            const list = activeTab === 'mine' ? myComplaints : followedComplaints;
            if (isLoading) {
              return (
                <div className="space-y-3">
                  {[1, 2, 3].map((n) => (
                    <div key={n} className="h-24 bg-white dark:bg-[#131E2D] rounded-xl border border-slate-200 dark:border-slate-800 animate-pulse" />
                  ))}
                </div>
              );
            }
            if (list.length === 0) {
              return (
                <Card>
                  <CardContent className="py-12 text-center space-y-3">
                    <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-800 text-[#1B365D] dark:text-blue-400 flex items-center justify-center mx-auto">
                      {activeTab === 'mine' ? <PlusCircle className="w-6 h-6" /> : <Bookmark className="w-6 h-6" />}
                    </div>
                    <h4 className="font-bold text-sm text-[#0F2537] dark:text-white">
                      {activeTab === 'mine' ? "No complaints currently filed on your record" : "You are not currently monitoring any public cases"}
                    </h4>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                      {activeTab === 'mine'
                        ? 'Observe a civic hazard like an open manhole, water main burst, or broken streetlight? Lodge a report for municipal dispatch.'
                        : 'Explore public complaints in your municipal ward and click "Follow" to receive verified status updates.'}
                    </p>
                    <div className="pt-2">
                      <Link
                        to={activeTab === 'mine' ? '/complaints/new' : '/complaints'}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#1B365D] hover:bg-[#0F2537] text-white text-xs font-bold uppercase tracking-wider shadow-xs"
                      >
                        {activeTab === 'mine' ? <><PlusCircle className="w-4 h-4 text-[#C59B27]" /> Lodge First Grievance</> : <>Browse Public Registry</>}
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            }
            return (
              <div className="space-y-3">
                {list.map((c) => (
                  <Link
                    key={c._id}
                    to={`/complaints/${c._id}`}
                    className="block p-4 sm:p-5 bg-white dark:bg-[#131E2D] rounded-xl border border-slate-200 dark:border-slate-800 hover:border-[#C59B27] dark:hover:border-[#C59B27] shadow-xs hover:shadow-sm transition-all group"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-[#0F2537] text-white border border-[#C59B27]/40">
                          {c.complaintNumber}
                        </span>
                        <span className="text-xs text-slate-500 font-bold uppercase tracking-wide">{c.category?.name || 'General Municipal'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge priority={c.priority} size="sm" />
                        <Badge status={c.status} size="sm" />
                      </div>
                    </div>
                    <h3 className="font-bold text-sm text-[#0F2537] dark:text-white group-hover:text-[#1B365D] dark:group-hover:text-blue-400 transition-colors">{c.title}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-1">{c.description}</p>
                    <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1 truncate max-w-[200px]">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {c.location?.address || 'Municipal Ward'}
                      </span>
                      <span className="flex items-center gap-1 font-semibold text-[#1B365D] dark:text-blue-400">
                        <ThumbsUp className="w-3.5 h-3.5" /> {c.upvoteCount} votes
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            );
          })()}
        </div>

        {/* Right Col: Notification & Action Stream */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800">
              <CardTitle className="text-xs font-bold uppercase tracking-wider flex items-center gap-2 text-[#0F2537] dark:text-white">
                <Bell className="w-3.5 h-3.5 text-[#C59B27]" />
                Official Notices
              </CardTitle>
              <Link
                to="/notifications"
                className="text-[11px] font-bold text-[#1B365D] hover:underline dark:text-blue-400"
              >
                All Notices
              </Link>
            </CardHeader>
            <CardContent className="divide-y divide-slate-100 dark:divide-slate-800/80 pt-0">
              {notifications.length === 0 ? (
                <p className="py-6 text-center text-xs text-slate-400">
                  No active notices on file
                </p>
              ) : (
                notifications.map((n) => (
                  <div key={n._id} className="py-3 text-xs space-y-1">
                    <p className="font-bold text-[#0F2537] dark:text-slate-200">
                      {n.title}
                    </p>
                    <p className="text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {n.message}
                    </p>
                    <span className="text-[10px] text-slate-400 font-mono block pt-0.5">
                      {new Date(n.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Quick Civic Tips Banner */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-xs space-y-2">
            <h4 className="font-bold text-[#0F2537] dark:text-slate-200 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
              <ShieldCheck className="w-4 h-4 text-[#C59B27]" /> Citizen Redressal Advisory
            </h4>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
              Providing accurate street landmarks and attaching clear daylight photographs expedites municipal triage and reduces on-site verification delays.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
