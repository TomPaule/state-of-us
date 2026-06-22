import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export async function POST(request: Request) {
  const { token } = await request.json()

  await supabaseAdmin.rpc('increment_share_clicks', { share_token: token })

  const { data } = await supabaseAdmin
    .from('shares')
    .select('*')
    .eq('share_token', token)
    .single()

  return NextResponse.json({ share: data })
}