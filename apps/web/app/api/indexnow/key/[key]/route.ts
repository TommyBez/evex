import { buildIndexNowKeyFileResponse } from '@/lib/indexnow'

// Public path is /{key}.txt via the rewrite in next.config.ts. Specific
// siblings (robots.txt, llms.txt, llms-full.txt) stay on their own routes.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ key: string }> },
) {
  const { key } = await params
  return buildIndexNowKeyFileResponse(key)
}
