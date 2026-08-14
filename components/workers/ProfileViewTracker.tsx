'use client'
import { useEffect } from 'react'
import { generateSessionId } from '@/lib/utils'

export function ProfileViewTracker({ workerId }: { workerId: string }) {
  useEffect(() => {
    const sessionId = generateSessionId()
    if (!sessionId) return
    fetch('/api/workers/view', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ worker_id: workerId, session_id: sessionId }),
    }).catch(() => {}) // silent fail
  }, [workerId])

  return null
}
