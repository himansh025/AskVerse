import { useState, useEffect } from 'react';
import { X, User, MapPin, Globe, Calendar, FileText, Image, Camera, Upload } from 'lucide-react';
import axiosInstance from '../config/api';
import { useDispatch } from 'react-redux';
import { setProfileData } from '../store/dataSlicer';
import { updateUser } from '../features/auth/authSlice.ts';

interface EditProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    profileData: any;
    userId: number;
}

const EditProfileModal = ({ isOpen, onClose, profileData, userId }: EditProfileModalProps) => {
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);
    const [selectedProfileImage, setSelectedProfileImage] = useState<File | null>(null);
    const [profilePreview, setProfilePreview] = useState('');
    const [selectedCoverImage, setSelectedCoverImage] = useState<File | null>(null);
    const [coverPreview, setCoverPreview] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        bio: '',
        location: '',
        website: '',
        gender: '',
        dob: ''
    });

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
            dob: profileData.dob || ''
        });
        setProfilePreview(
            profileData.profilePicture ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(profileData.name || 'User')}&background=07528f&color=fff&size=256`
        );
        setSelectedProfileImage(null);
        setCoverPreview(profileData.coverPicture || '');
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
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setSelectedProfileImage(file);
        e.target.value = '';
    };

    const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setSelectedCoverImage(file);
        e.target.value = '';
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

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
            if (selectedProfileImage) {
                payload.append('profileImage', selectedProfileImage);
            }
            if (selectedCoverImage) {
                payload.append('coverImage', selectedCoverImage);
            }

            const response = await axiosInstance.put(`/api/v1/users/profile/${userId}`, payload, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response) {
                // Fetch updated profile data
                const profileResponse = await axiosInstance.get(`/api/v1/users/profile/${userId}`);
                dispatch(setProfileData(profileResponse.data.data));
                dispatch(updateUser(profileResponse.data.data));

                // Show success message
                alert('Profile updated successfully!');
                onClose();
            }
        } catch (error: any) {
            console.error('Error updating profile:', error);
            alert(error.response?.data?.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
                    <h2 className="text-2xl font-bold text-gray-900">Edit Profile</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div>
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                            <Camera size={18} className="text-[#07528f]" />
                            Profile Image
                        </label>
                        <div className="flex flex-col gap-4 md:flex-row md:items-center">
                            <div className="h-24 w-24 overflow-hidden rounded-full border-4 border-white bg-gray-100 shadow-md">
                                <img
                                    src={profilePreview}
                                    alt={formData.name || 'Profile preview'}
                                    className="h-full w-full object-cover"
                                />
                            </div>
                            <label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-[#07528f] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#064070]">
                                <Upload size={16} />
                                Upload new photo
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleProfileImageChange}
                                    className="hidden"
                                />
                            </label>
                        </div>
                        <p className="mt-2 text-xs text-gray-500">
                            Upload an image file. It will be stored in Cloudinary and used across your profile and navbar.
                        </p>
                    </div>

                    {/* Name */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                            <User size={18} className="text-[#07528f]" />
                            Full Name
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#07528f] focus:border-transparent transition-all outline-none"
                            placeholder="Enter your full name"
                            required
                        />
                    </div>

                    {/* Bio */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                            <FileText size={18} className="text-[#07528f]" />
                            Bio
                        </label>
                        <textarea
                            name="bio"
                            value={formData.bio}
                            onChange={handleChange}
                            rows={4}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#07528f] focus:border-transparent transition-all outline-none resize-none"
                            placeholder="Tell us about yourself..."
                        />
                        <p className="text-xs text-gray-500 mt-1">{formData.bio.length}/500 characters</p>
                    </div>

                    {/* Location */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                            <MapPin size={18} className="text-[#07528f]" />
                            Location
                        </label>
                        <input
                            type="text"
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#07528f] focus:border-transparent transition-all outline-none"
                            placeholder="City, Country"
                        />
                    </div>

                    {/* Website */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                            <Globe size={18} className="text-[#07528f]" />
                            Website
                        </label>
                        <input
                            type="url"
                            name="website"
                            value={formData.website}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#07528f] focus:border-transparent transition-all outline-none"
                            placeholder="https://yourwebsite.com"
                        />
                    </div>

                    {/* Gender and DOB Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Gender */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                <User size={18} className="text-[#07528f]" />
                                Gender
                            </label>
                            <select
                                name="gender"
                                value={formData.gender}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#07528f] focus:border-transparent transition-all outline-none bg-white"
                            >
                                <option value="">Select gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                                <option value="Prefer not to say">Prefer not to say</option>
                            </select>
                        </div>

                        {/* Date of Birth */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                <Calendar size={18} className="text-[#07528f]" />
                                Date of Birth
                            </label>
                            <input
                                type="date"
                                name="dob"
                                value={formData.dob}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#07528f] focus:border-transparent transition-all outline-none"
                            />
                        </div>
                    </div>

                    {/* Cover Picture */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                            <Image size={18} className="text-[#07528f]" />
                            Cover Picture
                        </label>
                        <div className="flex flex-col gap-4">
                            {coverPreview && (
                                <div className="h-24 w-full overflow-hidden rounded-lg border-4 border-white bg-gray-100 shadow-md">
                                    <img
                                        src={coverPreview}
                                        alt="Cover preview"
                                        className="h-full w-full object-cover"
                                    />
                                </div>
                            )}
                            <label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-[#07528f] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#064070]">
                                <Upload size={16} />
                                Upload new cover
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleCoverImageChange}
                                    className="hidden"
                                />
                            </label>
                        </div>
                        <p className="mt-2 text-xs text-gray-500">
                            Upload a cover image file. It will be stored in Cloudinary.
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-6 py-3 bg-[#07528f] text-white rounded-lg font-medium hover:bg-[#064070] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={loading}
                        >
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditProfileModal;
