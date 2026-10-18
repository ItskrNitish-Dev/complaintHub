import React, { useEffect, useState } from 'react';
import { Search, Shield, UserCheck, UserX, Edit2 } from 'lucide-react';
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
      const params: any = { limit: 50 };
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
          text: `Role for ${selectedUser.name} updated to ${targetRole}.`,
        });
        setSelectedUser(null);
        fetchUsers();
      }
    } catch (err: any) {
      setNotification({
        type: 'error',
        text: err.response?.data?.message || 'Failed to update role',
      });
    } finally {
      setIsSavingRole(false);
    }
  };

  const handleToggleStatus = async (u: User) => {
    const nextStatus = !u.isActive;
    const confirmText = nextStatus
      ? `Activate account for ${u.name}?`
      : `Deactivate account for ${u.name}?`;
    if (!window.confirm(confirmText)) return;

    try {
      const res = await usersApi.updateUserStatus(u.id || u._id!, {
        isActive: nextStatus,
      });
      if (res.success) {
        setNotification({
          type: 'success',
          text: `User ${u.name} is now ${nextStatus ? 'active' : 'deactivated'}.`,
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

  return (
    <div className="space-y-6 text-left">
      <div>
        <BackButton fallbackUrl="/admin/dashboard" />
      </div>

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          User Account Directory
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Manage system users, assign municipal officer divisions, and control account statuses
        </p>
      </div>

      {notification && <Alert type={notification.type}>{notification.text}</Alert>}

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search users by name, email, phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
        >
          <option value="">All Roles</option>
          <option value="CITIZEN">Citizens</option>
          <option value="OFFICER">Officers</option>
          <option value="ADMIN">Admins</option>
        </select>
      </div>

      {/* Table (PRD Section 39) */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-12 text-center text-xs text-slate-400">Loading users...</div>
          ) : users.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-400">No users found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 text-slate-500 font-semibold uppercase text-[10px]">
                  <tr>
                    <th className="px-6 py-3.5">Name</th>
                    <th className="px-6 py-3.5">Email</th>
                    <th className="px-6 py-3.5">Role</th>
                    <th className="px-6 py-3.5">Department</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5">Registered</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {users.map((u) => (
                    <tr key={u._id || u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                        {u.name}
                      </td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                        {u.email}
                      </td>
                      <td className="px-6 py-4">
                        <Badge role={u.role} size="sm" />
                      </td>
                      <td className="px-6 py-4 text-slate-500">
                        {(u.department as any)?.name || '—'}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            u.isActive
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-400'
                              : 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/60 dark:text-rose-400'
                          }`}
                        >
                          {u.isActive ? 'Active' : 'Deactivated'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-400">
                        {new Date(u.createdAt || '').toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(u)}
                          className="px-2.5 py-1 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 hover:bg-blue-100 text-[11px] font-semibold"
                        >
                          Change Role
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(u)}
                          className={`px-2.5 py-1 rounded text-[11px] font-semibold ${
                            u.isActive
                              ? 'bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-950/60'
                              : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-950/60'
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

      {/* Change Role Modal */}
      {selectedUser && (
        <Modal
          isOpen={!!selectedUser}
          onClose={() => setSelectedUser(null)}
          title={`Edit Role & Permissions: ${selectedUser.name}`}
          description={selectedUser.email}
        >
          <form onSubmit={handleSaveRole} className="space-y-4 text-xs text-left">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Account Role
              </label>
              <select
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value as UserRole)}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-medium"
              >
                <option value="CITIZEN">CITIZEN (Standard User)</option>
                <option value="OFFICER">OFFICER (Department Field Responder)</option>
                <option value="ADMIN">ADMIN (System Administrator)</option>
              </select>
            </div>

            {targetRole === 'OFFICER' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Assign Officer to Department
                </label>
                <select
                  value={targetDept}
                  onChange={(e) => setTargetDept(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-medium"
                >
                  {departments.map((d) => (
                    <option key={d._id} value={d._id}>
                      {d.name} ({d.code})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <Button type="button" variant="outline" size="sm" onClick={() => setSelectedUser(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" isLoading={isSavingRole}>
                Save Changes
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
