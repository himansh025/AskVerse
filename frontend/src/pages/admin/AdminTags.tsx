import { useEffect, useState } from 'react';
import axiosInstance from '../../config/api.ts';
import Loader from '../../components/Loader.tsx';
import { Trash2, Plus } from 'lucide-react';
import { showErrorToast, showSuccessToast } from '../../utils/notify.ts';
import AddTagModal from '../../features/tags/AddTagModal.tsx';

export default function AdminTags() {
  const [tags, setTags] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddTagModalOpen, setIsAddTagModalOpen] = useState(false);

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      const { data } = await axiosInstance.get('/api/v1/tags');
      setTags(data.data);
    } catch (err) {
      console.error('Failed to load tags', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTagAdded = () => {
    fetchTags();
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this tag?')) return;
    try {
      await axiosInstance.delete(`/api/v1/admin/tags/${id}`);
      showSuccessToast('Tag deleted successfully');
      setTags(tags.filter(t => t.id !== id));
    } catch (err) {
      showErrorToast('Failed to delete tag');
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Manage Tags</h2>
        <button
          onClick={() => setIsAddTagModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:from-purple-700 hover:to-pink-700 shadow-md hover:shadow-lg"
        >
          <Plus size={16} />
          Create Tag
        </button>
      </div>
      
      <div className="relative overflow-x-auto shadow-md sm:rounded-lg border border-slate-200">
        <table className="w-full text-sm text-left text-slate-500">
          <thead className="text-xs text-slate-700 uppercase bg-slate-50 border-b border-slate-200">
            <tr>
              <th scope="col" className="px-6 py-3">Tag Name</th>
              <th scope="col" className="px-6 py-3">Followers</th>
              <th scope="col" className="px-6 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {tags.map((t) => (
              <tr key={t.id} className="bg-white border-b hover:bg-slate-50">
                <td className="px-6 py-4 font-medium text-slate-900">
                  <span className="bg-slate-100 text-slate-800 px-3 py-1 rounded-full text-sm">
                    {t.name}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {t.followerCount || 0}
                </td>
                <td className="px-6 py-4">
                  <button onClick={() => handleDelete(t.id)} className="text-red-600 hover:text-red-800 transition-colors">
                    <Trash2 size={20} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <AddTagModal
        isOpen={isAddTagModalOpen}
        onClose={() => setIsAddTagModalOpen(false)}
        onTagAdded={handleTagAdded}
      />
    </div>
  );
}
