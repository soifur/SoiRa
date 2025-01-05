export interface BotCategory {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  share_key?: string;
  short_key?: string;
  is_public?: boolean;
}

export interface CategoryAssignment {
  id: string;
  bot_id: string;
  category_id: string;
  created_at: string;
}