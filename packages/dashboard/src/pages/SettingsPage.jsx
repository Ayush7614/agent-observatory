import { useCallback, useEffect, useState } from 'react'
import { motion } from 'framer-motion'

function Section({ title, description, children }) {
  return (
    <section className="glass-card p-6 space-y-4">
      <div>
        <h2 className="text-sm font-medium text-zinc-300 uppercase tracking-wider">{title}</h2>
        {description && <p className="text-xs text-zinc-500 mt-1">{description}</p>}
      </div>
      {children}
    </section>
  )
}

function Field({ label, hint, children }) {
  return (
    <div className="grid gap-1.5 sm:grid-cols-3 sm:items-center">
      <div className="sm:col-span-1">
        <label className="text-sm text-zinc-300">{label}</label>
        {hint && <p className="text-xs text-zinc-600 mt-0.5">{hint}</p>}
      </div>
      <div className="sm:col-span-2">{children}</div>
    </div>
  )
}

function Toggle({ checked, onChange, label }) {
  return (
    <label className="inline-flex items-center gap-3 cursor-pointer">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative w-10 h-6 rounded-full transition-colors ${
          checked ? 'bg-accent' : 'bg-zinc-700'
        }`}
      >
        <span
          className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
            checked ? 'translate-x-4' : ''
          }`}
        />
      </button>
      <span className="text-sm text-zinc-400">{label}</span>
    </label>
  )
}

const inputClass =
  'w-full max-w-xs rounded-xl bg-white/[0.04] border border-white/[0.08] px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-accent/40'

export default function SettingsPage() {
  const [form, setForm] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/settings')
      if (!res.ok) throw new Error(`${res.status}`)
      setForm(await res.json())
    } catch {
      setError('Could not load settings. Is the server running on localhost?')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  function update(path, value) {
    setForm((prev) => {
      if (!prev) return prev
      const next = structuredClone(prev)
      const keys = path.split('.')
      let obj = next
      for (let i = 0; i < keys.length - 1; i++) {
        obj = obj[keys[i]]
      }
      obj[keys[keys.length - 1]] = value
      return next
    })
  }

  async function handleSave(e) {
    e.preventDefault()
    if (!form) return
    setSaving(true)
    setMessage(null)
    setError(null)

    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Save failed')

      setForm(data.settings)
      setMessage(
        data.requiresRestart
          ? 'Saved. Restart the server for port changes to take effect.'
          : 'Settings saved.'
      )
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="glass-card h-32 animate-pulse" />
        ))}
      </div>
    )
  }

  if (error && !form) {
    return (
      <div className="glass-card p-8 text-center">
        <p className="text-rose-400 text-sm">{error}</p>
        <button type="button" onClick={load} className="mt-4 text-sm text-accent hover:underline">
          Retry
        </button>
      </div>
    )
  }

  if (!form) return null

  const cc = form.agents['claude-code']

  return (
    <motion.form
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSave}
      className="space-y-6 max-w-3xl"
    >
      <div>
        <h2 className="text-xl font-semibold text-zinc-100">Settings</h2>
        <p className="text-sm text-zinc-500 mt-1">
          Local configuration stored at{' '}
          <code className="text-zinc-400 text-xs">{form.configPath || '~/.agent-observatory/config.json'}</code>
        </p>
      </div>

      <Section title="Server" description="Core Observatory server options.">
        <Field label="Port" hint="Requires server restart">
          <input
            type="number"
            className={inputClass}
            value={form.port}
            min={1024}
            max={65535}
            onChange={(e) => update('port', Number(e.target.value))}
          />
        </Field>
        <Field label="Data directory" hint="Read-only">
          <code className="text-xs text-zinc-400">{form.dataDir}</code>
        </Field>
        <Field label="Theme" hint="UI theme (dark fully supported)">
          <select
            className={inputClass}
            value={form.theme}
            onChange={(e) => update('theme', e.target.value)}
          >
            <option value="dark" className="bg-zinc-900">
              Dark
            </option>
            <option value="light" className="bg-zinc-900">
              Light (soon)
            </option>
            <option value="oled" className="bg-zinc-900">
              OLED (soon)
            </option>
          </select>
        </Field>
      </Section>

      <Section title="Budgets" description="API-equivalent cost alerts (USD). Set 0 to disable.">
        <Field label="Per session">
          <input
            type="number"
            className={inputClass}
            value={form.budgets.session}
            min={0}
            step={1}
            onChange={(e) => update('budgets.session', Number(e.target.value))}
          />
        </Field>
        <Field label="Daily">
          <input
            type="number"
            className={inputClass}
            value={form.budgets.day}
            min={0}
            step={1}
            onChange={(e) => update('budgets.day', Number(e.target.value))}
          />
        </Field>
        <Field label="Weekly">
          <input
            type="number"
            className={inputClass}
            value={form.budgets.week}
            min={0}
            step={1}
            onChange={(e) => update('budgets.week', Number(e.target.value))}
          />
        </Field>
      </Section>

      <Section title="Agents" description="Enable adapters and tuning per agent.">
        <Field label="Claude Code">
          <Toggle
            checked={cc.enabled}
            onChange={(v) => update('agents.claude-code.enabled', v)}
            label={cc.enabled ? 'Enabled' : 'Disabled'}
          />
        </Field>
        <Field label="Snapshot interval" hint="Minutes between auto-snapshots (0 = off)">
          <input
            type="number"
            className={inputClass}
            value={cc.snapshotMinutes}
            min={0}
            max={1440}
            onChange={(e) => update('agents.claude-code.snapshotMinutes', Number(e.target.value))}
          />
        </Field>
        <Field label="Watch directory" hint="Claude Code JSONL location">
          <code className="text-xs text-zinc-400 break-all">{cc.watchDir}</code>
        </Field>
      </Section>

      <Section title="Notifications" description="Local alerts from Observatory.">
        <div className="space-y-3">
          <Toggle
            checked={form.notifications.desktop}
            onChange={(v) => update('notifications.desktop', v)}
            label="Desktop notifications"
          />
          <Toggle
            checked={form.notifications.onAgentWaiting}
            onChange={(v) => update('notifications.onAgentWaiting', v)}
            label="When agent needs attention"
          />
          <Toggle
            checked={form.notifications.onBudgetWarning}
            onChange={(v) => update('notifications.onBudgetWarning', v)}
            label="Budget warning (80%)"
          />
          <Toggle
            checked={form.notifications.onBudgetExceeded}
            onChange={(v) => update('notifications.onBudgetExceeded', v)}
            label="Budget exceeded"
          />
          <Toggle
            checked={form.notifications.onSessionComplete}
            onChange={(v) => update('notifications.onSessionComplete', v)}
            label="Session complete"
          />
        </div>
      </Section>

      <Section title="Search" description="Session full-text search limits.">
        <Field label="Max results">
          <input
            type="number"
            className={inputClass}
            value={form.search.maxResults}
            min={1}
            max={500}
            onChange={(e) => update('search.maxResults', Number(e.target.value))}
          />
        </Field>
      </Section>

      <div className="flex items-center gap-4 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="px-5 py-2.5 rounded-xl text-sm font-medium bg-accent text-white hover:bg-accent/90 disabled:opacity-50 transition-colors"
        >
          {saving ? 'Saving…' : 'Save settings'}
        </button>
        {message && <span className="text-sm text-emerald-400">{message}</span>}
        {error && form && <span className="text-sm text-rose-400">{error}</span>}
      </div>

      <p className="text-xs text-zinc-600 pb-8">
        Tip: run <code className="text-zinc-500">ao doctor</code> to verify hooks and server setup.
      </p>
    </motion.form>
  )
}
