// src/pages/TagsPage.tsx
import { useEffect, useState } from 'react';
import axiosInstance from '../../config/api.ts';
import Button from '../../components/Button.tsx';
import Card from '../../components/Card.tsx';
import Loader from '../../components/Loader.tsx';
import { useSelector } from 'react-redux';

interface Tag {
  id: number;
  name: string;
  followers?: string[];
}

export default function TagsPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState<Record<number, boolean>>({});
  const { user } = useSelector((state:any) => state.auth);

  // Fetch all tags
  useEffect(() => {
    const fetchTags = async () => {
      setLoading(true);
      try {
        // Try /api/v1/tags first
        let data: Tag[] = [];
        try {
          const res = await axiosInstance.get('/api/v1/tags');
          // console.log(res);
          data = res.data;
        } catch (err: any) {
          if (err.response?.status === 404) {
            // Fallback: extract unique tags from questions
            // const qRes = await axiosInstance.get('/api/v1/questions?page=0&size=50');
            // console.log(qRes);
            // const allTags = qRes.data.flatMap((q: any) => q.tags);
            // const unique = [...new Set(allTags)];
            // data = unique.map((name: string, idx: number) => ({
            //   id: idx + 1000, // fake ID
            //   name,
            //   followers: [],
            // }));
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

    fetchTags();
  }, []);

  // Follow a tag
  const handleFollow = async (tagId: number) => {
    if (!user?.id) return;

    setFollowing(prev => ({ ...prev, [tagId]: true }));

    try {
      await axiosInstance.post(`/api/v1/users/${user.id}/followTag/${tagId}`);
      // console.log(`Now following tag ${tagId}`);
      // Optional: refetch user or tags
    } catch (error: any) {
      console.error('Failed to follow tag:', error);
      alert('Could not follow tag. Please try again.');
    } finally {
      setFollowing(prev => ({ ...prev, [tagId]: false }));
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Explore Tags</h1>

      {tags.length === 0 ? (
        <p className="text-center text-gray-600">No tags found. Ask some questions to create them!</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {tags.map((tag) => (
            <Card key={tag.id} className="hover:shadow-xl transition-shadow">
              <div className="p-5">
                <h3 className="text-lg font-semibold text-blue-700 mb-2">
                  #{tag.name}
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  {tag.followers?.length || 0} follower{tag.followers?.length !== 1 ? 's' : ''}
                </p>

                <Button
                  onClick={() => handleFollow(tag.id)}
                  disabled={following[tag.id]}
                  size="small"
                  className="w-full"
                >
                  {following[tag.id] ? 'Following...' : 'Follow'}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}