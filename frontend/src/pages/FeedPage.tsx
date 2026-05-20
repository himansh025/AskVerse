// src/pages/FeedPage.tsx
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../config/api.ts';
import QuestionList from '../features/questions/QuestionList.tsx';
import Loader from '../components/Loader.tsx';
import Button from '../components/Button.tsx';
import { SearchBar } from '../components/SearchBar.tsx';
import { ArrowRight, Compass, Sparkles, TrendingUp } from 'lucide-react';

export default function FeedPage() {
  const [feed, setFeed] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useSelector((state: any) => state.auth);
  const navigate = useNavigate();
  const [allFeed, setAllFeed] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const loadUserFeed = async () => {
      if (!user?.id) return;
      setIsLoading(true);
        try {
          const { data } = await axiosInstance.get(
          `/api/v1/feed/${user.id}?page=0&size=10`
        );
        const feedData = data.data || data;
        setAllFeed(feedData);
        setFeed(feedData);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    const loadFeed = async () => {
      setIsLoading(true);
        try {
        const viewerQuery = user?.id ? `&viewerUserId=${user.id}` : '';
          const { data } = await axiosInstance.get(
          `/api/v1/questions/all?page=0&size=10${viewerQuery}`
        );
        const feedData = data.data || data;
        setAllFeed(feedData);
        setFeed(feedData);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      loadUserFeed();
    } else {
      loadFeed();
    }
  }, [user]);


  useEffect(() => {
    if (!searchQuery.trim()) {
      setFeed(allFeed);
      return;
    }


    const filtered = allFeed.filter((q) =>
      q.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    setFeed(filtered);
  }, [searchQuery, allFeed]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };


  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader />
      </div>
    );
  }

  return (
    <div className="relative space-y-8">
      <section className="shell-surface relative overflow-hidden rounded-[32px] px-6 py-8 sm:px-8 lg:px-10 xl:px-12">
        <div className="absolute -right-10 top-0 h-44 w-44 rounded-full bg-[#165d86]/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-40 w-40 rounded-full bg-[#b34e68]/10 blur-3xl" />

        <div className="relative grid gap-8 xl:grid-cols-[1.45fr_0.8fr] xl:items-center">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/70 px-4 py-2 text-sm font-semibold text-slate-600">
              <Sparkles size={16} className="text-[var(--color-accent)]" />
              Community-powered knowledge, styled with more clarity
            </div>

            <h1 className="font-brand max-w-3xl text-4xl font-bold leading-tight text-slate-900 sm:text-5xl">
              {user ? `Welcome back, ${user.name?.split(' ')[0] || 'friend'}.` : 'A cleaner place to ask, learn, and explore ideas.'}
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
              {user
                ? 'Your personalized feed brings together the questions and topics that matter to you most.'
                : 'Browse thoughtful questions, discover fresh perspectives, and join the AskVerse conversations that interest you.'}
            </p>

            <div className="mt-7 flex flex-col gap-4 lg:flex-row lg:items-center">
              <SearchBar onSearch={handleSearch} />
              <Button
                onClick={() => navigate('/ask')}
                size="large"
                className="w-full justify-center lg:w-auto"
              >
                Ask Question
                <ArrowRight size={18} />
              </Button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
            <div className="rounded-[24px] border border-white/70 bg-white/80 p-5 shadow-[0_18px_42px_rgba(21,35,58,0.08)]">
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--color-brand-soft)] text-[var(--color-brand)]">
                <TrendingUp size={20} />
              </div>
              <p className="text-sm font-semibold text-slate-500">Questions in view</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">{feed.length}</p>
            </div>

            <div className="rounded-[24px] border border-white/70 bg-slate-900 p-5 text-white shadow-[0_18px_42px_rgba(21,35,58,0.16)]">
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-white/12 text-white">
                <Compass size={20} />
              </div>
              <p className="text-sm font-semibold text-slate-300">Discover next</p>
              <p className="mt-2 text-lg font-bold">Explore deeper topics and smarter answers.</p>
            </div>

            <div className="rounded-[24px] border border-white/70 bg-white/80 p-5 shadow-[0_18px_42px_rgba(21,35,58,0.08)]">
              <p className="text-sm font-semibold text-slate-500">Quick path</p>
              <button
                onClick={() => navigate('/tags')}
                className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-accent)] transition-colors hover:text-[var(--color-accent-strong)]"
              >
                Browse tags
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {feed.length === 0 ? (
        <div className="glass rounded-[32px] px-6 py-16 text-center sm:px-10">
          <div className="mx-auto mb-6 flex h-28 w-28 items-center justify-center rounded-full bg-[var(--color-accent)] text-white float-animation">
            <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h2 className="font-brand mb-3 text-3xl font-bold text-slate-900">No questions in your feed yet</h2>
          <p className="mx-auto mb-6 max-w-md text-slate-600">
            Follow some tags or ask your first question to get started!
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
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
            <Button onClick={() => navigate('/ask')} className="flex items-center gap-2">
              Ask your first question
              <ArrowRight size={16} />
            </Button>
          </div>
        </div>
      ) : (
        <section className="space-y-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="font-brand text-2xl font-bold text-slate-900">Fresh questions for you</h2>
              <p className="text-slate-600">A more polished feed with faster scanning and clearer content hierarchy.</p>
            </div>
          </div>
          <QuestionList questions={feed} />
        </section>
      )}
    </div>
  );
}
