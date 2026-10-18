import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { departmentsApi } from '../../api/departments.api';
import { Department } from '../../types';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { Modal } from '../../components/ui/Modal';
import { Alert } from '../../components/ui/Alert';
import { useToast } from '../../context/ToastContext';
import { BackButton } from '../../components/ui/BackButton';

export const AdminDepartmentsPage: React.FC = () => {
  const toast = useToast();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchDepartments = async () => {
    try {
      setIsLoading(true);
      const res = await departmentsApi.getDepartments();
      if (res.success && res.data) {
        setDepartments(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingDept(null);
    setName('');
    setCode('');
    setDescription('');
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (d: Department) => {
    setEditingDept(d);
    setName(d.name);
    setCode(d.code);
    setDescription(d.description || '');
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const handleSaveDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) {
      setErrorMsg('Name and Code are required.');
      return;
    }

    try {
      setIsSaving(true);
      setErrorMsg(null);

      const payload = {
        name: name.trim(),
        code: code.trim().toUpperCase(),
        description: description.trim(),
      };

      if (editingDept) {
        await departmentsApi.updateDepartment(editingDept._id, payload);
        setSuccessMsg(`Department "${name}" updated successfully.`);
      } else {
        await departmentsApi.createDepartment(payload);
        setSuccessMsg(`Department "${name}" created successfully.`);
      }

      setIsModalOpen(false);
      fetchDepartments();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to save department');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleActive = async (d: Department) => {
    try {
      await departmentsApi.updateDepartment(d._id, { isActive: !d.isActive });
      toast.success(`Department "${d.name}" status updated.`);
      fetchDepartments();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to toggle status');
    }
  };

  const handleDelete = async (d: Department) => {
    if (!window.confirm(`Are you sure you want to delete department "${d.name}"?`)) return;
    try {
      await departmentsApi.deleteDepartment(d._id);
      toast.success(`Department "${d.name}" deleted.`);
      setSuccessMsg(`Department "${d.name}" deleted.`);
      fetchDepartments();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete department');
    }
  };

  return (
    <div className="space-y-6 text-left">
      <div>
        <BackButton fallbackUrl="/admin/dashboard" />
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Municipal Departments
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Maintain municipal authorities, department codes, and operational units
          </p>
        </div>

        <Button
          type="button"
          variant="primary"
          size="sm"
          onClick={handleOpenCreateModal}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Add New Department
        </Button>
      </div>

      {successMsg && <Alert type="success">{successMsg}</Alert>}

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-12 text-center text-xs text-slate-400">Loading departments...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 text-slate-500 font-semibold uppercase text-[10px]">
                  <tr>
                    <th className="px-6 py-3.5">Department Name</th>
                    <th className="px-6 py-3.5">Division Code</th>
                    <th className="px-6 py-3.5">Description</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {departments.map((d) => (
                    <tr key={d._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                        {d.name}
                      </td>
                      <td className="px-6 py-4 font-mono font-bold text-blue-600 dark:text-blue-400">
                        {d.code}
                      </td>
                      <td className="px-6 py-4 max-w-sm truncate text-slate-500">
                        {d.description || '—'}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          type="button"
                          onClick={() => handleToggleActive(d)}
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            d.isActive
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-slate-100 text-slate-500 border border-slate-300'
                          }`}
                        >
                          {d.isActive ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(d)}
                          className="px-2.5 py-1 rounded bg-blue-50 text-blue-600 hover:bg-blue-100 text-[11px] font-semibold"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(d)}
                          className="px-2.5 py-1 rounded bg-rose-50 text-rose-600 hover:bg-rose-100 text-[11px] font-semibold"
                        >
                          Delete
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

      {/* Create / Edit Department Modal */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingDept ? `Edit Department: ${editingDept.name}` : 'Create Department'}
        >
          {errorMsg && <Alert type="error" className="mb-4">{errorMsg}</Alert>}

          <form onSubmit={handleSaveDepartment} className="space-y-4 text-xs text-left">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Department Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Environmental Health"
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Division Code (Uppercase) *
              </label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="e.g. ENV"
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 uppercase"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Description
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Responsibilities and civic scope..."
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" isLoading={isSaving}>
                Save Department
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
