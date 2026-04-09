import { Suspense } from 'react'
import AddListingClient from './AddListingClient'

export default function AddListingPage() {
  return (
    <Suspense fallback={null}>
      <AddListingClient />
    </Suspense>
  )
}