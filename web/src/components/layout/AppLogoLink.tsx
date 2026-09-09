import { useNavigate } from 'react-router-dom'
import { getLastSitePage } from '@/lib/lastSitePage'

// The app logo used across the app's own pages (Configuración,
// Calendario) — clicking it returns to the calendar (see
// lastSitePage.ts).
export function AppLogoLink({ className }: { className?: string }) {
  const navigate = useNavigate()

  return (
    <button
      type="button"
      onClick={() => navigate(getLastSitePage())}
      aria-label="Volver al calendario"
      title="Volver al calendario"
      className={`cursor-pointer ${className ?? ''}`}
    >
      <img src="/logo.png" alt="App logo" className="h-10 w-10 object-contain" />
    </button>
  )
}
