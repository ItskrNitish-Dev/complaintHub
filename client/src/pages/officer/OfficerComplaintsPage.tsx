import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Eye, Edit3, SlidersHorizontal, Landmark } from 'lucide-react';
import { complaintsApi } from '../../api/complaints.api';
import { useAuth } from '../../features/auth/AuthContext';
import { Complaint } from '../../types';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Modal } from '../../components/ui/Modal';
import { Alert } from '../../components/ui/Alert';
import { BackButton } from '../../components/ui/BackButton';

export const OfficerComplaintsPage: React.FC = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Status update modal
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [newStatus, setNewStatus] = useState<string>('IN_PROGRESS');
  const [statusNote, setStatusNote] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const fetchComplaints = async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      const params: any = {
        assignedOfficer: user.id || user._id,
        limit: 50,
      };
      if (statusFilter) params.status = statusFilter;
      if (priorityFilter) params.priority = priorityFilter;
      if (searchTerm) params.search = searchTerm;

      const res = await complaintsApi.getComplaints(params);
      if (res.success && res.data) {
        setComplaints(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [user, statusFilter, priorityFilter, searchTerm]);

  const handleOpenStatusModal = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setNewStatus(complaint.status === 'ASSIGNED' ? 'IN_PROGRESS' : 'RESOLVED');
    setStatusNote('');
    setActionError(null);
  };

  const handleUpdateStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComplaint) return;

    try {
      setIsUpdating(true);
      setActionError(null);
      const res = await complaintsApi.updateStatus(selectedComplaint._id, {
        status: newStatus,
        note: statusNote || `Status updated to ${newStatus} by assigned officer.`,
      });

      if (res.success) {
        setActionSuccess(`Case ${selectedComplaint.complaintNumber} updated to ${newStatus}.`);
        setSelectedComplaint(null);
        fetchComplaints();
      }
    } catch (err: any) {
      setActionError(err.response?.data?.message || 'Failed to update status');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6 text-left">
      <div>
        <BackButton fallbackUrl="/officer/dashboard" />
      </div>

      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-[#0F2537] text-[#C59B27] text-[10px] font-bold uppercase tracking-wider mb-1.5">
          <Landmark className="w-3 h-3" />
          Field Officer Registry
        </div>
        <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#0F2537] dark:text-white">
          Assigned Grievances Roster
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Review, triage, and update status of municipal work tickets assigned to your division
        </p>
      </div>

      {actionSuccess && <Alert type="success">{actionSuccess}</Alert>}

      {/* Filter toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by keyword, address, or case ID..."
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
          <option value="ASSIGNED">Assigned (Pending Action)</option>
          <option value="IN_PROGRESS">In Progress (Active Works)</option>
          <option value="RESOLVED">Resolved</option>
          <option value="CLOSED">Closed</option>
        </select>

        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#131E2D] text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:border-[#1B365D]"
        >
          <option value="">All Priorities</option>
          <option value="CRITICAL">Critical</option>
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
        </select>
      </div>

      {/* Data Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-12 text-center text-xs text-slate-400 animate-pulse">Loading assigned work orders...</div>
          ) : complaints.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-400">No complaints matching filter criteria.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="px-5 py-3">Case Ref</th>
                    <th className="px-5 py-3">Grievance Title</th>
                    <th className="px-5 py-3">Severity</th>
                    <th className="px-5 py-3">Location</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Date</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {complaints.map((c) => (
                    <tr key={c._id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                      <td className="px-5 py-3.5 font-mono font-bold text-[#0F2537] dark:text-white">
                        {c.complaintNumber}
                      </td>
                      <td className="px-5 py-3.5 max-w-xs truncate font-semibold text-slate-800 dark:text-slate-200">
                        {c.title}
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge priority={c.priority} size="sm" />
                      </td>
                      <td className="px-5 py-3.5 max-w-xs truncate text-slate-500">
                        <span className="flex items-center gap-1 text-[11px]">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          {c.location?.address || 'Municipal Ward'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge status={c.status} size="sm" />
                      </td>
                      <td className="px-5 py-3.5 text-slate-400 font-mono text-[11px]">
                        {new Date(c.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-3.5 text-right space-x-1.5 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleOpenStatusModal(c)}
                          className="px-2.5 py-1 rounded-md bg-[#1B365D] hover:bg-[#0F2537] text-white text-xs font-semibold transition-colors cursor-pointer"
                        >
                          Update Status
                        </button>
                        <Link
                          to={`/complaints/${c._id}`}
                          className="px-2.5 py-1 rounded-md border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 text-xs font-semibold"
                        >
                          Dossier
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Status Update Modal */}
      {selectedComplaint && (
        <Modal
          isOpen={!!selectedComplaint}
          onClose={() => setSelectedComplaint(null)}
          title={`Update Status: Case ${selectedComplaint.complaintNumber}`}
          description={selectedComplaint.title}
        >
          {actionError && <Alert type="error" className="mb-4">{actionError}</Alert>}

          <form onSubmit={handleUpdateStatusSubmit} className="space-y-4 text-xs text-left">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Official Status Transition
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#131E2D] font-medium"
              >
                <option value="IN_PROGRESS">IN_PROGRESS (Team actively engaged)</option>
                <option value="RESOLVED">RESOLVED (Works complete with proof)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Field Inspection / Progress Remarks
              </label>
              <textarea
                rows={3}
                placeholder="Enter field observation, contractor details, or materials applied..."
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#131E2D]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <Button type="button" variant="outline" size="sm" onClick={() => setSelectedComplaint(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" isLoading={isUpdating}>
                Confirm Status Transition
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
