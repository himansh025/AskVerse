import { useState, useEffect, useMemo } from 'react';
import { Search, Check } from 'lucide-react';
import axiosInstance from '../config/api.ts';
import Button from '../components/Button.tsx';
// import Card from '../components/Card.tsx'; // No longer used
import Loader from '../components/Loader.tsx';
import AddTagModal from '../features/tags/AddTagModal.tsx';
import { useSelector } from 'react-redux';

interface Tag {
  id: number;
  name: string;
  description?: string; // short 2‑3 line description
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

  // Fetch all tags
  const fetchTags = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/api/v1/tags');
      const data: Tag[] = res.data.data || res.data;
      setTags(data);
    } catch (error) {
      console.error('Failed to load tags:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch user's followed tags
  const fetchFollowedTags = async () => {
    if (!user?.id) return;
    try {
      const res = await axiosInstance.get(`/api/v1/users/${user.id}/followedTags`);
      const followedTags: Tag[] = res.data.data || res.data;
      const followedIds = new Set(followedTags.map(tag => tag.id));
      setFollowedTagIds(followedIds);
    } catch (error) {
      console.error('Failed to load followed tags:', error);
    }
  };

  useEffect(() => {
    fetchTags();
    fetchFollowedTags();
  }, []);

  // Follow a tag
  const handleFollow = async (tagId: number) => {
    if (!user?.id) return;
    setFollowing(prev => ({ ...prev, [tagId]: true }));
    try {
      await axiosInstance.post(`/api/v1/users/${user.id}/followTag/${tagId}`);
      setFollowedTagIds(prev => new Set(prev).add(tagId));
      // Refresh tags to update follower count
      fetchTags();
    } catch (err) {
      console.error('Failed to follow tag:', err);
      alert('Could not follow tag. Please try again.');
    } finally {
      setFollowing(prev => ({ ...prev, [tagId]: false }));
    }
  };

  // Unfollow a tag
  const handleUnfollow = async (tagId: number) => {
    if (!user?.id) return;
    setFollowing(prev => ({ ...prev, [tagId]: true }));
    try {
      await axiosInstance.delete(`/api/v1/users/${user.id}/unfollowTag/${tagId}`);
      setFollowedTagIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(tagId);
        return newSet;
      });
      // Refresh tags to update follower count
      fetchTags();
    } catch (err) {
      console.error('Failed to unfollow tag:', err);
      alert('Could not unfollow tag. Please try again.');
    } finally {
      setFollowing(prev => ({ ...prev, [tagId]: false }));
    }
  };

  const filteredTags = useMemo(() => {
    return tags.filter(tag => tag.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [tags, searchQuery]);

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
    <div className="w-full mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-bold  mb-2" style={{ color: '#07528f' }}>Explore Tags</h1>
          <p className="text-gray-600">Discover and follow topics that interest you</p>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          {/* Search */}
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search tags..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
            />
          </div>
          <Button
            onClick={() => setIsAddTagModalOpen(true)}
            className="flex items-center space-x-2 hover:from-purple-700 hover:to-pink-700 shadow-lg whitespace-nowrap"
            style={{ backgroundColor: '#8f0752' }}
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
          <div className="w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center float-animation" style={{ backgroundColor: '#8f0752' }}>
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
          </div>
          <p className="text-gray-600 text-lg mb-4">
            {searchQuery ? `No tags found matching "${searchQuery}"` : 'No tags found. Create the first one!'}
          </p>
        </div>
      ) : (
        <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4">
          {filteredTags.map(tag => (
            <div key={tag.id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-4 flex flex-col justify-between mb-4 break-inside-avoid">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">#{tag.name}</h3>
                {(tag.followerCount && tag.followerCount > 100) || (tag.questionCount && tag.questionCount > 50) ? (
                  <span className="bg-gradient-to-r from-pink-500 to-yellow-500 text-white text-xs font-medium px-2 py-0.5 rounded-full">Trending</span>
                ) : null}
              </div>
              {tag.description && (
                <p className="text-sm text-gray-600 mb-2 line-clamp-3">{tag.description}</p>
              )}
              <div className="text-sm text-gray-500 mb-2">
                {tag.questionCount ?? 0} question{tag.questionCount !== 1 ? 's' : ''} • {tag.followerCount ?? 0} follower{tag.followerCount !== 1 ? 's' : ''}
              </div>
              <Button
                onClick={() => followedTagIds.has(tag.id) ? handleUnfollow(tag.id) : handleFollow(tag.id)}
                disabled={following[tag.id]}
                size="small"
                className={`w-full ${following[tag.id] ? 'opacity-70 cursor-not-allowed' : ''} text-white flex items-center justify-center`}
                style={{ backgroundColor: followedTagIds.has(tag.id) ? '#6b7280' : '#8f0752' }}
              >
                {following[tag.id] ? (
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                    {followedTagIds.has(tag.id) ? 'Unfollowing...' : 'Following...'}
                  </span>
                ) : followedTagIds.has(tag.id) ? (
                  <span className="flex items-center gap-2">
                    <Check size={14} /> Unfollow
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    Follow
                  </span>
                )}
              </Button>
            </div>
          ))}
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