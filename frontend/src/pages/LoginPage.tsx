import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
// import { toast } from 'react-toastify';
import axiosInstance from "../config/api.ts";
import { login } from '../features/auth/authSlice.ts';
import Button from '../components/Button.tsx';
import Input from '../components/Input.tsx';
import { ArrowRight, MessageSquare, ShieldCheck, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data } = await axiosInstance.post('/api/v1/users/signin', form);
      // const userData = response.data;
      // console.log("data",data);
      const token: string = data?.data?.token ? data?.data?.token : " ";
      localStorage.setItem('token', token);
      dispatch(login({ user: null, token }))

      // sessionStorage.setItem('token', userData?.token);
      // toast.success('Login successful!');
      navigate('/');
    } catch (error: any) {
      console.error(error);
      // toast.error(error.response?.data?.message || 'Invalid credentials!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid h-screen items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
      <section className="relative hidden overflow-hidden rounded-[32px] border border-white/70 bg-slate-900 p-8 text-white shadow-[0_28px_90px_rgba(21,35,58,0.18)] lg:flex lg:min-h-[620px] lg:flex-col lg:justify-between">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.12),transparent_26%),radial-gradient(circle_at_bottom_left,rgba(179,78,104,0.35),transparent_34%),linear-gradient(160deg,#17304a_0%,#10253a_48%,#1f4f6c_100%)]" />
        <div className="relative">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-4 py-2 text-sm font-semibold text-slate-200">
            <Sparkles size={16} />
            AskVerse Community
          </div>
          <h1 className="font-brand max-w-lg text-3xl font-bold ">
            Return to the conversations that matter.
          </h1>
          <p className="mt-4 max-w-lg text-lg leading-8 text-slate-300">
            Log in to continue asking thoughtful questions, sharing answers, and following the topics you care about.
          </p>
        </div>

        <div className="relative grid gap-4">
          <div className="rounded-[24px] border border-white/12 bg-white/8 p-5 backdrop-blur-sm">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-white/12">
              <MessageSquare size={20} />
            </div>
            <p className="font-semibold">Meaningful discussions</p>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              Track questions, answers, and ongoing threads in one calmer interface.
            </p>
          </div>
          <div className="rounded-[24px] border border-white/12 bg-white/8 p-5 backdrop-blur-sm">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-white/12">
              <ShieldCheck size={20} />
            </div>
            <p className="font-semibold">Your profile stays in sync</p>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              Pick up where you left off with followed tags, posted questions, and personal activity.
            </p>
          </div>
        </div>
      </section>

      <div className="shell-surface mx-auto w-full max-w-lg rounded-[32px] p-8 sm:p-10">
        <div className="mb-8 py-8">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-accent)]">
            Welcome Back
          </p>
          <h2 className="font-brand text-4xl font-bold text-slate-900">Log in to AskVerse</h2>
          <p className="mt-3 text-slate-600">
            Continue exploring questions, ideas, and expert takes from your network.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Email</label>
            <Input
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Password</label>
            <Input
              type="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>

          <Button type="submit" disabled={loading} size="large" className="w-full justify-center">
            {loading ? 'Logging in...' : 'Log in'}
            {!loading && <ArrowRight size={18} />}
          </Button>
        </form>

        <p className="mt-6 text-center text-slate-600">
          Don&apos;t have an account?{' '}
          <Link to="/signup" className="font-semibold text-[var(--color-brand)] transition-colors hover:text-[var(--color-accent)]">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
