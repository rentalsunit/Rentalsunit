import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, Plus, Search, Filter, MapPin, 
  Home, Users, CreditCard, ChevronRight, 
  LayoutGrid, List, MoreVertical, TrendingUp, 
  X, Check, Server, Eye, Key, DollarSign, 
  Layers, Maximize2, Shield, CheckCircle2, 
  AlertCircle, UserCheck, Hash, Wrench, ArrowUpRight,
  Trash2, Edit3, Save, UserMinus, UserPlus, Calculator
} from 'lucide-react';
import { getThemedAsset } from '../lib/themeImages';
import { getStoredProperties, saveStoredProperties, getStoredUnits, saveStoredUnits, getStoredLeases, saveStoredLeases, getStoredTenants, saveStoredTenants } from '../lib/masterData';

const RentalProperties = () => {
  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('All');
  const [showAddPropModal, setShowAddPropModal] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Master Data States
  const [properties, setProperties] = useState(getStoredProperties());
  const [units, setUnits] = useState(getStoredUnits());

  // Edit Master Property State
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPropToEdit, setSelectedPropToEdit] = useState(null);

  // Modal inspection state for viewing assigned rental units
  const [selectedPropertyForUnits, setSelectedPropertyForUnits] = useState(null);
  
  // Quick Add Unit inside property inspection modal
  const [showQuickAddUnit, setShowQuickAddUnit] = useState(false);
  const [quickUnitId, setQuickUnitId] = useState('');
  const [quickUnitType, setQuickUnitType] = useState('🏢 2 Bedroom Apartment');
  const [quickUnitPrice, setQuickUnitPrice] = useState('4500');
  const [quickUnitSqft, setQuickUnitSqft] = useState('1,200 sq.ft');
  const [quickUnitHvac, setQuickUnitHvac] = useState('Dual Inverter Split AC');

  // Sync state across tabs
  useEffect(() => {
    const syncData = () => {
      setProperties(getStoredProperties());
      setUnits(getStoredUnits());
    };
    window.addEventListener('realtyos_rental_update', syncData);
    window.addEventListener('storage', syncData);
    return () => {
      window.removeEventListener('realtyos_rental_update', syncData);
      window.removeEventListener('storage', syncData);
    };
  }, []);

  const handleAddPropertySubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const nameVal = formData.get('name');
    const typeVal = formData.get('type');
    const locationVal = formData.get('location');
    const unitsAllocVal = parseInt(formData.get('units')) || 12;
    const themed = getThemedAsset(nameVal, typeVal, locationVal);

    const newProp = {
      id: properties.length > 0 ? Math.max(...properties.map(p => p.id)) + 1 : 1,
      name: nameVal,
      location: locationVal,
      units: unitsAllocVal,
      status: 'Active Asset',
      type: typeVal,
      image: themed.image,
      icon: themed.icon
    };

    const updatedProps = [newProp, ...properties];
    saveStoredProperties(updatedProps);
    setShowAddPropModal(false);
    setSuccessMsg(`Successfully registered asset "${nameVal}" into portfolio!`);
    setTimeout(() => setSuccessMsg(''), 5000);
  };

  const handleDeleteProperty = (propId, propName) => {
    if (window.confirm(`⚠️ CONFIRMATION SAFEGUARD: Are you absolutely sure you want to permanently delete "${propName}" from the master property portfolio?`)) {
      const updatedProps = properties.filter(p => p.id !== propId && p.name !== propName);
      saveStoredProperties(updatedProps);
      setProperties(updatedProps);
      if (selectedPropertyForUnits && (selectedPropertyForUnits.id === propId || selectedPropertyForUnits.name === propName)) {
        setSelectedPropertyForUnits(null);
      }
      setSuccessMsg(`Master Property "${propName}" successfully deleted.`);
      setTimeout(() => setSuccessMsg(''), 5000);
    }
  };

  const handleEditPropertySubmit = (e) => {
    e.preventDefault();
    if (!selectedPropToEdit) return;
    const formData = new FormData(e.target);
    const nameVal = formData.get('name');
    const typeVal = formData.get('type');
    const locationVal = formData.get('location');
    const unitsVal = parseInt(formData.get('units')) || selectedPropToEdit.units;
    const themed = getThemedAsset(nameVal, typeVal, locationVal);

    const oldName = selectedPropToEdit.name;

    const updatedProps = properties.map(p => {
      if (p.id === selectedPropToEdit.id) {
        return {
          ...p,
          name: nameVal,
          type: typeVal,
          location: locationVal,
          units: unitsVal,
          image: p.image || themed.image,
          icon: p.icon || themed.icon
        };
      }
      return p;
    });
    saveStoredProperties(updatedProps);
    setProperties(updatedProps);

    if (oldName !== nameVal) {
      const currentUnits = getStoredUnits();
      const updatedUnits = currentUnits.map(u => u.property === oldName ? { ...u, property: nameVal } : u);
      saveStoredUnits(updatedUnits);
      setUnits(updatedUnits);
    }

    if (selectedPropertyForUnits && selectedPropertyForUnits.id === selectedPropToEdit.id) {
      setSelectedPropertyForUnits(updatedProps.find(p => p.id === selectedPropToEdit.id));
    }

    setShowEditModal(false);
    setSelectedPropToEdit(null);
    setSuccessMsg(`Master Property "${nameVal}" successfully modified.`);
    setTimeout(() => setSuccessMsg(''), 5000);
  };

  const handleDelinkUnitDirectly = (unitId, tenantName) => {
    if (window.confirm(`⚠️ CONFIRMATION SAFEGUARD: Are you sure you want to delink tenant "${tenantName}" from Unit ${unitId} and reset its status to Available?`)) {
      const updatedUnits = units.map(u => {
        if (u.id === unitId) {
          return { ...u, status: 'Available', tenant: '-', lastPaid: '-' };
        }
        return u;
      });
      saveStoredUnits(updatedUnits);
      setUnits(updatedUnits);

      const currentLeases = getStoredLeases();
      const updatedLeases = currentLeases.map(l => {
        if (l.unit === unitId || l.tenant === tenantName) {
          return { ...l, status: 'Terminated', end: new Date().toISOString().split('T')[0] };
        }
        return l;
      });
      saveStoredLeases(updatedLeases);

      const currentTenants = getStoredTenants();
      const updatedTenants = currentTenants.map(t => {
        if (t.unit === unitId || t.name === tenantName) {
          return { ...t, unit: '-', property: '-', status: 'Registered / Unassigned', rentStatus: 'No Active Lease' };
        }
        return t;
      });
      saveStoredTenants(updatedTenants);

      setSuccessMsg(`Unit ${unitId} successfully delinked from ${tenantName} and reset to Available.`);
      setTimeout(() => setSuccessMsg(''), 5000);
    }
  };

  const handleQuickAddUnitSubmit = (e) => {
    e.preventDefault();
    if (!selectedPropertyForUnits || !quickUnitId) return;

    const themed = getThemedAsset(quickUnitId, quickUnitType, selectedPropertyForUnits.name);
    const newUnit = {
      id: quickUnitId,
      property: selectedPropertyForUnits.name,
      type: quickUnitType,
      price: `₵ ${parseInt(quickUnitPrice).toLocaleString()}`,
      status: 'Available',
      tenant: '-',
      lastPaid: '-',
      sqft: quickUnitSqft.includes('sq.ft') ? quickUnitSqft : `${quickUnitSqft} sq.ft`,
      hvac: quickUnitHvac,
      inspection: 'Verified Asset',
      amenities: ['Ceiling Fan', 'Fitted Built-in Wardrobe', 'Inverter Air Conditioner (AC)', 'Water Heater System', 'Prepaid Electricity Meter', 'Walled & Gated Perimeter Security'],
      icon: themed.icon,
      image: themed.image
    };

    const updatedUnits = [newUnit, ...units];
    saveStoredUnits(updatedUnits);
    setUnits(updatedUnits);

    const updatedProps = properties.map(p => {
      if (p.name === selectedPropertyForUnits.name) {
        return { ...p, units: p.units + 1 };
      }
      return p;
    });
    saveStoredProperties(updatedProps);
    setProperties(updatedProps);

    setQuickUnitId('');
    setShowQuickAddUnit(false);
    setSuccessMsg(`Unit ${newUnit.id} successfully linked to ${selectedPropertyForUnits.name}!`);
    setTimeout(() => setSuccessMsg(''), 5000);
  };

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.23, 1, 0.32, 1] } }
  };

  const categories = ['All', 'Apartment', 'Shop', 'Office', 'Villa'];

  const filteredProperties = properties.filter(prop => {
    const matchesSearch = prop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          prop.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          prop.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategoryFilter === 'All' || prop.type.toLowerCase().includes(activeCategoryFilter.toLowerCase());
    return matchesSearch && matchesCategory;
  });

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      style={{ display: 'flex', flexDirection: 'column', gap: '32px', width: '100%' }}
    >
      {/* Floating Success Banner */}
      <AnimatePresence>
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            style={{
              padding: '16px 24px', backgroundColor: '#10b981', color: 'white',
              borderRadius: '20px', display: 'flex', alignItems: 'center',
              justifyContent: 'space-between', boxShadow: '0 12px 30px -8px rgba(16, 185, 129, 0.5)',
              fontWeight: '800', fontSize: '15px', zIndex: 100
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <CheckCircle2 size={22} />
              <span>{successMsg}</span>
            </div>
            <button onClick={() => setSuccessMsg('')} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', opacity: 0.8 }}>
              <X size={20} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Splendid Premium Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '20px', width: '100%' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <span style={{ padding: '6px 14px', borderRadius: '24px', backgroundColor: 'var(--primary-glow)', color: 'var(--primary)', fontSize: '12px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 4px 12px rgba(0, 135, 90, 0.15)' }}>
              <Building2 size={14} /> Splendid Asset & Unit Registry
            </span>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '700' }}>
              • {properties.length} Total Master Properties ({units.length} Linked Rental Units)
            </span>
          </div>
          <h2 style={{ fontSize: '36px', fontWeight: '900', letterSpacing: '-0.8px', color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
            Rental Apartments & Commercial Catalog
          </h2>
          <p style={{ fontSize: '15px', color: 'var(--text-muted)', fontWeight: '600', marginTop: '4px', maxWidth: '800px' }}>
            Comprehensive overview of master rental apartments, shops, and towers. Every property dynamically aggregates linked rental units, occupancy rates, and recurring revenue.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
          <div style={{ display: 'flex', background: 'white', borderRadius: '16px', border: '1px solid var(--border-dark)', padding: '6px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
            <button 
              onClick={() => setViewMode('grid')}
              style={{ padding: '10px 14px', borderRadius: '12px', background: viewMode === 'grid' ? 'var(--primary-glow)' : 'transparent', color: viewMode === 'grid' ? 'var(--primary)' : 'var(--text-muted)', border: 'none', cursor: 'pointer', transition: '0.2s', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '800', fontSize: '13px' }}
            >
              <LayoutGrid size={18} /> Grid
            </button>
            <button 
              onClick={() => setViewMode('list')}
              style={{ padding: '10px 14px', borderRadius: '12px', background: viewMode === 'list' ? 'var(--primary-glow)' : 'transparent', color: viewMode === 'list' ? 'var(--primary)' : 'var(--text-muted)', border: 'none', cursor: 'pointer', transition: '0.2s', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '800', fontSize: '13px' }}
            >
              <List size={18} /> List
            </button>
          </div>
          <motion.button 
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowAddPropModal(true)}
            style={{ 
              backgroundColor: 'var(--primary)', color: 'white', border: 'none', 
              padding: '16px 30px', borderRadius: '16px', display: 'flex', 
              alignItems: 'center', gap: '10px', fontSize: '15px', fontWeight: '900', 
              cursor: 'pointer', boxShadow: '0 12px 25px -5px rgba(0, 135, 90, 0.4)' 
            }}
          >
            <Plus size={22} /> Register Master Property
          </motion.button>
        </div>
      </header>

      {/* Dynamic Search & Category Navigation */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', background: 'white', padding: '16px 20px', borderRadius: '24px', border: '1px solid var(--border-dark)', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
        <div style={{ position: 'relative', flex: '1 1 320px' }}>
          <Search size={20} style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Search master properties by name, location, or architectural style..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ 
              width: '100%', padding: '16px 20px 16px 52px', borderRadius: '16px', 
              border: '1px solid #cbd5e1', fontSize: '15px', color: 'var(--text-main)',
              background: '#f8fafc', fontWeight: '700', outline: 'none', boxSizing: 'border-box'
            }} 
          />
        </div>

        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', padding: '4px 0' }}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategoryFilter(cat)}
              style={{
                padding: '12px 20px', borderRadius: '16px', fontWeight: '800', fontSize: '14px',
                border: activeCategoryFilter === cat ? '2px solid var(--primary)' : '1px solid #cbd5e1',
                background: activeCategoryFilter === cat ? 'var(--primary-glow)' : '#f8fafc',
                color: activeCategoryFilter === cat ? 'var(--primary)' : '#475569',
                cursor: 'pointer', transition: 'all 0.2s ease', whiteSpace: 'nowrap',
                boxShadow: activeCategoryFilter === cat ? '0 6px 15px rgba(0, 135, 90, 0.15)' : 'none'
              }}
            >
              {cat === 'All' ? '🌟 All Assets' : cat === 'Apartment' ? '🏢 Apartments' : cat === 'Shop' ? '🏪 Retail Shops' : cat === 'Office' ? '💼 Offices' : '🏡 Villas'}
            </button>
          ))}
        </div>
      </div>

      {/* Property Cards Grid / List */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(320px, 1fr))' : '1fr', 
        gap: '20px' 
      }}>
        {filteredProperties.map((prop) => {
          // Dynamically compute linked units for this property
          const linkedUnits = units.filter(u => u.property === prop.name);
          const occupiedCount = linkedUnits.filter(u => u.status === 'Occupied').length;
          const availableCount = linkedUnits.filter(u => u.status === 'Available').length;
          const maintenanceCount = linkedUnits.filter(u => u.status === 'Maintenance').length;
          const totalLinked = linkedUnits.length;
          
          // Calculate dynamic revenue from actual linked occupied units
          const dynamicRevenue = linkedUnits
            .filter(u => u.status === 'Occupied')
            .reduce((sum, u) => sum + (parseInt(u.price.replace(/[^0-9]/g, '')) || 0), 0);
          
          const revDisplay = dynamicRevenue > 0 ? `₵ ${dynamicRevenue.toLocaleString()}` : prop.revenue || '₵ 124,000';
          const occPercent = totalLinked > 0 ? Math.round((occupiedCount / totalLinked) * 100) : 85;

          return (
            <motion.div 
              key={prop.id}
              variants={item}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className="glass-card-premium"
              style={{ 
                overflow: 'hidden', display: 'flex', 
                flexDirection: viewMode === 'grid' ? 'column' : 'row', 
                borderRadius: '22px', border: '1px solid #cbd5e1',
                boxShadow: '0 10px 25px -8px rgba(0,0,0,0.06)',
                background: 'white'
              }}
            >
              {/* Asset High-Res Cover Image - Compact */}
              <div style={{ 
                width: viewMode === 'grid' ? '100%' : '260px', 
                height: viewMode === 'grid' ? '170px' : 'auto', 
                position: 'relative', flexShrink: 0, overflow: 'hidden'
              }}>
                <img src={prop.image} alt={prop.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.6s ease' }} />
                <div style={{ inset: 0, position: 'absolute', background: 'linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,0.85) 100%)' }} />
                
                {/* Top Badges - Compact */}
                <div style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(255,255,255,0.95)', padding: '6px 12px', borderRadius: '16px', fontSize: '11px', fontWeight: '900', color: 'var(--primary)', backdropFilter: 'blur(10px)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>{prop.icon || '🏢 Asset'}</span>
                </div>

                <div style={{ position: 'absolute', top: '12px', left: '12px', background: 'rgba(15, 23, 42, 0.85)', padding: '4px 10px', borderRadius: '12px', fontSize: '10px', fontWeight: '800', color: 'white', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Layers size={12} style={{ color: '#60a5fa' }} />
                  <span>{prop.type.split(' ')[1] || 'Portfolio'}</span>
                </div>

                {/* Bottom Title on Image - Compact */}
                <div style={{ position: 'absolute', bottom: '12px', left: '16px', right: '16px', color: 'white' }}>
                  <h3 style={{ fontSize: '20px', fontWeight: '900', margin: '0 0 2px', textShadow: '0 2px 8px rgba(0,0,0,0.5)', lineHeight: '1.2' }}>{prop.name}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#cbd5e1' }}>
                    <MapPin size={13} style={{ color: '#60a5fa' }} />
                    <span style={{ fontSize: '13px', fontWeight: '700' }}>{prop.location}</span>
                  </div>
                </div>
              </div>

              {/* Card Body Specs & Assigned Rental Units Preview - Compact */}
              <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '16px' }}>
                <div>
                  {/* Aggregated Performance Metric Grid - Compact */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '16px' }}>
                    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '10px', borderRadius: '16px', textAlign: 'center' }}>
                      <p style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '800', textTransform: 'uppercase', marginBottom: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                        <Hash size={12} /> Total Units
                      </p>
                      <p style={{ fontSize: '17px', fontWeight: '900', color: '#0f172a', margin: 0 }}>{totalLinked > 0 ? totalLinked : prop.units}</p>
                    </div>
                    <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '10px', borderRadius: '16px', textAlign: 'center' }}>
                      <p style={{ fontSize: '10px', color: '#065f46', fontWeight: '800', textTransform: 'uppercase', marginBottom: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                        <UserCheck size={12} /> Occupied
                      </p>
                      <p style={{ fontSize: '17px', fontWeight: '900', color: '#10b981', margin: 0 }}>{occPercent}%</p>
                    </div>
                    <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', padding: '10px', borderRadius: '16px', textAlign: 'center' }}>
                      <p style={{ fontSize: '10px', color: '#1e3a8a', fontWeight: '800', textTransform: 'uppercase', marginBottom: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                        <DollarSign size={12} /> Income
                      </p>
                      <p style={{ fontSize: '17px', fontWeight: '900', color: '#2563eb', margin: 0 }}>{revDisplay}</p>
                    </div>
                  </div>

                  {/* Splendid Linked Units Interactive Preview Pill - Compact */}
                  <div style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '12px 16px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '11px', fontWeight: '900', color: '#334155', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        📦 Assigned Units Breakdown
                      </span>
                      <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--primary)', background: 'var(--primary-glow)', padding: '2px 8px', borderRadius: '8px' }}>
                        {totalLinked > 0 ? `${totalLinked} Linked` : 'Standard'}
                      </span>
                    </div>

                    {totalLinked > 0 ? (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {linkedUnits.slice(0, 5).map(u => (
                          <span 
                            key={u.id} 
                            style={{ 
                              background: u.status === 'Occupied' ? '#ecfdf5' : u.status === 'Available' ? '#eff6ff' : '#fef3c7',
                              color: u.status === 'Occupied' ? '#047857' : u.status === 'Available' ? '#1d4ed8' : '#b45309',
                              border: u.status === 'Occupied' ? '1px solid #a7f3d0' : u.status === 'Available' ? '1px solid #bfdbfe' : '1px solid #fde68a',
                              padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '4px' 
                            }}
                          >
                            <span>{u.id}</span>
                            <span style={{ opacity: 0.6 }}>({u.type.split(' ')[0]})</span>
                          </span>
                        ))}
                        {linkedUnits.length > 5 && (
                          <span style={{ background: '#e2e8f0', color: '#475569', padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: '900' }}>
                            +{linkedUnits.length - 5} more
                          </span>
                        )}
                      </div>
                    ) : (
                      <p style={{ fontSize: '12px', color: '#64748b', fontWeight: '600', margin: 0, fontStyle: 'italic' }}>
                        No specific unit numbers explicitly linked yet. Click below to inspect.
                      </p>
                    )}
                  </div>
                </div>

                {/* Bottom Action Footer - Compact */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid #f1f5f9' }}>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <span style={{ backgroundColor: '#10b98115', color: '#10b981', padding: '4px 10px', borderRadius: '10px', fontSize: '11px', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <CheckCircle2 size={12} /> Active Sync
                    </span>
                    <button 
                      onClick={() => { setSelectedPropToEdit(prop); setShowEditModal(true); }}
                      title="Edit / Modify Property details"
                      style={{ background: '#f1f5f9', border: 'none', color: '#475569', padding: '6px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                    >
                      <Edit3 size={14} />
                    </button>
                    <button 
                      onClick={() => handleDeleteProperty(prop.id, prop.name)}
                      title="Permanently Delete Property"
                      style={{ background: '#fee2e2', border: 'none', color: '#ef4444', padding: '6px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  
                  <motion.button 
                    whileHover={{ scale: 1.03, backgroundColor: 'var(--primary)', color: 'white' }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setSelectedPropertyForUnits(prop)}
                    style={{ 
                      padding: '10px 18px', borderRadius: '14px', backgroundColor: 'var(--primary-glow)', 
                      border: '2px solid var(--primary)', color: 'var(--primary)', fontWeight: '900', 
                      fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', 
                      gap: '6px', transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(0, 135, 90, 0.15)' 
                    }}
                  >
                    <Eye size={16} /> View Linked Units <ChevronRight size={14} />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Register Master Property Modal */}
      <AnimatePresence>
        {showAddPropModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200, padding: '24px' }}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              style={{ background: 'white', padding: '48px', borderRadius: '32px', width: '100%', maxWidth: '720px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '20px', marginBottom: '28px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '20px', background: '#ecfdf5', color: '#00875a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Building2 size={28} />
                  </div>
                  <div>
                    <span style={{ padding: '4px 12px', background: '#f1f5f9', color: '#475569', borderRadius: '14px', fontSize: '11px', fontWeight: '900', textTransform: 'uppercase' }}>Portfolio Registry</span>
                    <h3 style={{ margin: '6px 0 0', fontSize: '24px', fontWeight: '900', color: '#0f172a' }}>Register New Master Property</h3>
                  </div>
                </div>
                <button onClick={() => setShowAddPropModal(false)} style={{ background: '#f1f5f9', border: 'none', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', cursor: 'pointer' }}>
                  <X size={20} />
                </button>
              </div>

              {/* STORAGE OPTIMIZATION NOTICE */}
              <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', padding: '16px 20px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '14px', fontSize: '13px', color: '#1e3a8a', fontWeight: '800', marginBottom: '28px' }}>
                <Server size={24} style={{ flexShrink: 0, color: '#2563eb' }} />
                <span>
                  💡 <strong>Supabase Storage Quota Optimization Active:</strong> Custom image URL and file uploads are disabled to save cloud space. The system automatically scans the property name and classification (Shop, Store, Apartment, Villa, Office) and attaches premium high-resolution themed architectural artwork.
                </span>
              </div>
              
              <form onSubmit={handleAddPropertySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '8px', display: 'block' }}>Property / Development Name</label>
                  <input name="name" type="text" placeholder="e.g. Osu Oxford Street Retail Hub or Sapphire Gardens" required style={{ width: '100%', padding: '16px 20px', borderRadius: '16px', border: '1px solid #cbd5e1', fontSize: '15px', fontWeight: '800', background: '#f8fafc', boxSizing: 'border-box', outline: 'none' }} />
                </div>
                
                <div>
                  <label style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '8px', display: 'block' }}>Location / Address</label>
                  <input name="location" type="text" placeholder="e.g. Labone, Accra" required style={{ width: '100%', padding: '16px 20px', borderRadius: '16px', border: '1px solid #cbd5e1', fontSize: '15px', fontWeight: '800', background: '#f8fafc', boxSizing: 'border-box', outline: 'none' }} />
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div>
                    <label style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '8px', display: 'block' }}>Property Category Classification</label>
                    <select name="type" required style={{ width: '100%', padding: '16px 20px', borderRadius: '16px', border: '2px solid var(--primary)', fontSize: '15px', fontWeight: '800', background: '#f8fafc', outline: 'none', cursor: 'pointer' }}>
                      <option value="🏪 Commercial Shop / Retail Store">🏪 Commercial Shop / Retail Store</option>
                      <option value="🏢 Residential Apartment Complex">🏢 Residential Apartment Complex</option>
                      <option value="🏡 Luxury Standalone Villa Estate">🏡 Luxury Standalone Villa Estate</option>
                      <option value="💼 Commercial Office Tower">💼 Commercial Office Tower</option>
                      <option value="🏭 Industrial Storage / Warehouse">🏭 Industrial Storage / Warehouse</option>
                      <option value="🏗️ Mixed Use Commercial">🏗️ Mixed Use Commercial</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '8px', display: 'block' }}>Total Allocated Units</label>
                    <input name="units" type="number" placeholder="24" defaultValue="12" required style={{ width: '100%', padding: '16px 20px', borderRadius: '16px', border: '1px solid #cbd5e1', fontSize: '15px', fontWeight: '800', background: '#f8fafc', boxSizing: 'border-box', outline: 'none' }} />
                  </div>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginTop: '12px' }}>
                  <button type="button" onClick={() => setShowAddPropModal(false)} style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', color: '#475569', padding: '16px 28px', borderRadius: '16px', fontWeight: '800', fontSize: '15px', cursor: 'pointer' }}>Cancel</button>
                  <button type="submit" style={{ backgroundColor: 'var(--primary)', color: 'white', border: 'none', padding: '16px 36px', borderRadius: '16px', fontSize: '15px', fontWeight: '800', cursor: 'pointer', boxShadow: '0 10px 25px rgba(0, 135, 90, 0.4)' }}>
                    Auto-Classify & Register Property
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Master Property Modal */}
      <AnimatePresence>
        {showEditModal && selectedPropToEdit && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1300, padding: '24px' }}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              style={{ background: 'white', padding: '48px', borderRadius: '32px', width: '100%', maxWidth: '720px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '20px', marginBottom: '28px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '20px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Edit3 size={28} />
                  </div>
                  <div>
                    <span style={{ padding: '4px 12px', background: '#f1f5f9', color: '#475569', borderRadius: '14px', fontSize: '11px', fontWeight: '900', textTransform: 'uppercase' }}>Modify Asset</span>
                    <h3 style={{ margin: '6px 0 0', fontSize: '24px', fontWeight: '900', color: '#0f172a' }}>Edit Master Property Specs</h3>
                  </div>
                </div>
                <button onClick={() => setShowEditModal(false)} style={{ background: '#f1f5f9', border: 'none', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', cursor: 'pointer' }}>
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleEditPropertySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '8px', display: 'block' }}>Property / Development Name</label>
                  <input name="name" type="text" defaultValue={selectedPropToEdit.name} required style={{ width: '100%', padding: '16px 20px', borderRadius: '16px', border: '1px solid #cbd5e1', fontSize: '15px', fontWeight: '800', background: '#f8fafc', boxSizing: 'border-box', outline: 'none' }} />
                </div>
                
                <div>
                  <label style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '8px', display: 'block' }}>Location / Address</label>
                  <input name="location" type="text" defaultValue={selectedPropToEdit.location} required style={{ width: '100%', padding: '16px 20px', borderRadius: '16px', border: '1px solid #cbd5e1', fontSize: '15px', fontWeight: '800', background: '#f8fafc', boxSizing: 'border-box', outline: 'none' }} />
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div>
                    <label style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '8px', display: 'block' }}>Property Category Classification</label>
                    <select name="type" defaultValue={selectedPropToEdit.type} required style={{ width: '100%', padding: '16px 20px', borderRadius: '16px', border: '2px solid var(--primary)', fontSize: '15px', fontWeight: '800', background: '#f8fafc', outline: 'none', cursor: 'pointer' }}>
                      <option value="🏪 Commercial Shop / Retail Store">🏪 Commercial Shop / Retail Store</option>
                      <option value="🏢 Residential Apartment Complex">🏢 Residential Apartment Complex</option>
                      <option value="🏡 Luxury Standalone Villa Estate">🏡 Luxury Standalone Villa Estate</option>
                      <option value="💼 Commercial Office Tower">💼 Commercial Office Tower</option>
                      <option value="🏭 Industrial Storage / Warehouse">🏭 Industrial Storage / Warehouse</option>
                      <option value="🏗️ Mixed Use Commercial">🏗️ Mixed Use Commercial</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '8px', display: 'block' }}>Total Allocated Units</label>
                    <input name="units" type="number" defaultValue={selectedPropToEdit.units} required style={{ width: '100%', padding: '16px 20px', borderRadius: '16px', border: '1px solid #cbd5e1', fontSize: '15px', fontWeight: '800', background: '#f8fafc', boxSizing: 'border-box', outline: 'none' }} />
                  </div>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginTop: '12px' }}>
                  <button type="button" onClick={() => setShowEditModal(false)} style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', color: '#475569', padding: '16px 28px', borderRadius: '16px', fontWeight: '800', fontSize: '15px', cursor: 'pointer' }}>Cancel</button>
                  <button type="submit" style={{ backgroundColor: 'var(--primary)', color: 'white', border: 'none', padding: '16px 36px', borderRadius: '16px', fontSize: '15px', fontWeight: '800', cursor: 'pointer', boxShadow: '0 10px 25px rgba(0, 135, 90, 0.4)' }}>
                    Save Modifications
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* BREATHTAKING ASSIGNED RENTAL UNITS MASTER MODAL */}
      <AnimatePresence>
        {selectedPropertyForUnits && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200, padding: '24px' }}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              style={{ background: 'white', padding: '48px', borderRadius: '32px', width: '100%', maxWidth: '1200px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', border: '1px solid #cbd5e1', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: '32px' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #e2e8f0', paddingBottom: '24px' }}>
                <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                  <div style={{ width: '70px', height: '70px', borderRadius: '24px', background: 'var(--primary-glow)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', boxShadow: '0 8px 20px rgba(0, 135, 90, 0.2)' }}>
                    {selectedPropertyForUnits.icon ? selectedPropertyForUnits.icon.split(' ')[0] : '🏢'}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                      <span style={{ padding: '4px 12px', background: '#f1f5f9', color: '#475569', borderRadius: '14px', fontSize: '11px', fontWeight: '900', textTransform: 'uppercase' }}>
                        Linked Units Master Registry
                      </span>
                      <span style={{ fontSize: '13px', color: 'var(--primary)', fontWeight: '800' }}>
                        {selectedPropertyForUnits.location}
                      </span>
                    </div>
                    <h2 style={{ margin: 0, fontSize: '32px', fontWeight: '900', color: '#0f172a' }}>
                      {selectedPropertyForUnits.name}
                    </h2>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <button 
                    onClick={() => { setSelectedPropToEdit(selectedPropertyForUnits); setShowEditModal(true); }}
                    style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', color: '#334155', padding: '10px 18px', borderRadius: '14px', fontSize: '13px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                  >
                    <Edit3 size={16} /> Edit Asset Specs
                  </button>
                  <button 
                    onClick={() => handleDeleteProperty(selectedPropertyForUnits.id, selectedPropertyForUnits.name)}
                    style={{ background: '#fee2e2', border: '1px solid #fca5a5', color: '#ef4444', padding: '10px 18px', borderRadius: '14px', fontSize: '13px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                  >
                    <Trash2 size={16} /> Delete Asset
                  </button>
                  <button onClick={() => { setSelectedPropertyForUnits(null); setShowQuickAddUnit(false); }} style={{ background: '#f1f5f9', border: 'none', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', cursor: 'pointer', fontSize: '20px', marginLeft: '12px' }}>
                    <X size={22} />
                  </button>
                </div>
              </div>

              {/* Aggregated Linked Units Summary */}
              {(() => {
                const linked = units.filter(u => u.property === selectedPropertyForUnits.name);
                const occupied = linked.filter(u => u.status === 'Occupied').length;
                const monthlyRev = linked.filter(u => u.status === 'Occupied').reduce((s, u) => s + (parseInt(u.price.replace(/[^0-9]/g, '')) || 0), 0);
                
                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                      <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', padding: '20px', borderRadius: '24px' }}>
                        <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '800', textTransform: 'uppercase', marginBottom: '6px' }}>Total Linked Units</p>
                        <p style={{ fontSize: '28px', fontWeight: '900', color: '#0f172a', margin: 0 }}>{linked.length}</p>
                      </div>
                      <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '20px', borderRadius: '24px' }}>
                        <p style={{ fontSize: '12px', color: '#065f46', fontWeight: '800', textTransform: 'uppercase', marginBottom: '6px' }}>Occupied Units</p>
                        <p style={{ fontSize: '28px', fontWeight: '900', color: '#10b981', margin: 0 }}>{occupied}</p>
                      </div>
                      <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', padding: '20px', borderRadius: '24px' }}>
                        <p style={{ fontSize: '12px', color: '#1e3a8a', fontWeight: '800', textTransform: 'uppercase', marginBottom: '6px' }}>Available Units</p>
                        <p style={{ fontSize: '28px', fontWeight: '900', color: '#2563eb', margin: 0 }}>{linked.filter(u => u.status === 'Available').length}</p>
                      </div>
                      <div style={{ background: 'var(--primary-glow)', border: '1px solid var(--primary)', padding: '20px', borderRadius: '24px' }}>
                        <p style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: '800', textTransform: 'uppercase', marginBottom: '6px' }}>Monthly Rental Cashflow</p>
                        <p style={{ fontSize: '28px', fontWeight: '900', color: 'var(--primary)', margin: 0 }}>₵ {monthlyRev.toLocaleString()}</p>
                      </div>
                    </div>

                    {/* Quick Add / Create Unit Bar */}
                    <div style={{ background: '#f8fafc', border: '2px dashed var(--primary)', padding: '24px', borderRadius: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                        <div>
                          <h4 style={{ fontSize: '18px', fontWeight: '900', color: '#0f172a', margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Plus size={20} style={{ color: 'var(--primary)' }} /> Link New Rental Unit / Suite to {selectedPropertyForUnits.name}
                          </h4>
                          <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
                            Instantly create and assign a new rental unit or commercial suite. It will sync automatically across all portfolio dashboards.
                          </p>
                        </div>
                        <button 
                          onClick={() => setShowQuickAddUnit(!showQuickAddUnit)} 
                          style={{ background: showQuickAddUnit ? '#fee2e2' : 'var(--primary)', color: showQuickAddUnit ? '#ef4444' : 'white', border: 'none', padding: '12px 24px', borderRadius: '16px', fontSize: '14px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: showQuickAddUnit ? 'none' : '0 8px 20px -5px rgba(0, 135, 90, 0.4)' }}
                        >
                          {showQuickAddUnit ? <><X size={18} /> Hide Panel</> : <><Plus size={18} /> Link New Unit</>}
                        </button>
                      </div>

                      <AnimatePresence>
                        {showQuickAddUnit && (
                          <motion.form 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            onSubmit={handleQuickAddUnitSubmit}
                            style={{ display: 'flex', flexDirection: 'column', gap: '16px', borderTop: '1px solid #cbd5e1', paddingTop: '20px' }}
                          >
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px' }}>
                              <div>
                                <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '6px', display: 'block' }}>Unit Number</label>
                                <input type="text" placeholder="e.g. 101-A" value={quickUnitId} onChange={(e) => setQuickUnitId(e.target.value)} required style={{ width: '100%', padding: '12px 14px', borderRadius: '14px', border: '1px solid #cbd5e1', fontSize: '14px', fontWeight: '800', outline: 'none', boxSizing: 'border-box' }} />
                              </div>
                              <div>
                                <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '6px', display: 'block' }}>Unit Layout Type</label>
                                <select value={quickUnitType} onChange={(e) => setQuickUnitType(e.target.value)} style={{ width: '100%', padding: '12px 14px', borderRadius: '14px', border: '1px solid #cbd5e1', fontSize: '14px', fontWeight: '800', outline: 'none', background: 'white' }}>
                                  <option value="🏪 Retail Storefront">🏪 Retail Storefront</option>
                                  <option value="🛏️ Studio Suite">🛏️ Studio Suite</option>
                                  <option value="🏢 1 Bedroom Apt">🏢 1 Bedroom Apt</option>
                                  <option value="🏢 2 Bedroom Apt">🏢 2 Bedroom Apt</option>
                                  <option value="🏢 3 Bedroom Penthouse">🏢 3 Bedroom Penthouse</option>
                                  <option value="🏡 Executive Standalone Villa">🏡 Executive Standalone Villa</option>
                                  <option value="💼 Commercial Office Suite">💼 Commercial Office Suite</option>
                                </select>
                              </div>
                              <div>
                                <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '6px', display: 'block' }}>Monthly Rent (₵)</label>
                                <input type="number" placeholder="4500" value={quickUnitPrice} onChange={(e) => setQuickUnitPrice(e.target.value)} required style={{ width: '100%', padding: '12px 14px', borderRadius: '14px', border: '1px solid #cbd5e1', fontSize: '14px', fontWeight: '800', color: 'var(--primary)', outline: 'none', boxSizing: 'border-box' }} />
                              </div>
                              <div>
                                <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '6px', display: 'block' }}>Square Footage</label>
                                <input type="text" placeholder="1,200 sq.ft" value={quickUnitSqft} onChange={(e) => setQuickUnitSqft(e.target.value)} required style={{ width: '100%', padding: '12px 14px', borderRadius: '14px', border: '1px solid #cbd5e1', fontSize: '14px', fontWeight: '800', outline: 'none', boxSizing: 'border-box' }} />
                              </div>
                              <div>
                                <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '6px', display: 'block' }}>HVAC Specification</label>
                                <input type="text" placeholder="Dual Inverter AC" value={quickUnitHvac} onChange={(e) => setQuickUnitHvac(e.target.value)} required style={{ width: '100%', padding: '12px 14px', borderRadius: '14px', border: '1px solid #cbd5e1', fontSize: '14px', fontWeight: '800', outline: 'none', boxSizing: 'border-box' }} />
                              </div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                              <button type="submit" style={{ background: 'var(--primary)', color: 'white', border: 'none', padding: '12px 28px', borderRadius: '14px', fontSize: '14px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Check size={16} /> Save & Link Unit
                              </button>
                            </div>
                          </motion.form>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Detailed Linked Units Catalog Grid */}
                    <h3 style={{ fontSize: '20px', fontWeight: '900', color: '#0f172a', margin: '8px 0 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>🔑 Itemized Rental Units Inventory</span>
                      <span style={{ fontSize: '13px', background: '#e2e8f0', color: '#334155', padding: '2px 10px', borderRadius: '12px' }}>{linked.length} Total</span>
                    </h3>

                    {linked.length === 0 ? (
                      <div style={{ padding: '64px 20px', textAlign: 'center', background: '#f8fafc', borderRadius: '24px', border: '1px dashed #cbd5e1' }}>
                        <Building2 size={48} style={{ color: '#94a3b8', margin: '0 auto 16px', opacity: 0.5 }} />
                        <h4 style={{ fontSize: '18px', fontWeight: '800', color: '#334155', marginBottom: '6px' }}>No Units Assigned Yet</h4>
                        <p style={{ fontSize: '14px', color: '#64748b', maxWidth: '400px', margin: '0 auto 20px' }}>
                          This property currently has no individual unit numbers assigned. Use the "Link New Unit" button above to register units instantly.
                        </p>
                      </div>
                    ) : (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '20px' }}>
                        {linked.map((unit) => (
                          <div 
                            key={unit.id}
                            style={{ 
                              background: unit.status === 'Occupied' ? '#fcfdfd' : 'white', 
                              border: unit.status === 'Occupied' ? '2px solid #a7f3d0' : '1px solid #cbd5e1', 
                              padding: '24px', borderRadius: '24px', display: 'flex', flexDirection: 'column', gap: '16px',
                              boxShadow: '0 8px 25px -8px rgba(0,0,0,0.06)'
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: unit.status === 'Occupied' ? '#00875a15' : '#f1f5f9', color: unit.status === 'Occupied' ? 'var(--primary)' : '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '18px' }}>
                                  {unit.id.split('-')[0]}
                                </div>
                                <div>
                                  <h4 style={{ fontSize: '20px', fontWeight: '900', color: '#0f172a', margin: '0 0 2px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span>Unit {unit.id}</span>
                                  </h4>
                                  <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '800' }}>{unit.type}</span>
                                </div>
                              </div>
                              <span style={{ 
                                background: unit.status === 'Occupied' ? '#10b98115' : unit.status === 'Available' ? '#3b82f615' : '#f59e0b15',
                                color: unit.status === 'Occupied' ? '#10b981' : unit.status === 'Available' ? '#3b82f6' : '#f59e0b',
                                border: unit.status === 'Occupied' ? '1px solid #10b98130' : unit.status === 'Available' ? '1px solid #3b82f630' : '1px solid #f59e0b30',
                                padding: '6px 14px', borderRadius: '14px', fontSize: '12px', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '6px'
                              }}>
                                {unit.status}
                              </span>
                            </div>

                            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '18px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px' }}>
                                <span style={{ color: '#64748b', fontWeight: '700' }}>Monthly Rental Rate:</span>
                                <span style={{ fontWeight: '900', color: 'var(--primary)', fontSize: '16px' }}>{unit.price}</span>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px' }}>
                                <span style={{ color: '#64748b', fontWeight: '700' }}>Occupying Tenant:</span>
                                <span style={{ fontWeight: '800', color: '#0f172a' }}>{unit.tenant}</span>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px' }}>
                                <span style={{ color: '#64748b', fontWeight: '700' }}>HVAC / Air System:</span>
                                <span style={{ fontWeight: '800', color: '#334155' }}>{unit.hvac || 'Dual Inverter Split AC'}</span>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px' }}>
                                <span style={{ color: '#64748b', fontWeight: '700' }}>Approx. Area:</span>
                                <span style={{ fontWeight: '800', color: '#334155' }}>{unit.sqft}</span>
                              </div>
                            </div>

                            {/* Inclusive Amenities Badges */}
                            <div>
                              <p style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', margin: '0 0 8px' }}>Inclusive Amenities</p>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                {unit.amenities && unit.amenities.map((am, i) => (
                                  <span key={i} style={{ background: '#f1f5f9', color: '#475569', padding: '4px 10px', borderRadius: '10px', fontSize: '11px', fontWeight: '700', border: '1px solid #e2e8f0' }}>
                                    ✓ {am}
                                  </span>
                                ))}
                              </div>
                            </div>

                            {unit.status === 'Occupied' ? (
                              <button 
                                onClick={() => handleDelinkUnitDirectly(unit.id, unit.tenant)}
                                style={{ width: '100%', padding: '12px', marginTop: 'auto', borderRadius: '16px', background: '#fee2e2', color: '#ef4444', border: '1px solid #fca5a5', fontSize: '13px', fontWeight: '900', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.15)' }}
                              >
                                <UserMinus size={16} /> Delink Tenant & Reset Available
                              </button>
                            ) : (
                              <button 
                                onClick={() => {
                                  setSelectedPropertyForUnits(null);
                                  window.dispatchEvent(new CustomEvent('realtyos_navigate', { detail: { tab: 'units' } }));
                                }}
                                style={{ width: '100%', padding: '12px', marginTop: 'auto', borderRadius: '16px', background: 'var(--primary)', color: 'white', border: 'none', fontSize: '13px', fontWeight: '900', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 6px 15px rgba(0, 135, 90, 0.25)' }}
                              >
                                🔗 Execute Lease & Link Resident in Units
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })()}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default RentalProperties;
