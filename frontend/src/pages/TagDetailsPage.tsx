import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Tag as TagIcon, Users, MessageSquare, TrendingUp, ArrowLeft } from 'lucide-react';
import axiosInstance from '../config/api.ts';
import Loader from '../components/Loader.tsx';
import QuestionList from '../features/questions/QuestionList.tsx';

interface TagDetails {
    id: number;
    name: string;
    followerCount: number;
    questionCount: number;
}

interface Question {
    id: number;
    title: string;
    content: string;
    username: string;
    tags: string[];
    voteCount?: number;
    answerCount?: number;
    viewCount?: number;
    createdAt?: string;
}

export default function TagDetailsPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [tag, setTag] = useState<TagDetails | null>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);
    // const [currentPage, setCurrentPage] = useState(0);
    // const [totalPages, setTotalPages] = useState(0);

    useEffect(() => {
        if (id) {
            fetchTagDetailsWithQuestions();
        }
    }, [id]);

    const fetchTagDetailsWithQuestions = async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.get(`/api/v1/tags/${id}/details?page=0&size=10`);
            const data = response.data.data || response.data;

            setTag({
                id: data.id,
                name: data.name,
                followerCount: data.followerCount,
                questionCount: data.questionCount
            });
            setQuestions(data.questions || []);
            // setTotalPages(data.totalPages || 0);
        } catch (error) {
            console.error('Error fetching tag details:', error);
            navigate('/tags');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <Loader />
            </div>
        );
    }

    if (!tag) {
        return (
            <div className="text-center py-20">
                <h2 className="text-2xl font-bold text-gray-800">Tag not found</h2>
                <Link to="/tags" className="text-purple-600 hover:text-purple-700 mt-4 inline-block">
                    ← Back to Tags
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto">
            {/* Back Button */}
            <Link
                to="/tags"
                className="inline-flex items-center gap-2 text-gray-600 hover:text-purple-600 mb-6 transition-colors"
            >
                <ArrowLeft size={20} />
                <span className="font-medium">Back to Tags</span>
            </Link>

            {/* Tag Header */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl shadow-xl p-8 mb-8 text-white">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                                <TagIcon size={32} className="text-white" />
                            </div>
                            <div>
                                <h1 className="text-4xl font-bold">#{tag.name}</h1>
                                <p className="text-purple-100 mt-1">Explore questions and discussions</p>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="flex flex-wrap gap-6 mt-6">
                            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-lg">
                                <MessageSquare size={20} />
                                <div>
                                    <p className="text-2xl font-bold">{tag.questionCount}</p>
                                    <p className="text-sm text-purple-100">Questions</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-lg">
                                <Users size={20} />
                                <div>
                                    <p className="text-2xl font-bold">{tag.followerCount}</p>
                                    <p className="text-sm text-purple-100">Followers</p>
                                </div>
                            </div>

                            {tag.questionCount > 50 && (
                                <div className="flex items-center gap-2 bg-yellow-400/20 backdrop-blur-md px-4 py-2 rounded-lg border border-yellow-300/30">
                                    <TrendingUp size={20} className="text-yellow-200" />
                                    <span className="font-semibold text-yellow-100">Trending Topic</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Questions Section */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-3xl font-bold text-gray-900">
                        Questions tagged with <span className="text-purple-600">#{tag.name}</span>
                    </h2>
                    <Link
                        to="/ask"
                        className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all shadow-md hover:shadow-lg"
                    >
                        Ask Question
                    </Link>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <Loader />
                    </div>
                ) : questions.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 flex items-center justify-center">
                            <MessageSquare size={48} className="text-purple-600" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">No questions yet</h3>
                        <p className="text-gray-600 mb-6">Be the first to ask a question about {tag.name}!</p>
                        <Link
                            to="/ask"
                            className="inline-block px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all shadow-md hover:shadow-lg"
                        >
                            Ask the First Question
                        </Link>
                    </div>
                ) : (
                    <QuestionList questions={questions} />
                )}
            </div>

            {/* Related Tags Section (Optional - can be added later) */}
            {/* <div className="mt-12">
        <h3 className="text-2xl font-bold text-gray-900 mb-4">Related Tags</h3>
        <div className="flex flex-wrap gap-3">
          {relatedTags.map(relatedTag => (
            <Link
              key={relatedTag.id}
              to={`/tags/${relatedTag.id}`}
              className="px-4 py-2 bg-white rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200"
            >
              #{relatedTag.name}
            </Link>
          ))}
        </div>
      </div> */}
        </div>
    );
}
