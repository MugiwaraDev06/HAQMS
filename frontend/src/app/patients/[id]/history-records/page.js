'use client';

import { useState, useEffect, use } from 'react';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/common/Navbar';
import { useRouter } from 'next/navigation';
import { 
  ChevronLeft, 
  Clipboard, 
  Activity, 
  CalendarDays, 
  User, 
  ShieldCheck,
  FileText,
  Clock
} from '@/components/common/Icons';
import Link from 'next/link';

export default function PatientHistoryRecords({ params }) {
  const { id } = use(params);
  const { token, API_BASE_URL, user } = useAuth();
  const router = useRouter();

  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!token) {
      router.push('/login');
      return;
    }

    const fetchPatientData = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/patients/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!res.ok) {
          throw new Error('Failed to fetch patient records');
        }
        
        const data = await res.json();
        if (data.success) {
          setPatient(data.data);
        } else {
          throw new Error(data.error || 'Failed to fetch patient records');
        }
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPatientData();
  }, [id, token, API_BASE_URL, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center">
          <div className="pulse-loader"><div></div><div></div></div>
          <p className="mt-4 text-slate-400 font-semibold">Retrieving secure clinical archives...</p>
        </main>
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 max-w-4xl w-full mx-auto p-8">
          <div className="glass p-12 text-center rounded-2xl border border-rose-500/20 bg-rose-500/5">
            <h2 className="text-2xl font-black text-rose-500">Access Error</h2>
            <p className="mt-4 text-slate-600 dark:text-slate-400">{error || 'Patient record not found.'}</p>
            <Link href="/dashboard" className="mt-8 inline-block text-teal-600 font-bold hover:underline">
              Return to Staff Dashboard
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 max-w-5xl w-full mx-auto p-6 sm:p-8">
        {/* Back Link */}
        <Link 
          href="/dashboard" 
          className="inline-flex items-center gap-2 text-slate-400 hover:text-teal-600 transition-colors mb-8 font-bold text-sm group"
        >
          <ChevronLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Back to Dashboard
        </Link>

        {/* Clinical Record Header */}
        <div className="glass p-8 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 mb-8 overflow-hidden relative">
          {/* Decorative Background Accent */}
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Clipboard className="h-40 w-40" />
          </div>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
            <div className="flex items-center gap-5">
              <div className="p-4 bg-teal-500/10 text-teal-600 dark:text-teal-400 rounded-2xl">
                <User className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-3xl font-black text-slate-800 dark:text-slate-100">
                  {patient.name}
                </h1>
                <div className="flex flex-wrap gap-4 mt-2">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-widest">
                    <Activity className="h-3.5 w-3.5" />
                    Patient ID: {patient.id.split('-')[0].toUpperCase()}
                  </span>
                  <span className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-widest">
                    <Calendar className="h-3.5 w-3.5" />
                    Age: {patient.age} / {patient.gender}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-end gap-2">
              <span className="px-3 py-1 bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20 rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5" />
                Verified Record
              </span>
              <span className="text-xxs font-bold text-slate-400 uppercase tracking-tight italic">
                Last Synchronized: {mounted ? new Date().toLocaleString() : 'Loading...'}
              </span>
            </div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Clinical History Content */}
          <div className="lg:col-span-2 space-y-8">
            <section className="glass p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-500">
                  <FileText className="h-5 w-5" />
                </div>
                <h3 className="text-xl font-extrabold text-slate-800 dark:text-slate-100">Patient Clinical Background</h3>
              </div>
              
              <div className="prose prose-slate dark:prose-invert max-w-none">
                <div className="p-6 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                  {patient.medicalHistory ? (
                    <p className="whitespace-pre-wrap">{patient.medicalHistory}</p>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-6 text-slate-400 italic">
                      <p>No prior medical anamnesis has been recorded for this patient.</p>
                      <button className="mt-4 text-xs font-bold text-teal-600 hover:underline">
                        + Add Initial Clinical Entry
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </section>

            <section className="glass p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-500">
                  <Clock className="h-5 w-5" />
                </div>
                <h3 className="text-xl font-extrabold text-slate-800 dark:text-slate-100">Consultation Chronology</h3>
              </div>
              
              <div className="space-y-4">
                {patient.appointments && patient.appointments.length > 0 ? (
                  patient.appointments.map((app, index) => (
                    <div key={app.id} className="flex gap-4 items-start group">
                      <div className="flex flex-col items-center">
                        <div className="w-3 h-3 rounded-full bg-teal-500 border-2 border-white dark:border-slate-950 z-10"></div>
                        {index !== patient.appointments.length - 1 && <div className="w-0.5 flex-1 bg-slate-200 dark:bg-slate-800 -mt-1 group-hover:bg-teal-500/30 transition-colors"></div>}
                      </div>
                      <div className="pb-6 flex-1">
                        <div className="flex justify-between items-start mb-1">
                          <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
                            {new Date(app.appointmentDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-xxs font-extrabold tracking-wide uppercase ${app.status === 'COMPLETED' ? 'bg-teal-500/10 text-teal-600' : 'bg-amber-500/10 text-amber-500'}`}>
                            {app.status}
                          </span>
                        </div>
                        <h4 className="font-bold text-slate-800 dark:text-slate-100">
                          {app.reason || 'General Consultation'}
                        </h4>
                        <p className="text-xs text-slate-500 mt-1">
                          Session with attending physician ID: {app.doctorId.split('-')[0].toUpperCase()}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-400 text-sm italic py-4">No appointment history found for this record.</p>
                )}
              </div>
            </section>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-8">
            <div className="glass p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Contact Intelligence</h4>
              <div className="space-y-4">
                <div>
                  <label className="text-xxs font-bold text-slate-400 uppercase">Registered Email</label>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{patient.email || 'None Provided'}</p>
                </div>
                <div>
                  <label className="text-xxs font-bold text-slate-400 uppercase">Verified Phone</label>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{patient.phoneNumber}</p>
                </div>
                <div>
                  <label className="text-xxs font-bold text-slate-400 uppercase">Registration Date</label>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                    {new Date(patient.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="glass p-6 rounded-2xl border border-rose-500/10 bg-rose-500/5 shadow-md">
              <h4 className="text-xs font-black text-rose-500 uppercase tracking-widest mb-4">Critical Warning</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                This clinical record contains sensitive medical data protected by HIPAA regulations. Unauthorized disclosure or distribution is strictly prohibited. Access logs for this patient are being audited.
              </p>
              <button className="w-full mt-4 py-2 bg-rose-500/10 text-rose-500 text-xs font-bold rounded-lg border border-rose-500/20 hover:bg-rose-500 hover:text-white transition-all">
                Download PDF Archive
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
