import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion, MotionConfig } from 'framer-motion';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import Layout from './components/Layout.jsx';
import Landing from './pages/Landing.jsx';
import Market from './pages/Market.jsx';
import SkillDetail from './pages/SkillDetail.jsx';
import Requests from './pages/Requests.jsx';
import Sessions from './pages/Sessions.jsx';
import Wallet from './pages/Wallet.jsx';
import Profile from './pages/Profile.jsx';
import MarketDashboard from './pages/MarketDashboard.jsx';
import PersonalDashboard from './pages/PersonalDashboard.jsx';
import Classroom from './pages/Classroom.jsx';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex justify-center py-16"><span>Loading...</span></div>;
  return user ? children : <Navigate to="/" replace />;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex justify-center py-16"><span>Loading...</span></div>;
  return user ? <Navigate to="/market" replace /> : children;
}

function AppRoutes() {
  const location = useLocation();
  // We use the root path segment as the key so navigating WITHIN the app doesn't trigger the top-level transition.
  // The layout already handles internal transitions.
  const rootKey = location.pathname === '/' ? 'landing' : 'app';

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={rootKey}>
        <Route path="/" element={<PublicRoute><motion.div initial={{opacity:0, scale:0.98}} animate={{opacity:1, scale:1}} exit={{opacity:0, scale: 1.02}} transition={{duration:0.3, ease: [0.22, 1, 0.36, 1]}} className="h-full w-full flex flex-col"><Landing /></motion.div></PublicRoute>} />
        <Route element={<PrivateRoute><motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:0.3, ease: [0.22, 1, 0.36, 1]}} className="h-full w-full flex flex-col min-h-screen"><Layout /></motion.div></PrivateRoute>}>
          <Route path="market" element={<Market />} />
        <Route path="my-dashboard" element={<PersonalDashboard />} />
        <Route path="classroom/:id" element={<Classroom />} />
        <Route path="skills/:id" element={<SkillDetail />} />
        <Route path="requests" element={<Requests />} />
        <Route path="sessions" element={<Sessions />} />
        <Route path="wallet" element={<Wallet />} />
        <Route path="profile" element={<Profile />} />
        <Route path="dashboard" element={<MarketDashboard />} />
      </Route>
      <Route path="*" element={<Navigate to="/market" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <MotionConfig reducedMotion="user">
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </MotionConfig>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;