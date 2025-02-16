import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import HeritageGrid from './components/HeritageGrid';
import AdminDashboard from './components/AdminDashboard';
import AdminLogin from './components/AdminLogin';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import ThemeSwitcher from './components/ThemeSwitcher';
import ErrorBoundary from './components/ErrorBoundary';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { token } = useAuth();
  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
};

// Public Layout Component
const PublicLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <HeroSection />
      <main className="pt-8">
        <HeritageGrid />
      </main>
    </div>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<PublicLayout />} />
            
            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route 
              path="/admin/*" 
              element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;