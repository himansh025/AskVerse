import { useEffect, useState } from 'react';
import Card from '../components/Card.tsx';
import Loader from '../components/Loader.tsx';
import { useSelector } from 'react-redux';

export default function ProfilePage() {
  const { user } = useSelector((state:any) => state.auth);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true)
    if (user?.id) {
      setProfile(user)
    setLoading(false)
    };
  }, [user]);

  if (loading) return <Loader />;

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Profile</h1>
      <Card>
        <div className="space-y-4">
          <p><strong>Name:</strong> {profile?.name}</p>
          <p><strong>Email:</strong> {profile?.email}</p>
          <p><strong>Username:</strong> {profile?.username}</p>
          
          <div>
            <h3 className="text-xl font-semibold mt-6 mb-4">Followed Tags</h3>
            <div className="flex flex-wrap gap-2">
              {profile?.followedTags?.map((tag: any) => (
                <span key={tag.id} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                  {tag.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}