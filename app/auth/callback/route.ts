import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server' 

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    
    // Exchange the code for a session
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && data?.session) {
      const response = NextResponse.redirect(`${origin}${next}`)
      
      // ✅ THIS BLOCK IS CRITICAL - IT SAVES THE COOKIE
      if (data.session.provider_token) {
        response.cookies.set('google_provider_token', data.session.provider_token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 3600, // 1 hour
          path: '/',
        })
      }
      
      return response
    }
  }

  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}