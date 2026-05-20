import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Expand,
  IndianRupee,
  Lock,
  MessageCircle,
  Send,
  Sparkles,
  ThumbsUp,
  X,
} from 'lucide-react';
import axiosInstance from '../config/api.ts';
import Loader from '../components/Loader.tsx';
import { useSelector } from 'react-redux';
import DebateSection from '../features/debates/DebateSection.tsx';
import { getApiErrorMessage, getApiSuccessMessage, showErrorToast, showSuccessToast } from '../utils/notify.ts';

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
  createdAt?: string;
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
  previewContent: string;
  authorId: number;
  username: string;
  tags: string[];
  thumbnailUrl?: string | null;
  mediaUrls?: string[];
  premiumContent?: boolean;
  accessType?: string;
  locked?: boolean;
  accessible?: boolean;
  subscribeToUnlock?: boolean;
  subscriptionPrice?: number;
  subscriptionCurrency?: string;
}

interface CheckoutSession {
  paymentReference: string;
  gateway: string;
  status: string;
  amount: number;
  currency: string;
  checkoutUrl?: string | null;
  paymentGatewayOrderId?: string;
  gatewayPublicKey?: string;
  message?: string;
}

export default function QuestionDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state: any) => state.auth);

  const [question, setQuestion] = useState<Question | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [loading, setLoading] = useState(true);
  const [newAnswer, setNewAnswer] = useState('');
  const [submittingAnswer, setSubmittingAnswer] = useState(false);
  const [expandedComments, setExpandedComments] = useState<Set<number>>(new Set());
  const [answerComments, setAnswerComments] = useState<Record<number, Comment[]>>({});
  const [newComments, setNewComments] = useState<Record<number, string>>({});
  const [submittingComments, setSubmittingComments] = useState<Set<number>>(new Set());
  const [checkoutSession, setCheckoutSession] = useState<CheckoutSession | null>(null);
  const [startingCheckout, setStartingCheckout] = useState(false);
  const [confirmingCheckout, setConfirmingCheckout] = useState(false);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [isMediaPreviewOpen, setIsMediaPreviewOpen] = useState(false);
  const displaySubscriptionCurrency = (currency?: string) =>
    !currency || currency.toUpperCase() === 'USD' ? 'INR' : currency.toUpperCase();

  useEffect(() => {
    fetchQuestionAndAnswers();
  }, [id, user?.id]);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const subscriptionStatus = searchParams.get('subscription');
    const subscriptionMessage = searchParams.get('subscriptionMessage');

    if (!subscriptionStatus) {
      return;
    }

    if (subscriptionStatus === 'success') {
      showSuccessToast('Subscription activated successfully');
    } else {
      showErrorToast(subscriptionMessage || 'Failed to activate subscription');
    }

    navigate(location.pathname, { replace: true });
  }, [location.pathname, location.search, navigate]);

  const fetchQuestionAndAnswers = async () => {
    if (!id) {
      return;
    }

    setLoading(true);
    try {
      const questionUrl = user?.id
        ? `/api/v1/questions/${id}?viewerUserId=${user.id}`
        : `/api/v1/questions/${id}`;
      const [questionRes, answersRes] = await Promise.all([
        axiosInstance.get(questionUrl),
        axiosInstance.get(`/api/v1/answers/question/${id}`),
      ]);

      const questionData = questionRes.data.data || questionRes.data;
      const answersData = answersRes.data.data || answersRes.data;

      setQuestion(questionData);
      setAnswers(answersData);
      setCheckoutSession(null);
    } catch (error: any) {
      console.error('Error fetching question:', error);
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnswer.trim() || !user?.id || question?.locked) {
      return;
    }

    setSubmittingAnswer(true);
    try {
      const response = await axiosInstance.post('/api/v1/answers', {
        content: newAnswer,
        questionId: Number(id),
        userId: user.id,
      });

      const createdAnswer = response.data.data || response.data;
      setAnswers((prev) => [createdAnswer, ...prev]);
      setNewAnswer('');
      showSuccessToast(getApiSuccessMessage(response.data, 'Answer posted successfully'));
    } catch (error) {
      console.error('Error submitting answer:', error);
      showErrorToast(getApiErrorMessage(error, 'Failed to submit answer'));
    } finally {
      setSubmittingAnswer(false);
    }
  };

  const toggleComments = async (answerId: number) => {
    const isExpanded = expandedComments.has(answerId);

    if (isExpanded) {
      setExpandedComments((prev) => {
        const next = new Set(prev);
        next.delete(answerId);
        return next;
      });
      return;
    }

    if (!answerComments[answerId]) {
      try {
        const response = await axiosInstance.get(`/api/v1/comments/answer/${answerId}`);
        const comments = response.data.data || response.data;
        setAnswerComments((prev) => ({ ...prev, [answerId]: comments }));
      } catch (error) {
        console.error('Error fetching comments:', error);
      }
    }

    setExpandedComments((prev) => new Set(prev).add(answerId));
  };

  const handleSubmitComment = async (answerId: number) => {
    const commentText = newComments[answerId];
    if (!commentText?.trim() || !user?.id || question?.locked) {
      return;
    }

    setSubmittingComments((prev) => new Set(prev).add(answerId));
    try {
      const response = await axiosInstance.post('/api/v1/comments', {
        content: commentText,
        answerId,
        userId: user.id,
      });

      const createdComment = response.data.data || response.data;
      setAnswerComments((prev) => ({
        ...prev,
        [answerId]: [...(prev[answerId] || []), createdComment],
      }));
      setNewComments((prev) => ({ ...prev, [answerId]: '' }));

      setAnswers((prev) =>
        prev.map((answer) =>
          answer.id === answerId ? { ...answer, commentCount: answer.commentCount + 1 } : answer,
        ),
      );
      showSuccessToast(getApiSuccessMessage(response.data, 'Comment posted successfully'));
    } catch (error) {
      console.error('Error submitting comment:', error);
      showErrorToast(getApiErrorMessage(error, 'Failed to submit comment'));
    } finally {
      setSubmittingComments((prev) => {
        const next = new Set(prev);
        next.delete(answerId);
        return next;
      });
    }
  };

  const loadRazorpayScript = async (): Promise<boolean> => {
    if (typeof window === 'undefined') {
      return false;
    }
    if ((window as any).Razorpay) {
      return true;
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.id = 'razorpay-script';
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => reject(new Error('Failed to load Razorpay SDK'));
      document.body.appendChild(script);
    });
  };

  const handleConfirmSubscription = async (paymentData?: {
    externalPaymentId: string;
    paymentGatewayOrderId: string;
    paymentSignature: string;
  }) => {
    if (!user?.id || !question?.authorId || !checkoutSession?.paymentReference) {
      return;
    }

    setConfirmingCheckout(true);
    try {
      await axiosInstance.post('/api/v1/subscriptions/confirm', {
        creatorId: question.authorId,
        subscriberId: user.id,
        paymentReference: checkoutSession.paymentReference,
        externalPaymentId: paymentData?.externalPaymentId,
        paymentGatewayOrderId: paymentData?.paymentGatewayOrderId || checkoutSession.paymentGatewayOrderId,
        paymentSignature: paymentData?.paymentSignature,
      });

      setCheckoutSession(null);
      await fetchQuestionAndAnswers();
      showSuccessToast('Subscription activated successfully');
    } catch (error: any) {
      console.error('Error confirming subscription:', error);
      showErrorToast(getApiErrorMessage(error, 'Failed to activate subscription'));
    } finally {
      setConfirmingCheckout(false);
    }
  };

  const openRazorpayCheckout = async (session: CheckoutSession) => {
    await loadRazorpayScript();
    const razorpayKey = session.gatewayPublicKey || import.meta.env.VITE_RAZORPAY_KEY_ID;
    const apiBaseUrl = import.meta.env.VITE_API_URL;
    if (!razorpayKey) {
      throw new Error('Razorpay public key is missing.');
    }
    if (!apiBaseUrl || !id || !user?.id || !question?.authorId) {
      throw new Error('Checkout callback configuration is incomplete.');
    }

    const callbackUrl = new URL('/api/v1/subscriptions/razorpay/callback', apiBaseUrl);
    callbackUrl.searchParams.set('creatorId', String(question.authorId));
    callbackUrl.searchParams.set('subscriberId', String(user.id));
    callbackUrl.searchParams.set('paymentReference', session.paymentReference);
    callbackUrl.searchParams.set('questionId', String(id));

    const options = {
      key: razorpayKey,
      amount: Math.round(session.amount * 100),
      currency: session.currency,
      order_id: session.paymentGatewayOrderId,
      name: `@${question?.username ?? 'Creator'}`,
      description: 'Subscribe for premium content',
      callback_url: callbackUrl.toString(),
      redirect: true,
      prefill: {
        name: user?.name,
        email: user?.email,
      },
      theme: {
        color: '#165d86',
      },
    };

    const rzp = new (window as any).Razorpay(options);
    rzp.open();
  };

  const handleStartSubscription = async () => {
    if (!user?.id || !question?.authorId) {
      return;
    }

    setStartingCheckout(true);
    try {
      const response = await axiosInstance.post('/api/v1/subscriptions/checkout', {
        creatorId: question.authorId,
        subscriberId: user.id,
        gateway: 'RAZORPAY',
      });

      const session: CheckoutSession = response.data.data || response.data;
      setCheckoutSession(session);

      if (session.gateway === 'RAZORPAY') {
        await openRazorpayCheckout(session);
      }
    } catch (error: any) {
      console.error('Error creating checkout:', error);
      showErrorToast(getApiErrorMessage(error, 'Failed to start subscription'));
    } finally {
      setStartingCheckout(false);
    }
  };

  useEffect(() => {
    setActiveMediaIndex(0);
    setIsMediaPreviewOpen(false);
  }, [question?.id]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (!question) {
    return (
      <div className="py-20 text-center">
        <h2 className="text-2xl font-bold text-gray-800">Question not found</h2>
      </div>
    );
  }

  const isLocked = Boolean(question.locked);
  const canShowDiscussion = !isLocked;
  const mediaGallery = [
    ...(question.thumbnailUrl ? [question.thumbnailUrl] : []),
    ...(question.mediaUrls || []),
  ].filter((mediaUrl, index, allMedia) => Boolean(mediaUrl) && allMedia.indexOf(mediaUrl) === index);
  const activeMediaUrl = mediaGallery[activeMediaIndex] || mediaGallery[0] || null;

  const showPreviousMedia = () => {
    if (mediaGallery.length <= 1) {
      return;
    }

    setActiveMediaIndex((prev) => (prev === 0 ? mediaGallery.length - 1 : prev - 1));
  };

  const showNextMedia = () => {
    if (mediaGallery.length <= 1) {
      return;
    }

    setActiveMediaIndex((prev) => (prev === mediaGallery.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="mx-auto w-full max-w-[1600px]">
      <div className="mb-8 overflow-hidden rounded-[30px] bg-white shadow-lg">
        <div className="border-b border-slate-200 bg-[linear-gradient(120deg,#0f4f73_0%,#1b6b96_38%,#b34e68_100%)] px-8 py-7 text-white">
          <div className="flex flex-wrap items-center gap-3">
            {question.premiumContent ? (
              <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/12 px-4 py-1.5 text-sm font-semibold backdrop-blur-md">
                <Lock size={15} />
                Premium post
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/12 px-4 py-1.5 text-sm font-semibold backdrop-blur-md">
                <Sparkles size={15} />
                Public discussion
              </span>
            )}
            <span className="text-sm text-white/75">by @{question.username}</span>
          </div>
          <h1 className="mt-4 text-4xl font-bold leading-tight">{question.title}</h1>
        </div>

        <div className="p-8">
          <div className="grid gap-8 xl:grid-cols-[320px_minmax(0,1fr)]">
            <aside className="space-y-5 xl:sticky xl:top-24 xl:self-start">
              {mediaGallery.length > 0 ? (
                <div className="space-y-3">
                  <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-slate-50 shadow-md">
                    <button
                      type="button"
                      onClick={() => setIsMediaPreviewOpen(true)}
                      className="group relative block w-full text-left"
                    >
                      <img
                        src={activeMediaUrl || undefined}
                        alt={question.title}
                        className="h-full max-h-[420px] w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                      />
                      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-slate-950/70 via-slate-900/10 to-transparent px-4 pb-4 pt-10">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/70">
                            Image preview
                          </p>
                          <p className="mt-1 text-sm font-semibold text-white">
                            Tap to open a larger preview
                          </p>
                        </div>
                        <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/14 px-3 py-2 text-xs font-semibold text-white backdrop-blur-sm">
                          <Expand size={14} />
                          Preview
                        </span>
                      </div>
                    </button>
                  </div>

                  {mediaGallery.length > 1 ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between px-1">
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                          Media gallery
                        </p>
                        <p className="text-xs font-medium text-slate-500">
                          {activeMediaIndex + 1} / {mediaGallery.length}
                        </p>
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        {mediaGallery.map((mediaUrl, index) => (
                          <button
                            key={`${mediaUrl}-${index}`}
                            type="button"
                            onClick={() => setActiveMediaIndex(index)}
                            className={`overflow-hidden rounded-2xl border bg-slate-50 shadow-sm transition-all ${
                              activeMediaIndex === index
                                ? 'border-[var(--color-brand)] ring-2 ring-[var(--color-brand-soft)]'
                                : 'border-slate-200 hover:-translate-y-0.5 hover:shadow-md'
                            }`}
                          >
                            <img
                              src={mediaUrl}
                              alt={`${question.title} media ${index + 1}`}
                              className="h-24 w-full object-cover"
                            />
                          </button>
                        ))}
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={showPreviousMedia}
                          className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50"
                        >
                          <ChevronLeft size={16} />
                          Prev
                        </button>
                        <button
                          type="button"
                          onClick={showNextMedia}
                          className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50"
                        >
                          Next
                          <ChevronRight size={16} />
                        </button>
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : null}

              <div className="rounded-[28px] border border-slate-200 bg-slate-50/90 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                  Quick view
                </p>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-white p-4 shadow-sm">
                    <p className="text-xs font-medium text-slate-500">Answers</p>
                    <p className="mt-2 text-2xl font-bold text-slate-900">{answers.length}</p>
                  </div>
                  <div className="rounded-2xl bg-white p-4 shadow-sm">
                    <p className="text-xs font-medium text-slate-500">Access</p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">
                      {isLocked ? 'Subscriber only' : 'Open to all'}
                    </p>
                  </div>
                </div>
                <div className="mt-4 rounded-2xl bg-white p-4 shadow-sm">
                  <p className="text-xs font-medium text-slate-500">Posted by</p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">@{question.username}</p>
                </div>
              </div>
            </aside>

            <div>
              <div className="mb-6 flex flex-wrap gap-2">
                {question.tags?.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-slate-100 px-4 py-1.5 text-sm font-semibold text-slate-700"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              <div className="prose mb-6 max-w-none">
                <p className="whitespace-pre-wrap text-lg leading-8 text-slate-700">
                  {question.content}
                </p>
              </div>

              {isLocked ? (
                <div className="rounded-[28px] border border-amber-200 bg-amber-50 p-6">
                  <div className="flex items-start gap-4">
                    <div className="mt-1 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
                      <Lock size={22} />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-slate-900">Subscriber-only content</h2>
                      <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600">
                        The preview is visible now. Subscribe to unlock the full post, discussion, answers, and comments.
                      </p>

                      <div className="mt-5 grid gap-4 rounded-2xl border border-white/90 bg-white/90 p-5 md:grid-cols-[1fr_auto] md:items-center">
                        <div>
                          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                            <IndianRupee size={16} className="text-[#07528f]" />
                            {displaySubscriptionCurrency(question.subscriptionCurrency)} {question.subscriptionPrice || 9.99} / month
                          </div>
                          <p className="mt-2 text-sm text-slate-600">
                            Subscribe to @{question.username} to unlock this premium post and future subscriber-only content.
                          </p>
                        </div>
                        <div className="flex flex-col gap-3">
                          <button
                            type="button"
                            onClick={handleStartSubscription}
                            disabled={startingCheckout}
                            className="rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {startingCheckout ? 'Starting checkout...' : 'Start subscription'}
                          </button>
                          {checkoutSession && checkoutSession.gateway !== 'RAZORPAY' ? (
                            <button
                              type="button"
                              onClick={() => handleConfirmSubscription()}
                              disabled={confirmingCheckout}
                              className="rounded-full border border-[#165d86] px-6 py-3 text-sm font-semibold text-[#165d86] transition-colors hover:bg-[#165d86]/5 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {confirmingCheckout ? 'Activating...' : 'Confirm payment'}
                            </button>
                          ) : null}
                        </div>
                      </div>

                      {checkoutSession ? (
                        <p className="mt-4 text-xs font-medium text-slate-500">
                          {checkoutSession.gateway === 'RAZORPAY'
                            ? 'A Razorpay window should open. Complete the payment to activate your subscription.'
                            : `Checkout reference: ${checkoutSession.paymentReference}`}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </div>
              ) : null}

              <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-4">
                <p className="text-sm text-gray-600">
                  Posted by <span className="font-semibold text-gray-800">{question.username}</span>
                </p>
                <p className="text-sm text-gray-500">
                  {canShowDiscussion ? `${answers.length} ${answers.length === 1 ? 'Answer' : 'Answers'}` : 'Discussion unlocks after subscription'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {canShowDiscussion ? (
        <>
          <DebateSection questionId={question.id} />

          <div className="mb-8 rounded-2xl bg-white p-6 shadow-lg">
            <h2 className="mb-4 text-2xl font-bold text-gray-900">Your Answer</h2>
            <form onSubmit={handleSubmitAnswer}>
              <textarea
                value={newAnswer}
                onChange={(e) => setNewAnswer(e.target.value)}
                placeholder="Write your answer here..."
                className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 outline-none transition-all focus:border-transparent focus:ring-2 focus:ring-[#165d86]"
                rows={6}
                required
              />
              <div className="mt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={submittingAnswer || !newAnswer.trim()}
                  className="flex items-center gap-2 rounded-xl bg-[#165d86] px-6 py-3 font-semibold text-white transition-colors hover:bg-[#124a6b] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Send size={18} />
                  {submittingAnswer ? 'Posting...' : 'Post Answer'}
                </button>
              </div>
            </form>
          </div>

          <div className="space-y-6">
            {answers.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-slate-100 p-12 text-center shadow-sm">
                <MessageCircle size={48} className="mx-auto mb-4 text-slate-400" />
                <p className="text-lg font-semibold text-slate-900">No answers yet</p>
                <p className="mt-2 text-slate-600">Be the first to share your thoughts!</p>
              </div>
            ) : (
              answers.map((answer) => (
                <div key={answer.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#165d86] to-[#b34e68] text-sm font-bold text-white">
                        {answer.user?.name?.charAt(0).toUpperCase() || 'A'}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{answer.user?.name || 'Anonymous'}</p>
                        {answer.createdAt && (
                          <p className="text-xs text-slate-500">
                            {new Date(answer.createdAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-[#165d86]">
                        <ThumbsUp size={16} />
                        <span>{answer.likeCount}</span>
                      </button>
                      <button
                        onClick={() => toggleComments(answer.id)}
                        className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-[#165d86]"
                      >
                        <MessageCircle size={16} />
                        <span>{answer.commentCount}</span>
                        {expandedComments.has(answer.id) ? (
                          <ChevronUp size={16} />
                        ) : (
                          <ChevronDown size={16} />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="mb-6 border-t border-slate-100 pt-4">
                    <p className="whitespace-pre-wrap text-base leading-7 text-slate-700">{answer.content}</p>
                  </div>

                  {expandedComments.has(answer.id) ? (
                    <div className="space-y-3 border-t border-slate-100 pt-4">
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {answerComments[answer.id]?.map((comment) => (
                          <div key={comment.id} className="rounded-lg bg-slate-50 p-4">
                            <div className="mb-2 flex items-center justify-between">
                              <p className="text-sm font-semibold text-slate-900">
                                {comment.user?.name || 'Anonymous'}
                              </p>
                              <button className="flex items-center gap-1 text-xs text-slate-600 transition-colors hover:text-[#165d86]">
                                <ThumbsUp size={14} />
                                <span>{comment.likeCount}</span>
                              </button>
                            </div>
                            <p className="text-sm text-slate-700">{comment.content}</p>
                          </div>
                        ))}
                      </div>

                      {user && !question?.locked ? (
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            handleSubmitComment(answer.id);
                          }}
                          className="mt-4 flex gap-2"
                        >
                          <input
                            type="text"
                            value={newComments[answer.id] || ''}
                            onChange={(e) =>
                              setNewComments((prev) => ({
                                ...prev,
                                [answer.id]: e.target.value,
                              }))
                            }
                            placeholder="Write a comment..."
                            className="flex-1 rounded-lg border border-slate-200 px-4 py-2 text-sm outline-none transition-all focus:border-transparent focus:ring-2 focus:ring-[#165d86]"
                          />
                          <button
                            type="submit"
                            disabled={
                              submittingComments.has(answer.id) ||
                              !newComments[answer.id]?.trim()
                            }
                            className="rounded-lg bg-[#165d86] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#124a6b] disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {submittingComments.has(answer.id) ? 'Posting...' : 'Post'}
                          </button>
                        </form>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              ))
            )}
          </div>
        </>
      ) : null}

      {isMediaPreviewOpen && activeMediaUrl ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/84 p-4 backdrop-blur-md sm:p-6">
          <button
            type="button"
            onClick={() => setIsMediaPreviewOpen(false)}
            className="absolute right-4 top-4 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white transition-colors hover:bg-white/18 sm:right-6 sm:top-6"
          >
            <X size={18} />
          </button>

          {mediaGallery.length > 1 ? (
            <button
              type="button"
              onClick={showPreviousMedia}
              className="absolute left-3 top-1/2 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white transition-colors hover:bg-white/18 sm:left-6"
            >
              <ChevronLeft size={20} />
            </button>
          ) : null}

          <div className="w-full max-w-6xl">
            <div className="overflow-hidden rounded-[28px] border border-white/10 bg-slate-900 shadow-[0_35px_90px_rgba(0,0,0,0.35)]">
              <img
                src={activeMediaUrl}
                alt={question.title}
                className="max-h-[82vh] w-full object-contain"
              />
            </div>
            <div className="mt-4 flex items-center justify-between gap-3 text-white/80">
              <p className="truncate text-sm font-medium">{question.title}</p>
              <p className="shrink-0 text-sm font-semibold">
                {activeMediaIndex + 1} / {mediaGallery.length}
              </p>
            </div>
          </div>

          {mediaGallery.length > 1 ? (
            <button
              type="button"
              onClick={showNextMedia}
              className="absolute right-3 top-1/2 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white transition-colors hover:bg-white/18 sm:right-6"
            >
              <ChevronRight size={20} />
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
