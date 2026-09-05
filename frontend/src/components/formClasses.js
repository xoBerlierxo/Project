const CONTROL =
  'w-full rounded-lg border border-border bg-white px-2.5 py-2 text-[0.9rem] text-ink-900 placeholder:text-ink-400 focus-visible:outline-2 focus-visible:outline-navy-700'

export function fieldClass(kind) {
  if (kind === 'control') return CONTROL
  if (kind === 'full') return 'col-span-full flex flex-col gap-1.5 text-[0.85rem]'
  return 'flex flex-col gap-1.5 text-[0.85rem]'
}

export const fieldLabelClass = 'font-medium text-ink-600'

export function togglePillClass(isActive) {
  const base = 'rounded-lg border px-4 py-2 text-[0.85rem]'
  return isActive
    ? `${base} border-navy-800 bg-navy-800 text-white`
    : `${base} border-border bg-white text-ink-600`
}
