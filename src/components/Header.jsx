import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Bell, ChevronDown, X, Upload, User, Mail, Phone, ShieldCheck, 
  Check, CheckCircle2, Clock, AlertTriangle, ShieldAlert, Filter, Trash2, Camera, Briefcase, Building2, LogOut, Lock
} from 'lucide-react';
import { getStoredNotifications, saveStoredNotifications } from '../lib/masterData';


const Header = ({ activeCategory, activeTab, setActiveTab }) => {
  const categoryTabs = {
    overview: [
      { id: 'dashboard', label: 'Executive Summary' },
    ],
    'reports-category': [
      { id: 'reports', label: 'Management Intelligence Dossier' },
    ],
    rental: [
      { id: 'rental-properties', label: 'Rental Apartments' },
      { id: 'units', label: 'Unit Register' },
      { id: 'leases', label: 'Active Leases' },
    ],
    sales: [
      { id: 'sales-properties', label: 'Sales Projects (Inventory)' },
    ],
    marketing: [
      { id: 'sales', label: 'Sales Pipeline (Kanban)' },
      { id: 'buyers', label: 'Prospects & CRM Directory' },
    ],
    finance: [
      { id: 'finance-ledger', label: 'Master Financial Ledger' },
    ],
    operations: [
      { id: 'maintenance', label: 'Maintenance Work Orders' },
      { id: 'tasks', label: 'Staff Task Scheduling' },
      { id: 'documents', label: 'Enterprise Vault' },
    ],
    'human-resources': [
      { id: 'hr', label: 'Staff Directory & HR Management' },
    ],
    'tenants-category': [
      { id: 'tenants', label: 'Tenants & Resident Database' },
    ],
    management: [
      { id: 'settings', label: 'Enterprise Management & Settings' },
    ]
  };

  const tabs = categoryTabs[activeCategory] || [];

  const getCategoryTitle = (cat) => {
    if (cat === 'reports-category') return 'Intelligence Reports';
    if (cat === 'tenants-category') return 'Tenants Register';
    if (cat === 'human-resources') return 'Human Resources';
    return cat.replace('-', ' ');
  };

  // --- Profile & Supabase Modal States ---
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showSupabaseModal, setShowSupabaseModal] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [userProfile, setUserProfile] = useState(() => {
    const saved = localStorage.getItem('realtyos_user_profile');
    let parsed = null;
    if (saved) {
      try { parsed = JSON.parse(saved); } catch(e) {}
    }
    return {
      name: parsed?.name || 'Louis Kemenyo',
      role: parsed?.role || 'Portfolio Director',
      department: parsed?.department || 'Executive Management',
      email: parsed?.email || 'louis@realtyos.com',
      phone: parsed?.phone || '+233 54 102 9384',
      avatar: parsed?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80'
    };
  });

  // Edit fields state
  const [editName, setEditName] = useState(userProfile.name);
  const [editRole, setEditRole] = useState(userProfile.role);
  const [editDept, setEditDept] = useState(userProfile.department);
  const [editEmail, setEditEmail] = useState(userProfile.email);
  const [editPhone, setEditPhone] = useState(userProfile.phone);

  useEffect(() => {
    setEditName(userProfile?.name || 'Louis Kemenyo');
    setEditRole(userProfile?.role || 'Portfolio Director');
    setEditDept(userProfile?.department || 'Executive Management');
    setEditEmail(userProfile?.email || 'louis@realtyos.com');
    setEditPhone(userProfile?.phone || '+233 54 102 9384');
  }, [userProfile]);

  useEffect(() => {
    const handleOpenModal = () => setShowProfileModal(true);
    const handleSync = () => {
      const saved = localStorage.getItem('realtyos_user_profile');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setUserProfile(prev => ({
            name: parsed?.name || prev?.name || 'Louis Kemenyo',
            role: parsed?.role || prev?.role || 'Portfolio Director',
            department: parsed?.department || prev?.department || 'Executive Management',
            email: parsed?.email || prev?.email || 'louis@realtyos.com',
            phone: parsed?.phone || prev?.phone || '+233 54 102 9384',
            avatar: parsed?.avatar || prev?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80'
          }));
        } catch(e) {}
      }
    };
    window.addEventListener('realtyos_open_profile_modal', handleOpenModal);
    window.addEventListener('realtyos_profile_updated', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('realtyos_open_profile_modal', handleOpenModal);
      window.removeEventListener('realtyos_profile_updated', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const updated = { ...userProfile, avatar: reader.result };
        setUserProfile(updated);
        localStorage.setItem('realtyos_user_profile', JSON.stringify(updated));
        window.dispatchEvent(new CustomEvent('realtyos_profile_updated'));
        setSuccessMsg('Profile image successfully uploaded & synchronized!');
        setTimeout(() => setSuccessMsg(''), 4000);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    const updated = {
      ...userProfile,
      name: editName,
      role: editRole,
      department: editDept,
      email: editEmail,
      phone: editPhone
    };
    setUserProfile(updated);
    localStorage.setItem('realtyos_user_profile', JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('realtyos_profile_updated'));
    setShowProfileModal(false);
    setSuccessMsg('Executive user credentials successfully updated!');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleTriggerLogout = () => {
    setShowProfileModal(false);
    window.dispatchEvent(new CustomEvent('realtyos_logout'));
  };

  // --- Notifications Modal & LocalStorage State ---
  const [showNotifModal, setShowNotifModal] = useState(false);
  const [notifFilter, setNotifFilter] = useState('all'); // 'all' or 'unread'
  const [notifications, setNotifications] = useState(() => getStoredNotifications());

  const unreadCount = notifications.filter(n => n.unread).length;

  const markAllAsRead = () => {
    const updated = notifications.map(n => ({ ...n, unread: false }));
    setNotifications(updated);
    saveStoredNotifications(updated);
    setSuccessMsg('All notifications marked as read.');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const dismissNotif = (id) => {
    const updated = notifications.filter(n => n.id !== id);
    setNotifications(updated);
    saveStoredNotifications(updated);
  };

  const filteredNotifs = notifications.filter(n => notifFilter === 'all' || n.unread);

  const getNotifIcon = (type) => {
    switch (type) {
      case 'alert': return <AlertTriangle size={18} color="#f59e0b" />;
      case 'urgent': return <ShieldAlert size={18} color="#ef4444" />;
      case 'success': return <CheckCircle2 size={18} color="#10b981" />;
      default: return <Clock size={18} color="#6366f1" />;
    }
  };

  return (
    <header 
      className="top-nav-premium no-print"
      style={{
        width: '100%',
        boxSizing: 'border-box',
        padding: '0 36px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        overflow: 'hidden'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0 }}>
        <h2 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-main)', textTransform: 'capitalize', letterSpacing: '-0.5px', whiteSpace: 'nowrap' }}>
          {getCategoryTitle(activeCategory)}
        </h2>
        <div style={{ width: '1px', height: '24px', background: 'var(--border-dark)' }}></div>
      </div>

      <nav style={{ 
        display: 'flex', 
        backgroundColor: 'rgba(0,0,0,0.03)', 
        padding: '6px', 
        borderRadius: '40px',
        gap: '4px',
        backdropFilter: 'blur(10px)',
        overflowX: 'auto',
        maxWidth: '600px',
        scrollbarWidth: 'none'
      }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`nav-pill-premium ${activeTab === tab.id ? 'active' : ''}`}
            style={{ position: 'relative', overflow: 'visible', whiteSpace: 'nowrap', flexShrink: 0 }}
          >
            <span style={{ position: 'relative', zIndex: 1 }}>{tab.label}</span>
            {activeTab === tab.id && (
              <motion.div 
                layoutId="header-active-pill"
                style={{ 
                  position: 'absolute', 
                  top: 0, left: 0, right: 0, bottom: 0, 
                  background: 'white', 
                  borderRadius: '30px', 
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  zIndex: 0 
                }}
              />
            )}
          </button>
        ))}
      </nav>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0 }}>
        <div style={{ position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Search assets..." 
            style={{ 
              padding: '12px 16px 12px 48px', 
              borderRadius: '30px', 
              border: '1px solid var(--border-dark)', 
              fontSize: '14px', 
              width: '200px',
              backgroundColor: 'rgba(255,255,255,0.4)',
              fontWeight: '600',
              outline: 'none'
            }} 
          />
        </div>
        
        {/* --- NOTIFICATION BELL BUTTON --- */}
        <motion.button 
          onClick={() => setShowNotifModal(true)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{ position: 'relative', width: '42px', height: '42px', borderRadius: '15px', background: 'white', border: '1px solid var(--border-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', cursor: 'pointer', flexShrink: 0 }}
        >
          <Bell size={20} />
          {unreadCount > 0 && (
            <div style={{ position: 'absolute', top: '-4px', right: '-4px', background: '#ef4444', color: 'white', fontSize: '10px', fontWeight: '900', width: '18px', height: '18px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid white' }}>
              {unreadCount}
            </div>
          )}
        </motion.button>

        {/* --- USER PROFILE PILL --- */}
        <div 
          onClick={() => setShowProfileModal(true)}
          style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 14px', borderRadius: '30px', background: 'white', border: '1px solid var(--border-dark)', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', cursor: 'pointer', flexShrink: 0, transition: '0.2s' }}
          onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
          onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-dark)'}
        >
          <div style={{ width: '30px', height: '30px', borderRadius: '50%', overflow: 'hidden', border: '2px solid var(--primary)' }}>
            <img src={userProfile?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80'} alt={userProfile?.name || 'User'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <span style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-main)' }}>{(userProfile?.name || 'Executive User').split(' ')[0]}</span>
          <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} />
        </div>
      </div>

      {/* --- FLOATING TOAST NOTIFICATION --- */}
      {createPortal(
        <AnimatePresence>
          {successMsg && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              style={{
                position: 'fixed',
                top: '24px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: '#00875a',
                color: 'white',
                padding: '14px 24px',
                borderRadius: '20px',
                fontWeight: '800',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                boxShadow: '0 12px 25px -5px rgba(0,135,90,0.4)',
                zIndex: 999999
              }}
            >
              <CheckCircle2 size={18} />
              <span>{successMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* ========================================================= */}
      {/* DRAWER / MODAL 1: SYSTEM NOTIFICATIONS */}
      {/* ========================================================= */}
      {createPortal(
        <AnimatePresence>
          {showNotifModal && (
            <div className="print-modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(12px)', zIndex: 999999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', boxSizing: 'border-box' }}>
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="print-modal-content"
                style={{ width: '100%', maxWidth: '540px', background: 'white', borderRadius: '28px', padding: '32px', boxSizing: 'border-box', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)', display: 'flex', flexDirection: 'column', gap: '24px', maxHeight: '85vh', overflow: 'hidden' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ padding: '4px 12px', background: '#f1f5f9', color: '#475569', borderRadius: '14px', fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Live Feeds</span>
                      {unreadCount > 0 && (
                        <span style={{ background: '#fee2e2', color: '#ef4444', padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: '800' }}>
                          {unreadCount} New
                        </span>
                      )}
                    </div>
                    <h3 style={{ margin: 0, fontSize: '24px', fontWeight: '900', color: '#0f172a' }}>System Dispatch Notifications</h3>
                  </div>
                  <button onClick={() => setShowNotifModal(false)} style={{ background: '#f1f5f9', border: 'none', width: '38px', height: '38px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', cursor: 'pointer' }}>
                    <X size={20} />
                  </button>
                </div>

                {/* Filter & Actions Bar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '6px 12px', borderRadius: '16px' }}>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button 
                      onClick={() => setNotifFilter('all')} 
                      style={{ padding: '6px 14px', borderRadius: '12px', border: 'none', background: notifFilter === 'all' ? 'var(--primary)' : 'transparent', color: notifFilter === 'all' ? 'white' : '#64748b', fontWeight: '800', fontSize: '12px', cursor: 'pointer' }}
                    >
                      All Alerts ({notifications.length})
                    </button>
                    <button 
                      onClick={() => setNotifFilter('unread')} 
                      style={{ padding: '6px 14px', borderRadius: '12px', border: 'none', background: notifFilter === 'unread' ? 'var(--primary)' : 'transparent', color: notifFilter === 'unread' ? 'white' : '#64748b', fontWeight: '800', fontSize: '12px', cursor: 'pointer' }}
                    >
                      Unread ({unreadCount})
                    </button>
                  </div>
                  {unreadCount > 0 && (
                    <button 
                      onClick={markAllAsRead} 
                      style={{ background: 'transparent', border: 'none', color: 'var(--primary)', fontWeight: '800', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
                    >
                      <Check size={14} /> Mark all read
                    </button>
                  )}
                </div>

                {/* Notifications List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto', paddingRight: '4px' }}>
                  {filteredNotifs.length === 0 ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8', fontSize: '14px', fontWeight: '700' }}>
                      <CheckCircle2 size={40} style={{ margin: '0 auto 12px', color: '#cbd5e1' }} />
                      No notifications to display.
                    </div>
                  ) : (
                    filteredNotifs.map((n) => (
                      <div 
                        key={n.id} 
                        style={{ 
                          display: 'flex', 
                          alignItems: 'flex-start', 
                          gap: '16px', 
                          padding: '16px', 
                          background: n.unread ? '#f0fdf4' : '#f8fafc', 
                          borderLeft: n.unread ? '4px solid var(--primary)' : '4px solid #cbd5e1', 
                          borderRadius: '16px', 
                          position: 'relative' 
                        }}
                      >
                        <div style={{ padding: '10px', background: 'white', borderRadius: '12px', boxShadow: '0 4px 10px rgba(0,0,0,0.03)', flexShrink: 0 }}>
                          {getNotifIcon(n.type)}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                            <span style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a' }}>{n.title}</span>
                            <span style={{ fontSize: '11px', fontWeight: '700', color: '#94a3b8' }}>{n.time}</span>
                          </div>
                          <p style={{ margin: '0 0 8px', fontSize: '13px', color: '#475569', lineHeight: '1.4' }}>{n.desc}</p>
                          <div style={{ display: 'flex', gap: '12px' }}>
                            <button 
                              onClick={() => dismissNotif(n.id)} 
                              style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '11px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', padding: 0 }}
                            >
                              <Trash2 size={12} /> Dismiss
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                  <button onClick={() => setShowNotifModal(false)} style={{ flex: 1, padding: '14px', borderRadius: '16px', border: 'none', background: 'var(--primary)', color: 'white', fontWeight: '800', fontSize: '14px', cursor: 'pointer', boxShadow: '0 8px 20px -6px rgba(0,135,90,0.4)' }}>
                    Done Reviewing
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* ========================================================= */}
      {/* DRAWER / MODAL 2: USER PROFILE & IMAGE UPLOAD */}
      {/* ========================================================= */}
      {createPortal(
        <AnimatePresence>
          {showProfileModal && (
            <div className="print-modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(12px)', zIndex: 999999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', boxSizing: 'border-box' }}>
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="print-modal-content"
                style={{ width: '100%', maxWidth: '520px', background: 'white', borderRadius: '28px', padding: '36px', boxSizing: 'border-box', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)', display: 'flex', flexDirection: 'column', gap: '28px', maxHeight: '90vh', overflowY: 'auto' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ padding: '4px 12px', background: '#f1f5f9', color: '#475569', borderRadius: '14px', fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Security Level 1</span>
                    <h3 style={{ margin: '6px 0 0', fontSize: '24px', fontWeight: '900', color: '#0f172a' }}>Executive Profile Settings</h3>
                  </div>
                  <button onClick={() => setShowProfileModal(false)} style={{ background: '#f1f5f9', border: 'none', width: '38px', height: '38px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', cursor: 'pointer' }}>
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  {/* Image Upload Area */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', padding: '24px', background: '#f8fafc', borderRadius: '20px', border: '1px dashed #cbd5e1' }}>
                    <div style={{ position: 'relative', width: '100px', height: '100px', borderRadius: '50%', overflow: 'hidden', border: '3px solid var(--primary)', boxShadow: '0 8px 20px rgba(0,135,90,0.2)' }}>
                      <img src={userProfile.avatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                      <label style={{ background: 'var(--primary)', color: 'white', padding: '10px 20px', borderRadius: '14px', fontSize: '13px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(0,135,90,0.3)', transition: '0.2s' }}>
                        <Camera size={16} /> Upload New Photo
                        <input type="file" accept="image/*" onChange={handleAvatarUpload} style={{ display: 'none' }} />
                      </label>
                      <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '600' }}>Supported formats: JPG, PNG (Auto-scales & persists locally)</span>
                    </div>
                  </div>

                  {/* Edit Form Fields */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                    <div style={{ display: 'flex', gap: '16px' }}>
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '12px', fontWeight: '800', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><User size={14} color="var(--primary)" /> Full Name</span>
                          <span style={{ color: '#94a3b8', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}><Lock size={12} /> HR Locked</span>
                        </label>
                        <input 
                          type="text" 
                          value={editName} 
                          readOnly
                          disabled
                          style={{ padding: '14px 16px', borderRadius: '14px', border: '1px solid #cbd5e1', fontSize: '14px', fontWeight: '700', color: '#64748b', background: '#f1f5f9', outline: 'none', cursor: 'not-allowed' }} 
                        />
                      </div>
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '12px', fontWeight: '800', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Briefcase size={14} color="var(--primary)" /> Executive Title</span>
                          <span style={{ color: '#94a3b8', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}><Lock size={12} /> HR Locked</span>
                        </label>
                        <input 
                          type="text" 
                          value={editRole} 
                          readOnly
                          disabled
                          style={{ padding: '14px 16px', borderRadius: '14px', border: '1px solid #cbd5e1', fontSize: '14px', fontWeight: '700', color: '#64748b', background: '#f1f5f9', outline: 'none', cursor: 'not-allowed' }} 
                        />
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '12px', fontWeight: '800', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Building2 size={14} color="var(--primary)" /> Department</span>
                        <span style={{ color: '#94a3b8', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}><Lock size={12} /> HR Locked</span>
                      </label>
                      <input 
                        type="text" 
                        value={editDept} 
                        readOnly
                        disabled
                        style={{ padding: '14px 16px', borderRadius: '14px', border: '1px solid #cbd5e1', fontSize: '14px', fontWeight: '700', color: '#64748b', background: '#f1f5f9', outline: 'none', cursor: 'not-allowed' }} 
                      />
                    </div>

                    <div style={{ display: 'flex', gap: '16px' }}>
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '12px', fontWeight: '800', color: '#475569', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Mail size={14} color="var(--primary)" /> Work Email
                        </label>
                        <input 
                          type="email" 
                          value={editEmail} 
                          onChange={(e) => setEditEmail(e.target.value)}
                          required
                          style={{ padding: '14px 16px', borderRadius: '14px', border: '1px solid #cbd5e1', fontSize: '14px', fontWeight: '700', color: '#0f172a', background: 'white', outline: 'none' }} 
                        />
                      </div>
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '12px', fontWeight: '800', color: '#475569', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Phone size={14} color="var(--primary)" /> Direct Phone
                        </label>
                        <input 
                          type="text" 
                          value={editPhone} 
                          onChange={(e) => setEditPhone(e.target.value)}
                          required
                          style={{ padding: '14px 16px', borderRadius: '14px', border: '1px solid #cbd5e1', fontSize: '14px', fontWeight: '700', color: '#0f172a', background: 'white', outline: 'none' }} 
                        />
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                    <button type="button" onClick={handleTriggerLogout} style={{ padding: '14px 20px', borderRadius: '16px', border: '1px solid #fecdd3', background: '#fff1f2', color: '#e11d48', fontWeight: '800', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <LogOut size={16} /> Log Out
                    </button>
                    <button type="button" onClick={() => setShowProfileModal(false)} style={{ padding: '14px 24px', borderRadius: '16px', border: '1px solid #cbd5e1', background: '#f1f5f9', color: '#475569', fontWeight: '800', fontSize: '14px', cursor: 'pointer' }}>
                      Cancel
                    </button>
                    <button type="submit" style={{ flex: 1, padding: '14px', borderRadius: '16px', border: 'none', background: 'var(--primary)', color: 'white', fontWeight: '800', fontSize: '14px', cursor: 'pointer', boxShadow: '0 8px 20px -6px rgba(0,135,90,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                      <ShieldCheck size={18} /> Save & Apply Profile
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}

    </header>
  );
};

export default Header;
