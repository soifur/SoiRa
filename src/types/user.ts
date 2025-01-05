export type UserRole = 'super_admin' | 'admin' | 'paid_user' | 'user';

export type UserProfile = {
  id: string;
  email: string;
  role: UserRole;
  blocked: boolean;
  created_at: string;
  first_name: string | null;
  last_name: string | null;
};