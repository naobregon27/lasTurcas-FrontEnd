import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import GlobalSearch from '../ui/GlobalSearch';
import OnboardingTour from '../ui/OnboardingTour';
import useInventoryStore from '../../store/useInventoryStore';

export default function Layout({ children }) {
  const { pathname } = useLocation();
  const [searchOpen, setSearchOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { settings, completeTour } = useInventoryStore();
  const [tourRun, setTourRun] = useState(false);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  // Auto-start tour for new users
  useEffect(() => {
    if (!settings?.tourCompleted) {
      const t = setTimeout(() => setTourRun(true), 700);
      return () => clearTimeout(t);
    }
  }, [settings?.tourCompleted]);

  useEffect(() => {
    const handleKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen((o) => !o);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  useEffect(() => {
    if (!sidebarOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [sidebarOpen]);

  return (
    <div className="flex min-h-screen min-h-[100dvh] bg-app">
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Cerrar menú"
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <Sidebar
        onSearchOpen={() => { setSearchOpen(true); setSidebarOpen(false); }}
        mobileOpen={sidebarOpen}
        onCloseMobile={() => setSidebarOpen(false)}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          pathname={pathname}
          onSearchOpen={() => setSearchOpen(true)}
          onMenuClick={() => setSidebarOpen(true)}
        />
        <main className="flex-1 p-3 sm:p-4 lg:p-6 overflow-auto pb-[max(1rem,env(safe-area-inset-bottom))]">
          {children}
        </main>
      </div>
      <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
      <OnboardingTour
        run={tourRun}
        onFinish={() => { setTourRun(false); completeTour(); }}
      />
    </div>
  );
}
