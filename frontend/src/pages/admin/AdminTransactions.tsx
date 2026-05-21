import { useEffect, useState } from 'react';
import axiosInstance from '../../config/api.ts';
import Loader from '../../components/Loader.tsx';

export default function AdminTransactions() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const { data } = await axiosInstance.get('/api/v1/admin/transactions');
      setTransactions(data.data);
    } catch (err) {
      console.error('Failed to load transactions', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-brand text-2xl font-bold text-slate-900">Transaction History</h2>
        <p className="text-slate-500 mt-1">Monitor all platform payments, subscriptions, and payouts.</p>
      </div>
      
      <div className="overflow-x-auto rounded-2xl border border-white/60 bg-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-md">
        <table className="w-full text-left text-sm text-slate-500">
          <thead className="border-b border-slate-200/60 bg-slate-50/50 text-xs uppercase text-slate-700">
            <tr>
              <th scope="col" className="px-6 py-4">Reference</th>
              <th scope="col" className="px-6 py-4">Subscriber</th>
              <th scope="col" className="px-6 py-4">Creator</th>
              <th scope="col" className="px-6 py-4">Amount</th>
              <th scope="col" className="px-6 py-4">Status</th>
              <th scope="col" className="px-6 py-4">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/60">
            {transactions.map((t) => (
              <tr key={t.id} className="transition-colors hover:bg-slate-50/50">
                <td className="px-6 py-4 font-mono text-xs">
                  {t.paymentReference}
                </td>
                <td className="px-6 py-4 font-medium text-slate-900">
                  {t.subscriberName || 'Unknown'}
                  <div className="text-xs font-normal text-slate-500">{t.subscriberEmail}</div>
                </td>
                <td className="px-6 py-4 font-medium text-slate-900">
                  {t.creatorName || 'Unknown'}
                  <div className="text-xs font-normal text-slate-500">{t.creatorEmail}</div>
                </td>
                <td className="px-6 py-4 font-semibold text-[var(--color-brand)]">
                  {t.currency} {t.amount}
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${t.status === 'SUCCESS' || t.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {t.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-600">
                  {new Date(t.createdAt).toLocaleString()}
                </td>
              </tr>
            ))}
            {transactions.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                  <p className="text-base font-medium text-slate-900">No transactions found.</p>
                  <p className="mt-1">When users purchase subscriptions, they will appear here.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
