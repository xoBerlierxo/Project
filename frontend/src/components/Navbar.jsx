import { btn } from './buttonClasses'

function Navbar({ onBecomeCreatorClick }) {
  return (
    <header className="border-b border-navy-800 bg-navy-900">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
        <div className="flex items-center gap-2.5">
          <span
            aria-hidden="true"
            className="flex h-[34px] w-[34px] flex-shrink-0 items-center justify-center rounded-[9px] bg-gold-500 font-display text-[0.85rem] font-bold text-navy-900"
          >
            RW
          </span>
          <span className="font-display text-[1.05rem] font-semibold text-white">Career Connect</span>
        </div>
        <button type="button" className={btn('gold')} onClick={onBecomeCreatorClick}>
          <span className="max-[520px]:hidden">Become a Creator</span>
          <span className="hidden max-[520px]:inline">Apply</span>
        </button>
      </div>
    </header>
  )
}

export default Navbar
