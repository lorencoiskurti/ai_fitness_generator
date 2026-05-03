import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { authService } from '../services/auth';
import MobileNav from './MobileNav';
import ThemeToggle from './ThemeToggle';

export const Header = () => {
  const { user, setUser } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await authService.logout();
      // Clear all form data from sessionStorage
      sessionStorage.removeItem('editBridge');
      sessionStorage.removeItem('originalBridge');
      sessionStorage.removeItem('editPlanId');
      sessionStorage.removeItem('lastUserId');
      sessionStorage.removeItem('paymentReturnTo');
      setUser(null);
      addToast('Logged out successfully', 'success');
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
      addToast('Logout failed', 'error');
    }
  };

  const handleGoToPro = (currentPath: string) => {
    sessionStorage.setItem('paymentReturnTo', currentPath);
    navigate('/payment');
  };

  return (
    <>
      <header className="bg-white/85 dark:bg-slate-900/85 backdrop-blur-sm border-b border-gray-200 dark:border-slate-700/50 sticky top-0 z-50 transition-colors">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2 sm:space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-gradient-to-br from-purple-600 to-purple-900">
                  <span className="text-white text-xl">💪</span>
                </div>
                <span className="text-lg sm:text-lg sm:text-xl font-bold text-gray-900 dark:text-white">AI Fitness Generator</span>
              </Link>
            </div>
            <div className="hidden md:flex md:items-center md:space-x-2">
              <ThemeToggle />
              {!user.authenticated ? (
                <>
                  <Link to="/login" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">Login</Link>
                  <Link
                    to="/register"
                    className="inline-flex items-center px-4 py-2 rounded-lg text-white bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-600 transition-colors font-medium shadow-lg hover:shadow-xl"
                  >
                    Sign Up
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/plans"
                    className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-md transition-colors"
                  >
                    My Plans
                  </Link>
                  <Link
                    to="/generate"
                    className="inline-flex items-center px-4 py-2 rounded-lg text-white bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-600 transition-colors font-medium shadow-lg hover:shadow-xl"
                  >
                    Generate Plan
                  </Link>
                  {user.subscription_active ? (
                    <Link
                      to="/subscription"
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-700 hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition-colors cursor-pointer"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                      Pro Active
                    </Link>
                  ) : (
                    <button
                      onClick={() => handleGoToPro(location.pathname)}
                      className="inline-flex items-center px-3 py-1.5 rounded-lg text-purple-600 dark:text-purple-400 border border-purple-300 dark:border-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/30 transition-colors text-sm font-medium"
                    >
                      Go Pro
                    </button>
                  )}
                  <button
                    onClick={handleLogout}
                    className="inline-flex items-center px-4 py-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors font-medium"
                  >
                    Logout
                  </button>
                </>
              )}
            </div>
            <div className="md:hidden flex items-center gap-2">
              <ThemeToggle />
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="rounded-md p-2 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
              >
                {mobileMenuOpen ? (
                  <svg className="h-6 w-6 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="h-6 w-6 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </nav>
      </header>
      <MobileNav
        isOpen={mobileMenuOpen}
        isAuthenticated={user.authenticated}
        subscriptionActive={user.subscription_active ?? false}
        username={user.username}
        currentPath={location.pathname}
        onGoToPro={handleGoToPro}
        onLogout={handleLogout}
        onLinkClick={() => setMobileMenuOpen(false)}
      />
    </>
  );
};