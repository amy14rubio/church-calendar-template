import { Link } from 'react-router-dom';
import { HeaderProfileMenu } from '@/components/layout/HeaderProfileMenu';
import { useAuth } from '@/contexts/AuthContext';

// Minimal header for the app-shell pages (Login/Profile/Admin — see
// Layout.tsx). The calendar page itself renders its own header
// (CalendarPageHeader) and isn't wrapped in Layout at all.
export function SiteHeader() {
  const { firebaseUser } = useAuth();

  return (
    <header className="relative bg-(--site-bg) shadow-[0_1px_0_0_var(--site-border)]">
      <div className="flex h-20 items-center justify-between gap-4 px-4 sm:px-8">
        <Link to="/calendario" className="flex shrink-0 items-center gap-3">
          <img src="/logo.png" alt="Calendar app logo" className="h-10 w-10 object-contain" />
        </Link>

        <div className="flex shrink-0 items-center gap-2">
          {firebaseUser ? (
            <HeaderProfileMenu />
          ) : (
            <Link
              to="/iniciar-sesion"
              className="rounded-md bg-(--site-maroon) px-4 py-2 text-sm font-medium text-(--site-maroon-contrast) hover:bg-(--site-maroon-dark)"
            >
              Iniciar sesión
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
