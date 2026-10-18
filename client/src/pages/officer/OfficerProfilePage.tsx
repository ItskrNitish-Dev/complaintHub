import React from 'react';
import { useAuth } from '../../features/auth/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { ShieldCheck, Building, Mail, Phone, Calendar } from 'lucide-react';
import { BackButton } from '../../components/ui/BackButton';

export const OfficerProfilePage: React.FC = () => {
  const { user, role } = useAuth();

  return (
    <div className="space-y-6 text-left">
      <div>
        <BackButton fallbackUrl="/officer/dashboard" />
      </div>

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Officer Credentials & Division
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Municipal officer credentials and active field department assignment
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1 text-center">
          <CardContent className="pt-6 space-y-4">
            <div className="w-20 h-20 rounded-2xl bg-blue-600 text-white font-bold text-2xl flex items-center justify-center mx-auto shadow-md">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'O'}
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">{user?.name}</h3>
              <p className="text-xs text-slate-500">{user?.email}</p>
            </div>
            <div>
              <Badge role={role || 'OFFICER'} size="md" />
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Division Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 flex items-center gap-3">
              <Building className="w-5 h-5 text-blue-600 shrink-0" />
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Assigned Department</p>
                <p className="font-bold text-sm text-slate-900 dark:text-white mt-0.5">
                  {(user?.department as any)?.name || 'Department of Public Works'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <span className="text-slate-400 font-semibold block uppercase text-[10px]">Contact Phone</span>
                <p className="font-medium text-slate-700 dark:text-slate-300 mt-0.5">{user?.phone || '+1 555-0200'}</p>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block uppercase text-[10px]">Jurisdiction Status</span>
                <p className="font-medium text-emerald-600 mt-0.5 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Active Field Dispatch
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
