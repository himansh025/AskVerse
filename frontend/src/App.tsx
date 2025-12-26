// src/App.tsx
import { Routes, Route, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar.tsx';
import LoginPage from './pages/LoginPage.tsx';
import SignupPage from './pages/SignupPage.tsx';
import FeedPage from './pages/FeedPage.tsx';
import AskQuestionPage from './pages/AskQuestionPage.tsx';
import TagsPage from './pages/TagsPage.tsx';
import TagDetailsPage from './pages/TagDetailsPage.tsx';
import ProfilePage from './pages/ProfilePage.tsx';
import NotFound from './pages/NotFound.tsx';
import QuestionDetailsPage from './pages/QuestionDetailsPage.tsx';
import { useEffect, useState } from 'react';
import axiosInstance from './config/api.ts';
import { useDispatch, useSelector } from 'react-redux';
import { login } from './features/auth/authSlice.ts';
import Loader from './components/Loader.tsx';
import ProtectedRoute from './features/auth/ProtectedRoute.tsx';

export default function App() {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useSelector((state: any) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const userToken = localStorage.getItem("token")
  useEffect(() => {
    if (userToken) {
      const getMe = async () => {
        if (!user && userToken) {
          setIsLoading(true);
          try {
            const { data } = await axiosInstance.get('/api/v1/users/me', {
              headers: { Authorization: `Bearer ${userToken}` },
            });
            const userData = data.data || data;
            dispatch(login({ user: userData, token: userToken }));
            navigate('/');
          } catch (err: any) {
            console.error('Failed to fetch user profile:', err);
            localStorage.removeItem("token")
            navigate('/login', { replace: true });
          } finally {
            setIsLoading(false);
          }
        }
      };
      getMe()
    }
  }, [user, userToken, dispatch, navigate]);

  if (isLoading) {
    return (
      <Loader />
    )
  }

  return (
    <>
      <Navbar />
      <div className="container mx-auto mt-10 px-4 py-8">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<FeedPage />} />
            <Route path="/ask" element={<AskQuestionPage />} />
            <Route path="/question/:id" element={<QuestionDetailsPage />} />
            <Route path="/tags" element={<TagsPage />} />
            <Route path="/tags/:id" element={<TagDetailsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>

    </>
  );
}