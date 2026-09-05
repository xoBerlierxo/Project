import { getCategoryMeta } from '../data/categoryMeta'
import { btn } from './buttonClasses'

function ServiceCard({ service, onRequest }) {
  const meta = getCategoryMeta(service.category)

  return (
    <div className="flex overflow-hidden rounded-2xl border border-border bg-white max-[460px]:flex-col">
      <div
        className="flex flex-shrink-0 basis-24 flex-col items-center justify-center gap-2 border-r-2 border-dashed border-white/45 px-2.5 py-4 text-center text-white max-[460px]:flex-row max-[460px]:basis-auto max-[460px]:justify-between max-[460px]:border-r-0 max-[460px]:border-b-2 max-[460px]:px-4 max-[460px]:py-2.5"
        style={{ backgroundColor: meta.color }}
      >
        <span className="text-[0.7rem] font-semibold leading-tight">{meta.label}</span>
        <span className="font-display text-[1.05rem] font-bold">₹{service.price}</span>
      </div>
      <div className="min-w-0 flex-1 px-[18px] py-4">
        <h4 className="text-[0.98rem]">{service.name}</h4>
        <p className="mt-1.5 text-[0.86rem] leading-relaxed text-ink-600">{service.description}</p>
        <dl className="mt-3 flex flex-col gap-1">
          <div className="flex gap-1.5 text-[0.82rem]">
            <dt className="flex-shrink-0 font-medium text-ink-400">Duration</dt>
            <dd className="text-ink-900">
              {service.durationMinutes ? `${service.durationMinutes} min` : 'Async — no call'}
            </dd>
          </div>
          <div className="flex gap-1.5 text-[0.82rem]">
            <dt className="flex-shrink-0 font-medium text-ink-400">
              {service.meetingRequired ? 'Availability' : 'Delivery'}
            </dt>
            <dd className="text-ink-900">
              {service.meetingRequired ? service.availability : service.deliveryTime}
            </dd>
          </div>
        </dl>
        <button
          type="button"
          className={`${btn('navy', 'small')} mt-3.5`}
          onClick={() => onRequest(service.name)}
        >
          Request this service
        </button>
      </div>
    </div>
  )
}

export default ServiceCard
