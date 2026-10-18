import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Landmark, Mail, Lock, User, Phone, UserPlus } from 'lucide-react';
import { useAuth } from '../../features/auth/AuthContext';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';
import { BackButton } from '../../components/ui/BackButton';

const registerSchema = z
  .object({
    name: z.string().min(2, 'Full name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email address'),
    phone: z.string().optional(),
    password: z.string().min(6, 'Password must be at least 6 characters long'),
    confirmPassword: z.string().min(6, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export const RegisterPage: React.FC = () => {
  const { register: registerAuth } = useAuth();
  const navigate = useNavigate();

  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setLoading(true);
      setServerError(null);
      await registerAuth({
        name: data.name,
        email: data.email,
        password: data.password,
        phone: data.phone,
      });
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      setServerError(
        err.response?.data?.message || 'Registration failed. Please check your information.'
      );
    } finally {
      setLoading(false);
    }
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
            Citizen Registration
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Create an official civic account to lodge complaints and track real-time resolution
          </p>
        </div>

        {serverError && <Alert type="error">{serverError}</Alert>}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Full Legal Name"
            type="text"
            placeholder="e.g. Ramesh Kumar"
            leftIcon={<User className="w-4 h-4" />}
            error={errors.name?.message}
            {...register('name')}
          />

          <Input
            label="Email Address"
            type="email"
            placeholder="citizen@example.com"
            leftIcon={<Mail className="w-4 h-4" />}
            error={errors.email?.message}
            {...register('email')}
          />

          <Input
            label="Mobile Contact (Optional)"
            type="tel"
            placeholder="+91 98765 43210"
            leftIcon={<Phone className="w-4 h-4" />}
            error={errors.phone?.message}
            {...register('phone')}
          />

          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            leftIcon={<Lock className="w-4 h-4" />}
            error={errors.password?.message}
            {...register('password')}
          />

          <Input
            label="Confirm Password"
            type="password"
            placeholder="••••••••"
            leftIcon={<Lock className="w-4 h-4" />}
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />

          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={loading}
            leftIcon={<UserPlus className="w-4 h-4 text-[#C59B27]" />}
            className="w-full mt-2 font-bold uppercase tracking-wider text-xs"
          >
            Register Citizen Profile
          </Button>
        </form>

        <div className="text-center pt-2 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800">
          Already possess a registered account?{' '}
          <Link
            to="/login"
            className="font-bold text-[#1B365D] hover:underline dark:text-blue-400"
          >
            Sign In to Portal
          </Link>
        </div>
      </div>
    </div>
  );
};
