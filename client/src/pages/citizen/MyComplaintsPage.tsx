import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Search, ThumbsUp, MessageSquare, MapPin, Eye } from 'lucide-react';
import { complaintsApi } from '../../api/complaints.api';
import { useAuth } from '../../features/auth/AuthContext';
import { Complaint } from '../../types';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            My Submitted Complaints
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Track all civic problem reports filed from your citizen account
          </p>
        </div>

        <Link
          to="/complaints/new"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs"
        >
          <PlusCircle className="w-4 h-4" /> File New Report
        </Link>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Filter by keyword or reference..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-slate-100"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-700 dark:text-slate-200"
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
            <div key={n} className="h-24 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 animate-pulse" />
          ))}
        </div>
      ) : complaints.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center space-y-3">
            <p className="text-xs text-slate-400">No complaints found matching criteria.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {complaints.map((c) => (
            <div
              key={c._id}
              className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                    {c.complaintNumber}
                  </span>
                  <Badge status={c.status} size="sm" />
                  <Badge priority={c.priority} size="sm" />
                  <span className="text-xs text-slate-400">
                    {new Date(c.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  {c.title}
                </h3>

                <p className="text-xs text-slate-500 line-clamp-1">
                  {c.description}
                </p>

                <div className="flex items-center gap-4 text-xs text-slate-400 pt-1">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {c.location?.address || 'Location on map'}
                  </span>
                  <span className="flex items-center gap-1">
                    <ThumbsUp className="w-3.5 h-3.5 text-blue-600" />
                    {c.upvoteCount} votes
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageSquare className="w-3.5 h-3.5" />
                    {c.commentCount} comments
                  </span>
                </div>
              </div>

              <div>
                <Link
                  to={`/complaints/${c._id}`}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" /> View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
