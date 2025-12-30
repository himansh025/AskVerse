import { useState, useEffect } from 'react';
import { X, User, MapPin, Globe, Calendar, FileText, Image, Camera } from 'lucide-react';
import axiosInstance from '../config/api';
import { useDispatch } from 'react-redux';
import { setProfileData } from '../store/dataSlicer';

interface EditProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    profileData: any;
    userId: number;
}

const EditProfileModal = ({ isOpen, onClose, profileData, userId }: EditProfileModalProps) => {
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        bio: '',
        location: '',
        website: '',
        gender: '',
        dob: '',
        profilePicture: '',
        coverPicture: ''
    });

    useEffect(() => {
        if (profileData) {
            setFormData({
                name: profileData.name || '',
                bio: profileData.bio || '',
                location: profileData.location || '',
                website: profileData.website || '',
                gender: profileData.gender || '',
                dob: profileData.dob || '',
                profilePicture: profileData.profilePicture || '',
                coverPicture: profileData.coverPicture || ''
            });
        }
    }, [profileData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            setLoading(true);
            const response = await axiosInstance.put(`/api/v1/users/profile/${userId}`, formData);

            if (response) {
                // Fetch updated profile data
                const profileResponse = await axiosInstance.get(`/api/v1/users/profile/${userId}`);
                dispatch(setProfileData(profileResponse.data.data));

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

                    {/* Profile Picture URL */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                            <Camera size={18} className="text-[#07528f]" />
                            Profile Picture URL
                        </label>
                        <input
                            type="url"
                            name="profilePicture"
                            value={formData.profilePicture}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#07528f] focus:border-transparent transition-all outline-none"
                            placeholder="https://example.com/profile.jpg"
                        />
                    </div>

                    {/* Cover Picture URL */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                            <Image size={18} className="text-[#07528f]" />
                            Cover Picture URL
                        </label>
                        <input
                            type="url"
                            name="coverPicture"
                            value={formData.coverPicture}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#07528f] focus:border-transparent transition-all outline-none"
                            placeholder="https://example.com/cover.jpg"
                        />
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
