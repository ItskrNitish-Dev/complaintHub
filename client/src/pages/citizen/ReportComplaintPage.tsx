import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  FileText,
  MapPin,
  Camera,
  CheckCircle2,
  Navigation,
  Upload,
  X,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
} from 'lucide-react';
import { categoriesApi } from '../../api/categories.api';
import { complaintsApi } from '../../api/complaints.api';
import { Category, PriorityLevel } from '../../types';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Alert } from '../../components/ui/Alert';
import { useToast } from '../../context/ToastContext';
import { BackButton } from '../../components/ui/BackButton';

const reportSchema = z.object({
  title: z
    .string()
    .min(5, 'Title must be at least 5 characters')
    .max(150, 'Title cannot exceed 150 characters'),
  description: z
    .string()
    .min(10, 'Please provide a detailed description (at least 10 characters)'),
  category: z.string().min(1, 'Please select a complaint category'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  address: z.string().min(3, 'Please provide a street address or location name'),
  landmark: z.string().optional(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

type ReportFormData = z.infer<typeof reportSchema>;

export const ReportComplaintPage: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const [step, setStep] = useState<number>(1);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isLocating, setIsLocating] = useState(false);
  const [locationSuccess, setLocationSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    formState: { errors },
  } = useForm<ReportFormData>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      title: '',
      description: '',
      category: '',
      priority: 'MEDIUM',
      address: '',
      landmark: '',
      latitude: 40.748817,
      longitude: -73.985131,
    },
  });

  const formValues = watch();

  useEffect(() => {
    categoriesApi.getCategories({ activeOnly: true }).then((res) => {
      if (res.success && res.data) {
        setCategories(res.data);
        if (res.data.length > 0) {
          setValue('category', res.data[0]._id);
        }
      }
    });
  }, [setValue]);

  // GPS Auto-detect
  const handleDetectLocation = () => {
    if ('geolocation' in navigator) {
      setIsLocating(true);
      setLocationSuccess(false);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setValue('latitude', parseFloat(pos.coords.latitude.toFixed(6)));
          setValue('longitude', parseFloat(pos.coords.longitude.toFixed(6)));
          setIsLocating(false);
          setLocationSuccess(true);
          toast.success('Location detected successfully');
        },
        (err) => {
          setIsLocating(false);
          toast.error('Failed to detect GPS location: ' + err.message);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      toast.error('Geolocation is not supported by your browser.');
    }
  };

  // Image Selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      const combined = [...selectedFiles, ...filesArray].slice(0, 5); // Limit 5 files
      setSelectedFiles(combined);

      const urls = combined.map((f) => URL.createObjectURL(f));
      setPreviewUrls(urls);
    }
  };

  const removeFile = (index: number) => {
    const updatedFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(updatedFiles);
    const updatedUrls = previewUrls.filter((_, i) => i !== index);
    setPreviewUrls(updatedUrls);
  };

  // Step Validation before progressing
  const handleNextStep = async () => {
    let isValid = false;
    if (step === 1) {
      isValid = await trigger(['title', 'description', 'category', 'priority']);
    } else if (step === 2) {
      isValid = await trigger(['address', 'latitude', 'longitude']);
    } else {
      isValid = true;
    }

    if (isValid) {
      setStep((prev) => Math.min(4, prev + 1));
    }
  };

  const handlePrevStep = () => {
    setStep((prev) => Math.max(1, prev - 1));
  };

  // Submit Complaint
  const onSubmit = async (data: ReportFormData) => {
    try {
      setIsSubmitting(true);
      setSubmitError(null);

      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('description', data.description);
      formData.append('category', data.category);
      formData.append('priority', data.priority);
      formData.append('address', data.address);
      if (data.landmark) formData.append('landmark', data.landmark);
      formData.append('latitude', String(data.latitude));
      formData.append('longitude', String(data.longitude));

      selectedFiles.forEach((file) => {
        formData.append('images', file);
      });

      const res = await complaintsApi.createComplaint(formData);
      if (res.success && res.data) {
        navigate(`/complaints/${res.data._id}`);
      }
    } catch (err: any) {
      setSubmitError(
        err.response?.data?.message || 'Failed to submit complaint. Please check your data.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedCategoryObj = categories.find((c) => c._id === formValues.category);

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-16 text-left">
      <div>
        <BackButton fallbackUrl="/dashboard" />
      </div>

      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Report a Civic Issue
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Provide accurate details and photos to help municipal authorities dispatch crews quickly
        </p>
      </div>

      {/* Stepper Progress Bar */}
      <div className="grid grid-cols-4 gap-2 text-center">
        {[
          { num: 1, label: 'Issue Details', icon: FileText },
          { num: 2, label: 'Location', icon: MapPin },
          { num: 3, label: 'Evidence', icon: Camera },
          { num: 4, label: 'Review', icon: CheckCircle2 },
        ].map((s) => {
          const Icon = s.icon;
          const isCurrent = step === s.num;
          const isDone = step > s.num;
          return (
            <div
              key={s.num}
              onClick={() => {
                if (isDone) setStep(s.num);
              }}
              className={`p-3 rounded-2xl border transition-all ${
                isDone ? 'cursor-pointer hover:border-blue-400' : ''
              } ${
                isCurrent
                  ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-bold'
                  : isDone
                  ? 'border-emerald-200 bg-emerald-50/30 text-emerald-700 dark:border-emerald-900 dark:text-emerald-400'
                  : 'border-slate-200 dark:border-slate-800 text-slate-400'
              }`}
            >
              <Icon className="w-4 h-4 mx-auto mb-1" />
              <span className="text-[11px] block truncate">{s.label}</span>
            </div>
          );
        })}
      </div>

      {submitError && <Alert type="error">{submitError}</Alert>}

      {/* Step Content */}
      <Card>
        <CardContent className="p-6 sm:p-8">
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Step 1: Issue Details */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Step 1: Issue Information
                  </h3>
                  <p className="text-xs text-slate-500">Describe the problem and specify its urgency.</p>
                </div>

                <Input
                  label="Complaint Title"
                  placeholder="e.g. Hazardous deep pothole on Elm St"
                  error={errors.title?.message}
                  {...register('title')}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Category */}
                  <div className="space-y-1.5 text-left">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                      Category <span className="text-rose-500">*</span>
                    </label>
                    <select
                      className="block w-full py-2.5 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      {...register('category')}
                    >
                      {categories.map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                    {errors.category && (
                      <p className="text-xs text-rose-500 font-medium">
                        {errors.category.message}
                      </p>
                    )}
                  </div>

                  {/* Priority */}
                  <div className="space-y-1.5 text-left">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                      Priority Level
                    </label>
                    <select
                      className="block w-full py-2.5 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      {...register('priority')}
                    >
                      <option value="LOW">Low (Cosmetic / minor)</option>
                      <option value="MEDIUM">Medium (General inconvenience)</option>
                      <option value="HIGH">High (Active disruption / hazard)</option>
                      <option value="CRITICAL">Critical (Immediate safety threat)</option>
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1.5 text-left">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                    Detailed Description <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Provide specific details about size, how long it has been present, and any immediate risks to residents..."
                    className="block w-full p-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    {...register('description')}
                  />
                  {errors.description && (
                    <p className="text-xs text-rose-500 font-medium">
                      {errors.description.message}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Step 2: Location */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Step 2: Location Details
                  </h3>
                  <p className="text-xs text-slate-500">Provide exact street and geographical coordinates.</p>
                </div>

                <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="text-xs text-blue-900 dark:text-blue-300 text-left">
                    <p className="font-bold">Auto-Detect GPS Location</p>
                    <p className="text-blue-700 dark:text-blue-400">
                      Use your current device position for high geographical accuracy.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    isLoading={isLocating}
                    onClick={handleDetectLocation}
                    leftIcon={<Navigation className="w-4 h-4" />}
                  >
                    {locationSuccess ? 'Location Detected ✓' : 'Detect GPS'}
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Latitude"
                    type="number"
                    step="any"
                    error={errors.latitude?.message}
                    {...register('latitude', { valueAsNumber: true })}
                  />
                  <Input
                    label="Longitude"
                    type="number"
                    step="any"
                    error={errors.longitude?.message}
                    {...register('longitude', { valueAsNumber: true })}
                  />
                </div>

                <Input
                  label="Street Address / Road Name"
                  placeholder="e.g. 742 Evergreen Terrace"
                  error={errors.address?.message}
                  {...register('address')}
                />

                <Input
                  label="Nearby Landmark (Optional)"
                  placeholder="e.g. Opposite Central Metro Station Gate 2"
                  error={errors.landmark?.message}
                  {...register('landmark')}
                />
              </div>
            )}

            {/* Step 3: Evidence */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Step 3: Photographic Evidence
                  </h3>
                  <p className="text-xs text-slate-500">Upload photos of the problem (up to 5 images, max 5MB each).</p>
                </div>

                <label className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-blue-500 transition-colors">
                  <Upload className="w-8 h-8 text-slate-400 mb-2" />
                  <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    Click to select images from your device
                  </span>
                  <span className="text-xs text-slate-400 mt-1">
                    Supports JPEG, PNG, WebP
                  </span>
                  <input
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>

                {previewUrls.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                      Selected Photos ({previewUrls.length} / 5):
                    </p>
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                      {previewUrls.map((url, idx) => (
                        <div key={idx} className="relative aspect-square rounded-xl overflow-hidden group">
                          <img src={url} alt="Evidence preview" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removeFile(idx)}
                            className="absolute top-1 right-1 p-1 rounded-full bg-slate-900/80 text-white hover:bg-rose-600 transition-colors"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 4: Review & Submit */}
            {step === 4 && (
              <div className="space-y-6">
                <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Step 4: Review Your Report
                  </h3>
                  <p className="text-xs text-slate-500">Ensure all information is accurate before submitting.</p>
                </div>

                <div className="space-y-4 text-xs bg-slate-50 dark:bg-slate-850 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-left">
                  <div>
                    <span className="text-slate-400 font-semibold block uppercase text-[10px]">Title</span>
                    <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">{formValues.title}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-slate-400 font-semibold block uppercase text-[10px]">Category</span>
                      <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{selectedCategoryObj?.name}</p>
                    </div>
                    <div>
                      <span className="text-slate-400 font-semibold block uppercase text-[10px]">Priority</span>
                      <div className="mt-0.5"><Badge priority={formValues.priority} size="sm" /></div>
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-400 font-semibold block uppercase text-[10px]">Description</span>
                    <p className="text-slate-700 dark:text-slate-300 mt-0.5 leading-relaxed">{formValues.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-slate-400 font-semibold block uppercase text-[10px]">Address</span>
                      <p className="font-medium text-slate-800 dark:text-slate-200 mt-0.5">{formValues.address}</p>
                    </div>
                    <div>
                      <span className="text-slate-400 font-semibold block uppercase text-[10px]">Coordinates</span>
                      <p className="font-mono text-slate-600 dark:text-slate-400 mt-0.5">{formValues.latitude}, {formValues.longitude}</p>
                    </div>
                  </div>

                  {previewUrls.length > 0 && (
                    <div>
                      <span className="text-slate-400 font-semibold block uppercase text-[10px] mb-1">Attached Images</span>
                      <div className="flex gap-2">
                        {previewUrls.map((url, i) => (
                          <img key={i} src={url} alt="" className="w-12 h-12 object-cover rounded-lg border" />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Stepper Navigation Buttons */}
            <div className="flex items-center justify-between pt-8 border-t border-slate-100 dark:border-slate-800 mt-6">
              {step > 1 ? (
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={handlePrevStep}
                  leftIcon={<ArrowLeft className="w-4 h-4" />}
                >
                  Previous
                </Button>
              ) : <div />}

              {step < 4 ? (
                <Button
                  type="button"
                  variant="primary"
                  size="md"
                  onClick={handleNextStep}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Next Step
                </Button>
              ) : (
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  isLoading={isSubmitting}
                  leftIcon={<CheckCircle2 className="w-4 h-4" />}
                >
                  Submit Complaint
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
