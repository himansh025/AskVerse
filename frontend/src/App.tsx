// src/App.tsx
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar.tsx';
import LoginPage from './features/auth/LoginPage.tsx';
import SignupPage from './features/auth/SignupPage.tsx';
import FeedPage from './features/feed/FeedPage.tsx';
import AskQuestionPage from './features/questions/AskQuestionPage.tsx';
import QuestionDetails from './features/questions/QuestionDetails.tsx';
import TagsPage from './pages/TagsPage.tsx';
import ProfilePage from './pages/ProfilePage.tsx';
import NotFound from './pages/NotFound.tsx';
import ProtectedRoute from './features/auth/ProtectedRoute.tsx';
import { useEffect, useState } from 'react';
import axiosInstance from './config/api.ts';
import { useDispatch } from 'react-redux';
import { useAppSelector } from './hooks/hooks.ts';
import { login } from './features/auth/authSlice.ts';
import Loader from './components/Loader.tsx';

export default function App() {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAppSelector((state) => state.auth);
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
      <div className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<FeedPage />} />
            <Route path="/ask" element={<AskQuestionPage />} />
            <Route path="/question/:id" element={<QuestionDetails />} />
            <Route path="/tags" element={<TagsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>

    </>
  );
}