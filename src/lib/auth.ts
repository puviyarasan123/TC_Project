import supabase, { supabaseAdmin } from '../api/supabase';
import { UserProfile } from '../types/auth';

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
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

// Admin: list all users from user_profiles
export async function listUsers(): Promise<UserProfile[]> {
  const { data, error } = await supabaseAdmin
    .from('user_profiles')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

// Admin: create user with temp password, then send password reset email
export async function createUser(
  email: string,
  role: 'admin' | 'user',
  createdBy: string
): Promise<void> {
  const tempPassword = generatePassword();

  // 1. Create the auth user
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password: tempPassword,
    email_confirm: true,
    user_metadata: { role },
  });
  if (error) throw error;

  // 2. Upsert profile with role
  await supabaseAdmin.from('user_profiles').upsert({
    id: data.user.id,
    email,
    role,
    created_by: createdBy,
  });

  // 3. Send password reset email so user sets their own password
  //    This uses Supabase's built-in email (works on free tier)
  const { error: resetErr } = await supabaseAdmin.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });
  if (resetErr) throw resetErr;
}

// Admin: resend password reset email
export async function resendPassword(email: string): Promise<void> {
  const { error } = await supabaseAdmin.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });
  if (error) throw error;
}

// Admin: delete user
export async function deleteUser(userId: string): Promise<void> {
  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
  if (error) throw error;
}

// Admin: update role in user_profiles
export async function updateUserRole(userId: string, role: 'admin' | 'user'): Promise<void> {
  const { error } = await supabaseAdmin
    .from('user_profiles')
    .update({ role })
    .eq('id', userId);
  if (error) throw error;
}

function generatePassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#$!';
  return Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}
