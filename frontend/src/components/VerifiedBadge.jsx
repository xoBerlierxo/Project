function VerifiedBadge({ compact = false }) {
  return (
    <span
      className={`inline-flex items-center gap-[5px] whitespace-nowrap rounded-full border border-gold-500 bg-gold-100 font-semibold text-gold-600 ${
        compact ? 'p-[2px_8px_2px_5px] text-[0.72rem]' : 'p-[3px_10px_3px_6px] text-[0.78rem]'
      }`}
    >
      <svg viewBox="0 0 20 20" aria-hidden="true" className="h-[15px] w-[15px] flex-shrink-0 text-gold-500">
        <path
          d="M10 1.5 12.3 4l3.4-.4.7 3.4 3 1.7-1.7 3 1.7 3-3 1.7-.7 3.4-3.4-.4L10 18.5 7.7 16l-3.4.4-.7-3.4-3-1.7 1.7-3-1.7-3 3-1.7.7-3.4L7.7 4 10 1.5Z"
          fill="currentColor"
        />
        <path
          d="M6.7 10.2 8.8 12.3 13.3 7.7"
          stroke="white"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
      Verified
    </span>
  )
}

export default VerifiedBadge
