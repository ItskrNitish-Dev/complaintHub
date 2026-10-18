import React, { useEffect, useState } from 'react';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  Tags, 
  Building2, 
  AlertTriangle, 
  Search,
  ShieldCheck,
  FolderTree
} from 'lucide-react';
import { categoriesApi } from '../../api/categories.api';
import { departmentsApi } from '../../api/departments.api';
import { Category, Department, PriorityLevel } from '../../types';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { Modal } from '../../components/ui/Modal';
import { Alert } from '../../components/ui/Alert';
import { useToast } from '../../context/ToastContext';
import { BackButton } from '../../components/ui/BackButton';

export const AdminCategoriesPage: React.FC = () => {
  const toast = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('');
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
        if (deptRes.data.length > 0 && !departmentId) setDepartmentId(deptRes.data[0]._id);
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
      setErrorMsg('Name and Associated Department are required.');
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
    if (!window.confirm(`Are you sure you want to permanently delete category "${cat.name}"?`)) return;
    try {
      await categoriesApi.deleteCategory(cat._id);
      toast.success(`Category "${cat.name}" deleted.`);
      setSuccessMsg(`Category "${cat.name}" deleted.`);
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete category');
    }
  };

  // Filter categories
  const filteredCategories = categories.filter((cat) => {
    const matchesSearch = 
      cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (cat.slug && cat.slug.toLowerCase().includes(searchTerm.toLowerCase()));
    const deptId = (cat.department as any)?._id || cat.department;
    const matchesDept = selectedDeptFilter ? deptId === selectedDeptFilter : true;
    return matchesSearch && matchesDept;
  });

  const activeCount = categories.filter((c) => c.isActive).length;
  const criticalHighCount = categories.filter((c) => c.defaultPriority === 'HIGH' || c.defaultPriority === 'CRITICAL').length;

  return (
    <div className="space-y-6 text-left">
      <div>
        <BackButton fallbackUrl="/admin/dashboard" />
      </div>

      {/* Official Header Banner */}
      <div className="border-b-2 border-[#CBD5E1] dark:border-slate-800 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-bold tracking-wider uppercase bg-[#1B365D]/10 text-[#1B365D] dark:bg-blue-950/60 dark:text-blue-300 border border-[#1B365D]/20 mb-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#C59B27]" />
              Municipal Administration • Civic Services Master List
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-[#0F2537] dark:text-white">
              Civic Grievance Categories & Classification
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              Configure public issue classifications, default grievance severities, and municipal department routing rules.
            </p>
          </div>

          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleOpenCreateModal}
            leftIcon={<Plus className="w-4 h-4 text-[#C59B27]" />}
            className="self-start sm:self-auto bg-[#1B365D] hover:bg-[#0F2537]"
          >
            Add New Category
          </Button>
        </div>
      </div>

      {successMsg && (
        <Alert type="success" onClose={() => setSuccessMsg(null)}>
          {successMsg}
        </Alert>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-[#131E2D] p-3.5 rounded-none border border-[#CBD5E1] dark:border-slate-800 border-t-2 border-t-[#1B365D] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Categories</span>
            <Tags className="w-4 h-4 text-[#1B365D]" />
          </div>
          <p className="text-2xl font-bold text-[#0F2537] dark:text-white mt-1">{categories.length}</p>
          <span className="text-[10px] text-slate-400">Master issue types</span>
        </div>

        <div className="bg-white dark:bg-[#131E2D] p-3.5 rounded-none border border-[#CBD5E1] dark:border-slate-800 border-t-2 border-t-emerald-600 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Active Services</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400 mt-1">{activeCount}</p>
          <span className="text-[10px] text-slate-400">Available to citizens</span>
        </div>

        <div className="bg-white dark:bg-[#131E2D] p-3.5 rounded-none border border-[#CBD5E1] dark:border-slate-800 border-t-2 border-t-[#C59B27] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Departments</span>
            <Building2 className="w-4 h-4 text-[#C59B27]" />
          </div>
          <p className="text-2xl font-bold text-[#B0881E] dark:text-[#C59B27] mt-1">{departments.length}</p>
          <span className="text-[10px] text-slate-400">Operating authorities</span>
        </div>

        <div className="bg-white dark:bg-[#131E2D] p-3.5 rounded-none border border-[#CBD5E1] dark:border-slate-800 border-t-2 border-t-amber-600 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">High / Critical SLA</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-bold text-amber-700 dark:text-amber-400 mt-1">{criticalHighCount}</p>
          <span className="text-[10px] text-slate-400">Priority expedited issues</span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white dark:bg-[#131E2D] p-3.5 border border-[#CBD5E1] dark:border-slate-800 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search categories by name, slug or keyword..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-none border border-[#CBD5E1] dark:border-slate-700 bg-[#F8FAFC] dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#1B365D]"
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="text-[11px] font-bold uppercase text-slate-500 whitespace-nowrap">Department:</label>
          <select
            value={selectedDeptFilter}
            onChange={(e) => setSelectedDeptFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-none border border-[#CBD5E1] dark:border-slate-700 bg-[#F8FAFC] dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#1B365D]"
          >
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d._id} value={d._id}>
                {d.name} ({d.code})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Official Table */}
      <Card className="rounded-none border-[#CBD5E1] dark:border-slate-800 overflow-hidden shadow-xs">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-12 text-center text-xs text-slate-500">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-[#1B365D] border-t-transparent mb-2" />
              <p>Loading civic categories database...</p>
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500">
              <FolderTree className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="font-semibold text-slate-700 dark:text-slate-300">No categories matching criteria</p>
              <p className="text-[11px] text-slate-400 mt-1">Try modifying your filters or create a new category.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-[#0F2537] text-white border-b-2 border-[#C59B27] text-[10px] font-bold uppercase tracking-wider">
                  <tr>
                    <th className="px-5 py-3">Category Name & Details</th>
                    <th className="px-5 py-3">Identifier Slug</th>
                    <th className="px-5 py-3">Assigned Department</th>
                    <th className="px-5 py-3">Default Severity SLA</th>
                    <th className="px-5 py-3">Citizen Availability</th>
                    <th className="px-5 py-3 text-right">Administrative Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#CBD5E1]/60 dark:divide-slate-800 bg-white dark:bg-[#131E2D]">
                  {filteredCategories.map((cat) => (
                    <tr key={cat._id} className="hover:bg-[#EEF2F6]/50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="font-bold text-[#0F2537] dark:text-white text-sm">
                          {cat.name}
                        </div>
                        {cat.description && (
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                            {cat.description}
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-3.5 font-mono text-[11px] text-slate-600 dark:text-slate-400">
                        {cat.slug}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#1B365D] dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 border border-blue-200 dark:border-blue-800">
                          <Building2 className="w-3 h-3 text-[#C59B27]" />
                          {(cat.department as any)?.name || 'General Municipal'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge priority={cat.defaultPriority} size="sm" />
                      </td>
                      <td className="px-5 py-3.5">
                        <button
                          type="button"
                          onClick={() => handleToggleActive(cat)}
                          title="Click to toggle citizen availability"
                          className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border cursor-pointer ${
                            cat.isActive
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300'
                              : 'bg-slate-100 text-slate-600 border-slate-300 dark:bg-slate-800 dark:text-slate-400'
                          }`}
                        >
                          {cat.isActive ? (
                            <>
                              <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                              Active in Portal
                            </>
                          ) : (
                            <>
                              <XCircle className="w-2.5 h-2.5 text-slate-400" />
                              Suspended
                            </>
                          )}
                        </button>
                      </td>
                      <td className="px-5 py-3.5 text-right space-x-1.5 whitespace-nowrap">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenEditModal(cat)}
                          className="text-[11px] py-1 px-2 border-[#1B365D] text-[#1B365D] hover:bg-[#1B365D] hover:text-white"
                          leftIcon={<Edit2 className="w-3 h-3" />}
                        >
                          Edit
                        </Button>
                        <button
                          type="button"
                          onClick={() => handleDelete(cat)}
                          className="px-2 py-1 text-[11px] font-bold border border-rose-300 text-rose-700 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-300 transition-colors"
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

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingCategory ? `Modify Grievance Category: ${editingCategory.name}` : 'Register New Grievance Category'}
          description="Categories are surfaced on the citizen grievance filing wizard and define routing rules."
        >
          <div className="border-t-2 border-[#C59B27] pt-3 -mt-2 mb-4">
            <p className="text-[11px] text-slate-500">
              Ensure accurate department assignment so field officers receive incoming grievance notices immediately.
            </p>
          </div>

          {errorMsg && <Alert type="error" className="mb-4">{errorMsg}</Alert>}

          <form onSubmit={handleSaveCategory} className="space-y-4 text-xs text-left">
            <div>
              <label className="block text-xs font-bold text-[#0F2537] dark:text-slate-300 mb-1 uppercase tracking-wide">
                Category Title *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Broken Footpaths & Walkways"
                className="w-full p-2.5 rounded-none border border-[#CBD5E1] dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#1B365D]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0F2537] dark:text-slate-300 mb-1 uppercase tracking-wide">
                Associated Municipal Department *
              </label>
              <select
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                className="w-full p-2.5 rounded-none border border-[#CBD5E1] dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#1B365D]"
              >
                {departments.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.name} ({d.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0F2537] dark:text-slate-300 mb-1 uppercase tracking-wide">
                Default Redressal Severity Level
              </label>
              <select
                value={defaultPriority}
                onChange={(e) => setDefaultPriority(e.target.value as PriorityLevel)}
                className="w-full p-2.5 rounded-none border border-[#CBD5E1] dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#1B365D]"
              >
                <option value="LOW">LOW (Non-urgent civic inquiry)</option>
                <option value="MEDIUM">MEDIUM (Standard 7-14 day municipal timeline)</option>
                <option value="HIGH">HIGH (Urgent public hazard / service stoppage)</option>
                <option value="CRITICAL">CRITICAL (Emergency life-safety risk)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0F2537] dark:text-slate-300 mb-1 uppercase tracking-wide">
                Guidance Description for Citizens
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Explain what types of civic defects belong under this category to prevent misfiling..."
                className="w-full p-2.5 rounded-none border border-[#CBD5E1] dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#1B365D]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-[#CBD5E1] dark:border-slate-800">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" isLoading={isSaving} className="bg-[#1B365D] hover:bg-[#0F2537]">
                Save Category Record
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
