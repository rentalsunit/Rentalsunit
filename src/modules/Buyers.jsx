import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Filter, Plus, UserCheck, Phone, Mail, MapPin, 
  DollarSign, Flame, Zap, Clock, Calendar, 
  CheckCircle2, MoreVertical, X, Send, Eye, ShieldCheck, 
  Briefcase, LayoutGrid, List, MessageSquare, FileText, MessageCircle
} from 'lucide-react';

const Buyers = () => {
  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeMsgProspect, setActiveMsgProspect] = useState(null);
  const [activeOfferProspect, setActiveOfferProspect] = useState(null);
  const [msgChannel, setMsgChannel] = useState('whatsapp'); // 'whatsapp' or 'email'
  const [offerChannel, setOfferChannel] = useState('whatsapp'); // 'whatsapp' or 'email'
  const [successMessage, setSuccessMessage] = useState('');

  const [prospects, setProspects] = useState([
    { 
      id: 'PR-201', 
      name: 'Michael Osei-Mensah', 
      email: 'm.oseimensah@corporate.com.gh', 
      phone: '+233 24 888 9999',
      avatar: 'https://ui-avatars.com/api/?name=Michael+O&background=00875a&color=fff',
      category: 'High Net Worth',
      budget: '₵ 1,500,000 - ₵ 2,500,000',
      minBudget: 1500000,
      interest: 'Sunset Hills Luxury Villas',
      status: 'Hot Lead',
      source: 'Diaspora Roadshow',
      lastInteraction: 'Attended VIP Private Viewing on 14 May',
      assignedAgent: 'Louis Kemenyo'
    },
    { 
      id: 'PR-202', 
      name: 'Evelyn Addo-Danquah', 
      email: 'evelyn.danquah@investments.gh', 
      phone: '+233 20 111 2222',
      avatar: 'https://ui-avatars.com/api/?name=Evelyn+A&background=6366f1&color=fff',
      category: 'Institutional Investor',
      budget: '₵ 5,000,000+',
      minBudget: 5000000,
      interest: 'The Apex Commercial Tower',
      status: 'Warm Prospect',
      source: 'Direct Executive Referral',
      lastInteraction: 'Requested financial yield analysis & occupancy projections',
      assignedAgent: 'Pam Beesly'
    },
    { 
      id: 'PR-203', 
      name: 'Kwadwo Asamoah', 
      email: 'k.asamoah@miningholdings.com', 
      phone: '+233 55 333 4444',
      avatar: 'https://ui-avatars.com/api/?name=Kwadwo+A&background=f59e0b&color=fff',
      category: 'VIP Buyer',
      budget: '₵ 800,000 - ₵ 1,200,000',
      minBudget: 800000,
      interest: 'Green Valley Eco Estate (Land)',
      status: 'Hot Lead',
      source: 'Website Inquiry',
      lastInteraction: 'Site inspection completed; requested titled indenture drafts',
      assignedAgent: 'Dwight Schrute'
    },
    { 
      id: 'PR-204', 
      name: 'Jessica Tetteh', 
      email: 'jessica.t@designstudio.gh', 
      phone: '+233 27 555 6666',
      avatar: 'https://ui-avatars.com/api/?name=Jessica+T&background=ec4899&color=fff',
      category: 'First-Time Buyer',
      budget: '₵ 450,000 - ₵ 650,000',
      minBudget: 450000,
      interest: 'Palm Breeze Beach Residences',
      status: 'Nurture',
      source: 'Social Media Campaign',
      lastInteraction: 'Downloaded digital brochure on 12 May',
      assignedAgent: 'Phyllis Vance'
    },
    { 
      id: 'PR-205', 
      name: 'Nana Yaw Boakye', 
      email: 'ny.boakye@kensington.co.uk', 
      phone: '+44 7700 900077',
      avatar: 'https://ui-avatars.com/api/?name=Nana+Y&background=10b981&color=fff',
      category: 'Diaspora Buyer',
      budget: '₵ 2,000,000 - ₵ 3,500,000',
      minBudget: 2000000,
      interest: 'Sunset Hills Luxury Villas',
      status: 'Hot Lead',
      source: 'London Property Expo',
      lastInteraction: 'Video conference setup with legal advisor on 15 May',
      assignedAgent: 'Louis Kemenyo'
    },
  ]);

  const cleanPhoneForWhatsApp = (phoneStr) => {
    return phoneStr.replace(/[\s\+\-\(\)]/g, '');
  };

  const handleAddProspect = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const minBudgetVal = parseFloat(formData.get('minBudget')) || 500000;

    const newProspect = {
      id: `PR-${prospects.length + 201}`,
      name: formData.get('name'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.get('name'))}&background=00875a&color=fff`,
      category: formData.get('category'),
      budget: `₵ ${parseInt(formData.get('minBudget')).toLocaleString()} - ₵ ${parseInt(formData.get('maxBudget')).toLocaleString()}`,
      minBudget: minBudgetVal,
      interest: formData.get('interest'),
      status: formData.get('status'),
      source: formData.get('source') || 'Direct Inquiry',
      lastInteraction: formData.get('notes') || 'Newly registered in CRM.',
      assignedAgent: formData.get('agent')
    };

    setProspects([newProspect, ...prospects]);
    setShowAddModal(false);
    setSuccessMessage(`Successfully registered ${newProspect.name} in CRM!`);
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const msgText = formData.get('msgText');
    const prospect = activeMsgProspect;
    
    // Update CRM state
    setProspects(prospects.map(p => {
      if (p.id === prospect.id) {
        return { 
          ...p, 
          lastInteraction: `${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}: Sent ${msgChannel.toUpperCase()} - "${msgText.substring(0, 50)}..."` 
        };
      }
      return p;
    }));

    // Trigger external WhatsApp or Mailto
    if (msgChannel === 'whatsapp') {
      const cleanPhone = cleanPhoneForWhatsApp(prospect.phone);
      const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msgText)}`;
      window.open(url, '_blank');
    } else {
      const url = `mailto:${encodeURIComponent(prospect.email)}?subject=${encodeURIComponent('Property Inquiry Follow-up')}&body=${encodeURIComponent(msgText)}`;
      window.open(url, '_blank');
    }
    
    const clientName = prospect.name;
    setActiveMsgProspect(null);
    setSuccessMessage(`Direct message successfully dispatched to ${clientName} via ${msgChannel === 'whatsapp' ? 'WhatsApp' : 'Email'}!`);
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  const handleSendOffer = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const offerPriceVal = formData.get('offerPrice');
    const offerValidity = formData.get('offerValidity');
    const paymentTerms = formData.get('paymentTerms');
    const proposalMsg = formData.get('proposalMsg');
    const prospect = activeOfferProspect;
    
    // Construct Full Comprehensive Proposal Text
    const fullProposalContent = `*OFFICIAL INVESTMENT PROPOSAL*\n\n` +
      `*Client:* ${prospect.name}\n` +
      `*Target Asset Interest:* ${prospect.interest}\n` +
      `*Proposed Valuation:* ₵ ${parseInt(offerPriceVal).toLocaleString()}\n` +
      `*Payment Structure:* ${paymentTerms}\n` +
      `*Offer Validity Expiration:* ${offerValidity}\n\n` +
      `*Executive Summary:*\n${proposalMsg}\n\n` +
      `_Attachments Included: Titled Indenture Draft, Official Brochure & Floor/Site Plan._`;

    // Update CRM state
    setProspects(prospects.map(p => {
      if (p.id === prospect.id) {
        return { 
          ...p, 
          status: 'Hot Lead',
          lastInteraction: `Sent Official Investment Offer (₵ ${parseInt(offerPriceVal).toLocaleString()}) via ${offerChannel.toUpperCase()} on ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`
        };
      }
      return p;
    }));
    
    // Trigger external link
    if (offerChannel === 'whatsapp') {
      const cleanPhone = cleanPhoneForWhatsApp(prospect.phone);
      const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(fullProposalContent)}`;
      window.open(url, '_blank');
    } else {
      const subject = `Official Investment Proposal - ${prospect.interest}`;
      const url = `mailto:${encodeURIComponent(prospect.email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(fullProposalContent)}`;
      window.open(url, '_blank');
    }

    const clientName = prospect.name;
    const channelName = offerChannel === 'whatsapp' ? 'WhatsApp' : 'Gmail/Email';
    setActiveOfferProspect(null);
    setSuccessMessage(`Formal investment proposal successfully transmitted to ${clientName} via ${channelName}!`);
    setTimeout(() => setSuccessMessage(''), 5000);
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case 'Hot Lead': return { bg: '#fee2e2', text: '#ef4444', border: '#fca5a5', icon: Flame };
      case 'Warm Prospect': return { bg: '#fef3c7', text: '#d97706', border: '#fde68a', icon: Zap };
      default: return { bg: '#e0e7ff', text: '#4338ca', border: '#c7d2fe', icon: Clock };
    }
  };

  const getCategoryColor = (cat) => {
    switch (cat) {
      case 'High Net Worth': return { bg: '#f3e8ff', text: '#9333ea' };
      case 'Institutional Investor': return { bg: '#dbeafe', text: '#2563eb' };
      case 'Diaspora Buyer': return { bg: '#d1fae5', text: '#059669' };
      default: return { bg: '#f1f5f9', text: '#475569' };
    }
  };

  // Metrics
  const totalPurchasingPower = prospects.reduce((acc, p) => acc + p.minBudget, 0);
  const hotLeadsCount = prospects.filter(p => p.status === 'Hot Lead').length;
  const hnwCount = prospects.filter(p => p.category === 'High Net Worth' || p.category === 'Institutional Investor').length;

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } }
  };

  const item = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  };

  const filteredProspects = prospects.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.interest.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = activeFilter === 'all' || p.status === activeFilter || p.category === activeFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <motion.div 
      variants={container} 
      initial="hidden" 
      animate="show" 
      style={{ display: 'flex', flexDirection: 'column', gap: '32px', position: 'relative' }}
    >
      {/* Floating Success Alert */}
      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            style={{
              position: 'fixed',
              top: '32px',
              right: '32px',
              zIndex: 9999,
              backgroundColor: '#059669',
              color: 'white',
              padding: '16px 24px',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)'
            }}
          >
            <CheckCircle2 size={24} />
            <span style={{ fontSize: '15px', fontWeight: '700' }}>{successMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Banner & Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{ padding: '6px 12px', borderRadius: '20px', backgroundColor: 'var(--primary-glow)', color: 'var(--primary)', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <UserCheck size={12} /> Premium Prospects CRM
            </span>
          </div>
          <h2 style={{ fontSize: '28px', fontWeight: '800', letterSpacing: '-0.5px', color: 'var(--text-main)' }}>Buyer Prospects & VIP Leads</h2>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: '500', marginTop: '2px' }}>
            Manage verified potential buyers, purchasing capacity, asset preferences, and relationship touchpoints.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ display: 'flex', background: 'white', borderRadius: '12px', border: '1px solid var(--border-dark)', padding: '4px' }}>
            <button 
              onClick={() => setViewMode('grid')}
              style={{ padding: '8px', borderRadius: '8px', background: viewMode === 'grid' ? '#f1f5f9' : 'transparent', border: 'none', cursor: 'pointer', transition: '0.2s' }}
            >
              <LayoutGrid size={18} color={viewMode === 'grid' ? 'var(--primary)' : 'var(--text-muted)'} />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              style={{ padding: '8px', borderRadius: '8px', background: viewMode === 'list' ? '#f1f5f9' : 'transparent', border: 'none', cursor: 'pointer', transition: '0.2s' }}
            >
              <List size={18} color={viewMode === 'list' ? 'var(--primary)' : 'var(--text-muted)'} />
            </button>
          </div>
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowAddModal(true)}
            style={{ 
              backgroundColor: 'var(--primary)', color: 'white', border: 'none', 
              padding: '12px 24px', borderRadius: '12px', display: 'flex', 
              alignItems: 'center', gap: '10px', fontSize: '14px', fontWeight: '700', 
              cursor: 'pointer', boxShadow: '0 10px 20px -5px rgba(0, 135, 90, 0.4)' 
            }}
          >
            <Plus size={20} /> Register Prospect
          </motion.button>
        </div>
      </header>

      {/* CRM VIP Metrics Banner */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
        <div className="glass-card-premium" style={{ padding: '24px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: '#fee2e2', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Flame size={28} />
          </div>
          <div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Hot Lead Opportunities</p>
            <h3 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-main)', marginTop: '4px' }}>{hotLeadsCount} Prospects</h3>
            <span style={{ fontSize: '12px', color: '#ef4444', fontWeight: '700' }}>Immediate follow-up required</span>
          </div>
        </div>

        <div className="glass-card-premium" style={{ padding: '24px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <DollarSign size={28} />
          </div>
          <div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Purchasing Power</p>
            <h3 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-main)', marginTop: '4px' }}>₵ {(totalPurchasingPower / 1000000).toFixed(2)}M</h3>
            <span style={{ fontSize: '12px', color: '#16a34a', fontWeight: '700' }}>Minimum verified budget</span>
          </div>
        </div>

        <div className="glass-card-premium" style={{ padding: '24px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: '#f3e8ff', color: '#9333ea', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Briefcase size={28} />
          </div>
          <div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>HNW / Institutional</p>
            <h3 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-main)', marginTop: '4px' }}>{hnwCount} VIP Clients</h3>
            <span style={{ fontSize: '12px', color: '#9333ea', fontWeight: '700' }}>Verified wealth accounts</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', background: 'white', padding: '12px 20px', borderRadius: '16px', border: '1px solid var(--border-dark)', boxShadow: 'var(--shadow-premium)' }}>
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', padding: '4px 0' }}>
          {[
            { key: 'all', label: 'All Prospects' },
            { key: 'Hot Lead', label: '🔥 Hot Leads' },
            { key: 'Warm Prospect', label: '⚡ Warm Prospects' },
            { key: 'High Net Worth', label: '💎 High Net Worth' },
            { key: 'Diaspora Buyer', label: '🌍 Diaspora Buyers' },
          ].map((filter) => (
            <button
              key={filter.key}
              onClick={() => setActiveFilter(filter.key)}
              style={{
                padding: '8px 18px',
                borderRadius: '10px',
                border: filter.key === activeFilter ? '1px solid var(--primary)' : '1px solid var(--border-dark)',
                fontSize: '13px',
                fontWeight: '700',
                background: filter.key === activeFilter ? 'var(--primary-glow)' : 'transparent',
                color: filter.key === activeFilter ? 'var(--primary)' : 'var(--text-muted)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap'
              }}
            >
              {filter.label}
            </button>
          ))}
        </div>
        <div style={{ position: 'relative', width: '100%', maxWidth: '380px' }}>
          <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Search prospect name, email or project..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ 
              width: '100%', padding: '12px 16px 12px 48px', borderRadius: '12px', 
              border: '1px solid var(--border-dark)', fontSize: '13px', 
              background: '#f8fafc', fontWeight: '500', outline: 'none', color: 'var(--text-main)'
            }} 
          />
        </div>
      </div>

      {/* Prospects Grid / List Display */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(350px, 1fr))' : '1fr', 
        gap: '24px' 
      }}>
        {filteredProspects.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', padding: '64px 20px', textAlign: 'center', background: 'white', borderRadius: '20px', border: '1px dashed var(--border-dark)' }}>
            <UserCheck size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 16px', opacity: 0.5 }} />
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-main)', marginBottom: '4px' }}>No Prospects Found</h3>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Try adjusting your search query or filter category.</p>
          </div>
        ) : (
          filteredProspects.map((prospect) => {
            const statusConfig = getStatusConfig(prospect.status);
            const StatusIcon = statusConfig.icon;
            const catColor = getCategoryColor(prospect.category);

            return (
              <motion.div
                key={prospect.id}
                variants={item}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className="glass-card-premium"
                style={{ padding: '24px', borderRadius: '24px', display: 'flex', flexDirection: 'column', gap: '20px', background: 'white', border: '1px solid rgba(0,0,0,0.06)' }}
              >
                {/* Header Profile Section */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                    <img src={prospect.avatar} alt={prospect.name} style={{ width: '48px', height: '48px', borderRadius: '16px', border: '2px solid white', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }} />
                    <div>
                      <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-main)' }}>{prospect.name}</h3>
                      <span style={{ 
                        padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '700',
                        backgroundColor: catColor.bg, color: catColor.text, display: 'inline-block', marginTop: '4px'
                      }}>
                        {prospect.category}
                      </span>
                    </div>
                  </div>
                  <span style={{ 
                    padding: '6px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '800',
                    backgroundColor: statusConfig.bg, color: statusConfig.text, border: `1px solid ${statusConfig.border}`,
                    display: 'flex', alignItems: 'center', gap: '4px'
                  }}>
                    <StatusIcon size={12} /> {prospect.status}
                  </span>
                </div>

                {/* Contact & Interest Box */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '16px', background: '#f8fafc', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-main)', fontWeight: '600' }}>
                    <Mail size={14} style={{ color: 'var(--primary)' }} /> {prospect.email}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-main)', fontWeight: '600' }}>
                    <Phone size={14} style={{ color: 'var(--primary)' }} /> {prospect.phone}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-main)', fontWeight: '700', marginTop: '4px', paddingTop: '10px', borderTop: '1px solid #e2e8f0' }}>
                    <MapPin size={14} style={{ color: '#8b5cf6' }} /> Asset Preference:
                  </div>
                  <span style={{ fontSize: '13px', fontWeight: '800', color: '#8b5cf6', paddingLeft: '22px' }}>{prospect.interest}</span>
                </div>

                {/* Budget & Touchpoints */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Purchasing Budget</span>
                    <span style={{ fontSize: '15px', fontWeight: '800', color: 'var(--primary)' }}>{prospect.budget}</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: '12px', background: 'var(--primary-glow)', borderRadius: '12px', border: '1px dashed var(--primary)' }}>
                    <span style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: '800', textTransform: 'uppercase' }}>Last Touchpoint & Activity</span>
                    <p style={{ fontSize: '13px', color: 'var(--text-main)', fontWeight: '600' }}>{prospect.lastInteraction}</p>
                  </div>
                </div>

                {/* Agent & Footer Actions */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--primary)' }} />
                    Agent: <strong style={{ color: 'var(--text-main)' }}>{prospect.assignedAgent}</strong>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      onClick={() => { setActiveMsgProspect(prospect); setMsgChannel('whatsapp'); }}
                      title="Send Message (WhatsApp/Email)" 
                      style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#f1f5f9', border: '1px solid #e2e8f0', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: '0.2s' }}
                    >
                      <MessageSquare size={16} />
                    </button>
                    <button 
                      onClick={() => { setActiveOfferProspect(prospect); setOfferChannel('whatsapp'); }}
                      title="Send Custom Proposal" 
                      style={{ padding: '8px 16px', borderRadius: '10px', background: 'var(--primary)', border: 'none', color: 'white', fontSize: '12px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', boxShadow: '0 4px 10px rgba(0, 135, 90, 0.3)' }}
                    >
                      <Send size={14} /> Send Offer
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Send Message Modal (WhatsApp or Gmail) */}
      <AnimatePresence>
        {activeMsgProspect && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              style={{ background: 'white', padding: '40px', borderRadius: '28px', width: '540px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <img src={activeMsgProspect.avatar} alt={activeMsgProspect.name} style={{ width: '48px', height: '48px', borderRadius: '14px' }} />
                  <div>
                    <h3 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-main)' }}>Send Direct Message</h3>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '500' }}>{activeMsgProspect.name}</p>
                  </div>
                </div>
                <button onClick={() => setActiveMsgProspect(null)} style={{ background: '#f1f5f9', border: 'none', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', cursor: 'pointer' }}>
                  <X size={20} />
                </button>
              </div>

              {/* Channel Selector Buttons */}
              <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', background: '#f8fafc', padding: '6px', borderRadius: '16px', border: '1px solid var(--border-dark)' }}>
                <button 
                  type="button" 
                  onClick={() => setMsgChannel('whatsapp')}
                  style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', background: msgChannel === 'whatsapp' ? '#25d366' : 'transparent', color: msgChannel === 'whatsapp' ? 'white' : 'var(--text-muted)', fontSize: '14px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', transition: '0.2s', boxShadow: msgChannel === 'whatsapp' ? '0 4px 12px rgba(37, 211, 102, 0.3)' : 'none' }}
                >
                  <MessageCircle size={18} /> Send via WhatsApp
                </button>
                <button 
                  type="button" 
                  onClick={() => setMsgChannel('email')}
                  style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', background: msgChannel === 'email' ? '#ea4335' : 'transparent', color: msgChannel === 'email' ? 'white' : 'var(--text-muted)', fontSize: '14px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', transition: '0.2s', boxShadow: msgChannel === 'email' ? '0 4px 12px rgba(234, 67, 53, 0.3)' : 'none' }}
                >
                  <Mail size={18} /> Send via Gmail / Email
                </button>
              </div>

              <div style={{ padding: '12px 16px', background: msgChannel === 'whatsapp' ? '#f0fdf4' : '#fef2f2', borderRadius: '12px', marginBottom: '20px', fontSize: '13px', fontWeight: '600', color: msgChannel === 'whatsapp' ? '#16a34a' : '#dc2626', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'currentColor' }} />
                Target Contact: {msgChannel === 'whatsapp' ? activeMsgProspect.phone : activeMsgProspect.email}
              </div>

              <form onSubmit={handleSendMessage} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Message Body</label>
                  <textarea name="msgText" rows="4" placeholder="Type your follow-up message..." defaultValue={`Hi ${activeMsgProspect.name.split(' ')[0]},\nFollowing up on your interest in ${activeMsgProspect.interest}. Please let me know a good time for a quick phone call or viewing schedule.`} required style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-dark)', fontSize: '14px', fontWeight: '500', background: '#f8fafc' }}></textarea>
                </div>
                
                <button type="submit" style={{ backgroundColor: msgChannel === 'whatsapp' ? '#25d366' : '#ea4335', color: 'white', border: 'none', padding: '16px', borderRadius: '14px', fontSize: '15px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: `0 10px 20px -5px ${msgChannel === 'whatsapp' ? 'rgba(37, 211, 102, 0.4)' : 'rgba(234, 67, 53, 0.4)'}` }}>
                  {msgChannel === 'whatsapp' ? <MessageCircle size={18} /> : <Mail size={18} />} Dispatch via {msgChannel === 'whatsapp' ? 'WhatsApp' : 'Gmail'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Send Custom Proposal Offer Modal */}
      <AnimatePresence>
        {activeOfferProspect && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              style={{ background: 'white', padding: '40px', borderRadius: '28px', width: '600px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                  <h3 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-main)' }}>Send Investment Proposal Offer</h3>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '500', marginTop: '2px' }}>Generate and transmit structured proposal directly via WhatsApp or Gmail</p>
                </div>
                <button onClick={() => setActiveOfferProspect(null)} style={{ background: '#f1f5f9', border: 'none', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', cursor: 'pointer' }}>
                  <X size={20} />
                </button>
              </div>

              {/* Channel Selector Buttons */}
              <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', background: '#f8fafc', padding: '6px', borderRadius: '16px', border: '1px solid var(--border-dark)' }}>
                <button 
                  type="button" 
                  onClick={() => setOfferChannel('whatsapp')}
                  style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', background: offerChannel === 'whatsapp' ? '#25d366' : 'transparent', color: offerChannel === 'whatsapp' ? 'white' : 'var(--text-muted)', fontSize: '14px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', transition: '0.2s', boxShadow: offerChannel === 'whatsapp' ? '0 4px 12px rgba(37, 211, 102, 0.3)' : 'none' }}
                >
                  <MessageCircle size={18} /> Dispatch via WhatsApp
                </button>
                <button 
                  type="button" 
                  onClick={() => setOfferChannel('email')}
                  style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', background: offerChannel === 'email' ? '#ea4335' : 'transparent', color: offerChannel === 'email' ? 'white' : 'var(--text-muted)', fontSize: '14px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', transition: '0.2s', boxShadow: offerChannel === 'email' ? '0 4px 12px rgba(234, 67, 53, 0.3)' : 'none' }}
                >
                  <Mail size={18} /> Dispatch via Gmail / Email
                </button>
              </div>

              <div style={{ padding: '16px 20px', background: offerChannel === 'whatsapp' ? '#f0fdf4' : '#fef2f2', borderRadius: '16px', marginBottom: '24px', border: `1px solid ${offerChannel === 'whatsapp' ? '#bbf7d0' : '#fecaca'}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <img src={activeOfferProspect.avatar} alt={activeOfferProspect.name} style={{ width: '44px', height: '44px', borderRadius: '12px' }} />
                  <div>
                    <h4 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-main)' }}>{activeOfferProspect.name}</h4>
                    <p style={{ fontSize: '13px', color: offerChannel === 'whatsapp' ? '#16a34a' : '#dc2626', fontWeight: '700' }}>
                      {offerChannel === 'whatsapp' ? `WhatsApp: ${activeOfferProspect.phone}` : `Email: ${activeOfferProspect.email}`}
                    </p>
                  </div>
                </div>
                <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--primary)', padding: '6px 12px', background: 'white', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                  {activeOfferProspect.interest}
                </span>
              </div>

              <form onSubmit={handleSendOffer} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Proposed Valuation (₵)</label>
                    <input name="offerPrice" type="number" defaultValue={activeOfferProspect.minBudget} required style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-dark)', fontSize: '14px', fontWeight: '800', color: 'var(--primary)', background: '#f8fafc' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Validity Expiration</label>
                    <input name="offerValidity" type="text" defaultValue="30 Days from Dispatch" required style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-dark)', fontSize: '14px', fontWeight: '500', background: '#f8fafc' }} />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Payment Structure / Terms</label>
                  <input name="paymentTerms" type="text" defaultValue="30% Downpayment deposit, balance spread over 18 months" required style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-dark)', fontSize: '14px', fontWeight: '500', background: '#f8fafc' }} />
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Executive Summary & Attachment Note</label>
                  <textarea name="proposalMsg" rows="4" placeholder="Dear Client, attached is our official executive quotation and architectural breakdown..." defaultValue={`Dear ${activeOfferProspect.name.split(' ')[0]},\nWe are pleased to present our official investment schedule for ${activeOfferProspect.interest}. Attached is the complete architectural layout and payment plan.`} required style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-dark)', fontSize: '14px', fontWeight: '500', background: '#f8fafc' }}></textarea>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', borderRadius: '12px', background: '#f0fdf4', color: '#16a34a', border: '1px dashed #bbf7d0', fontSize: '13px', fontWeight: '600' }}>
                  <FileText size={18} /> Automatic inclusions: Titled Indenture Draft, Brochure & Floor Plan.
                </div>

                <button type="submit" style={{ backgroundColor: offerChannel === 'whatsapp' ? '#25d366' : '#ea4335', color: 'white', border: 'none', padding: '16px', borderRadius: '14px', fontSize: '15px', fontWeight: '800', marginTop: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: `0 10px 20px -5px ${offerChannel === 'whatsapp' ? 'rgba(37, 211, 102, 0.4)' : 'rgba(234, 67, 53, 0.4)'}` }}>
                  <Send size={18} /> Transmit Offer via {offerChannel === 'whatsapp' ? 'WhatsApp' : 'Gmail'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Register New Prospect Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              style={{ background: 'white', padding: '40px', borderRadius: '28px', width: '580px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                  <h3 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-main)' }}>Register New VIP Prospect</h3>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '500', marginTop: '4px' }}>Add a verified buyer profile, purchasing capacity, contact details and CRM notes</p>
                </div>
                <button onClick={() => setShowAddModal(false)} style={{ background: '#f1f5f9', border: 'none', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', cursor: 'pointer' }}>
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleAddProspect} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Full Name / Corporate Entity</label>
                  <input name="name" type="text" placeholder="e.g. Samuel Kojo-Mensah" required style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-dark)', fontSize: '14px', fontWeight: '500', background: '#f8fafc' }} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Email Address (Gmail / Corporate)</label>
                    <input name="email" type="email" placeholder="e.g. samuel@holdings.com" required style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-dark)', fontSize: '14px', fontWeight: '500', background: '#f8fafc' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>WhatsApp / Contact Phone</label>
                    <input name="phone" type="text" placeholder="+233 24 123 4567" required style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-dark)', fontSize: '14px', fontWeight: '500', background: '#f8fafc' }} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Buyer Classification</label>
                    <select name="category" required style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-dark)', fontSize: '14px', fontWeight: '600', background: '#f8fafc' }}>
                      <option value="High Net Worth">High Net Worth</option>
                      <option value="Institutional Investor">Institutional Investor</option>
                      <option value="VIP Buyer">VIP Buyer</option>
                      <option value="Diaspora Buyer">Diaspora Buyer</option>
                      <option value="First-Time Buyer">First-Time Buyer</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>CRM Lead Status</label>
                    <select name="status" required style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-dark)', fontSize: '14px', fontWeight: '600', background: '#f8fafc' }}>
                      <option value="Hot Lead">🔥 Hot Lead</option>
                      <option value="Warm Prospect">⚡ Warm Prospect</option>
                      <option value="Nurture">❄️ Long-Term Nurture</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Min. Budget Cap (₵)</label>
                    <input name="minBudget" type="number" placeholder="1500000" defaultValue="1500000" required style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-dark)', fontSize: '14px', fontWeight: '500', background: '#f8fafc' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Max. Budget Cap (₵)</label>
                    <input name="maxBudget" type="number" placeholder="2500000" defaultValue="2500000" required style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-dark)', fontSize: '14px', fontWeight: '500', background: '#f8fafc' }} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Target Asset Interest</label>
                    <select name="interest" required style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-dark)', fontSize: '14px', fontWeight: '600', background: '#f8fafc' }}>
                      <option value="Sunset Hills Luxury Villas">Sunset Hills Luxury Villas</option>
                      <option value="Green Valley Eco Estate (Land)">Green Valley Eco Estate (Land)</option>
                      <option value="The Apex Commercial Tower">The Apex Commercial Tower</option>
                      <option value="Palm Breeze Beach Residences">Palm Breeze Beach Residences</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Assigned Account Agent</label>
                    <select name="agent" required style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-dark)', fontSize: '14px', fontWeight: '600', background: '#f8fafc' }}>
                      <option value="Louis Kemenyo">Louis Kemenyo</option>
                      <option value="Pam Beesly">Pam Beesly</option>
                      <option value="Dwight Schrute">Dwight Schrute</option>
                      <option value="Phyllis Vance">Phyllis Vance</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Initial CRM Activity Notes</label>
                  <textarea name="notes" rows="3" placeholder="e.g. Attended London Property roadshow, requested 4BR villa layout & mortgage terms..." style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-dark)', fontSize: '14px', fontWeight: '500', background: '#f8fafc' }}></textarea>
                </div>

                <button type="submit" style={{ backgroundColor: 'var(--primary)', color: 'white', border: 'none', padding: '16px', borderRadius: '14px', fontSize: '15px', fontWeight: '800', marginTop: '12px', cursor: 'pointer', boxShadow: '0 10px 20px -5px rgba(0, 135, 90, 0.4)', transition: 'all 0.2s' }}>
                  Register Verified VIP Prospect
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Buyers;
