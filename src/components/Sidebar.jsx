import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, Building2, Tag, Megaphone, 
  CreditCard, Wrench, Users2, ShieldCheck, Settings, 
  UserCheck, BarChart3, LogOut
} from 'lucide-react';
import { getStoredRoles, resolveRoleName } from '../lib/masterData';

const Sidebar = ({ activeCategory, setActiveCategory, setActiveTab }) => {
  const [userProfile, setUserProfile] = useState(() => {
    const saved = localStorage.getItem('realtyos_user_profile');
    let parsed = null;
    if (saved) {
      try { parsed = JSON.parse(saved); } catch(e) {}
    }
    return {
      name: parsed?.name || 'Louis Kemenyo',
      role: parsed?.role || 'Portfolio Director',
      avatar: parsed?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80'
    };
  });

  useEffect(() => {
    const handleSync = () => {
      const saved = localStorage.getItem('realtyos_user_profile');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setUserProfile(prev => ({
            name: parsed?.name || prev?.name || 'Louis Kemenyo',
            role: parsed?.role || prev?.role || 'Portfolio Director',
            avatar: parsed?.avatar || prev?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80'
          }));
        } catch(e) {}
      }
    };
    window.addEventListener('realtyos_profile_updated', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('realtyos_profile_updated', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  const roles = getStoredRoles();
  const roleDef = roles.find(r => r.name.toLowerCase() === resolveRoleName(userProfile?.role || '').toLowerCase());
  const perms = roleDef?.permissions || [];
  
  const hasOmni = perms.includes('Executive Dashboard & Analytics');
  const hasHR = perms.includes('HR Staff Directory & Payroll Runs');
  const hasFinance = perms.includes('General Ledger & Fiscal Accounting');
  const hasSettings = perms.includes('System Parameters & RBAC Admin');
  const hasMaintenance = perms.includes('Maintenance Dispatch & Tickets');

  let overviewLabel = 'System Overview';
  let overviewTab = 'dashboard';
  
  const isHR = userProfile?.role?.toLowerCase().includes('hr') || resolveRoleName(userProfile?.role || '').toLowerCase().includes('hr');
  
  if (isHR) {
    overviewLabel = 'HR Overview';
    overviewTab = 'hr';
  } else if (hasOmni) {
    overviewLabel = 'Executive Overview';
    overviewTab = 'dashboard';
  } else if (hasHR && !hasFinance) {
    overviewLabel = 'HR Overview';
    overviewTab = 'hr';
  } else if (hasFinance && !hasHR) {
    overviewLabel = 'Finance Overview';
    overviewTab = 'finance-ledger';
  } else if (hasHR && hasFinance) {
    overviewLabel = 'Department Overview';
    overviewTab = 'finance-ledger';
  } else if (hasSettings) {
    overviewLabel = 'System Admin';
    overviewTab = 'settings';
  } else if (hasMaintenance) {
    overviewLabel = 'Operations Hub';
    overviewTab = 'maintenance';
  } else {
    // Default fallback if they have minimal permissions
    overviewLabel = 'My Dashboard';
    // We could leave it as dashboard and just clear out the stats, but let's send them to what they have access to.
    const firstCat = roleDef?.permissions?.length > 0 ? roleDef.permissions[0] : null;
    if (firstCat && firstCat.includes('Rental')) overviewTab = 'rental-properties';
    else if (firstCat && firstCat.includes('Sales')) overviewTab = 'sales-properties';
    else if (firstCat && firstCat.includes('Tenant')) overviewTab = 'tenants';
    else overviewTab = 'dashboard'; 
  }

  const menuItems = [
    { id: 'overview', label: overviewLabel, icon: LayoutDashboard, defaultTab: overviewTab },
    { id: 'reports-category', label: 'Intelligence Reports', icon: BarChart3, defaultTab: 'reports' },
    { id: 'rental', label: 'Rental Apartments', icon: Building2, defaultTab: 'rental-properties' },
    { id: 'sales', label: 'Sales & Purchases', icon: Tag, defaultTab: 'sales-properties' },
    { id: 'marketing', label: 'Marketing & CRM', icon: Megaphone, defaultTab: 'sales' },
    { id: 'finance', label: 'General Finance', icon: CreditCard, defaultTab: 'finance-ledger' },
    { id: 'operations', label: 'Operations', icon: Wrench, defaultTab: 'maintenance' },
    { id: 'human-resources', label: 'Human Resources', icon: Users2, defaultTab: 'hr' },
    { id: 'tenants-category', label: 'Tenants Register', icon: UserCheck, defaultTab: 'tenants' },
    { id: 'management', label: 'Management', icon: Settings, defaultTab: 'settings' }
  ];

  const getAuthorizedCategories = (roleName) => {
    // Always grant overview access as a baseline landing page
    const authorized = new Set(['overview']);
    
    if (roleDef && roleDef.permissions) {
      if (roleDef.permissions.includes('Executive Dashboard & Analytics')) {
        authorized.add('reports-category');
      }
      if (roleDef.permissions.includes('Rental Properties & Units')) {
        authorized.add('rental');
      }
      if (roleDef.permissions.includes('Sales Pipeline & CRM Directory')) {
        authorized.add('sales');
        authorized.add('marketing');
      }
      if (roleDef.permissions.includes('Tenant Register & Resident KYC')) {
        authorized.add('tenants-category');
      }
      if (roleDef.permissions.includes('General Ledger & Fiscal Accounting') || roleDef.permissions.includes('Rent Escrow & Security Deposits')) {
        authorized.add('finance');
      }
      if (roleDef.permissions.includes('Maintenance Dispatch & Tickets')) {
        authorized.add('operations');
      }
      if (roleDef.permissions.includes('HR Staff Directory & Payroll Runs')) {
        authorized.add('human-resources');
      }
      if (roleDef.permissions.includes('System Parameters & RBAC Admin') || roleDef.permissions.includes('Database Snapshots & Cloud Recovery')) {
        authorized.add('management');
      }
    }
    
    return Array.from(authorized);
  };

  useEffect(() => {
    const authorized = getAuthorizedCategories(userProfile?.role);
    if (!authorized.includes(activeCategory)) {
      if (authorized.length > 0) {
        setActiveCategory(authorized[0]);
        // Also update the activeTab to match the fallback category
        const fallbackItem = menuItems.find(m => m.id === authorized[0]);
        if (fallbackItem) {
          setActiveTab(fallbackItem.defaultTab);
        }
      }
    } else {
      // If activeCategory is 'overview', but the user doesn't have dashboard access,
      // we need to ensure the activeTab correctly aligns with their dynamic overviewTab
      if (activeCategory === 'overview') {
         setActiveTab(overviewTab);
      }
    }
  }, [userProfile, activeCategory]);

  const handleCategoryClick = (id, defaultTab) => {
    setActiveCategory(id);
    setActiveTab(defaultTab);
  };

  const authorizedCats = getAuthorizedCategories(userProfile?.role);
  const filteredMenuItems = menuItems.filter(item => authorizedCats.includes(item.id));

  return (
    <aside 
      className="sidebar-premium glass-sidebar no-print" 
      style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        bottom: 0, 
        width: '260px', 
        display: 'flex', 
        flexDirection: 'column', 
        borderRight: '1px solid var(--border-dark)', 
        background: 'rgba(255, 255, 255, 0.75)', 
        backdropFilter: 'blur(20px)', 
        zIndex: 100,
        boxSizing: 'border-box'
      }}
    >
      {/* Brand Header */}
      <div style={{ padding: '24px 20px', display: 'flex', alignItems: 'center', gap: '14px', borderBottom: '1px solid rgba(0,0,0,0.04)', flexShrink: 0 }}>
        <div style={{ width: '42px', height: '42px', borderRadius: '14px', background: 'var(--primary-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: '0 8px 20px -6px var(--primary)', flexShrink: 0 }}>
          <Building2 size={24} />
        </div>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-main)', letterSpacing: '-0.5px', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
            Realty<span style={{ color: 'var(--primary)' }}>OS</span>
          </h1>
          <span style={{ fontSize: '10px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Enterprise Property</span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav style={{ padding: '20px 14px', display: 'flex', flexDirection: 'column', gap: '6px', overflowY: 'auto', flex: 1 }}>
        <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1.2px', paddingLeft: '12px', marginBottom: '6px', opacity: 0.8 }}>
          Core Modules
        </span>
        {filteredMenuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeCategory === item.id;

          return (
            <motion.button
              key={item.id}
              onClick={() => handleCategoryClick(item.id, item.defaultTab)}
              className={`sidebar-link-premium ${isActive ? 'active' : ''}`}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                padding: '12px 16px',
                borderRadius: '14px',
                border: 'none',
                background: isActive ? 'var(--primary-gradient)' : 'transparent',
                color: isActive ? 'white' : 'var(--text-main)',
                fontWeight: isActive ? '800' : '600',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: isActive ? '0 10px 25px -8px var(--primary)' : 'none',
                position: 'relative',
                overflow: 'hidden',
                boxSizing: 'border-box'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', zIndex: 1 }}>
                <Icon size={18} style={{ color: isActive ? 'white' : 'var(--text-muted)', transition: 'color 0.2s', flexShrink: 0 }} />
                <span style={{ whiteSpace: 'nowrap' }}>{item.label}</span>
              </div>
              {isActive && (
                <motion.div 
                  layoutId="sidebar-active-indicator"
                  style={{ width: '4px', height: '20px', background: 'white', borderRadius: '4px', zIndex: 1, flexShrink: 0 }} 
                />
              )}
            </motion.button>
          );
        })}
      </nav>

      {/* Logout Footer */}
      <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(0,0,0,0.04)', flexShrink: 0, width: '100%', boxSizing: 'border-box' }}>
        <motion.button 
          onClick={() => window.dispatchEvent(new CustomEvent('realtyos_logout'))}
          whileHover={{ scale: 1.02, background: 'rgba(239, 68, 68, 0.12)', borderColor: 'rgba(239, 68, 68, 0.3)' }}
          whileTap={{ scale: 0.98 }}
          style={{ 
            padding: '12px 16px', 
            borderRadius: '14px', 
            border: '1px solid rgba(239, 68, 68, 0.2)', 
            background: 'rgba(239, 68, 68, 0.06)', 
            color: '#ef4444', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            gap: '10px', 
            width: '100%',
            cursor: 'pointer', 
            transition: 'all 0.2s ease',
            fontWeight: '700',
            fontSize: '14px',
            boxSizing: 'border-box',
            boxShadow: '0 4px 12px rgba(239, 68, 68, 0.05)'
          }}
        >
          <LogOut size={18} style={{ flexShrink: 0 }} />
          <span>Secure Logout</span>
        </motion.button>
      </div>
    </aside>
  );
};

export default Sidebar;
