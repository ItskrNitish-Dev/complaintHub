import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Eye,
  MapPin,
  Landmark,
  ShieldAlert,
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
        setActionSuccess(`Case ${selectedComplaint.complaintNumber} transitioned to ${newStatus}.`);
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
    <div className="space-y-6 text-left">
      <div className="bg-white dark:bg-[#131E2D] p-5 sm:p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-l-4 border-l-[#1B365D]">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-[#0F2537] text-[#C59B27] text-[10px] font-bold uppercase tracking-wider mb-1.5">
            <Landmark className="w-3 h-3" />
            Field Officer Operational Workbench
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#0F2537] dark:text-white">
            Municipal Work Orders & Dispatch
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Designated Division: {(user?.department as any)?.name || 'General Public Works Wing'} • Officer: {user?.name}
          </p>
        </div>

        <Link
          to="/officer/complaints"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#131E2D] text-xs font-bold uppercase tracking-wider text-[#1B365D] dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 self-start sm:self-auto"
        >
          All Assigned Dossiers <ArrowRight className="w-3.5 h-3.5 text-[#C59B27]" />
        </Link>
      </div>

      {actionSuccess && <Alert type="success">{actionSuccess}</Alert>}

      {/* 4 Stat KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#131E2D] p-4 sm:p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-lg bg-slate-100 dark:bg-slate-800 text-[#1B365D] dark:text-blue-400 flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-700">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Assigned</p>
            <h3 className="text-xl sm:text-2xl font-extrabold text-[#0F2537] dark:text-white mt-0.5">
              {totalAssigned}
            </h3>
          </div>
        </div>

        <div className="bg-white dark:bg-[#131E2D] p-4 sm:p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-[#4338CA] dark:text-indigo-300 flex items-center justify-center shrink-0 border border-indigo-200 dark:border-indigo-800">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Awaiting Action</p>
            <h3 className="text-xl sm:text-2xl font-extrabold text-[#4338CA] dark:text-indigo-400 mt-0.5">
              {pendingAction}
            </h3>
          </div>
        </div>

        <div className="bg-white dark:bg-[#131E2D] p-4 sm:p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-[#1B365D] dark:text-blue-300 flex items-center justify-center shrink-0 border border-blue-200 dark:border-blue-800">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Works In Progress</p>
            <h3 className="text-xl sm:text-2xl font-extrabold text-[#1B365D] dark:text-blue-400 mt-0.5">
              {inProgress}
            </h3>
          </div>
        </div>

        <div className="bg-white dark:bg-[#131E2D] p-4 sm:p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-[#047857] dark:text-emerald-300 flex items-center justify-center shrink-0 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Resolved Cases</p>
            <h3 className="text-xl sm:text-2xl font-extrabold text-[#047857] dark:text-emerald-400 mt-0.5">
              {resolved}
            </h3>
          </div>
        </div>
      </div>

      {/* Assigned Complaints Table */}
      <Card>
        <CardHeader className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex flex-row items-center justify-between">
          <CardTitle className="text-xs font-bold uppercase tracking-wider text-[#0F2537] dark:text-white flex items-center gap-2">
            <FileText className="w-3.5 h-3.5 text-[#C59B27]" />
            Official Field Work Orders
          </CardTitle>
          <span className="text-[10px] font-mono text-slate-500">{assignedComplaints.length} Records</span>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-xs text-slate-400 animate-pulse">
              Loading work orders...
            </div>
          ) : assignedComplaints.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-400 space-y-2">
              <p className="font-bold text-sm text-[#0F2537] dark:text-slate-200">
                No grievances currently assigned
              </p>
              <p>When municipal administrators assign work orders, they will appear in this registry.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="px-5 py-3">Case ID</th>
                    <th className="px-5 py-3">Subject</th>
                    <th className="px-5 py-3">Severity</th>
                    <th className="px-5 py-3">Location</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Assigned Date</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {assignedComplaints.map((c) => (
                    <tr key={c._id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
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
                <option value="IN_PROGRESS">IN_PROGRESS (Field team active on site)</option>
                <option value="RESOLVED">RESOLVED (Maintenance works completed)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Official Resolution / Inspection Remarks
              </label>
              <textarea
                rows={3}
                placeholder="Detail work carried out, materials used, or inspection outcome..."
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#131E2D]"
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
                Confirm Official Transition
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
