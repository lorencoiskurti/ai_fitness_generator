import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Button from '../components/Button';
import { cleanAIContent } from '../utils/formatting';

interface PlanData {
  plan_id: number;
  bmi: string;
  bmi_category: string;
  tdee: string;
  meal_plan: string;
  workout_plan: string;
  user_data: {
    age: number;
    gender: string;
    height_cm: number;
    weight_kg: number;
    activity_level: string;
    dietary_preference: string;
    fitness_goal: string;
  };
}

export default function ResultsPage() {
  const navigate = useNavigate();
  const [planData, setPlanData] = useState<PlanData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const data = sessionStorage.getItem('planData');
    if (data) {
      setPlanData(JSON.parse(data));
      setLoading(false);
    } else {
      // Redirect to generate if no plan data
      navigate('/generate');
    }
  }, [navigate]);

  if (loading || !planData) {
    return (
      <Layout>
        <main className="container mx-auto px-6 py-12">
          <p className="text-center text-gray-600">Loading...</p>
        </main>
      </Layout>
    );
  }

  const formatLabel = (key: string): string => {
    return key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  };

  return (
    <Layout>
      <main className="container mx-auto px-6 py-8">
        <h1 className="text-4xl font-bold text-center text-gray-900 mb-8">Your Personalized Plan</h1>

        {/* User Summary Card */}
        <section className="bg-white rounded-lg shadow-md p-8 border border-gray-200 mb-8">
          <h2 className="text-2xl font-bold text-purple-600 mb-6">Your Profile</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {Object.entries(planData.user_data).map(([key, value]) => (
              <div key={key} className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">
                  {formatLabel(key)}
                </p>
                <p className="text-xl font-bold text-gray-900">
                  {typeof value === 'string' ? formatLabel(value) : value}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* BMI Card */}
        <section className="bg-gradient-to-r from-purple-600 to-purple-900 rounded-lg shadow-md p-8 text-white mb-8">
          <h2 className="text-2xl font-bold mb-6">Your Metrics</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white bg-opacity-20 rounded-lg p-6 backdrop-blur">
              <p className="text-sm font-semibold text-white text-opacity-80 mb-2">BMI</p>
              <p className="text-4xl font-bold mb-1">{planData.bmi}</p>
              <p className="text-lg text-white text-opacity-90">{planData.bmi_category}</p>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-6 backdrop-blur">
              <p className="text-sm font-semibold text-white text-opacity-80 mb-2">Daily Calories</p>
              <p className="text-4xl font-bold">{planData.tdee}</p>
              <p className="text-lg text-white text-opacity-90">TDEE</p>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-6 backdrop-blur">
              <p className="text-sm font-semibold text-white text-opacity-80 mb-2">Goal</p>
              <p className="text-lg font-bold">{formatLabel(planData.user_data.fitness_goal)}</p>
            </div>
          </div>
        </section>

        {/* Meal Plan */}
        <section className="bg-white rounded-lg shadow-md p-8 border border-gray-200 mb-8">
          <h2 className="text-2xl font-bold text-purple-600 mb-6">Your Meal Plan</h2>
          <div
            className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap"
            dangerouslySetInnerHTML={{ __html: cleanAIContent(planData.meal_plan) }}
          />
        </section>

        {/* Workout Plan */}
        <section className="bg-white rounded-lg shadow-md p-8 border border-gray-200 mb-8">
          <h2 className="text-2xl font-bold text-purple-600 mb-6">Your Workout Plan</h2>
          <div
            className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap"
            dangerouslySetInnerHTML={{ __html: cleanAIContent(planData.workout_plan) }}
          />
        </section>

        {/* Action Buttons */}
        <section className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <Button
            variant="primary"
            onClick={() => navigate('/generate')}
          >
            Generate Another Plan
          </Button>
          <Button
            variant="secondary"
            onClick={() => navigate('/plans')}
          >
            View All My Plans
          </Button>
          <Button
            variant="secondary"
            onClick={() => navigate('/')}
          >
            Back to Home
          </Button>
        </section>
      </main>
    </Layout>
  );
}
