import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../config/api.ts';
import Loader from '../../components/Loader.tsx';
import { useSelector } from 'react-redux';
import {
  HelpCircle,
  Tag as TagIcon,
  FileText,
  Lightbulb,
  CheckCircle,
  AlertCircle,
  Eye,
  Send,
  Search,
  X
} from 'lucide-react';

interface Tag {
  id: number;
  name: string;
}

export default function AskQuestionPage() {
  const [form, setForm] = useState({ title: '', content: '', tagIds: '' });
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [tagSearch, setTagSearch] = useState('');
  const [isTagDropdownOpen, setIsTagDropdownOpen] = useState(false);
  const [errors, setErrors] = useState({ title: '', content: '', tags: '' });
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

  const validateForm = () => {
    const newErrors = { title: '', content: '', tags: '' };
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

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      const { data } = await axiosInstance.post('/api/v1/questions', {
        title: form.title,
        content: form.content,
        userId: user.id,
        tagIds: selectedTags
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

  const filteredTags = availableTags.filter(tag =>
    tag.name.toLowerCase().includes(tagSearch.toLowerCase()) &&
    !selectedTags.includes(tag.id)
  );

  if (!user) return <Loader />;

  const titleCharCount = form.title.length;
  const contentCharCount = form.content.length;

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#07528f] to-[#8f0752] flex items-center justify-center">
              <HelpCircle className="text-white" size={24} />
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