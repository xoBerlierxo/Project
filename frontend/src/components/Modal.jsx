import { useEffect } from 'react'

function Modal({ title, onClose, children, wide = false }) {
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-navy-900/55 px-4 py-10 max-[560px]:p-0"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`my-auto w-full rounded-[20px] bg-white shadow-[0_24px_60px_-20px_rgba(11,32,56,0.45)] max-[560px]:min-h-screen max-[560px]:max-w-none max-[560px]:rounded-none ${
          wide ? 'max-w-[680px]' : 'max-w-[560px]'
        }`}
      >
        <div className="flex items-center justify-between gap-4 border-b border-border px-6 py-5">
          <h2 className="text-[1.15rem]">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="rounded-lg p-1.5 leading-none text-ink-400 hover:bg-bg hover:text-ink-900"
          >
            ✕
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}

export default Modal
