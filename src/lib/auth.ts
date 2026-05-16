import supabase, { supabaseAdmin } from '../api/supabase';
import { UserProfile } from '../types/auth';

const toEmail = (username: string) => `${username.toLowerCase().trim()}@tc.local`;

export async function signIn(username: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: toEmail(username),
    password,
  });
  if (error) throw new Error('Invalid username or password');
  return data;
}

export async function signOut() {
  await supabase.auth.signOut();
}

export async function getMyProfile(): Promise<UserProfile | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single();
  return data;
}

export async function listUsers(): Promise<UserProfile[]> {
  const { data, error } = await supabaseAdmin
    .from('user_profiles')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function createUser(
  username: string,
  password: string,
  role: 'admin' | 'user',
  createdBy: string
): Promise<void> {
  const email = toEmail(username);
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { role, username },
  });
  if (error) throw new Error(error.message.includes('already') ? 'Username already exists' : error.message);

  await supabaseAdmin.from('user_profiles').upsert({
    id: data.user.id,
    email,
    username,
    role,
    created_by: createdBy,
  });
}

export async function updateUser(
  userId: string,
  username: string,
  password: string,
  role: 'admin' | 'user'
): Promise<void> {
  const email = toEmail(username);
  const updates: any = { email, user_metadata: { role, username } };
  if (password) updates.password = password;

  const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, updates);
  if (error) throw error;

  await supabaseAdmin.from('user_profiles').update({ email, username, role }).eq('id', userId);
}

export async function deleteUser(userId: string): Promise<void> {
  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
  if (error) throw error;
}
