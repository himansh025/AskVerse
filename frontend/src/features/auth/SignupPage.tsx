import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// import { useDispatch } from 'react-redux';
import axiosInstance from '../../config/api.ts';
// import { login } from './authSlice.ts';
import Button from '../../components/Button.tsx';
import Input from '../../components/Input.tsx';

export default function SignupPage() {
  const [form, setForm] = useState({ name: '', email: '', username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  // const dispatch = useDispatch();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data } = await axiosInstance.post('/api/v1/users/signup', form);
      console.log('Signup data:', data);
      
      // Assuming signup returns user data, dispatch login
      // dispatch(login({ user: data, token: null })); // Token from login
      navigate('/login');
    } catch (error: any) {
      
      console.error('Signup error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-64px)] bg-gray-50">
      <form onSubmit={handleSubmit} className="bg-white shadow-2xl p-10 rounded-2xl w-full max-w-md">
        <h2 className="text-3xl font-bold mb-8 text-center text-gray-800">Join AskVerse</h2>

        <Input
          type="text" placeholder="Name" value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="mb-4"
        />
        <Input
          type="email" placeholder="Email" value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="mb-4"
        />
        <Input
          type="text" placeholder="Username" value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
          className="mb-4"
        />
        <Input
          type="password" placeholder="Password" value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="mb-6"
        />

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Signing up...' : 'Sign Up'}
        </Button>

        <p className="mt-4 text-center text-gray-600">
          Already have an account?{' '}
          <a href="/login" className="text-blue-600 hover:underline">Log in</a>
        </p>
      </form>
    </div>
  );
}