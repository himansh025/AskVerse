// src/components/Navbar.tsx
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { logout } from '../features/auth/authSlice.ts';
import { useDispatch, useSelector } from 'react-redux';
import { useState, useEffect } from 'react';
import { Menu, X, LogOut } from 'lucide-react';

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
            <div className="ml-10  flex items-baseline space-x-4">
              {/* <Link to="/login" className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/login')}`}>Login</Link>                               */}
              {user && (
                <>
                  <Link to="/" className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/')}`}>Home</Link>
                  <Link to="/ask" className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/ask')}`}>Ask</Link>
                  <Link to="/tags" className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/tags')}`}>Tags</Link>
                </>
              )}
            </div>
          </div>

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
              ) : null}
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
        <div className="px-2 pt-2 pb-3 space-y-1 flex text-end flex-col  sm:px-3 border-t border-white/10">
          {user && user.name ? (
            <>
              <Link to="/" className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/')}`}>Home</Link>
              <Link to="/ask" className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/ask')}`}>Ask</Link>
              <Link to="/tags" className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/tags')}`}>Tags</Link>
              <Link to="/profile" className="block px-3 py-2 rounded-md text-base font-medium text-blue-100 hover:text-white hover:bg-white/10">Profile</Link>
              <button
                onClick={handleLogout}
                className="flex justify-end  text-left block px-3 py-2 rounded-md text-base font-medium text-blue-100 hover:text-white hover:bg-white/10"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/login')}`}>Login</Link>
              <Link to="/singup" className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/singup')}`}>Singup</Link>
            </>
          )}
          {user ? (
            <div className="pt-4 pb-3 border-t border-white/10">
              <div className="flex items-center px-5 mb-3">
              </div>
              <div className="space-y-1 px-2">

              </div>
            </div>
          ) : null}
        </div>
      </div>
    </nav>
  );
}