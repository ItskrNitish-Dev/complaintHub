import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Landmark, Mail, Lock, LogIn, KeyRound, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../features/auth/AuthContext';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';
import { BackButton } from '../../components/ui/BackButton';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid official/personal email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const from = (location.state as any)?.from?.pathname || null;

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setLoading(true);
      setServerError(null);
      const user = await login(data);

      if (from) {
        navigate(from, { replace: true });
      } else if (user.role === 'ADMIN') {
        navigate('/admin/dashboard', { replace: true });
      } else if (user.role === 'OFFICER') {
        navigate('/officer/dashboard', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (err: any) {
      setServerError(
        err.response?.data?.message || 'Invalid email or password. Please verify your credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (email: string) => {
    setValue('email', email);
    setValue('password', 'Password@123');
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-7 bg-white dark:bg-[#131E2D] p-8 sm:p-10 rounded-xl border border-slate-200 dark:border-slate-800 shadow-md border-t-4 border-t-[#C59B27]">
        <div className="flex justify-start">
          <BackButton fallbackUrl="/" />
        </div>

        {/* Official Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 rounded-lg bg-[#0F2537] border border-[#C59B27] flex items-center justify-center text-[#C59B27] shadow-xs">
            <Landmark className="w-6 h-6" />
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#0F2537] dark:text-white">
            Civic Portal Sign In
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Secure authentication for citizens, municipal officers & administrators
          </p>
        </div>

        {/* Official Credentials Quick-Fill Bar */}
        <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#0F2537] dark:text-slate-300 uppercase tracking-wider text-[10px]">
            <KeyRound className="w-3.5 h-3.5 text-[#C59B27]" />
            <span>Preset Portal Accounts:</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => fillDemo('admin@complainthub.local')}
              className="px-2 py-1.5 text-[11px] font-bold rounded bg-[#0F2537] text-[#C59B27] border border-[#C59B27]/40 hover:bg-[#142C42] transition-colors cursor-pointer"
            >
              Admin
            </button>
            <button
              type="button"
              onClick={() => fillDemo('officer.road@complainthub.local')}
              className="px-2 py-1.5 text-[11px] font-bold rounded bg-[#1B365D] text-white hover:bg-[#0F2537] transition-colors cursor-pointer"
            >
              Officer
            </button>
            <button
              type="button"
              onClick={() => fillDemo('citizen.john@complainthub.local')}
              className="px-2 py-1.5 text-[11px] font-bold rounded bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200 hover:bg-slate-300 transition-colors cursor-pointer"
            >
              Citizen
            </button>
          </div>
        </div>

        {serverError && <Alert type="error">{serverError}</Alert>}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Email Address / User ID"
            type="email"
            placeholder="citizen@example.com"
            leftIcon={<Mail className="w-4 h-4" />}
            error={errors.email?.message}
            {...register('email')}
          />

          <Input
            label="Account Password"
            type="password"
            placeholder="••••••••"
            leftIcon={<Lock className="w-4 h-4" />}
            error={errors.password?.message}
            {...register('password')}
          />

          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={loading}
            leftIcon={<LogIn className="w-4 h-4 text-[#C59B27]" />}
            className="w-full mt-2 font-bold uppercase tracking-wider text-xs"
          >
            Authenticate & Proceed
          </Button>
        </form>

        {/* Footer */}
        <div className="text-center pt-2 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800">
          Not yet registered as a citizen?{' '}
          <Link
            to="/register"
            className="font-bold text-[#1B365D] hover:underline dark:text-blue-400"
          >
            Register Citizen Account
          </Link>
        </div>
      </div>
    </div>
  );
};
