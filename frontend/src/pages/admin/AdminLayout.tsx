import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, MessageSquare, Tags, CreditCard, LogOut } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { logout } from '../../features/auth/authSlice.ts';
import axiosInstance from '../../config/api.ts';
import { showErrorToast } from '../../utils/notify.ts';
import { getApiErrorMessage } from '../../utils/notify.ts';

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogout = async () => {
    try {
      await axiosInstance.post('/api/v1/users/signout');
    } catch (error) {
      showErrorToast(getApiErrorMessage(error, 'Failed to sign out cleanly'));
    } finally {
      dispatch(logout());
      navigate('/login');
    }
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Transactions', path: '/admin/transactions', icon: CreditCard },
    { name: 'Users', path: '/admin/users', icon: Users },
    { name: 'Posts & Comments', path: '/admin/posts', icon: MessageSquare },
    { name: 'Tags', path: '/admin/tags', icon: Tags },
  ];

  return (
    <div className="flex flex-col md:flex-row gap-8">
      {/* Sidebar */}
      <aside className="w-full md:w-64 shrink-0">
        <div className="sticky top-8 rounded-3xl border border-white/60 bg-white/70 p-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-xl flex flex-col min-h-[calc(100vh-4rem)]">
          <Link to="/" className="mb-6 flex items-center gap-3 px-4 py-2">
            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg bg-white shadow-sm border border-slate-100">
               <img src="/askverse.logo.png" alt="AskVerse logo" className="h-full w-full object-contain" />
            </div>
            <div>
              <span className="font-brand text-xl font-bold text-slate-900 leading-none">AskVerse</span>
              <span className="block text-[10px] uppercase tracking-wider text-[var(--color-accent)] font-bold">Admin Panel</span>
            </div>
          </Link>
          
          <ul className="space-y-1.5 flex-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-[var(--color-brand)] text-white shadow-[0_8px_20px_rgba(22,93,134,0.25)]'
                        : 'text-slate-600 hover:bg-white/60 hover:text-slate-900'
                    }`}
                  >
                    <item.icon
                      size={18}
                      className={`transition-colors ${
                        isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'
                      }`}
                    />
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="mt-8 border-t border-slate-200/60 pt-4">
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-red-600 transition-all hover:bg-red-50"
            >
              <LogOut size={18} />
              Log Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        <div className="rounded-3xl border border-white/60 bg-white/70 p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-xl min-h-[calc(100vh-4rem)]">
           <Outlet />
        </div>
      </div>
    </div>
  );
}
