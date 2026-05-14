import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../config/api.ts';
import Loader from '../components/Loader.tsx';
import { useSelector } from 'react-redux';
import {
  HelpCircle,
  Tag as TagIcon,
  FileText,
  ImagePlus,
  Lightbulb,
  CheckCircle,
  AlertCircle,
  Eye,
  Send,
  Search,
  Upload,
  X,
  Lock,
  Sparkles,
  BadgeDollarSign
} from 'lucide-react';

interface Tag {
  id: number;
  name: string;
}

export default function AskQuestionPage() {
  const [form, setForm] = useState({
    title: '',
    content: '',
    previewContent: '',
    premiumContent: false,
    isAnonymous: false,
  });
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [selectedMedia, setSelectedMedia] = useState<File[]>([]);
  const [mediaPreviews, setMediaPreviews] = useState<string[]>([]);
  const [tagSearch, setTagSearch] = useState('');
  const [isTagDropdownOpen, setIsTagDropdownOpen] = useState(false);
  const [errors, setErrors] = useState({
    title: '',
    content: '',
    tags: '',
    media: '',
    previewContent: '',
    premiumContent: '',
    isAnonymous: '',
  });
  const navigate = useNavigate();
  const { user } = useSelector((state: any) => state.auth);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const { data } = await axiosInstance.get('/api/v1/tags');
        setAvailableTags(data.data || data);
      } catch (error) {
        console.error('Failed to fetch tags:', error);
      }
    };
    fetchTags();
  }, []);

  useEffect(() => {
    const previews = selectedMedia.map((file) => URL.createObjectURL(file));
    setMediaPreviews(previews);

    return () => {
      previews.forEach((preview) => URL.revokeObjectURL(preview));
    };
  }, [selectedMedia]);

  const validateForm = () => {
    const newErrors = { title: '', content: '', tags: '', media: '', previewContent: '', premiumContent: '' };
    let isValid = true;

    if (form.title.length < 10) {
      newErrors.title = 'Title must be at least 10 characters';
      isValid = false;
    }
    if (form.content.length < 20) {
      newErrors.content = 'Content must be at least 20 characters';
      isValid = false;
    }
    if (selectedTags.length === 0) {
      newErrors.tags = 'Please select at least one tag';
      isValid = false;
    }
    if (form.premiumContent) {
      if (!user?.premiumCreatorEnabled) {
        newErrors.premiumContent = 'Enable creator subscriptions in your profile before posting premium content.';
        isValid = false;
      }
      if (form.previewContent.trim().length < 20) {
        newErrors.previewContent = 'Add a short preview so non-subscribers can see what the premium post is about.';
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      const payload = new FormData();
      payload.append('title', form.title);
      payload.append('content', form.content);
      payload.append('previewContent', form.premiumContent ? form.previewContent : form.content.slice(0, 220));
      payload.append('premiumContent', String(form.premiumContent));
      payload.append('accessType', form.premiumContent ? 'PREMIUM' : 'FREE');
      payload.append('userId', String(user.id));
      payload.append('isAnonymous', String(form.isAnonymous));
      selectedTags.forEach((tagId) => payload.append('tagIds', String(tagId)));
      selectedMedia.forEach((file) => payload.append('media', file));

      const { data } = await axiosInstance.post('/api/v1/questions', payload, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Question created:', data);
      navigate('/');
    } catch (error: any) {
      console.error('Error creating question:', error);
      alert('Failed to post question. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const addTag = (tag: Tag) => {
    if (!selectedTags.includes(tag.id)) {
      setSelectedTags([...selectedTags, tag.id]);
      setTagSearch('');
      setErrors({ ...errors, tags: '' });
    }
    setIsTagDropdownOpen(false);
  };

  const removeTag = (tagId: number) => {
    setSelectedTags(selectedTags.filter(id => id !== tagId));
  };

  const handleMediaChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const imageFiles = files.filter((file) => file.type.startsWith('image/'));

    if (imageFiles.length !== files.length) {
      setErrors((prev) => ({ ...prev, media: 'Only image files are allowed.' }));
    } else {
      setErrors((prev) => ({ ...prev, media: '' }));
    }

    setSelectedMedia((prev) => [...prev, ...imageFiles]);
    event.target.value = '';
  };

  const removeMedia = (indexToRemove: number) => {
    setSelectedMedia((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const filteredTags = availableTags.filter(tag =>
    tag.name.toLowerCase().includes(tagSearch.toLowerCase()) &&
    !selectedTags.includes(tag.id)
  );

  if (!user) return <Loader />;

  const titleCharCount = form.title.length;
  const contentCharCount = form.content.length;
  const previewCharCount = form.previewContent.length;

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold  mb-2 flex items-center gap-3" style={{ color: '#07528f' }}>
            <div className="w-12 h-12 rounded-full  flex items-center justify-center" style={{backgroundColor:"#8f0752"}}>
              <HelpCircle className=""style={{ color: '#e5e8ebff' }} size={24} />
            </div>
            Ask a Question
          </h1>
          <p className="text-gray-600 text-lg">Share your question with the community</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8">
              {/* Title Input */}
              <div className="mb-6">
                <label className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <FileText size={16} className="text-[#07528f]" />
                    Question Title
                  </span>
                  <span className={`text-xs font-medium ${titleCharCount < 10 ? 'text-gray-400' : titleCharCount < 100 ? 'text-green-600' : 'text-orange-600'}`}>
                    {titleCharCount}/150
                  </span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., How do I implement authentication in React?"
                  value={form.title}
                  onChange={(e) => {
                    setForm({ ...form, title: e.target.value });
                    setErrors({ ...errors, title: '' });
                  }}
                  maxLength={150}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${errors.title
                    ? 'border-red-300 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-[#07528f]'
                    }`}
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle size={14} /> {errors.title}
                  </p>
                )}
              </div>

              {/* Content Textarea */}
              <div className="mb-6">
                <label className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <FileText size={16} className="text-[#07528f]" />
                    Question Details
                  </span>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-medium ${contentCharCount < 20 ? 'text-gray-400' : 'text-green-600'}`}>
                      {contentCharCount} characters
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowPreview(!showPreview)}
                      className="text-xs text-[#07528f] hover:underline flex items-center gap-1"
                    >
                      <Eye size={14} />
                      {showPreview ? 'Edit' : 'Preview'}
                    </button>
                  </div>
                </label>

                {!showPreview ? (
                  <textarea
                    placeholder="Provide all the details someone would need to answer your question. Be specific and clear."
                    value={form.content}
                    onChange={(e) => {
                      setForm({ ...form, content: e.target.value });
                      setErrors({ ...errors, content: '' });
                    }}
                    rows={12}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all resize-none ${errors.content
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-[#07528f]'
                      }`}
                  />
                ) : (
                  <div className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 min-h-[288px]">
                    <div className="prose max-w-none">
                      <p className="text-gray-700 whitespace-pre-wrap">{form.content || 'Your question details will appear here...'}</p>
                    </div>
                  </div>
                )}
                {errors.content && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle size={14} /> {errors.content}
                  </p>
                )}
              </div>

              <div className="mb-8 rounded-2xl border border-amber-200 bg-amber-50/70 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                      <Lock size={16} className="text-amber-700" />
                      Premium subscriber-only content
                    </label>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      Turn this on to make the full post visible only to people who subscribe to your content.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (!user?.premiumCreatorEnabled) {
                        setErrors((prev) => ({
                          ...prev,
                          premiumContent: 'Enable creator subscriptions in your profile before posting premium content.',
                        }));
                        return;
                      }

                      setForm((prev) => ({
                        ...prev,
                        premiumContent: !prev.premiumContent,
                        previewContent: prev.previewContent || prev.content.slice(0, 220),
                      }));
                      setErrors((prev) => ({ ...prev, premiumContent: '', previewContent: '' }));
                    }}
                    className={`inline-flex h-11 min-w-[110px] items-center justify-center rounded-full px-4 text-sm font-semibold transition-all ${
                      form.premiumContent
                        ? 'bg-slate-900 text-white shadow-md'
                        : 'border border-slate-300 bg-white text-slate-700'
                    }`}
                  >
                    {form.premiumContent ? 'Premium on' : 'Premium off'}
                  </button>
                </div>

                <div className="mt-4 grid gap-4 rounded-2xl border border-white/80 bg-white/80 p-4 md:grid-cols-[1.2fr_0.8fr]">
                  <div className="rounded-2xl bg-slate-900 px-4 py-4 text-white">
                    <div className="flex items-center gap-2 text-sm font-semibold text-amber-300">
                      <Sparkles size={16} />
                      Creator subscription status
                    </div>
                    <p className="mt-3 text-lg font-semibold">
                      {user?.premiumCreatorEnabled ? 'Enabled' : 'Not enabled yet'}
                    </p>
                    <p className="mt-2 text-sm text-slate-300">
                      {user?.premiumCreatorEnabled
                        ? `Subscribers will unlock your full post for ${user.subscriptionCurrency || 'USD'} ${user.subscriptionPrice || '9.99'} per month.`
                        : 'Enable subscriptions from your profile edit page before publishing premium posts.'}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                      <BadgeDollarSign size={16} className="text-[#07528f]" />
                      Reader experience
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-600">
                      Non-subscribers will only see your preview text. Subscribers and you will see the full post.
                    </p>
                  </div>
                </div>

                {errors.premiumContent ? (
                  <p className="mt-3 flex items-center gap-1 text-sm text-red-600">
                    <AlertCircle size={14} /> {errors.premiumContent}
                  </p>
                ) : null}

                {form.premiumContent ? (
                  <div className="mt-4">
                    <label className="mb-2 flex items-center justify-between text-sm font-semibold text-gray-700">
                      <span className="flex items-center gap-2">
                        <Eye size={16} className="text-[#07528f]" />
                        Preview for non-subscribers
                      </span>
                      <span className={`text-xs font-medium ${previewCharCount < 20 ? 'text-gray-400' : 'text-green-600'}`}>
                        {previewCharCount} characters
                      </span>
                    </label>
                    <textarea
                      placeholder="Write a short teaser that shows the value of the premium post without giving away the full answer."
                      value={form.previewContent}
                      onChange={(e) => {
                        setForm((prev) => ({ ...prev, previewContent: e.target.value }));
                        setErrors((prev) => ({ ...prev, previewContent: '' }));
                      }}
                      rows={5}
                      className={`w-full rounded-2xl border px-4 py-3 focus:outline-none focus:ring-2 transition-all resize-none ${
                        errors.previewContent
                          ? 'border-red-300 focus:ring-red-500'
                          : 'border-gray-300 focus:ring-[#07528f]'
                      }`}
                    />
                    {errors.previewContent ? (
                      <p className="mt-2 flex items-center gap-1 text-sm text-red-600">
                        <AlertCircle size={14} /> {errors.previewContent}
                      </p>
                    ) : null}
                  </div>
                ) : null}
              </div>

              {/* Anonymous Posting Section */}
              <div className="mb-8 rounded-2xl border border-blue-200 bg-blue-50/70 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                      <Eye size={16} className="text-blue-700" />
                      Post anonymously
                    </label>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      Hide your identity when posting this question. Your name won't be displayed publicly, but the system will still know you posted it.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setForm((prev) => ({
                        ...prev,
                        isAnonymous: !prev.isAnonymous,
                      }));
                      setErrors((prev) => ({ ...prev, isAnonymous: '' }));
                    }}
                    className={`inline-flex h-11 min-w-[110px] items-center justify-center rounded-full px-4 text-sm font-semibold transition-all ${
                      form.isAnonymous
                        ? 'bg-slate-900 text-white shadow-md'
                        : 'border border-slate-300 bg-white text-slate-700'
                    }`}
                  >
                    {form.isAnonymous ? 'Anonymous' : 'Not anon'}
                  </button>
                </div>
              </div>

              {/* Tag Selection */}
              <div className="mb-8">
                <label className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <TagIcon size={16} className="text-[#07528f]" />
                  Select Tags
                </label>

                {/* Selected Tags */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {selectedTags.map((tagId) => {
                    const tag = availableTags.find(t => t.id === tagId);
                    if (!tag) return null;
                    return (
                      <span
                        key={tag.id}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-[#07528f] text-white"
                      >
                        #{tag.name}
                        <button
                          type="button"
                          onClick={() => removeTag(tag.id)}
                          className="hover:text-red-200 transition-colors"
                        >
                          <X size={14} />
                        </button>
                      </span>
                    );
                  })}
                </div>

                {/* Search Input */}
                <div className="relative">
                  <div className={`flex items-center border rounded-lg px-3 py-2 transition-all ${isTagDropdownOpen ? 'ring-2 ring-[#07528f] border-transparent' : 'border-gray-300'
                    }`}>
                    <Search size={18} className="text-gray-400 mr-2" />
                    <input
                      type="text"
                      placeholder="Search tags..."
                      value={tagSearch}
                      onChange={(e) => {
                        setTagSearch(e.target.value);
                        setIsTagDropdownOpen(true);
                      }}
                      onFocus={() => setIsTagDropdownOpen(true)}
                      onBlur={() => setTimeout(() => setIsTagDropdownOpen(false), 200)}
                      className="flex-1 outline-none bg-transparent"
                    />
                  </div>

                  {/* Dropdown */}
                  {isTagDropdownOpen && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {filteredTags.length > 0 ? (
                        filteredTags.map((tag) => (
                          <button
                            key={tag.id}
                            type="button"
                            onClick={() => addTag(tag)}
                            className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-700 text-sm transition-colors flex items-center justify-between group"
                          >
                            <span>#{tag.name}</span>
                            <span className="text-xs text-gray-400 group-hover:text-[#07528f]">Select</span>
                          </button>
                        ))
                      ) : (
                        <div className="px-4 py-3 text-sm text-gray-500 text-center">
                          No tags found matching "{tagSearch}"
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {errors.tags && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle size={14} /> {errors.tags}
                  </p>
                )}
              </div>

              <div className="mb-8">
                <label className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <ImagePlus size={16} className="text-[#07528f]" />
                  Upload Images
                </label>

                <label className="block cursor-pointer rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 px-5 py-6 text-center transition-all hover:border-[#07528f] hover:bg-[#07528f]/5">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white text-[#07528f] shadow-sm">
                    <Upload size={20} />
                  </div>
                  <p className="text-sm font-semibold text-gray-800">Choose one or more images</p>
                  <p className="mt-1 text-xs text-gray-500">
                    The first uploaded image will be used as the question thumbnail in the feed.
                  </p>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleMediaChange}
                    className="hidden"
                  />
                </label>

                {errors.media && (
                  <p className="mt-2 flex items-center gap-1 text-sm text-red-600">
                    <AlertCircle size={14} /> {errors.media}
                  </p>
                )}

                {selectedMedia.length > 0 && (
                  <div className="mt-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-gray-800">
                        Selected images ({selectedMedia.length})
                      </p>
                      <p className="text-xs text-gray-500">Image 1 will be the thumbnail</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                      {mediaPreviews.map((preview, index) => (
                        <div
                          key={`${selectedMedia[index]?.name ?? 'preview'}-${index}`}
                          className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white"
                        >
                          <img
                            src={preview}
                            alt={`Upload preview ${index + 1}`}
                            className="h-32 w-full object-cover"
                          />
                          <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/70 to-transparent px-3 py-2 text-xs text-white">
                            <span>{index === 0 ? 'Thumbnail' : `Image ${index + 1}`}</span>
                            <button
                              type="button"
                              onClick={() => removeMedia(index)}
                              className="rounded-full bg-white/20 p-1 transition-colors hover:bg-white/30"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-[#07528f] to-[#8f0752] text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Posting...
                    </>
                  ) : (
                    <>
                      <Send size={18} />
                      Post Question
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>

          {/* Tips Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-24">
              <div className="flex items-center gap-2 mb-4">
                <Lightbulb className="text-yellow-500" size={24} />
                <h3 className="text-lg font-semibold text-gray-900">Writing Tips</h3>
              </div>

              <div className="space-y-4">
                <div className="flex gap-3">
                  <CheckCircle className="text-green-500 flex-shrink-0 mt-0.5" size={18} />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Be specific</p>
                    <p className="text-xs text-gray-600">Include relevant details and context</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <CheckCircle className="text-green-500 flex-shrink-0 mt-0.5" size={18} />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Clear title</p>
                    <p className="text-xs text-gray-600">Summarize your problem in the title</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <CheckCircle className="text-green-500 flex-shrink-0 mt-0.5" size={18} />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Add tags</p>
                    <p className="text-xs text-gray-600">Help others find your question</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <CheckCircle className="text-green-500 flex-shrink-0 mt-0.5" size={18} />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Show research</p>
                    <p className="text-xs text-gray-600">Mention what you've already tried</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Example Questions</h4>
                <ul className="space-y-2 text-xs text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="text-[#07528f] mt-0.5">•</span>
                    <span>How do I center a div in CSS?</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#07528f] mt-0.5">•</span>
                    <span>What's the difference between let and const?</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#07528f] mt-0.5">•</span>
                    <span>How to implement JWT authentication?</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
