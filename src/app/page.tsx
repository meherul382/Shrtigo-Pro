"use client"

import { useState } from 'react'
import { ArrowRight, BarChart3, Check, ChevronRight, Globe2, Link2, MousePointer2, ShieldCheck, Sparkles, Zap } from 'lucide-react'

const stats = [
  { label: 'Total clicks', value: '125,430', icon: MousePointer2 },
  { label: 'Unique visitors', value: '84,210', icon: Globe2 },
  { label: 'Active links', value: '37', icon: Link2 },
]

const links = [
  { short: 'shrtigo.pro/launch', target: 'Product launch campaign', clicks: '12,540', unique: '8,920', status: 'Active' },
  { short: 'shrtigo.pro/offer', target: 'September offer', clicks: '8,210', unique: '5,430', status: 'Active' },
  { short: 'shrtigo.pro/youtube', target: 'YouTube channel', clicks: '6,845', unique: '4,109', status: 'Active' },
]

export default function Home() {
  const [url, setUrl] = useState('')
  const [created, setCreated] = useState('')

  function shorten() {
    const clean = url.trim()
    if (!clean) return
    const slug = clean.replace(/^https?:\/\//, '').replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').slice(0, 12).toLowerCase() || 'my-link'
    setCreated(`shrtigo.pro/${slug}`)
  }

  return (
    <main className="page-shell">
      <header className="topbar">
        <a className="brand" href="#top"><span className="brand-mark"><Link2 size={19} /></span><span>Shrtigo <b>Pro</b></span></a>
        <nav className="nav-links"><a href="#features">Features</a><a href="#analytics">Analytics</a><a href="#pricing">Pricing</a></nav>
        <div className="nav-actions"><button className="ghost-btn">Sign in</button><button className="primary-btn small">Get started <ArrowRight size={16} /></button></div>
      </header>

      <section id="top" className="hero">
        <div className="hero-copy">
          <div className="eyebrow"><Sparkles size={15} /> Powerful links. Clearer growth.</div>
          <h1>Short links.<br /><span>Smarter analytics.</span></h1>
          <p>Turn any URL into a clean, memorable link and see exactly how your audience engages — in real time.</p>
          <div className="shortener-card">
            <div className="url-input-wrap"><Link2 size={19} /><input value={url} onChange={(e) => setUrl(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && shorten()} placeholder="Paste your long URL here..." /></div>
            <button className="primary-btn" onClick={shorten}>Shorten URL <ArrowRight size={17} /></button>
            {created && <div className="created-link"><Check size={17} /> <span>Your short link:</span> <strong>{created}</strong></div>}
          </div>
          <div className="trust-row"><ShieldCheck size={16} /> Secure by default <span>•</span> Fast worldwide redirects <span>•</span> No credit card required</div>
        </div>
        <div className="hero-visual">
          <div className="dashboard-preview">
            <div className="preview-top"><div><span className="dot active" /><span className="dot" /><span className="dot" /></div><span>shrtigo.pro / overview</span></div>
            <div className="preview-content"><div className="preview-title"><div><small>Overview</small><h3>Your link performance</h3></div><button>Last 30 days <ChevronRight size={14} /></button></div>
              <div className="mini-stats">{stats.map(({ label, value, icon: Icon }) => <div className="mini-stat" key={label}><div className="mini-icon"><Icon size={16} /></div><span>{label}</span><strong>{value}</strong></div>)}</div>
              <div className="chart-card"><div className="chart-head"><div><small>Clicks</small><strong>18,429 <em>+24.8%</em></strong></div><div className="legend"><span /><span />30 days</div></div><div className="fake-chart"><div className="gridline g1"/><div className="gridline g2"/><div className="gridline g3"/><svg viewBox="0 0 520 150" preserveAspectRatio="none" aria-hidden="true"><path d="M0,126 C30,116 36,128 61,116 S103,91 125,98 S158,86 183,91 S220,69 244,77 S279,53 304,68 S341,41 364,49 S402,27 425,39 S467,15 520,24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/></svg></div></div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="section"><div className="section-intro"><div className="eyebrow">Built for creators and teams</div><h2>Everything you need to <span>grow smarter</span></h2><p>One simple workspace for short links, audience intelligence, and conversion-focused insights.</p></div>
        <div className="feature-grid"><Feature icon={Zap} title="Lightning-fast redirects" text="Give every visitor a fast, reliable path to the destination that matters."/><Feature icon={BarChart3} title="Real-time analytics" text="See clicks, unique visitors, devices, browsers, countries, and trends."/><Feature icon={Globe2} title="Audience intelligence" text="Understand where your traffic comes from and what your audience uses."/><Feature icon={ShieldCheck} title="Built-in control" text="Set custom slugs, expiration dates, passwords, and link-level controls."/></div>
      </section>

      <section id="analytics" className="section analytics-section"><div className="analytics-copy"><div className="eyebrow">Analytics that make sense</div><h2>Know <span>who clicked.</span><br />Know what worked.</h2><p>Stop guessing which campaigns drive results. Shrtigo Pro makes every click useful.</p><div className="benefits"><div><Check size={17}/> Clicks over time</div><div><Check size={17}/> Country & device breakdowns</div><div><Check size={17}/> Top-performing links</div><div><Check size={17}/> Exportable reports</div></div></div><div className="country-card"><div className="country-head"><div><small>Top countries</small><h3>Visitors by location</h3></div><Globe2 size={20}/></div><div className="country-row"><span>🇧🇩 Bangladesh</span><div className="bar"><i style={{width:'82%'}}/></div><b>42%</b></div><div className="country-row"><span>🇮🇳 India</span><div className="bar"><i style={{width:'55%'}}/></div><b>28%</b></div><div className="country-row"><span>🇺🇸 United States</span><div className="bar"><i style={{width:'31%'}}/></div><b>16%</b></div><div className="country-row"><span>🇬🇧 United Kingdom</span><div className="bar"><i style={{width:'16%'}}/></div><b>8%</b></div><div className="country-row"><span>🌎 Other</span><div className="bar"><i style={{width:'12%'}}/></div><b>6%</b></div></div></section>

      <section className="section links-section"><div className="section-intro left"><div className="eyebrow">Your links, one workspace</div><h2>Manage every link <span>in one place</span></h2></div><div className="table-wrap"><div className="table-row table-head"><span>Short link</span><span>Campaign</span><span>Clicks</span><span>Unique</span><span>Status</span></div>{links.map((item) => <div className="table-row" key={item.short}><span className="short-link"><Link2 size={15}/>{item.short}</span><span>{item.target}</span><span>{item.clicks}</span><span>{item.unique}</span><span className="status"><i/> {item.status}</span></div>)}</div></section>

      <section id="pricing" className="cta"><div className="cta-inner"><div><div className="eyebrow">Ready when you are</div><h2>Turn your next link into a <span>growth signal.</span></h2><p>Start shortening for free. Upgrade when you need deeper analytics and more control.</p></div><button className="primary-btn">Create your first link <ArrowRight size={17}/></button></div></section>

      <footer><div className="brand"><span className="brand-mark"><Link2 size={19}/></span><span>Shrtigo <b>Pro</b></span></div><span>© 2026 Shrtigo Pro. All rights reserved.</span></footer>
    </main>
  )
}

function Feature({ icon: Icon, title, text }: { icon: typeof Zap; title: string; text: string }) {
  return <div className="feature-card"><div className="feature-icon"><Icon size={20}/></div><h3>{title}</h3><p>{text}</p><ArrowRight className="feature-arrow" size={17}/></div>
}
