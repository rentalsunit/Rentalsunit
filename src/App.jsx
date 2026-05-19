import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './modules/Dashboard';
import Reports from './modules/Reports';
import RentalProperties from './modules/RentalProperties';
import SalesProperties from './modules/SalesProperties';
import Units from './modules/Units';
import Tenants from './modules/Tenants';
import Leases from './modules/Leases';
import Maintenance from './modules/Maintenance';
import Finance from './modules/Finance';
import Sales from './modules/Sales';
import Buyers from './modules/Buyers';
import Tasks from './modules/Tasks';
import Documents from './modules/Documents';
import Settings from './modules/Settings';
import HR from './modules/HR';
import Login from './components/Login';
import { AnimatePresence, motion } from 'framer-motion';
import { initCloudSync } from './lib/masterData';

function App() {
  const [activeCategory, setActiveCategory] = useState('overview');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('realtyos_authenticated') === 'true';
  });

  useEffect(() => {
    // Automatically initialize cloud sync and seed Supabase tables if empty
    initCloudSync().catch(err => console.warn('Supabase cloud auto-sync check:', err));

    const handleNav = (e) => {
      if (e.detail?.tab) {
        setActiveTab(e.detail.tab);
        if (e.detail.category) setActiveCategory(e.detail.category);
      }
    };
    const handleLogout = () => {
      localStorage.removeItem('realtyos_authenticated');
      setIsAuthenticated(false);
    };
    window.addEventListener('realtyos_navigate', handleNav);
    window.addEventListener('realtyos_logout', handleLogout);
    return () => {
      window.removeEventListener('realtyos_navigate', handleNav);
      window.removeEventListener('realtyos_logout', handleLogout);
    };
  }, []);

  const renderModule = () => {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.98 }}
          transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
          style={{ width: '100%', boxSizing: 'border-box' }}
        >
          {(() => {
            switch (activeTab) {
              case 'dashboard': return <Dashboard setActiveCategory={setActiveCategory} setActiveTab={setActiveTab} />;
              case 'reports': return <Reports />;
              case 'rental-properties': return <RentalProperties />;
              case 'sales-properties': return <SalesProperties setActiveTab={setActiveTab} />;
              case 'units': return <Units />;
              case 'tenants': return <Tenants />;
              case 'leases': return <Leases />;
              case 'maintenance': return <Maintenance />;
              case 'finance-ledger': 
              case 'finance-rent':
              case 'finance-sales':
              case 'finance-expenses':
              case 'finance-payroll': return <Finance activeTab={activeTab} />;
              case 'sales': return <Sales setActiveTab={setActiveTab} />;
              case 'buyers': return <Buyers />;
              case 'tasks': return <Tasks />;
              case 'documents': return <Documents />;
              case 'settings': return <Settings />;
              case 'hr': return <HR />;
              default: return <Dashboard />;
            }
          })()}
        </motion.div>
      </AnimatePresence>
    );
  };

  if (!isAuthenticated) {
    return <Login onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <div style={{ position: 'relative', minHeight: '100vh', width: '100vw', backgroundColor: 'var(--bg-main)', overflowX: 'hidden' }}>
      <div className="liquid-blob no-print" style={{ top: '-100px', left: '-100px' }}></div>
      <div className="liquid-blob no-print" style={{ bottom: '-100px', right: '-100px', background: 'linear-gradient(135deg, #818cf815 0%, #00a86b15 100%)' }}></div>
      <div className="liquid-blob no-print" style={{ top: '50%', left: '50%', width: '400px', height: '400px', filter: 'blur(150px)', opacity: 0.5 }}></div>
      
      <Sidebar 
        activeCategory={activeCategory} 
        setActiveCategory={setActiveCategory} 
        setActiveTab={setActiveTab} 
      />
      
      <main 
        style={{ 
          marginLeft: '260px', 
          width: 'calc(100vw - 260px)', 
          minHeight: '100vh', 
          padding: '0 0 56px 0', 
          position: 'relative', 
          zIndex: 'auto',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <Header 
          activeCategory={activeCategory} 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
        />
        <div style={{ padding: '36px 40px', width: '100%', boxSizing: 'border-box', maxWidth: '1600px', margin: '0 auto' }}>
          {renderModule()}
        </div>
      </main>
    </div>
  );
}

export default App;
