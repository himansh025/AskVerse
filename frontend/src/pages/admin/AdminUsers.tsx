import { useEffect, useState } from 'react';
import axiosInstance from '../../config/api.ts';
import Loader from '../../components/Loader.tsx';
import { Trash2 } from 'lucide-react';
import { showErrorToast, showSuccessToast } from '../../utils/notify.ts';

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data } = await axiosInstance.get('/api/v1/admin/users');
      setUsers(data.data);
    } catch (err) {
      console.error('Failed to load users', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('WARNING: Deleting this user will ALSO delete all their posts, answers, comments, and uploaded media. Their payment transaction history will remain intact. This action cannot be undone. Are you absolutely sure?')) return;
    try {
      await axiosInstance.delete(`/api/v1/admin/users/${id}`);
      showSuccessToast('User deleted successfully');
      setUsers(users.filter(u => u.id !== id));
    } catch (err) {
      showErrorToast('Failed to delete user');
    }
  };

  if (loading) return <Loader />;

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-brand text-2xl font-bold text-slate-900">Manage Users</h2>
        <p className="text-slate-500 mt-1">View and manage all registered users on the platform.</p>
      </div>
      
      <div className="overflow-x-auto rounded-2xl border border-white/60 bg-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-md">
        <table className="w-full text-left text-sm text-slate-500">
          <thead className="border-b border-slate-200/60 bg-slate-50/50 text-xs uppercase text-slate-700">
            <tr>
              <th scope="col" className="px-6 py-4">User</th>
              <th scope="col" className="px-6 py-4">Role</th>
              <th scope="col" className="px-6 py-4">Questions</th>
              <th scope="col" className="px-6 py-4">Tags Followed</th>
              <th scope="col" className="px-6 py-4">Joined</th>
              <th scope="col" className="px-6 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/60">
            {users.filter(u => u.role !== 'ADMIN').map((user) => (
              <tr key={user.id} className="transition-colors hover:bg-slate-50/50">
                <td className="flex items-center whitespace-nowrap px-6 py-4">
                  <div className="h-10 w-10 flex-shrink-0">
                    <img className="h-10 w-10 rounded-full object-cover shadow-sm" src={user.profilePicture || `https://ui-avatars.com/api/?name=${user.name}`} alt={user.name} />
                  </div>
                  <div className="pl-4">
                    <div className="text-sm font-semibold text-slate-900">{user.name}</div>
                    <div className="text-xs text-slate-500">{user.email}</div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-700'}`}>
                    {user.role || 'USER'}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-600 font-medium">
                  {user.questionsCount || 0}
                </td>
                <td className="px-6 py-4 text-slate-600 font-medium">
                  {user.followedTagsCount || 0}
                </td>
                <td className="px-6 py-4 text-slate-600">
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                </td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => handleDelete(user.id)} className="inline-flex h-8 w-8 items-center justify-center rounded-full text-red-500 transition-colors hover:bg-red-50 hover:text-red-600">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
