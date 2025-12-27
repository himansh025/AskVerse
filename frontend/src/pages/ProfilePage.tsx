import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  MapPin,
  Calendar,
  Edit3,
  MessageSquare,
  Users,
  Activity,
  FileText,
  Tag,
  Settings
} from 'lucide-react';
import Loader from '../components/Loader.tsx';
import axiosInstance from '../config/api.ts';

export default function ProfilePage() {
  const { user } = useSelector((state: any) => state.auth);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('about');

  const getUserProfile = async () => {

    try {
      const userId = user?.id;

      const response = await axiosInstance.get(`/api/v1/users/profile/${userId}`);
      setProfile(response.data.data); // Access the nested data property
      // console.log("response", response.data)
      setLoading(false);
    } catch (error) {
      // console.log(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setLoading(true);
    if (user?.id) {
      getUserProfile();
    }
  }, [user]);

  if (loading) return <Loader />;

  const stats = [
    { label: 'Questions', value: 12, icon: <MessageSquare size={18} /> },
    { label: 'Answers', value: 48, icon: <FileText size={18} /> },
    { label: 'Followers', value: 156, icon: <Users size={18} /> },
    { label: 'Following', value: 89, icon: <Activity size={18} /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Cover Photo */}
      <div className="h-48 md:h-64 w-full bg-gradient-to-r from-[#07528f] to-[#8f0752] relative">
        <div className="absolute bottom-4 right-4">
          <button className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-white/30 transition-all flex items-center gap-2">
            <Edit3 size={16} /> Edit Cover
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative -mt-20 mb-8">
          <div className="flex flex-col md:flex-row items-end gap-6">
            {/* Profile Picture */}
            <div className="relative">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white bg-white shadow-lg overflow-hidden">
                <img
                  src={`https://ui-avatars.com/api/?name=${profile?.name}&background=07528f&color=fff&size=256`}
                  alt={profile?.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <button className="absolute bottom-2 right-2 bg-white text-gray-700 p-2 rounded-full shadow-md hover:bg-gray-50 transition-colors border border-gray-200">
                <Edit3 size={16} />
              </button>
            </div>

            {/* Profile Info */}
            <div className="flex-1 pb-2 text-center md:text-left">
              <h1 className="text-3xl font-bold text-gray-900">{profile?.name}</h1>
              <p className="text-gray-600 font-medium">@{profile?.username}</p>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-2 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <MapPin size={16} /> San Francisco, CA
                </span>
                <span className="flex items-center gap-1">
                  <Calendar size={16} /> Joined December 2025
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mb-4 md:mb-2">
              <button className="bg-[#07528f] text-white px-6 py-2.5 rounded-full font-medium hover:bg-[#064070] transition-colors shadow-sm flex items-center gap-2">
                <Edit3 size={18} /> Edit Profile
              </button>
              <button className="bg-white text-gray-700 px-4 py-2.5 rounded-full font-medium hover:bg-gray-50 transition-colors border border-gray-300 shadow-sm">
                <Settings size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-1 text-[#07528f]">
                {stat.icon}
                <span className="text-sm font-medium text-gray-500">{stat.label}</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Tabs */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden min-h-[400px]">
              <div className="flex border-b border-gray-200">
                {['About', 'Questions', 'Answers', 'Activity'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab.toLowerCase())}
                    className={`flex-1 py-4 text-sm font-medium text-center transition-colors relative ${activeTab === tab.toLowerCase()
                      ? 'text-[#07528f]'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                      }`}
                  >
                    {tab}
                    {activeTab === tab.toLowerCase() && (
                      <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#07528f]" />
                    )}
                  </button>
                ))}
              </div>

              <div className="p-6">
                {activeTab === 'about' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Bio</h3>
                      <p className="text-gray-600 leading-relaxed">
                        Passionate developer and curious learner. I love exploring new technologies and sharing knowledge with the community.
                        Currently working on building the next generation of social Q&A platforms.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Skills & Interests</h3>
                      <div className="flex flex-wrap gap-2">
                        {['React', 'TypeScript', 'Java', 'Spring Boot', 'System Design', 'UI/UX'].map((skill) => (
                          <span key={skill} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-lg text-sm font-medium">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab !== 'about' && (
                  <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                    <Activity size={48} className="mb-4 opacity-50" />
                    <p>No {activeTab} to show yet.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar - Followed Tags */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-24">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Followed Tags</h3>
                <span className="bg-[#07528f]/10 text-[#07528f] text-xs font-bold px-2 py-1 rounded-full">
                  {profile?.followedTags?.length || 0}
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {profile?.followedTags?.length > 0 ? (
                  profile?.followedTags?.map((tag: any) => (
                    <div key={tag.id} className="group flex items-center gap-2 bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-200 px-3 py-1.5 rounded-full transition-all cursor-pointer">
                      <Tag size={14} className="text-gray-400 group-hover:text-[#07528f]" />
                      <span className="text-sm text-gray-700 group-hover:text-[#07528f] font-medium">
                        {tag.name}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm italic">No tags followed yet.</p>
                )}
              </div>

              <button className="w-full mt-6 text-[#07528f] text-sm font-medium hover:underline flex items-center justify-center gap-1">
                View all tags
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}