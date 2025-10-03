import { withAuth } from "next-auth/middleware"

export default withAuth(
  function middleware(req) {
    // Add any custom middleware logic here
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Protect admin routes
        if (req.nextUrl.pathname.startsWith('/admin')) {
          return token?.role === 'admin'
        }
        
        // Protect dashboard routes
        if (req.nextUrl.pathname.startsWith('/dashboard')) {
          return !!token
        }
        
        // Protect API routes that require authentication
        if (req.nextUrl.pathname.startsWith('/api/ai') || 
            req.nextUrl.pathname.startsWith('/api/user') ||
            req.nextUrl.pathname.startsWith('/api/analytics')) {
          return !!token
        }
        
        return true
      },
    },
  }
)

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/api/ai/:path*',
    '/api/user/:path*',
    '/api/analytics/:path*'
  ]
}