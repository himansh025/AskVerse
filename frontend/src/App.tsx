// src/App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.tsx';
import LoginPage from './features/auth/LoginPage.tsx';
import SignupPage from './features/auth/SignupPage.tsx';
import FeedPage from './features/feed/FeedPage.tsx';
import AskQuestionPage from './features/questions/AskQuestionPage.tsx';
import QuestionDetails from './features/questions/QuestionDetails.tsx';
import TagsPage from './pages/TagsPage.tsx';
import ProfilePage from './pages/ProfilePage.tsx';
import NotFound from './pages/NotFound.tsx';
import ProtectedRoute from './features/auth/ProtectedRoute.tsx';

export default function App() {
  
  return (
    <BrowserRouter>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<FeedPage />} />
            <Route path="/ask" element={<AskQuestionPage />} />
            <Route path="/question/:id" element={<QuestionDetails />} />
            <Route path="/tags" element={<TagsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}