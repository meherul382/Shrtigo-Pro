import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

const RESERVED = new Set(['api', 'login', 'signup', 'dashboard', 'pricing', 'about', 'admin'])

function validUrl(value: string) {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch { return false }
}

function makeSlug(custom?: string) {
  if (custom) return custom.trim().toLowerCase()
  return crypto.randomUUID().replaceAll('-', '').slice(0, 7)
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const targetUrl = String(body.url ?? '').trim()
    const customSlug = body.slug ? String(body.slug) : undefined

    if (!validUrl(targetUrl)) return NextResponse.json({ error: 'Please enter a valid http/https URL.' }, { status: 400 })
    if (targetUrl.length > 4096) return NextResponse.json({ error: 'URL is too long.' }, { status: 400 })
    if (customSlug && !/^[a-z0-9_-]{3,32}$/i.test(customSlug)) return NextResponse.json({ error: 'Custom slug must be 3–32 letters, numbers, hyphens or underscores.' }, { status: 400 })

    const slug = makeSlug(customSlug)
    if (RESERVED.has(slug)) return NextResponse.json({ error: 'That slug is reserved.' }, { status: 409 })

    const { data, error } = await supabaseAdmin.from('links').insert({ slug, target_url: targetUrl }).select('slug, target_url, created_at').single()
    if (error) {
      if (error.code === '23505') return NextResponse.json({ error: 'That short code is already taken.' }, { status: 409 })
      throw error
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin
    return NextResponse.json({ ...data, shortUrl: `${appUrl}/${data.slug}` }, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Unable to create the short link right now.' }, { status: 500 })
  }
}
