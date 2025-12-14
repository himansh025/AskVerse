import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
// import { toast } from 'react-toastify';
import axiosInstance from "../../config/api.ts";
import { login } from './authSlice.ts';
import Button from '../../components/Button.tsx';
import Input from '../../components/Input.tsx';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data } = await axiosInstance.post('/api/v1/users/signin', form);
      // const userData = response.data;
      // console.log("data",data);
      const token: string = data?.data?.token ? data?.data?.token : " ";
      localStorage.setItem('token', token);
      dispatch(login({ user: null, token }))

      // sessionStorage.setItem('token', userData?.token);
      // toast.success('Login successful!');
      navigate('/');
    } catch (error: any) {
      console.error(error);
      // toast.error(error.response?.data?.message || 'Invalid credentials!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-64px)] bg-gray-50">
      <form onSubmit={handleSubmit} className="bg-white shadow-2xl p-10 rounded-2xl w-full max-w-md">
        <h2 className="text-3xl font-bold mb-8 text-center text-gray-800">Welcome Back</h2>

        <Input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="mb-4"
        />
        <Input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="mb-6"
        />

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Logging in...' : 'Login'}
        </Button>

        <p className="mt-4 text-center text-gray-600">
          Don’t have an account?{' '}
          <a href="/signup" className="text-blue-600 hover:underline">
            Sign up
          </a>
        </p>
      </form>
    </div>
  );
}
