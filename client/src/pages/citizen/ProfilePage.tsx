import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { User, Mail, Phone, Calendar, ShieldCheck, Check, Landmark } from 'lucide-react';
import { useAuth } from '../../features/auth/AuthContext';
import { usersApi } from '../../api/users.api';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Alert } from '../../components/ui/Alert';
import { BackButton } from '../../components/ui/BackButton';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export const ProfilePage: React.FC = () => {
  const { user, role, setUser } = useAuth();
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      phone: user?.phone || '',
    },
  });

  const onSubmit = async (data: ProfileFormData) => {
    try {
      setIsSaving(true);
      setSuccessMsg(null);
      setErrorMsg(null);

      const res = await usersApi.updateMyProfile(data);
      if (res.success && res.data.user) {
        setUser(res.data.user);
        localStorage.setItem('ch_user', JSON.stringify(res.data.user));
        setSuccessMsg('Official profile updated successfully!');
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 text-left">
      <div>
        <BackButton fallbackUrl="/dashboard" />
      </div>

      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-[#0F2537] text-[#C59B27] text-[10px] font-bold uppercase tracking-wider mb-1.5">
          <Landmark className="w-3 h-3" />
          Official Citizen Profile
        </div>
        <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#0F2537] dark:text-white">
          Account Profile & Contact Information
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Maintain your authenticated credentials for municipal notifications and redressal tracking
        </p>
      </div>

      {successMsg && <Alert type="success">{successMsg}</Alert>}
      {errorMsg && <Alert type="error">{errorMsg}</Alert>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* User Card */}
        <Card className="md:col-span-1 border-t-4 border-t-[#C59B27]">
          <CardContent className="pt-6 text-center space-y-4">
            <div className="mx-auto w-20 h-20 rounded-xl bg-[#0F2537] border-2 border-[#C59B27] text-[#C59B27] font-bold text-2xl flex items-center justify-center shadow-xs">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>

            <div>
              <h3 className="text-base font-bold text-[#0F2537] dark:text-white uppercase tracking-tight">
                {user?.name}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">{user?.email}</p>
            </div>

            <div className="pt-1">
              <Badge role={role || 'CITIZEN'} size="md" />
            </div>

            {user?.department && (
              <div className="text-xs bg-slate-50 dark:bg-slate-800/80 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                <span className="font-bold block text-[10px] uppercase text-slate-400">
                  Assigned Municipal Wing
                </span>
                {(user.department as any).name || user.department}
              </div>
            )}

            <div className="border-t border-slate-100 dark:border-slate-800 pt-4 text-xs text-slate-500 space-y-2 text-left">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#059669]" />
                <span>Verification: Registered Citizen</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>
                  Portal Joined:{' '}
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '2026'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Edit Form */}
        <Card className="md:col-span-2">
          <CardHeader className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-[#0F2537] dark:text-white">
              Official Identity Details
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="Full Registered Name"
                type="text"
                leftIcon={<User className="w-4 h-4 text-slate-400" />}
                error={errors.name?.message}
                {...register('name')}
              />

              <Input
                label="Registered Email (Official System ID)"
                type="email"
                value={user?.email || ''}
                disabled
                leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
                helperText="Primary email cannot be modified post-registration."
              />

              <Input
                label="Mobile Phone Number"
                type="tel"
                leftIcon={<Phone className="w-4 h-4 text-slate-400" />}
                error={errors.phone?.message}
                {...register('phone')}
              />

              <div className="pt-3 flex justify-end">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  isLoading={isSaving}
                  leftIcon={<Check className="w-4 h-4 text-[#C59B27]" />}
                >
                  Save Profile Changes
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
