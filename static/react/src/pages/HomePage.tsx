import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Layout from '../components/Layout';
import Button from '../components/Button';

export default function HomePage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <Layout>
      <main className="container mx-auto px-6 py-8">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-purple-600 to-purple-900 rounded-lg shadow-lg p-12 md:p-16 mb-8 relative overflow-hidden animate-fade-in-up">
          {/* Decorative gradient circles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full blur-3xl -mr-48 -mt-48"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-white opacity-5 rounded-full blur-3xl -ml-48 -mb-48"></div>
          </div>

          <div className="relative z-10 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
              Your Personalized Path to a Healthier You, Powered by AI
            </h1>
            <p className="text-lg text-white text-opacity-90 max-w-2xl mx-auto">
              Custom fitness and meal plans tailored to your unique body, goals, and lifestyle.
            </p>
          </div>
        </section>

        {/* Intro Section */}
        <section className="bg-white rounded-lg shadow-md p-8 mb-8 border border-gray-200 card-hover" style={{ animationDelay: '0.1s' }}>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Welcome to AI Fitness Generator</h2>
          <p className="text-gray-600 text-lg">
            Unlock your full potential with custom fitness and meal plans tailored specifically for you. Whether you're aiming to{' '}
            <strong className="text-gray-900">lose weight</strong>, <strong className="text-gray-900">gain muscle</strong>, or{' '}
            <strong className="text-gray-900">maintain a healthy lifestyle</strong>, our intelligent AI will create a plan that fits your unique needs and goals.
          </p>
        </section>

        {/* Features Section */}
        <section className="bg-white rounded-lg shadow-md p-8 mb-8 border border-gray-200 card-hover" style={{ animationDelay: '0.2s' }}>
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Why Choose Us?</h3>
          <ul className="space-y-3 stagger">
            {[
              'Personalized meal plans based on your dietary preferences and calorie needs',
              'Effective workout routines designed for your fitness level and goals',
              'Track your progress and adjust plans as you evolve',
              'User-friendly interface for a seamless experience',
              'Access your plans anytime, anywhere'
            ].map((feature, index) => (
              <li
                key={index}
                className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:shadow-md hover:bg-gray-100 transition-all duration-200"
              >
                <div className="flex-shrink-0 w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  ✓
                </div>
                <span className="text-gray-700">{feature}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg shadow-md p-8 border border-purple-200 text-center mb-8 card-hover" style={{ animationDelay: '0.3s' }}>
          <p className="text-xl text-gray-700 mb-6">Ready to start your journey towards a healthier, stronger you?</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {!user.authenticated ? (
              <>
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => navigate('/register')}
                >
                  Get Started Now
                </Button>
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={() => navigate('/login')}
                >
                  Already a Member? Login
                </Button>
              </>
            ) : (
              <Button
                variant="primary"
                size="lg"
                onClick={() => navigate('/generate')}
              >
                Generate Your Plan
              </Button>
            )}
          </div>
        </section>
      </main>
    </Layout>
  );
}
