import { useState, useEffect } from 'react';
import { Sparkles, ThumbsDown, ThumbsUp } from 'lucide-react';
import { useSelector } from 'react-redux';
import axiosInstance from '../../config/api';
import { getApiErrorMessage, getApiSuccessMessage, showErrorToast, showSuccessToast } from '../../utils/notify.ts';

interface DebateData {
  id: number;
  questionId: number;
  proText: string;
  againstText: string;
  summary: string;
  proVotes: number;
  againstVotes: number;
  totalVotes: number;
  proPercentage: number;
  againstPercentage: number;
  userVote: string | null;
}

interface DebateSectionProps {
  questionId: number;
}

export default function DebateSection({ questionId }: DebateSectionProps) {
  const { user } = useSelector((state: any) => state.auth);
  const [debate, setDebate] = useState<DebateData | null>(null);
  const [loading, setLoading] = useState(false);
  const [generatingDebate, setGeneratingDebate] = useState(false);
  const [activeTab, setActiveTab] = useState<'pro' | 'against' | 'summary'>('pro');
  const [votingTab, setVotingTab] = useState<'pro' | 'against' | null>(null);

  useEffect(() => {
    fetchDebate();
  }, [questionId, user?.id]);

  const fetchDebate = async () => {
    try {
      setLoading(true);
      const url = user?.id
        ? `/api/v1/debates/question/${questionId}?userId=${user.id}`
        : `/api/v1/debates/question/${questionId}`;
      const response = await axiosInstance.get(url);
      setDebate(response.data.data);
    } catch (error) {
      // Debate doesn't exist yet, user can generate it
      console.log('Debate not found, user can generate one');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateDebate = async () => {
    if (generatingDebate) return;
    setGeneratingDebate(true);

    try {
      const response = await axiosInstance.post(`/api/v1/debates/generate/${questionId}`);
      setDebate(response.data.data);
      showSuccessToast(getApiSuccessMessage(response.data, 'AI debate generated successfully'));
    } catch (error) {
      console.error('Failed to generate debate:', error);
      showErrorToast(getApiErrorMessage(error, 'Failed to generate debate'));
    } finally {
      setGeneratingDebate(false);
    }
  };

  const handleVote = async (vote: 'PRO' | 'AGAINST') => {
    if (!user?.id || !debate) return;

    try {
      setVotingTab(vote === 'PRO' ? 'pro' : 'against');
      const response = await axiosInstance.post('/api/v1/debates/vote', {
        debateId: debate.id,
        userId: user.id,
        vote,
      });
      setDebate(response.data.data);
      showSuccessToast(getApiSuccessMessage(response.data, 'Vote recorded successfully'));
    } catch (error) {
      console.error('Failed to record vote:', error);
      showErrorToast(getApiErrorMessage(error, 'Failed to record vote'));
    } finally {
      setVotingTab(null);
    }
  };

  const getVotePercentageDisplay = (percentage: number) => {
    if (percentage === 0) return '0%';
    if (percentage === 100) return '100%';
    return `${percentage.toFixed(1)}%`;
  };

  if (loading && !debate) {
    return (
      <div className="mt-12 rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100/50 p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-7 w-52 rounded-full bg-blue-200" />
          <div className="h-4 w-full rounded-full bg-blue-100" />
          <div className="h-4 w-3/4 rounded-full bg-blue-100" />
        </div>
      </div>
    );
  }

  if (!debate) {
    return (
      <div className="mt-12 rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100/50 p-8">
        <div className="flex flex-col items-center justify-center gap-6">
          <div className="text-center">
            <div className="mb-3 flex justify-center">
              <div className="rounded-full bg-blue-600 p-3">
                <Sparkles size={32} className="text-white" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-slate-900">AI Debate Mode</h3>
            <p className="mt-2 text-slate-600">
              Get a balanced AI analysis of this topic with PRO and AGAINST arguments
            </p>
          </div>

          <button
            onClick={handleGenerateDebate}
            disabled={generatingDebate}
            className={`inline-flex items-center gap-2 rounded-full px-6 py-3 font-semibold transition-all ${
              generatingDebate
                ? 'bg-blue-400 text-white cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg'
            }`}
          >
            <Sparkles size={18} />
            {generatingDebate ? 'Generating AI Debate...' : 'Generate AI Debate'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-12 rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100/50 p-8">
      <div className="mb-6 flex items-center gap-3">
        <Sparkles size={24} className="text-blue-600" />
        <h2 className="text-2xl font-bold text-slate-900">AI Debate Analysis</h2>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-3 border-b border-blue-200">
        {(['pro', 'against', 'summary'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-3 font-semibold transition-all border-b-2 ${
              activeTab === tab
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            {tab === 'pro' && '✅ PRO'}
            {tab === 'against' && '❌ AGAINST'}
            {tab === 'summary' && '⚖️ SUMMARY'}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="mb-8 rounded-lg bg-white p-6">
        {activeTab === 'pro' && (
          <div>
            <h3 className="mb-3 text-lg font-semibold text-slate-900">Why This Side Makes Sense</h3>
            <p className="whitespace-pre-wrap text-slate-700 leading-relaxed">{debate.proText}</p>
          </div>
        )}

        {activeTab === 'against' && (
          <div>
            <h3 className="mb-3 text-lg font-semibold text-slate-900">Valid Counterarguments</h3>
            <p className="whitespace-pre-wrap text-slate-700 leading-relaxed">{debate.againstText}</p>
          </div>
        )}

        {activeTab === 'summary' && (
          <div>
            <h3 className="mb-3 text-lg font-semibold text-slate-900">Balanced Conclusion</h3>
            <p className="whitespace-pre-wrap text-slate-700 leading-relaxed">{debate.summary}</p>
          </div>
        )}
      </div>

      {/* Community Voting */}
      <div className="space-y-4">
        <p className="text-sm font-semibold text-slate-600">COMMUNITY SENTIMENT ({debate.totalVotes} votes)</p>

        {/* PRO Vote Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <button
              onClick={() => handleVote('PRO')}
              disabled={votingTab !== null}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 font-semibold transition-all ${
                debate.userVote === 'PRO'
                  ? 'bg-green-600 text-white'
                  : 'bg-green-100 text-green-700 hover:bg-green-200'
              }`}
            >
              <ThumbsUp size={16} />
              Agree
            </button>
            <span className="text-lg font-bold text-green-700">{getVotePercentageDisplay(debate.proPercentage)}%</span>
          </div>
          <div className="h-3 w-full rounded-full bg-gray-200 overflow-hidden">
            <div
              className="h-full bg-green-500 transition-all duration-300"
              style={{ width: `${debate.proPercentage}%` }}
            />
          </div>
          <p className="text-xs text-slate-500">{debate.proVotes} votes</p>
        </div>

        {/* AGAINST Vote Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <button
              onClick={() => handleVote('AGAINST')}
              disabled={votingTab !== null}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 font-semibold transition-all ${
                debate.userVote === 'AGAINST'
                  ? 'bg-red-600 text-white'
                  : 'bg-red-100 text-red-700 hover:bg-red-200'
              }`}
            >
              <ThumbsDown size={16} />
              Disagree
            </button>
            <span className="text-lg font-bold text-red-700">{getVotePercentageDisplay(debate.againstPercentage)}%</span>
          </div>
          <div className="h-3 w-full rounded-full bg-gray-200 overflow-hidden">
            <div
              className="h-full bg-red-500 transition-all duration-300"
              style={{ width: `${debate.againstPercentage}%` }}
            />
          </div>
          <p className="text-xs text-slate-500">{debate.againstVotes} votes</p>
        </div>
      </div>

      {!user && (
        <p className="mt-4 text-center text-sm text-slate-600">
          Sign in to vote on this debate
        </p>
      )}
    </div>
  );
}
