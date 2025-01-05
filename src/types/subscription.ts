export interface ModelSubscriptionSetting {
  id: string;
  model: string;
  tokens_per_period: number;
  reset_period: 'daily' | 'weekly' | 'monthly' | 'never';
  lifetime_max_tokens?: number;
  created_at?: string;
  updated_at?: string;
}

export interface TokenUsageResponse {
  allowed: boolean;
  message?: string;
}