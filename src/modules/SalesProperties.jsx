import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, Plus, Search, Filter, MapPin, DollarSign, 
  Home, Map, Store, MoreVertical, LayoutGrid, List, 
  ChevronRight, TrendingUp, X, CheckCircle2, Clock, 
  ArrowUpRight, FileText, Eye, Server, PieChart, Tag, Check, Lock, Handshake, Printer, ArrowDownUp,
  Edit3, Trash2, Unlock, AlertTriangle
} from 'lucide-react';
import { getThemedAsset } from '../lib/themeImages';
import { generateRealPDF } from '../lib/pdfService';
import { getStoredSalesProperties, saveStoredSalesProperties } from '../lib/masterData';
import { getDynamicIconConfig } from './RentalProperties';

const generateIndividualUnits = (prefix, count, defaultPrice, initialSold) => {
  const units = [];
  const numPrice = parseFloat(defaultPrice.replace(/[^0-9.]/g, '')) || 500000;
  
  for (let i = 1; i <= count; i++) {
    const isSold = i <= initialSold;
    units.push({
      id: `u-${i}`,
      name: `${prefix} ${i}`,
      status: isSold ? 'Sold' : 'Available',
      buyer: isSold ? (i % 2 === 1 ? 'Michael Osei-Mensah' : 'Victoria Kemenyo') : '',
      price: numPrice + ((i - 1) * 5000)
    });
  }
  return units;
};

const SalesProperties = ({ setActiveTab }) => {
  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [formCategory, setFormCategory] = useState('Housing Project');
  const [propertyStructure, setPropertyStructure] = useState('Compound Estate'); // 'Compound Estate' or 'Single Standalone'
  const [successMsg, setSuccessMsg] = useState('');

  // Operational Modals
  const [activeManageProperty, setActiveManageProperty] = useState(null);
  const [activeBrochureProperty, setActiveBrochureProperty] = useState(null);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showAddSubUnitModal, setShowAddSubUnitModal] = useState(false);
  const [sortOrder, setSortOrder] = useState('default'); // default, price-low, price-high, units-avail
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [editPropertyData, setEditPropertyData] = useState(null);

  const handleExportPdf = async () => {
    setIsGeneratingPdf(true);
    await generateRealPDF('.brochure-print-area', `Digital_Prospectus_${activeBrochureProperty?.name ? activeBrochureProperty.name.replace(/\s+/g, '_') : 'Brochure'}.pdf`, { orientation: 'p' });
    setIsGeneratingPdf(false);
  };

  // Properties state with localStorage and individual itemized units
  const [properties, setProperties] = useState(() => {
    return getStoredSalesProperties();
  });

  const savePropertiesToStorage = (updatedProps) => {
    setProperties(updatedProps);
    saveStoredSalesProperties(updatedProps);
  };

  const handleDeleteProperty = (propId, propName) => {
    if (!window.confirm(`CRITICAL WARNING: Are you sure you want to permanently delete "${propName}"? This will remove the master property and all its itemized units from the sales catalog.`)) return;
    const updated = properties.filter(p => p.id !== propId);
    savePropertiesToStorage(updated);
    if (activeManageProperty?.id === propId) {
      setActiveManageProperty(null);
    }
    setSuccessMsg(`Successfully deleted sales property "${propName}".`);
    setTimeout(() => setSuccessMsg(''), 5000);
  };

  const handleEditPropertySubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const name = formData.get('name');
    const location = formData.get('location');
    const type = formData.get('type');
    const status = formData.get('status');
    const priceRange = formData.get('priceRange');
    const projectedValue = formData.get('projectedValue');
    const totalUnits = parseInt(formData.get('totalUnits')) || editPropertyData.totalUnits;

    const updatedProps = properties.map(p => {
      if (p.id === editPropertyData.id) {
        let currentUnits = [...(p.individualUnits || [])];
        const prefix = type === 'Land Development' ? 'Plot' : type === 'Commercial Complex' ? 'Suite' : 'Villa';
        if (totalUnits > currentUnits.length) {
          for (let i = currentUnits.length + 1; i <= totalUnits; i++) {
            currentUnits.push({
              id: `u-${i}-${Date.now()}`,
              name: `${prefix} ${i}`,
              status: 'Available',
              buyer: '',
              price: p.numericPrice || 500000
            });
          }
        }
        return {
          ...p,
          name,
          location,
          type,
          status,
          priceRange: priceRange.startsWith('₵') ? priceRange : `₵ ${priceRange}`,
          projectedValue: projectedValue.startsWith('₵') ? projectedValue : `₵ ${projectedValue}`,
          totalUnits,
          individualUnits: currentUnits
        };
      }
      return p;
    });

    savePropertiesToStorage(updatedProps);
    setActiveManageProperty(updatedProps.find(p => p.id === editPropertyData.id));
    setEditPropertyData(null);
    setSuccessMsg(`Successfully updated sales property "${name}"!`);
    setTimeout(() => setSuccessMsg(''), 5000);
  };

  const handleDelinkUnitDirectly = (propId, unitId) => {
    if (!window.confirm("Are you sure you want to delink this unit from its buyer? This will reset the unit status back to 'Available'.")) return;

    const updatedProps = properties.map(p => {
      if (p.id === propId) {
        const newSold = Math.max(0, (p.soldUnits || 1) - 1);
        const newUnits = (p.individualUnits || []).map(u => {
          if (u.id === unitId || u.name === unitId) {
            return { ...u, status: 'Available', buyer: '' };
          }
          return u;
        });
        return { ...p, soldUnits: newSold, individualUnits: newUnits };
      }
      return p;
    });

    savePropertiesToStorage(updatedProps);
    setActiveManageProperty(updatedProps.find(p => p.id === propId));
    setSuccessMsg("Successfully delinked unit and reset status to Available!");
    setTimeout(() => setSuccessMsg(''), 5000);
  };

  // Sync state when coming back from sales or periodically
  useEffect(() => {
    const handleStorageChange = () => {
      setProperties(getStoredSalesProperties());
    };
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('realtyos_sales_props_update', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('realtyos_sales_props_update', handleStorageChange);
    };
  }, []);

  const handleAddProperty = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const type = formData.get('type');
    const name = formData.get('name');
    const location = formData.get('location');
    const status = formData.get('status') || 'Active Sales';
    const themed = getThemedAsset(name, type, location);

    if (propertyStructure === 'Single Standalone') {
      const rawPrice = formData.get('singlePrice') || '500000';
      const numPrice = parseFloat(rawPrice.replace(/[^0-9.]/g, '')) || 500000;
      const priceStr = `₵ ${numPrice.toLocaleString()}`;

      const newProp = {
        id: properties.length + 1,
        name,
        location,
        type,
        priceRange: priceStr,
        numericPrice: numPrice,
        totalUnits: 1,
        soldUnits: 0,
        projectedValue: priceStr,
        status,
        inventory: [`1x Standalone ${type === 'Land Development' ? 'Plot' : type === 'Commercial Complex' ? 'Suite' : 'House'}`],
        individualUnits: [{
          id: `u-std-${Date.now()}`,
          name: `Standalone Unit 1 (${name})`,
          status: 'Available',
          buyer: '',
          price: numPrice
        }],
        image: themed.image,
        icon: themed.icon,
        brochureSpecs: {
          architecturalStyle: themed.description || 'Standalone Premium Property',
          zoning: type === 'Land Development' ? 'Residential / Mixed Land' : 'Single Family / Boutique Commercial',
          title: 'Titled Freehold / Leasehold',
          amenities: ['Private Perimeter Enclosure', 'Direct Road Connection', 'Utility Grid Ready']
        }
      };

      const updated = [newProp, ...properties];
      savePropertiesToStorage(updated);
      setShowModal(false);
      setSuccessMsg(`Successfully registered single standalone property "${name}"!`);
      setTimeout(() => setSuccessMsg(''), 5000);
      return;
    }

    // Compound Estate Development Logic
    const invString = formData.get('inventory');
    let inventoryList = invString ? invString.split(',').map(item => item.trim()).filter(Boolean) : [];
    
    if (type === 'Land Development') {
      const landTitle = formData.get('landTitle');
      const landZoning = formData.get('landZoning');
      const landUtilities = formData.get('landUtilities');
      if (landTitle) inventoryList.push(`Title: ${landTitle}`);
      if (landZoning) inventoryList.push(`Zoning: ${landZoning}`);
      if (landUtilities) inventoryList.push(`Utilities: ${landUtilities}`);
    } else if (inventoryList.length === 0) {
      inventoryList = ['Standard Sub-Properties / Units'];
    }
    
    const count = parseInt(formData.get('totalUnits')) || 20;
    const priceStr = `₵ ${formData.get('priceRange')}`;
    const numPrice = parseFloat(formData.get('priceRange').replace(/[^0-9.]/g, '')) || 500000;
    const unitPrefix = type === 'Land Development' ? 'Plot' : type === 'Commercial Complex' ? 'Suite' : 'Villa';

    const newProp = {
      id: properties.length + 1,
      name,
      location,
      type: type,
      priceRange: priceStr,
      numericPrice: numPrice,
      totalUnits: count,
      soldUnits: 0,
      projectedValue: `₵ ${formData.get('projectedValue')}`,
      status: status,
      inventory: inventoryList,
      individualUnits: generateIndividualUnits(unitPrefix, count, priceStr, 0),
      image: themed.image,
      icon: themed.icon,
      brochureSpecs: {
        architecturalStyle: themed.description || 'Modern Architectural Build',
        zoning: 'Master Residential / Commercial',
        title: 'Titled Indenture Certificate',
        amenities: ['Paved Access', 'Manned Security', 'Solar Provisions', 'High-Speed Broadband']
      }
    };
    
    const updated = [newProp, ...properties];
    savePropertiesToStorage(updated);
    setShowModal(false);
    setFormCategory('Housing Project');
    setSuccessMsg(`Successfully registered compound estate "${name}" with ${count} itemized units/plots!`);
    setTimeout(() => setSuccessMsg(''), 5000);
  };

  const handleAddSubPropertySubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const subId = formData.get('subId');
    const subType = formData.get('subType');
    const subName = `${subId} (${subType})`;
    const subPrice = parseFloat(formData.get('subPrice')) || 500000;

    if (!activeManageProperty) return;

    const newUnit = {
      id: `u-added-${Date.now()}`,
      name: subName,
      status: 'Available',
      buyer: '',
      price: subPrice
    };

    const updatedUnits = [...(activeManageProperty.individualUnits || []), newUnit];
    const newTotalUnits = (activeManageProperty.totalUnits || 0) + 1;
    const newProjectedValNum = updatedUnits.reduce((acc, u) => acc + (u.price || 0), 0);
    const newProjectedValStr = `₵ ${(newProjectedValNum / 1000000).toFixed(1)}M`;

    const updatedProps = properties.map(p => {
      if (p.id === activeManageProperty.id) {
        return {
          ...p,
          totalUnits: newTotalUnits,
          individualUnits: updatedUnits,
          projectedValue: newProjectedValStr
        };
      }
      return p;
    });

    savePropertiesToStorage(updatedProps);
    setActiveManageProperty(updatedProps.find(p => p.id === activeManageProperty.id));
    setShowAddSubUnitModal(false);
    setSuccessMsg(`Successfully added sub-property / unit "${subName}" to ${activeManageProperty.name}!`);
    setTimeout(() => setSuccessMsg(''), 5000);
  };

  const handleExecuteIndividualUnitSale = (prop, unit) => {
    const salePrefill = {
      property: prop.name,
      unit: unit.name,
      price: unit.price || prop.numericPrice || 500000
    };
    localStorage.setItem('realtyos_pending_sale_prefill', JSON.stringify(salePrefill));
    
    setSuccessMsg(`Prefilling sale agreement for ${prop.name} - ${unit.name}... Redirecting to Sales module!`);
    setTimeout(() => {
      if (setActiveTab) setActiveTab('sales');
    }, 600);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Active Sales':
        return { bg: '#10b98115', text: '#10b981', border: '#10b98130' };
      case 'Almost Sold Out':
        return { bg: '#f59e0b15', text: '#f59e0b', border: '#f59e0b30' };
      case 'Pre-Launch':
        return { bg: '#6366f115', text: '#6366f1', border: '#6366f130' };
      default:
        return { bg: '#00875a15', text: '#00875a', border: '#00875a30' };
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'Housing Project': return <Home size={14} />;
      case 'Land Development': return <Map size={14} />;
      case 'Commercial Complex': return <Store size={14} />;
      default: return <Building2 size={14} />;
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  };

  let filteredProperties = properties.filter(prop => {
    const matchesSearch = prop.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          prop.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = activeFilter === 'all' || prop.status === activeFilter;
    return matchesSearch && matchesFilter;
  });

  if (sortOrder === 'price-low') {
    filteredProperties.sort((a, b) => (a.numericPrice || 0) - (b.numericPrice || 0));
  } else if (sortOrder === 'price-high') {
    filteredProperties.sort((a, b) => (b.numericPrice || 0) - (a.numericPrice || 0));
  } else if (sortOrder === 'units-avail') {
    filteredProperties.sort((a, b) => (b.totalUnits - b.soldUnits) - (a.totalUnits - a.soldUnits));
  }

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
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{
              padding: '16px 24px',
              backgroundColor: '#10b981',
              color: 'white',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.4)',
              fontWeight: '700',
              fontSize: '14px',
              zIndex: 100
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <CheckCircle2 size={20} />
              <span>{successMsg}</span>
            </div>
            <button 
              onClick={() => setSuccessMsg('')} 
              style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', opacity: 0.8 }}
            >
              <X size={18} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Banner & Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px', width: '100%' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{ padding: '6px 12px', borderRadius: '20px', backgroundColor: 'var(--primary-glow)', color: 'var(--primary)', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Building2 size={12} /> Splendid Sales Assets & Individual Parcels
            </span>
          </div>
          <h2 style={{ fontSize: '28px', fontWeight: '800', letterSpacing: '-0.5px', color: 'var(--text-main)' }}>Sales Asset Projects & Units Inventory</h2>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: '500', marginTop: '2px' }}>
            Manage compound estates and standalone properties, inspect individual sub-properties or plots, and execute sales agreements.
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
            onClick={() => { setShowModal(true); setFormCategory('Housing Project'); }}
            style={{ 
              backgroundColor: 'var(--primary)', color: 'white', border: 'none', 
              padding: '12px 24px', borderRadius: '12px', display: 'flex', 
              alignItems: 'center', gap: '10px', fontSize: '14px', fontWeight: '800', 
              cursor: 'pointer', boxShadow: '0 10px 20px -5px rgba(0, 135, 90, 0.4)' 
            }}
          >
            <Plus size={20} /> Register Sales Property
          </motion.button>
        </div>
      </header>

      {/* Filter and Search Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', background: 'white', padding: '12px 20px', borderRadius: '16px', border: '1px solid var(--border-dark)', boxShadow: 'var(--shadow-premium)', width: '100%' }}>
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', padding: '4px 0' }}>
          {[
            { key: 'all', label: 'All Catalog Assets' },
            { key: 'Active Sales', label: 'Active Sales' },
            { key: 'Almost Sold Out', label: 'Almost Sold Out' },
            { key: 'Pre-Launch', label: 'Pre-Launch' },
          ].map((filter) => (
            <button
              key={filter.key}
              onClick={() => setActiveFilter(filter.key)}
              style={{
                padding: '8px 18px',
                borderRadius: '10px',
                border: filter.key === activeFilter ? '1px solid var(--primary)' : '1px solid var(--border-dark)',
                fontSize: '13px',
                fontWeight: '800',
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
        <div style={{ display: 'flex', gap: '12px', width: '100%', maxWidth: '420px', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              placeholder="Search projects, location..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ 
                width: '100%', padding: '12px 16px 12px 48px', borderRadius: '12px', 
                border: '1px solid var(--border-dark)', fontSize: '13px', 
                background: '#f8fafc', fontWeight: '500', outline: 'none', color: 'var(--text-main)'
              }} 
            />
          </div>
          <button 
            onClick={() => setShowFilterModal(true)}
            style={{ padding: '12px 16px', borderRadius: '12px', border: sortOrder !== 'default' ? '1px solid var(--primary)' : '1px solid var(--border-dark)', background: sortOrder !== 'default' ? '#ecfdf5' : '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '800', color: sortOrder !== 'default' ? 'var(--primary)' : 'var(--text-muted)', cursor: 'pointer', transition: '0.2s' }}
          >
            <ArrowDownUp size={16} /> {sortOrder === 'default' ? 'Sort / Filter' : 'Sorted'}
          </button>
        </div>
      </div>

      {/* Property Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(350px, 1fr))' : '1fr', 
        gap: '24px',
        width: '100%' 
      }}>
        {filteredProperties.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', padding: '64px 20px', textAlign: 'center', background: 'white', borderRadius: '20px', border: '1px dashed var(--border-dark)' }}>
            <Building2 size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 16px', opacity: 0.5 }} />
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-main)', marginBottom: '4px' }}>No Sales Projects Found</h3>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Try adjusting your search criteria or filter category.</p>
          </div>
        ) : (
          filteredProperties.map((prop) => {
            const statusBadge = getStatusBadge(prop.status);
            const percentSold = prop.totalUnits > 0 ? Math.round((prop.soldUnits / prop.totalUnits) * 100) : 0;
            const vectorConfig = getDynamicIconConfig(prop.type);
            const VectorIcon = vectorConfig.Icon;
            
            return (
              <motion.div 
                key={prop.id}
                variants={item}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className="glass-card-premium"
                style={{ 
                  overflow: 'hidden', 
                  display: 'flex', 
                  flexDirection: viewMode === 'grid' ? 'column' : 'row',
                  borderRadius: '24px',
                  border: '1px solid rgba(0,0,0,0.06)'
                }}
              >
                <div style={{ 
                  width: viewMode === 'grid' ? '100%' : '280px', 
                  height: viewMode === 'grid' ? '240px' : '100%', 
                  position: 'relative',
                  flexShrink: 0,
                  overflow: 'hidden',
                  background: vectorConfig.bg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <div style={{ position: 'absolute', inset: 0, opacity: 0.1, backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
                  
                  <motion.div whileHover={{ scale: 1.1, rotate: 5 }} style={{ color: 'white', opacity: 0.9, filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.2))' }}>
                    <VectorIcon size={84} strokeWidth={1.5} />
                  </motion.div>
                  
                  <div style={{ inset: 0, position: 'absolute', background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0) 40%, rgba(0,0,0,0.8) 100%)' }} />
                  
                  <div style={{ position: 'absolute', top: '16px', left: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <span style={{ 
                        background: 'rgba(255,255,255,0.95)', padding: '6px 12px', 
                        borderRadius: '30px', fontSize: '11px', fontWeight: '800', 
                        color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px',
                        backdropFilter: 'blur(8px)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                      }}>
                        {getTypeIcon(prop.type)}
                        {prop.type}
                      </span>
                    </div>

                    <span style={{ 
                      background: prop.totalUnits === 1 ? '#e0e7ff' : '#f3e8ff', 
                      color: prop.totalUnits === 1 ? '#4338ca' : '#7e22ce', 
                      border: prop.totalUnits === 1 ? '1px solid #c7d2fe' : '1px solid #e9d5ff',
                      padding: '6px 12px', borderRadius: '30px', fontSize: '11px', fontWeight: '800',
                      backdropFilter: 'blur(8px)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      display: 'flex', alignItems: 'center', gap: '6px', width: 'fit-content'
                    }}>
                      {prop.totalUnits === 1 ? '🏡 Single Standalone Property' : '🏘️ Compound Estate Development'}
                    </span>
                  </div>

                  <div style={{ position: 'absolute', top: '16px', right: '16px' }}>
                    <span style={{ 
                      backgroundColor: statusBadge.bg, 
                      color: statusBadge.text, 
                      border: `1px solid ${statusBadge.border}`,
                      padding: '6px 14px', borderRadius: '30px', fontSize: '11px', fontWeight: '800',
                      backdropFilter: 'blur(8px)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}>
                      {prop.status}
                    </span>
                  </div>

                  <div style={{ position: 'absolute', bottom: '16px', left: '16px', color: 'white' }}>
                    <span style={{ fontSize: '11px', fontWeight: '700', color: 'rgba(255,255,255,0.8)', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '2px' }}>
                      {prop.totalUnits === 1 ? 'Standalone Sale Price' : 'Starting At'}
                    </span>
                    <span style={{ fontSize: '22px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '4px', textShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
                      {prop.priceRange}
                    </span>
                  </div>
                </div>

                <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <div style={{ flex: 1, marginRight: '12px' }}>
                        <h3 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '4px', lineHeight: '1.3' }}>{prop.name}</h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)' }}>
                          <MapPin size={14} style={{ color: 'var(--primary)' }} />
                          <span style={{ fontSize: '13px', fontWeight: '600' }}>{prop.location}</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => setActiveManageProperty(prop)}
                        title="Manage Individual Units"
                        style={{ padding: '8px', borderRadius: '10px', background: '#f8fafc', border: '1px solid var(--border-dark)', color: 'var(--text-muted)', cursor: 'pointer', transition: 'all 0.2s' }}
                      >
                        <MoreVertical size={16} />
                      </button>
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '16px', marginBottom: '20px' }}>
                      {prop.inventory.map((item, idx) => (
                        <span key={idx} style={{ fontSize: '12px', fontWeight: '700', backgroundColor: '#f1f5f9', color: '#475569', padding: '4px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                          {item}
                        </span>
                      ))}
                    </div>

                    <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '16px', marginBottom: '20px', border: '1px solid #f1f5f9' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <PieChart size={14} style={{ color: 'var(--primary)' }} />
                          {prop.totalUnits === 1 ? 'Standalone Asset Allocation' : prop.type === 'Land Development' ? 'Compound Plot Sales Progress' : 'Estate Sales Progress'}
                        </span>
                        <span style={{ fontSize: '13px', fontWeight: '900', color: 'var(--primary)' }}>
                          {percentSold}% Sold ({prop.soldUnits}/{prop.totalUnits})
                        </span>
                      </div>
                      <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '10px', overflow: 'hidden' }}>
                        <div style={{ width: `${percentSold}%`, height: '100%', background: 'var(--primary)', borderRadius: '10px', transition: 'width 1s cubic-bezier(0.23, 1, 0.32, 1)' }} />
                      </div>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '14px', paddingTop: '12px', borderTop: '1px solid #e2e8f0' }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '800', textTransform: 'uppercase' }}>Projected Revenue</span>
                          <span style={{ fontSize: '15px', fontWeight: '900', color: 'var(--text-main)', marginTop: '2px' }}>{prop.projectedValue}</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '800', textTransform: 'uppercase' }}>
                            {prop.type === 'Land Development' ? 'Available Plots' : 'Available Units'}
                          </span>
                          <span style={{ fontSize: '15px', fontWeight: '900', color: 'var(--success)', marginTop: '2px' }}>{prop.totalUnits - prop.soldUnits} left</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <button 
                      onClick={() => setActiveBrochureProperty(prop)}
                      style={{ flex: 1, padding: '14px', borderRadius: '14px', border: '1px solid var(--primary)', background: 'var(--primary-glow)', color: 'var(--primary)', fontSize: '13px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 10px rgba(0, 135, 90, 0.1)' }}
                    >
                      <FileText size={16} /> Digital Brochure
                    </button>
                    <button 
                      onClick={() => setActiveManageProperty(prop)}
                      style={{ flex: 1, padding: '14px', borderRadius: '14px', border: 'none', background: 'var(--primary)', color: 'white', fontSize: '13px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 8px 20px -4px rgba(0, 135, 90, 0.4)' }}
                    >
                      {prop.totalUnits === 1 ? 'Execute Standalone Sale' : 'Inspect Itemized Units'} <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* MODAL: INDIVIDUAL INVENTORY UNITS MANAGER */}
      <AnimatePresence>
        {activeManageProperty && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200, padding: '24px' }}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              style={{ background: 'white', padding: '44px', borderRadius: '32px', width: '100%', maxWidth: '850px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #e2e8f0', paddingBottom: '20px', marginBottom: '28px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '20px', background: '#ecfdf5', color: '#00875a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Building2 size={28} />
                  </div>
                  <div>
                    <span style={{ padding: '4px 12px', background: '#f1f5f9', color: '#475569', borderRadius: '14px', fontSize: '11px', fontWeight: '900', textTransform: 'uppercase' }}>Individual Units & Sub-Properties Inventory</span>
                    <h3 style={{ margin: '6px 0 0', fontSize: '24px', fontWeight: '900', color: '#0f172a' }}>{activeManageProperty.name}</h3>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => setEditPropertyData(activeManageProperty)}
                    style={{ background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', padding: '12px 20px', borderRadius: '14px', fontSize: '13px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.15)' }}
                  >
                    <Edit3 size={16} /> Edit / Modify Property
                  </button>
                  <button
                    onClick={() => handleDeleteProperty(activeManageProperty.id, activeManageProperty.name)}
                    style={{ background: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca', padding: '12px 20px', borderRadius: '14px', fontSize: '13px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.15)' }}
                  >
                    <Trash2 size={16} /> Delete Property
                  </button>
                  <button 
                    onClick={() => setShowAddSubUnitModal(true)}
                    style={{ background: 'var(--primary)', color: 'white', border: 'none', padding: '12px 20px', borderRadius: '14px', fontSize: '13px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(0, 135, 90, 0.3)' }}
                  >
                    <Plus size={16} /> Add Sub-Property / Unit
                  </button>
                  <button onClick={() => setActiveManageProperty(null)} style={{ background: '#f1f5f9', border: 'none', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b' }}>
                    <X size={18} />
                  </button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '28px' }}>
                <div style={{ background: '#f8fafc', padding: '16px 20px', borderRadius: '16px', border: '1px solid #cbd5e1' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '800', textTransform: 'uppercase', display: 'block' }}>Total Allocated Parcels</span>
                  <strong style={{ fontSize: '20px', fontWeight: '900', color: '#0f172a', marginTop: '2px', display: 'block' }}>{activeManageProperty.totalUnits} Units</strong>
                </div>
                <div style={{ background: '#ecfdf5', padding: '16px 20px', borderRadius: '16px', border: '1px solid #bbf7d0' }}>
                  <span style={{ fontSize: '11px', color: '#065f46', fontWeight: '800', textTransform: 'uppercase', display: 'block' }}>Sold Parcels</span>
                  <strong style={{ fontSize: '20px', fontWeight: '900', color: '#10b981', marginTop: '2px', display: 'block' }}>{activeManageProperty.soldUnits} Sold</strong>
                </div>
                <div style={{ background: '#fff7ed', padding: '16px 20px', borderRadius: '16px', border: '1px solid #fed7aa' }}>
                  <span style={{ fontSize: '11px', color: '#d97706', fontWeight: '800', textTransform: 'uppercase', display: 'block' }}>Available Inventory</span>
                  <strong style={{ fontSize: '20px', fontWeight: '900', color: '#d97706', marginTop: '2px', display: 'block' }}>{activeManageProperty.totalUnits - activeManageProperty.soldUnits} Left</strong>
                </div>
                <div style={{ background: '#eff6ff', padding: '16px 20px', borderRadius: '16px', border: '1px solid #bfdbfe' }}>
                  <span style={{ fontSize: '11px', color: '#1e3a8a', fontWeight: '800', textTransform: 'uppercase', display: 'block' }}>Projected Asset Value</span>
                  <strong style={{ fontSize: '20px', fontWeight: '900', color: '#2563eb', marginTop: '2px', display: 'block' }}>{activeManageProperty.projectedValue}</strong>
                </div>
              </div>

              <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', padding: '14px 18px', borderRadius: '16px', fontSize: '13px', color: '#1e3a8a', fontWeight: '700', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Handshake size={20} style={{ flexShrink: 0 }} />
                <span>Click <strong>"🤝 Execute Individual Sale"</strong> on any available plot or villa to instantly link and formulate a structured purchase agreement.</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '16px', maxHeight: '450px', overflowY: 'auto', paddingRight: '8px' }}>
                {activeManageProperty.individualUnits && activeManageProperty.individualUnits.map((unit) => (
                  <div key={unit.id} style={{ padding: '20px', borderRadius: '20px', border: unit.status === 'Sold' ? '1px solid #fca5a5' : '1px solid #cbd5e1', background: unit.status === 'Sold' ? '#fef2f2' : '#f8fafc', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '16px', fontWeight: '900', color: '#0f172a' }}>{unit.name}</span>
                      <span style={{ fontSize: '11px', fontWeight: '900', padding: '4px 10px', borderRadius: '12px', background: unit.status === 'Sold' ? '#ef4444' : '#10b981', color: 'white', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {unit.status === 'Sold' ? <Lock size={12} /> : <Check size={12} />} {unit.status}
                      </span>
                    </div>

                    <div>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '700', display: 'block' }}>Standard Parcel Valuation</span>
                      <strong style={{ fontSize: '16px', fontWeight: '900', color: 'var(--primary)' }}>₵ {unit.price?.toLocaleString()}</strong>
                    </div>

                    {unit.status === 'Sold' ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ padding: '10px 12px', background: 'white', borderRadius: '12px', border: '1px solid #fecaca', fontSize: '12px', fontWeight: '800', color: '#ef4444' }}>
                          Purchaser: {unit.buyer || 'Verified Buyer'}
                        </div>
                        <button
                          onClick={() => handleDelinkUnitDirectly(activeManageProperty.id, unit.id || unit.name)}
                          style={{ width: '100%', padding: '8px', background: '#fee2e2', color: '#ef4444', border: '1px solid #fca5a5', borderRadius: '10px', fontWeight: '800', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', transition: 'all 0.2s' }}
                        >
                          <Unlock size={14} /> Delink Unit & Reset Available
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleExecuteIndividualUnitSale(activeManageProperty, unit)}
                        style={{ width: '100%', padding: '12px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '900', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', boxShadow: '0 4px 12px rgba(0, 135, 90, 0.3)' }}
                      >
                        <Handshake size={14} /> Execute Individual Sale
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: ADD SUB-PROPERTY / UNIT TO ESTATE */}
      <AnimatePresence>
        {showAddSubUnitModal && activeManageProperty && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1300, padding: '24px' }}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              style={{ background: 'white', padding: '40px', borderRadius: '32px', width: '100%', maxWidth: '500px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '20px', marginBottom: '24px' }}>
                <div>
                  <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--primary)', textTransform: 'uppercase', display: 'block' }}>Estate Expansion</span>
                  <h3 style={{ margin: '4px 0 0', fontSize: '22px', fontWeight: '900', color: '#0f172a' }}>Add Sub-Property / Unit</h3>
                </div>
                <button onClick={() => setShowAddSubUnitModal(false)} style={{ background: '#f1f5f9', border: 'none', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b' }}>
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleAddSubPropertySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Unit Number / Designation</label>
                    <input name="subId" type="text" placeholder="e.g. Villa #31 or Plot 12" required style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-dark)', fontSize: '14px', fontWeight: '800', background: '#f8fafc', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Layout / Bedroom Config</label>
                    <select name="subType" required style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-dark)', fontSize: '14px', fontWeight: '800', background: '#f8fafc', boxSizing: 'border-box' }}>
                      <option value="🛏️ Studio Suite">🛏️ Studio Suite</option>
                      <option value="🏢 1 Bedroom Suite">🏢 1 Bedroom Suite</option>
                      <option value="🏢 2 Bedroom Suite">🏢 2 Bedroom Suite</option>
                      <option value="🏢 3 Bedroom Penthouse">🏢 3 Bedroom Penthouse</option>
                      <option value="🏢 4 Bedroom Executive Suite">🏢 4 Bedroom Executive Suite</option>
                      <option value="🏡 5 Bedroom Luxury Villa">🏡 5 Bedroom Luxury Villa</option>
                      <option value="🏡 6 Bedroom Mansion">🏡 6 Bedroom Mansion</option>
                      <option value="🏰 7+ Bedroom Premium Estate">🏰 7+ Bedroom Premium Estate</option>
                      <option value="🏪 Retail Store / Commercial">🏪 Retail Store / Commercial</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Valuation / Agreed Price (₵)</label>
                  <input name="subPrice" type="number" placeholder="850000" defaultValue="550000" required style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-dark)', fontSize: '16px', fontWeight: '800', color: 'var(--primary)', background: '#f8fafc' }} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
                  <button type="button" onClick={() => setShowAddSubUnitModal(false)} style={{ padding: '14px 24px', borderRadius: '14px', background: '#f1f5f9', color: '#475569', fontWeight: '800', border: 'none', cursor: 'pointer' }}>Cancel</button>
                  <button type="submit" style={{ padding: '14px 28px', borderRadius: '14px', background: 'var(--primary)', color: 'white', fontWeight: '800', border: 'none', cursor: 'pointer', boxShadow: '0 8px 20px rgba(0, 135, 90, 0.4)' }}>Confirm Addition to Estate</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: DIGITAL ASSET BROCHURE & PRICING MATRIX */}
      <AnimatePresence>
        {activeBrochureProperty && (
          <div className="print-modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200, padding: '24px' }}>
            <motion.div 
              className="print-modal-content brochure-print-area"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              style={{ background: 'white', padding: '48px', borderRadius: '32px', width: '100%', maxWidth: '850px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #e2e8f0', paddingBottom: '20px', marginBottom: '28px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '20px', background: 'var(--primary-glow)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FileText size={28} />
                  </div>
                  <div>
                    <span style={{ padding: '4px 12px', background: '#f1f5f9', color: '#475569', borderRadius: '14px', fontSize: '11px', fontWeight: '900', textTransform: 'uppercase' }}>Official Digital Prospectus</span>
                    <h3 style={{ margin: '6px 0 0', fontSize: '24px', fontWeight: '900', color: '#0f172a' }}>{activeBrochureProperty.name}</h3>
                  </div>
                </div>
                <div className="no-print" style={{ display: 'flex', gap: '12px' }}>
                  <button disabled={isGeneratingPdf} onClick={handleExportPdf} style={{ background: 'var(--primary)', color: 'white', border: 'none', padding: '12px 20px', borderRadius: '14px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '800', fontSize: '13px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0, 135, 90, 0.3)', opacity: isGeneratingPdf ? 0.7 : 1 }}>
                    <Printer size={16} /> {isGeneratingPdf ? 'Generating Real PDF...' : 'Download Real PDF'}
                  </button>
                  <button onClick={() => setActiveBrochureProperty(null)} style={{ background: '#f1f5f9', border: 'none', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b' }}>
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Dynamic High-Res Vector Brochure Banner */}
              {(() => {
                const vectorConfig = getDynamicIconConfig(activeBrochureProperty.type);
                const VectorIcon = vectorConfig.Icon;
                return (
                  <div style={{ 
                    width: '100%', height: '320px', borderRadius: '24px', overflow: 'hidden', marginBottom: '32px', position: 'relative',
                    background: vectorConfig.bg, display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <div style={{ position: 'absolute', inset: 0, opacity: 0.15, backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
                    <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ color: 'white', filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.3))' }}>
                      <VectorIcon size={140} strokeWidth={1} />
                    </motion.div>
                    <div style={{ inset: 0, position: 'absolute', background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0) 50%, rgba(0,0,0,0.7) 100%)' }} />
                    <div style={{ position: 'absolute', bottom: '20px', left: '20px', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)', padding: '12px 24px', borderRadius: '20px', color: 'white' }}>
                      <span style={{ fontSize: '12px', fontWeight: '800', color: '#bbf7d0', textTransform: 'uppercase', display: 'block' }}>Prime Development Location</span>
                      <span style={{ fontSize: '20px', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '8px' }}><MapPin size={18} style={{ color: '#10b981' }} /> {activeBrochureProperty.location}</span>
                    </div>
                  </div>
                );
              })()}

              {/* Specs & Matrix */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
                <div style={{ background: '#f8fafc', padding: '24px', borderRadius: '20px', border: '1px solid #cbd5e1' }}>
                  <h4 style={{ fontSize: '16px', fontWeight: '900', color: '#0f172a', margin: '0 0 16px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Architectural & Title Overview</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
                      <span style={{ color: 'var(--text-muted)', fontWeight: '700' }}>Development Type:</span>
                      <strong style={{ color: '#0f172a' }}>{activeBrochureProperty.type}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
                      <span style={{ color: 'var(--text-muted)', fontWeight: '700' }}>Architectural Build:</span>
                      <strong style={{ color: '#0f172a' }}>{activeBrochureProperty.brochureSpecs?.architecturalStyle}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
                      <span style={{ color: 'var(--text-muted)', fontWeight: '700' }}>Zoning Compliance:</span>
                      <strong style={{ color: '#0f172a' }}>{activeBrochureProperty.brochureSpecs?.zoning}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
                      <span style={{ color: 'var(--text-muted)', fontWeight: '700' }}>Legal Title Status:</span>
                      <strong style={{ color: '#0f172a' }}>{activeBrochureProperty.brochureSpecs?.title}</strong>
                    </div>
                  </div>
                </div>

                <div style={{ background: '#f0fdf4', padding: '24px', borderRadius: '20px', border: '1px solid #bbf7d0' }}>
                  <h4 style={{ fontSize: '16px', fontWeight: '900', color: '#065f46', margin: '0 0 16px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Pricing & Fiscal Projections</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #bbf7d0', paddingBottom: '8px' }}>
                      <span style={{ color: '#16a34a', fontWeight: '700' }}>Starting Price Range:</span>
                      <strong style={{ color: '#065f46', fontSize: '16px', fontWeight: '900' }}>{activeBrochureProperty.priceRange}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #bbf7d0', paddingBottom: '8px' }}>
                      <span style={{ color: '#16a34a', fontWeight: '700' }}>Total Master Parcels:</span>
                      <strong style={{ color: '#065f46', fontSize: '15px', fontWeight: '900' }}>{activeBrochureProperty.totalUnits} Units</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #bbf7d0', paddingBottom: '8px' }}>
                      <span style={{ color: '#16a34a', fontWeight: '700' }}>Available Inventory:</span>
                      <strong style={{ color: '#065f46', fontSize: '15px', fontWeight: '900' }}>{activeBrochureProperty.totalUnits - activeBrochureProperty.soldUnits} Parcels Left</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #bbf7d0', paddingBottom: '8px' }}>
                      <span style={{ color: '#16a34a', fontWeight: '700' }}>Projected Valuation:</span>
                      <strong style={{ color: '#065f46', fontSize: '15px', fontWeight: '900' }}>{activeBrochureProperty.projectedValue}</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Master Amenities & Inclusions */}
              <div style={{ background: '#f8fafc', padding: '28px', borderRadius: '24px', border: '1px solid #cbd5e1', marginBottom: '32px' }}>
                <h4 style={{ fontSize: '16px', fontWeight: '900', color: '#0f172a', margin: '0 0 16px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Key Inclusions & Project Inclusions</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  {activeBrochureProperty.brochureSpecs?.amenities && activeBrochureProperty.brochureSpecs.amenities.map((amenity, index) => (
                    <div key={index} style={{ padding: '14px 20px', background: 'white', borderRadius: '16px', border: '1px solid #cbd5e1', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px', fontWeight: '800', color: '#0f172a' }}>
                      <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#ecfdf5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Check size={16} />
                      </div>
                      <span>{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="no-print" style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
                <button onClick={() => setActiveBrochureProperty(null)} style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', color: '#475569', padding: '16px 36px', borderRadius: '16px', fontWeight: '800', fontSize: '15px', cursor: 'pointer' }}>Close Prospectus</button>
                <button 
                  onClick={() => {
                    const prop = activeBrochureProperty;
                    setActiveBrochureProperty(null);
                    setActiveManageProperty(prop);
                  }} 
                  style={{ background: 'var(--primary)', color: 'white', border: 'none', padding: '16px 36px', borderRadius: '16px', fontSize: '15px', fontWeight: '800', cursor: 'pointer', boxShadow: '0 8px 25px rgba(0, 135, 90, 0.4)', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <Handshake size={18} /> Inspect Itemized Inventory
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: ADVANCED SORT & FILTER */}
      <AnimatePresence>
        {showFilterModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200, padding: '24px' }}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              style={{ background: 'white', padding: '40px', borderRadius: '32px', width: '100%', maxWidth: '500px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '20px', marginBottom: '24px' }}>
                <h3 style={{ margin: 0, fontSize: '22px', fontWeight: '900', color: '#0f172a' }}>Sort & Filter Assets</h3>
                <button onClick={() => setShowFilterModal(false)} style={{ background: '#f1f5f9', border: 'none', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b' }}>
                  <X size={18} />
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '28px' }}>
                <button
                  onClick={() => { setSortOrder('default'); setShowFilterModal(false); }}
                  style={{ padding: '16px 20px', borderRadius: '16px', border: sortOrder === 'default' ? '2px solid var(--primary)' : '1px solid #cbd5e1', background: sortOrder === 'default' ? '#ecfdf5' : 'white', color: sortOrder === 'default' ? '#065f46' : '#0f172a', fontWeight: '800', fontSize: '14px', cursor: 'pointer', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <span>Default Project Catalog Order</span>
                  {sortOrder === 'default' && <Check size={18} color="var(--primary)" />}
                </button>
                <button
                  onClick={() => { setSortOrder('price-low'); setShowFilterModal(false); }}
                  style={{ padding: '16px 20px', borderRadius: '16px', border: sortOrder === 'price-low' ? '2px solid var(--primary)' : '1px solid #cbd5e1', background: sortOrder === 'price-low' ? '#ecfdf5' : 'white', color: sortOrder === 'price-low' ? '#065f46' : '#0f172a', fontWeight: '800', fontSize: '14px', cursor: 'pointer', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <span>Sort by Starting Price: Low to High</span>
                  {sortOrder === 'price-low' && <Check size={18} color="var(--primary)" />}
                </button>
                <button
                  onClick={() => { setSortOrder('price-high'); setShowFilterModal(false); }}
                  style={{ padding: '16px 20px', borderRadius: '16px', border: sortOrder === 'price-high' ? '2px solid var(--primary)' : '1px solid #cbd5e1', background: sortOrder === 'price-high' ? '#ecfdf5' : 'white', color: sortOrder === 'price-high' ? '#065f46' : '#0f172a', fontWeight: '800', fontSize: '14px', cursor: 'pointer', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <span>Sort by Starting Price: High to Low</span>
                  {sortOrder === 'price-high' && <Check size={18} color="var(--primary)" />}
                </button>
                <button
                  onClick={() => { setSortOrder('units-avail'); setShowFilterModal(false); }}
                  style={{ padding: '16px 20px', borderRadius: '16px', border: sortOrder === 'units-avail' ? '2px solid var(--primary)' : '1px solid #cbd5e1', background: sortOrder === 'units-avail' ? '#ecfdf5' : 'white', color: sortOrder === 'units-avail' ? '#065f46' : '#0f172a', fontWeight: '800', fontSize: '14px', cursor: 'pointer', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <span>Sort by Most Available Units / Plots Left</span>
                  {sortOrder === 'units-avail' && <Check size={18} color="var(--primary)" />}
                </button>
              </div>

              <button 
                onClick={() => setShowFilterModal(false)}
                style={{ width: '100%', padding: '16px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '16px', fontWeight: '800', fontSize: '15px', cursor: 'pointer', boxShadow: '0 8px 20px rgba(0, 135, 90, 0.4)' }}
              >
                Apply Sort Preference
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Register Sales Project / Asset Modal */}
      <AnimatePresence>
        {showModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200, padding: '24px' }}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              style={{ background: 'white', padding: '48px', borderRadius: '32px', width: '100%', maxWidth: '650px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '20px', marginBottom: '28px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '20px', background: '#ecfdf5', color: '#00875a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Building2 size={28} />
                  </div>
                  <div>
                    <span style={{ padding: '4px 12px', background: '#f1f5f9', color: '#475569', borderRadius: '14px', fontSize: '11px', fontWeight: '900', textTransform: 'uppercase' }}>Portfolio Intake</span>
                    <h3 style={{ margin: '6px 0 0', fontSize: '24px', fontWeight: '900', color: '#0f172a' }}>Register Sales Asset</h3>
                  </div>
                </div>
                <button onClick={() => setShowModal(false)} style={{ background: '#f1f5f9', border: 'none', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', cursor: 'pointer' }}>
                  <X size={20} />
                </button>
              </div>

              {/* Property Structure Switcher */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', background: '#f8fafc', padding: '8px', borderRadius: '20px', border: '1px solid #cbd5e1', marginBottom: '28px' }}>
                <button
                  type="button"
                  onClick={() => setPropertyStructure('Compound Estate')}
                  style={{
                    padding: '16px', borderRadius: '16px', border: 'none',
                    background: propertyStructure === 'Compound Estate' ? 'var(--primary)' : 'transparent',
                    color: propertyStructure === 'Compound Estate' ? 'white' : '#475569',
                    fontWeight: '800', fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s',
                    boxShadow: propertyStructure === 'Compound Estate' ? '0 8px 20px rgba(0, 135, 90, 0.4)' : 'none',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px'
                  }}
                >
                  <span style={{ fontSize: '16px' }}>🏘️ Compound Estate / Development</span>
                  <span style={{ fontSize: '11px', opacity: 0.85, fontWeight: '600' }}>Master estate with multiple sub-units</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPropertyStructure('Single Standalone')}
                  style={{
                    padding: '16px', borderRadius: '16px', border: 'none',
                    background: propertyStructure === 'Single Standalone' ? 'var(--primary)' : 'transparent',
                    color: propertyStructure === 'Single Standalone' ? 'white' : '#475569',
                    fontWeight: '800', fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s',
                    boxShadow: propertyStructure === 'Single Standalone' ? '0 8px 20px rgba(0, 135, 90, 0.4)' : 'none',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px'
                  }}
                >
                  <span style={{ fontSize: '16px' }}>🏡 Single Standalone Property / Land</span>
                  <span style={{ fontSize: '11px', opacity: 0.85, fontWeight: '600' }}>Exactly one indivisible property or plot</span>
                </button>
              </div>



              <form onSubmit={handleAddProperty} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>
                    {propertyStructure === 'Single Standalone' ? 'Property / Parcel Name' : 'Master Development Name'}
                  </label>
                  <input name="name" type="text" placeholder={propertyStructure === 'Single Standalone' ? "e.g. Executive 4-Bed Standalone Villa East Legon" : "e.g. Royal Crest Eco Estate"} required style={{ width: '100%', padding: '16px 20px', borderRadius: '16px', border: '1px solid #cbd5e1', fontSize: '15px', fontWeight: '800', background: '#f8fafc', boxSizing: 'border-box', outline: 'none' }} />
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Development Category</label>
                    <select 
                      name="type" 
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                      required 
                      style={{ width: '100%', padding: '16px 20px', borderRadius: '16px', border: '1px solid #cbd5e1', fontSize: '15px', fontWeight: '800', background: '#f8fafc', outline: 'none' }}
                    >
                      <option value="Housing Project">Housing Project</option>
                      <option value="Land Development">Land Development</option>
                      <option value="Commercial Complex">Commercial Complex</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Sales Status</label>
                    <select name="status" required style={{ width: '100%', padding: '16px 20px', borderRadius: '16px', border: '1px solid #cbd5e1', fontSize: '15px', fontWeight: '800', background: '#f8fafc', outline: 'none' }}>
                      <option value="Active Sales">Active Sales</option>
                      <option value="Pre-Launch">Pre-Launch</option>
                      <option value="Almost Sold Out">Almost Sold Out</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Location / Physical Address</label>
                  <input name="location" type="text" placeholder="e.g. Cantonments, Accra" required style={{ width: '100%', padding: '16px 20px', borderRadius: '16px', border: '1px solid #cbd5e1', fontSize: '15px', fontWeight: '800', background: '#f8fafc', boxSizing: 'border-box', outline: 'none' }} />
                </div>

                {propertyStructure === 'Single Standalone' ? (
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Standalone Asset Valuation (₵)</label>
                    <input name="singlePrice" type="number" placeholder="850000" defaultValue="750000" required style={{ width: '100%', padding: '16px 20px', borderRadius: '16px', border: '2px solid var(--primary)', fontSize: '18px', fontWeight: '900', color: 'var(--primary)', boxSizing: 'border-box', outline: 'none' }} />
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>
                        {formCategory === 'Land Development' ? 'Total Plots / Parcels' : 'Total Units'}
                      </label>
                      <input name="totalUnits" type="number" placeholder={formCategory === 'Land Development' ? '80' : '40'} required style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '14px', fontWeight: '800', background: '#f8fafc', boxSizing: 'border-box', outline: 'none' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Starting Price</label>
                      <input name="priceRange" type="text" placeholder="500,000" required style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '14px', fontWeight: '800', background: '#f8fafc', boxSizing: 'border-box', outline: 'none' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Projected Revenue</label>
                      <input name="projectedValue" type="text" placeholder="20.0M" required style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '14px', fontWeight: '800', background: '#f8fafc', boxSizing: 'border-box', outline: 'none' }} />
                    </div>
                  </div>
                )}

                {/* Conditional Land Specific Fields for Compound Estate */}
                {formCategory === 'Land Development' && propertyStructure === 'Compound Estate' && (
                  <div style={{ padding: '20px', border: '1px dashed var(--primary)', borderRadius: '16px', backgroundColor: 'var(--primary-glow)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <p style={{ fontSize: '13px', fontWeight: '800', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '6px', margin: 0 }}>
                      <Map size={16} /> Compound Land Development Details
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div>
                        <label style={{ fontSize: '11px', fontWeight: '800', color: '#334155', textTransform: 'uppercase', marginBottom: '6px', display: 'block' }}>Land Title Status</label>
                        <select name="landTitle" style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px', background: 'white', fontWeight: '800', outline: 'none' }}>
                          <option value="Land Title Certificate">Land Title Certificate</option>
                          <option value="Registered Indenture">Registered Indenture</option>
                          <option value="Customary Grant">Customary Grant</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ fontSize: '11px', fontWeight: '800', color: '#334155', textTransform: 'uppercase', marginBottom: '6px', display: 'block' }}>Zoning Designation</label>
                        <select name="landZoning" style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px', background: 'white', fontWeight: '800', outline: 'none' }}>
                          <option value="Residential Zoning">Residential Zoning</option>
                          <option value="Commercial / Mixed-Use">Commercial / Mixed-Use</option>
                          <option value="Agricultural / Industrial">Agricultural / Industrial</option>
                        </select>
                      </div>
                      <div style={{ gridColumn: '1 / -1' }}>
                        <label style={{ fontSize: '11px', fontWeight: '800', color: '#334155', textTransform: 'uppercase', marginBottom: '6px', display: 'block' }}>Infrastructure & Utilities Available</label>
                        <input name="landUtilities" type="text" placeholder="e.g. Tarred Road Access, Electricity, Borehole Water" defaultValue="Serviced with Tarred Road & Electricity" style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px', background: 'white', fontWeight: '800', boxSizing: 'border-box', outline: 'none' }} />
                      </div>
                    </div>
                  </div>
                )}

                {propertyStructure === 'Compound Estate' && (
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>
                      {formCategory === 'Land Development' ? 'Compound Plot Groups (e.g. 5-Plot Compound, 2-Plot Compound)' : 'Sub-Properties Included (e.g. 3-Bed Villas, 4-Bed Villas, 2-Bed Suites)'}
                    </label>
                    <input name="inventory" type="text" placeholder={formCategory === 'Land Development' ? 'e.g. 10x 5-Plot Compound Land, 20x 2-Plot Compound Land' : 'e.g. 15x 3-Bed Villas, 15x 4-Bed Luxury Houses'} required style={{ width: '100%', padding: '16px 20px', borderRadius: '16px', border: '1px solid #cbd5e1', fontSize: '14px', fontWeight: '800', background: '#f8fafc', boxSizing: 'border-box', outline: 'none' }} />
                  </div>
                )}
                
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginTop: '12px' }}>
                  <button type="button" onClick={() => setShowModal(false)} style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', color: '#475569', padding: '16px 28px', borderRadius: '16px', fontWeight: '800', fontSize: '15px', cursor: 'pointer' }}>Cancel</button>
                  <button type="submit" style={{ backgroundColor: 'var(--primary)', color: 'white', border: 'none', padding: '16px 36px', borderRadius: '16px', fontSize: '15px', fontWeight: '800', cursor: 'pointer', boxShadow: '0 10px 25px rgba(0, 135, 90, 0.4)' }}>
                    Confirm & Register Asset
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: EDIT / MODIFY SALES PROPERTY */}
      <AnimatePresence>
        {editPropertyData && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1400, padding: '24px' }}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              style={{ background: 'white', padding: '48px', borderRadius: '32px', width: '100%', maxWidth: '650px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '20px', marginBottom: '28px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '20px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Edit3 size={28} />
                  </div>
                  <div>
                    <span style={{ padding: '4px 12px', background: '#f1f5f9', color: '#475569', borderRadius: '14px', fontSize: '11px', fontWeight: '900', textTransform: 'uppercase' }}>Administration</span>
                    <h3 style={{ margin: '6px 0 0', fontSize: '24px', fontWeight: '900', color: '#0f172a' }}>Modify Registered Property</h3>
                  </div>
                </div>
                <button type="button" onClick={() => setEditPropertyData(null)} style={{ background: '#f1f5f9', border: 'none', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', cursor: 'pointer' }}>
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleEditPropertySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Property / Development Name</label>
                  <input name="name" type="text" defaultValue={editPropertyData.name} required style={{ width: '100%', padding: '16px 20px', borderRadius: '16px', border: '1px solid #cbd5e1', fontSize: '15px', fontWeight: '800', background: '#f8fafc', boxSizing: 'border-box', outline: 'none' }} />
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Development Category</label>
                    <select name="type" defaultValue={editPropertyData.type} required style={{ width: '100%', padding: '16px 20px', borderRadius: '16px', border: '1px solid #cbd5e1', fontSize: '15px', fontWeight: '800', background: '#f8fafc', outline: 'none' }}>
                      <option value="Housing Project">Housing Project</option>
                      <option value="Land Development">Land Development</option>
                      <option value="Commercial Complex">Commercial Complex</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Sales Status</label>
                    <select name="status" defaultValue={editPropertyData.status} required style={{ width: '100%', padding: '16px 20px', borderRadius: '16px', border: '1px solid #cbd5e1', fontSize: '15px', fontWeight: '800', background: '#f8fafc', outline: 'none' }}>
                      <option value="Active Sales">Active Sales</option>
                      <option value="Pre-Launch">Pre-Launch</option>
                      <option value="Almost Sold Out">Almost Sold Out</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Location / Physical Address</label>
                  <input name="location" type="text" defaultValue={editPropertyData.location} required style={{ width: '100%', padding: '16px 20px', borderRadius: '16px', border: '1px solid #cbd5e1', fontSize: '15px', fontWeight: '800', background: '#f8fafc', boxSizing: 'border-box', outline: 'none' }} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Total Allocated Parcels/Units</label>
                    <input name="totalUnits" type="number" defaultValue={editPropertyData.totalUnits} min={editPropertyData.soldUnits || 0} required style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '14px', fontWeight: '800', background: '#f8fafc', boxSizing: 'border-box', outline: 'none' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Starting Price Range</label>
                    <input name="priceRange" type="text" defaultValue={editPropertyData.priceRange?.replace('₵ ', '')} required style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '14px', fontWeight: '800', background: '#f8fafc', boxSizing: 'border-box', outline: 'none' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Projected Asset Value</label>
                    <input name="projectedValue" type="text" defaultValue={editPropertyData.projectedValue?.replace('₵ ', '')} required style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '14px', fontWeight: '800', background: '#f8fafc', boxSizing: 'border-box', outline: 'none' }} />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginTop: '12px' }}>
                  <button type="button" onClick={() => setEditPropertyData(null)} style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', color: '#475569', padding: '16px 28px', borderRadius: '16px', fontWeight: '800', fontSize: '15px', cursor: 'pointer' }}>Cancel</button>
                  <button type="submit" style={{ backgroundColor: '#2563eb', color: 'white', border: 'none', padding: '16px 36px', borderRadius: '16px', fontSize: '15px', fontWeight: '800', cursor: 'pointer', boxShadow: '0 10px 25px rgba(37, 99, 235, 0.4)' }}>
                    Save Modifications
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default SalesProperties;
