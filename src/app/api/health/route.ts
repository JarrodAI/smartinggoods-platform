import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`
    
    // Check environment variables
    const requiredEnvVars = [
      'DATABASE_URL',
      'NEXTAUTH_SECRET',
      'OPENAI_API_KEY'
    ]
    
    const missingEnvVars = requiredEnvVars.filter(
      envVar => !process.env[envVar]
    )
    
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      services: {
        database: 'healthy',
        api: 'healthy',
        ai: process.env.OPENAI_API_KEY ? 'healthy' : 'degraded',
        redis: process.env.REDIS_URL ? 'healthy' : 'not_configured',
        stripe: process.env.STRIPE_SECRET_KEY ? 'healthy' : 'not_configured',
        twilio: process.env.TWILIO_ACCOUNT_SID ? 'healthy' : 'not_configured'
      },
      environment: process.env.NODE_ENV,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      missingEnvVars: missingEnvVars.length > 0 ? missingEnvVars : undefined
    }
    
    const statusCode = missingEnvVars.length > 0 ? 206 : 200
    
    return NextResponse.json(healthStatus, { status: statusCode })
    
  } catch (error) {
    console.error('Health check failed:', error)
    
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
        services: {
          database: 'unhealthy',
          api: 'degraded'
        }
      },
      { status: 503 }
    )
  }
}