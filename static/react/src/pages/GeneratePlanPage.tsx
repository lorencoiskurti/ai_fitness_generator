import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import Layout from '../components/Layout';
import FormField from '../components/FormField';
import Button from '../components/Button';
import { apiService } from '../services/api';
import {
  validateAge,
  validateGender,
  validateHeight,
  validateWeight,
  validateActivityLevel,
  validateFitnessGoal
} from '../utils/validation';

interface FormData {
  age: string;
  gender: string;
  height_cm: string;
  weight_kg: string;
  activity_level: string;
  dietary_preference: string;
  fitness_goal: string;
}

interface BMIResult {
  bmi: number;
  category: string;
}

export default function GeneratePlanPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { addToast } = useToast();
  const [formData, setFormData] = useState<FormData>({
    age: '',
    gender: '',
    height_cm: '',
    weight_kg: '',
    activity_level: '',
    dietary_preference: 'none',
    fitness_goal: ''
  });

  const [originalFormData, setOriginalFormData] = useState<FormData | null>(null);
  const [bmiResult, setBmiResult] = useState<BMIResult | null>(null);
  const [tdee, setTdee] = useState<number | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editPlanId, setEditPlanId] = useState<number | null>(null);

  // Load edit data from Router state (normal edit flow) or sessionStorage bridge (payment redirect)
  useEffect(() => {
    // Priority 1: Router state (navigating from PlansPage with edit data)
    const routerState = location.state as {
      editPlanId?: number;
      editFormData?: any;
    } | null;

    if (routerState?.editFormData) {
      const data = routerState.editFormData;
      const loadedData: FormData = {
        age: data.age?.toString() || '',
        gender: data.gender || '',
        height_cm: data.height_cm?.toString() || '',
        weight_kg: data.weight_kg?.toString() || '',
        activity_level: data.activity_level || '',
        dietary_preference: data.dietary_preference || 'none',
        fitness_goal: data.fitness_goal || ''
      };
      setFormData(loadedData);
      setOriginalFormData(loadedData); // Store original for dirty tracking
      setEditPlanId(routerState.editPlanId || null);
      setIsEditMode(true);
      return; // Router state wins, don't check sessionStorage
    }

    // Priority 2: sessionStorage bridge (returning from payment redirect)
    const bridge = sessionStorage.getItem('editBridge');
    if (bridge) {
      try {
        const data = JSON.parse(bridge);
        const loadedData: FormData = {
          age: data.age?.toString() || '',
          gender: data.gender || '',
          height_cm: data.height_cm?.toString() || '',
          weight_kg: data.weight_kg?.toString() || '',
          activity_level: data.activity_level || '',
          dietary_preference: data.dietary_preference || 'none',
          fitness_goal: data.fitness_goal || ''
        };
        setFormData(loadedData);

        // Retrieve editPlanId from sessionStorage to determine if this is an edit or new plan
        const storedPlanId = sessionStorage.getItem('editPlanId');
        const isEditing = !!storedPlanId;

        if (isEditing) {
          setIsEditMode(true);
          setEditPlanId(parseInt(storedPlanId));

          // For edits: restore original form data for dirty tracking
          const originalBridge = sessionStorage.getItem('originalBridge');
          if (originalBridge) {
            try {
              const originalData = JSON.parse(originalBridge);
              const originalLoadedData: FormData = {
                age: originalData.age?.toString() || '',
                gender: originalData.gender || '',
                height_cm: originalData.height_cm?.toString() || '',
                weight_kg: originalData.weight_kg?.toString() || '',
                activity_level: originalData.activity_level || '',
                dietary_preference: originalData.dietary_preference || 'none',
                fitness_goal: originalData.fitness_goal || ''
              };
              setOriginalFormData(originalLoadedData); // Restore original for dirty tracking
              sessionStorage.removeItem('originalBridge'); // Clear after reading
            } catch (err) {
              console.error('Failed to parse original bridge:', err);
              setOriginalFormData(loadedData); // Fallback to current if original fails
            }
          } else {
            setOriginalFormData(loadedData); // Fallback if no original
          }
        } else {
          // For new plans: stay in create mode, don't set edit mode
          setIsEditMode(false);
          setOriginalFormData(null); // No original for new plans
        }

        // Clear editPlanId after reading
        sessionStorage.removeItem('editPlanId');
      } catch (err) {
        console.error('Failed to parse edit bridge:', err);
      }
      // Clear bridge immediately after reading (one-time use)
      sessionStorage.removeItem('editBridge');
    }
    // If neither exists, form stays blank — correct for new plans
  }, [location.state]);

  // Clear form when user changes (logout/login with different account)
  useEffect(() => {
    // Store current user ID to detect changes
    const currentUserId = user?.user_id;

    // Only reset if we have a stored user ID and it's different
    if (currentUserId && sessionStorage.getItem('lastUserId') && sessionStorage.getItem('lastUserId') !== currentUserId.toString()) {
      // User has switched accounts - clear form data
      setFormData({
        age: '',
        gender: '',
        height_cm: '',
        weight_kg: '',
        activity_level: '',
        dietary_preference: 'none',
        fitness_goal: ''
      });
      setIsEditMode(false);
      setEditPlanId(null);
      setOriginalFormData(null);
      setBmiResult(null);
      setTdee(null);
      setErrors({});
      // Clear sessionStorage bridges
      sessionStorage.removeItem('editBridge');
      sessionStorage.removeItem('originalBridge');
      sessionStorage.removeItem('editPlanId');
    }

    // Update stored user ID
    if (currentUserId) {
      sessionStorage.setItem('lastUserId', currentUserId.toString());
    }
  }, [user?.user_id]);

  // Calculate BMI and TDEE in real-time as user updates form
  useEffect(() => {
    const height = parseFloat(formData.height_cm);
    const weight = parseFloat(formData.weight_kg);
    const age = parseInt(formData.age);

    if (height > 0 && weight > 0) {
      const heightM = height / 100;
      const bmi = weight / (heightM * heightM);

      let category = '';
      if (bmi < 18.5) category = 'Underweight';
      else if (bmi < 25) category = 'Normal weight';
      else if (bmi < 30) category = 'Overweight';
      else category = 'Obese';

      setBmiResult({ bmi: parseFloat(bmi.toFixed(2)), category });
    }

    // Calculate TDEE if we have enough data
    if (height > 0 && weight > 0 && age > 0 && formData.gender && formData.activity_level) {
      const bmr = calculateBMR(formData.gender, weight, height, age);
      const calculatedTdee = bmr * getActivityMultiplier(formData.activity_level);
      setTdee(parseFloat(calculatedTdee.toFixed(0)));
    }
  }, [formData.height_cm, formData.weight_kg, formData.age, formData.gender, formData.activity_level]);

  const calculateBMR = (gender: string, weight: number, height: number, age: number) => {
    if (gender === 'male') {
      return (10 * weight) + (6.25 * height) - (5 * age) + 5;
    } else if (gender === 'female') {
      return (10 * weight) + (6.25 * height) - (5 * age) - 161;
    }
    return (10 * weight) + (6.25 * height) - (5 * age);
  };

  const getActivityMultiplier = (level: string): number => {
    const multipliers: Record<string, number> = {
      sedentary: 1.2,
      lightly_active: 1.375,
      moderately_active: 1.55,
      very_active: 1.725,
      extra_active: 1.9
    };
    return multipliers[level] || 1.2;
  };

  // Check if form data has changed from original
  const formChanged = originalFormData && JSON.stringify(formData) !== JSON.stringify(originalFormData);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    const ageError = validateAge(formData.age);
    if (ageError) newErrors.age = ageError;

    const genderError = validateGender(formData.gender);
    if (genderError) newErrors.gender = genderError;

    const heightError = validateHeight(formData.height_cm);
    if (heightError) newErrors.height_cm = heightError;

    const weightError = validateWeight(formData.weight_kg);
    if (weightError) newErrors.weight_kg = weightError;

    const activityError = validateActivityLevel(formData.activity_level);
    if (activityError) newErrors.activity_level = activityError;

    const goalError = validateFitnessGoal(formData.fitness_goal);
    if (goalError) newErrors.fitness_goal = goalError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      addToast('Please fill in all required fields correctly', 'warning');
      return;
    }

    setLoading(true);
    const actionMsg = isEditMode ? 'Updating your plan...' : 'Generating your personalized plan...';
    addToast(actionMsg, 'info');
    try {
      const payload = {
        age: formData.age,
        gender: formData.gender,
        height_cm: formData.height_cm,
        weight_kg: formData.weight_kg,
        activity_level: formData.activity_level,
        dietary_preference: formData.dietary_preference,
        fitness_goal: formData.fitness_goal,
      };

      // Use PUT for edit mode, POST for new plans
      const endpoint = isEditMode ? `/plans/${editPlanId}` : '/generate_plan';
      const response = isEditMode
        ? await apiService.put(endpoint, payload)
        : await apiService.post(endpoint, payload);

      if (response.success) {
        // Store plan data in session/localStorage for results page
        sessionStorage.setItem('planData', JSON.stringify({
          plan_id: response.plan_id,
          bmi: response.bmi,
          bmi_category: response.bmi_category,
          tdee: response.tdee,
          meal_plan: response.meal_plan,
          workout_plan: response.workout_plan,
          user_data: response.user_data
        }));
        const successMsg = isEditMode ? 'Plan updated successfully!' : 'Plan generated successfully!';
        addToast(successMsg, 'success');
        navigate('/results');
      } else {
        const errorMsg = response.error || 'Failed to generate plan';
        setErrors({ submit: errorMsg });
        addToast(errorMsg, 'error');
      }
    } catch (err: any) {
      // Check if subscription is required
      const errData = err.response?.data || err.data;
      if (err.response?.status === 403 && errData?.error === 'subscription_required') {
        // Write current form data to sessionStorage bridge so it survives payment redirect
        // This works for both edit plans AND new plans
        sessionStorage.setItem('editBridge', JSON.stringify({
          age: formData.age,
          gender: formData.gender,
          height_cm: formData.height_cm,
          weight_kg: formData.weight_kg,
          activity_level: formData.activity_level,
          dietary_preference: formData.dietary_preference,
          fitness_goal: formData.fitness_goal
        }));
        // Also save original form data for dirty tracking when returning from payment
        if (originalFormData) {
          sessionStorage.setItem('originalBridge', JSON.stringify(originalFormData));
        }
        // Store editPlanId if in edit mode so we can resume editing after payment
        if (isEditMode && editPlanId) {
          sessionStorage.setItem('editPlanId', editPlanId.toString());
        }
        sessionStorage.setItem('paymentReturnTo', '/generate');
        addToast('A Pro subscription is required to generate plans.', 'warning');
        navigate('/payment');
        return;
      }
      const errorMsg = err.response?.data?.error || err.message || 'An error occurred. Please try again.';
      setErrors({ submit: errorMsg });
      addToast(errorMsg, 'error');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <main className="container mx-auto px-6 py-8">
        <h1 className="text-4xl font-bold text-center text-gray-900 mb-2">
          {isEditMode ? 'Edit Your Plan ✏️' : 'Generate Your Plan 🏋️‍♀️'}
        </h1>
        <p className="text-center text-gray-600 mb-8">
          {isEditMode
            ? 'Modify your details to regenerate your personalized meal and workout plan'
            : 'Enter your details to get a personalized meal and workout plan generated by AI!'}
        </p>

        <div className="max-w-2xl mx-auto">
          {!user.subscription_active && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6 flex items-center justify-between">
              <div>
                <p className="font-semibold text-purple-800">Pro subscription required</p>
                <p className="text-sm text-purple-600">Subscribe to generate unlimited AI fitness plans.</p>
              </div>
              <button
                onClick={() => {
                  sessionStorage.setItem('paymentReturnTo', '/generate');
                  navigate('/payment');
                }}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 whitespace-nowrap ml-4"
              >
                Go Pro
              </button>
            </div>
          )}

          {errors.submit && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
              {errors.submit}
            </div>
          )}

          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-8 border border-gray-200 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <FormField
                label="Age"
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
                placeholder="18-100"
                min="1"
                max="120"
                error={errors.age}
                icon="📅"
              />

              <div className="form-group">
                <label className="block text-sm font-semibold text-gray-900 uppercase tracking-wide mb-2">
                  Gender
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    errors.gender ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
                {errors.gender && <p className="text-red-600 text-sm mt-1">{errors.gender}</p>}
              </div>

              <FormField
                label="Height (cm)"
                type="number"
                name="height_cm"
                value={formData.height_cm}
                onChange={handleChange}
                placeholder="150-200"
                step="0.1"
                min="50"
                max="250"
                error={errors.height_cm}
                icon="📏"
              />

              <FormField
                label="Weight (kg)"
                type="number"
                name="weight_kg"
                value={formData.weight_kg}
                onChange={handleChange}
                placeholder="50-150"
                step="0.1"
                min="10"
                max="500"
                error={errors.weight_kg}
                icon="⚖️"
              />
            </div>

            {/* BMI Display */}
            {bmiResult && (
              <div className="bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-4 mb-8">
                <p className="text-sm text-gray-600 mb-2">Your Estimated Metrics:</p>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-2xl font-bold text-purple-600">BMI: {bmiResult.bmi}</p>
                    <p className="text-sm text-gray-600">{bmiResult.category}</p>
                  </div>
                  {tdee && (
                    <div className="text-right">
                      <p className="text-2xl font-bold text-purple-600">TDEE: {tdee}</p>
                      <p className="text-sm text-gray-600">Calories/day</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="form-group md:col-span-2">
                <label className="block text-sm font-semibold text-gray-900 uppercase tracking-wide mb-2">
                  Activity Level
                </label>
                <select
                  name="activity_level"
                  value={formData.activity_level}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    errors.activity_level ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select Activity Level</option>
                  <option value="sedentary">Sedentary (little or no exercise)</option>
                  <option value="lightly_active">Lightly Active (1-3 days/week)</option>
                  <option value="moderately_active">Moderately Active (3-5 days/week)</option>
                  <option value="very_active">Very Active (6-7 days/week)</option>
                  <option value="extra_active">Extra Active (physical job)</option>
                </select>
                {errors.activity_level && <p className="text-red-600 text-sm mt-1">{errors.activity_level}</p>}
              </div>

              <div className="form-group">
                <label className="block text-sm font-semibold text-gray-900 uppercase tracking-wide mb-2">
                  Dietary Preference
                </label>
                <select
                  name="dietary_preference"
                  value={formData.dietary_preference}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="none">None</option>
                  <option value="vegetarian">Vegetarian</option>
                  <option value="vegan">Vegan</option>
                  <option value="gluten_free">Gluten-Free</option>
                  <option value="paleo">Paleo</option>
                  <option value="keto">Keto</option>
                </select>
              </div>

              <div className="form-group">
                <label className="block text-sm font-semibold text-gray-900 uppercase tracking-wide mb-2">
                  Fitness Goal
                </label>
                <select
                  name="fitness_goal"
                  value={formData.fitness_goal}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    errors.fitness_goal ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select Goal</option>
                  <option value="lose_weight">Lose Weight</option>
                  <option value="maintain_weight">Maintain Weight</option>
                  <option value="gain_muscle">Gain Muscle</option>
                </select>
                {errors.fitness_goal && <p className="text-red-600 text-sm mt-1">{errors.fitness_goal}</p>}
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={loading || (isEditMode && !formChanged)}
              className="w-full mb-4"
            >
              {loading
                ? (isEditMode ? 'Updating your plan...' : 'Generating your plan...')
                : (isEditMode ? 'Update Plan' : 'Generate Plan')
              }
            </Button>

            {loading && (
              <div className="flex items-center justify-center gap-2 text-purple-600">
                <div className="animate-spin">⏳</div>
                <p>This may take a moment...</p>
              </div>
            )}
          </form>

          <div className="text-center">
            <Button
              variant="secondary"
              onClick={() => navigate('/plans')}
            >
              View My Saved Plans
            </Button>
          </div>
        </div>
      </main>
    </Layout>
  );
}
