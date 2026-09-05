import VerifiedBadge from './VerifiedBadge'
import { btn } from './buttonClasses'
import { getCategoryMeta, withAlpha } from '../data/categoryMeta'

function CreatorCard({ creator, onViewProfile }) {
  const startingPrice = Math.min(...creator.services.map((service) => service.price))
  const categoryIds = [...new Set(creator.services.map((service) => service.category))]

  return (
    <article className="flex flex-col gap-3.5 rounded-2xl border border-border bg-white p-5 shadow-[0_1px_2px_rgba(15,32,56,0.06),0_8px_24px_-12px_rgba(15,32,56,0.18)]">
      <div className="flex items-start gap-3">
        <div
          aria-hidden="true"
          className="flex h-[46px] w-[46px] flex-shrink-0 items-center justify-center rounded-full bg-navy-100 font-display text-[0.9rem] font-semibold text-navy-800"
        >
          {creator.photoInitials}
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base">{creator.name}</h3>
            <VerifiedBadge compact />
          </div>
          <p className="mt-[3px] truncate text-[0.85rem] text-ink-600">
            {creator.isWorking ? `${creator.jobTitle} · ${creator.company}` : 'Not currently working'}
          </p>
        </div>
      </div>

      <p className="text-[0.9rem] leading-relaxed text-ink-600">{creator.description}</p>

      <ul className="flex flex-wrap gap-1.5">
        {categoryIds.map((categoryId) => {
          const meta = getCategoryMeta(categoryId)
          return (
            <li
              key={categoryId}
              className="rounded-full border px-2.5 py-[3px] text-[0.72rem] font-semibold"
              style={{
                color: meta.color,
                backgroundColor: withAlpha(meta.color, 0.08),
                borderColor: withAlpha(meta.color, 0.35),
              }}
            >
              {meta.label}
            </li>
          )
        })}
      </ul>

      <div className="mt-auto flex items-center justify-between border-t border-dashed border-border pt-1.5">
        <span className="font-display text-[0.95rem] font-semibold text-navy-900">
          From ₹{startingPrice}
        </span>
        <button type="button" className={btn('outline')} onClick={() => onViewProfile(creator.id)}>
          View profile
        </button>
      </div>
    </article>
  )
}

export default CreatorCard
