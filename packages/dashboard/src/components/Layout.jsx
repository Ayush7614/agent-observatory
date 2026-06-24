const tabs = [
  { id: 'home', label: 'Mission Control' },
  { id: 'sessions', label: 'Sessions' },
  { id: 'settings', label: 'Settings', disabled: true },
]

export default function Layout({ children, activeTab, onTabChange, connected }) {
  return (
    <div className="min-h-screen bg-surface">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-accent-pink/5 rounded-full blur-3xl" />
      </div>

      <header className="relative border-b border-white/[0.06] bg-surface/80 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent via-accent-purple to-accent-pink flex items-center justify-center text-sm font-bold">
              AO
            </div>
            <div>
              <h1 className="text-lg font-bold gradient-text leading-tight">Agent Observatory</h1>
              <p className="text-xs text-zinc-500 hidden sm:block">Universal coding agent dashboard</p>
            </div>
          </div>

          <nav className="flex items-center gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                disabled={tab.disabled}
                onClick={() => !tab.disabled && onTabChange(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'bg-white/10 text-zinc-100'
                    : tab.disabled
                      ? 'text-zinc-600 cursor-not-allowed'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
                }`}
              >
                {tab.label}
                {tab.disabled && (
                  <span className="ml-1.5 text-[10px] text-zinc-600 uppercase">soon</span>
                )}
              </button>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-2 text-xs text-zinc-500">
            <span className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-400' : 'bg-zinc-600'}`} />
            {connected ? 'Connected' : 'Offline'}
          </div>
        </div>
      </header>

      <main className="relative max-w-7xl mx-auto px-6 py-8">{children}</main>
    </div>
  )
}
