import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { User, Mail, Phone, Calendar, ShieldCheck, Check } from 'lucide-react';
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
        setSuccessMsg('Profile updated successfully!');
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

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Account Profile
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Manage your personal details and account settings
        </p>
      </div>

      {successMsg && <Alert type="success">{successMsg}</Alert>}
      {errorMsg && <Alert type="error">{errorMsg}</Alert>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* User Card */}
        <Card className="md:col-span-1">
          <CardContent className="pt-6 text-center space-y-4">
            <div className="mx-auto w-20 h-20 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {user?.name}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">{user?.email}</p>
            </div>

            <div className="pt-2">
              <Badge role={role || 'CITIZEN'} size="md" />
            </div>

            {user?.department && (
              <div className="text-xs bg-slate-50 dark:bg-slate-800/80 p-2.5 rounded-xl text-slate-600 dark:text-slate-300">
                <span className="font-semibold block text-[10px] uppercase text-slate-400">
                  Assigned Department
                </span>
                {(user.department as any).name || user.department}
              </div>
            )}

            <div className="border-t border-slate-100 dark:border-slate-800 pt-4 text-xs text-slate-400 space-y-2 text-left">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Account Status: Active</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>
                  Member since:{' '}
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '2026'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Edit Form */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="Full Name"
                type="text"
                leftIcon={<User className="w-4 h-4" />}
                error={errors.name?.message}
                {...register('name')}
              />

              <Input
                label="Email Address (read-only)"
                type="email"
                value={user?.email || ''}
                disabled
                leftIcon={<Mail className="w-4 h-4" />}
                helperText="Email cannot be changed after registration."
              />

              <Input
                label="Phone Number"
                type="tel"
                leftIcon={<Phone className="w-4 h-4" />}
                error={errors.phone?.message}
                {...register('phone')}
              />

              <div className="pt-4 flex justify-end">
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={isSaving}
                  leftIcon={<Check className="w-4 h-4" />}
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
