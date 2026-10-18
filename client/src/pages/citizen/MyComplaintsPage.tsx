import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Search, ThumbsUp, MessageSquare, MapPin, Eye, Landmark } from 'lucide-react';
import { complaintsApi } from '../../api/complaints.api';
import { useAuth } from '../../features/auth/AuthContext';
import { Complaint } from '../../types';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { BackButton } from '../../components/ui/BackButton';

export const MyComplaintsPage: React.FC = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMyComplaints = async () => {
      if (!user) return;
      try {
        setIsLoading(true);
        const params: any = {
          createdBy: user.id || user._id,
          limit: 50,
        };
        if (statusFilter) params.status = statusFilter;
        if (searchTerm) params.search = searchTerm;

        const res = await complaintsApi.getComplaints(params);
        if (res.success && res.data) {
          setComplaints(res.data);
        }
      } catch (err) {
        console.error('Failed to load my complaints:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMyComplaints();
  }, [user, statusFilter, searchTerm]);

  return (
    <div className="space-y-6 text-left">
      <div>
        <BackButton fallbackUrl="/dashboard" />
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-[#0F2537] text-[#C59B27] text-[10px] font-bold uppercase tracking-wider mb-1.5">
            <Landmark className="w-3 h-3" />
            Citizen Grievance Records
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#0F2537] dark:text-white">
            My Lodged Grievances
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Track official case status, review timeline remarks, and verify resolution proof
          </p>
        </div>

        <Link
          to="/complaints/new"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1B365D] hover:bg-[#0F2537] text-white text-xs font-bold uppercase tracking-wider shadow-xs transition-colors border border-blue-900 self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4 text-[#C59B27]" /> Lodge New Report
        </Link>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Filter by keyword or complaint number (CMP-...)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#131E2D] text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-[#1B365D]"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#131E2D] text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:border-[#1B365D]"
        >
          <option value="">All Statuses</option>
          <option value="SUBMITTED">Submitted</option>
          <option value="UNDER_REVIEW">Under Review</option>
          <option value="ASSIGNED">Assigned</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="RESOLVED">Resolved</option>
          <option value="CLOSED">Closed</option>
        </select>
      </div>

      {/* Complaints List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-24 bg-white dark:bg-[#131E2D] rounded-xl border border-slate-200 dark:border-slate-800 animate-pulse" />
          ))}
        </div>
      ) : complaints.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center space-y-3">
            <p className="text-xs text-slate-400">No grievances found matching the specified filters.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {complaints.map((c) => (
            <div
              key={c._id}
              className="p-5 bg-white dark:bg-[#131E2D] rounded-xl border border-slate-200 dark:border-slate-800 hover:border-[#C59B27] dark:hover:border-[#C59B27] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all"
            >
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-[#0F2537] text-white border border-[#C59B27]/40">
                    {c.complaintNumber}
                  </span>
                  <Badge status={c.status} size="sm" />
                  <Badge priority={c.priority} size="sm" />
                  <span className="text-[11px] text-slate-400 font-mono">
                    Lodged: {new Date(c.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <h3 className="font-bold text-sm text-[#0F2537] dark:text-white">
                  {c.title}
                </h3>

                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                  {c.description}
                </p>

                <div className="flex items-center gap-4 text-xs text-slate-400 pt-1">
                  <span className="flex items-center gap-1 text-[11px]">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {c.location?.address || 'Municipal Ward'}
                  </span>
                  <span className="flex items-center gap-1 font-semibold text-[#1B365D] dark:text-blue-400 text-[11px]">
                    <ThumbsUp className="w-3.5 h-3.5" />
                    {c.upvoteCount} votes
                  </span>
                  <span className="flex items-center gap-1 text-[11px]">
                    <MessageSquare className="w-3.5 h-3.5" />
                    {c.commentCount} comments
                  </span>
                </div>
              </div>

              <div>
                <Link
                  to={`/complaints/${c._id}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#131E2D] text-xs font-semibold text-[#1B365D] dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5 text-[#C59B27]" /> Case Dossier
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
