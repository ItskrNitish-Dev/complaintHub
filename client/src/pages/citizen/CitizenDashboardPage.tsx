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
    <div className="space-y-8">
      {/* Top Welcome Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Welcome back, {user?.name}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Track your submitted civic issues and updates from municipal authorities
          </p>
        </div>

        <Link
          to="/complaints/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          Report New Issue
        </Link>
      </div>

      {/* 4 Stat Counter Cards (PRD Section 33) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Reported</p>
              <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-0.5">
                {totalCount}
              </h3>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Pending Review</p>
              <h3 className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-0.5">
                {pendingCount}
              </h3>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">In Progress</p>
              <h3 className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-0.5">
                {inProgressCount}
              </h3>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Resolved</p>
              <h3 className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">
                {resolvedCount}
              </h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid: My Complaints & Recent Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left 2 Cols: My Complaints List */}
        <div className="lg:col-span-2 space-y-4">
          {/* Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-xl p-1 w-fit">
            <button
              type="button"
              onClick={() => setActiveTab('mine')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'mine'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              My Reports
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('followed')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'followed'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Bookmark className="w-3 h-3 inline mr-1" />
              Followed ({followedComplaints.length})
            </button>
          </div>

          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              {activeTab === 'mine' ? 'My Reported Complaints' : 'Complaints I Follow'}
            </h2>
            <Link to="/complaints" className="text-xs font-semibold text-blue-600 hover:text-blue-500 flex items-center gap-1">
              Explore all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Complaint List - tab-aware */}
          {(() => {
            const list = activeTab === 'mine' ? myComplaints : followedComplaints;
            if (isLoading) {
              return (
                <div className="space-y-3">
                  {[1, 2, 3].map((n) => (
                    <div key={n} className="h-24 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 animate-pulse" />
                  ))}
                </div>
              );
            }
            if (list.length === 0) {
              return (
                <Card>
                  <CardContent className="py-12 text-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center mx-auto">
                      {activeTab === 'mine' ? <PlusCircle className="w-6 h-6" /> : <Bookmark className="w-6 h-6" />}
                    </div>
                    <h4 className="font-semibold text-sm text-slate-900 dark:text-white">
                      {activeTab === 'mine' ? "You haven't filed any complaints yet" : "You aren't following any complaints yet"}
                    </h4>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      {activeTab === 'mine'
                        ? 'Notice a pothole, broken streetlight, or garbage issue? Report it today!'
                        : 'Browse complaints and click "Follow" to track updates on issues you care about.'}
                    </p>
                    <div className="pt-2">
                      <Link
                        to={activeTab === 'mine' ? '/complaints/new' : '/complaints'}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold"
                      >
                        {activeTab === 'mine' ? <><PlusCircle className="w-4 h-4" /> File your first report</> : <>Explore complaints</>}
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
                    className="block p-4 sm:p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-600 shadow-xs hover:shadow-md transition-all group"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {c.complaintNumber}
                        </span>
                        <span className="text-xs text-slate-500 font-medium">{c.category?.name || 'General'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge priority={c.priority} size="sm" />
                        <Badge status={c.status} size="sm" />
                      </div>
                    </div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{c.title}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-1">{c.description}</p>
                    <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1 truncate max-w-[200px]">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {c.location?.address || 'Reported Location'}
                      </span>
                      <span className="flex items-center gap-1 font-medium text-slate-600 dark:text-slate-300">
                        <ThumbsUp className="w-3 h-3 text-blue-600" /> {c.upvoteCount} votes
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
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Bell className="w-4 h-4 text-blue-600" />
                Latest Alerts
              </CardTitle>
              <Link
                to="/notifications"
                className="text-xs font-semibold text-blue-600 hover:text-blue-500"
              >
                View all
              </Link>
            </CardHeader>
            <CardContent className="divide-y divide-slate-100 dark:divide-slate-800/80 pt-0">
              {notifications.length === 0 ? (
                <p className="py-6 text-center text-xs text-slate-400">
                  No new notifications
                </p>
              ) : (
                notifications.map((n) => (
                  <div key={n._id} className="py-3 text-xs space-y-1">
                    <p className="font-semibold text-slate-800 dark:text-slate-200">
                      {n.title}
                    </p>
                    <p className="text-slate-500 dark:text-slate-400 line-clamp-2">
                      {n.message}
                    </p>
                    <span className="text-[10px] text-slate-400 block pt-1">
                      {new Date(n.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Quick Civic Tips Banner */}
          <div className="p-5 rounded-2xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900 text-xs space-y-2">
            <h4 className="font-bold text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
              <Bookmark className="w-4 h-4 text-blue-600" /> Civic Tip
            </h4>
            <p className="text-blue-800/80 dark:text-blue-200 leading-relaxed">
              Attaching clear photos and providing specific street landmarks significantly speeds up officer triage and field inspection times.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
