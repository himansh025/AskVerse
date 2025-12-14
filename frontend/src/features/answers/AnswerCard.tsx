import { useState, useEffect } from 'react';
import axiosInstance from '../../config/api.ts';
import Card from '../../components/Card.tsx';
import AddCommentForm from '../comments/AddCommentForm.tsx';

interface AnswerCardProps {
  answer: any;
}

export default function AnswerCard({ answer }: AnswerCardProps) {
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const { data } = await axiosInstance.get(`/api/v1/comments/answer/${answer.id}?page=0&size=10`);
        setComments(data);
      } catch (error) {
        console.error('Error fetching comments:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchComments();
  }, [answer.id]);

  return (
    <Card className="mb-6">
      <div className="flex items-start space-x-4">
        <div className="flex-1">
          <p className="text-gray-700 mb-3">{answer.content}</p>
          <p className="text-sm text-gray-500 mb-4">
            Answered by <span className="font-medium">{answer.user.name}</span>
          </p>
          
          {loading ? (
            <div>Loading comments...</div>
          ) : (
            <div className="space-y-3">
              {comments.map((comment: any) => (
                <div key={comment.id} className="border-l-2 border-gray-200 pl-4">
                  <p className="text-sm text-gray-600">{comment.content}</p>
                </div>
              ))}
              <AddCommentForm answerId={answer.id} />
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}