export interface UserProfile {
  id: string;
  email: string;
  username: string;
  role: 'admin' | 'user';
  created_by?: string;
  created_at?: string;
}
