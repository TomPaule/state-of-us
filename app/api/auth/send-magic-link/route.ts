import { Resend } from 'resend'
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const resend = new Resend(process.env.RESEND_API_KEY)

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)

export async function POST(request: Request) {
  const { email } = await request.json()

  if (!email) {
    return NextResponse.json({ error: 'Email required' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin.auth.admin.generateLink({
    type: 'magiclink',
    email,
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  })

  if (error || !data) {
    return NextResponse.json({ error: error?.message ?? 'Failed to generate link' }, { status: 500 })
  }

  // Send via Resend
  const magicLink = data.properties?.action_link

  const { error: emailError } = await resend.emails.send({
    from: 'The State of Us <onboarding@resend.dev>',
    to: email,
    subject: 'Your sign-in link — The State of Us',
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
        <h1 style="font-size: 24px; font-weight: 600; color: #1C1917; margin-bottom: 8px;">
          Sign in to The State of Us
        </h1>
        <p style="color: #78716C; font-size: 15px; line-height: 1.6; margin-bottom: 32px;">
          Click the link below to sign in. This link expires in 1 hour and can only be used once.
        </p>
        <a 
          href="${magicLink}"
          style="display: inline-block; background: #1C1917; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 500;"
        >
          Sign in to your civic record
        </a>
        <p style="color: #A8A29E; font-size: 13px; margin-top: 32px; line-height: 1.6;">
          If you didn't request this, you can safely ignore this email.
        </p>
        <hr style="border: none; border-top: 1px solid #E7E5E4; margin: 32px 0;" />
        <p style="color: #A8A29E; font-size: 12px;">
          The State of Us — Societal Health Index
        </p>
      </div>
    `,
  })

  if (emailError) {
    return NextResponse.json({ error: emailError.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}