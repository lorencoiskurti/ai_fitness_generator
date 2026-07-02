import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import Layout from '../components/Layout';
import FormField from '../components/FormField';
import Button from '../components/Button';
import { authService } from '../services/auth';
import { validateUsername, validatePassword } from '../utils/validation';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser, refreshAuth } = useAuth();
  const { addToast } = useToast();

  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate inputs
    const usernameError = validateUsername(formData.username);
    const passwordError = validatePassword(formData.password);

    if (usernameError || passwordError) {
      const errorMsg = usernameError || passwordError || 'Please fill in all fields';
      setError(errorMsg);
      addToast(errorMsg, 'warning');
      return;
    }

    setLoading(true);
    try {
      const response = await authService.login(formData.username, formData.password);
      if (response.success) {
        setUser(response.user);
        // Refresh auth to get subscription status
        await refreshAuth();
        addToast('Logged in successfully!', 'success');
        const next = new URLSearchParams(location.search).get('next') || '/';
        navigate(next);
      } else {
        const errorMsg = response.error || 'Login failed. Please check your credentials.';
        setError(errorMsg);
        addToast(errorMsg, 'error');
      }
    } catch (err: any) {
      const errorMsg = err.message || 'An error occurred. Please try again.';
      setError(errorMsg);
      addToast(errorMsg, 'error');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <main className="container mx-auto px-6 py-12">
        <div className="max-w-md mx-auto">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-8 border border-gray-200 dark:border-slate-700">
            <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-2">Login</h1>
            <p className="text-center text-gray-600 dark:text-gray-400 mb-8">Welcome back to AI Fitness Generator</p>

            {error && (
              <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg mb-6 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <FormField
                label="Username"
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Enter your username"
                icon="👤"
              />

              <FormField
                label="Password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                icon="🔐"
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={loading}
                className="w-full"
              >
                {loading ? 'Logging in...' : 'Login'}
              </Button>
            </form>

            <div className="mt-6 p-4 bg-gray-50 dark:bg-slate-700 rounded-lg border border-gray-200 dark:border-slate-600">
              <p className="text-center text-gray-700 dark:text-gray-300">
                Don't have an account?{' '}
                <button
                  onClick={() => navigate('/register')}
                  className="text-purple-600 dark:text-purple-400 font-semibold hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
                >
                  Sign up here
                </button>
              </p>
            </div>
          </div>
        </div>
      </main>
    </Layout>
  );
}
