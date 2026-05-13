import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  BadgeDollarSign,
  Calendar,
  Camera,
  Edit3,
  FileText,
  Globe,
  Lock,
  MapPin,
  MessageSquare,
  Settings,
  Sparkles,
  Tag,
  UserRound,
} from 'lucide-react';
import Loader from '../components/Loader.tsx';
import axiosInstance from '../config/api.ts';
import { setProfileData } from '../store/dataSlicer.ts';
import { updateUser } from '../features/auth/authSlice.ts';

export default function ProfilePage() {
  const { user } = useSelector((state: any) => state.auth);
  const { profileData } = useSelector((state: any) => state.data);
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [activeTab, setActiveTab] = useState('about');
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const profileImageUrl =
    profileData?.profilePicture ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(profileData?.name || 'User')}&background=07528f&color=fff&size=256`;
  const coverImageUrl = profileData?.coverPicture || null;

  const getUserProfile = async () => {
    try {
      setLoading(true);
      const userId = user?.id;
      const response = await axiosInstance.get(`/api/v1/users/profile/${userId}`);
      dispatch(setProfileData(response.data.data));
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditProfile = () => {
    navigate('/profile/edit');
  };

  const handleProfileImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user?.id) {
      return;
    }

    try {
      setUploadingAvatar(true);
      const payload = new FormData();
      payload.append('profileImage', file);

      await axiosInstance.put(`/api/v1/users/profile/${user.id}`, payload, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const profileResponse = await axiosInstance.get(`/api/v1/users/profile/${user.id}`);
      const updatedProfile = profileResponse.data.data;
      dispatch(setProfileData(updatedProfile));
      dispatch(updateUser(updatedProfile));
    } catch (error: any) {
      console.error('Error uploading profile image:', error);
      alert(error.response?.data?.message || 'Failed to upload profile image');
    } finally {
      setUploadingAvatar(false);
      event.target.value = '';
    }
  };

  const handleCoverImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user?.id) {
      return;
    }

    try {
      setUploadingCover(true);
      const payload = new FormData();
      payload.append('coverImage', file);

      await axiosInstance.put(`/api/v1/users/profile/${user.id}`, payload, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const profileResponse = await axiosInstance.get(`/api/v1/users/profile/${user.id}`);
      const updatedProfile = profileResponse.data.data;
      dispatch(setProfileData(updatedProfile));
      dispatch(updateUser(updatedProfile));
    } catch (error: any) {
      console.error('Error uploading cover image:', error);
      alert(error.response?.data?.message || 'Failed to upload cover image');
    } finally {
      setUploadingCover(false);
      event.target.value = '';
    }
  };

  useEffect(() => {
    if (user?.id && !profileData) {
      getUserProfile();
    }
  }, [user]);

  const joinedLabel = useMemo(() => {
    if (!profileData?.createdAt) {
      return 'Recently joined';
    }

    const parsed = new Date(profileData.createdAt);
    if (Number.isNaN(parsed.getTime())) {
      return String(profileData.createdAt);
    }

    return parsed.toLocaleDateString(undefined, {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  }, [profileData?.createdAt]);

  const statCards = [
    { label: 'Questions', value: profileData?.questionsCount || 0, tone: 'bg-[#165d86]/10 text-[#165d86]' },
    { label: 'Answers', value: profileData?.answersCount || 0, tone: 'bg-emerald-500/10 text-emerald-700' },
    { label: 'Comments', value: profileData?.commentsCount || 0, tone: 'bg-amber-500/10 text-amber-700' },
    { label: 'Subscribers', value: profileData?.activeSubscriberCount || 0, tone: 'bg-[var(--color-accent)]/10 text-[var(--color-accent)]' },
  ];

  if (loading) return <Loader />;

  return (
    <div className="space-y-8 pb-12">
      <section className="shell-surface overflow-hidden rounded-[36px]">
        <div className="relative h-56 overflow-hidden md:h-72">
          {coverImageUrl ? (
            <img
              src={coverImageUrl}
              alt={`${profileData?.name || 'User'} cover`}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full bg-[linear-gradient(120deg,#0f4f73_0%,#1b6b96_36%,#b34e68_100%)]" />
          )}
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(12,25,38,0.04),rgba(12,25,38,0.38))]" />

          <div className="absolute right-4 top-4 flex items-center gap-3 sm:right-6">
            {uploadingCover ? (
              <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-[#165d86] shadow-sm">
                Uploading cover...
              </span>
            ) : null}
            <label
              htmlFor="profile-cover-upload"
              className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/60 bg-white/88 px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm transition-colors hover:bg-white"
            >
              <Camera size={16} />
              Change cover
            </label>
            <input
              id="profile-cover-upload"
              type="file"
              accept="image/*"
              onChange={handleCoverImageUpload}
              className="hidden"
            />
          </div>
        </div>

        <div className="px-5 pb-6 sm:px-8 lg:px-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="-mt-16 flex flex-col gap-5 sm:-mt-20 md:flex-row md:items-end">
              <div className="relative">
                <div className="h-32 w-32 overflow-hidden rounded-full border-4 border-white bg-white shadow-[0_24px_50px_rgba(21,35,58,0.18)] md:h-40 md:w-40">
                  <img
                    src={profileImageUrl}
                    alt={profileData?.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <label
                  htmlFor="profile-avatar-upload"
                  className="absolute bottom-2 right-2 cursor-pointer rounded-full border border-white bg-white p-2.5 text-slate-700 shadow-md transition-colors hover:bg-slate-50"
                  title="Upload profile photo"
                >
                  <Edit3 size={16} />
                </label>
                <input
                  id="profile-avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleProfileImageUpload}
                  className="hidden"
                />
                {uploadingAvatar ? (
                  <div className="absolute inset-x-0 -bottom-8 text-center text-xs font-semibold text-[#165d86]">
                    Uploading photo...
                  </div>
                ) : null}
              </div>

              <div className="max-w-2xl">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/86 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-accent)]">
                  <UserRound size={14} />
                  Public profile
                </div>
                <h1 className="font-brand text-3xl font-bold text-slate-900 md:text-4xl">
                  {profileData?.name || 'Your profile'}
                </h1>
                <p className="mt-2 text-lg font-medium text-slate-500">@{profileData?.username}</p>
                <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-slate-600">
                  <span className="inline-flex items-center gap-2">
                    <MapPin size={16} />
                    {profileData?.location || 'Location not added'}
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <Calendar size={16} />
                    Joined {joinedLabel}
                  </span>
                  {profileData?.website ? (
                    <span className="inline-flex items-center gap-2">
                      <Globe size={16} />
                      <a
                        href={profileData.website}
                        target="_blank"
                        rel="noreferrer"
                        className="font-medium text-[#165d86] hover:underline"
                      >
                        {profileData.website}
                      </a>
                    </span>
                  ) : null}
                </div>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                  {profileData?.bio || 'Add a short bio to tell people what you like to ask, answer, and explore on AskVerse.'}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                onClick={handleEditProfile}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#165d86] px-6 py-3 font-semibold text-white shadow-[0_18px_36px_rgba(22,93,134,0.20)] transition-all hover:-translate-y-0.5 hover:bg-[#124a6b]"
              >
                <Edit3 size={18} />
                Edit Profile
              </button>
              <button className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700 transition-colors hover:bg-slate-50">
                <Settings size={18} />
                Settings
              </button>
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {statCards.map((stat) => (
              <div
                key={stat.label}
                className="rounded-[24px] border border-white/70 bg-white/82 p-5 shadow-[0_18px_40px_rgba(21,35,58,0.08)]"
              >
                <div className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${stat.tone}`}>
                  {stat.label}
                </div>
                <p className="mt-4 text-3xl font-bold text-slate-900">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="grid gap-8 xl:grid-cols-[1.65fr_0.8fr]">
        <section className="shell-surface overflow-hidden rounded-[32px]">
          <div className="border-b border-slate-200/80 px-3 py-3 sm:px-5">
            <div className="flex flex-wrap gap-2">
              {['About', 'Questions', 'Answers', 'Activity'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab.toLowerCase())}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                    activeTab === tab.toLowerCase()
                      ? 'bg-slate-900 text-white shadow-[0_14px_28px_rgba(21,35,58,0.16)]'
                      : 'text-slate-500 hover:bg-white hover:text-slate-900'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6 sm:p-8">
            {activeTab === 'about' && (
              <div className="space-y-8">
                <div className="rounded-[24px] border border-slate-200 bg-white/75 p-6">
                  <h3 className="font-brand text-2xl font-bold text-slate-900">About</h3>
                  <p className="mt-3 leading-7 text-slate-600">
                    {profileData?.bio || 'No bio added yet. This is where a strong intro helps people understand what topics you care about.'}
                  </p>
                </div>

                <div className="rounded-[24px] border border-slate-200 bg-white/75 p-6">
                  <h3 className="font-brand text-2xl font-bold text-slate-900">Skills & Interests</h3>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {profileData?.skills && profileData.skills.length > 0 ? (
                      profileData.skills.map((skill: any) => (
                        <span
                          key={skill}
                          className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-medium text-slate-700"
                        >
                          {skill}
                        </span>
                      ))
                    ) : (
                      <p className="text-sm italic text-slate-500">No skills added yet.</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'questions' && (
              <div className="space-y-4">
                {profileData?.questions && profileData.questions.length > 0 ? (
                  profileData.questions.map((question: any) => (
                    <div
                      key={question.id}
                      className="rounded-[24px] border border-slate-200 bg-white/75 p-5 transition-all hover:-translate-y-0.5 hover:shadow-[0_20px_36px_rgba(21,35,58,0.08)]"
                    >
                      <h4 className="text-xl font-semibold text-slate-900">{question.title}</h4>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        {question.premiumContent ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                            <Lock size={12} />
                            Premium
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                            <Sparkles size={12} />
                            Public
                          </span>
                        )}
                      </div>
                      <p className="mt-2 line-clamp-2 text-sm leading-7 text-slate-600">{question.content}</p>
                      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex flex-wrap gap-2">
                          {question.tags?.map((tag: any) => (
                            <span
                              key={tag.id ?? tag}
                              className="rounded-full bg-[#165d86]/10 px-3 py-1 text-xs font-semibold text-[#165d86]"
                            >
                              #{tag.name ?? tag}
                            </span>
                          ))}
                        </div>
                        <span className="text-xs font-medium text-slate-500">
                          {question.createdAt ? new Date(question.createdAt).toLocaleDateString() : 'Just now'}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex h-64 flex-col items-center justify-center text-slate-400">
                    <MessageSquare size={48} className="mb-4 opacity-50" />
                    <p>No questions posted yet.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'answers' && (
              <div className="space-y-4">
                {profileData?.answers && profileData.answers.length > 0 ? (
                  profileData.answers.map((answer: any) => (
                    <div
                      key={answer.id}
                      className="rounded-[24px] border border-slate-200 bg-white/75 p-5 transition-all hover:-translate-y-0.5 hover:shadow-[0_20px_36px_rgba(21,35,58,0.08)]"
                    >
                      <p className="leading-7 text-slate-700">{answer.content}</p>
                      <div className="mt-4 flex items-center justify-between gap-3 text-sm">
                        <span className="text-slate-500">
                          On: <span className="font-medium text-slate-700">{answer.question?.title}</span>
                        </span>
                        <span className="text-xs font-medium text-slate-500">
                          {answer.createdAt ? new Date(answer.createdAt).toLocaleDateString() : 'Just now'}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex h-64 flex-col items-center justify-center text-slate-400">
                    <FileText size={48} className="mb-4 opacity-50" />
                    <p>No answers posted yet.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'activity' && (
              <div className="space-y-4">
                {profileData?.comments && profileData.comments.length > 0 ? (
                  profileData.comments.map((comment: any) => (
                    <div
                      key={comment.id}
                      className="rounded-[24px] border border-slate-200 bg-white/75 p-5 transition-all hover:-translate-y-0.5 hover:shadow-[0_20px_36px_rgba(21,35,58,0.08)]"
                    >
                      <p className="text-slate-700">{comment.content}</p>
                      <span className="mt-3 inline-block text-xs font-medium text-slate-500">
                        {comment.createdAt ? new Date(comment.createdAt).toLocaleDateString() : 'Just now'}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="flex h-64 flex-col items-center justify-center text-slate-400">
                    <Activity size={48} className="mb-4 opacity-50" />
                    <p>No activity to show yet.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        <aside className="space-y-6">
          <div className="shell-surface rounded-[32px] p-6">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="font-brand text-2xl font-bold text-slate-900">Creator Plan</h3>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  profileData?.premiumCreatorEnabled
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-slate-200 text-slate-600'
                }`}
              >
                {profileData?.premiumCreatorEnabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>

            <div className="space-y-4 text-sm text-slate-600">
              <div className="rounded-[20px] border border-slate-200 bg-white/75 p-4">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                  <BadgeDollarSign size={14} />
                  Monthly price
                </div>
                <p className="mt-2 font-medium text-slate-800">
                  {profileData?.subscriptionCurrency || 'USD'} {profileData?.subscriptionPrice || '9.99'}
                </p>
              </div>
              <div className="rounded-[20px] border border-slate-200 bg-white/75 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Active subscribers</p>
                <p className="mt-2 font-medium text-slate-800">{profileData?.activeSubscriberCount || 0}</p>
              </div>
              <p className="text-sm leading-6 text-slate-600">
                Premium posts let you publish subscriber-only content while keeping your public questions, answers, and comments open to the community.
              </p>
            </div>
          </div>

          <div className="shell-surface rounded-[32px] p-6">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="font-brand text-2xl font-bold text-slate-900">Profile Details</h3>
              <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
                @{profileData?.username}
              </span>
            </div>

            <div className="space-y-4 text-sm text-slate-600">
              <div className="rounded-[20px] border border-slate-200 bg-white/75 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Location</p>
                <p className="mt-2 font-medium text-slate-800">{profileData?.location || 'Not specified'}</p>
              </div>
              <div className="rounded-[20px] border border-slate-200 bg-white/75 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Website</p>
                <p className="mt-2 break-all font-medium text-slate-800">{profileData?.website || 'Not added'}</p>
              </div>
              <div className="rounded-[20px] border border-slate-200 bg-white/75 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Gender</p>
                <p className="mt-2 font-medium text-slate-800">{profileData?.gender || 'Not specified'}</p>
              </div>
            </div>
          </div>

          <div className="shell-surface rounded-[32px] p-6">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="font-brand text-2xl font-bold text-slate-900">Followed Tags</h3>
              <span className="rounded-full bg-[#165d86]/10 px-3 py-1 text-xs font-semibold text-[#165d86]">
                {profileData?.followedTags?.length || 0}
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {profileData?.followedTags?.length > 0 ? (
                profileData.followedTags.map((tag: any) => (
                  <div
                    key={tag.id}
                    className="group flex items-center gap-2 rounded-full border border-slate-200 bg-white/78 px-3 py-2 transition-all hover:border-[#165d86]/20 hover:bg-[#165d86]/6"
                  >
                    <Tag size={14} className="text-slate-400 group-hover:text-[#165d86]" />
                    <span className="text-sm font-medium text-slate-700 group-hover:text-[#165d86]">
                      {tag.name}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm italic text-slate-500">No tags followed yet.</p>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
