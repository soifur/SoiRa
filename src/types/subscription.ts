export type ResetPeriod = 'daily' | 'weekly' | 'monthly' | 'never';
export type LimitType = 'messages' | 'tokens';
export type UserRole = 'super_admin' | 'admin' | 'user' | 'paid_user';

export interface ModelSubscriptionSetting {
  id: string;
  model?: string;
  units_per_period: number;
  reset_period: ResetPeriod;
  reset_amount: number;
  lifetime_max_units?: number;
  limit_type: LimitType;
  user_role: UserRole;
  bot_id?: string;
  created_at?: string;
  updated_at?: string;
}