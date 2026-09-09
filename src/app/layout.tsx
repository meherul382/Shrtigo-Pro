import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Shrtigo Pro — Link Shortening & Analytics',
  description: 'Shorten links, understand your audience, and grow with powerful link analytics.',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
