import Modal from './Modal'
import VerifiedBadge from './VerifiedBadge'
import ServiceCard from './ServiceCard'

function CreatorProfileModal({ creator, onClose, onRequestService }) {
  return (
    <Modal title={`${creator.name}'s profile`} onClose={onClose} wide>
      <div className="flex items-start gap-4">
        <div
          aria-hidden="true"
          className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-navy-100 font-display text-[1.15rem] font-semibold text-navy-800"
        >
          {creator.photoInitials}
        </div>
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h3 className="text-[1.2rem]">{creator.name}</h3>
            <VerifiedBadge />
          </div>
          <p className="mt-1 text-[0.92rem] text-ink-600">
            {creator.isWorking ? `${creator.jobTitle} at ${creator.company}` : 'Not currently working'}
          </p>
          <p className="mt-[3px] text-[0.85rem] text-ink-400">
            {creator.yearsExperience} years of experience ·{' '}
            <a href={creator.linkedinUrl} target="_blank" rel="noreferrer" className="text-navy-700">
              LinkedIn
            </a>
          </p>
        </div>
      </div>

      <p className="mt-5 border-t border-border pt-[18px] text-[0.95rem] leading-relaxed text-ink-900">
        {creator.description}
      </p>

      <h4 className="mt-6 text-[0.95rem] text-ink-600">Offerings</h4>
      <div className="mt-3 flex flex-col gap-3.5">
        {creator.services.map((service) => (
          <ServiceCard key={service.id} service={service} onRequest={onRequestService} />
        ))}
      </div>

      <p className="mt-5 text-[0.78rem] leading-relaxed text-ink-400">
        Referral offerings are submission attempts based on the creator's stated eligibility and
        each company's process — not a guarantee of an interview, offer, or job.
      </p>
    </Modal>
  )
}

export default CreatorProfileModal
