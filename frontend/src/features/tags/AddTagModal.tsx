// src/components/AddTagModal.tsx
import { useState } from 'react';
import axiosInstance from '../../config/api.ts';
import Button from '../../components/Button.tsx';

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
        name: tagName.trim()
      });

      // Clear form and close modal
      setTagName('');
      onTagAdded(response.data);
      onClose();
    } catch (error: any) {
      console.error('Failed to create tag:', error);
      setError(error.response?.data?.message || 'Failed to create tag. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setTagName('');
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">Create New Tag</h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="tagName" className="block text-sm font-medium text-gray-700 mb-2">
                Tag Name
              </label>
              <input
                type="text"
                id="tagName"
                value={tagName}
                onChange={(e) => setTagName(e.target.value)}
                placeholder="Enter tag name (e.g., React)"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading}
              />
              {error && (
                <p className="text-red-500 text-sm mt-2">{error}</p>
              )}
            </div>

            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                // variant="outline"
                onClick={handleClose}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading || !tagName.trim()}
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