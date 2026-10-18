import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, CheckCircle2, XCircle } from 'lucide-react';
import { categoriesApi } from '../../api/categories.api';
import { departmentsApi } from '../../api/departments.api';
import { Category, Department, PriorityLevel } from '../../types';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Modal } from '../../components/ui/Modal';
import { Alert } from '../../components/ui/Alert';
import { useToast } from '../../context/ToastContext';
import { BackButton } from '../../components/ui/BackButton';

export const AdminCategoriesPage: React.FC = () => {
  const toast = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [defaultPriority, setDefaultPriority] = useState<PriorityLevel>('MEDIUM');
  const [icon, setIcon] = useState('AlertCircle');
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [catRes, deptRes] = await Promise.all([
        categoriesApi.getCategories(),
        departmentsApi.getDepartments({ activeOnly: true }),
      ]);
      if (catRes.success && catRes.data) setCategories(catRes.data);
      if (deptRes.success && deptRes.data) {
        setDepartments(deptRes.data);
        if (deptRes.data.length > 0) setDepartmentId(deptRes.data[0]._id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingCategory(null);
    setName('');
    setDescription('');
    setDefaultPriority('MEDIUM');
    setIcon('AlertCircle');
    if (departments.length > 0) setDepartmentId(departments[0]._id);
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setDescription(cat.description || '');
    setDepartmentId((cat.department as any)?._id || cat.department);
    setDefaultPriority(cat.defaultPriority);
    setIcon(cat.icon || 'AlertCircle');
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !departmentId) {
      setErrorMsg('Name and Department are required.');
      return;
    }

    try {
      setIsSaving(true);
      setErrorMsg(null);

      const payload = {
        name: name.trim(),
        description: description.trim(),
        department: departmentId,
        defaultPriority,
        icon,
      };

      if (editingCategory) {
        await categoriesApi.updateCategory(editingCategory._id, payload);
        setSuccessMsg(`Category "${name}" updated successfully.`);
      } else {
        await categoriesApi.createCategory(payload);
        setSuccessMsg(`Category "${name}" created successfully.`);
      }

      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to save category');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleActive = async (cat: Category) => {
    try {
      await categoriesApi.updateCategory(cat._id, { isActive: !cat.isActive });
      toast.success(`Category "${cat.name}" status updated.`);
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to toggle status');
    }
  };

  const handleDelete = async (cat: Category) => {
    if (!window.confirm(`Are you sure you want to delete category "${cat.name}"?`)) return;
    try {
      await categoriesApi.deleteCategory(cat._id);
      toast.success(`Category "${cat.name}" deleted.`);
      setSuccessMsg(`Category "${cat.name}" deleted.`);
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete category');
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
            Civic Complaint Categories
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Configure public issue categories, associated departments, and default severity levels
          </p>
        </div>

        <Button
          type="button"
          variant="primary"
          size="sm"
          onClick={handleOpenCreateModal}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Add New Category
        </Button>
      </div>

      {successMsg && <Alert type="success">{successMsg}</Alert>}

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-12 text-center text-xs text-slate-400">Loading categories...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 text-slate-500 font-semibold uppercase text-[10px]">
                  <tr>
                    <th className="px-6 py-3.5">Category Name</th>
                    <th className="px-6 py-3.5">Slug</th>
                    <th className="px-6 py-3.5">Department</th>
                    <th className="px-6 py-3.5">Default Priority</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {categories.map((cat) => (
                    <tr key={cat._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                        {cat.name}
                      </td>
                      <td className="px-6 py-4 font-mono text-slate-400">
                        {cat.slug}
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-700 dark:text-slate-300">
                        {(cat.department as any)?.name || 'General'}
                      </td>
                      <td className="px-6 py-4">
                        <Badge priority={cat.defaultPriority} size="sm" />
                      </td>
                      <td className="px-6 py-4">
                        <button
                          type="button"
                          onClick={() => handleToggleActive(cat)}
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            cat.isActive
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-slate-100 text-slate-500 border border-slate-300'
                          }`}
                        >
                          {cat.isActive ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(cat)}
                          className="px-2.5 py-1 rounded bg-blue-50 text-blue-600 hover:bg-blue-100 text-[11px] font-semibold"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(cat)}
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

      {/* Create / Edit Modal (PRD Section 40) */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingCategory ? `Edit Category: ${editingCategory.name}` : 'Create Civic Category'}
        >
          {errorMsg && <Alert type="error" className="mb-4">{errorMsg}</Alert>}

          <form onSubmit={handleSaveCategory} className="space-y-4 text-xs text-left">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Category Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Broken Footpaths"
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Associated Department *
              </label>
              <select
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
              >
                {departments.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.name} ({d.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Default Severity / Priority
              </label>
              <select
                value={defaultPriority}
                onChange={(e) => setDefaultPriority(e.target.value as PriorityLevel)}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
              >
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
                <option value="CRITICAL">CRITICAL</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Description
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description for citizen guidance..."
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" isLoading={isSaving}>
                Save Category
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
