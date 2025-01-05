export interface ModelSubscriptionSetting {
  id: string;
  model: string;
  units_per_period: number;
  reset_period: 'daily' | 'weekly' | 'monthly' | 'never';
  lifetime_max_units?: number;
  limit_type?: string;
  user_role?: 'super_admin' | 'admin' | 'user' | 'paid_user';
  bot_id?: string;
  created_at?: string;
  updated_at?: string;
}