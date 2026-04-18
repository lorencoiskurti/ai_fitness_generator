import { apiService } from './api';
import { SubscriptionStatus } from '../types/index';

export const subscriptionService = {
  getSubscription: async (): Promise<SubscriptionStatus> => {
    const response = await apiService.get('/subscription');
    return response as SubscriptionStatus;
  },

  activateSubscription: async (plan: 'monthly' | 'yearly'): Promise<{ success: boolean }> => {
    const response = await apiService.post('/subscription/activate', { plan });
    return response as { success: boolean };
  },
};
