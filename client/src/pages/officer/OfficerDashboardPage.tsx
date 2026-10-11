import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Eye,
  Edit3,
  MapPin,
  Building,
} from 'lucide-react';
import { complaintsApi } from '../../api/complaints.api';
import { useAuth } from '../../features/auth/AuthContext';
import { Complaint } from '../../types';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Modal } from '../../components/ui/Modal';
import { Alert } from '../../components/ui/Alert';

export const OfficerDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [assignedComplaints, setAssignedComplaints] = useState<Complaint[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Status update modal state
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [newStatus, setNewStatus] = useState<string>('IN_PROGRESS');
  const [statusNote, setStatusNote] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const fetchAssigned = async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      const res = await complaintsApi.getComplaints({
        assignedOfficer: user.id || user._id,
        limit: 20,
        sort: '-createdAt',
      });
      if (res.success && res.data) {
        setAssignedComplaints(res.data);
      }
    } catch (err) {
      console.error('Failed to load assigned complaints:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAssigned();
  }, [user]);

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
        setActionSuccess(`Complaint ${selectedComplaint.complaintNumber} updated to ${newStatus}.`);
        setSelectedComplaint(null);
        fetchAssigned();
      }
    } catch (err: any) {
      setActionError(err.response?.data?.message || 'Failed to update status');
    } finally {
      setIsUpdating(false);
    }
  };

  // Metrics
  const totalAssigned = assignedComplaints.length;
  const pendingAction = assignedComplaints.filter((c) => c.status === 'ASSIGNED').length;
  const inProgress = assignedComplaints.filter((c) => c.status === 'IN_PROGRESS').length;
  const resolved = assignedComplaints.filter((c) => c.status === 'RESOLVED' || c.status === 'CLOSED').length;

  return (
    <div className="space-y-8 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Officer Operational Workspace
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Assigned complaints under your jurisdiction: {(user?.department as any)?.name || 'Department Division'}
          </p>
        </div>

        <Link
          to="/officer/complaints"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200"
        >
          View Full List <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {actionSuccess && <Alert type="success">{actionSuccess}</Alert>}

      {/* 4 Stat KPI Cards (PRD Section 36) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Assigned</p>
              <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-0.5">
                {totalAssigned}
              </h3>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Pending Action</p>
              <h3 className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-0.5">
                {pendingAction}
              </h3>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">In Progress</p>
              <h3 className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-0.5">
                {inProgress}
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
                {resolved}
              </h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Assigned Complaints Table (PRD Section 36) */}
      <Card>
        <CardHeader>
          <CardTitle>Assigned Work Orders</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-xs text-slate-400 animate-pulse">
              Loading assigned complaints...
            </div>
          ) : assignedComplaints.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-400 space-y-2">
              <p className="font-semibold text-sm text-slate-700 dark:text-slate-200">
                No complaints currently assigned
              </p>
              <p>When municipal administrators assign work orders, they will appear here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="px-6 py-3.5">Complaint #</th>
                    <th className="px-6 py-3.5">Title</th>
                    <th className="px-6 py-3.5">Priority</th>
                    <th className="px-6 py-3.5">Location</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5">Created</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {assignedComplaints.map((c) => (
                    <tr key={c._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-slate-900 dark:text-white">
                        {c.complaintNumber}
                      </td>
                      <td className="px-6 py-4 max-w-xs truncate font-medium text-slate-800 dark:text-slate-200">
                        {c.title}
                      </td>
                      <td className="px-6 py-4">
                        <Badge priority={c.priority} size="sm" />
                      </td>
                      <td className="px-6 py-4 max-w-xs truncate text-slate-500">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          {c.location?.address || 'On map'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <Badge status={c.status} size="sm" />
                      </td>
                      <td className="px-6 py-4 text-slate-400">
                        {new Date(c.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          type="button"
                          onClick={() => handleOpenStatusModal(c)}
                          className="px-2.5 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 hover:bg-blue-100 font-semibold"
                        >
                          Update Status
                        </button>
                        <Link
                          to={`/complaints/${c._id}`}
                          className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 font-semibold"
                        >
                          View
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
          title={`Update Complaint Status: ${selectedComplaint.complaintNumber}`}
          description={selectedComplaint.title}
        >
          {actionError && <Alert type="error" className="mb-4">{actionError}</Alert>}

          <form onSubmit={handleUpdateStatusSubmit} className="space-y-4 text-xs text-left">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Next Status Transition
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-medium"
              >
                <option value="IN_PROGRESS">IN_PROGRESS (Team dispatched on site)</option>
                <option value="RESOLVED">RESOLVED (Repairs / cleaning completed)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Resolution / Progress Remarks
              </label>
              <textarea
                rows={3}
                placeholder="Detail the work carried out, contractor notes, or maintenance completion info..."
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setSelectedComplaint(null)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                isLoading={isUpdating}
              >
                Confirm Update
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
