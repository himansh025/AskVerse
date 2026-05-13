// src/components/Navbar.tsx
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { logout } from '../features/auth/authSlice.ts';
import { useDispatch, useSelector } from 'react-redux';
import { useState, useEffect } from 'react';
import {
  ArrowRight,
  CircleHelp,
  House,
  LogOut,
  Menu,

  Tags,
  UserRound,
  X,
} from 'lucide-react';

export default function Navbar() {
  const { user } = useSelector((state: any) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("token")
    dispatch(logout());
    navigate('/login');
  };

  const navigationItems = [
    { to: '/', label: 'Home', icon: House },
    ...(user ? [
      { to: '/ask', label: 'Ask', icon: CircleHelp },
      { to: '/tags', label: 'Tags', icon: Tags },
      { to: '/profile', label: 'Profile', icon: UserRound },
    ] : []),
  ];

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }

    return location.pathname.startsWith(path);
  };

  const avatarUrl = user?.profilePicture || (
    user?.name
      ? `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=165d86&color=fff&size=128`
      : ''
  );

  return (
    <nav className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-5 lg:px-6">
      <div className="mx-auto max-w-[1600px]">
        <div
          className={`rounded-[28px] border transition-all duration-300 ${
            scrolled
              ? 'border-white/70 bg-white/82 shadow-[0_28px_70px_rgba(21,35,58,0.18)] backdrop-blur-2xl'
              : 'border-white/60 bg-white/74 shadow-[0_22px_60px_rgba(21,35,58,0.14)] backdrop-blur-xl'
          }`}
        >
          <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6">
            <Link to="/" className="flex min-w-0 items-center gap-3">
              <div className=" flex h-fit w-16  items-center justify-center  overflow-hidden">
                <img src="/askverse.logo.png" alt="AskVerse logo" className="h-full w-full object-contain rounded  "  />
              </div>
              <div className="min-w-0">
                {/* <p className="font-brand text-xl font-bold text-slate-900">AskVerse</p> */}
                <p className="hidden text-xs font-medium text-slate-500 sm:block">
                  Ask better. Learn in public.
                </p>
              </div>
            </Link>

            <div className="hidden items-center gap-2 md:flex">
              {
              user && navigationItems.map(({ to, label, icon: Icon }) => {
                const active = isActive(to);
                return (
                  <Link
                    key={to}
                    to={to}
                    className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-all ${
                      active
                        ? 'border-[rgba(22,93,134,0.18)] bg-[rgba(22,93,134,0.10)] text-[var(--color-brand)] shadow-[0_14px_30px_rgba(22,93,134,0.10)]'
                        : 'border-transparent text-slate-600 hover:border-white/70 hover:bg-white hover:text-slate-900'
                    }`}
                  >
                    <Icon size={16} className={active ? 'text-[var(--color-brand)]' : ''} />
                    {label}
                    {/* {active ? <span className="h-2 w-2 rounded-full bg-[var(--color-accent)]" /> : null} */}
                  </Link>
                );
              })}
            </div>

            <div className="hidden items-center gap-3 md:flex">
              {user ? (
                <>
                  <div className="relative group flex gap-2 items-center justify-center">
                    <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-100 cursor-pointer">
                      <img
                        src={avatarUrl}
                        alt={user.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="max-w-[120px] truncate cursor-pointer text-sm text-slate-900 font-medium mt-1">{user.name}</span>
                    
                    {/* Logout button dropdown - appears on hover */}
                    <button
                      onClick={handleLogout}
                      className="absolute top-full hover:text-red-600 left-1/2 transform -translate-x-1/2 mt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 px-4 py-2.5 rounded-full border border-slate-200 bg-white text-slate-700 text-sm font-semibold hover:bg-slate-50 shadow-[0_12px_28px_rgba(21,35,58,0.12)] whitespace-nowrap flex items-center gap-2"
                    >
                      {/* <LogOut size={16} /> */}
                      Logout
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {/* <Link
                    to="/login"
                    className="inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:text-slate-900"
                  >
                    Log in
                  </Link> */}
                  {/* <Link
                    to="/signup"
                    className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-[0_18px_34px_rgba(21,35,58,0.18)] transition-all hover:-translate-y-0.5 hover:bg-slate-800"
                  >
                    Join AskVerse
                    <ArrowRight size={16} />
                  </Link> */}
                </>
              )}
            </div>

            <div className="flex md:hidden">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="inline-flex items-center justify-center rounded-full border border-white/70 bg-white/72 p-2.5 text-slate-700 transition-all hover:bg-white"
                aria-label="Toggle menu"
              >
                {isOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div
        className={`fixed inset-0 z-40 bg-slate-950/16 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={() => setIsOpen(false)}
      />

      <div
        className={`absolute inset-x-3 top-[5.2rem] z-50 rounded-[28px] border border-white/70 bg-white/92 p-4 shadow-[0_24px_70px_rgba(21,35,58,0.18)] backdrop-blur-2xl transition-all duration-300 md:hidden ${
          isOpen ? 'translate-y-0 opacity-100' : 'pointer-events-none -translate-y-2 opacity-0'
        }`}
      >
        <div className="flex flex-col gap-2">
          {user ? (
            <>
              <div className="mb-2 flex items-center gap-3 rounded-2xl bg-slate-50 px-3 py-3">
                <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-100">
                  <img src={avatarUrl} alt={user.name} className="h-full w-full object-cover" />
                </div>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-slate-900">{user.name}</p>
                  <p className="text-sm text-slate-500">Ready to share a new question?</p>
                </div>
              </div>
              {navigationItems.map(({ to, label, icon: Icon }) => {
                const active = isActive(to);
                return (
                  <Link
                    key={to}
                    to={to}
                    className={`inline-flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-semibold transition-all ${
                      active
                        ? 'border border-[rgba(22,93,134,0.18)] bg-[rgba(22,93,134,0.10)] text-[var(--color-brand)]'
                        : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span className="inline-flex items-center gap-3">
                      <Icon size={18} />
                      {label}
                    </span>
                    {active ? <span className="h-2.5 w-2.5 rounded-full bg-[var(--color-accent)]" /> : <ArrowRight size={16} />}
                  </Link>
                );
              })}
              <button
                onClick={() => navigate('/ask')}
                className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-[var(--color-accent)] px-4 py-3 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(179,78,104,0.24)]"
              >
                Ask a question
                <ArrowRight size={16} />
              </button>
              <button
                onClick={handleLogout}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600"
              >
                <LogOut size={16} />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/"
                className={`inline-flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-semibold ${
                  isActive('/') ? 'border border-[rgba(22,93,134,0.18)] bg-[rgba(22,93,134,0.10)] text-[var(--color-brand)]' : 'bg-slate-50 text-slate-700'
                }`}
              >
                <span className="inline-flex items-center gap-3">
                  <House size={18} />
                  Home
                </span>
                {isActive('/') ? <span className="h-2.5 w-2.5 rounded-full bg-[var(--color-accent)]" /> : <ArrowRight size={16} />}
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center justify-center rounded-full border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700"
              >
                Log in
              </Link>
              <Link
                to="/signup"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 px-4 py-3 text-sm font-semibold text-white"
              >
                Join AskVerse
                <ArrowRight size={16} />
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
