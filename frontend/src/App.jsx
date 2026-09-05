import { useEffect, useMemo, useState } from 'react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import FilterBar from './components/FilterBar'
import CreatorGrid from './components/CreatorGrid'
import CreatorProfileModal from './components/CreatorProfileModal'
import BecomeCreatorModal from './components/BecomeCreatorModal'
import Footer from './components/Footer'
import Toast from './components/Toast'
import { useCreators } from './hooks/useCreators'
import { fetchCreatorProfile } from './api/creators'

function App() {
  const [searchTerm, setSearchTerm] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')
  const [selectedCreatorId, setSelectedCreatorId] = useState(null)
  const [selectedCreator, setSelectedCreator] = useState(null)
  const [isBecomeCreatorOpen, setBecomeCreatorOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  // The backend's GET /api/career-connect/creators already only ever
  // returns status = APPROVED creators — no client-side filtering needed
  // to enforce that rule, unlike the old mock-data build.
  const { creators, status, error } = useCreators(activeCategory)

  const filteredCreators = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    if (!term) return creators

    return creators.filter((creator) => {
      const haystack = [
        creator.name,
        creator.company,
        creator.jobTitle,
        ...creator.services.map((service) => service.name),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      return haystack.includes(term)
    })
  }, [creators, searchTerm])

  // The list endpoint returns creator cards; open a profile fetches the
  // full record (same shape, but this is the real endpoint the frontend
  // would hit either way, so we don't rely on the card already having it).
  useEffect(() => {
    if (!selectedCreatorId) {
      setSelectedCreator(null)
      return
    }

    let cancelled = false
    fetchCreatorProfile(selectedCreatorId)
      .then((creator) => {
        if (!cancelled) setSelectedCreator(creator)
      })
      .catch(() => {
        if (!cancelled) {
          showToast('Could not load that profile — it may no longer be public.')
          setSelectedCreatorId(null)
        }
      })

    return () => {
      cancelled = true
    }
  }, [selectedCreatorId])

  function showToast(message) {
    setToastMessage(message)
    window.clearTimeout(showToast._timer)
    showToast._timer = window.setTimeout(() => setToastMessage(''), 3200)
  }

  function handleResetFilters() {
    setSearchTerm('')
    setActiveCategory('all')
  }

  function handleRequestService(serviceName) {
    showToast(`Request started for "${serviceName}" — booking will open once payments go live.`)
  }

  function handleSubmitApplication() {
    showToast('Application received — an admin will verify it before it goes live.')
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar onBecomeCreatorClick={() => setBecomeCreatorOpen(true)} />

      <main className="flex-1">
        <Hero searchTerm={searchTerm} onSearchChange={setSearchTerm} creatorCount={creators.length} />
        <FilterBar activeCategory={activeCategory} onCategoryChange={setActiveCategory} />
        <CreatorGrid
          creators={filteredCreators}
          status={status}
          error={error}
          onViewProfile={setSelectedCreatorId}
          onResetFilters={handleResetFilters}
        />
      </main>

      <Footer />

      {selectedCreator && (
        <CreatorProfileModal
          creator={selectedCreator}
          onClose={() => setSelectedCreatorId(null)}
          onRequestService={handleRequestService}
        />
      )}

      {isBecomeCreatorOpen && (
        <BecomeCreatorModal
          onClose={() => setBecomeCreatorOpen(false)}
          onSubmitApplication={handleSubmitApplication}
        />
      )}

      <Toast message={toastMessage} />
    </div>
  )
}

export default App
