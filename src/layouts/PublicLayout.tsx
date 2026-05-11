import { Outlet } from 'react-router-dom'
import { MergeStarsHeader } from '../components/MergeStarsHeader'

export function PublicLayout() {
  return (
    <>
      <MergeStarsHeader />
      <main className="flex-1">
        <Outlet />
      </main>
    </>
  )
}
