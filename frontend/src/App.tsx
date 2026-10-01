import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Onboarding from './pages/Onboarding';
import { Dashboard } from './pages/Dashboard';
import { ProfilePage } from './pages/ProfilePage';
import { Settings } from './pages/Settings';
import { Applications } from './pages/Applications';
import { ReportedQuestions } from './pages/ReportedQuestions';
import { QuestionsBank } from './pages/QuestionsBank';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { currentUser } = useAuth();
  return currentUser ? children : <Navigate to="/login" />;
};

// Import Layout
import { Layout } from './components/Layout';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Protected Dashboard Routes */}
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/applications" element={<Applications />} />
        <Route path="/reported-questions" element={<ReportedQuestions />} />
        <Route path="/questions-bank" element={<QuestionsBank />} />
        <Route path="/onboarding" element={<Onboarding />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
