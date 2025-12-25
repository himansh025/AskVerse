import { useState, useEffect, useMemo } from 'react';
import { Search } from 'lucide-react';
import axiosInstance from '../config/api.ts';
import Button from '../components/Button.tsx';
import Card from '../components/Card.tsx';
import Loader from '../components/Loader.tsx';
import AddTagModal from '../features/tags/AddTagModal.tsx';
import { useSelector } from 'react-redux';


interface Tag {
  id: number;
  name: string;
  followerCount?: number;
  questionCount?: number;
}

export default function TagsPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState<Record<number, boolean>>({});
  const [followedTagIds, setFollowedTagIds] = useState<Set<number>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddTagModalOpen, setIsAddTagModalOpen] = useState(false); // Add this state
  const { user } = useSelector((state: any) => state.auth);

  // Fetch all tags
  const fetchTags = async () => {
    setLoading(true);
    try {
      // Try /api/v1/tags first
      let data: Tag[] = [];
      try {
        const res = await axiosInstance.get('/api/v1/tags');
        console.log(res);
        // Extract data from ApiResponse wrapper
        data = res.data.data || res.data;
      } catch (err: any) {
        if (err.response?.status === 404) {
          // Fallback: extract unique tags from questions if needed
          console.log('Tags endpoint not available, could fallback to questions');
        } else {

          throw err;
        }
      }
      setTags(data);
    } catch (error) {
      console.error('Failed to load tags:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  // Follow a tag
  const handleFollow = async (tagId: number) => {
    if (!user?.id) return;

    setFollowing(prev => ({ ...prev, [tagId]: true }));

    try {
      await axiosInstance.post(`/api/v1/users/${user.id}/followTag/${tagId}`);
      console.log(`Now following tag ${tagId}`);
      setFollowedTagIds(prev => new Set(prev).add(tagId));
    } catch (error: any) {
      console.error('Failed to follow tag:', error);
      alert('Could not follow tag. Please try again.');
    } finally {
      setFollowing(prev => ({ ...prev, [tagId]: false }));
    }
  };

  const filteredTags = useMemo(() => {
    return tags.filter(tag =>
      tag.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [tags, searchQuery]);

  // Handle new tag creation
  const handleTagAdded = (newTag: Tag) => {
    setTags(prev => [newTag, ...prev]);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header with Add Tag Button */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-bold gradient-text mb-2">Explore Tags</h1>
          <p className="text-gray-600">Discover and follow topics that interest you</p>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          {/* Search Bar */}
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
            />
          </div>

          <Button
            onClick={() => setIsAddTagModalOpen(true)}
            className="flex items-center space-x-2  hover:from-purple-700 hover:to-pink-700 shadow-lg whitespace-nowrap" style={{ backgroundColor: "#8f0752" }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Add Tag</span>
          </Button>
        </div>
      </div>

      {filteredTags.length === 0 ? (
        <div className="text-center py-20 glass rounded-2xl">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full  flex items-center justify-center float-animation" style={{ backgroundColor: "#8f0752" }}>
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
          </div>
          <p className="text-gray-600 text-lg mb-4">
            {searchQuery ? `No tags found matching "${searchQuery}"` : "No tags found. Create the first one!"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredTags.map((tag, index) => {
            const gradientIndex = index % 5;
            const gradients = [
              'from-purple-500 to-pink-500',
              'from-blue-500 to-cyan-500',
              'from-green-500 to-teal-500',
              'from-orange-500 to-red-500',
              'from-indigo-500 to-purple-500',
            ];
            const gradient = gradients[gradientIndex];

            return (
              <Card key={tag.id} className="card-hover overflow-hidden bg-white group relative">
                {/* Gradient Header */}
                <div className={`h-24 bg-gradient-to-r ${gradient} relative`}>
                  <div className="absolute inset-0 bg-black/10" />
                  <div className="absolute bottom-3 left-4 right-4">
                    <div className="w-12 h-12 rounded-xl bg-white shadow-lg flex items-center justify-center transform group-hover:scale-110 transition-transform">
                      <svg className={`w-6 h-6 bg-gradient-to-r ${gradient} text-transparent`} fill="currentColor" viewBox="0 0 24 24">
                        <path d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 pt-4">
                  <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-purple-600 transition-colors">
                    #{tag.name}
                  </h3>

                  <div className="flex items-center gap-2 mb-4 text-sm text-gray-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span>{tag.followerCount || 0} follower{tag.followerCount !== 1 ? 's' : ''}</span>
                  </div>

                  <Button
                    onClick={() => handleFollow(tag.id)}
                    disabled={following[tag.id] || followedTagIds.has(tag.id)}
                    size="small"
                    className={`w-full ${following[tag.id] || followedTagIds.has(tag.id) ? 'opacity-70 cursor-not-allowed' : ''} bg-gradient-to-r ${gradient} hover:shadow-lg`}
                  >
                    {following[tag.id] ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Following...
                      </span>
                    ) : followedTagIds.has(tag.id) ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Followed
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Follow
                      </span>
                    )}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add Tag Modal */}
      <AddTagModal
        isOpen={isAddTagModalOpen}
        onClose={() => setIsAddTagModalOpen(false)}
        onTagAdded={handleTagAdded}
      />
    </div>
  );
}