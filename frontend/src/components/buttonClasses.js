const BASE =
  'inline-flex items-center justify-center rounded-lg border font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed'

const SIZE = {
  default: 'px-5 py-2.5 text-sm',
  small: 'px-3.5 py-[7px] text-[13px]',
}

const VARIANT = {
  gold: 'border-transparent bg-gold-500 text-navy-900 enabled:hover:bg-gold-600',
  navy: 'border-transparent bg-navy-800 text-white enabled:hover:bg-navy-900',
  outline:
    'border-border bg-transparent text-ink-600 enabled:hover:border-navy-700 enabled:hover:text-navy-800',
}

export function btn(variant = 'navy', size = 'default') {
  return [BASE, SIZE[size], VARIANT[variant]].join(' ')
}
