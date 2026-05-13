import { Link } from 'react-router-dom';
import { ArrowUpRight, Clock, Lock, Sparkles } from 'lucide-react';
// import { MessageSquare, ThumbsUp, Eye, Clock, Bookmark } from 'lucide-react';
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
const getQuestionImage = (question: any) => {
  if (question?.thumbnailUrl) {
    return question.thumbnailUrl;
  }

  const tags = question?.tags;
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
  if (!dateString) return '';
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
        const imageUrl = getQuestionImage(q);
        const fallbackGradient = gradients[index % gradients.length];

        return (
          <Card key={q.id} className="group relative overflow-hidden p-0">
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
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-900/20 to-transparent" />

              <div className="absolute bottom-3 left-3 flex flex-wrap gap-2 z-10">
                {q.premiumContent ? (
                  <span className="rounded-full border border-amber-200/50 bg-amber-400/90 px-3 py-1 text-xs font-semibold text-slate-900 shadow-sm">
                    <span className="inline-flex items-center gap-1">
                      <Lock size={12} />
                      Premium
                    </span>
                  </span>
                ) : (
                  <span className="rounded-full border border-white/15 bg-white/16 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md">
                    <span className="inline-flex items-center gap-1">
                      <Sparkles size={12} />
                      Public
                    </span>
                  </span>
                )}
                {q.tags?.slice(0, 2).map((tag: string) => (
                  <span
                    key={tag}
                    className="rounded-full border border-white/15 bg-white/16 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md transition-colors hover:bg-white/25"
                  >
                    #{tag}
                  </span>
                ))}
                {q.tags?.length > 2 && (
                  <span className="rounded-full border border-white/15 bg-white/16 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md">
                    +{q.tags.length - 2}
                  </span>
                )}
              </div>
            </div>

            <div className="p-6">
              <div className="mb-4 flex items-center gap-2 text-xs text-slate-500">
                <div className="flex items-center gap-1">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-accent)] text-[10px] font-bold text-white">
                    {q.username?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <span className="font-semibold text-slate-700">{q.username || 'Anonymous'}</span>
                </div>
                {q.createdAt && (
                  <>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <Clock size={12} />
                      <span>{formatTimeAgo(q.createdAt)}</span>
                    </div>
                  </>
                )}
              </div>

              <Link to={`/question/${q.id}`} className="mb-3 block">
                <h3 className="font-brand line-clamp-2 text-2xl font-bold leading-tight text-slate-900 transition-colors group-hover:text-[var(--color-brand)]">
                  {q.title}
                </h3>
              </Link>

              <p className="mb-6 line-clamp-3 text-sm leading-7 text-slate-600">
                {q.content}
              </p>

              <Link
                to={`/question/${q.id}`}
                className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-brand)] transition-colors hover:text-[var(--color-accent)]"
              >
                {q.locked ? 'Preview and subscribe' : 'Read discussion'}
                <ArrowUpRight size={16} />
              </Link>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
