import { Link } from 'react-router-dom';
import { MessageSquare, ThumbsUp, Eye, Clock, Bookmark } from 'lucide-react';
import Card from '../../components/Card';

interface QuestionListProps {
  questions: any[];
}

// Topic images mapping
const topicImages: Record<string, string> = {
  technology: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=200&fit=crop',
  programming: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=200&fit=crop',
  science: 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=400&h=200&fit=crop',
  mathematics: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&h=200&fit=crop',
  physics: 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=400&h=200&fit=crop',
  chemistry: 'https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?w=400&h=200&fit=crop',
  biology: 'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=400&h=200&fit=crop',
  business: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&h=200&fit=crop',
  design: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=200&fit=crop',
  art: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=400&h=200&fit=crop',
  default: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=400&h=200&fit=crop'
};

// Get image based on tags
const getQuestionImage = (tags: string[]) => {
  if (!tags || tags.length === 0) return topicImages.default;

  const firstTag = tags[0].toLowerCase();
  return topicImages[firstTag] || topicImages.default;
};

// Generate random gradient for cards without specific images
const gradients = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
];

const formatTimeAgo = (dateString: string) => {
  if (!dateString) return 'recently';
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
};

export default function QuestionList({ questions }: QuestionListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {questions.map((q, index) => {
        const imageUrl = getQuestionImage(q.tags);
        const fallbackGradient = gradients[index % gradients.length];

        return (
          <Card key={q.id} className="overflow-hidden group relative bg-white hover:shadow-xl transition-all duration-300 border border-gray-100">
            {/* Image Section */}
            <div className="relative h-48 overflow-hidden">
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                style={{
                  backgroundImage: `url(${imageUrl})`,
                  backgroundColor: '#667eea'
                }}
                onError={(e) => {
                  const target = e.target as HTMLDivElement;
                  target.style.backgroundImage = 'none';
                  target.style.background = fallbackGradient;
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

              {/* Tags on Image */}
              <div className="absolute bottom-3 left-3 flex flex-wrap gap-2 z-10">
                {q.tags?.slice(0, 2).map((tag: string) => (
                  <span
                    key={tag}
                    className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full text-xs font-medium text-white backdrop-blur-md transition-colors border border-white/10"
                  >
                    #{tag}
                  </span>
                ))}
                {q.tags?.length > 2 && (
                  <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-medium text-white backdrop-blur-md border border-white/10">
                    +{q.tags.length - 2}
                  </span>
                )}
              </div>
            </div>

            {/* Content Section */}
            <div className="p-6">
              <div className="flex items-center gap-2 mb-3 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <div className="w-5 h-5 rounded-full bg-[#8f0752] flex items-center justify-center text-white text-[10px] font-bold">
                    {q.username?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <span className="font-medium text-gray-700">{q.username || 'Anonymous'}</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <Clock size={12} />
                  <span>{formatTimeAgo(q.createdAt)}</span>
                </div>
              </div>

              <Link to={`/question/${q.id}`} className="group block mb-3">
                <h3 className="text-xl font-bold text-gray-900 group-hover:text-[#07528f] transition-colors line-clamp-2 leading-tight">
                  {q.title}
                </h3>
              </Link>

              <p className="text-gray-600 text-sm line-clamp-3 mb-6 leading-relaxed">
                {q.content}
              </p>

              {/* Footer Stats */}
              {/* <div className="flex items-center justify-between pt-4 border-t border-gray-100 text-sm text-gray-500">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5 hover:text-[#07528f] transition-colors" title="Votes">
                    <ThumbsUp size={16} />
                    <span className="font-medium">{q.voteCount || 0}</span>
                  </div>
                  <div className="flex items-center gap-1.5 hover:text-[#07528f] transition-colors" title="Answers">
                    <MessageSquare size={16} />
                    <span className="font-medium">{q.answerCount || 0}</span>
                  </div>
                  <div className="flex items-center gap-1.5 hover:text-[#07528f] transition-colors" title="Views">
                    <Eye size={16} />
                    <span className="font-medium">{q.viewCount || 0}</span>
                  </div>
                </div>

                <button className="text-gray-400 hover:text-[#8f0752] transition-colors">
                  <Bookmark size={18} />
                </button>
              </div> */}
            </div>
          </Card>
        );
      })}
    </div>
  );
}