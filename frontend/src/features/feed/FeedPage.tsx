// src/pages/FeedPage.tsx
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../hooks/hooks.ts';
import { login } from '../auth/authSlice.ts';
import axiosInstance from '../../config/api.ts';
import QuestionList from '../questions/QuestionList.tsx';
import Loader from '../../components/Loader.tsx';
import Button from '../../components/Button.tsx';

export default function FeedPage() {
  const [feed, setFeed] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user, token } = useAppSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const loadUser = async () => {
      if (!user && token) {
        setIsLoading(true);
        try {
          const { data } = await axiosInstance.get('/api/v1/users/me', {
            headers: { Authorization: `Bearer ${token}` },
          });
          // Extract user data from ApiResponse wrapper
          const userData = data.data || data;
          dispatch(login({ user: userData, token }));
        } catch (err: any) {
          console.error('Failed to fetch user profile:', err);
          // Token probably expired → send back to login
          navigate('/login', { replace: true });
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadUser();
  }, [user, token, dispatch, navigate]);


  useEffect(() => {
    const loadFeed = async () => {
      if (!user?.id) return;                 // wait for user
      setIsLoading(true);
      try {
        const { data } = await axiosInstance.get(
          `/api/v1/feed/${user.id}?page=0&size=10`
        );
        // Extract feed data from ApiResponse wrapper
        const feedData = data.data || data;
        setFeed(feedData);
      } catch (err) {
        console.error('Error fetching feed:', err);
        // Fallback to all questions if feed fails
        // try {
        //   const { data } = await axiosInstance.get(
        //     `/api/v1/questions/all?page=0&size=10`
        //   );
        //   const questionsData = data.data || data;
        //   setFeed(questionsData);
        // } catch (fallbackErr) {
        //   console.error('Error fetching questions:', fallbackErr);
        // }
      } finally {
        setIsLoading(false);
      }
    };

    loadFeed();
  }, [user?.id]);


  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto relative">
      {/* Header Section */}
      <div className="mb-10">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-5xl font-bold gradient-text mb-2">Your Feed</h1>
            <p className="text-gray-600 text-lg">Discover questions from topics you follow</p>
          </div>
          <Button
            onClick={() => navigate('/ask')}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Ask Question
          </Button>
        </div>
      </div>

      {feed.length === 0 ? (
        <div className="text-center py-20 glass rounded-2xl">
          <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center float-animation">
            <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">No questions in your feed yet</h2>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Follow some tags or ask your first question to get started!
          </p>
          <div className="flex gap-4 justify-center">
            <Button
              onClick={() => navigate('/tags')}
              variant="secondary"
              className="flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              Explore Tags
            </Button>
            <Button
              onClick={() => navigate('/ask')}
              className="bg-gradient-to-r from-purple-600 to-pink-600 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Ask Question
            </Button>
          </div>
        </div>
      ) : (
        <QuestionList questions={feed} />
      )}
    </div>
  );
}