import { useEffect, useState } from 'react';
import axiosInstance from '../../config/api.ts';
import Loader from '../../components/Loader.tsx';
import { Trash2, ExternalLink } from 'lucide-react';
import { showErrorToast, showSuccessToast } from '../../utils/notify.ts';
import { Link } from 'react-router-dom';

export default function AdminPosts() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const { data } = await axiosInstance.get('/api/v1/questions/all?size=100');
      setQuestions(data.data.content || data.data);
    } catch (err) {
      console.error('Failed to load questions', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this question?')) return;
    try {
      await axiosInstance.delete(`/api/v1/admin/questions/${id}`);
      showSuccessToast('Question deleted successfully');
      setQuestions(questions.filter(q => q.id !== id));
    } catch (err) {
      showErrorToast('Failed to delete question');
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Manage Posts</h2>
      
      <div className="relative overflow-x-auto shadow-md sm:rounded-lg border border-slate-200">
        <table className="w-full text-sm text-left text-slate-500">
          <thead className="text-xs text-slate-700 uppercase bg-slate-50 border-b border-slate-200">
            <tr>
              <th scope="col" className="px-6 py-3">Title</th>
              <th scope="col" className="px-6 py-3">Author</th>
              <th scope="col" className="px-6 py-3">Date</th>
              <th scope="col" className="px-6 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {questions.map((q) => (
              <tr key={q.id} className="bg-white border-b hover:bg-slate-50">
                <td className="px-6 py-4 font-medium text-slate-900 max-w-md truncate">
                  <Link to={`/question/${q.id}`} className="hover:text-[var(--color-brand)] flex items-center gap-2">
                    {q.title} <ExternalLink size={14} />
                  </Link>
                </td>
                <td className="px-6 py-4">
                  {q.username || 'Unknown'}
                </td>
                <td className="px-6 py-4">
                  {q.createdAt ? new Date(q.createdAt).toLocaleDateString() : 'N/A'}
                </td>
                <td className="px-6 py-4">
                  <button onClick={() => handleDelete(q.id)} className="text-red-600 hover:text-red-800 transition-colors">
                    <Trash2 size={20} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
