'use server'

import { getServerSupabase } from '@/lib/supabase-server';

export async function getSettings() {
  try {
    const supabase = getServerSupabase();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;
    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', user.id)
      .single();
    if (error && error.code !== 'PGRST116') {
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

export async function saveSettings(settings: {
  openai_key: string;
  provider: string;
  model: string;
}) {
  try {
    const supabase = getServerSupabase();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { success: true };
    }
    const { data: existing } = await supabase
      .from('user_settings')
      .select('user_id')
      .eq('user_id', user.id)
      .maybeSingle();
    if (existing) {
      const { error } = await supabase
        .from('user_settings')
        .update({
          openai_key: settings.openai_key,
          provider: settings.provider,
          openai_model: settings.model,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);
      if (error) throw error;
    } else {
      const { error } = await supabase.from('user_settings').insert({
        user_id: user.id,
        openai_key: settings.openai_key,
        provider: settings.provider,
        openai_model: settings.model,
      });
      if (error) throw error;
    }
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}
