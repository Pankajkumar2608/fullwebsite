
'use client'
import posthog from 'posthog-js'
import { PostHogProvider } from 'posthog-js/react'

if (typeof window !== 'undefined') {
  posthog.init('pk_live_7648e9feb64649559c80159f', {
    api_host: 'https://retainly-ingest-worker.kashyap11ayush02.workers.dev/',
    person_profiles: 'identified_only',
  })
}

export function CSPostHogProvider({ children }: { children: React.ReactNode }) {
  return <PostHogProvider client={posthog}>{children}</PostHogProvider>
}