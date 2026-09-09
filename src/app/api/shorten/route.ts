import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

export const runtime = 'nodejs'

const RESERVED = new Set(['api', 'login', 'signup', 'dashboard', 'pricing', 'about', 'admin'])

function validUrl(value: string) {
  try {
    const url = new URL(value)
    return (url.protocol === 'http:' || url.protocol === 'https:') && Boolean(url.hostname)
  } catch {
    return false
  }
}

function randomSlug() {
  return crypto.randomUUID().replaceAll('-', '').slice(0, 7)
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const destinationUrl = String(body.url ?? '').trim()
    const requestedSlug = String(body.slug ?? '').trim().toLowerCase()

    if (!validUrl(destinationUrl)) {
      return NextResponse.json({ error: 'Please enter a valid http/https URL.' }, { status: 400 })
    }
    if (destinationUrl.length > 4096) {
      return NextResponse.json({ error: 'URL is too long.' }, { status: 400 })
    }
    if (requestedSlug && !/^[a-z0-9_-]{3,32}$/.test(requestedSlug)) {
      return NextResponse.json({ error: 'Custom slug must be 3–32 letters, numbers, hyphens or underscores.' }, { status: 400 })
    }
    if (requestedSlug && RESERVED.has(requestedSlug)) {
      return NextResponse.json({ error: 'That short code is reserved.' }, { status: 409 })
    }

    const supabase = getSupabaseAdmin()
    const slug = requestedSlug || randomSlug()
    const { data, error } = await supabase
      .from('links')
      .insert({ slug, destination_url: destinationUrl })
      .select('id, slug, destination_url, created_at, expires_at, is_active')
      .single()

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'That short code is already taken.' }, { status: 409 })
      }
      console.error('Shrtigo link creation failed:', error)
      return NextResponse.json({ error: 'Unable to create the short link right now.' }, { status: 500 })
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin
    return NextResponse.json({
      ...data,
      shortUrl: `${appUrl.replace(/\/$/, '')}/${data.slug}`,
    }, { status: 201 })
  } catch (error) {
    console.error('Shrtigo shorten error:', error)
    const message = error instanceof Error && error.message.includes('not configured')
      ? 'Shrtigo Pro is not connected to Supabase yet.'
      : 'Unable to create the short link right now.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
