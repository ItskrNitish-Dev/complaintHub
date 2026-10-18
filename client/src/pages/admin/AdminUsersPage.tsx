import React, { useEffect, useState } from 'react';
import { 
  Search, 
  Shield, 
  UserCheck, 
  UserX, 
  Edit2, 
  Users, 
  Building2, 
  UserCog, 
  CheckCircle2, 
  XCircle,
  Filter,
  ShieldCheck
} from 'lucide-react';
import { usersApi } from '../../api/users.api';
import { departmentsApi } from '../../api/departments.api';
import { User, Department, UserRole } from '../../types';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { Modal } from '../../components/ui/Modal';
import { Alert } from '../../components/ui/Alert';
import { BackButton } from '../../components/ui/BackButton';

export const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [roleFilter, setRoleFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Edit Role Modal
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [targetRole, setTargetRole] = useState<UserRole>('CITIZEN');
  const [targetDept, setTargetDept] = useState<string>('');
  const [isSavingRole, setIsSavingRole] = useState(false);

  const [notification, setNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const params: any = { limit: 100 };
      if (roleFilter) params.role = roleFilter;
      if (searchTerm) params.search = searchTerm;

      const [usersRes, deptsRes] = await Promise.all([
        usersApi.getUsers(params),
        departmentsApi.getDepartments(),
      ]);

      if (usersRes.success && usersRes.data) setUsers(usersRes.data);
      if (deptsRes.success && deptsRes.data) setDepartments(deptsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, searchTerm]);

  const handleOpenEditModal = (u: User) => {
    setSelectedUser(u);
    setTargetRole(u.role);
    setTargetDept(u.department?._id || (departments[0]?._id || ''));
  };

  const handleSaveRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    try {
      setIsSavingRole(true);
      const res = await usersApi.updateUserRole(selectedUser.id || selectedUser._id!, {
        role: targetRole,
        department: targetRole === 'OFFICER' ? targetDept : null,
      });

      if (res.success) {
        setNotification({
          type: 'success',
          text: `Role for ${selectedUser.name} updated to ${targetRole} successfully.`,
        });
        setSelectedUser(null);
        fetchUsers();
      }
    } catch (err: any) {
      setNotification({
        type: 'error',
        text: err.response?.data?.message || 'Failed to update user role',
      });
    } finally {
      setIsSavingRole(false);
    }
  };

  const handleToggleStatus = async (u: User) => {
    const nextStatus = !u.isActive;
    const confirmText = nextStatus
      ? `Activate citizen/officer account for ${u.name}?`
      : `Deactivate account for ${u.name}? User will lose portal access.`;
    if (!window.confirm(confirmText)) return;

    try {
      const res = await usersApi.updateUserStatus(u.id || u._id!, {
        isActive: nextStatus,
      });
      if (res.success) {
        setNotification({
          type: 'success',
          text: `Account for ${u.name} is now ${nextStatus ? 'ACTIVE' : 'DEACTIVATED'}.`,
        });
        fetchUsers();
      }
    } catch (err: any) {
      setNotification({
        type: 'error',
        text: err.response?.data?.message || 'Failed to update user status',
      });
    }
  };

  // Metrics
  const totalCount = users.length;
  const citizenCount = users.filter((u) => u.role === 'CITIZEN').length;
  const officerCount = users.filter((u) => u.role === 'OFFICER').length;
  const adminCount = users.filter((u) => u.role === 'ADMIN').length;

  return (
    <div className="space-y-6 text-left">
      <div>
        <BackButton fallbackUrl="/admin/dashboard" />
      </div>

      {/* Official Government Header Banner */}
      <div className="border-b-2 border-[#CBD5E1] dark:border-slate-800 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-bold tracking-wider uppercase bg-[#1B365D]/10 text-[#1B365D] dark:bg-blue-950/60 dark:text-blue-300 border border-[#1B365D]/20 mb-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#C59B27]" />
              Municipal Administration • Citizen & Personnel Directory
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-[#0F2537] dark:text-white">
              User Account Directory & Division Allocation
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              Authoritative registry of registered citizens, assigned department field officers, and system administrators.
            </p>
          </div>
        </div>
      </div>

      {notification && (
        <Alert type={notification.type} onClose={() => setNotification(null)}>
          {notification.text}
        </Alert>
      )}

      {/* Registry Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-[#131E2D] p-3.5 rounded-none border border-[#CBD5E1] dark:border-slate-800 border-t-2 border-t-[#1B365D] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Enrolled</span>
            <Users className="w-4 h-4 text-[#1B365D]" />
          </div>
          <p className="text-2xl font-bold text-[#0F2537] dark:text-white mt-1">{totalCount}</p>
          <span className="text-[10px] text-slate-400">All registered records</span>
        </div>

        <div className="bg-white dark:bg-[#131E2D] p-3.5 rounded-none border border-[#CBD5E1] dark:border-slate-800 border-t-2 border-t-blue-600 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Citizens</span>
            <UserCheck className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-blue-700 dark:text-blue-400 mt-1">{citizenCount}</p>
          <span className="text-[10px] text-slate-400">Public complainants</span>
        </div>

        <div className="bg-white dark:bg-[#131E2D] p-3.5 rounded-none border border-[#CBD5E1] dark:border-slate-800 border-t-2 border-t-[#C59B27] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Field Officers</span>
            <Building2 className="w-4 h-4 text-[#C59B27]" />
          </div>
          <p className="text-2xl font-bold text-[#B0881E] dark:text-[#C59B27] mt-1">{officerCount}</p>
          <span className="text-[10px] text-slate-400">Department nodal officers</span>
        </div>

        <div className="bg-white dark:bg-[#131E2D] p-3.5 rounded-none border border-[#CBD5E1] dark:border-slate-800 border-t-2 border-t-[#0F2537] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Administrators</span>
            <Shield className="w-4 h-4 text-[#0F2537] dark:text-slate-300" />
          </div>
          <p className="text-2xl font-bold text-[#0F2537] dark:text-slate-200 mt-1">{adminCount}</p>
          <span className="text-[10px] text-slate-400">Executive authority</span>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white dark:bg-[#131E2D] p-3.5 border border-[#CBD5E1] dark:border-slate-800 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by full name, email address, or contact number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-none border border-[#CBD5E1] dark:border-slate-700 bg-[#F8FAFC] dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#1B365D] focus:border-[#1B365D]"
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="text-[11px] font-bold uppercase text-slate-500 whitespace-nowrap">Filter Role:</label>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-none border border-[#CBD5E1] dark:border-slate-700 bg-[#F8FAFC] dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#1B365D]"
          >
            <option value="">All Designations ({totalCount})</option>
            <option value="CITIZEN">Citizens ({citizenCount})</option>
            <option value="OFFICER">Field Officers ({officerCount})</option>
            <option value="ADMIN">System Admins ({adminCount})</option>
          </select>
        </div>
      </div>

      {/* Official Directory Table */}
      <Card className="rounded-none border-[#CBD5E1] dark:border-slate-800 overflow-hidden shadow-xs">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-12 text-center text-xs text-slate-500">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-[#1B365D] border-t-transparent mb-2" />
              <p>Fetching official personnel registry records...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500">
              <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="font-semibold text-slate-700 dark:text-slate-300">No personnel records found</p>
              <p className="text-[11px] text-slate-400 mt-1">Try clearing your search query or role filter.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-[#0F2537] text-white border-b-2 border-[#C59B27] text-[10px] font-bold uppercase tracking-wider">
                  <tr>
                    <th className="px-5 py-3">User & Contact Information</th>
                    <th className="px-5 py-3">Designation / Role</th>
                    <th className="px-5 py-3">Assigned Department</th>
                    <th className="px-5 py-3">Account Status</th>
                    <th className="px-5 py-3">Registration Date</th>
                    <th className="px-5 py-3 text-right">Administrative Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#CBD5E1]/60 dark:divide-slate-800 bg-white dark:bg-[#131E2D]">
                  {users.map((u) => (
                    <tr key={u._id || u.id} className="hover:bg-[#EEF2F6]/50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-none bg-[#1B365D]/10 dark:bg-blue-950 text-[#1B365D] dark:text-blue-300 font-bold text-xs flex items-center justify-center border border-[#1B365D]/20">
                            {u.name?.charAt(0)?.toUpperCase() || 'U'}
                          </div>
                          <div>
                            <p className="font-bold text-[#0F2537] dark:text-white leading-tight">{u.name}</p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">{u.email}</p>
                            {u.phone && <p className="text-[10px] text-slate-400">Tel: {u.phone}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge role={u.role} size="sm" />
                      </td>
                      <td className="px-5 py-3.5">
                        {u.role === 'OFFICER' ? (
                          (u.department as any)?.name ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#1B365D] dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 border border-blue-200 dark:border-blue-800">
                              <Building2 className="w-3 h-3 text-[#C59B27]" />
                              {(u.department as any).name}
                            </span>
                          ) : (
                            <span className="text-[11px] text-amber-600 dark:text-amber-400 italic">Unassigned Division</span>
                          )
                        ) : u.role === 'ADMIN' ? (
                          <span className="text-[11px] text-slate-500 font-medium">Headquarters Oversight</span>
                        ) : (
                          <span className="text-[11px] text-slate-400">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                            u.isActive
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300'
                              : 'bg-rose-50 text-rose-800 border border-rose-300 dark:bg-rose-950/60 dark:text-rose-300'
                          }`}
                        >
                          {u.isActive ? (
                            <>
                              <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                              Active
                            </>
                          ) : (
                            <>
                              <XCircle className="w-2.5 h-2.5 text-rose-600" />
                              Suspended
                            </>
                          )}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-slate-500 text-[11px]">
                        {new Date(u.createdAt || '').toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="px-5 py-3.5 text-right space-x-1.5 whitespace-nowrap">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenEditModal(u)}
                          className="text-[11px] py-1 px-2 border-[#1B365D] text-[#1B365D] hover:bg-[#1B365D] hover:text-white"
                          leftIcon={<UserCog className="w-3 h-3" />}
                        >
                          Modify Role
                        </Button>
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(u)}
                          className={`px-2 py-1 text-[11px] font-bold border transition-colors ${
                            u.isActive
                              ? 'border-rose-300 text-rose-700 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-300'
                              : 'border-emerald-300 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300'
                          }`}
                        >
                          {u.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Change Role / Division Modal */}
      {selectedUser && (
        <Modal
          isOpen={!!selectedUser}
          onClose={() => setSelectedUser(null)}
          title={`Administrative Role Modification: ${selectedUser.name}`}
          description={`Registered Email: ${selectedUser.email}`}
        >
          <div className="border-t-2 border-[#C59B27] pt-3 -mt-2 mb-4">
            <p className="text-[11px] text-slate-500">
              Update user authority designation. Officers require a mandatory municipal division assignment to accept grievance work orders.
            </p>
          </div>

          <form onSubmit={handleSaveRole} className="space-y-4 text-xs text-left">
            <div>
              <label className="block text-xs font-bold text-[#0F2537] dark:text-slate-300 mb-1 uppercase tracking-wide">
                Account Authority Role *
              </label>
              <select
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value as UserRole)}
                className="w-full p-2.5 rounded-none border border-[#CBD5E1] dark:border-slate-700 bg-white dark:bg-slate-900 font-medium text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#1B365D]"
              >
                <option value="CITIZEN">CITIZEN (Public Portal User - File & Track Grievances)</option>
                <option value="OFFICER">OFFICER (Department Field Responder - Grievance Resolution)</option>
                <option value="ADMIN">ADMIN (System Administrator - Full Municipal Oversight)</option>
              </select>
            </div>

            {targetRole === 'OFFICER' && (
              <div>
                <label className="block text-xs font-bold text-[#0F2537] dark:text-slate-300 mb-1 uppercase tracking-wide">
                  Assign Officer to Municipal Department *
                </label>
                <select
                  value={targetDept}
                  onChange={(e) => setTargetDept(e.target.value)}
                  className="w-full p-2.5 rounded-none border border-[#CBD5E1] dark:border-slate-700 bg-white dark:bg-slate-900 font-medium text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#1B365D]"
                >
                  {departments.map((d) => (
                    <option key={d._id} value={d._id}>
                      {d.name} ({d.code})
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-400 mt-1">
                  Officer will automatically receive dispatch work orders for grievances under this department.
                </p>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-3 border-t border-[#CBD5E1] dark:border-slate-800">
              <Button type="button" variant="outline" size="sm" onClick={() => setSelectedUser(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" isLoading={isSavingRole}>
                Confirm & Update Role
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
