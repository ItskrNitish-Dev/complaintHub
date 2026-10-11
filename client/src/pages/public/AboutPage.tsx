import React from 'react';
import { ShieldAlert, Users, CheckCircle, ArrowRight, Building, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BackButton } from '../../components/ui/BackButton';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12 text-left">
      <div>
        <BackButton fallbackUrl="/" />
      </div>

      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          About ComplaintHub
        </h1>
        <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed">
          ComplaintHub is an open civic technology platform built to bridge the gap between residents and municipal authorities. We turn everyday community concerns into tracked, accountable civic action.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/50 text-blue-600 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-lg text-slate-900 dark:text-white">Citizen Centric</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Citizens can effortlessly report neighborhood hazards with photographic evidence, precise GPS locations, and track progress without administrative bureaucracy.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 flex items-center justify-center">
            <Building className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-lg text-slate-900 dark:text-white">Direct Department Routing</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Issues are directly triaged and dispatched to specialized municipal divisions including Roads, Water, Sanitation, Street Lighting, and Public Safety.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 flex items-center justify-center">
            <CheckCircle className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-lg text-slate-900 dark:text-white">Transparent Lifecycle</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Every step—from initial citizen submission to officer review, on-site progress, and resolution—is recorded in an immutable public audit timeline.
          </p>
        </div>
      </div>

      <div className="bg-slate-50 dark:bg-slate-900 p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 space-y-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          Frequently Asked Questions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
          <div className="space-y-1.5">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">
              Are all complaints publicly visible?
            </h4>
            <p>
              Yes. Community transparency encourages shared accountability. You can also upvote and follow issues submitted by neighbors.
            </p>
          </div>
          <div className="space-y-1.5">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">
              How do officers get assigned?
            </h4>
            <p>
              Department administrators review submitted reports, verify the location and severity, and assign an active field officer from the relevant municipal department.
            </p>
          </div>
          <div className="space-y-1.5">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">
              Can I track updates on a complaint?
            </h4>
            <p>
              Yes. Clicking "Follow" adds you to the complaint’s notification stream. Whenever the status updates or a comment is added, you will receive an in-app alert.
            </p>
          </div>
          <div className="space-y-1.5">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">
              What if my complaint is an emergency?
            </h4>
            <p>
              ComplaintHub is intended for municipal infrastructure and civic maintenance issues. For immediate life-threatening emergencies, please call local emergency services (911 / 112).
            </p>
          </div>
        </div>
      </div>

      <div className="text-center pt-4">
        <Link
          to="/complaints/new"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md"
        >
          Report an Issue Now <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};
