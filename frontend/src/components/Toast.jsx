function Toast({ message }) {
  if (!message) return null
  return (
    <div
      role="status"
      className="fixed bottom-6 left-1/2 z-[200] max-w-[90vw] -translate-x-1/2 rounded-2xl bg-navy-900 px-5 py-3 text-center text-[0.87rem] text-white shadow-[0_24px_60px_-20px_rgba(11,32,56,0.45)]"
    >
      {message}
    </div>
  )
}

export default Toast
