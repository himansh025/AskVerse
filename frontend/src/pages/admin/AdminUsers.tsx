import { useEffect, useState } from 'react';
import axiosInstance from '../../config/api.ts';
import Loader from '../../components/Loader.tsx';
import { Trash2, IndianRupee, X } from 'lucide-react';
import { showErrorToast, showSuccessToast } from '../../utils/notify.ts';

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [payoutAmount, setPayoutAmount] = useState<string>('');
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);
  const [payoutLoading, setPayoutLoading] = useState(false);

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

  const handlePayoutClick = (user: any) => {
    setSelectedUser(user);
    setPayoutAmount(String(user.pendingPayoutBalance || '0.00'));
    setIsPayoutModalOpen(true);
  };

  const handleProcessPayout = async () => {
    const amount = parseFloat(payoutAmount);
    if (isNaN(amount) || amount <= 0) {
      showErrorToast('Please enter a valid payout amount');
      return;
    }

    setPayoutLoading(true);
    try {
      const { data } = await axiosInstance.post(`/api/v1/admin/users/${selectedUser.id}/payout`, { amount });
      
      await loadRazorpayScript();
      
      const options = {
        key: data.data.key,
        amount: Math.round(amount * 100),
        currency: data.data.currency,
        order_id: data.data.orderId,
        name: 'AskVerse Creator Payout',
        description: `Payout transfer to ${selectedUser.name}`,
        handler: async function (response: any) {
          try {
            await axiosInstance.post('/api/v1/admin/payout/confirm', {
              paymentReference: data.data.paymentReference,
              externalPaymentId: response.razorpay_payment_id,
              paymentSignature: response.razorpay_signature
            });
            showSuccessToast(`Payout of ₹${amount.toFixed(2)} completed successfully via Razorpay!`);
            setIsPayoutModalOpen(false);
            fetchUsers();
          } catch (err: any) {
            showErrorToast('Payment completed but verification failed');
          }
        },
        prefill: {
          name: 'Administrator',
          email: 'admin@askverse.com',
        },
        theme: {
          color: '#07528f',
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Failed to initiate payout';
      showErrorToast(errMsg);
    } finally {
      setPayoutLoading(false);
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
              <th scope="col" className="px-6 py-4">Monthly Income</th>
              <th scope="col" className="px-6 py-4">Due to Pay</th>
              <th scope="col" className="px-6 py-4">Razorpay Details</th>
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
                <td className="px-6 py-4 text-slate-600 font-medium">
                  {user.premiumCreatorEnabled ? `₹${user.monthlySubscriptionIncome || '0.00'}` : '₹0.00'}
                </td>
                <td className="px-6 py-4">
                  {user.premiumCreatorEnabled ? (
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${user.pendingPayoutBalance > 0 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                      ₹{(user.pendingPayoutBalance || 0).toFixed(2)}
                    </span>
                  ) : (
                    <span className="text-slate-400">N/A</span>
                  )}
                </td>
                <td className="px-6 py-4 text-slate-600">
                  {user.premiumCreatorEnabled ? (
                    user.razorpayPaymentDetails ? (
                      <span className="font-mono text-xs bg-slate-100 px-2.5 py-1 rounded-md text-slate-700 font-medium border border-slate-200">
                        {user.razorpayPaymentDetails}
                      </span>
                    ) : (
                      <span className="text-xs text-amber-700 font-semibold bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
                        Not Configured
                      </span>
                    )
                  ) : (
                    <span className="text-slate-400">N/A</span>
                  )}
                </td>
                <td className="px-6 py-4 text-slate-600">
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  {user.premiumCreatorEnabled && user.razorpayPaymentDetails && user.pendingPayoutBalance > 0 && (
                    <button
                      onClick={() => handlePayoutClick(user)}
                      className="inline-flex items-center rounded-full bg-emerald-600 px-3 py-1 text-xs font-bold text-white transition-colors hover:bg-emerald-700 shadow-sm"
                    >
                      Pay Creator
                    </button>
                  )}
                  <button onClick={() => handleDelete(user.id)} className="inline-flex h-8 w-8 items-center justify-center rounded-full text-red-500 transition-colors hover:bg-red-50 hover:text-red-600">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isPayoutModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity">
          <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white p-6 shadow-2xl transition-all border border-slate-100">
            <button
              onClick={() => setIsPayoutModalOpen(false)}
              className="absolute right-4 top-4 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
            >
              <X size={20} />
            </button>

            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <IndianRupee size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Process Creator Payout</h3>
              <p className="mt-1 text-sm text-slate-500">
                Transfer subscription earnings to creator account.
              </p>
            </div>

            <div className="mt-6 space-y-4">
              <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3 border border-slate-100">
                <img
                  className="h-10 w-10 rounded-full object-cover shadow-sm border border-slate-200"
                  src={selectedUser.profilePicture || `https://ui-avatars.com/api/?name=${selectedUser.name}`}
                  alt={selectedUser.name}
                />
                <div className="text-left">
                  <div className="text-sm font-semibold text-slate-900">{selectedUser.name}</div>
                  <div className="text-xs text-slate-500">{selectedUser.email}</div>
                </div>
              </div>

              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                  Razorpay UPI / VPA / Account
                </span>
                <div className="font-mono text-sm bg-slate-100/80 px-3 py-2.5 rounded-xl text-slate-700 font-semibold border border-slate-200 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  {selectedUser.razorpayPaymentDetails}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
                  Payout Amount (INR)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                    ₹
                  </span>
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    value={payoutAmount}
                    onChange={(e) => setPayoutAmount(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white pl-8 pr-4 py-3 text-lg font-bold text-slate-800 outline-none transition-all focus:border-[#07528f] focus:ring-2 focus:ring-[#07528f]/20"
                    placeholder="0.00"
                    disabled={payoutLoading}
                  />
                </div>
                <p className="mt-1.5 text-xs text-slate-400">
                  Total Monthly Revenue: ₹{(selectedUser.monthlySubscriptionIncome || 0).toFixed(2)}
                </p>
                <p className="mt-0.5 text-xs text-slate-500 font-semibold">
                  Pending Due Amount: ₹{(selectedUser.pendingPayoutBalance || 0).toFixed(2)}
                </p>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setIsPayoutModalOpen(false)}
                disabled={payoutLoading}
                className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 active:bg-slate-100 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleProcessPayout}
                disabled={payoutLoading || !payoutAmount || parseFloat(payoutAmount) <= 0}
                className="flex-1 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700 active:bg-emerald-800 transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {payoutLoading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                    Processing...
                  </>
                ) : (
                  'Proceed to Pay'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
