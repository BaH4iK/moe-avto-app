import { Suspense } from 'react'
import GarageClient from './GarageClient'

export default function GaragePage() {
  return (
    /* Suspense нужен для того, чтобы клиентский компонент 
      GarageClient корректно работал с навигацией и данными.
    */
    <Suspense fallback={null}>
      <GarageClient />
    </Suspense>
  )
}