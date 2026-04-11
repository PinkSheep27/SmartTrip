import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server' 

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  const error_description = searchParams.get('error_description')

  // 1. IF SUPABASE SENT AN ERROR, PRINT IT OUT!
  if (error || error_description) {
    return new Response(`Supabase Auth Error: ${error} - ${error_description}`, { status: 400 })
  }

  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    
    // Exchange the code for a session
    const { data, error: sessionError } = await supabase.auth.exchangeCodeForSession(code)
    
    // 2. IF THE CODE EXCHANGE FAILED, PRINT IT OUT!
    if (sessionError) {
      return new Response(`Session Exchange Error: ${sessionError.message}`, { status: 400 })
    }

    if (data?.session) {
      const response = NextResponse.redirect(`${origin}${next}`)
      
      // Save the provider token cookie
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

  // 3. IF EVERYTHING ELSE FAILS, GO BACK TO LOGIN
  return NextResponse.redirect(`${origin}/LoginPage?error=Unknown%20authentication%20error`)
}