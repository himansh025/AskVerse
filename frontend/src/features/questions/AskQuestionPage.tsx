import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../config/api.ts';
import Button from '../../components/Button.tsx';
import Input from '../../components/Input.tsx';
import Loader from '../../components/Loader.tsx';
import { useSelector } from 'react-redux';

export default function AskQuestionPage() {
  const [form, setForm] = useState({ title: '', content: '', tagIds: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useSelector((state:any) => state.auth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const tagIds = form.tagIds.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
      console.log(tagIds);
      const { data } = await axiosInstance.post('/api/v1/questions', {
        title: form.title,
        content: form.content,
        userId: user.id,
        tagIds
      });

      console.log('Question created:', data);
      navigate('/');
    } catch (error: any) {
      console.error('Error creating question:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <Loader />;

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Ask a Question</h1>
      <form onSubmit={handleSubmit} className="bg-white shadow-2xl p-8 rounded-2xl">
        <Input
          type="text" placeholder="Title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="mb-4"
        />
        <textarea
          placeholder="Content"
          value={form.content}
          onChange={(e) => setForm({ ...form, content: e.target.value })}
          className="border w-full mb-4 p-3 rounded-md h-40 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <Input
          type="text" placeholder="Tag IDs (comma separated: 1,2,3)"
          value={form.tagIds}
          onChange={(e) => setForm({ ...form, tagIds: e.target.value })}
          className="mb-6"
        />
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Posting...' : 'Post Question'}
        </Button>
      </form>
    </div>
  );
}