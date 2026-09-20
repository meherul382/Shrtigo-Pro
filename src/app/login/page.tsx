"use client"

import { FormEvent, useState } from "react"
import { useRouter } from "next/navigation"
import { getSupabaseBrowser } from "@/lib/supabase-browser"

export default function LoginPage() {
  const router = useRouter()
  const [mode, setMode] = useState<"login" | "signup">("login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError("")
    setMessage("")
    setLoading(true)

    try {
      const supabase = getSupabaseBrowser()
      const result = mode === "login"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password })

      if (result.error) throw result.error

      if (mode === "signup") {
        setMessage("Account created. Check your email if confirmation is enabled, then sign in.")
      } else {
        router.push("/dashboard")
        router.refresh()
      }
    } catch (value) {
      setError(value instanceof Error ? value.message : "Authentication failed.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="page-shell" style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24 }}>
      <section className="shortener-card" style={{ width: "100%", maxWidth: 460 }}>
        <a className="brand" href="/">Shrtigo <b>Pro</b></a>
        <h1>{mode === "login" ? "Welcome back" : "Create your account"}</h1>
        <p>{mode === "login" ? "Sign in to manage your links and analytics." : "Start with one free link for two hours."}</p>
        <form onSubmit={submit} style={{ display: "grid", gap: 14 }}>
          <label>Email<input required type="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="you@example.com" /></label>
          <label>Password<input required minLength={6} type="password" value={password} onChange={event => setPassword(event.target.value)} placeholder="Minimum 6 characters" /></label>
          <button className="primary-btn" disabled={loading}>{loading ? "Please wait..." : mode === "login" ? "Sign in" : "Create account"}</button>
        </form>
        {message && <p role="status">{message}</p>}
        {error && <p role="alert" className="form-error">{error}</p>}
        <button className="ghost-btn" onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(""); setMessage("") }}>
          {mode === "login" ? "Need an account? Sign up" : "Already have an account? Sign in"}
        </button>
      </section>
    </main>
  )
}
