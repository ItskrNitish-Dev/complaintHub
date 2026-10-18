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
  Landmark,
  ShieldCheck,
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
        toast.success('Grievance registered successfully');
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

      {/* Official Government Form Title */}
      <div className="bg-white dark:bg-[#131E2D] p-5 sm:p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs border-t-4 border-t-[#C59B27] space-y-2">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-[#0F2537] text-[#C59B27] text-[10px] font-bold uppercase tracking-wider">
          <Landmark className="w-3.5 h-3.5" />
          Official Citizen Redressal Portal
        </div>
        <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#0F2537] dark:text-white">
          Lodge Civic Grievance
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Provide accurate municipal details and geotagged photographic evidence for official division dispatch
        </p>
      </div>

      {/* Stepper Progress Bar */}
      <div className="grid grid-cols-4 gap-2 text-center">
        {[
          { num: 1, label: 'Grievance Info', icon: FileText },
          { num: 2, label: 'Ward Location', icon: MapPin },
          { num: 3, label: 'Photo Evidence', icon: Camera },
          { num: 4, label: 'Audit & Submit', icon: CheckCircle2 },
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
              className={`p-3 rounded-lg border transition-all ${
                isDone ? 'cursor-pointer hover:border-[#1B365D]' : ''
              } ${
                isCurrent
                  ? 'border-[#1B365D] bg-[#1B365D] text-white font-bold shadow-xs'
                  : isDone
                  ? 'border-emerald-300 bg-emerald-50 text-[#047857] dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                  : 'border-slate-200 dark:border-slate-800 text-slate-400 bg-white dark:bg-[#131E2D]'
              }`}
            >
              <Icon className="w-4 h-4 mx-auto mb-1" />
              <span className="text-[10px] font-semibold block truncate uppercase tracking-wider">{s.label}</span>
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
              <div className="space-y-5">
                <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-[#0F2537] dark:text-white">
                    Step 1: Grievance Information
                  </h3>
                  <p className="text-xs text-slate-500">Categorize the civic hazard and designate perceived urgency.</p>
                </div>

                <Input
                  label="Grievance Title / Short Subject"
                  placeholder="e.g. Hazardous deep pothole on MG Road crossing"
                  error={errors.title?.message}
                  {...register('title')}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Category */}
                  <div className="space-y-1.5 text-left">
                    <label className="block text-xs font-semibold text-[#0F2537] dark:text-slate-200 uppercase tracking-wider">
                      Department Category <span className="text-[#DC2626]">*</span>
                    </label>
                    <select
                      className="block w-full py-2 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#131E2D] text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#1B365D]"
                      {...register('category')}
                    >
                      {categories.map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                    {errors.category && (
                      <p className="text-xs text-[#DC2626] font-medium">
                        {errors.category.message}
                      </p>
                    )}
                  </div>

                  {/* Priority */}
                  <div className="space-y-1.5 text-left">
                    <label className="block text-xs font-semibold text-[#0F2537] dark:text-slate-200 uppercase tracking-wider">
                      Perceived Severity Level
                    </label>
                    <select
                      className="block w-full py-2 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#131E2D] text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#1B365D]"
                      {...register('priority')}
                    >
                      <option value="LOW">Low (Cosmetic / routine repair)</option>
                      <option value="MEDIUM">Medium (Public inconvenience)</option>
                      <option value="HIGH">High (Active disruption / structural risk)</option>
                      <option value="CRITICAL">Critical (Immediate safety threat / emergency)</option>
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1.5 text-left">
                  <label className="block text-xs font-semibold text-[#0F2537] dark:text-slate-200 uppercase tracking-wider">
                    Detailed Grievance Description <span className="text-[#DC2626]">*</span>
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Provide specific details about dimensions, duration of hazard, and any potential threat to motorists or pedestrians..."
                    className="block w-full p-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#131E2D] text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-[#1B365D]"
                    {...register('description')}
                  />
                  {errors.description && (
                    <p className="text-xs text-[#DC2626] font-medium">
                      {errors.description.message}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Step 2: Location */}
            {step === 2 && (
              <div className="space-y-5">
                <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-[#0F2537] dark:text-white">
                    Step 2: Geographic & Municipal Location
                  </h3>
                  <p className="text-xs text-slate-500">Provide exact street and geographical GPS coordinates for the dispatch team.</p>
                </div>

                <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="text-xs text-slate-700 dark:text-slate-300 text-left">
                    <p className="font-bold text-[#0F2537] dark:text-white">Auto-Detect GPS Geotag</p>
                    <p className="text-slate-500 text-[11px]">
                      Capture device coordinates to assist officers in locating the exact defect site.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    isLoading={isLocating}
                    onClick={handleDetectLocation}
                    leftIcon={<Navigation className="w-3.5 h-3.5 text-[#C59B27]" />}
                  >
                    {locationSuccess ? 'Geotagged ✓' : 'Detect GPS Coordinates'}
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
                  label="Street Address / Road Segment"
                  placeholder="e.g. Ward 12, Main Ring Road near Pillar 42"
                  error={errors.address?.message}
                  {...register('address')}
                />

                <Input
                  label="Prominent Civic Landmark (Optional)"
                  placeholder="e.g. Opposite Government Primary School Gate"
                  error={errors.landmark?.message}
                  {...register('landmark')}
                />
              </div>
            )}

            {/* Step 3: Evidence */}
            {step === 3 && (
              <div className="space-y-5">
                <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-[#0F2537] dark:text-white">
                    Step 3: Photographic Proof
                  </h3>
                  <p className="text-xs text-slate-500">Upload photos of the defect (up to 5 images, max 5MB each). Photographic proof speeds up municipal triage.</p>
                </div>

                <label className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-[#1B365D] transition-colors">
                  <Upload className="w-8 h-8 text-[#C59B27] mb-2" />
                  <span className="text-xs font-bold uppercase tracking-wider text-[#0F2537] dark:text-slate-200">
                    Click to select evidence files
                  </span>
                  <span className="text-[11px] text-slate-400 mt-1">
                    Accepts JPEG, PNG, WebP format
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
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Attached Proof Files ({previewUrls.length} / 5):
                    </p>
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                      {previewUrls.map((url, idx) => (
                        <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 group">
                          <img src={url} alt="Evidence preview" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removeFile(idx)}
                            className="absolute top-1 right-1 p-1 rounded-full bg-[#0F2537]/90 text-white hover:bg-rose-600 transition-colors cursor-pointer"
                          >
                            <X className="w-3 h-3" />
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
              <div className="space-y-5">
                <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-[#0F2537] dark:text-white">
                    Step 4: Formal Grievance Audit
                  </h3>
                  <p className="text-xs text-slate-500">Review all information prior to official registration into the municipal registry.</p>
                </div>

                <div className="space-y-3.5 text-xs bg-slate-50 dark:bg-slate-800/50 p-5 rounded-xl border border-slate-200 dark:border-slate-700 text-left">
                  <div>
                    <span className="text-slate-400 font-bold uppercase text-[10px]">Subject</span>
                    <p className="text-sm font-bold text-[#0F2537] dark:text-white mt-0.5">{formValues.title}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-slate-400 font-bold uppercase text-[10px]">Target Category</span>
                      <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{selectedCategoryObj?.name}</p>
                    </div>
                    <div>
                      <span className="text-slate-400 font-bold uppercase text-[10px]">Priority Severity</span>
                      <div className="mt-0.5"><Badge priority={formValues.priority} size="sm" /></div>
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-400 font-bold uppercase text-[10px]">Description</span>
                    <p className="text-slate-700 dark:text-slate-300 mt-0.5 leading-relaxed">{formValues.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-slate-400 font-bold uppercase text-[10px]">Address Location</span>
                      <p className="font-medium text-slate-800 dark:text-slate-200 mt-0.5">{formValues.address}</p>
                    </div>
                    <div>
                      <span className="text-slate-400 font-bold uppercase text-[10px]">Geotag Coordinates</span>
                      <p className="font-mono text-slate-600 dark:text-slate-400 mt-0.5">{formValues.latitude}, {formValues.longitude}</p>
                    </div>
                  </div>

                  {previewUrls.length > 0 && (
                    <div>
                      <span className="text-slate-400 font-bold uppercase text-[10px] mb-1 block">Attached Evidence ({previewUrls.length})</span>
                      <div className="flex gap-2">
                        {previewUrls.map((url, i) => (
                          <img key={i} src={url} alt="" className="w-12 h-12 object-cover rounded-md border border-slate-300" />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Stepper Navigation Buttons */}
            <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-slate-800 mt-6">
              {step > 1 ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handlePrevStep}
                  leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
                >
                  Previous Step
                </Button>
              ) : <div />}

              {step < 4 ? (
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={handleNextStep}
                  rightIcon={<ArrowRight className="w-3.5 h-3.5 text-[#C59B27]" />}
                >
                  Proceed to Next Step
                </Button>
              ) : (
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  isLoading={isSubmitting}
                  leftIcon={<CheckCircle2 className="w-4 h-4 text-[#C59B27]" />}
                >
                  Confirm & Lodge Grievance
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
