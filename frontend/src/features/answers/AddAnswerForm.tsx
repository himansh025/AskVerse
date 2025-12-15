// src/features/answers/AddAnswerForm.tsx
import { useState } from 'react';
import { useCreateAnswerMutation } from './answersApi.ts';
import Button from '../../components/Button.tsx';
import { useSelector } from 'react-redux';

interface AddAnswerFormProps {
  questionId: number;
}

export default function AddAnswerForm({ questionId }: AddAnswerFormProps) {
  const [content, setContent] = useState('');
  const [createAnswer, { isLoading }] = useCreateAnswerMutation();
  const { user } = useSelector((state:any) => state.auth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createAnswer({ content, questionId, userId: user.id }).unwrap();
      setContent('');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-8">
      <h3 className="text-xl font-semibold mb-4 text-gray-800">Add Your Answer</h3>
      <textarea
        placeholder="Your answer..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="border w-full p-3 rounded-md h-32 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
      />
      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Posting...' : 'Post Answer'}
      </Button>
    </form>
  );
}