import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

function generateToken(): string {
  return Math.random().toString(36).substring(2, 10)
}

export async function POST(request: Request) {
  const { userId, contentType, contentId, ringId, title, stat, why } = await request.json()

  const token = generateToken()

  const { data, error } = await supabaseAdmin
    .from('shares')
    .insert({
      user_id: userId ?? null,
      content_type: contentType,
      content_id: contentId,
      share_token: token,
      click_count: 0,
      metadata: { ringId, title, stat, why },
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    token,
    url: `${process.env.NEXT_PUBLIC_SITE_URL}/share/${token}`,
  })
}