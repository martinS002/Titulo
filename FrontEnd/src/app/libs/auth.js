import { supabase } from './supabaseClient';

export const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  if (data.session) {
    document.cookie = `supabase-auth-token=${data.session.access_token}; path=/;`;
  }
};
