import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../../config/api.ts';
import AddAnswerForm from '../answers/AddAnswerForm.tsx';
import AnswerCard from '../answers/AnswerCard.tsx';
import Card from '../../components/Card.tsx';
import Loader from '../../components/Loader.tsx';

export default function QuestionDetails() {
  const { id } = useParams<{ id: string }>();
  const [question, setQuestion] = useState<any>(null);
  const [answers, setAnswers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuestion = async () => {
      setLoading(true);
      try {
        const [{ data: qData }, { data: aData }] = await Promise.all([
          axiosInstance.get(`/api/v1/questions/${id}`),
          axiosInstance.get(`/api/v1/answers/question/${id}?page=0&size=10`)
        ]);
        setQuestion(qData);
        setAnswers(aData);
      } catch (error: any) {
        console.error('Error fetching question:', error);
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchQuestion();
  }, [id, navigate]);

  if (loading) return <Loader />;

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">{question?.title}</h1>
        <p className="text-gray-600 mb-6">{question?.content}</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {question?.tags.map((tag: string) => (
            <span key={tag} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
              {tag}
            </span>
          ))}
        </div>
        <p className="text-sm text-gray-500">Asked by {question?.user}</p>
      </Card>

      <h2 className="text-2xl font-semibold mb-6 text-gray-800">
        {answers.length} Answer{answers.length !== 1 ? 's' : ''}
      </h2>

      {answers.map((answer: any) => (
        <AnswerCard key={answer.id} answer={answer} />
      ))}

      <AddAnswerForm questionId={Number(id)} />
    </div>
  );
}