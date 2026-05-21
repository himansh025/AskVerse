import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Hash, Plus, Search, Sparkles } from 'lucide-react';
import axiosInstance from '../config/api.ts';
import Button from '../components/Button.tsx';
import Loader from '../components/Loader.tsx';
import AddTagModal from '../features/tags/AddTagModal.tsx';
import { useDispatch, useSelector } from 'react-redux';
import { getApiErrorMessage, getApiSuccessMessage, showErrorToast, showSuccessToast } from '../utils/notify.ts';
import { setTagData } from '../store/dataSlicer.ts';

interface Tag {
  id: number;
  name: string;
  description?: string;
  followerCount?: number;
  questionCount?: number;
}

export default function TagsPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState<Record<number, boolean>>({});
  const [followedTagIds, setFollowedTagIds] = useState<Set<number>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddTagModalOpen, setIsAddTagModalOpen] = useState(false);
  const { user } = useSelector((state: any) => state.auth);
  const { tagData } = useSelector((state: any) => state.data);
  const dispatch = useDispatch();

  const fetchTags = async () => {
    if (tagData && tagData.length > 0) {
      setTags(tagData);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const res = await axiosInstance.get('/api/v1/tags');
      const data: Tag[] = res.data.data || res.data;
      setTags(data);
      dispatch(setTagData(data));
    } catch (error) {
      console.error('Failed to load tags:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFollowedTags = async () => {
    if (!user?.id) {
      return;
    }

    try {
      const res = await axiosInstance.get(`/api/v1/users/${user.id}/followedTags`);
      const followedTags: Tag[] = res.data.data || res.data;
      setFollowedTagIds(new Set(followedTags.map((tag) => tag.id)));
    } catch (error) {
      console.error('Failed to load followed tags:', error);
    }
  };

  useEffect(() => {
    fetchTags();
  }, [tagData, dispatch]);

  useEffect(() => {
    fetchFollowedTags();
  }, [user?.id]);

  const handleFollow = async (tagId: number) => {
    if (!user?.id) {
      return;
    }

    setFollowing((prev) => ({ ...prev, [tagId]: true }));
    try {
      const response = await axiosInstance.post(`/api/v1/users/${user.id}/followTag/${tagId}`);
      setFollowedTagIds((prev) => new Set(prev).add(tagId));
      fetchTags();
      showSuccessToast(getApiSuccessMessage(response.data, 'Tag followed successfully'));
    } catch (error) {
      console.error('Failed to follow tag:', error);
      showErrorToast(getApiErrorMessage(error, 'Could not follow tag'));
    } finally {
      setFollowing((prev) => ({ ...prev, [tagId]: false }));
    }
  };

  const handleUnfollow = async (tagId: number) => {
    if (!user?.id) {
      return;
    }

    setFollowing((prev) => ({ ...prev, [tagId]: true }));
    try {
      const response = await axiosInstance.delete(`/api/v1/users/${user.id}/unfollowTag/${tagId}`);
      setFollowedTagIds((prev) => {
        const next = new Set(prev);
        next.delete(tagId);
        return next;
      });
      fetchTags();
      showSuccessToast(getApiSuccessMessage(response.data, 'Tag unfollowed successfully'));
    } catch (error) {
      console.error('Failed to unfollow tag:', error);
      showErrorToast(getApiErrorMessage(error, 'Could not unfollow tag'));
    } finally {
      setFollowing((prev) => ({ ...prev, [tagId]: false }));
    }
  };

  const filteredTags = useMemo(
    () => tags.filter((tag) => tag.name.toLowerCase().includes(searchQuery.toLowerCase())),
    [tags, searchQuery],
  );

  const handleTagAdded = (newTag: Tag) => {
    setTags((prev) => [newTag, ...prev]);
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section className="shell-surface relative overflow-hidden rounded-[32px] px-6 py-8 sm:px-8 lg:px-10 xl:px-12">
        <div className="absolute -left-12 top-8 h-40 w-40 rounded-full bg-[var(--color-brand)]/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-48 w-48 rounded-full bg-[var(--color-accent)]/10 blur-3xl" />

        <div className="relative grid gap-8 xl:grid-cols-[1.2fr_0.95fr] xl:items-end">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/70 px-4 py-2 text-sm font-semibold text-slate-600">
              <Sparkles size={16} className="text-[var(--color-accent)]" />
              Curate the topics your community grows around
            </div>

            <h1 className="font-brand mt-5 text-4xl font-bold leading-tight text-slate-900 sm:text-5xl">
              Explore Tags
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
              Discover the conversations people are following, jump into focused question threads, and create a tag when a new topic needs a home.
            </p>

            <div className="mt-7 grid gap-4 sm:grid-cols-3">
              <div className="rounded-[24px] border border-white/70 bg-white/80 p-5 shadow-[0_18px_42px_rgba(21,35,58,0.08)]">
                <p className="text-sm font-semibold text-slate-500">Available tags</p>
                <p className="mt-2 text-3xl font-bold text-slate-900">{tags.length}</p>
              </div>
              <div className="rounded-[24px] border border-white/70 bg-white/80 p-5 shadow-[0_18px_42px_rgba(21,35,58,0.08)]">
                <p className="text-sm font-semibold text-slate-500">Following</p>
                <p className="mt-2 text-3xl font-bold text-slate-900">{followedTagIds.size}</p>
              </div>
              <div className="rounded-[24px] border border-white/70 bg-slate-900 p-5 text-white shadow-[0_18px_42px_rgba(21,35,58,0.16)]">
                <p className="text-sm font-semibold text-slate-300">Showing now</p>
                <p className="mt-2 text-3xl font-bold">{filteredTags.length}</p>
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-white/70 bg-white/78 p-4 shadow-[0_18px_42px_rgba(21,35,58,0.08)] backdrop-blur-xl">
            <div className="flex flex-col gap-4 lg:flex-row">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  placeholder="Search tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-full border border-slate-200 bg-white px-12 py-3.5 text-sm text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-[var(--color-brand)] focus:ring-4 focus:ring-[var(--color-brand-soft)]/80"
                />
              </div>

              <Button
                onClick={() => setIsAddTagModalOpen(true)}
                size="large"
                className="justify-center whitespace-nowrap"
              >
                <Plus size={18} />
                Add Tag
              </Button>
            </div>

            <p className="mt-4 px-2 text-sm text-slate-500">
              Search by topic name or create a new tag if the right one does not exist yet.
            </p>
          </div>
        </div>
      </section>

      {filteredTags.length === 0 ? (
        <div className="glass rounded-[32px] px-6 py-16 text-center sm:px-10">
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-[var(--color-brand-soft)] text-[var(--color-brand)]">
            <Hash size={40} />
          </div>
          <h2 className="font-brand text-3xl font-bold text-slate-900">
            {searchQuery ? 'No matching tags yet' : 'No tags created yet'}
          </h2>
          <p className="mx-auto mt-3 max-w-md text-slate-600">
            {searchQuery
              ? `We could not find any tag matching "${searchQuery}".`
              : 'Start the first topic and give people a place to ask and follow questions.'}
          </p>
          <div className="mt-6">
            <Button onClick={() => setIsAddTagModalOpen(true)}>
              <Plus size={18} />
              Create Tag
            </Button>
          </div>
        </div>
      ) : (
        <section className="space-y-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="font-brand text-2xl font-bold text-slate-900">Popular topics</h2>
              <p className="text-slate-600">Follow tags to tailor the questions and discussions you see next.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
            {filteredTags.map((tag) => {
              const isFollowed = followedTagIds.has(tag.id);
              const isBusy = following[tag.id];
              const isTrending = (tag.followerCount || 0) > 100 || (tag.questionCount || 0) > 50;

              return (
                <div
                  key={tag.id}
                  className="shell-surface rounded-[28px] p-5 transition-transform duration-300 hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(21,35,58,0.16)]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-brand-soft)] text-[var(--color-brand)]">
                      <Hash size={20} />
                    </div>
                    {isTrending ? (
                      <span className="rounded-full border border-amber-200/60 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                        Trending
                      </span>
                    ) : null}
                  </div>

                  <Link to={`/tags/${tag.id}`} className="mt-5 block">
                    <h3 className="text-2xl font-bold tracking-[-0.03em] text-slate-900 transition-colors hover:text-[var(--color-brand)]">
                      #{tag.name}
                    </h3>
                  </Link>

                  <p className="mt-3 min-h-[48px] text-sm leading-6 text-slate-600">
                    {tag.description || `Track questions, answers, and conversations related to ${tag.name}.`}
                  </p>

                  <div className="mt-5 flex items-center gap-2 text-sm text-slate-500">
                    <span>{tag.questionCount ?? 0} question{tag.questionCount !== 1 ? 's' : ''}</span>
                    <span>•</span>
                    <span>{tag.followerCount ?? 0} follower{tag.followerCount !== 1 ? 's' : ''}</span>
                  </div>

                  <div className="mt-5">
                    <Button
                      onClick={() => (isFollowed ? handleUnfollow(tag.id) : handleFollow(tag.id))}
                      disabled={isBusy}
                      variant={isFollowed ? 'secondary' : 'primary'}
                      className={`w-full justify-center ${isFollowed ? 'border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200' : ''}`}
                    >
                      {isBusy ? (
                        isFollowed ? 'Updating...' : 'Following...'
                      ) : isFollowed ? (
                        <>
                          <Check size={16} />
                          Unfollow
                        </>
                      ) : (
                        <>
                          <Plus size={16} />
                          Follow
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <AddTagModal
        isOpen={isAddTagModalOpen}
        onClose={() => setIsAddTagModalOpen(false)}
        onTagAdded={handleTagAdded}
      />
    </div>
  );
}
