// src/App.tsx
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar.tsx';
import LoginPage from './pages/LoginPage.tsx';
import SignupPage from './pages/SignupPage.tsx';
import FeedPage from './pages/FeedPage.tsx';
import AskQuestionPage from './pages/AskQuestionPage.tsx';
import TagsPage from './pages/TagsPage.tsx';
import TagDetailsPage from './pages/TagDetailsPage.tsx';
import ProfilePage from './pages/ProfilePage.tsx';
import EditProfilePage from './pages/EditProfilePage.tsx';
import NotFound from './pages/NotFound.tsx';
import QuestionDetailsPage from './pages/QuestionDetailsPage.tsx';
import { useEffect, useState } from 'react';
import axiosInstance from './config/api.ts';
import { useDispatch, useSelector } from 'react-redux';
import { login } from './features/auth/authSlice.ts';
import Loader from './components/Loader.tsx';
import ProtectedRoute from './features/auth/ProtectedRoute.tsx';
import AdminTransactions from './pages/admin/AdminTransactions.tsx';
import AdminUsers from './pages/admin/AdminUsers.tsx';
import AdminPosts from './pages/admin/AdminPosts.tsx';
import AdminTags from './pages/admin/AdminTags.tsx';
import AdminRoute from './features/auth/AdminRoute.tsx';
import AdminLayout from './pages/admin/AdminLayout.tsx';
import AdminDashboard from './pages/admin/AdminDashboard.tsx';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useSelector((state: any) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const hideNavbar = ['/login', '/signup'].includes(location.pathname) || user?.role === 'ADMIN';
  const [hasAttemptedFetch, setHasAttemptedFetch] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const getMe = async () => {
      if (user || hasAttemptedFetch) {
        if (isMounted) {
          setIsLoading(false);
        }
        return;
      }

      try {
        const { data } = await axiosInstance.get('/api/v1/users/me');
        const userData = data.data || data;

        if (!isMounted) {
          return;
        }

        dispatch(login({ user: userData }));
      } catch (err: any) {
        if (err.response?.status !== 401) {
          console.error('Failed to fetch user profile:', err);
        }
      } finally {
        if (isMounted) {
          setHasAttemptedFetch(true);
          setIsLoading(false);
        }
      }
    };

    void getMe();

    return () => {
      isMounted = false;
    };
  }, [dispatch, user, hasAttemptedFetch]);

  useEffect(() => {
    if (user?.role === 'ADMIN' && !location.pathname.startsWith('/admin') && !location.pathname.startsWith('/question') && !['/login', '/signup'].includes(location.pathname)) {
      navigate('/admin', { replace: true });
    } else if (user && user?.role !== 'ADMIN' && ['/login', '/signup'].includes(location.pathname)) {
      navigate('/', { replace: true });
    }
  }, [user, location.pathname, navigate]);

  if (isLoading) {
    return (
      <Loader />
    )
  }

  return (
    <div className="app-shell">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        {/* <div className="absolute left-[8%] top-28 h-56 w-56 rounded-full bg-[#165d86]/12 blur-3xl" /> */}
        {/* <div className="absolute right-[10%] top-40 h-64 w-64 rounded-full bg-[#b34e68]/10 blur-3xl" /> */}
        {/* <div className="absolute bottom-10 left-1/3 h-48 w-48 rounded-full bg-white/30 blur-3xl" /> */}
      </div>
      {!hideNavbar && <Navbar />}
      <main className={`relative z-10 rounded-xl ${hideNavbar ? 'pt-6 pb-6 px-4 sm:px-6 lg:px-8' : 'pt-[6.5rem] pb-12 px-3 sm:px-5 lg:px-6'}`}>
        <div className={`mx-auto w-full ${user?.role === 'ADMIN' ? 'max-w-full' : 'max-w-[1600px]'}`}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/" element={<FeedPage />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/ask" element={<AskQuestionPage />} />
              <Route path="/question/:id" element={<QuestionDetailsPage />} />
              <Route path="/tags" element={<TagsPage />} />
              <Route path="/tags/:id" element={<TagDetailsPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/profile/edit" element={<EditProfilePage />} />
            </Route>
            <Route element={<AdminRoute />}>
              <Route element={<AdminLayout />}>
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/transactions" element={<AdminTransactions />} />
                <Route path="/admin/users" element={<AdminUsers />} />
                <Route path="/admin/posts" element={<AdminPosts />} />
                <Route path="/admin/tags" element={<AdminTags />} />
              </Route>
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}
