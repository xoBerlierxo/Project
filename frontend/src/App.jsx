import { useMemo, useState } from 'react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import FilterBar from './components/FilterBar'
import CreatorGrid from './components/CreatorGrid'
import CreatorProfileModal from './components/CreatorProfileModal'
import BecomeCreatorModal from './components/BecomeCreatorModal'
import Footer from './components/Footer'
import Toast from './components/Toast'
import { creators as allCreators } from './data/creators'

function App() {
  const [searchTerm, setSearchTerm] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')
  const [selectedCreatorId, setSelectedCreatorId] = useState(null)
  const [isBecomeCreatorOpen, setBecomeCreatorOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  // Public marketplace only ever reads APPROVED creators — mirrors the
  // "public query must return only Approved/Live" rule from the PRD.
  const approvedCreators = useMemo(
    () => allCreators.filter((creator) => creator.status === 'APPROVED'),
    [],
  )

  const filteredCreators = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()

    return approvedCreators.filter((creator) => {
      const matchesCategory =
        activeCategory === 'all' || creator.services.some((service) => service.category === activeCategory)

      if (!matchesCategory) return false
      if (!term) return true

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
  }, [approvedCreators, activeCategory, searchTerm])

  const selectedCreator = approvedCreators.find((creator) => creator.id === selectedCreatorId)

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
        <Hero searchTerm={searchTerm} onSearchChange={setSearchTerm} creatorCount={approvedCreators.length} />
        <FilterBar activeCategory={activeCategory} onCategoryChange={setActiveCategory} />
        <CreatorGrid
          creators={filteredCreators}
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
