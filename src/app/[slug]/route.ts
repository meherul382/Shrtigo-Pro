import { NextResponse } from 'next/server'
import { createHash } from 'crypto'
import { supabaseAdmin } from '@/lib/supabase-admin'

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
  if (!supabaseAdmin) return new NextResponse('Shrtigo Pro is not configured yet.', { status: 503 })

  const { data: link, error } = await supabaseAdmin.from('links').select('id,target_url,expires_at,is_active').eq('slug', slug).maybeSingle()
  if (error || !link || !link.is_active || (link.expires_at && new Date(link.expires_at) <= new Date())) return new NextResponse('Short link not found or expired.', { status: 404 })

  const headers = request.headers
  const ua = headers.get('user-agent') || ''
  const forwarded = headers.get('x-forwarded-for')?.split(',')[0]?.trim() || headers.get('x-real-ip') || ''
  const ipHash = forwarded ? createHash('sha256').update(`${forwarded}:${process.env.IP_HASH_SALT || 'shrtigo'}`).digest('hex') : null

  await Promise.all([
    supabaseAdmin.from('clicks').insert({ link_id: link.id, ip_hash: ipHash, user_agent: ua, referrer: headers.get('referer'), device: detectDevice(ua), browser: detectBrowser(ua), os: detectOs(ua) }),
    supabaseAdmin.rpc('increment_click_count', { p_link_id: link.id }),
  ])

  return NextResponse.redirect(link.target_url, 302)
}
