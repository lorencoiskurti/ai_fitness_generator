import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import Layout from '../components/Layout';
import Button from '../components/Button';
import { subscriptionService } from '../services/subscription';

export default function SubscriptionDashboard() {
  const navigate = useNavigate();
  const { user, refreshAuth } = useAuth();
  const { addToast } = useToast();
  const [cancelLoading, setCancelLoading] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  if (!user.subscription_active) {
    return (
      <Layout>
        <main className="container mx-auto max-w-2xl px-4 py-12">
          <div className="text-center">
            <div className="text-6xl mb-4">📭</div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">No Active Subscription</h1>
            <p className="text-gray-600 mb-8">
              You don't currently have an active subscription. Upgrade to Pro to unlock unlimited plan generation!
            </p>
            <Button
              variant="primary"
              size="lg"
              onClick={() => {
                sessionStorage.setItem('paymentReturnTo', '/subscription');
                navigate('/payment');
              }}
            >
              Upgrade to Pro
            </Button>
          </div>
        </main>
      </Layout>
    );
  }

  const endDate = user.subscription_end_date ? new Date(user.subscription_end_date) : null;
  const daysRemaining = endDate ? Math.ceil((endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 0;
  const planLabel = user.subscription_plan === 'monthly' ? 'Monthly Plan' : 'Yearly Plan';
  const renewalDate = endDate?.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const handleCancel = async () => {
    setCancelLoading(true);
    try {
      const response = await (
        fetch('/api/subscription/cancel', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        }).then(r => r.json())
      );

      if (response.success) {
        addToast('Subscription cancelled', 'success');
        await refreshAuth();
        setTimeout(() => navigate('/'), 1500);
      }
    } catch (err: any) {
      addToast('Failed to cancel subscription', 'error');
      console.error(err);
    } finally {
      setCancelLoading(false);
      setShowCancelModal(false);
    }
  };

  return (
    <Layout>
      <main className="container mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Subscription Details</h1>
        <p className="text-gray-600 mb-8">Manage your Pro subscription</p>

        {/* Active Subscription Card */}
        <div className="bg-gradient-to-r from-purple-50 to-purple-100 border-2 border-purple-200 rounded-2xl p-8 mb-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="inline-flex items-center gap-2 mb-3">
                <span className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></span>
                <span className="text-sm font-semibold text-green-600">Active Subscription</span>
              </div>
              <h2 className="text-3xl font-bold text-purple-900 mb-2">Pro {planLabel}</h2>
              <p className="text-purple-700">You have unlimited access to all features</p>
            </div>
            <div className="text-right">
              <div className="text-5xl font-bold text-purple-600 mb-1">
                {daysRemaining}
              </div>
              <p className="text-sm text-purple-600 font-medium">Days remaining</p>
            </div>
          </div>

          {/* Renewal Info */}
          <div className="bg-white/60 rounded-xl p-4 backdrop-blur-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Plan Type</p>
                <p className="text-lg font-bold text-gray-900">{planLabel}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Renews on</p>
                <p className="text-lg font-bold text-gray-900">{renewalDate}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Your Pro Benefits</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Unlimited Plan Generation</p>
                <p className="text-sm text-gray-600">Generate as many fitness plans as you want</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-gray-900">AI-Powered Meal Plans</p>
                <p className="text-sm text-gray-600">Get personalized nutrition recommendations</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Personalized Workout Plans</p>
                <p className="text-sm text-gray-600">Custom exercise routines tailored to your goals</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Cancel Anytime</p>
                <p className="text-sm text-gray-600">No hidden fees or long-term commitments</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button
            variant="primary"
            size="lg"
            onClick={() => navigate('/generate')}
          >
            Generate a Plan
          </Button>
          <Button
            variant="secondary"
            size="lg"
            onClick={() => setShowCancelModal(true)}
          >
            Cancel Subscription
          </Button>
        </div>

        {/* Upgrade Info */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Want to upgrade?</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <p className="font-semibold text-gray-900 mb-2">Current: {planLabel}</p>
              <p className="text-2xl font-bold text-gray-900 mb-3">
                {user.subscription_plan === 'monthly' ? '$9.99' : '$79.99'}
                <span className="text-base text-gray-600 font-normal">
                  {user.subscription_plan === 'monthly' ? '/month' : '/year'}
                </span>
              </p>
            </div>

            {user.subscription_plan === 'monthly' && (
              <div className="bg-purple-50 rounded-xl p-4 border-2 border-purple-200">
                <p className="font-semibold text-purple-900 mb-2">Save 33% with Yearly</p>
                <p className="text-2xl font-bold text-purple-900 mb-3">
                  $79.99
                  <span className="text-base text-purple-700 font-normal">/year</span>
                </p>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    sessionStorage.setItem('paymentReturnTo', '/subscription');
                    navigate('/payment');
                  }}
                >
                  Switch to Yearly
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Cancel Subscription?</h2>
              <p className="text-gray-600 mb-6">
                Are you sure? You'll lose access to unlimited plan generation and all Pro features immediately.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowCancelModal(false)}
                  disabled={cancelLoading}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium disabled:opacity-60"
                >
                  Keep Subscription
                </button>
                <button
                  onClick={handleCancel}
                  disabled={cancelLoading}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium disabled:opacity-60"
                >
                  {cancelLoading ? 'Cancelling...' : 'Cancel Subscription'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
