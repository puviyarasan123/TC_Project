import supabase from '../api/supabase';
import { TCFormData, TCRecord, TCDownloadLog } from '../types/tc';

async function generateTCNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const { count } = await supabase
    .from('tc_records')
    .select('*', { count: 'exact', head: true })
    .like('tc_number', `TC/${year}/%`)
    .throwOnError();
  const next = (count ?? 0) + 1;
  return `TC/${year}/${String(next).padStart(3, '0')}`;
}

export async function createTC(data: TCFormData): Promise<TCRecord> {
  const tc_number = await generateTCNumber();
  const { data: row, error } = await supabase
    .from('tc_records')
    .insert({ ...data, tc_number })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return row as TCRecord;
}

export async function getAllTCs(): Promise<TCRecord[]> {
  const { data, error } = await supabase
    .from('tc_records')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data as TCRecord[];
}

export async function getTCById(id: number): Promise<TCRecord> {
  const { data, error } = await supabase
    .from('tc_records')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw new Error(error.message);
  return data as TCRecord;
}

export async function updateTC(id: number, data: Partial<TCFormData>): Promise<TCRecord> {
  const { data: row, error } = await supabase
    .from('tc_records')
    .update(data)
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return row as TCRecord;
}

export async function incrementDownloadCount(id: number, newCount: number): Promise<void> {
  const { error } = await supabase
    .from('tc_records')
    .update({ download_count: newCount })
    .eq('id', id);
  if (error) throw new Error(error.message);
}

export async function addDownloadLog(tc_id: number, download_count: number, reason: string): Promise<void> {
  const { error } = await supabase
    .from('tc_download_logs')
    .insert({ tc_id, download_count, reason });
  if (error) throw new Error(error.message);
}

export async function getDownloadLogs(tc_id: number): Promise<TCDownloadLog[]> {
  const { data, error } = await supabase
    .from('tc_download_logs')
    .select('*')
    .eq('tc_id', tc_id)
    .order('download_count', { ascending: true });
  if (error) throw new Error(error.message);
  return data as TCDownloadLog[];
}

export async function deleteTC(id: number): Promise<void> {
  const { error } = await supabase.from('tc_records').delete().eq('id', id);
  if (error) throw new Error(error.message);
}
