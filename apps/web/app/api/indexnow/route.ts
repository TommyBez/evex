import { connection, NextResponse } from 'next/server'
import { isIndexNowCronAuthorized, submitIndexNow } from '@/lib/indexnow'

// Vercel Cron sends GET. POST is the same handler for a manual post-deploy ping.
async function handleIndexNow(request: Request) {
  await connection()

  if (!isIndexNowCronAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const result = await submitIndexNow()

  if (result.status === 'error') {
    return NextResponse.json(result, { status: 502 })
  }

  return NextResponse.json(result, {
    status:
      result.status === 'submitted' && result.httpStatus === 202 ? 202 : 200,
  })
}

export function GET(request: Request) {
  return handleIndexNow(request)
}

export function POST(request: Request) {
  return handleIndexNow(request)
}
