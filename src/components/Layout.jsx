import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import ToastContainer from './ToastContainer';

export default function Layout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  return (
    <div className="app-shell">
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
      <div className="app-main">
        <Header onMenu={() => setMenuOpen(true)} />
        <main className="page-container">
          <div className="page-enter" key={location.pathname}><Outlet /></div>
        </main>
      </div>
      <ToastContainer />
    </div>
  );
}
