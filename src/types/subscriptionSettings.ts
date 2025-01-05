import { UserRole } from "./user";

export type LimitType = 'tokens' | 'messages';
export type ResetPeriod = 'daily' | 'weekly' | 'monthly' | 'never';

export interface SubscriptionSettings {
  units_per_period: number;
  reset_period: ResetPeriod;
  lifetime_max_units?: number;
  limit_type: LimitType;
  user_role: UserRole;
}