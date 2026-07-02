import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import Layout from '../components/Layout';
import { subscriptionService } from '../services/subscription';

type Plan = 'monthly' | 'yearly';
type PaymentMethod = 'card' | 'paypal';

export default function PaymentPage() {
  const navigate = useNavigate();
  const { refreshAuth } = useAuth();
  const { addToast } = useToast();

  const [selectedPlan, setSelectedPlan] = useState<Plan>('yearly');
  const [activeTab, setActiveTab] = useState<PaymentMethod>('card');
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successState, setSuccessState] = useState(false);
  const [showPayPalLogin, setShowPayPalLogin] = useState(false);
  const [paypalEmail, setPaypalEmail] = useState('');
  const [paypalPassword, setPaypalPassword] = useState('');

  // Get where to redirect after payment
  const returnTo = sessionStorage.getItem('paymentReturnTo') || '/';

  // Clean up edit plan data when entering payment page
  useEffect(() => {
    return () => {
      // Don't clear on mount, only on unmount/leaving the page
      // This prevents accidental clears
    };
  }, []);

  const prices = {
    monthly: { price: 9.99, label: 'Monthly' },
    yearly: { price: 79.99, label: 'Yearly', originalPrice: 119.88 }
  };

  const formatCardNumber = (value: string) => {
    const raw = value.replace(/\D/g, '').slice(0, 16);
    const formatted = raw.replace(/(.{4})/g, '$1 ').trim();
    setCardNumber(formatted);
  };

  const formatExpiry = (value: string) => {
    const raw = value.replace(/\D/g, '').slice(0, 4);
    const formatted = raw.length > 2 ? `${raw.slice(0, 2)}/${raw.slice(2)}` : raw;
    setExpiry(formatted);
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      await subscriptionService.activateSubscription(selectedPlan);
      setSuccessState(true);
      await refreshAuth();
      // editBridge is cleared by GeneratePlanPage on read, no action needed here
      sessionStorage.removeItem('paymentReturnTo');
      setTimeout(() => navigate(returnTo), 1800);
    } catch (err: any) {
      addToast('Payment failed. Please try again.', 'error');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayPalLogin = async () => {
    // Mock PayPal login
    if (!paypalEmail || !paypalPassword) {
      addToast('Please enter email and password', 'warning');
      return;
    }
    setIsLoading(true);
    setShowPayPalLogin(false);
    await new Promise(r => setTimeout(r, 1000)); // Simulate API call
    await handleSubmit();
  };

  return (
    <Layout>
      <main className="container mx-auto max-w-4xl px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-3">Upgrade to Pro</h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">Unlock unlimited AI-generated fitness plans</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* LEFT: Pricing Cards */}
          <div className="lg:col-span-2 space-y-4">
            {/* Monthly Card */}
            <button
              onClick={() => setSelectedPlan('monthly')}
              className={`w-full text-left border-2 rounded-xl p-6 transition-all ${
                selectedPlan === 'monthly'
                  ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                  : 'border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600'
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Monthly</h3>
                  <p className="text-4xl font-bold text-gray-900 dark:text-white">
                    ${prices.monthly.price}
                    <span className="text-lg text-gray-600 dark:text-gray-400">/mo</span>
                  </p>
                </div>
                {selectedPlan === 'monthly' && (
                  <div className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
            </button>

            {/* Yearly Card */}
            <button
              onClick={() => setSelectedPlan('yearly')}
              className={`w-full text-left border-2 rounded-xl p-6 transition-all ${
                selectedPlan === 'yearly'
                  ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                  : 'border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600'
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="inline-block bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold px-3 py-1 rounded-full mb-2">
                    Save 33%
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Yearly</h3>
                  <p className="text-4xl font-bold text-gray-900 dark:text-white">
                    ${prices.yearly.price}
                    <span className="text-lg text-gray-600 dark:text-gray-400">/yr</span>
                  </p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 line-through mt-1">
                    ${prices.yearly.originalPrice}
                  </p>
                </div>
                {selectedPlan === 'yearly' && (
                  <div className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
            </button>

            {/* Feature List */}
            <div className="space-y-3 mt-6 pt-4 border-t border-gray-200 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <span className="text-lg">✓</span>
                <span className="text-gray-700 dark:text-gray-300">Unlimited plan generations</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg">✓</span>
                <span className="text-gray-700 dark:text-gray-300">AI-powered meal plans</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg">✓</span>
                <span className="text-gray-700 dark:text-gray-300">Personalized workout schedules</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg">✓</span>
                <span className="text-gray-700 dark:text-gray-300">Cancel anytime</span>
              </div>
            </div>
          </div>

          {/* RIGHT: Payment Form */}
          <div className="lg:col-span-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl p-8 shadow-sm relative">
            {successState && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/95 dark:bg-slate-800/95 rounded-2xl z-10">
                <div className="text-center">
                  <div className="text-6xl mb-4">✅</div>
                  <h3 className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">Payment Successful!</h3>
                  <p className="text-gray-600 dark:text-gray-400">Redirecting to your plan generator...</p>
                </div>
              </div>
            )}

            {/* Payment Method Tabs */}
            <div className="flex gap-2 mb-8 border border-gray-200 dark:border-slate-700 rounded-lg p-1 bg-gray-50 dark:bg-slate-700">
              <button
                onClick={() => setActiveTab('card')}
                className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors ${
                  activeTab === 'card'
                    ? 'bg-white dark:bg-slate-800 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Card
              </button>
              <button
                onClick={() => setActiveTab('paypal')}
                className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors ${
                  activeTab === 'paypal'
                    ? 'bg-white dark:bg-slate-800 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                PayPal
              </button>
            </div>

            {/* Card Tab */}
            {activeTab === 'card' && (
              <form className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">Card Number</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="1234 5678 9012 3456"
                      value={cardNumber}
                      onChange={(e) => formatCardNumber(e.target.value)}
                      maxLength={19}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-lg"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-1">
                      <svg className="w-8 h-5 text-blue-600" viewBox="0 0 48 32" fill="currentColor">
                        <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fontSize="10" fill="white">VISA</text>
                      </svg>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">Cardholder Name</label>
                  <input
                    type="text"
                    placeholder="John Smith"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">Expiry</label>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      value={expiry}
                      onChange={(e) => formatExpiry(e.target.value)}
                      maxLength={5}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-1 text-sm font-semibold text-gray-900 dark:text-white mb-2">
                      CVV
                      <span className="text-gray-400 dark:text-gray-500 text-xs cursor-help" title="3-4 digit security code">?</span>
                    </label>
                    <input
                      type="password"
                      placeholder="•••"
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      maxLength={4}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
              </form>
            )}

            {/* PayPal Tab */}
            {activeTab === 'paypal' && (
              <div className="flex flex-col items-center justify-center py-12 gap-4">
                <div className="text-gray-500 dark:text-gray-400 text-sm">Click below to connect your PayPal account</div>
                <button
                  onClick={() => setShowPayPalLogin(true)}
                  disabled={isLoading}
                  className="w-full max-w-xs bg-[#0070BA] text-white rounded-full py-3 font-bold text-lg flex items-center justify-center gap-2 hover:bg-blue-700 disabled:opacity-60"
                >
                  {isLoading ? (
                    <div className="animate-spin">⏳</div>
                  ) : (
                    <>
                      Pay<span className="italic font-extrabold text-[#009CDE]">Pal</span>
                    </>
                  )}
                </button>
              </div>
            )}


            {/* CTA Button */}
            {activeTab === 'card' && (
              <>
                <button
                  onClick={handleSubmit}
                  disabled={isLoading || !cardNumber || !cardName || !expiry || !cvv}
                  className="w-full mt-8 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-purple-800 text-white font-bold text-lg shadow-lg hover:shadow-xl disabled:opacity-60 transition-all"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin">⏳</div>
                      Processing...
                    </div>
                  ) : (
                    `Start ${selectedPlan === 'monthly' ? 'Monthly' : 'Yearly'} Plan →`
                  )}
                </button>

                <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-4">Cancel anytime · No hidden fees</p>
              </>
            )}

            {/* Trust Indicators */}
            <div className="mt-8 pt-6 border-t border-gray-100 dark:border-slate-700">
              <div className="flex items-center justify-center gap-2 text-gray-400 dark:text-gray-500 text-xs mb-4">
                🔒 256-bit SSL encrypted · PCI DSS compliant
              </div>

              {/* Card Logos */}
              <div className="flex items-center justify-center gap-6">
                <div className="text-gray-400 dark:text-gray-500 text-xs font-semibold">Visa</div>
                <div className="text-gray-400 dark:text-gray-500 text-xs font-semibold">Mastercard</div>
                <div className="text-gray-400 dark:text-gray-500 text-xs font-semibold">PayPal</div>
                <div className="text-gray-400 dark:text-gray-500 text-xs font-semibold">Amex</div>
              </div>
            </div>
          </div>
        </div>

        {/* PayPal Login Modal */}
        {showPayPalLogin && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-sm w-full mx-4">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 rounded-t-2xl">
                <h2 className="text-xl font-bold text-white">Log in to your PayPal account</h2>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handlePayPalLogin();
                }}
                className="p-6 space-y-4"
              >
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-1">Email or phone</label>
                  <input
                    type="email"
                    value={paypalEmail}
                    onChange={(e) => setPaypalEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-1">Password</label>
                  <input
                    type="password"
                    value={paypalPassword}
                    onChange={(e) => setPaypalPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowPayPalLogin(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-60"
                  >
                    {isLoading ? 'Processing...' : 'Log In'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </main>
    </Layout>
  );
}
