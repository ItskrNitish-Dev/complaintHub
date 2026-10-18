import React from 'react';
import { useAuth } from '../../features/auth/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { ShieldCheck, Building2, Mail, Phone, Calendar, Landmark } from 'lucide-react';
import { BackButton } from '../../components/ui/BackButton';

export const OfficerProfilePage: React.FC = () => {
  const { user, role } = useAuth();

  return (
    <div className="space-y-6 text-left">
      <div>
        <BackButton fallbackUrl="/officer/dashboard" />
      </div>

      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-[#0F2537] text-[#C59B27] text-[10px] font-bold uppercase tracking-wider mb-1.5">
          <Landmark className="w-3 h-3" />
          Municipal Field Credentials
        </div>
        <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#0F2537] dark:text-white">
          Officer Service Dossier
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Designated officer jurisdiction, municipal division, and verified identity
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1 text-center border-t-4 border-t-[#C59B27]">
          <CardContent className="pt-6 space-y-4">
            <div className="w-20 h-20 rounded-xl bg-[#0F2537] border-2 border-[#C59B27] text-[#C59B27] font-bold text-2xl flex items-center justify-center mx-auto shadow-xs">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'O'}
            </div>
            <div>
              <h3 className="font-bold text-base text-[#0F2537] dark:text-white uppercase tracking-tight">{user?.name}</h3>
              <p className="text-xs text-slate-500 font-mono">{user?.email}</p>
            </div>
            <div>
              <Badge role={role || 'OFFICER'} size="md" />
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-[#0F2537] dark:text-white">
              Official Division Allocation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-xs p-6">
            <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center gap-3">
              <Building2 className="w-5 h-5 text-[#1B365D] dark:text-blue-400 shrink-0" />
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Assigned Department</p>
                <p className="font-bold text-sm text-[#0F2537] dark:text-white mt-0.5">
                  {(user?.department as any)?.name || 'Department of Public Works'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <span className="text-slate-400 font-bold block uppercase text-[10px]">Official Contact</span>
                <p className="font-medium text-slate-700 dark:text-slate-300 mt-0.5">{user?.phone || '+91 98765 00000'}</p>
              </div>
              <div>
                <span className="text-slate-400 font-bold block uppercase text-[10px]">Jurisdiction Status</span>
                <p className="font-semibold text-[#059669] mt-0.5 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Active Municipal Field Dispatch
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
