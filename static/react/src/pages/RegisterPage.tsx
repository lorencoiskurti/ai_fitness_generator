import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import Layout from '../components/Layout';
import FormField from '../components/FormField';
import Button from '../components/Button';
import { authService } from '../services/auth';
import { validateUsername, validatePassword } from '../utils/validation';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const { addToast } = useToast();

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: ''
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
      const msg = usernameError || passwordError || 'Please fill in all fields';
      setError(msg);
      addToast(msg, 'warning');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      const msg = 'Passwords do not match';
      setError(msg);
      addToast(msg, 'warning');
      return;
    }

    setLoading(true);
    try {
      const response = await authService.register(formData.username, formData.password);
      if (response.success) {
        addToast('Account created successfully!', 'success');
        // Auto-login after registration
        const loginResponse = await authService.login(formData.username, formData.password);
        if (loginResponse.success) {
          setUser(loginResponse.user);
          navigate('/');
        } else {
          // Registration succeeded but login failed - redirect to login page
          navigate('/login');
        }
      } else {
        const msg = response.error || 'Registration failed. Please try again.';
        setError(msg);
        addToast(msg, 'error');
      }
    } catch (err: any) {
      const msg = err.message || 'An error occurred. Please try again.';
      setError(msg);
      addToast(msg, 'error');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <main className="container mx-auto px-6 py-12">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-lg shadow-md p-8 border border-gray-200">
            <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">Create Account</h1>
            <p className="text-center text-gray-600 mb-8">Join AI Fitness Generator today</p>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
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
                placeholder="Choose a username"
                icon="👤"
              />

              <FormField
                label="Password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="At least 6 characters"
                icon="🔐"
              />

              <FormField
                label="Confirm Password"
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                icon="✓"
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={loading}
                className="w-full"
              >
                {loading ? 'Creating account...' : 'Create Account'}
              </Button>
            </form>

            <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-center text-gray-700">
                Already have an account?{' '}
                <button
                  onClick={() => navigate('/login')}
                  className="text-purple-600 font-semibold hover:text-purple-700 transition-colors"
                >
                  Login here
                </button>
              </p>
            </div>
          </div>
        </div>
      </main>
    </Layout>
  );
}
