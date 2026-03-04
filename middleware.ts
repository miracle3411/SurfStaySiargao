import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Routes that require authentication
const protectedRoutes = ['/bookings']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if the current path is protected
  const isProtected = protectedRoutes.some(route => pathname.startsWith(route))
  if (!isProtected) {
    return NextResponse.next()
  }

  // Check for Supabase auth token in cookies
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  // Look for the Supabase auth cookie
  const authCookie = request.cookies.getAll().find(c =>
    c.name.startsWith('sb-') && c.name.endsWith('-auth-token')
  )

  if (!authCookie) {
    // No auth cookie — redirect to login with return URL
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname + request.nextUrl.search)
    return NextResponse.redirect(loginUrl)
  }

  // Verify the token is valid by decoding it
  try {
    const tokenData = JSON.parse(authCookie.value)
    const accessToken = Array.isArray(tokenData) ? tokenData[0] : tokenData.access_token

    if (!accessToken) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname + request.nextUrl.search)
      return NextResponse.redirect(loginUrl)
    }

    // Create a Supabase client and verify the session
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${accessToken}` } },
    })

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname + request.nextUrl.search)
      return NextResponse.redirect(loginUrl)
    }

    return NextResponse.next()
  } catch {
    // Token parsing failed — redirect to login
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname + request.nextUrl.search)
    return NextResponse.redirect(loginUrl)
  }
}

export const config = {
  matcher: ['/bookings/:path*'],
}
