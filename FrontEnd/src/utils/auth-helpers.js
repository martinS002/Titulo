// src/utils/auth-helpers.ts

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export const supabase = createClientComponentClient()

export async function checkUserRole() {
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) return null

  const { data: userData } = await supabase
    .from('users')
    .select('role, is_admin')
    .eq('id', session.user.id)
    .single()

  return userData
}