export interface ModelSubscriptionSetting {
  id: string;
  model: string;
  units_per_period: number;
  reset_period: 'daily' | 'weekly' | 'monthly' | 'never';
  lifetime_max_units?: number;
  created_at?: string;
  updated_at?: string;
  limit_type?: string;
  user_role: 'super_admin' | 'admin' | 'paid_user' | 'user';
}

export interface TokenUsageResponse {
  allowed: boolean;
  message?: string;
}