import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MessageCircle, ThumbsUp, Send, ChevronDown, ChevronUp } from 'lucide-react';
import axiosInstance from '../config/api.ts';
import Loader from '../components/Loader.tsx';
import { useSelector } from 'react-redux';

interface User {
    id: number;
    name: string;
    username: string;
    email: string;
}

interface Answer {
    id: number;
    content: string;
    questionId: number;
    user: User;
    commentCount: number;
    likeCount: number;
}

interface Comment {
    id: number;
    content: string;
    answerId: number;
    parentCommentId: number | null;
    user: User;
    replyCount: number;
    likeCount: number;
}

interface Question {
    id: number;
    title: string;
    content: string;
    user: string;
    tags: string[];
}

export default function QuestionDetailsPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useSelector((state: any) => state.auth);

    const [question, setQuestion] = useState<Question | null>(null);
    const [answers, setAnswers] = useState<Answer[]>([]);
    const [loading, setLoading] = useState(true);
    const [newAnswer, setNewAnswer] = useState('');
    const [submittingAnswer, setSubmittingAnswer] = useState(false);

    // Track which answers have comments expanded
    const [expandedComments, setExpandedComments] = useState<Set<number>>(new Set());
    // Track comments for each answer
    const [answerComments, setAnswerComments] = useState<Record<number, Comment[]>>({});
    // Track new comment input for each answer
    const [newComments, setNewComments] = useState<Record<number, string>>({});
    // Track submitting state for comments
    const [submittingComments, setSubmittingComments] = useState<Set<number>>(new Set());

    useEffect(() => {
        fetchQuestionAndAnswers();
    }, [id]);

    const fetchQuestionAndAnswers = async () => {
        if (!id) return;
        setLoading(true);
        try {
            const [questionRes, answersRes] = await Promise.all([
                axiosInstance.get(`/api/v1/questions/${id}`),
                axiosInstance.get(`/api/v1/answers/question/${id}`)
            ]);

            const questionData = questionRes.data.data || questionRes.data;
            const answersData = answersRes.data.data || answersRes.data;

            setQuestion(questionData);
            setAnswers(answersData);
        } catch (error: any) {
            console.error('Error fetching question:', error);
            navigate('/');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitAnswer = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newAnswer.trim() || !user?.id) return;

        setSubmittingAnswer(true);
        try {
            const response = await axiosInstance.post('/api/v1/answers', {
                content: newAnswer,
                questionId: Number(id),
                userId: user.id
            });

            const createdAnswer = response.data.data || response.data;
            setAnswers(prev => [createdAnswer, ...prev]);
            setNewAnswer('');
        } catch (error) {
            console.error('Error submitting answer:', error);
            alert('Failed to submit answer. Please try again.');
        } finally {
            setSubmittingAnswer(false);
        }
    };

    const toggleComments = async (answerId: number) => {
        const isExpanded = expandedComments.has(answerId);

        if (isExpanded) {
            setExpandedComments(prev => {
                const newSet = new Set(prev);
                newSet.delete(answerId);
                return newSet;
            });
        } else {
            // Fetch comments if not already loaded
            if (!answerComments[answerId]) {
                try {
                    const response = await axiosInstance.get(`/api/v1/comments/answer/${answerId}`);
                    const comments = response.data.data || response.data;
                    setAnswerComments(prev => ({ ...prev, [answerId]: comments }));
                } catch (error) {
                    console.error('Error fetching comments:', error);
                }
            }

            setExpandedComments(prev => new Set(prev).add(answerId));
        }
    };

    const handleSubmitComment = async (answerId: number) => {
        const commentText = newComments[answerId];
        if (!commentText?.trim() || !user?.id) return;

        setSubmittingComments(prev => new Set(prev).add(answerId));
        try {
            const response = await axiosInstance.post('/api/v1/comments', {
                content: commentText,
                answerId: answerId,
                userId: user.id
            });

            const createdComment = response.data.data || response.data;
            setAnswerComments(prev => ({
                ...prev,
                [answerId]: [...(prev[answerId] || []), createdComment]
            }));
            setNewComments(prev => ({ ...prev, [answerId]: '' }));

            // Update comment count
            setAnswers(prev => prev.map(ans =>
                ans.id === answerId ? { ...ans, commentCount: ans.commentCount + 1 } : ans
            ));
        } catch (error) {
            console.error('Error submitting comment:', error);
            alert('Failed to submit comment. Please try again.');
        } finally {
            setSubmittingComments(prev => {
                const newSet = new Set(prev);
                newSet.delete(answerId);
                return newSet;
            });
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <Loader />
            </div>
        );
    }

    if (!question) {
        return (
            <div className="text-center py-20">
                <h2 className="text-2xl font-bold text-gray-800">Question not found</h2>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto">
            {/* Question Card */}
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">{question.title}</h1>
                <div className="prose max-w-none mb-6">
                    <p className="text-gray-700 text-lg leading-relaxed" dangerouslySetInnerHTML={{ __html: question.content }} />
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                    {question.tags?.map((tag: string) => (
                        <span
                            key={tag}
                            className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 px-4 py-1.5 rounded-full text-sm font-medium hover:from-purple-200 hover:to-pink-200 transition-colors"
                        >
                            #{tag}
                        </span>
                    ))}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-600">
                        Asked by <span className="font-semibold text-gray-800">{question.user}</span>
                    </p>
                    <p className="text-sm text-gray-500">{answers.length} {answers.length === 1 ? 'Answer' : 'Answers'}</p>
                </div>
            </div>

            {/* Add Answer Section */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Answer</h2>
                <form onSubmit={handleSubmitAnswer}>
                    <textarea
                        value={newAnswer}
                        onChange={(e) => setNewAnswer(e.target.value)}
                        placeholder="Write your answer here..."
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none resize-none transition-all"
                        rows={6}
                        required
                    />
                    <div className="flex justify-end mt-4">
                        <button
                            type="submit"
                            disabled={submittingAnswer || !newAnswer.trim()}
                            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
                        >
                            <Send size={18} />
                            {submittingAnswer ? 'Posting...' : 'Post Answer'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Answers List */}
            <div className="space-y-6">
                {answers.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                        <MessageCircle size={48} className="mx-auto text-gray-400 mb-4" />
                        <p className="text-gray-600 text-lg">No answers yet. Be the first to answer!</p>
                    </div>
                ) : (
                    answers.map((answer) => (
                        <div key={answer.id} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                            {/* Answer Content */}
                            <div className="mb-4">
                                <p className="text-gray-800 text-lg leading-relaxed" dangerouslySetInnerHTML={{ __html: answer.content }} />
                            </div>

                            {/* Answer Meta */}
                            <div className="flex items-center justify-between py-3 border-t border-b border-gray-200 mb-4">
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold text-sm">
                                            {answer.user?.name?.charAt(0).toUpperCase() || 'A'}
                                        </div>
                                        <span className="text-sm font-medium text-gray-700">{answer.user?.name || 'Anonymous'}</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <button className="flex items-center gap-1 text-gray-600 hover:text-purple-600 transition-colors">
                                        <ThumbsUp size={18} />
                                        <span className="text-sm font-medium">{answer.likeCount}</span>
                                    </button>
                                    <button
                                        onClick={() => toggleComments(answer.id)}
                                        className="flex items-center gap-1 text-gray-600 hover:text-purple-600 transition-colors"
                                    >
                                        <MessageCircle size={18} />
                                        <span className="text-sm font-medium">{answer.commentCount}</span>
                                        {expandedComments.has(answer.id) ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                    </button>
                                </div>
                            </div>

                            {/* Comments Section */}
                            {expandedComments.has(answer.id) && (
                                <div className="mt-4 pl-4 border-l-2 border-purple-200">
                                    {/* Existing Comments */}
                                    <div className="space-y-3 mb-4">
                                        {answerComments[answer.id]?.map((comment) => (
                                            <div key={comment.id} className="bg-gray-50 rounded-lg p-3">
                                                <p className="text-gray-700 text-sm mb-2">{comment.content}</p>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs text-gray-500 font-medium">{comment.user?.name || 'Anonymous'}</span>
                                                    <button className="flex items-center gap-1 text-gray-500 hover:text-purple-600 transition-colors text-xs">
                                                        <ThumbsUp size={14} />
                                                        <span>{comment.likeCount}</span>
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Add Comment */}
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={newComments[answer.id] || ''}
                                            onChange={(e) => setNewComments(prev => ({ ...prev, [answer.id]: e.target.value }))}
                                            placeholder="Add a comment..."
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-sm"
                                            onKeyPress={(e) => {
                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                    e.preventDefault();
                                                    handleSubmitComment(answer.id);
                                                }
                                            }}
                                        />
                                        <button
                                            onClick={() => handleSubmitComment(answer.id)}
                                            disabled={submittingComments.has(answer.id) || !newComments[answer.id]?.trim()}
                                            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm"
                                        >
                                            {submittingComments.has(answer.id) ? 'Posting...' : 'Comment'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
