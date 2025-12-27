// src/components/Navbar.tsx
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { logout } from '../features/auth/authSlice.ts';
import { useDispatch, useSelector } from 'react-redux';
import { useState, useEffect } from 'react';
import { Menu, X, LogOut, User as Search } from 'lucide-react';

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
    dispatch(logout());
    navigate('/login');
  };

  const isActive = (path: string) => {
    return location.pathname === path ? 'text-white bg-white/10' : 'text-blue-100 hover:text-white hover:bg-white/5';
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-[#07528f] shadow-lg' : 'bg-[#07528f]'
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              AskVerse
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <Link to="/" className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/')}`}>Home</Link>
              {user && (
                <>
                  <Link to="/ask" className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/ask')}`}>Ask</Link>
                  <Link to="/tags" className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/tags')}`}>Tags</Link>
                </>
              )}
            </div>
          </div>

          {/* Search Bar (Desktop) */}
          {user && (
            <div className="hidden md:block flex-1 max-w-md mx-8">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={16} className="text-blue-300" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-1.5 border border-transparent rounded-full leading-5 bg-[#064070] text-blue-100 placeholder-blue-300 focus:outline-none focus:bg-white focus:text-gray-900 focus:placeholder-gray-500 sm:text-sm transition-colors duration-200"
                  placeholder="Search questions..."
                />
              </div>
            </div>
          )}

          {/* User Profile / Auth (Desktop) */}
          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6 gap-4">
              {user ? (
                <>
                  <Link
                    to="/profile"
                    className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium transition-colors ${isActive('/profile')}`}
                  >
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center overflow-hidden border border-white/30">
                      <img
                        src={`https://ui-avatars.com/api/?name=${user.name}&background=random&color=fff`}
                        alt={user.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="max-w-[100px] truncate">{user.name}</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-blue-200 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
                    title="Logout"
                  >
                    <LogOut size={20} />
                  </button>
                </>
              ) : (
                <Link to="/login" className="text-white bg-white/20 hover:bg-white/30 px-4 py-2 rounded-md text-sm font-medium transition-colors">
                  Login
                </Link>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-blue-200 hover:text-white hover:bg-white/10 focus:outline-none transition-colors"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        onClick={() => setIsOpen(false)}
      />

      {/* Mobile Menu Panel */}
      <div
        className={`absolute top-16 left-0 w-full bg-[#07528f] shadow-xl z-50 md:hidden transform transition-transform duration-300 origin-top ${isOpen ? 'scale-y-100 opacity-100' : 'scale-y-0 opacity-0'
          }`}
      >
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-white/10">
          <Link to="/" className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/')}`}>Home</Link>
          {user && (
            <>
              <Link to="/ask" className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/ask')}`}>Ask</Link>
              <Link to="/tags" className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/tags')}`}>Tags</Link>
            </>
          )}
          <div className="my-4 px-3">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={16} className="text-blue-300" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-transparent rounded-md leading-5 bg-[#064070] text-blue-100 placeholder-blue-300 focus:outline-none focus:bg-white focus:text-gray-900 focus:placeholder-gray-500 sm:text-sm"
                placeholder="Search..."
              />
            </div>
          </div>

          {user ? (
            <div className="pt-4 pb-3 border-t border-white/10">
              <div className="flex items-center px-5 mb-3">
                <div className="flex-shrink-0">
                  <img
                    className="h-10 w-10 rounded-full border-2 border-white/30"
                    src={`https://ui-avatars.com/api/?name=${user.name}&background=random&color=fff`}
                    alt=""
                  />
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium leading-none text-white">{user.name}</div>
                  <div className="text-sm font-medium leading-none text-blue-200 mt-1">{user.email}</div>
                </div>
              </div>
              <div className="space-y-1 px-2">
                <Link to="/profile" className="block px-3 py-2 rounded-md text-base font-medium text-blue-100 hover:text-white hover:bg-white/10">Your Profile</Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-blue-100 hover:text-white hover:bg-white/10"
                >
                  Sign out
                </button>
              </div>
            </div>
          ) : (
            <div className="pt-4 pb-3 border-t border-white/10 px-2">
              <Link to="/login" className="block w-full text-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-[#07528f] bg-white hover:bg-gray-50">
                Sign in
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}