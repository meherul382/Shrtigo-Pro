import { createHash } from 'crypto'
import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

export const runtime = 'nodejs'

function detectDevice(ua: string) {
  if (/tablet|ipad/i.test(ua)) return 'Tablet'
  if (/mobile|android|iphone/i.test(ua)) return 'Mobile'
  return 'Desktop'
}

function detectBrowser(ua: string) {
  if (/edg\//i.test(ua)) return 'Edge'
  if (/chrome|crios/i.test(ua)) return 'Chrome'
  if (/firefox|fxios/i.test(ua)) return 'Firefox'
  if (/safari/i.test(ua) && !/chrome/i.test(ua)) return 'Safari'
  return 'Other'
}

function detectOs(ua: string) {
  if (/windows/i.test(ua)) return 'Windows'
  if (/mac os|macintosh/i.test(ua)) return 'macOS'
  if (/android/i.test(ua)) return 'Android'
  if (/iphone|ipad|ios/i.test(ua)) return 'iOS'
  if (/linux/i.test(ua)) return 'Linux'
  return 'Other'
}

export async function GET(request: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params

  try {
    const supabase = getSupabaseAdmin()
    const { data: link, error } = await supabase
      .from('links')
      .select('id, destination_url, expires_at, is_active')
      .eq('slug', slug)
      .maybeSingle()

    if (error) {
      console.error('Shrtigo lookup failed:', error)
      return new NextResponse('Service temporarily unavailable.', { status: 503 })
    }

    if (!link || !link.is_active || (link.expires_at && new Date(link.expires_at) <= new Date())) {
      return new NextResponse('Short link not found or expired.', { status: 404 })
    }

    const headers = request.headers
    const ua = headers.get('user-agent') || ''
    const ip = headers.get('x-forwarded-for')?.split(',')[0]?.trim() || headers.get('x-real-ip') || ''
    const salt = process.env.IP_HASH_SALT
    const visitorHash = ip && salt
      ? createHash('sha256').update(`${ip}:${salt}`).digest('hex')
      : null

    await supabase.from('link_clicks').insert({
      link_id: link.id,
      country: headers.get('x-vercel-ip-country'),
      city: headers.get('x-vercel-ip-city'),
      device_type: detectDevice(ua),
      browser: detectBrowser(ua),
      os: detectOs(ua),
      referrer: headers.get('referer'),
      visitor_hash: visitorHash,
    })

    return NextResponse.redirect(link.destination_url, 302)
  } catch (error) {
    console.error('Shrtigo redirect error:', error)
    return new NextResponse('Shrtigo Pro is not configured yet.', { status: 503 })
  }
}
