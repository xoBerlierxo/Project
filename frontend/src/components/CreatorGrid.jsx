import CreatorCard from './CreatorCard'
import { btn } from './buttonClasses'

function StateCard({ title, description, actionLabel, onAction }) {
  return (
    <div className="mx-auto mt-12 mb-20 max-w-[460px] rounded-2xl border border-dashed border-border bg-white px-7 py-9 text-center">
      <h3 className="text-[1.05rem]">{title}</h3>
      <p className="mt-2 text-[0.9rem] leading-relaxed text-ink-600">{description}</p>
      {actionLabel && (
        <button type="button" className={`${btn('outline')} mt-[18px]`} onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  )
}

function CreatorGrid({ creators, status, error, onViewProfile, onResetFilters }) {
  if (status === 'loading') {
    return <StateCard title="Loading creators…" description="Fetching the latest verified creators from Career Connect." />
  }

  if (status === 'error') {
    return (
      <StateCard
        title="Couldn't load creators"
        description={error?.message ?? 'The Career Connect backend may not be running.'}
      />
    )
  }

  if (creators.length === 0) {
    return (
      <StateCard
        title="No verified creators match these filters"
        description="Try a different service type or clear your search to see everyone available."
        actionLabel="Reset filters"
        onAction={onResetFilters}
      />
    )
  }

  return (
    <div className="mx-auto grid max-w-6xl grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-[18px] px-6 pt-4 pb-16">
      {creators.map((creator) => (
        <CreatorCard key={creator.id} creator={creator} onViewProfile={onViewProfile} />
      ))}
    </div>
  )
}

export default CreatorGrid
