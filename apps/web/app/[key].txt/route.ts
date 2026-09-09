import { buildIndexNowKeyFileResponse } from '@/lib/indexnow'

// Hosts the IndexNow key at the protocol path /{key}.txt. Specific
// siblings (robots.txt, llms.txt, llms-full.txt) win over this dynamic slot.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ key: string }> },
) {
  const { key } = await params
  return buildIndexNowKeyFileResponse(key)
}
