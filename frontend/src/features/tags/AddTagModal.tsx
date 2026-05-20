import { useState } from 'react';
import { Hash, Sparkles, X } from 'lucide-react';
import axiosInstance from '../../config/api.ts';
import Button from '../../components/Button.tsx';
import { getApiErrorMessage, getApiSuccessMessage, showErrorToast, showSuccessToast } from '../../utils/notify.ts';

interface AddTagModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTagAdded: (newTag: any) => void;
}

export default function AddTagModal({ isOpen, onClose, onTagAdded }: AddTagModalProps) {
  const [tagName, setTagName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!tagName.trim()) {
      setError('Tag name is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axiosInstance.post('/api/v1/tags', {
        name: tagName.trim(),
      });

      const newTag = response.data.data || response.data;
      setTagName('');
      onTagAdded(newTag);
      showSuccessToast(getApiSuccessMessage(response.data, 'Tag created successfully'));
      onClose();
    } catch (error: any) {
      console.error('Failed to create tag:', error);
      const message = getApiErrorMessage(error, 'Failed to create tag');
      setError(message);
      showErrorToast(message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setTagName('');
    setError('');
    onClose();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-md">
      <div className="relative w-full max-w-xl overflow-hidden rounded-[32px] border border-white/60 bg-[rgba(255,255,255,0.92)] shadow-[0_32px_90px_rgba(21,35,58,0.24)]">
        <div className="absolute -left-8 top-8 h-28 w-28 rounded-full bg-[var(--color-brand)]/12 blur-3xl" />
        <div className="absolute -right-8 bottom-0 h-32 w-32 rounded-full bg-[var(--color-accent)]/14 blur-3xl" />

        <div className="relative p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-brand-soft)] text-[var(--color-brand)]">
                <Hash size={24} />
              </div>
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  <Sparkles size={12} className="text-[var(--color-accent)]" />
                  New topic
                </div>
                <h2 className="font-brand mt-3 text-3xl font-bold text-slate-900">Create a Tag</h2>
                <p className="mt-2 max-w-md text-sm leading-6 text-slate-600">
                  Start a clean topic hub people can discover, follow, and use when asking more focused questions.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleClose}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white/90 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div className="rounded-[28px] border border-slate-200/80 bg-white/80 p-5 shadow-[0_18px_42px_rgba(21,35,58,0.06)]">
              <label htmlFor="tagName" className="block text-sm font-semibold text-slate-700">
                Tag name
              </label>
              <p className="mt-1 text-sm text-slate-500">
                Keep it short, searchable, and easy to understand.
              </p>

              <div className="mt-4 flex items-center rounded-2xl border border-slate-200 bg-white px-4 focus-within:border-[var(--color-brand)] focus-within:ring-4 focus-within:ring-[var(--color-brand-soft)]/80">
                <span className="text-lg font-bold text-[var(--color-brand)]">#</span>
                <input
                  type="text"
                  id="tagName"
                  value={tagName}
                  onChange={(e) => setTagName(e.target.value)}
                  placeholder="react, system-design, startups"
                  className="w-full bg-transparent px-3 py-4 text-sm text-slate-700 outline-none placeholder:text-slate-400"
                  disabled={loading}
                />
              </div>

              <div className="mt-4 rounded-2xl bg-slate-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Preview</p>
                <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700">
                  <Hash size={14} className="text-[var(--color-brand)]" />
                  {tagName.trim() || 'your-tag'}
                </div>
              </div>

              {error ? (
                <p className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
                  {error}
                </p>
              ) : null}
            </div>

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="secondary"
                onClick={handleClose}
                disabled={loading}
                className="justify-center"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading || !tagName.trim()}
                className="justify-center"
              >
                {loading ? 'Creating...' : 'Create Tag'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
