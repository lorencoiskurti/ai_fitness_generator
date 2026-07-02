import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../hooks/useToast';
import Layout from '../components/Layout';
import Button from '../components/Button';
import Modal from '../components/Modal';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { apiService } from '../services/api';
import { cleanAIContent } from '../utils/formatting';

interface UserData {
  age: number;
  gender: string;
  height_cm: number;
  weight_kg: number;
  activity_level: string;
  dietary_preference: string;
  fitness_goal: string;
}

interface Plan {
  id: number;
  age: number;
  gender: string;
  height_cm: number;
  weight_kg: number;
  activity_level: string;
  dietary_preference: string;
  fitness_goal: string;
  bmi: number;
  bmi_category: string;
  tdee: number;
  meal_plan_html: string;
  workout_plan_html: string;
  date_generated: string;
}

export default function PlansPage() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedPlanId, setExpandedPlanId] = useState<number | null>(null);
  const [deletingPlanId, setDeletingPlanId] = useState<number | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [planToDelete, setPlanToDelete] = useState<number | null>(null);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const response = await apiService.get('/plans');
      setPlans(response || []);
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Failed to load plans';
      setError(errorMsg);
      addToast(errorMsg, 'error');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (planId: number) => {
    setPlanToDelete(planId);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!planToDelete) return;

    setDeletingPlanId(planToDelete);
    try {
      await apiService.delete(`/plans/${planToDelete}`);
      setPlans(plans.filter(p => p.id !== planToDelete));
      addToast('Plan deleted successfully!', 'success');
      setDeleteModalOpen(false);
      setPlanToDelete(null);
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Failed to delete plan';
      setError(errorMsg);
      addToast(errorMsg, 'error');
      console.error(err);
      setDeleteModalOpen(false);
      setPlanToDelete(null);
    } finally {
      setDeletingPlanId(null);
    }
  };

  const handleEdit = (plan: Plan) => {
    // Navigate with Router state (automatically cleared when navigating away)
    navigate('/generate', {
      state: {
        editPlanId: plan.id,
        editFormData: {
          age: plan.age,
          gender: plan.gender,
          height_cm: plan.height_cm,
          weight_kg: plan.weight_kg,
          activity_level: plan.activity_level,
          dietary_preference: plan.dietary_preference,
          fitness_goal: plan.fitness_goal
        }
      }
    });
  };

  const formatLabel = (key: string): string => {
    return key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Layout>
        <main className="container mx-auto px-6 py-8">
          <h1 className="text-4xl font-bold text-center text-gray-900 mb-2">My Saved Fitness Plans 📋</h1>
          <p className="text-center text-gray-600 mb-8">Manage all your personalized fitness plans</p>
          <div className="max-w-4xl mx-auto">
            <LoadingSkeleton />
          </div>
        </main>
      </Layout>
    );
  }

  return (
    <Layout>
      <main className="container mx-auto px-6 py-8">
        <h1 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-2">My Saved Fitness Plans 📋</h1>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-8">Manage all your personalized fitness plans</p>

        {error && (
          <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg mb-6 max-w-2xl mx-auto">
            {error}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <Button
            variant="primary"
            onClick={() => navigate('/generate')}
          >
            Generate New Plan
          </Button>
          <Button
            variant="secondary"
            onClick={() => navigate('/')}
          >
            Back to Home
          </Button>
        </div>

        <div className="max-w-4xl mx-auto">
          {plans.length === 0 ? (
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-8 text-center border border-gray-200 dark:border-slate-700">
              <p className="text-gray-600 dark:text-gray-400 text-lg mb-4">No plans have been saved yet.</p>
              <Button
                variant="primary"
                onClick={() => navigate('/generate')}
              >
                Generate Your First Plan
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className="bg-white dark:bg-slate-800 rounded-lg shadow-md border border-gray-200 dark:border-slate-700 overflow-hidden hover:shadow-lg transition-shadow duration-200"
                >
                  {/* Plan Header */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-purple-600 dark:text-purple-400 mb-3">
                      {plan.age}yo {formatLabel(plan.gender)} • Goal: {formatLabel(plan.fitness_goal)}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      Generated on: <span className="font-semibold">{formatDate(plan.date_generated)}</span>
                    </p>

                    {/* Metrics Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 bg-gray-50 dark:bg-slate-700 rounded-lg p-4">
                      <div>
                        <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase mb-1">BMI</p>
                        <p className="text-lg font-bold text-gray-900 dark:text-white">{plan.bmi.toFixed(2)}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">{plan.bmi_category}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase mb-1">TDEE</p>
                        <p className="text-lg font-bold text-gray-900 dark:text-white">{plan.tdee.toFixed(0)}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">cal/day</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase mb-1">Height</p>
                        <p className="text-lg font-bold text-gray-900 dark:text-white">{plan.height_cm}cm</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase mb-1">Weight</p>
                        <p className="text-lg font-bold text-gray-900 dark:text-white">{plan.weight_kg}kg</p>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      <span className="font-semibold">Diet:</span> {formatLabel(plan.dietary_preference)} |
                      <span className="font-semibold ml-3">Activity:</span> {formatLabel(plan.activity_level)}
                    </p>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => setExpandedPlanId(expandedPlanId === plan.id ? null : plan.id)}
                      >
                        {expandedPlanId === plan.id ? 'Hide Details' : 'Show Details'}
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleEdit(plan)}
                      >
                        Edit Plan
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDelete(plan.id)}
                        disabled={deletingPlanId === plan.id}
                      >
                        {deletingPlanId === plan.id ? 'Deleting...' : 'Delete'}
                      </Button>
                    </div>
                  </div>

                  {/* Expandable Details */}
                  {expandedPlanId === plan.id && (
                    <div className="border-t border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-700 p-6">
                      <div className="mb-8">
                        <h4 className="text-lg font-bold text-purple-600 dark:text-purple-400 mb-4">Meal Plan</h4>
                        <div
                          className="prose prose-sm max-w-none text-gray-700 dark:text-gray-100 whitespace-pre-wrap"
                          dangerouslySetInnerHTML={{ __html: cleanAIContent(plan.meal_plan_html) }}
                        />
                      </div>

                      <div>
                        <h4 className="text-lg font-bold text-purple-600 dark:text-purple-400 mb-4">Workout Plan</h4>
                        <div
                          className="prose prose-sm max-w-none text-gray-700 dark:text-gray-100 whitespace-pre-wrap"
                          dangerouslySetInnerHTML={{ __html: cleanAIContent(plan.workout_plan_html) }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Modal
        isOpen={deleteModalOpen}
        title="Delete Plan?"
        message="This action cannot be undone. Are you sure you want to delete this plan?"
        confirmText="Delete"
        cancelText="Cancel"
        confirmVariant="danger"
        onConfirm={confirmDelete}
        onCancel={() => {
          setDeleteModalOpen(false);
          setPlanToDelete(null);
        }}
        isLoading={deletingPlanId !== null}
      />
    </Layout>
  );
}
