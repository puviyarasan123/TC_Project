import supabase from '../api/supabase';
import { uploadLogoToCloudinary } from '../api/cloudinary';
import { CollegeData } from '../types/tc';

export async function getAllColleges(): Promise<CollegeData[]> {
  const { data, error } = await supabase
    .from('colleges')
    .select('*')
    .order('name', { ascending: true });
  if (error) throw new Error(error.message);
  return data as CollegeData[];
}

export async function getCollegeById(id: number): Promise<CollegeData> {
  const { data, error } = await supabase
    .from('colleges')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw new Error(error.message);
  return data as CollegeData;
}

export async function createCollege(
  fields: { name: string; trust_name: string; affiliation: string; address: string },
  logoFile: File
): Promise<CollegeData> {
  const logo_url = await uploadLogoToCloudinary(logoFile);
  const { data, error } = await supabase
    .from('colleges')
    .insert({ ...fields, logo_url })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as CollegeData;
}

export async function updateCollege(
  id: number,
  fields: Partial<{ name: string; trust_name: string; affiliation: string; address: string }>,
  logoFile?: File
): Promise<CollegeData> {
  const updates: Record<string, string> = { ...fields };
  if (logoFile) updates.logo_url = await uploadLogoToCloudinary(logoFile);
  const { data, error } = await supabase
    .from('colleges')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as CollegeData;
}

export async function deleteCollege(id: number): Promise<void> {
  const { error } = await supabase.from('colleges').delete().eq('id', id);
  if (error) throw new Error(error.message);
}
