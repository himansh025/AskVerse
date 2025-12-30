import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  MapPin,
  Calendar,
  Edit3,
  MessageSquare,
  Activity,
  FileText,
  Tag,
  Settings
} from 'lucide-react';
import Loader from '../components/Loader.tsx';
import axiosInstance from '../config/api.ts';
import { setProfileData } from '../store/dataSlicer.ts';
import EditProfileModal from '../components/EditProfileModal.tsx';

export default function ProfilePage() {
  const { user } = useSelector((state: any) => state.auth);
  const { profileData } = useSelector((state: any) => state.data);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('about');
  const dispatch = useDispatch();
  const [updateModel, setUpdateModel] = useState(false)

  const getUserProfile = async () => {

    try {
      setLoading(true)
      const userId = user?.id;
      const response = await axiosInstance.get(`/api/v1/users/profile/${userId}`);
      dispatch(setProfileData(response.data.data));
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }


  const handleEditProfile = () => {
    setUpdateModel(true);
  }

  const handleCloseModal = () => {
    setUpdateModel(false);
  }

  useEffect(() => {
    if (user?.id && !profileData) {
      getUserProfile();
    }

  }, [user]);

  if (loading) return <Loader />;


  return (
    <>
      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={updateModel}
        onClose={handleCloseModal}
        profileData={profileData}
        userId={user?.id}
      />

      <div className="min-h-screen bg-gray-50 pb-12">
        {/* Cover Photo */}
        <div className="h-48 md:h-64 w-full bg-gradient-to-r from-[#07528f] to-[#8f0752] relative">
          <div className="absolute bottom-4 right-4">
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative -mt-20 mb-8">
            <div className="flex flex-col md:flex-row items-end gap-6">
              {/* Profile Picture */}
              <div className="relative">
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white bg-white shadow-lg overflow-hidden">
                  <img
                    src={profileData?.profile ||`https://ui-avatars.com/api/?name=${profileData?.name}&background=07528f&color=fff&size=256`}
                    alt={profileData?.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <button className="absolute bottom-2 right-2 bg-white text-gray-700 p-2 rounded-full shadow-md hover:bg-gray-50 transition-colors border border-gray-200">
                  <Edit3 size={16} />
                </button>
              </div>

              {/* Profile Info */}
              <div className="flex-1 pb-2 text-center mt-10 md:text-left">
                <h1 className="text-3xl font-bold text-gray-900">{profileData?.name}</h1>
                <p className="text-gray-600 font-medium mt-2">@{profileData?.username}</p>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-2 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <MapPin size={16} /> {profileData?.location || "Not specified"}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar size={16} /> Joined {profileData?.createdAt || "Not specified"}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mb-4 md:mb-2">
                <button onClick={() => { handleEditProfile() }} className="bg-[#07528f] text-white px-6 py-2.5 rounded-full font-medium hover:bg-[#064070] transition-colors shadow-sm flex items-center gap-2">
                  <Edit3 size={18} /> Edit Profile
                </button>
                <button className="bg-white text-gray-700 px-4 py-2.5 rounded-full font-medium hover:bg-gray-50 transition-colors border border-gray-300 shadow-sm">
                  <Settings size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          {/* <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-1 text-[#07528f]">
                {stat.icon}
                <span className="text-sm font-medium text-gray-500">{stat.label}</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{profileData?.state}</p>
            </div>
          ))}
        </div> */}

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
                          {profileData?.bio || "No bio added yet."}
                        </p>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Skills & Interests</h3>
                        <div className="flex flex-wrap gap-2">
                          {profileData?.skills && profileData.skills.length > 0 ? (
                            profileData.skills.map((skill: any) => (
                              <span key={skill} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-lg text-sm font-medium">
                                {skill}
                              </span>
                            ))
                          ) : (
                            <p className="text-gray-500 text-sm italic">No skills added yet.</p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <p className="text-sm text-gray-600">Questions</p>
                          <p className="text-2xl font-bold text-[#07528f]">{profileData?.questionsCount || 0}</p>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg">
                          <p className="text-sm text-gray-600">Answers</p>
                          <p className="text-2xl font-bold text-green-600">{profileData?.answersCount || 0}</p>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-lg">
                          <p className="text-sm text-gray-600">Comments</p>
                          <p className="text-2xl font-bold text-purple-600">{profileData?.commentsCount || 0}</p>
                        </div>
                        <div className="bg-orange-50 p-4 rounded-lg">
                          <p className="text-sm text-gray-600">Followed Tags</p>
                          <p className="text-2xl font-bold text-orange-600">{profileData?.followedTags?.length || 0}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'questions' && (
                    <div className="space-y-4">
                      {profileData?.questions && profileData.questions.length > 0 ? (
                        profileData.questions.map((question: any) => (
                          <div key={question.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                            <h4 className="text-lg font-semibold text-gray-900 mb-2">{question.title}</h4>
                            <p className="text-gray-600 text-sm mb-3 line-clamp-2">{question.content}</p>
                            <div className="flex items-center justify-between">
                              <div className="flex flex-wrap gap-2">
                                {question.tags?.map((tag: any) => (
                                  <span key={tag.id} className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">
                                    {tag.name}
                                  </span>
                                ))}
                              </div>
                              <span className="text-xs text-gray-500">
                                {new Date(question.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="flex flex-col items-center justify-center h-64 text-gray-400">
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
                          <div key={answer.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                            <p className="text-gray-700 mb-3">{answer.content}</p>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-500">
                                On: <span className="font-medium text-gray-700">{answer.question?.title}</span>
                              </span>
                              <span className="text-xs text-gray-500">
                                {new Date(answer.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="flex flex-col items-center justify-center h-64 text-gray-400">
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
                          <div key={comment.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                            <p className="text-gray-700 mb-2">{comment.content}</p>
                            <span className="text-xs text-gray-500">
                              {new Date(comment.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                          <Activity size={48} className="mb-4 opacity-50" />
                          <p>No activity to show yet.</p>
                        </div>
                      )}
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
                    {profileData?.followedTags?.length || 0}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {profileData?.followedTags?.length > 0 ? (
                    profileData?.followedTags?.map((tag: any) => (
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
    </>
  );
}