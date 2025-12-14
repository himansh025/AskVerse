import { Link } from 'react-router-dom';
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

export default function QuestionList({ questions }: QuestionListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {questions.map((q, index) => {
        const imageUrl = getQuestionImage(q.tags);
        const fallbackGradient = gradients[index % gradients.length];

        return (
          <Card key={q.id} className="card-hover overflow-hidden group relative bg-white">
            {/* Image Section */}
            <div className="relative h-48 overflow-hidden">
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
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
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

              {/* Tags on Image */}
              <div className="absolute bottom-3 left-3 flex flex-wrap gap-2">
                {q.tags?.slice(0, 2).map((tag: string) => (
                  <span
                    key={tag}
                    className="glass px-3 py-1 rounded-full text-xs font-medium text-white backdrop-blur-md"
                  >
                    #{tag}
                  </span>
                ))}
                {q.tags?.length > 2 && (
                  <span className="glass px-3 py-1 rounded-full text-xs font-medium text-white backdrop-blur-md">
                    +{q.tags.length - 2}
                  </span>
                )}
              </div>
            </div>

            {/* Content Section */}
            <div className="p-5">
              <Link to={`/question/${q.id}`} className="group">
                <h3 className="text-lg font-bold text-gray-800 group-hover:text-purple-600 transition-colors line-clamp-2 mb-2">
                  {q.title}
                </h3>
              </Link>

              <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                {q.content}
              </p>

              {/* Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold text-sm">
                    {q.username?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <span className="text-sm text-gray-700 font-medium">{q.username || 'Anonymous'}</span>
                </div>

                <button className="text-gray-400 hover:text-purple-600 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                </button>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}