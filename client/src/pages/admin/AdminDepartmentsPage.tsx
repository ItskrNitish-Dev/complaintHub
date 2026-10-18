import React, { useEffect, useState } from 'react';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Building2, 
  CheckCircle2, 
  XCircle, 
  Search,
  ShieldCheck,
  Landmark,
  Layers
} from 'lucide-react';
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
  const [searchTerm, setSearchTerm] = useState('');
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
      setErrorMsg('Department Name and Division Code are required.');
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
    if (!window.confirm(`Are you sure you want to permanently delete department "${d.name}"?`)) return;
    try {
      await departmentsApi.deleteDepartment(d._id);
      toast.success(`Department "${d.name}" deleted.`);
      setSuccessMsg(`Department "${d.name}" deleted.`);
      fetchDepartments();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete department');
    }
  };

  const filteredDepts = departments.filter((d) => {
    const term = searchTerm.toLowerCase();
    return (
      d.name.toLowerCase().includes(term) ||
      d.code.toLowerCase().includes(term) ||
      (d.description && d.description.toLowerCase().includes(term))
    );
  });

  const activeCount = departments.filter((d) => d.isActive).length;

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
              Municipal Administration • Operational Divisions
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-[#0F2537] dark:text-white">
              Municipal Departments & Division Directory
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              Maintain statutory municipal authorities, official division letter codes, and assigned civic grievance areas.
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
            Add New Department
          </Button>
        </div>
      </div>

      {successMsg && (
        <Alert type="success" onClose={() => setSuccessMsg(null)}>
          {successMsg}
        </Alert>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <div className="bg-white dark:bg-[#131E2D] p-3.5 rounded-none border border-[#CBD5E1] dark:border-slate-800 border-t-2 border-t-[#1B365D] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Established Divisions</span>
            <Building2 className="w-4 h-4 text-[#1B365D]" />
          </div>
          <p className="text-2xl font-bold text-[#0F2537] dark:text-white mt-1">{departments.length}</p>
          <span className="text-[10px] text-slate-400">Total operational departments</span>
        </div>

        <div className="bg-white dark:bg-[#131E2D] p-3.5 rounded-none border border-[#CBD5E1] dark:border-slate-800 border-t-2 border-t-emerald-600 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Active Authorities</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400 mt-1">{activeCount}</p>
          <span className="text-[10px] text-slate-400">Receiving citizen complaints</span>
        </div>

        <div className="bg-white dark:bg-[#131E2D] p-3.5 rounded-none border border-[#CBD5E1] dark:border-slate-800 border-t-2 border-t-[#C59B27] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Division Codes</span>
            <Landmark className="w-4 h-4 text-[#C59B27]" />
          </div>
          <p className="text-2xl font-bold text-[#B0881E] dark:text-[#C59B27] mt-1">{departments.length}</p>
          <span className="text-[10px] text-slate-400">Unique alphanumeric codes</span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white dark:bg-[#131E2D] p-3.5 border border-[#CBD5E1] dark:border-slate-800">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search departments by name, division code (e.g. RDS, WTR), or keyword..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-none border border-[#CBD5E1] dark:border-slate-700 bg-[#F8FAFC] dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#1B365D]"
          />
        </div>
      </div>

      {/* Official Table */}
      <Card className="rounded-none border-[#CBD5E1] dark:border-slate-800 overflow-hidden shadow-xs">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-12 text-center text-xs text-slate-500">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-[#1B365D] border-t-transparent mb-2" />
              <p>Fetching municipal division records...</p>
            </div>
          ) : filteredDepts.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500">
              <Building2 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="font-semibold text-slate-700 dark:text-slate-300">No departments match your search</p>
              <p className="text-[11px] text-slate-400 mt-1">Try modifying your query or add a new department.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-[#0F2537] text-white border-b-2 border-[#C59B27] text-[10px] font-bold uppercase tracking-wider">
                  <tr>
                    <th className="px-5 py-3">Department Designation</th>
                    <th className="px-5 py-3">Division Code</th>
                    <th className="px-5 py-3">Jurisdiction & Scope</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3 text-right">Administrative Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#CBD5E1]/60 dark:divide-slate-800 bg-white dark:bg-[#131E2D]">
                  {filteredDepts.map((d) => (
                    <tr key={d._id} className="hover:bg-[#EEF2F6]/50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-none bg-[#1B365D]/10 dark:bg-blue-950 text-[#1B365D] dark:text-blue-300 font-bold text-xs flex items-center justify-center border border-[#1B365D]/20">
                            <Building2 className="w-3.5 h-3.5 text-[#C59B27]" />
                          </div>
                          <div>
                            <p className="font-bold text-[#0F2537] dark:text-white text-sm">{d.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="font-mono font-bold text-xs px-2 py-0.5 bg-blue-50 dark:bg-blue-950/60 text-[#1B365D] dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                          {d.code}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 max-w-md text-slate-600 dark:text-slate-400 text-[11px]">
                        {d.description || <span className="text-slate-400 italic">No formal description recorded</span>}
                      </td>
                      <td className="px-5 py-3.5">
                        <button
                          type="button"
                          onClick={() => handleToggleActive(d)}
                          title="Click to toggle department operational status"
                          className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border cursor-pointer ${
                            d.isActive
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300'
                              : 'bg-slate-100 text-slate-600 border-slate-300 dark:bg-slate-800 dark:text-slate-400'
                          }`}
                        >
                          {d.isActive ? (
                            <>
                              <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                              Operational
                            </>
                          ) : (
                            <>
                              <XCircle className="w-2.5 h-2.5 text-slate-400" />
                              Deactivated
                            </>
                          )}
                        </button>
                      </td>
                      <td className="px-5 py-3.5 text-right space-x-1.5 whitespace-nowrap">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenEditModal(d)}
                          className="text-[11px] py-1 px-2 border-[#1B365D] text-[#1B365D] hover:bg-[#1B365D] hover:text-white"
                          leftIcon={<Edit2 className="w-3 h-3" />}
                        >
                          Edit
                        </Button>
                        <button
                          type="button"
                          onClick={() => handleDelete(d)}
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

      {/* Create / Edit Department Modal */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingDept ? `Modify Municipal Department: ${editingDept.name}` : 'Register New Municipal Department'}
          description="Departments manage field response teams and handle assigned civic categories."
        >
          <div className="border-t-2 border-[#C59B27] pt-3 -mt-2 mb-4">
            <p className="text-[11px] text-slate-500">
              Department code must be unique and is used as an official administrative reference prefix.
            </p>
          </div>

          {errorMsg && <Alert type="error" className="mb-4">{errorMsg}</Alert>}

          <form onSubmit={handleSaveDepartment} className="space-y-4 text-xs text-left">
            <div>
              <label className="block text-xs font-bold text-[#0F2537] dark:text-slate-300 mb-1 uppercase tracking-wide">
                Department Designation *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Roads & Bridges Infrastructure Division"
                className="w-full p-2.5 rounded-none border border-[#CBD5E1] dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#1B365D]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0F2537] dark:text-slate-300 mb-1 uppercase tracking-wide">
                Division Identifier Code (Alphanumeric, Uppercase) *
              </label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="e.g. RDS, WTR, ELEC, SAN"
                className="w-full p-2.5 rounded-none border border-[#CBD5E1] dark:border-slate-700 bg-white dark:bg-slate-900 uppercase font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#1B365D]"
              />
              <p className="text-[10px] text-slate-400 mt-1">Short identifier used on case dossiers and officer badges.</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0F2537] dark:text-slate-300 mb-1 uppercase tracking-wide">
                Department Jurisdiction & Administrative Scope
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detail the operational mandate and public services handled by this department..."
                className="w-full p-2.5 rounded-none border border-[#CBD5E1] dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#1B365D]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-[#CBD5E1] dark:border-slate-800">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" isLoading={isSaving} className="bg-[#1B365D] hover:bg-[#0F2537]">
                Save Department Record
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
