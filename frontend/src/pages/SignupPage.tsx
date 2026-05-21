import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
// import { useDispatch } from 'react-redux';
import axiosInstance from '../config/api.ts';
// import { login } from './authSlice.ts';
import Button from '../components/Button.tsx';
import Input from '../components/Input.tsx';
import { ArrowRight, Compass, PenSquare, Users } from 'lucide-react';
import { getApiErrorMessage, getApiSuccessMessage, showErrorToast, showSuccessToast } from '../utils/notify.ts';

export default function SignupPage() {
  const [form, setForm] = useState({ name: '', email: '', username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  // const dispatch = useDispatch();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axiosInstance.post('/api/v1/users/signup', form);
      showSuccessToast(getApiSuccessMessage(response.data, 'Signup successful'));
      navigate('/login');
    } catch (error: any) {
      showErrorToast(getApiErrorMessage(error, 'Signup failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen items-center gap-8 lg:grid-cols-[0.95fr_1.05fr]">
    

      <section className="relative hidden overflow-hidden rounded-[32px] border border-white/70 bg-[linear-gradient(160deg,#fff4ef_0%,#f5fbff_48%,#eef4fa_100%)] p-8 shadow-[0_28px_90px_rgba(21,35,58,0.12)] lg:flex lg:min-h-[620px] lg:flex-col lg:justify-between">
        <div className="absolute -right-12 top-10 h-40 w-40 rounded-full bg-[#b34e68]/12 blur-3xl" />
        <div className="absolute bottom-6 left-0 h-44 w-44 rounded-full bg-[#165d86]/10 blur-3xl" />

        <div className="relative">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-600">
            <Compass size={16} className="text-[var(--color-brand)]" />
            Build your knowledge graph
          </div>
          <h1 className="font-brand max-w-lg text-5xl font-bold leading-tight text-slate-900">
            Make your Quora-style app feel more intentional.
          </h1>
          <p className="mt-4 max-w-lg text-lg leading-8 text-slate-600">
            AskVerse helps people ask clearly, follow strong topics, and keep great answers easy to revisit.
          </p>
        </div>

        <div className="relative grid gap-4">
          <div className="rounded-[24px] border border-white/70 bg-white/76 p-5 shadow-[0_18px_42px_rgba(21,35,58,0.08)]">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--color-brand-soft)] text-[var(--color-brand)]">
              <PenSquare size={20} />
            </div>
            <p className="font-semibold text-slate-900">Share well-structured questions</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Better prompts lead to better answers. We’re shaping the UI around that flow.
            </p>
          </div>
          <div className="rounded-[24px] border border-white/70 bg-white/76 p-5 shadow-[0_18px_42px_rgba(21,35,58,0.08)]">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-[rgba(179,78,104,0.14)] text-[var(--color-accent)]">
              <Users size={20} />
            </div>
            <p className="font-semibold text-slate-900">Grow around your interests</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Follow tags, revisit discussions, and turn the app into a more welcoming community space.
            </p>
          </div>
        </div>
      </section>
        <div className="shell-surface mx-auto w-full max-w-lg rounded-[32px] p-8 sm:p-10">
        <div className="mb-8">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-accent)]">
            Join AskVerse
          </p>
          <h2 className="font-brand text-4xl font-bold text-slate-900">Create your profile</h2>
          <p className="mt-3 text-slate-600">
            Start asking smarter questions, following topics, and building your presence in the community.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Name</label>
            <Input
              type="text"
              placeholder="Your full name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Email</label>
            <Input
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Username</label>
            <Input
              type="text"
              placeholder="Choose a username"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Password</label>
            <Input
              type="password"
              placeholder="Create a secure password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>

          <Button type="submit" disabled={loading} size="large" className="w-full justify-center">
            {loading ? 'Signing up...' : 'Create account'}
            {!loading && <ArrowRight size={18} />}
          </Button>
        </form>

        <p className="mt-6 text-center text-slate-600">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-[var(--color-brand)] transition-colors hover:text-[var(--color-accent)]">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
