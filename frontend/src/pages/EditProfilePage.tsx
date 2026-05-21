import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Camera, FileText, Globe, Image, IndianRupee, Lock, MapPin, Upload, User } from 'lucide-react';
import axiosInstance from '../config/api.ts';
import Loader from '../components/Loader.tsx';
import { setProfileData } from '../store/dataSlicer.ts';
import { updateUser } from '../features/auth/authSlice.ts';
import { getApiErrorMessage, getApiSuccessMessage, showErrorToast, showSuccessToast } from '../utils/notify.ts';

export default function EditProfilePage() {
  const { user } = useSelector((state: any) => state.auth);
  const { profileData } = useSelector((state: any) => state.data);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);
  const [selectedProfileImage, setSelectedProfileImage] = useState<File | null>(null);
  const [selectedCoverImage, setSelectedCoverImage] = useState<File | null>(null);
  const [profilePreview, setProfilePreview] = useState('');
  const [coverPreview, setCoverPreview] = useState('');
  const subscriptionCurrencyLabel = 'INR - Indian Rupee';
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    location: '',
    website: '',
    gender: '',
    dob: '',
    premiumCreatorEnabled: false,
    subscriptionPrice: '9.99',
    razorpayPaymentDetails: '',
  });

  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.id || profileData) {
        return;
      }

      try {
        setInitialLoading(true);
        const response = await axiosInstance.get(`/api/v1/users/profile/${user.id}`);
        dispatch(setProfileData(response.data.data));
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setInitialLoading(false);
      }
    };

    loadProfile();
  }, [dispatch, profileData, user]);

  useEffect(() => {
    if (!profileData) {
      return;
    }

    setFormData({
      name: profileData.name || '',
      bio: profileData.bio || '',
      location: profileData.location || '',
      website: profileData.website || '',
      gender: profileData.gender || '',
      dob: profileData.dob || '',
      premiumCreatorEnabled: Boolean(profileData.premiumCreatorEnabled),
      subscriptionPrice: String(profileData.subscriptionPrice || '9.99'),
      razorpayPaymentDetails: profileData.razorpayPaymentDetails || '',
    });

    setProfilePreview(
      profileData.profilePicture ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(profileData.name || 'User')}&background=07528f&color=fff&size=256`,
    );
    setCoverPreview(profileData.coverPicture || '');
    setSelectedProfileImage(null);
    setSelectedCoverImage(null);
  }, [profileData]);

  useEffect(() => {
    if (!selectedProfileImage) {
      return;
    }

    const objectUrl = URL.createObjectURL(selectedProfileImage);
    setProfilePreview(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [selectedProfileImage]);

  useEffect(() => {
    if (!selectedCoverImage) {
      return;
    }

    const objectUrl = URL.createObjectURL(selectedCoverImage);
    setCoverPreview(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [selectedCoverImage]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name } = e.target;
    const value =
      e.target instanceof HTMLInputElement && e.target.type === 'checkbox'
        ? e.target.checked
        : e.target.value;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }
    setSelectedProfileImage(file);
    e.target.value = '';
  };

  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }
    setSelectedCoverImage(file);
    e.target.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) {
      return;
    }

    try {
      setLoading(true);
      const payload = new FormData();
      payload.append('name', formData.name);
      payload.append('bio', formData.bio);
      payload.append('location', formData.location);
      payload.append('website', formData.website);
      payload.append('gender', formData.gender);
      if (formData.dob) {
        payload.append('dob', formData.dob);
      }
      payload.append('premiumCreatorEnabled', String(formData.premiumCreatorEnabled));
      payload.append('subscriptionPrice', formData.subscriptionPrice);
      payload.append('subscriptionCurrency', 'INR');
      payload.append('razorpayPaymentDetails', formData.razorpayPaymentDetails);
      if (selectedProfileImage) {
        payload.append('profileImage', selectedProfileImage);
      }
      if (selectedCoverImage) {
        payload.append('coverImage', selectedCoverImage);
      }

      const updateResponse = await axiosInstance.put(`/api/v1/users/profile/${user.id}`, payload, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const profileResponse = await axiosInstance.get(`/api/v1/users/profile/${user.id}`);
      const updatedProfile = profileResponse.data.data;
      dispatch(setProfileData(updatedProfile));
      dispatch(updateUser(updatedProfile));

      showSuccessToast(getApiSuccessMessage(updateResponse.data, 'Profile updated successfully'));
      navigate('/profile');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      showErrorToast(getApiErrorMessage(error, 'Failed to update profile'));
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading || !user) {
    return <Loader />;
  }

  return (
    <div className="mx-auto w-full max-w-[1500px]">
      <div className="mb-6">
        <Link
          to="/profile"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition-colors hover:text-[var(--color-brand)]"
        >
          <ArrowLeft size={16} />
          Back to profile
        </Link>
      </div>

      <div className="grid gap-8 xl:grid-cols-[0.92fr_1.35fr] xl:items-start">
        <section className="shell-surface rounded-[32px] p-6 sm:p-8 xl:sticky xl:top-28">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-accent)]">
            Edit Profile
          </p>
          <h1 className="font-brand text-4xl font-bold text-slate-900">Update your profile</h1>
          <p className="mt-3 max-w-xl text-slate-600">
            Shape how people see you on AskVerse with a stronger cover, avatar, and clearer personal details.
          </p>

          <div className="mt-8 space-y-6">
            <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white/80">
              <div className="h-40 overflow-hidden bg-[linear-gradient(120deg,#165d86_0%,#2d669f_42%,#b34e68_100%)]">
                {coverPreview ? (
                  <img
                    src={coverPreview}
                    alt="Cover preview"
                    className="h-full w-full object-cover"
                  />
                ) : null}
              </div>
              <div className="relative px-6 pb-6 pt-16">
                <div className="absolute -top-14 left-6 h-28 w-28 overflow-hidden rounded-full border-4 border-white bg-slate-100 shadow-[0_20px_40px_rgba(21,35,58,0.14)]">
                  <img
                    src={profilePreview}
                    alt={formData.name || 'Profile preview'}
                    className="h-full w-full object-cover"
                  />
                </div>
                <p className="text-xl font-bold text-slate-900">{formData.name || 'Your profile'}</p>
                <p className="mt-1 text-sm text-slate-500">
                  {formData.bio || 'Your short intro will appear here as you edit.'}
                </p>
              </div>
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-white/75 p-5">
              <p className="text-sm font-semibold text-slate-900">Quick guide</p>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
                <li>Upload a strong profile photo for better recognition.</li>
                <li>Use a wide cover image to make the page feel complete.</li>
                <li>Keep the bio short, clear, and topic-focused.</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="shell-surface rounded-[32px] p-6 sm:p-8 lg:p-10">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-[28px] border border-slate-200 bg-white/80 p-5">
                <label className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <Camera size={18} className="text-[#07528f]" />
                  Profile Image
                </label>
                <div className="flex flex-col gap-4 md:flex-row md:items-center">
                  <div className="h-24 w-24 overflow-hidden rounded-full border-4 border-white bg-slate-100 shadow-md">
                    <img
                      src={profilePreview}
                      alt={formData.name || 'Profile preview'}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div>
                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-[#165d86] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#124a6b]">
                      <Upload size={16} />
                      Upload new photo
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleProfileImageChange}
                        className="hidden"
                      />
                    </label>
                    <p className="mt-3 text-xs text-slate-500">
                      Choose an image file to replace your current avatar.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-[28px] border border-slate-200 bg-white/80 p-5">
                <label className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <Image size={18} className="text-[#07528f]" />
                  Cover Image
                </label>
                <div className="mb-4 overflow-hidden rounded-[24px] border border-slate-200 bg-slate-100">
                  {coverPreview ? (
                    <img
                      src={coverPreview}
                      alt="Cover preview"
                      className="h-36 w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-36 items-center justify-center bg-[linear-gradient(120deg,#165d86_0%,#2d669f_42%,#b34e68_100%)] text-sm font-semibold text-white/90">
                      No cover image selected
                    </div>
                  )}
                </div>
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800">
                  <Upload size={16} />
                  Upload cover image
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCoverImageChange}
                    className="hidden"
                  />
                </label>
                <p className="mt-3 text-xs text-slate-500">
                  Upload a cover image file or use the URL field below.
                </p>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="lg:col-span-2">
                <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <User size={18} className="text-[#07528f]" />
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 outline-none transition-all focus:border-transparent focus:ring-2 focus:ring-[#07528f]"
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div className="lg:col-span-2">
                <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <FileText size={18} className="text-[#07528f]" />
                  Bio
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows={4}
                  className="w-full resize-none rounded-2xl border border-gray-300 bg-white px-4 py-3 outline-none transition-all focus:border-transparent focus:ring-2 focus:ring-[#07528f]"
                  placeholder="Tell us about yourself..."
                />
              </div>

              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <MapPin size={18} className="text-[#07528f]" />
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 outline-none transition-all focus:border-transparent focus:ring-2 focus:ring-[#07528f]"
                  placeholder="City, Country"
                />
              </div>

              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <Globe size={18} className="text-[#07528f]" />
                  Website
                </label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 outline-none transition-all focus:border-transparent focus:ring-2 focus:ring-[#07528f]"
                  placeholder="https://yourwebsite.com"
                />
              </div>

              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <User size={18} className="text-[#07528f]" />
                  Gender
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 outline-none transition-all focus:border-transparent focus:ring-2 focus:ring-[#07528f]"
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>

              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <Calendar size={18} className="text-[#07528f]" />
                  Date of Birth
                </label>
                <input
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 outline-none transition-all focus:border-transparent focus:ring-2 focus:ring-[#07528f]"
                />
              </div>


              <div className="lg:col-span-2 rounded-[28px] border border-amber-200 bg-amber-50/70 p-5">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                  <div className="max-w-2xl">
                    <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-900">
                      <Lock size={18} className="text-amber-700" />
                      Creator subscriptions
                    </div>
                    <p className="text-sm leading-7 text-slate-600">
                      Enable this to publish premium posts that only paying subscribers can unlock, alongside your public Q&A content.
                    </p>
                  </div>

                  <label className="inline-flex items-center gap-3 rounded-full border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800">
                    <input
                      type="checkbox"
                      name="premiumCreatorEnabled"
                      checked={formData.premiumCreatorEnabled}
                      onChange={handleChange}
                      className="h-4 w-4 rounded border-slate-300 text-[#165d86] focus:ring-[#165d86]"
                    />
                    Enable premium creator mode
                  </label>
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700">
                      <IndianRupee size={18} className="text-[#07528f]" />
                      Monthly subscription price
                    </label>
                    <input
                      type="number"
                      min="1"
                      step="0.01"
                      name="subscriptionPrice"
                      value={formData.subscriptionPrice}
                      onChange={handleChange}
                      className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 outline-none transition-all focus:border-transparent focus:ring-2 focus:ring-[#07528f]"
                      placeholder="9.99"
                    />
                  </div>

                  <div>
                    <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700">
                      <Globe size={18} className="text-[#07528f]" />
                      Billing currency
                    </label>
                    <div className="w-full rounded-2xl border border-gray-300 bg-gray-50 px-4 py-3 text-gray-700 font-medium">
                      {subscriptionCurrencyLabel}
                    </div>
                  </div>

                  {formData.premiumCreatorEnabled && (
                    <div className="md:col-span-2 mt-4 pt-4 border-t border-amber-200/60">
                      <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700">
                        <IndianRupee size={18} className="text-[#07528f]" />
                        Razorpay Payout UPI ID (VPA) / Account ID
                      </label>
                      <input
                        type="text"
                        name="razorpayPaymentDetails"
                        value={formData.razorpayPaymentDetails}
                        onChange={handleChange}
                        className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 outline-none transition-all focus:border-transparent focus:ring-2 focus:ring-[#07528f]"
                        placeholder="e.g. user@okaxis or acc_xxxxx"
                        required={formData.premiumCreatorEnabled}
                      />
                      <p className="mt-1.5 text-xs text-amber-700/80">
                        Required to receive subscription payouts from the administrator.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 border-t border-slate-200 pt-6 sm:flex-row">
              <button
                type="button"
                onClick={() => navigate('/profile')}
                className="flex-1 rounded-full border border-slate-300 px-6 py-3 font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 rounded-full bg-[#165d86] px-6 py-3 font-semibold text-white transition-colors hover:bg-[#124a6b] disabled:cursor-not-allowed disabled:opacity-50"
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
