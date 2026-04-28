import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, CalendarCheck2, ShieldCheck, Video } from 'lucide-react';

const highlights = [
  {
    title: 'Appointment Management',
    description: 'Book, reschedule, and track appointments with doctors in a few clicks.',
    icon: CalendarCheck2,
  },
  {
    title: 'Telemedicine Sessions',
    description: 'Connect with providers through secure video consultations from anywhere.',
    icon: Video,
  },
  {
    title: 'AI Symptom Support',
    description: 'Use guided symptom checks to get early health insights and next steps.',
    icon: Activity,
  },
  {
    title: 'Protected Data',
    description: 'Patient and provider records are handled through secure service layers.',
    icon: ShieldCheck,
  },
];

function HomePage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <section className="bg-gradient-to-br from-blue-950 via-blue-900 to-cyan-800 text-white">
        <div className="mx-auto max-w-6xl px-6 py-20 lg:py-28">
          <p className="mb-3 inline-flex rounded-full border border-white/30 px-3 py-1 text-xs tracking-wide">
            Healthcare Platform
          </p>
          <h1 className="max-w-3xl text-4xl font-bold leading-tight md:text-5xl">
            One digital suite for patients, doctors, and care operations.
          </h1>
          <p className="mt-5 max-w-2xl text-sm text-blue-100 md:text-base">
            Manage appointments, consult through video, process payments, and access AI-assisted symptom
            support with a unified healthcare experience.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/login"
              className="rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-blue-900 transition hover:bg-blue-100"
            >
              Sign in
            </Link>
            <Link
              to="/register"
              className="rounded-lg border border-white/50 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Create account
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-14 lg:py-16">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-slate-900 md:text-3xl">Core platform capabilities</h2>
          <p className="mt-2 text-sm text-slate-600 md:text-base">
            Built for coordinated care workflows across patient, doctor, and admin experiences.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {highlights.map((item) => {
            const Icon = item.icon;
            return (
              <article key={item.title} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-3 inline-flex rounded-lg bg-blue-100 p-2 text-blue-700">
                  <Icon size={20} />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">{item.title}</h3>
                <p className="mt-1.5 text-sm text-slate-600">{item.description}</p>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}

export default HomePage;
