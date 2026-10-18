import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, UserPlus, Eye, Edit3, MapPin, X, Landmark, SlidersHorizontal } from 'lucide-react';
import { complaintsApi } from '../../api/complaints.api';
import { usersApi } from '../../api/users.api';
import { categoriesApi } from '../../api/categories.api';
import { departmentsApi } from '../../api/departments.api';
import { Complaint, User, Category, Department } from '../../types';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Modal } from '../../components/ui/Modal';
import { Alert } from '../../components/ui/Alert';
import { BackButton } from '../../components/ui/BackButton';

export const AdminComplaintsPage: React.FC = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [officers, setOfficers] = useState<User[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');

  // Assign Officer Modal
  const [assignModalComplaint, setAssignModalComplaint] = useState<Complaint | null>(null);
  const [selectedOfficerId, setSelectedOfficerId] = useState('');
  const [assignmentNotes, setAssignmentNotes] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);

  // Status Change Modal
  const [statusModalComplaint, setStatusModalComplaint] = useState<Complaint | null>(null);
  const [overrideStatus, setOverrideStatus] = useState('');
  const [overrideNotes, setOverrideNotes] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const [notificationMsg, setNotificationMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const params: any = { limit: 50 };
      if (searchTerm) params.search = searchTerm;
      if (statusFilter) params.status = statusFilter;
      if (priorityFilter) params.priority = priorityFilter;
      if (categoryFilter) params.category = categoryFilter;
      if (departmentFilter) params.department = departmentFilter;

      const [complaintsRes, officersRes, catRes, deptRes] = await Promise.all([
        complaintsApi.getComplaints(params),
        usersApi.getUsers({ role: 'OFFICER', limit: 50 }),
        categoriesApi.getCategories(),
        departmentsApi.getDepartments(),
      ]);

      if (complaintsRes.success && complaintsRes.data) setComplaints(complaintsRes.data);
      if (officersRes.success && officersRes.data) setOfficers(officersRes.data);
      if (catRes.success && catRes.data) setCategories(catRes.data);
      if (deptRes.success && deptRes.data) setDepartments(deptRes.data);
    } catch (err) {
      console.error('Failed to load admin complaints:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [statusFilter, priorityFilter, categoryFilter, departmentFilter, searchTerm]);

  // Open Assign Modal
  const handleOpenAssignModal = (complaint: Complaint) => {
    setAssignModalComplaint(complaint);
    setSelectedOfficerId(complaint.assignedOfficer?._id || complaint.assignedOfficer?.id || (officers[0]?._id || ''));
    setAssignmentNotes('');
  };

  // Submit Officer Assignment
  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignModalComplaint || !selectedOfficerId) return;

    try {
      setIsAssigning(true);
      const res = await complaintsApi.assignOfficer(assignModalComplaint._id, {
        officerId: selectedOfficerId,
        notes: assignmentNotes,
      });

      if (res.success) {
        setNotificationMsg({
          type: 'success',
          text: `Officer successfully assigned to Case ${assignModalComplaint.complaintNumber}.`,
        });
        setAssignModalComplaint(null);
        fetchData();
      }
    } catch (err: any) {
      setNotificationMsg({
        type: 'error',
        text: err.response?.data?.message || 'Assignment failed',
      });
    } finally {
      setIsAssigning(false);
    }
  };

  // Open Status Modal
  const handleOpenStatusModal = (complaint: Complaint) => {
    setStatusModalComplaint(complaint);
    setOverrideStatus(complaint.status);
    setOverrideNotes('');
  };

  // Submit Status Change
  const handleStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!statusModalComplaint) return;

    try {
      setIsUpdatingStatus(true);
      const res = await complaintsApi.updateStatus(statusModalComplaint._id, {
        status: overrideStatus,
        note: overrideNotes || 'Status override applied by Administration.',
      });

      if (res.success) {
        setNotificationMsg({
          type: 'success',
          text: `Case ${statusModalComplaint.complaintNumber} transitioned to ${overrideStatus}.`,
        });
        setStatusModalComplaint(null);
        fetchData();
      }
    } catch (err: any) {
      setNotificationMsg({
        type: 'error',
        text: err.response?.data?.message || 'Status transition failed',
      });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  return (
    <div className="space-y-6 text-left">
      <div>
        <BackButton fallbackUrl="/admin/dashboard" />
      </div>

      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-[#0F2537] text-[#C59B27] text-[10px] font-bold uppercase tracking-wider mb-1.5">
          <Landmark className="w-3 h-3" />
          Central Grievance Administration
        </div>
        <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#0F2537] dark:text-white">
          Manage All Civic Complaints
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Audit citizen submissions, assign field officers, monitor SLA adherence, and manage status transitions
        </p>
      </div>

      {notificationMsg && (
        <Alert type={notificationMsg.type}>{notificationMsg.text}</Alert>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-[#131E2D] p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by keywords, complaint number (CMP-...), address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/50 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-[#1B365D]"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#131E2D] text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:border-[#1B365D]"
          >
            <option value="">All Statuses</option>
            <option value="SUBMITTED">SUBMITTED</option>
            <option value="UNDER_REVIEW">UNDER_REVIEW</option>
            <option value="ASSIGNED">ASSIGNED</option>
            <option value="IN_PROGRESS">IN_PROGRESS</option>
            <option value="RESOLVED">RESOLVED</option>
            <option value="CLOSED">CLOSED</option>
            <option value="REJECTED">REJECTED</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#131E2D] text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:border-[#1B365D]"
          >
            <option value="">All Priorities</option>
            <option value="CRITICAL">CRITICAL</option>
            <option value="HIGH">HIGH</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="LOW">LOW</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#131E2D] text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:border-[#1B365D]"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>

          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#131E2D] text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:border-[#1B365D]"
          >
            <option value="">All Departments</option>
            {departments.map((dept) => (
              <option key={dept._id} value={dept._id}>
                {dept.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Complaints Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-12 text-center text-xs text-slate-400 animate-pulse">Loading grievance records...</div>
          ) : complaints.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-400">No grievances matching specified filter criteria.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="px-4 py-3">Case ID</th>
                    <th className="px-4 py-3">Subject</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Severity</th>
                    <th className="px-4 py-3">Department</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Assigned Officer</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {complaints.map((c) => (
                    <tr key={c._id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                      <td className="px-4 py-3 font-mono font-bold text-[#0F2537] dark:text-white">
                        {c.complaintNumber}
                      </td>
                      <td className="px-4 py-3 max-w-xs truncate font-semibold text-slate-800 dark:text-slate-200">
                        {c.title}
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300 font-medium">
                        {c.category?.name}
                      </td>
                      <td className="px-4 py-3">
                        <Badge priority={c.priority} size="sm" />
                      </td>
                      <td className="px-4 py-3 text-slate-500 truncate max-w-[120px]">
                        {c.department?.name}
                      </td>
                      <td className="px-4 py-3">
                        <Badge status={c.status} size="sm" />
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-700 dark:text-slate-300">
                        {c.assignedOfficer ? c.assignedOfficer.name : (
                          <span className="text-[#B45309] font-semibold italic text-[11px]">Unassigned</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right space-x-1.5 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleOpenAssignModal(c)}
                          className="px-2 py-1 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 text-[11px] font-bold cursor-pointer"
                        >
                          Assign
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenStatusModal(c)}
                          className="px-2 py-1 rounded bg-blue-50 dark:bg-blue-950/60 text-[#1B365D] dark:text-blue-300 hover:bg-blue-100 text-[11px] font-bold cursor-pointer"
                        >
                          Status
                        </button>
                        <Link
                          to={`/complaints/${c._id}`}
                          className="px-2 py-1 rounded border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 text-[11px] font-semibold"
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

      {/* Modal 1: Assign Officer Modal */}
      {assignModalComplaint && (
        <Modal
          isOpen={!!assignModalComplaint}
          onClose={() => setAssignModalComplaint(null)}
          title={`Assign Field Officer: Case ${assignModalComplaint.complaintNumber}`}
          description={assignModalComplaint.title}
        >
          <form onSubmit={handleAssignSubmit} className="space-y-4 text-xs text-left">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Select Designated Field Officer
              </label>
              <select
                value={selectedOfficerId}
                onChange={(e) => setSelectedOfficerId(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#131E2D] font-medium"
              >
                {officers.map((off) => (
                  <option key={off._id || off.id} value={off._id || off.id}>
                    {off.name} ({(off.department as any)?.name || 'General Division'})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Dispatch Instructions / Work Priority Note
              </label>
              <textarea
                rows={3}
                placeholder="Specific instructions, inspection timeframe, or special equipment required..."
                value={assignmentNotes}
                onChange={(e) => setAssignmentNotes(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#131E2D]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <Button type="button" variant="outline" size="sm" onClick={() => setAssignModalComplaint(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" isLoading={isAssigning}>
                Confirm Officer Dispatch
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal 2: Status Override Modal */}
      {statusModalComplaint && (
        <Modal
          isOpen={!!statusModalComplaint}
          onClose={() => setStatusModalComplaint(null)}
          title={`Administrative Status Override: Case ${statusModalComplaint.complaintNumber}`}
          description={statusModalComplaint.title}
        >
          <form onSubmit={handleStatusSubmit} className="space-y-4 text-xs text-left">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Official Status Transition
              </label>
              <select
                value={overrideStatus}
                onChange={(e) => setOverrideStatus(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#131E2D] font-medium"
              >
                <option value="SUBMITTED">SUBMITTED</option>
                <option value="UNDER_REVIEW">UNDER_REVIEW</option>
                <option value="ASSIGNED">ASSIGNED</option>
                <option value="IN_PROGRESS">IN_PROGRESS</option>
                <option value="RESOLVED">RESOLVED</option>
                <option value="CLOSED">CLOSED</option>
                <option value="REJECTED">REJECTED</option>
                <option value="DUPLICATE">DUPLICATE</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Audit Trail Explanation Note
              </label>
              <textarea
                rows={3}
                placeholder="Official reason for administrative override..."
                value={overrideNotes}
                onChange={(e) => setOverrideNotes(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#131E2D]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <Button type="button" variant="outline" size="sm" onClick={() => setStatusModalComplaint(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" isLoading={isUpdatingStatus}>
                Save Administrative Transition
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
