// src/features/comments/CommentThread.tsx
import { useState } from 'react';
import { useGetCommentsByAnswerQuery } from './commentsApi.ts';
import { useCreateCommentMutation } from './commentsApi.ts';
import Button from '../../components/Button.tsx';

interface CommentThreadProps {
  answerId: number;
  comments: any[];
}

export default function CommentThread({ answerId }: CommentThreadProps) {
  const { data: comments = [], isLoading } = useGetCommentsByAnswerQuery({ answerId, page: 0, size: 10 });
  const [content, setContent] = useState('');
  const [createComment] = useCreateCommentMutation();

  const handleSubmit = async (e: React.FormEvent, parentCommentId?: number) => {
    e.preventDefault();
    await createComment({ content, answerId, parentCommentId });
    setContent('');
  };

  if (isLoading) return null;

  return (
    <div className="mt-6">
      <h4 className="text-lg font-medium mb-4 text-gray-700">Comments</h4>
      {comments.map((comment:any) => (
        <div key={comment.id} className="border-t py-4">
          <p className="text-gray-600">{comment.content}</p>
          {/* Recursive replies if needed */}
        </div>
      ))}
      <form onSubmit={(e) => handleSubmit(e)} className="mt-4">
        <textarea
          placeholder="Add a comment..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="border w-full p-2 rounded-md h-20 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
        />
        <Button type="submit" size="small">
          Post Comment
        </Button>
      </form>
    </div>
  );
}