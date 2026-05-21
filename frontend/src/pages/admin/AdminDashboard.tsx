import { useEffect, useState } from 'react';
import axiosInstance from '../../config/api.ts';
import Loader from '../../components/Loader.tsx';
import { Users, FileText, MessageCircle, Hash, DollarSign } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await axiosInstance.get('/api/v1/admin/stats');
        setStats(data.data);
      } catch (err) {
        console.error('Failed to load stats', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <Loader />;

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-brand text-2xl font-bold text-slate-900">Dashboard Overview</h2>
        <p className="text-slate-500 mt-1">Get a high-level view of platform activity and metrics.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        <div className="rounded-2xl border border-white/60 bg-white/40 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-md flex items-center gap-5 transition-transform hover:scale-[1.02]">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 shadow-sm">
            <Users size={28} />
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">Total Users</p>
            <p className="mt-1 font-brand text-3xl font-bold text-slate-900">{stats?.totalUsers || 0}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-white/60 bg-white/40 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-md flex items-center gap-5 transition-transform hover:scale-[1.02]">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 shadow-sm">
            <DollarSign size={28} />
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">Total Income</p>
            <p className="mt-1 font-brand text-3xl font-bold text-slate-900">₹{stats?.totalIncome || 0}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-white/60 bg-white/40 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-md flex items-center gap-5 transition-transform hover:scale-[1.02]">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-purple-100 text-purple-600 shadow-sm">
            <FileText size={28} />
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">Total Posts</p>
            <p className="mt-1 font-brand text-3xl font-bold text-slate-900">{stats?.totalQuestions || 0}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-white/60 bg-white/40 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-md flex items-center gap-5 transition-transform hover:scale-[1.02]">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-orange-100 text-orange-600 shadow-sm">
            <MessageCircle size={28} />
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">Total Comments</p>
            <p className="mt-1 font-brand text-3xl font-bold text-slate-900">{stats?.totalComments || 0}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-white/60 bg-white/40 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-md flex items-center gap-5 transition-transform hover:scale-[1.02]">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-teal-100 text-teal-600 shadow-sm">
            <Hash size={28} />
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">Total Tags</p>
            <p className="mt-1 font-brand text-3xl font-bold text-slate-900">{stats?.totalTags || 0}</p>
          </div>
        </div>
        
      </div>
    </div>
  );
}
