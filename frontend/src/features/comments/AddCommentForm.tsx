import { useState } from 'react';
import axiosInstance from '../../config/api.ts';
import Button from '../../components/Button.tsx';

interface AddCommentFormProps {
  answerId: number;
}

export default function AddCommentForm({ answerId }: AddCommentFormProps) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axiosInstance.post('/api/v1/comments', { content, answerId });
      alert('Comment created');
      setContent('');
      window.location.reload();
    } catch (error: any) {
      alert(`Comment failed ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 pt-4 border-t">
      <textarea
        placeholder="Add a comment..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="border w-full p-2 rounded-md h-16 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
        required
      />
      <Button type="submit" disabled={loading} size="small">
        {loading ? 'Posting...' : 'Comment'}
      </Button>
    </form>
  );
}