"use client"

import { useState } from "react"
import { ArrowRight, BarChart3, Check, Globe2, Link2, ShieldCheck, Sparkles, Zap } from "lucide-react"

export default function Home() {
  const [url, setUrl] = useState("")
  const [slug, setSlug] = useState("")
  const [created, setCreated] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function shorten() {
    setError("")
    setCreated(null)
    if (!url.trim()) return setError("Paste a URL first.")
    setLoading(true)
    try {
      const response = await fetch("/api/shorten", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, slug: slug || undefined }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Could not create link.")
      setCreated(data.shortUrl)
      setUrl("")
      setSlug("")
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not create link.")
    } finally { setLoading(false) }
  }

  return <main className="page-shell">
    <header className="topbar">
      <a className="brand" href="#top"><span className="brand-mark"><Link2 size={19}/></span><span>Shrtigo <b>Pro</b></span></a>
      <nav className="nav-links"><a href="#features">Features</a><a href="#analytics">Analytics</a><a href="#pricing">Pricing</a></nav>
      <div className="nav-actions"><a className="ghost-btn" href="/login">Sign in</a><a className="primary-btn small" href="#top">Get started <ArrowRight size={16}/></a></div>
    </header>

    <section id="top" className="hero">
      <div className="hero-copy">
        <div className="eyebrow"><Sparkles size={15}/> Original link intelligence platform</div>
        <h1>Short links.<br/><span>Real analytics.</span></h1>
        <p>Create a real short link, redirect visitors to the original destination, and collect useful click intelligence from every visit.</p>
        <div className="shortener-card">
          <div className="url-input-wrap"><Link2 size={19}/><input value={url} onChange={e=>setUrl(e.target.value)} onKeyDown={e=>e.key==='Enter'&&shorten()} placeholder="https://your-long-url.com/..." aria-label="Destination URL"/></div>
          <div className="url-input-wrap"><span className="slug-prefix">shrtigo/</span><input value={slug} onChange={e=>setSlug(e.target.value)} placeholder="custom-slug (optional)" aria-label="Custom slug"/></div>
          <button className="primary-btn" onClick={shorten} disabled={loading}>{loading ? "Creating..." : "Create short link"} <ArrowRight size={17}/></button>
          {created && <div className="created-link"><Check size={17}/><span>Your live link:</span><a href={created}>{created}</a></div>}
          {error && <div className="form-error">{error}</div>}
        </div>
        <div className="trust-row"><ShieldCheck size={16}/> No fake statistics <span>•</span> Real database tracking <span>•</span> Secure server-side redirect</div>
      </div>
      <div className="hero-visual"><div className="dashboard-preview"><div className="preview-top"><span>shrtigo.pro / analytics</span><span className="live-pill">● LIVE</span></div><div className="preview-content"><div className="preview-title"><div><small>Analytics</small><h3>Your actual link data</h3></div></div><div className="mini-stats"><Mini label="Clicks" value="—" icon={BarChart3}/><Mini label="Unique visitors" value="—" icon={Globe2}/><Mini label="Active links" value="—" icon={Link2}/></div><div className="chart-card empty-chart"><BarChart3 size={28}/><strong>Your analytics appear here</strong><span>Create and share a link to start collecting data.</span></div></div></div></div>
    </section>

    <section id="features" className="section"><div className="section-intro"><div className="eyebrow">Built from the ground up</div><h2>Everything is <span>real.</span></h2><p>No hard-coded visitor numbers or pretend analytics. Shrtigo Pro is designed around your own link data.</p></div><div className="feature-grid"><Feature icon={Zap} title="Real redirects" text="Every generated slug resolves through the Shrtigo Pro redirect endpoint to its saved destination."/><Feature icon={BarChart3} title="Real click events" text="Each visit is recorded with timestamp, device, browser, OS, referrer and privacy-safe IP hash."/><Feature icon={Globe2} title="Audience insights" text="Build useful country, device and traffic-source reports from actual visitors."/><Feature icon={ShieldCheck} title="Link controls" text="Custom slugs, expiration, activation and account ownership are part of the architecture."/></div></section>

    <section id="analytics" className="section analytics-section"><div className="analytics-copy"><div className="eyebrow">Analytics without guesswork</div><h2>One click can become a <span>signal.</span></h2><p>Once traffic reaches your links, the platform can turn those visits into actionable reports—without inventing numbers.</p><div className="benefits"><div><Check size={17}/> Clicks over time</div><div><Check size={17}/> Device, browser & OS</div><div><Check size={17}/> Referrer tracking</div><div><Check size={17}/> Privacy-safe IP hashing</div></div></div><div className="country-card"><div className="country-head"><div><small>Data status</small><h3>Waiting for real traffic</h3></div><Globe2 size={20}/></div><div className="data-state"><span>●</span><div><strong>No fabricated data</strong><p>Your country breakdown will populate after real visitors click your links.</p></div></div></div></section>

    <section id="pricing" className="cta"><div className="cta-inner"><div><div className="eyebrow">Shrtigo Pro</div><h2>Build your link system on <span>real data.</span></h2><p>Next: authentication, personal dashboards, link management, detailed analytics and Pro billing.</p></div><a className="primary-btn" href="#top">Create a real link <ArrowRight size={17}/></a></div></section>
    <footer><div className="brand"><span className="brand-mark"><Link2 size={19}/></span><span>Shrtigo <b>Pro</b></span></div><span>© 2026 Shrtigo Pro. All rights reserved.</span></footer>
  </main>
}

function Mini({label,value,icon:Icon}:{label:string,value:string,icon:typeof BarChart3}){return <div className="mini-stat"><div className="mini-icon"><Icon size={16}/></div><span>{label}</span><strong>{value}</strong></div>}
function Feature({icon:Icon,title,text}:{icon:typeof Zap,title:string,text:string}){return <div className="feature-card"><div className="feature-icon"><Icon size={20}/></div><h3>{title}</h3><p>{text}</p><ArrowRight className="feature-arrow" size={17}/></div>}
