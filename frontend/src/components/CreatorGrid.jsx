import CreatorCard from './CreatorCard'
import { btn } from './buttonClasses'

function CreatorGrid({ creators, onViewProfile, onResetFilters }) {
  if (creators.length === 0) {
    return (
      <div className="mx-auto mt-12 mb-20 max-w-[460px] rounded-2xl border border-dashed border-border bg-white px-7 py-9 text-center">
        <h3 className="text-[1.05rem]">No verified creators match these filters</h3>
        <p className="mt-2 text-[0.9rem] leading-relaxed text-ink-600">
          Try a different service type or clear your search to see everyone available.
        </p>
        <button type="button" className={`${btn('outline')} mt-[18px]`} onClick={onResetFilters}>
          Reset filters
        </button>
      </div>
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
