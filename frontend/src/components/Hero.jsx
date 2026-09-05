function Hero({ searchTerm, onSearchChange, creatorCount }) {
  return (
    <section className="bg-gradient-to-b from-navy-900 to-navy-800 px-6 pt-14 pb-16">
      <div className="mx-auto max-w-[720px] text-left">
        <h1 className="max-w-[15ch] text-[clamp(1.7rem,3.4vw,2.5rem)] leading-tight !text-white">
          Get real career help from people who've done it.
        </h1>
        <p className="mt-4 max-w-[58ch] text-[1.02rem] leading-relaxed text-navy-100">
          Book verified professionals for consultations, resume reviews, mock interviews,
          mentorship, and referral support — every session priced and scheduled by the creator
          themselves.
        </p>

        <div className="mt-7 flex max-w-[480px] items-center gap-2.5 rounded-2xl bg-white px-4 shadow-[0_1px_2px_rgba(15,32,56,0.06),0_8px_24px_-12px_rgba(15,32,56,0.18)]">
          <svg viewBox="0 0 20 20" aria-hidden="true" className="h-[18px] w-[18px] flex-shrink-0 text-ink-400">
            <circle cx="9" cy="9" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
            <line x1="14" y1="14" x2="18" y2="18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            className="w-full border-none bg-transparent py-3 text-[0.95rem] text-ink-900 outline-none placeholder:text-ink-400"
            placeholder="Search by name, company, role, or service"
            value={searchTerm}
            onChange={(event) => onSearchChange(event.target.value)}
            aria-label="Search creators"
          />
        </div>

        <p className="mt-[18px] text-[0.88rem] font-medium text-gold-500">
          {creatorCount} verified {creatorCount === 1 ? 'creator' : 'creators'} accepting requests
          right now
        </p>
      </div>
    </section>
  )
}

export default Hero
