import { useState } from 'react'
import Layout from './components/Layout'
import MissionControl from './pages/MissionControl'
import SessionsPage from './pages/SessionsPage'
import { useLiveEvents } from './hooks/useApi'

export default function App() {
  const [activeTab, setActiveTab] = useState('home')
  const { events, connected } = useLiveEvents()

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab} connected={connected}>
      {activeTab === 'home' && <MissionControl events={events} connected={connected} />}
      {activeTab === 'sessions' && <SessionsPage />}
    </Layout>
  )
}
