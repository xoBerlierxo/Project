import { SERVICE_CATEGORIES } from '../data/creators'

function FilterBar({ activeCategory, onCategoryChange }) {
  const options = [{ id: 'all', label: 'All services' }, ...SERVICE_CATEGORIES]

  return (
    <div
      role="group"
      aria-label="Filter by service type"
      className="mx-auto flex max-w-6xl flex-wrap gap-2.5 px-6 pt-5 pb-1"
    >
      {options.map((option) => {
        const isActive = activeCategory === option.id
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onCategoryChange(option.id)}
            aria-pressed={isActive}
            className={`rounded-full border px-4 py-2 text-[0.85rem] font-medium transition-colors ${
              isActive
                ? 'border-navy-800 bg-navy-800 text-white'
                : 'border-border bg-white text-ink-600 hover:border-navy-700 hover:text-navy-800'
            }`}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}

export default FilterBar
