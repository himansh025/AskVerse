// src/components/Navbar.tsx
import { Link, useNavigate } from 'react-router-dom';
import { logout } from '../features/auth/authSlice.ts';
import { useDispatch } from 'react-redux';

export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-md py-4 px-6 flex justify-between items-center">
      <Link to="/" className="text-2xl font-bold text-blue-600">AskVerse</Link>
      <div className="space-x-6">
        <Link to="/" className="text-gray-700 hover:text-blue-600">Home</Link>
        <Link to="/ask" className="text-gray-700 hover:text-blue-600">Ask</Link>
        <Link to="/tags" className="text-gray-700 hover:text-blue-600">Tags</Link>
        <Link to="/profile" className="text-gray-700 hover:text-blue-600">Profile</Link>
        <button onClick={handleLogout} className="text-gray-700 hover:text-blue-600">Logout</button>
      </div>
    </nav>
  );
}