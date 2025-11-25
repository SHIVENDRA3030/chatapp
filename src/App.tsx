import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { AuthProvider } from './lib/AuthContext';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import ChatWindow from './components/ChatWindow';
import AIChat from './pages/AIChat';
import { ErrorBoundary } from './components/ErrorBoundary';

// Placeholder for Chat Interface
const ChatPlaceholder = () => (
  <div className="h-full flex flex-col items-center justify-center text-gray-500 bg-dark/50 backdrop-blur-sm">
    <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6 animate-bounce">
      <span className="text-4xl">👋</span>
    </div>
    <h2 className="text-2xl font-bold text-white mb-2">Welcome to Chatsy</h2>
    <p>Select a chat or search for a user to start messaging.</p>
  </div>
);

function App() {
  // Handle system dark mode preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
      if (e.matches) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    // Initial check
    handleChange(mediaQuery);

    // Listen for changes
    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return (
    <BrowserRouter>
      <AuthProvider>
        <ErrorBoundary>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />

            <Route element={<ProtectedRoute />}>
              <Route element={<Layout />}>
                <Route path="/" element={<ChatPlaceholder />} />
                <Route path="/c/:conversationId" element={<ChatWindow />} />
                <Route path="/ai-chat" element={<AIChat />} />
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ErrorBoundary>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
