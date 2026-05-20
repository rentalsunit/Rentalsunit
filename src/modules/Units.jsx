import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, Plus, Search, Filter, Home, 
  Users, Key, CheckCircle2, AlertCircle, 
  Clock, MapPin, ChevronRight, LayoutGrid, List, X, Hash,
  Eye, Wrench, Server, ShieldCheck, ClipboardList, Ruler, ThumbsUp, Check, Square, CheckSquare, AlertTriangle, HardHat,
  UserPlus, Lock, Unlock, Printer, FileText, Edit3, Save, Trash2, UserMinus
} from 'lucide-react';
import { getThemedAsset } from '../lib/themeImages';
import { getStoredUnits, saveStoredUnits, getStoredTenants, saveStoredTenants, getStoredLeases, saveStoredLeases, getStoredMaintenanceTickets, saveStoredMaintenanceTickets } from '../lib/masterData';
import { generateRealPDF } from '../lib/pdfService';

const Units = () => {
  const [filter, setFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [showModal, setShowModal] = useState(false);
  const [selectedUnitSpecs, setSelectedUnitSpecs] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  // Edit Master Unit State
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUnitToEdit, setSelectedUnitToEdit] = useState(null);

  // Operations Linking States
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [selectedUnitForMaintenance, setSelectedUnitForMaintenance] = useState(null);

  // Tenant Linkage & Comprehensive Agreement States
  const [tenants, setTenants] = useState(getStoredTenants());
  useEffect(() => {
    const syncTenants = () => setTenants(getStoredTenants());
    window.addEventListener('realtyos_tenants_update', syncTenants);
    return () => window.removeEventListener('realtyos_tenants_update', syncTenants);
  }, []);

  const [showLinkModal, setShowLinkModal] = useState(false);
  const [selectedUnitForLink, setSelectedUnitForLink] = useState(null);
  const [selectedTenantIdForLink, setSelectedTenantIdForLink] = useState('');
  const [leaseDurationMonths, setLeaseDurationMonths] = useState(12);

  const [generatedAgreement, setGeneratedAgreement] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editLandlordName, setEditLandlordName] = useState('RealtyOS Property Management Ltd');
  const [editLandlordAddress, setEditLandlordAddress] = useState('14 Independence Avenue, Ridge, Accra');
  const [editLandlordPhone, setEditLandlordPhone] = useState('+233 30 255 8899');
  const [editPremisesClause, setEditPremisesClause] = useState('');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const handleExportPdf = async () => {
    setIsGeneratingPdf(true);
    await generateRealPDF('.agreement-print-area', `Tenancy_Agreement_${generatedAgreement?.unit ? generatedAgreement.unit.replace(/\s+/g, '_') : '101'}.pdf`, { orientation: 'p' });
    setIsGeneratingPdf(false);
  };

  const handleOpenLinkModal = (unit) => {
    setSelectedUnitForLink(unit);
    const unassigned = tenants.find(t => t.status === 'Registered / Unassigned') || tenants[0];
    if (unassigned) setSelectedTenantIdForLink(unassigned.id);
    setShowLinkModal(true);
  };

  const handleExecuteLinkAndAgreement = (e) => {
    e.preventDefault();
    const tenant = tenants.find(t => t.id === selectedTenantIdForLink);
    if (!tenant || !selectedUnitForLink) return;

    const numericPrice = Number(selectedUnitForLink.price.replace(/[^0-9.-]+/g, '')) || 5000;
    const totalContractVal = numericPrice * leaseDurationMonths;
    const startDate = new Date().toISOString().split('T')[0];
    const endDate = new Date(Date.now() + leaseDurationMonths * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // 1. Update Unit
    const updatedUnits = units.map(u => {
      if (u.id === selectedUnitForLink.id) {
        return { ...u, status: 'Occupied', tenant: tenant.name, lastPaid: startDate };
      }
      return u;
    });
    setUnits(updatedUnits);
    saveStoredUnits(updatedUnits);

    // 2. Update Tenant Profile
    const updatedTenants = tenants.map(t => {
      if (t.id === tenant.id) {
        return {
          ...t,
          property: selectedUnitForLink.property,
          unit: selectedUnitForLink.id,
          monthlyRent: numericPrice,
          securityDeposit: numericPrice * 2,
          status: 'Active Lease',
          rentStatus: 'Paid Up',
          leaseStart: startDate,
          leaseEnd: endDate,
          lastPaymentDate: startDate
        };
      }
      return t;
    });
    setTenants(updatedTenants);
    saveStoredTenants(updatedTenants);

    // 3. Generate Comprehensive Editable Agreement PDF
    const agreementData = {
      leaseId: `LSE-${Math.floor(10000 + Math.random() * 89999)}`,
      tenant: tenant.name,
      ghanaCardNo: tenant.ghanaCardNo,
      employer: tenant.employer,
      occupation: tenant.occupation,
      witnessName: tenant.witnessName || 'Samuel Osei Tutu',
      witnessPhone: tenant.witnessPhone || '+233 20 444 8811',
      guarantorName: tenant.guarantorName || 'Mrs. Evelyn Ansah',
      guarantorPhone: tenant.guarantorPhone || '+233 24 555 7788',
      unitId: selectedUnitForLink.id,
      property: selectedUnitForLink.property,
      unitType: selectedUnitForLink.type,
      hvac: selectedUnitForLink.hvac || 'Dual Inverter Split AC',
      amenities: selectedUnitForLink.amenities || ['Ceiling Fan', 'Built-in Wardrobe', 'Inverter AC', 'Water Heater'],
      monthlyRent: numericPrice,
      securityDeposit: numericPrice * 2,
      months: leaseDurationMonths,
      totalBaseCost: totalContractVal,
      startDate: startDate,
      endDate: endDate
    };

    setEditPremisesClause(`The Landlord hereby leases to the Tenant precisely Unit ${agreementData.unitId} situated at ${agreementData.property} (${agreementData.unitType}), equipped with ${agreementData.amenities.length} inclusive certified amenities (${agreementData.amenities.slice(0, 3).join(', ')}, etc.) and verified ${agreementData.hvac} line.`);

    setGeneratedAgreement(agreementData);
    setShowLinkModal(false);
    setSelectedUnitSpecs(null);
    setSuccessMsg(`Unit ${selectedUnitForLink.id} successfully linked to ${tenant.name}! Comprehensive agreement generated.`);
    setTimeout(() => setSuccessMsg(''), 5000);
  };

  // Initial unit checklist for new unit registration
  const [newAmenities, setNewAmenities] = useState([
    { name: 'Ceiling Fan', checked: true },
    { name: 'Fitted Built-in Wardrobe', checked: true },
    { name: 'Inverter Air Conditioner (AC)', checked: true },
    { name: 'Water Heater System', checked: true },
    { name: 'Fitted Kitchen Cabinets', checked: true },
    { name: 'Polytank / Dedicated Water Storage', checked: true },
    { name: 'Prepaid Electricity Meter', checked: true },
    { name: 'Generator Backup Power Line', checked: false },
    { name: 'Walled & Gated Perimeter Security', checked: true },
    { name: 'Fibre Broadband Internet Ready', checked: false },
    { name: 'En-suite Master Bathroom', checked: true },
  ]);

  const toggleAmenity = (idx) => {
    setNewAmenities(newAmenities.map((a, i) => i === idx ? { ...a, checked: !a.checked } : a));
  };

  const [units, setUnits] = useState(getStoredUnits());

  useEffect(() => {
    const syncUnits = () => {
      setUnits(getStoredUnits());
    };
    window.addEventListener('realtyos_rental_update', syncUnits);
    window.addEventListener('storage', syncUnits);
    return () => {
      window.removeEventListener('realtyos_rental_update', syncUnits);
      window.removeEventListener('storage', syncUnits);
    };
  }, []);

  const handleDeleteUnit = (unitId) => {
    if (window.confirm(`⚠️ CONFIRMATION SAFEGUARD: Are you absolutely sure you want to permanently delete Unit ${unitId} from the master inventory?`)) {
      const updatedUnits = units.filter(u => u.id !== unitId);
      saveStoredUnits(updatedUnits);
      setUnits(updatedUnits);
      if (selectedUnitSpecs && selectedUnitSpecs.id === unitId) {
        setSelectedUnitSpecs(null);
      }
      setSuccessMsg(`Unit ${unitId} successfully deleted.`);
      setTimeout(() => setSuccessMsg(''), 5000);
    }
  };

  const handleEditUnitSubmit = (e) => {
    e.preventDefault();
    if (!selectedUnitToEdit) return;
    const formData = new FormData(e.target);
    const typeVal = formData.get('type');
    const priceVal = formData.get('price');
    const sqftVal = formData.get('sqft');
    const hvacVal = formData.get('hvac');

    const updatedUnits = units.map(u => {
      if (u.id === selectedUnitToEdit.id) {
        return {
          ...u,
          type: typeVal,
          price: priceVal.startsWith('₵') ? priceVal : `₵ ${Number(priceVal.replace(/[^0-9.]/g, '')).toLocaleString()}`,
          sqft: sqftVal.includes('sq.ft') ? sqftVal : `${sqftVal} sq.ft`,
          hvac: hvacVal
        };
      }
      return u;
    });
    saveStoredUnits(updatedUnits);
    setUnits(updatedUnits);

    if (selectedUnitSpecs && selectedUnitSpecs.id === selectedUnitToEdit.id) {
      setSelectedUnitSpecs(updatedUnits.find(u => u.id === selectedUnitToEdit.id));
    }

    setShowEditModal(false);
    setSelectedUnitToEdit(null);
    setSuccessMsg(`Unit ${selectedUnitToEdit.id} successfully modified.`);
    setTimeout(() => setSuccessMsg(''), 5000);
  };

  const handleDelinkTenant = (unitId, tenantName) => {
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
      setTenants(updatedTenants);

      if (selectedUnitSpecs && selectedUnitSpecs.id === unitId) {
        setSelectedUnitSpecs(updatedUnits.find(u => u.id === unitId));
      }

      setSuccessMsg(`Unit ${unitId} successfully delinked from ${tenantName} and reset to Available.`);
      setTimeout(() => setSuccessMsg(''), 5000);
    }
  };

  const handleAddUnit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const selectedAmenitiesList = newAmenities.filter(a => a.checked).map(a => a.name);
    const propVal = formData.get('property');
    const sqftVal = formData.get('sqft') || '1,200 sq.ft';
    const hvacVal = formData.get('hvac') || 'Standard Inverter Split AC';
    const typeVal = formData.get('type');
    const unitIdVal = formData.get('unitId');
    const themed = getThemedAsset(unitIdVal, typeVal, propVal);

    const newUnit = {
      id: unitIdVal,
      property: propVal,
      type: typeVal,
      price: `₵ ${parseInt(formData.get('price')).toLocaleString()}`,
      status: 'Available',
      tenant: '-',
      lastPaid: '-',
      sqft: sqftVal.includes('sq.ft') ? sqftVal : `${sqftVal} sq.ft`,
      hvac: hvacVal,
      inspection: 'Newly Verified Asset',
      amenities: selectedAmenitiesList.length > 0 ? selectedAmenitiesList : ['Standard Utility Line', 'Prepaid Meter'],
      icon: themed.icon,
      image: themed.image
    };
    const updatedUnits = [newUnit, ...units];
    saveStoredUnits(updatedUnits);
    setUnits(updatedUnits);
    setShowModal(false);
    setSuccessMsg(`Unit ${newUnit.id} successfully registered into inventory with ${selectedAmenitiesList.length} inclusive amenities.`);
    setTimeout(() => setSuccessMsg(''), 5000);
  };

  // Dispatch Maintenance Work Order & Sync to Operations (Maintenance.jsx)
  const handleDispatchMaintenanceSubmit = (e) => {
    e.preventDefault();
    if (!selectedUnitForMaintenance) return;
    const formData = new FormData(e.target);
    const category = formData.get('category');
    const priority = formData.get('priority');
    const title = formData.get('title');
    const assignedTo = formData.get('assignedTo');
    const estCost = parseFloat(formData.get('estCost')) || 450;
    
    // 1. Update unit status to Maintenance in local state
    const updatedUnits = units.map(u => u.id === selectedUnitForMaintenance.id ? { ...u, status: 'Maintenance' } : u);
    saveStoredUnits(updatedUnits);
    setUnits(updatedUnits);
    
    // 2. Load existing tickets from masterData helper
    const existingTickets = getStoredMaintenanceTickets();

    const newTicketId = `MNT-${8000 + existingTickets.length + 1}`;
    const newWorkOrder = {
      id: newTicketId,
      property: selectedUnitForMaintenance.property,
      unit: `Unit ${selectedUnitForMaintenance.id}`,
      category: category,
      title: title,
      priority: priority,
      status: 'Assigned',
      loggedBy: 'Asset Operations Lead',
      assignedTo: assignedTo,
      estCost: estCost,
      formattedCost: `₵ ${estCost.toLocaleString()}`,
      date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      notes: `Dispatched directly from Unit Registry (${selectedUnitForMaintenance.id}). Technical servicing authorized.`
    };

    // Unshift new ticket to top of list & save
    const updatedTickets = [newWorkOrder, ...existingTickets];
    saveStoredMaintenanceTickets(updatedTickets);

    setShowMaintenanceModal(false);
    setSelectedUnitForMaintenance(null);
    setSuccessMsg(`Unit ${selectedUnitForMaintenance.id} flagged under Maintenance. Work order ${newTicketId} successfully dispatched and linked to Operations page!`);
    setTimeout(() => setSuccessMsg(''), 7000);
  };

  const statusColors = {
    'Occupied': { bg: '#ecfdf5', border: '#10b981', text: '#00875a', icon: CheckCircle2 },
    'Available': { bg: '#eff6ff', border: '#3b82f6', text: '#2563eb', icon: Clock },
    'Maintenance': { bg: '#fff7ed', border: '#f59e0b', text: '#d97706', icon: AlertCircle }
  };

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const item = {
    hidden: { opacity: 0, scale: 0.95 },
    show: { opacity: 1, scale: 1 }
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <span style={{ padding: '6px 14px', background: 'var(--primary-light)', color: 'var(--primary)', borderRadius: '20px', fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Building2 size={14} /> Physical Asset Directory
            </span>
          </div>
          <h2 style={{ fontSize: '32px', fontWeight: '900', letterSpacing: '-0.5px', margin: 0, color: 'var(--text-main)' }}>
            Rental Unit & Specs Control
          </h2>
          <p style={{ fontSize: '15px', color: 'var(--text-muted)', fontWeight: '500', margin: '4px 0 0', maxWidth: '750px' }}>
            Inspect physical unit specifications, inclusive amenities, and dispatch maintenance work orders directly to the Operations board.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ display: 'flex', background: 'white', borderRadius: '16px', border: '1px solid #cbd5e1', padding: '4px' }}>
            <button 
              onClick={() => setViewMode('grid')}
              style={{ padding: '10px', borderRadius: '12px', background: viewMode === 'grid' ? '#f1f5f9' : 'transparent', border: 'none', cursor: 'pointer' }}
            >
              <LayoutGrid size={18} color={viewMode === 'grid' ? 'var(--primary)' : 'var(--text-muted)'} />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              style={{ padding: '10px', borderRadius: '12px', background: viewMode === 'list' ? '#f1f5f9' : 'transparent', border: 'none', cursor: 'pointer' }}
            >
              <List size={18} color={viewMode === 'list' ? 'var(--primary)' : 'var(--text-muted)'} />
            </button>
          </div>
          <button 
            onClick={() => setShowModal(true)}
            style={{ backgroundColor: 'var(--primary)', color: 'white', border: 'none', padding: '14px 28px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', fontWeight: '800', cursor: 'pointer', boxShadow: '0 8px 25px -5px rgba(0, 135, 90, 0.4)' }}
          >
            <Plus size={20} /> Register New Unit Profile
          </button>
        </div>
      </header>

      {/* NOTIFICATION */}
      <AnimatePresence>
        {successMsg && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={{ background: '#ecfdf5', border: '1px solid #10b981', color: '#065f46', padding: '16px 24px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '12px', fontWeight: '800', fontSize: '14px', boxShadow: '0 8px 20px rgba(16, 185, 129, 0.15)' }}
          >
            <CheckCircle2 size={20} style={{ color: '#10b981', flexShrink: 0 }} />
            <span>{successMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        {[
          { label: 'Total Inventory Units', count: units.length, color: '#6366f1', icon: Building2 },
          { label: 'Active Occupied Assets', count: units.filter(u => u.status === 'Occupied').length, color: '#00875a', icon: CheckCircle2 },
          { label: 'Available Vacant Units', count: units.filter(u => u.status === 'Available').length, color: '#3b82f6', icon: Key },
          { label: 'Under Maintenance', count: units.filter(u => u.status === 'Maintenance').length, color: '#f59e0b', icon: AlertCircle },
        ].map((stat, i) => (
          <div key={i} className="glass-card-premium" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: '24px' }}>
            <div>
              <p style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{stat.label}</p>
              <h3 style={{ fontSize: '28px', fontWeight: '900', marginTop: '4px', color: 'var(--text-main)' }}>{stat.count}</h3>
            </div>
            <div style={{ width: '56px', height: '56px', borderRadius: '18px', background: `${stat.color}15`, color: stat.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <stat.icon size={28} />
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: '8px', padding: '4px', background: '#f1f5f9', borderRadius: '16px', border: '1px solid #cbd5e1' }}>
          {['all', 'occupied', 'available', 'maintenance'].map((t) => (
            <button 
              key={t}
              onClick={() => setFilter(t)}
              style={{ 
                padding: '10px 20px', borderRadius: '12px', border: 'none', 
                fontSize: '13px', fontWeight: '800', textTransform: 'capitalize',
                background: filter === t ? 'white' : 'transparent',
                color: filter === t ? 'var(--primary)' : '#475569',
                boxShadow: filter === t ? '0 4px 12px rgba(0,0,0,0.05)' : 'none',
                cursor: 'pointer', transition: 'all 0.2s'
              }}
            >
              {t} Units ({units.filter(u => t === 'all' || u.status.toLowerCase() === t).length})
            </button>
          ))}
        </div>
        <div style={{ position: 'relative', width: '320px' }}>
          <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Search unit # or property..." 
            style={{ width: '100%', padding: '14px 16px 14px 44px', borderRadius: '16px', border: '1px solid #cbd5e1', fontSize: '14px', fontWeight: '600', background: 'white', outline: 'none', boxSizing: 'border-box' }} 
          />
        </div>
      </div>

      {/* UNIT GRID / LIST */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(350px, 1fr))' : '1fr', 
        gap: '24px' 
      }}>
        {units.filter(u => filter === 'all' || u.status.toLowerCase() === filter).map((unit) => {
          const StatusIcon = statusColors[unit.status].icon;
          const isOccupied = unit.status === 'Occupied';
          const isStandalone = unit.property === 'Standalone Unit / Independent Property';
          const themed = getThemedAsset(unit.id, unit.type, unit.property);
          return (
            <motion.div 
              key={unit.id}
              variants={item}
              whileHover={{ y: -4 }}
              className="glass-card-premium"
              style={{ 
                padding: '28px', 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '20px', 
                borderRadius: '28px',
                border: isOccupied ? '2px solid #a7f3d0' : '1px solid #cbd5e1',
                background: isOccupied ? '#fcfdfd' : 'white'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                  <div style={{ width: '52px', height: '52px', borderRadius: '16px', background: isOccupied ? '#00875a15' : '#f1f5f9', color: isOccupied ? 'var(--primary)' : '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '18px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
                    {unit.icon ? unit.icon.split(' ')[0] : themed.icon.split(' ')[0]}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '22px', fontWeight: '900', color: 'var(--text-main)', margin: '0 0 2px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span>Unit {unit.id}</span>
                      <span style={{ fontSize: '12px', background: '#f8fafc', border: '1px solid #cbd5e1', color: '#334155', padding: '2px 8px', borderRadius: '8px', fontWeight: '800' }}>{unit.icon ? unit.icon.split(' ').slice(1).join(' ') : themed.icon.split(' ').slice(1).join(' ')}</span>
                      {isStandalone && <span style={{ background: '#e0e7ff', color: '#4f46e5', padding: '2px 8px', borderRadius: '8px', fontSize: '11px', fontWeight: '900' }}>STANDALONE</span>}
                    </h3>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '700', margin: 0 }}>{unit.property}</p>
                  </div>
                </div>
                <div style={{ 
                  backgroundColor: statusColors[unit.status].bg, 
                  border: `1px solid ${statusColors[unit.status].border}`,
                  color: statusColors[unit.status].text, 
                  padding: '6px 14px', borderRadius: '14px', 
                  fontSize: '12px', fontWeight: '900',
                  display: 'flex', alignItems: 'center', gap: '6px'
                }}>
                  <StatusIcon size={14} />
                  {unit.status}
                </div>
              </div>

              {/* OCCUPANCY OR SPECS BANNER */}
              <div style={{ background: isOccupied ? '#ecfdf5' : '#f8fafc', padding: '16px 20px', borderRadius: '20px', border: isOccupied ? '1px solid #a7f3d0' : '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: isOccupied ? '12px' : '0' }}>
                  <Users size={18} style={{ color: isOccupied ? '#00875a' : '#64748b' }} />
                  <span style={{ fontSize: '12px', color: isOccupied ? '#065f46' : 'var(--text-muted)', fontWeight: '800', textTransform: 'uppercase' }}>
                    {isOccupied ? 'Active Occupying Tenant' : 'Asset Status'}
                  </span>
                </div>
                {isOccupied ? (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong style={{ fontSize: '16px', fontWeight: '900', color: '#0f172a' }}>{unit.tenant}</strong>
                    <span style={{ fontSize: '11px', background: '#00875a', color: 'white', padding: '2px 8px', borderRadius: '8px', fontWeight: '900' }}>OCCUPIED</span>
                  </div>
                ) : (
                  <p style={{ fontSize: '14px', fontWeight: '800', color: '#64748b', margin: '4px 0 0' }}>
                    Unit is vacant and ready for lease execution via Leases module.
                  </p>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '0 4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '700' }}>Unit Type / Layout</span>
                  <span style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a' }}>{unit.type}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '700' }}>Standard Fiscal Rent</span>
                  <span style={{ fontSize: '15px', fontWeight: '900', color: 'var(--primary)' }}>{unit.price} / mo</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '700' }}>Inclusive Amenities</span>
                  <span style={{ fontSize: '13px', fontWeight: '800', color: '#334155', background: '#f1f5f9', padding: '2px 8px', borderRadius: '6px' }}>
                    {unit.amenities?.length || 0} Equipped Items
                  </span>
                </div>
              </div>

              <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    onClick={() => setSelectedUnitSpecs(unit)}
                    style={{ flex: 1, padding: '12px', borderRadius: '16px', background: '#f8fafc', color: '#334155', border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                  >
                    <ClipboardList size={16} /> Specs Profile
                  </button>
                  <button 
                    onClick={() => {
                      setSelectedUnitForMaintenance(unit);
                      setShowMaintenanceModal(true);
                    }}
                    title="Dispatch Work Order directly to Maintenance & Operations Board"
                    style={{ padding: '12px 16px', borderRadius: '16px', background: '#fff7ed', color: '#d97706', border: '1px solid #fed7aa', fontSize: '13px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', boxShadow: '0 4px 12px rgba(217, 119, 6, 0.15)' }}
                  >
                    <Wrench size={16} /> Log Repair
                  </button>
                </div>
                {unit.status === 'Occupied' ? (
                  <button 
                    onClick={() => handleDelinkTenant(unit.id, unit.tenant)}
                    style={{ width: '100%', padding: '12px', borderRadius: '16px', background: '#fee2e2', color: '#ef4444', border: '1px solid #fca5a5', fontSize: '13px', fontWeight: '900', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.15)' }}
                  >
                    <UserMinus size={16} /> Delink Tenant & Reset Available
                  </button>
                ) : (
                  <button 
                    onClick={() => handleOpenLinkModal(unit)}
                    style={{ width: '100%', padding: '12px', borderRadius: '16px', background: 'var(--primary)', color: 'white', border: 'none', fontSize: '13px', fontWeight: '900', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 6px 15px rgba(0, 135, 90, 0.25)' }}
                  >
                    <UserPlus size={16} /> Assign Tenant & Execute Agreement
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* MODAL: DISPATCH MAINTENANCE TICKET TO OPERATIONS PAGE */}
      <AnimatePresence>
        {showMaintenanceModal && selectedUnitForMaintenance && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200, padding: '24px' }}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              style={{ background: 'white', padding: '48px', borderRadius: '32px', width: '100%', maxWidth: '680px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #e2e8f0', paddingBottom: '20px', marginBottom: '28px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '20px', background: '#fff7ed', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Wrench size={28} />
                  </div>
                  <div>
                    <span style={{ padding: '4px 12px', background: '#f1f5f9', color: '#475569', borderRadius: '14px', fontSize: '11px', fontWeight: '900', textTransform: 'uppercase' }}>Cross-Module Operations Dispatch</span>
                    <h3 style={{ margin: '6px 0 0', fontSize: '24px', fontWeight: '900', color: '#0f172a' }}>Log Repair Ticket: Unit {selectedUnitForMaintenance.id}</h3>
                  </div>
                </div>
                <button onClick={() => setShowMaintenanceModal(false)} style={{ background: '#f1f5f9', border: 'none', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b' }}>
                  <X size={18} />
                </button>
              </div>

              <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', padding: '16px 20px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px', color: '#c2410c', fontWeight: '800', marginBottom: '28px' }}>
                <AlertTriangle size={20} style={{ flexShrink: 0 }} />
                <span>
                  Submitting this work order will instantly update this unit's status to Maintenance and synchronize the repair ticket directly onto the official Operations & Maintenance command board.
                </span>
              </div>

              <form onSubmit={handleDispatchMaintenanceSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '8px', display: 'block' }}>Repair Category</label>
                    <select name="category" required style={{ width: '100%', padding: '14px 16px', borderRadius: '14px', border: '1px solid #cbd5e1', fontSize: '15px', fontWeight: '800', background: '#f8fafc', outline: 'none' }}>
                      <option value="HVAC">HVAC & Air Conditioning</option>
                      <option value="Plumbing">Plumbing & Sanitation</option>
                      <option value="Electrical">Electrical & Lighting</option>
                      <option value="Security Systems">Security, CCTV & Access</option>
                      <option value="Carpentry / Structural">Carpentry & Structural</option>
                      <option value="Elevator">Elevator & Mechanical</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '8px', display: 'block' }}>Severity & Dispatch Priority</label>
                    <select name="priority" required style={{ width: '100%', padding: '14px 16px', borderRadius: '14px', border: '1px solid #cbd5e1', fontSize: '15px', fontWeight: '800', background: '#f8fafc', color: '#d97706', outline: 'none' }}>
                      <option value="High">High Priority Repair</option>
                      <option value="Urgent">Urgent / Emergency Dispatch</option>
                      <option value="Medium">Medium Priority</option>
                      <option value="Low">Low Priority Servicing</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '8px', display: 'block' }}>Issue Title & Summary</label>
                  <input name="title" type="text" placeholder="e.g. Inverter AC Compressor Not Cooling or Faucet Leak" required style={{ width: '100%', padding: '14px 16px', borderRadius: '14px', border: '1px solid #cbd5e1', fontSize: '15px', fontWeight: '800', outline: 'none', boxSizing: 'border-box' }} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '8px', display: 'block' }}>Assigned Contractor / Vendor</label>
                    <input name="assignedTo" type="text" defaultValue="CoolTech HVAC Ltd" placeholder="e.g. CoolTech HVAC Ltd" required style={{ width: '100%', padding: '14px 16px', borderRadius: '14px', border: '1px solid #cbd5e1', fontSize: '15px', fontWeight: '800', outline: 'none', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '8px', display: 'block' }}>Estimated Repair Budget (₵)</label>
                    <input name="estCost" type="number" defaultValue="850" placeholder="850" required style={{ width: '100%', padding: '14px 16px', borderRadius: '14px', border: '1px solid #cbd5e1', fontSize: '15px', fontWeight: '800', color: 'var(--primary)', outline: 'none', boxSizing: 'border-box' }} />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginTop: '16px' }}>
                  <button type="button" onClick={() => setShowMaintenanceModal(false)} style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', color: '#475569', padding: '16px 28px', borderRadius: '16px', fontWeight: '800', fontSize: '15px', cursor: 'pointer' }}>Cancel</button>
                  <button type="submit" style={{ background: '#d97706', color: 'white', border: 'none', padding: '16px 36px', borderRadius: '16px', fontSize: '15px', fontWeight: '800', cursor: 'pointer', boxShadow: '0 8px 25px rgba(217, 119, 6, 0.4)' }}>
                    Dispatch to Operations Board
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: UNIT SPECS & AMENITIES PROFILE */}
      <AnimatePresence>
        {selectedUnitSpecs && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '24px' }}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              style={{ background: 'white', padding: '48px', borderRadius: '32px', width: '100%', maxWidth: '750px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #e2e8f0', paddingBottom: '20px', marginBottom: '28px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '20px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ClipboardList size={28} />
                  </div>
                  <div>
                    <span style={{ padding: '4px 12px', background: '#f1f5f9', color: '#475569', borderRadius: '14px', fontSize: '11px', fontWeight: '900', textTransform: 'uppercase' }}>Asset Inspection Record</span>
                    <h3 style={{ margin: '6px 0 0', fontSize: '24px', fontWeight: '900', color: '#0f172a' }}>
                      Unit {selectedUnitSpecs.id} Portfolio
                      {selectedUnitSpecs.property === 'Standalone Unit / Independent Property' && (
                        <span style={{ marginLeft: '10px', background: '#e0e7ff', color: '#4f46e5', padding: '2px 8px', borderRadius: '8px', fontSize: '12px', fontWeight: '900' }}>STANDALONE ASSET</span>
                      )}
                    </h3>
                  </div>
                </div>
                 <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <button 
                    onClick={() => { setSelectedUnitToEdit(selectedUnitSpecs); setShowEditModal(true); }}
                    style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', color: '#334155', padding: '10px 18px', borderRadius: '14px', fontSize: '13px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                  >
                    <Edit3 size={16} /> Edit Unit Specs
                  </button>
                  <button 
                    onClick={() => handleDeleteUnit(selectedUnitSpecs.id)}
                    style={{ background: '#fee2e2', border: '1px solid #fca5a5', color: '#ef4444', padding: '10px 18px', borderRadius: '14px', fontSize: '13px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                  >
                    <Trash2 size={16} /> Delete Unit
                  </button>
                  <button onClick={() => setSelectedUnitSpecs(null)} style={{ background: '#f1f5f9', border: 'none', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b', marginLeft: '8px' }}>
                    <X size={18} />
                  </button>
                </div>
              </div>

              <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', padding: '16px 20px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px', color: '#1e3a8a', fontWeight: '800', marginBottom: '28px' }}>
                <ClipboardList size={20} style={{ flexShrink: 0 }} />
                <span>Physical specifications and verified inclusive amenities log (fans, fitted wardrobes, AC lines). To execute a lease or assign a resident, please navigate to the dedicated Leases module.</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
                {/* KEY SPECS GRID */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                  <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '20px', border: '1px solid #cbd5e1' }}>
                    <Ruler size={22} style={{ color: 'var(--primary)', marginBottom: '8px' }} />
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '800', display: 'block' }}>Total Square Footage</span>
                    <strong style={{ fontSize: '16px', fontWeight: '900', color: '#0f172a' }}>{selectedUnitSpecs.sqft || '1,250 sq.ft'}</strong>
                  </div>
                  <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '20px', border: '1px solid #cbd5e1' }}>
                    <Wrench size={22} style={{ color: '#d97706', marginBottom: '8px' }} />
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '800', display: 'block' }}>HVAC System Spec</span>
                    <strong style={{ fontSize: '15px', fontWeight: '900', color: '#0f172a' }}>{selectedUnitSpecs.hvac || 'Dual Inverter AC'}</strong>
                  </div>
                  <div style={{ background: '#ecfdf5', padding: '20px', borderRadius: '20px', border: '1px solid #10b981' }}>
                    <ThumbsUp size={22} style={{ color: '#10b981', marginBottom: '8px' }} />
                    <span style={{ fontSize: '12px', color: '#065f46', fontWeight: '800', display: 'block' }}>Inspection Rating</span>
                    <strong style={{ fontSize: '15px', fontWeight: '900', color: '#065f46' }}>{selectedUnitSpecs.inspection || 'Certified Ready'}</strong>
                  </div>
                </div>

                {/* AMENITIES CHECKLIST */}
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: '900', color: '#0f172a', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Verified Amenities Inventory ({selectedUnitSpecs.amenities?.length || 0} Total Included Features)
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', background: '#f8fafc', padding: '20px', borderRadius: '20px', border: '1px solid #cbd5e1' }}>
                    {selectedUnitSpecs.amenities?.map((amenity, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'white', padding: '10px 16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                        <Check size={18} style={{ color: '#10b981' }} />
                        <span style={{ fontSize: '14px', fontWeight: '800', color: '#334155' }}>{amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* SERVICE ATTESTATION */}
                <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', padding: '24px', borderRadius: '24px' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: '900', color: '#0f172a', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Wrench size={18} style={{ color: '#d97706' }} /> Operational Readiness Attestations
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', paddingBottom: '16px', borderBottom: '1px solid #e2e8f0' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <ShieldCheck size={20} />
                      </div>
                      <div>
                        <strong style={{ fontSize: '15px', fontWeight: '900', color: '#0f172a', display: 'block' }}>HVAC & Dual Inverter Line Verification</strong>
                        <span style={{ fontSize: '13px', color: '#64748b', marginTop: '2px', display: 'block' }}>Split air condition line flushed, gas pressures verified to standard nominal bar.</span>
                        <span style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: '800', marginTop: '6px', display: 'block' }}>CERTIFIED RECENT INSPECTION</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#ecfdf5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <ShieldCheck size={20} />
                      </div>
                      <div>
                        <strong style={{ fontSize: '15px', fontWeight: '900', color: '#0f172a', display: 'block' }}>Prepaid Meter & Polytank Valve KYP Attestation</strong>
                        <span style={{ fontSize: '13px', color: '#64748b', marginTop: '2px', display: 'block' }}>Water booster pump serviced and prepaid electricity meter sealed.</span>
                        <span style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: '800', marginTop: '6px', display: 'block' }}>COMPLETED MARCH 2026</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
                  {selectedUnitSpecs.status === 'Occupied' ? (
                    <button 
                      onClick={() => handleDelinkTenant(selectedUnitSpecs.id, selectedUnitSpecs.tenant)}
                      style={{ background: '#fee2e2', color: '#ef4444', border: '1px solid #fca5a5', padding: '16px 32px', borderRadius: '16px', fontSize: '15px', fontWeight: '900', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 8px 25px rgba(239, 68, 68, 0.25)' }}
                    >
                      <UserMinus size={18} /> Delink Tenant & Reset Available
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleOpenLinkModal(selectedUnitSpecs)} 
                      style={{ background: 'var(--primary)', color: 'white', border: 'none', padding: '16px 32px', borderRadius: '16px', fontSize: '15px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 8px 25px rgba(0, 135, 90, 0.4)' }}
                    >
                      <UserPlus size={18} /> Assign Tenant & Execute Agreement
                    </button>
                  )}
                  <button onClick={() => setSelectedUnitSpecs(null)} style={{ background: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', padding: '16px 36px', borderRadius: '16px', fontSize: '15px', fontWeight: '800', cursor: 'pointer' }}>
                    Close Portfolio
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Unit Modal */}
      <AnimatePresence>
        {showEditModal && selectedUnitToEdit && (
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
                    <h3 style={{ margin: '6px 0 0', fontSize: '24px', fontWeight: '900', color: '#0f172a' }}>Edit Unit Specs: {selectedUnitToEdit.id}</h3>
                  </div>
                </div>
                <button onClick={() => setShowEditModal(false)} style={{ background: '#f1f5f9', border: 'none', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', cursor: 'pointer' }}>
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleEditUnitSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '8px', display: 'block' }}>Unit Layout Type</label>
                  <select name="type" defaultValue={selectedUnitToEdit.type} required style={{ width: '100%', padding: '16px 20px', borderRadius: '16px', border: '1px solid #cbd5e1', fontSize: '15px', fontWeight: '800', background: '#f8fafc', outline: 'none' }}>
                    <option value="🏪 Retail Shop / Commercial Store">🏪 Retail Shop / Commercial Store</option>
                    <option value="🛏️ Furnished Studio Suite">🛏️ Furnished Studio Suite</option>
                    <option value="🏢 1 Bedroom Apartment">🏢 1 Bedroom Apartment</option>
                    <option value="🏢 2 Bedroom Apartment">🏢 2 Bedroom Apartment</option>
                    <option value="🏢 3 Bedroom Luxury Penthouse">🏢 3 Bedroom Luxury Penthouse</option>
                    <option value="🏢 4 Bedroom Executive Suite">🏢 4 Bedroom Executive Suite</option>
                    <option value="🏡 5 Bedroom Luxury Villa">🏡 5 Bedroom Luxury Villa</option>
                    <option value="🏡 6 Bedroom Mansion">🏡 6 Bedroom Mansion</option>
                    <option value="🏰 7+ Bedroom Premium Estate">🏰 7+ Bedroom Premium Estate</option>
                    <option value="🏡 Executive Standalone Villa">🏡 Executive Standalone Villa</option>
                    <option value="💼 Commercial Office Suite">💼 Commercial Office Suite</option>
                    <option value="🏭 Storage / Warehouse Bay">🏭 Storage / Warehouse Bay</option>
                  </select>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div>
                    <label style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '8px', display: 'block' }}>Monthly Rental Rate (₵)</label>
                    <input name="price" type="text" defaultValue={selectedUnitToEdit.price} required style={{ width: '100%', padding: '16px 20px', borderRadius: '16px', border: '1px solid #cbd5e1', fontSize: '15px', fontWeight: '800', color: 'var(--primary)', boxSizing: 'border-box', outline: 'none' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '8px', display: 'block' }}>Approx. Square Footage</label>
                    <input name="sqft" type="text" defaultValue={selectedUnitToEdit.sqft} required style={{ width: '100%', padding: '16px 20px', borderRadius: '16px', border: '1px solid #cbd5e1', fontSize: '15px', fontWeight: '800', boxSizing: 'border-box', outline: 'none' }} />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '8px', display: 'block' }}>HVAC System Spec</label>
                  <input name="hvac" type="text" defaultValue={selectedUnitToEdit.hvac || 'Dual Inverter Split AC'} required style={{ width: '100%', padding: '16px 20px', borderRadius: '16px', border: '1px solid #cbd5e1', fontSize: '15px', fontWeight: '800', boxSizing: 'border-box', outline: 'none' }} />
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

      {/* Add Unit Modal */}
      <AnimatePresence>
        {showModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '24px' }}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              style={{ background: 'white', padding: '48px', borderRadius: '32px', width: '100%', maxWidth: '780px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #e2e8f0', paddingBottom: '20px', marginBottom: '28px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '20px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Building2 size={28} />
                  </div>
                  <div>
                    <span style={{ padding: '4px 12px', background: '#f1f5f9', color: '#475569', borderRadius: '14px', fontSize: '11px', fontWeight: '900', textTransform: 'uppercase' }}>Portfolio Registry</span>
                    <h3 style={{ margin: '6px 0 0', fontSize: '24px', fontWeight: '900', color: '#0f172a' }}>Add Unit & Inclusive Amenities</h3>
                  </div>
                </div>
                <button onClick={() => setShowModal(false)} style={{ background: '#f1f5f9', border: 'none', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b' }}>
                  <X size={18} />
                </button>
              </div>
              

              
              <form onSubmit={handleAddUnit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '8px', display: 'block' }}>Parent Property Asset or Standalone</label>
                  <select name="property" required style={{ width: '100%', padding: '16px 20px', borderRadius: '16px', border: '2px solid var(--primary)', fontSize: '15px', fontWeight: '800', background: '#f8fafc', outline: 'none', cursor: 'pointer' }}>
                    <option value="Standalone Unit / Independent Property">🏡 Standalone Unit / Independent Property (No Parent Asset)</option>
                    <option value="Grand Horizon">Grand Horizon (Apartment Complex)</option>
                    <option value="Riverside Residencies">Riverside Residencies</option>
                    <option value="The Peninsula">The Peninsula (Executive Towers)</option>
                  </select>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div>
                    <label style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '8px', display: 'block' }}>Unit Number / Label</label>
                    <div style={{ position: 'relative' }}>
                      <Hash size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                      <input name="unitId" type="text" placeholder="e.g. VILLA-07 or 105-B" required style={{ width: '100%', padding: '16px 16px 16px 44px', borderRadius: '16px', border: '1px solid #cbd5e1', fontSize: '15px', fontWeight: '800', boxSizing: 'border-box', outline: 'none' }} />
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '8px', display: 'block' }}>Unit Type / Layout</label>
                    <select name="type" required style={{ width: '100%', padding: '16px 20px', borderRadius: '16px', border: '1px solid #cbd5e1', fontSize: '15px', fontWeight: '800', background: '#f8fafc', outline: 'none' }}>
                      <option value="🏪 Retail Shop / Commercial Store">🏪 Retail Shop / Commercial Store</option>
                      <option value="🛏️ Furnished Studio Suite">🛏️ Furnished Studio Suite</option>
                      <option value="🏢 1 Bedroom Apartment">🏢 1 Bedroom Apartment</option>
                      <option value="🏢 2 Bedroom Apartment">🏢 2 Bedroom Apartment</option>
                      <option value="🏢 3 Bedroom Luxury Penthouse">🏢 3 Bedroom Luxury Penthouse</option>
                      <option value="🏢 4 Bedroom Executive Suite">🏢 4 Bedroom Executive Suite</option>
                      <option value="🏡 5 Bedroom Luxury Villa">🏡 5 Bedroom Luxury Villa</option>
                      <option value="🏡 6 Bedroom Mansion">🏡 6 Bedroom Mansion</option>
                      <option value="🏰 7+ Bedroom Premium Estate">🏰 7+ Bedroom Premium Estate</option>
                      <option value="🏡 Executive Standalone Villa">🏡 Executive Standalone Villa</option>
                      <option value="💼 Commercial Office Suite">💼 Commercial Office Suite</option>
                      <option value="🏭 Storage / Warehouse Bay">🏭 Storage / Warehouse Bay</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div>
                    <label style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '8px', display: 'block' }}>Monthly Rental Rate (₵ GHS)</label>
                    <input name="price" type="number" placeholder="3500" required style={{ width: '100%', padding: '16px 20px', borderRadius: '16px', border: '1px solid #cbd5e1', fontSize: '15px', fontWeight: '800', color: 'var(--primary)', boxSizing: 'border-box', outline: 'none' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '8px', display: 'block' }}>Approx. Square Footage</label>
                    <input name="sqft" type="text" placeholder="1,400 sq.ft" defaultValue="1,400 sq.ft" required style={{ width: '100%', padding: '16px 20px', borderRadius: '16px', border: '1px solid #cbd5e1', fontSize: '15px', fontWeight: '800', boxSizing: 'border-box', outline: 'none' }} />
                  </div>
                </div>

                {/* INCLUSIVE AMENITIES CHECKLIST */}
                <div style={{ borderTop: '2px solid #e2e8f0', paddingTop: '20px' }}>
                  <label style={{ fontSize: '14px', fontWeight: '900', color: '#0f172a', marginBottom: '12px', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Select Inclusive Amenities (Fans, Fitted Wardrobes, Inverters, etc.)
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', background: '#f8fafc', padding: '20px', borderRadius: '20px', border: '1px solid #cbd5e1' }}>
                    {newAmenities.map((amenity, idx) => (
                      <div 
                        key={idx}
                        onClick={() => toggleAmenity(idx)}
                        style={{ 
                          display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', 
                          background: amenity.checked ? '#ecfdf5' : 'white', 
                          border: amenity.checked ? '2px solid #10b981' : '1px solid #cbd5e1', 
                          borderRadius: '14px', cursor: 'pointer', transition: 'all 0.2s' 
                        }}
                      >
                        {amenity.checked ? <CheckSquare size={20} color="#10b981" /> : <Square size={20} color="#64748b" />}
                        <span style={{ fontSize: '14px', fontWeight: amenity.checked ? '900' : '700', color: amenity.checked ? '#065f46' : '#334155' }}>
                          {amenity.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginTop: '12px' }}>
                  <button type="button" onClick={() => setShowModal(false)} style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', color: '#475569', padding: '16px 28px', borderRadius: '16px', fontWeight: '800', fontSize: '15px', cursor: 'pointer' }}>Cancel</button>
                  <button type="submit" style={{ backgroundColor: 'var(--primary)', color: 'white', border: 'none', padding: '16px 36px', borderRadius: '16px', fontSize: '15px', fontWeight: '800', cursor: 'pointer', boxShadow: '0 8px 25px rgba(0, 135, 90, 0.4)' }}>
                    Register Unit Profile & Amenities
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: LINK UNIT TO TENANT */}
      <AnimatePresence>
        {showLinkModal && selectedUnitForLink && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200, padding: '24px' }}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              style={{ background: 'white', padding: '48px', borderRadius: '32px', width: '100%', maxWidth: '680px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #e2e8f0', paddingBottom: '20px', marginBottom: '28px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '20px', background: '#ecfdf5', color: '#00875a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <UserPlus size={28} />
                  </div>
                  <div>
                    <span style={{ padding: '4px 12px', background: '#f1f5f9', color: '#475569', borderRadius: '14px', fontSize: '11px', fontWeight: '900', textTransform: 'uppercase' }}>Lease Execution Workflow</span>
                    <h3 style={{ margin: '6px 0 0', fontSize: '24px', fontWeight: '900', color: '#0f172a' }}>Link Unit {selectedUnitForLink.id} to Resident</h3>
                  </div>
                </div>
                <button onClick={() => setShowLinkModal(false)} style={{ background: '#f1f5f9', border: 'none', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b' }}>
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleExecuteLinkAndAgreement} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '20px', border: '1px solid #cbd5e1' }}>
                  <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--primary)', textTransform: 'uppercase', display: 'block' }}>Target Asset Specification</span>
                  <strong style={{ fontSize: '18px', fontWeight: '900', color: '#0f172a', margin: '4px 0 2px', display: 'block' }}>{selectedUnitForLink.property} • Unit {selectedUnitForLink.id}</strong>
                  <span style={{ fontSize: '14px', color: '#475569', fontWeight: '600' }}>Standard Fiscal Rent: <strong style={{ color: '#0f172a' }}>{selectedUnitForLink.price} / mo</strong></span>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>Select Verified Resident KYC Profile</label>
                  <select 
                    value={selectedTenantIdForLink} 
                    onChange={e => setSelectedTenantIdForLink(e.target.value)}
                    style={{ width: '100%', padding: '16px 20px', borderRadius: '16px', border: '1px solid #cbd5e1', fontSize: '15px', fontWeight: '800', background: 'white', color: '#0f172a', outline: 'none' }}
                  >
                    {tenants.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.status === 'Registered / Unassigned' ? '🟢 Registered / Unassigned' : `🔄 Currently: Unit ${t.unit}`}) - {t.ghanaCardNo}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>Lease Agreement Term Duration</label>
                  <select 
                    value={leaseDurationMonths} 
                    onChange={e => setLeaseDurationMonths(Number(e.target.value))}
                    style={{ width: '100%', padding: '16px 20px', borderRadius: '16px', border: '1px solid #cbd5e1', fontSize: '15px', fontWeight: '800', background: 'white', color: '#0f172a', outline: 'none' }}
                  >
                    <option value={6}>6 Months Standard Lease</option>
                    <option value={12}>12 Months (1 Year Full Term)</option>
                    <option value={24}>24 Months (2 Year Extended Term)</option>
                    <option value={36}>36 Months (3 Year Multi-Term Lock)</option>
                  </select>
                </div>

                <div style={{ background: '#eff6ff', padding: '16px 20px', borderRadius: '16px', border: '1px solid #bfdbfe', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px', color: '#1e3a8a', fontWeight: '700' }}>
                  <FileText size={20} style={{ flexShrink: 0 }} />
                  <span>Execution instantly assigns this unit, updates the resident ledger, and generates a printable PDF formal rental agreement.</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginTop: '12px' }}>
                  <button type="button" onClick={() => setShowLinkModal(false)} style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', color: '#475569', padding: '16px 28px', borderRadius: '16px', fontWeight: '800', fontSize: '15px', cursor: 'pointer' }}>Cancel</button>
                  <button type="submit" style={{ backgroundColor: 'var(--primary)', color: 'white', border: 'none', padding: '16px 36px', borderRadius: '16px', fontSize: '15px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 8px 25px rgba(0, 135, 90, 0.4)' }}>
                    <UserPlus size={20} /> Execute Lease & Link Asset
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* COMPREHENSIVE EDITABLE PDF AGREEMENT MODAL */}
      <AnimatePresence>
        {generatedAgreement && (
          <div className="print-modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.9)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1300, padding: '24px' }}>
            <motion.div 
              className="print-modal-content"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              style={{ width: '100%', maxWidth: '1000px', height: '92vh', background: 'white', borderRadius: '32px', overflowY: 'auto', padding: '56px 64px', position: 'relative', boxShadow: '0 50px 100px rgba(0,0,0,0.6)', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
            >
              <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '16px 24px', borderRadius: '20px', border: '1px solid #e2e8f0', marginBottom: '40px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ padding: '6px 14px', background: isEditMode ? '#fff7ed' : '#ecfdf5', color: isEditMode ? '#c2410c' : '#00875a', border: isEditMode ? '1px solid #ffedd5' : '1px solid #a7f3d0', borderRadius: '16px', fontSize: '13px', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {isEditMode ? <Unlock size={16} /> : <Lock size={16} />} 
                    {isEditMode ? 'UNLOCKED: EDITING CONTRACT CLAUSES' : 'LOCKED: FORMAL DOCUMENT READY'}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <button 
                    onClick={() => setIsEditMode(!isEditMode)}
                    style={{ background: isEditMode ? 'var(--primary)' : 'white', color: isEditMode ? 'white' : '#0f172a', border: isEditMode ? 'none' : '2px solid #cbd5e1', padding: '12px 24px', borderRadius: '16px', fontWeight: '800', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s' }}
                  >
                    {isEditMode ? <Save size={18} /> : <Edit3 size={18} />}
                    {isEditMode ? 'Lock Contract Clauses' : 'Edit Agreement Text'}
                  </button>
                  <button 
                    disabled={isGeneratingPdf}
                    onClick={handleExportPdf}
                    style={{ background: 'var(--primary)', color: 'white', border: 'none', padding: '12px 28px', borderRadius: '16px', fontWeight: '800', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 8px 20px rgba(0, 135, 90, 0.3)', opacity: isGeneratingPdf ? 0.7 : 1 }}
                  >
                    <Printer size={18} /> {isGeneratingPdf ? 'Generating Real PDF...' : 'Download Real PDF'}
                  </button>
                  <button onClick={() => setGeneratedAgreement(null)} style={{ background: '#f1f5f9', border: 'none', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b' }}>
                    <X size={20} />
                  </button>
                </div>
              </div>
              
              <div className="agreement-print-area" style={{ color: '#1e293b' }}>
                <div style={{ textAlign: 'center', marginBottom: '48px' }}>
                  <Building2 size={56} color="var(--primary)" style={{ marginBottom: '16px' }} />
                  <h1 style={{ fontSize: '32px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '2px', color: '#0f172a', margin: '0 0 8px' }}>Residential Tenancy Lease Agreement</h1>
                  <p style={{ color: '#64748b', fontSize: '15px', fontWeight: '700', margin: 0 }}>Official Legal Instrument • RealtyOS Operations</p>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', marginBottom: '48px', paddingBottom: '36px', borderBottom: '2px solid #e2e8f0' }}>
                  <div>
                    <span style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '12px', fontWeight: '900', letterSpacing: '1px', display: 'block' }}>Landlord / Management Entity</span>
                    {isEditMode ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <input type="text" value={editLandlordName} onChange={e => setEditLandlordName(e.target.value)} style={{ padding: '10px 14px', borderRadius: '10px', border: '2px solid var(--primary)', fontWeight: '800', fontSize: '16px', outline: 'none' }} />
                        <input type="text" value={editLandlordAddress} onChange={e => setEditLandlordAddress(e.target.value)} style={{ padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }} />
                        <input type="text" value={editLandlordPhone} onChange={e => setEditLandlordPhone(e.target.value)} style={{ padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }} />
                      </div>
                    ) : (
                      <div>
                        <p style={{ fontSize: '18px', fontWeight: '900', color: '#0f172a', margin: '0 0 4px' }}>{editLandlordName}</p>
                        <p style={{ fontSize: '15px', color: '#475569', margin: '0 0 2px' }}>{editLandlordAddress}</p>
                        <p style={{ fontSize: '15px', color: '#475569', margin: 0 }}>Phone: {editLandlordPhone}</p>
                      </div>
                    )}
                  </div>

                  <div>
                    <span style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '12px', fontWeight: '900', letterSpacing: '1px', display: 'block' }}>The Registered Tenant</span>
                    <p style={{ fontSize: '18px', fontWeight: '900', color: '#0f172a', margin: '0 0 6px' }}>{generatedAgreement.tenant}</p>
                    <p style={{ fontSize: '15px', color: '#475569', margin: '0 0 4px' }}>Lease Reference No: <strong style={{ color: 'var(--primary)' }}>{generatedAgreement.leaseId}</strong></p>
                    <p style={{ fontSize: '15px', color: '#475569', margin: 0 }}>Ghana Card PIN: <span style={{ color: '#00875a', fontWeight: '800', background: '#ecfdf5', padding: '2px 8px', borderRadius: '6px' }}>{generatedAgreement.ghanaCardNo}</span></p>
                  </div>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
                  <section>
                    <h3 style={{ fontSize: '18px', fontWeight: '900', marginBottom: '16px', color: '#0f172a', borderLeft: '4px solid var(--primary)', paddingLeft: '16px' }}>1. THE PREMISES</h3>
                    {isEditMode ? (
                      <textarea 
                        value={editPremisesClause} 
                        onChange={e => setEditPremisesClause(e.target.value)}
                        rows={4}
                        style={{ width: '100%', padding: '16px', borderRadius: '16px', border: '2px solid var(--primary)', fontSize: '15px', lineHeight: '1.6', outline: 'none', boxSizing: 'border-box' }}
                      />
                    ) : (
                      <p style={{ fontSize: '15px', color: '#334155', lineHeight: '1.7', margin: 0 }}>{editPremisesClause}</p>
                    )}
                  </section>

                  <section>
                    <h3 style={{ fontSize: '18px', fontWeight: '900', marginBottom: '16px', color: '#0f172a', borderLeft: '4px solid var(--primary)', paddingLeft: '16px' }}>2. CONTRACT TERM & RENT SCHEDULE</h3>
                    <div style={{ border: '1px solid #cbd5e1', borderRadius: '20px', overflow: 'hidden' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '15px' }}>
                        <thead style={{ background: '#f8fafc', borderBottom: '1px solid #cbd5e1' }}>
                          <tr>
                            <th style={{ padding: '16px 20px', fontWeight: '900', color: '#0f172a' }}>Financial Obligation Item</th>
                            <th style={{ padding: '16px 20px', fontWeight: '900', color: '#0f172a' }}>Rate & Basis</th>
                            <th style={{ padding: '16px 20px', fontWeight: '900', color: '#0f172a', textAlign: 'right' }}>Total Val (GHS ₵)</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                            <td style={{ padding: '16px 20px', fontWeight: '800', color: '#334155' }}>Monthly Rental Rate</td>
                            <td style={{ padding: '16px 20px', color: '#64748b' }}>₵{generatedAgreement.monthlyRent.toLocaleString()} × {generatedAgreement.months} Months</td>
                            <td style={{ padding: '16px 20px', fontWeight: '900', textAlign: 'right', color: '#0f172a' }}>₵{generatedAgreement.totalBaseCost.toLocaleString()}</td>
                          </tr>
                          <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                            <td style={{ padding: '16px 20px', fontWeight: '800', color: '#334155' }}>Security Deposit Escrow</td>
                            <td style={{ padding: '16px 20px', color: '#64748b' }}>Refundable deposit upon vacating</td>
                            <td style={{ padding: '16px 20px', fontWeight: '900', textAlign: 'right', color: '#00875a' }}>₵{generatedAgreement.securityDeposit.toLocaleString()}</td>
                          </tr>
                          <tr style={{ background: '#f8fafc', fontWeight: '900' }}>
                            <td colSpan={2} style={{ padding: '18px 20px', color: '#0f172a', fontSize: '16px' }}>Total Contract Value at Execution</td>
                            <td style={{ padding: '18px 20px', textAlign: 'right', color: 'var(--primary)', fontSize: '20px' }}>₵{(generatedAgreement.totalBaseCost + generatedAgreement.securityDeposit).toLocaleString()}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </section>

                  <section>
                    <h3 style={{ fontSize: '18px', fontWeight: '900', marginBottom: '16px', color: '#0f172a', borderLeft: '4px solid var(--primary)', paddingLeft: '16px' }}>3. RESIDENT KYC & EMPLOYMENT ATTESTATION</h3>
                    <div style={{ background: '#f8fafc', padding: '24px', borderRadius: '20px', border: '1px solid #cbd5e1', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', fontSize: '15px' }}>
                      <div>
                        <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', display: 'block' }}>Verified Employer / Work Organization</span>
                        <strong style={{ color: '#0f172a', marginTop: '2px', display: 'block' }}>{generatedAgreement.employer}</strong>
                      </div>
                      <div>
                        <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', display: 'block' }}>Professional Title / Occupation</span>
                        <strong style={{ color: '#0f172a', marginTop: '2px', display: 'block' }}>{generatedAgreement.occupation}</strong>
                      </div>
                      <div style={{ borderTop: '1px solid #cbd5e1', paddingTop: '16px' }}>
                        <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', display: 'block' }}>Emergency Guarantor Name</span>
                        <strong style={{ color: '#0f172a', marginTop: '2px', display: 'block' }}>{generatedAgreement.guarantorName} ({generatedAgreement.guarantorPhone})</strong>
                      </div>
                      <div style={{ borderTop: '1px solid #cbd5e1', paddingTop: '16px' }}>
                        <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', display: 'block' }}>Legal Witness Designated</span>
                        <strong style={{ color: '#0f172a', marginTop: '2px', display: 'block' }}>{generatedAgreement.witnessName} ({generatedAgreement.witnessPhone})</strong>
                      </div>
                    </div>
                  </section>

                  <section style={{ marginTop: '30px', paddingTop: '40px', borderTop: '2px solid #cbd5e1', pageBreakInside: 'avoid' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '900', marginBottom: '36px', color: '#0f172a', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '1px' }}>4. SIGNATURES & EXECUTION</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '40px' }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ height: '60px', borderBottom: '2px solid #0f172a', marginBottom: '12px' }}></div>
                        <strong style={{ fontSize: '15px', color: '#0f172a', display: 'block' }}>Landlord / Management Entity</strong>
                        <span style={{ fontSize: '12px', color: '#64748b' }}>Authorized Signatory</span>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ height: '60px', borderBottom: '2px solid #0f172a', marginBottom: '12px' }}></div>
                        <strong style={{ fontSize: '15px', color: '#0f172a', display: 'block' }}>{generatedAgreement.tenant}</strong>
                        <span style={{ fontSize: '12px', color: '#64748b' }}>Registered Tenant</span>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ height: '60px', borderBottom: '2px solid #0f172a', marginBottom: '12px' }}></div>
                        <strong style={{ fontSize: '15px', color: '#0f172a', display: 'block' }}>{generatedAgreement.witnessName}</strong>
                        <span style={{ fontSize: '12px', color: '#64748b' }}>Designated Legal Witness</span>
                      </div>
                    </div>
                    <div style={{ textAlign: 'center', marginTop: '36px', fontSize: '12px', color: '#94a3b8', fontWeight: '700' }}>
                      Execution Date: {generatedAgreement.startDate} • Validated Biometrically via RealtyOS Secure Blockchain Hash
                    </div>
                  </section>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Units;
