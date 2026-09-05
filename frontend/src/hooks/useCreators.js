import { useEffect, useState } from 'react'
import { fetchApprovedCreators } from '../api/creators'

// Fetches the live public marketplace from the backend. Category filtering
// is re-fetched from the server rather than done client-side, since the API
// already supports `?category=` and that's the same query the real
// marketplace will run at scale.
export function useCreators(category) {
  const [creators, setCreators] = useState([])
  const [status, setStatus] = useState('loading') // 'loading' | 'ready' | 'error'
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    setStatus('loading')

    fetchApprovedCreators({ category })
      .then((result) => {
        if (cancelled) return
        setCreators(result)
        setStatus('ready')
      })
      .catch((err) => {
        if (cancelled) return
        setError(err)
        setStatus('error')
      })

    return () => {
      cancelled = true
    }
  }, [category])

  return { creators, status, error }
}
