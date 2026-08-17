import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Renamed from middleware.ts — Next.js 16 deprecated the `middleware` file
// convention in favour of `proxy`.
export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Protected dashboard routes. Note: the route is `/docs` (not `/documents`);
  // `/access` and `/unassigned` are also authenticated.
  const protectedPaths = [
    '/dashboard',
    '/settings',
    '/messages',
    '/docs',
    '/photos',
    '/story',
    '/access',
    '/unassigned',
    '/recipients',
    '/onboarding',
  ]
  const isProtected = protectedPaths.some(path =>
    request.nextUrl.pathname.startsWith(path)
  )

  if (isProtected && !user) {
    return NextResponse.redirect(new URL('/signin', request.url))
  }

  const authPaths = ['/signin', '/signup', '/register']
  const isAuthPage = authPaths.some(path =>
    request.nextUrl.pathname === path || request.nextUrl.pathname.startsWith(path)
  )

  if (isAuthPage && user) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
}
