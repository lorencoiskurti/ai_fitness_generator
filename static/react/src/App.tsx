import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import { ToastProvider } from './hooks/useToast';
import { ThemeProvider } from './hooks/useTheme';
import ErrorBoundary from './components/ErrorBoundary';
import ToastContainer from './components/Toast';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import GeneratePlanPage from './pages/GeneratePlanPage';
import ResultsPage from './pages/ResultsPage';
import PlansPage from './pages/PlansPage';
import PaymentPage from './pages/PaymentPage';
import SubscriptionDashboard from './pages/SubscriptionDashboard';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <ThemeProvider>
      <ErrorBoundary>
        <AuthProvider>
          <ToastProvider>
            <BrowserRouter>
              <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                {/* Protected routes */}
                <Route
                  path="/generate"
                  element={
                    <ProtectedRoute>
                      <GeneratePlanPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/results"
                  element={
                    <ProtectedRoute>
                      <ResultsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/plans"
                  element={
                    <ProtectedRoute>
                      <PlansPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/payment"
                  element={
                    <ProtectedRoute>
                      <PaymentPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/subscription"
                  element={
                    <ProtectedRoute>
                      <SubscriptionDashboard />
                    </ProtectedRoute>
                  }
                />

                {/* Catch-all route */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
              <ToastContainer />
            </div>
            </BrowserRouter>
          </ToastProvider>
        </AuthProvider>
      </ErrorBoundary>
    </ThemeProvider>
  );
}

export default App;