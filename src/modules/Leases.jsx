import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, Plus, Search, Filter, Calendar, 
  User, Building2, Clock, CheckCircle2, 
  AlertCircle, ChevronRight, MoreHorizontal, Download, Printer,
  X, UserPlus, LogOut, Check, FileCheck, MapPin, ShieldCheck,
  Edit3, Save, Lock, Unlock, Trash2, Users, Calculator, DollarSign, Layers, Landmark, Ban, RefreshCcw, Scale, Receipt
} from 'lucide-react';
import { generateRealPDF } from '../lib/pdfService';
import { getStoredLeases, saveStoredLeases, getStoredUnits, saveStoredUnits, getStoredTenants, saveStoredTenants } from '../lib/masterData';

const Leases = () => {
  const [filter, setFilter] = useState('active');
  const [showModal, setShowModal] = useState(false);
  const [agreementView, setAgreementView] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const handleExportPdf = async () => {
    setIsGeneratingPdf(true);
    await generateRealPDF('.agreement-print-area', `Lease_Agreement_${agreementView?.unit ? agreementView.unit.replace(/\s+/g, '_') : '101'}.pdf`, { orientation: 'p' });
    setIsGeneratingPdf(false);
  };

  // Early Lease Termination Settlement States
  const [showTerminationModal, setShowTerminationModal] = useState(false);
  const [selectedLeaseToTerminate, setSelectedLeaseToTerminate] = useState(null);
  const [terminationCalculation, setTerminationCalculation] = useState(null);

  // Registered Master Tenant Registry
  const [registeredTenants, setRegisteredTenants] = useState(getStoredTenants());
  useEffect(() => {
    const syncT = () => setRegisteredTenants(getStoredTenants());
    window.addEventListener('realtyos_tenants_update', syncT);
    return () => window.removeEventListener('realtyos_tenants_update', syncT);
  }, []);

  const [masterUnits, setMasterUnits] = useState(getStoredUnits());
  useEffect(() => {
    const syncU = () => setMasterUnits(getStoredUnits());
    window.addEventListener('realtyos_rental_update', syncU);
    return () => window.removeEventListener('realtyos_rental_update', syncU);
  }, []);

  const availableUnits = masterUnits
    .filter(u => u.status === 'Available')
    .map(u => ({ property: u.property, unit: u.id, rent: Number(u.price.replace(/[^0-9.-]+/g, '')) || 3500 }));

  // Automated Fiscal Month & Charges Calculation States
  const [selectedStartDate, setSelectedStartDate] = useState('2026-05-15');
  const [selectedEndDate, setSelectedEndDate] = useState('2027-05-15');
  const [selectedUnitRent, setSelectedUnitRent] = useState(3500);
  const [serviceChargeMonthly, setServiceChargeMonthly] = useState(500);
  const [commissionFee, setCommissionFee] = useState(2500);
  const [otherCharges, setOtherCharges] = useState(1000);

  const calculateMonths = (start, end) => {
    const d1 = new Date(start);
    const d2 = new Date(end);
    if (isNaN(d1) || isNaN(d2) || d2 <= d1) return 1;
    const m = (d2.getFullYear() - d1.getFullYear()) * 12 + (d2.getMonth() - d1.getMonth());
    return m <= 0 ? 1 : m;
  };

  const calculatedMonthsCount = calculateMonths(selectedStartDate, selectedEndDate);
  const totalBaseRentalCost = selectedUnitRent * calculatedMonthsCount;
  const totalServiceChargeCost = serviceChargeMonthly * calculatedMonthsCount;
  const totalContractValue = totalBaseRentalCost + totalServiceChargeCost + commissionFee + otherCharges;

  // Initial Leases with calculated metadata
  const [leases, setLeases] = useState(getStoredLeases());
  useEffect(() => {
    const syncL = () => setLeases(getStoredLeases());
    window.addEventListener('realtyos_rental_update', syncL);
    return () => window.removeEventListener('realtyos_rental_update', syncL);
  }, []);

  // Editable Agreement States
  const [isEditMode, setIsEditMode] = useState(false);
  const [editLandlordName, setEditLandlordName] = useState('RealtyOS Managed Assets Ltd.');
  const [editLandlordAddress, setEditLandlordAddress] = useState('12 Airport City, Executive Block, Accra, Ghana');
  const [editLandlordPhone, setEditLandlordPhone] = useState('+233 24 000 0000');
  const [editPremisesClause, setEditPremisesClause] = useState('');
  const [editTermsClause, setEditTermsClause] = useState('');
  const [editSpecialConditions, setEditSpecialConditions] = useState([]);
  const [newConditionInput, setNewConditionInput] = useState('');

  const statusColors = {
    'Active': { bg: '#00875a15', text: '#00875a', icon: CheckCircle2 },
    'Expiring': { bg: '#f59e0b15', text: '#f59e0b', icon: AlertCircle },
    'Pending Renewal': { bg: '#6366f115', text: '#6366f1', icon: Clock },
    'Terminated': { bg: '#ef444415', text: '#ef4444', icon: LogOut }
  };

  const handleUnitSelectChange = (e) => {
    const val = e.target.value.split('|||');
    const unitObj = availableUnits.find(u => u.property === val[0] && u.unit === val[1]);
    if (unitObj) {
      setSelectedUnitRent(unitObj.rent);
    }
  };

  // Automated Termination & Remaining Balance Calculation Logic
  const handleInitiateTermination = (lease) => {
    const today = new Date();
    const startDate = new Date(lease.start);
    const endDate = new Date(lease.end);
    
    const isDue = today >= endDate;
    const totalMonths = lease.months || 12;
    const monthlyRent = lease.monthlyRent || parseInt(lease.amount.replace(/[^0-9]/g, '')) || 3500;
    
    let usedMonths = calculateMonths(startDate, today);
    if (usedMonths > totalMonths) usedMonths = totalMonths;
    let remainingMonths = totalMonths - usedMonths;
    if (remainingMonths < 0 || isDue) remainingMonths = 0;
    
    const refundRent = remainingMonths * monthlyRent;
    const securityDepositRefund = monthlyRent * 2; // standard 2 months escrow deposit refund
    const totalRefundDue = remainingMonths > 0 ? (refundRent + securityDepositRefund) : securityDepositRefund;

    setTerminationCalculation({
      isDue: isDue || remainingMonths === 0,
      totalMonths,
      usedMonths,
      remainingMonths,
      monthlyRent,
      refundRent,
      securityDepositRefund,
      totalRefundDue,
      effectiveDate: today.toISOString().split('T')[0]
    });
    
    setSelectedLeaseToTerminate(lease);
    setShowTerminationModal(true);
  };

  const handleExecuteTermination = () => {
    if (!selectedLeaseToTerminate || !terminationCalculation) return;
    const targetLease = selectedLeaseToTerminate;
    
    const updatedLeases = leases.map(l => l.id === targetLease.id ? { 
      ...l, 
      status: 'Terminated', 
      end: terminationCalculation.effectiveDate 
    } : l);
    saveStoredLeases(updatedLeases);
    setLeases(updatedLeases);

    // 1. Update Unit status to Available in master storage
    const currentUnits = getStoredUnits();
    const updatedUnits = currentUnits.map(u => {
      if (u.id === targetLease.unit || u.name === targetLease.unit) {
        return { ...u, status: 'Available', tenant: '-', lastPaid: '-' };
      }
      return u;
    });
    saveStoredUnits(updatedUnits);

    // 2. Update Tenant status in master storage
    const masterTenants = getStoredTenants();
    const updatedTenants = masterTenants.map(t => {
      if (t.id === targetLease.tenantId || t.name === targetLease.tenant) {
        return {
          ...t,
          unit: '-',
          property: '-',
          status: 'Registered / Unassigned',
          rentStatus: 'No Active Lease'
        };
      }
      return t;
    });
    saveStoredTenants(updatedTenants);
    setRegisteredTenants(updatedTenants);

    if (terminationCalculation.isDue) {
      setSuccessMsg(`Lease ${targetLease.id} formally expired and terminated. Tenant returned to unassigned pool.`);
    } else {
      setSuccessMsg(`Early Termination Executed: Refund of ₵${terminationCalculation.totalRefundDue.toLocaleString()} (₵${terminationCalculation.refundRent.toLocaleString()} Unused Rent + ₵${terminationCalculation.securityDepositRefund.toLocaleString()} Escrow Deposit) authorized for ${targetLease.tenant}. Unit successfully vacated.`);
    }

    setShowTerminationModal(false);
    setSelectedLeaseToTerminate(null);
    setTerminationCalculation(null);
    setTimeout(() => setSuccessMsg(''), 7000);
  };

  const openAgreementModal = (lease) => {
    setAgreementView(lease);
    setIsEditMode(false);
    setEditPremisesClause(`The Landlord hereby leases to the Tenant the following premises: ${lease.property} - Unit ${lease.unit}. The premises shall be used for residential purposes only and shall be occupied by no more than the registered number of occupants. The Tenant acknowledges receipt of the keys and a completed move-in inspection report.`);
    
    setEditTermsClause(`The lease term shall commence on ${lease.start} and expire on ${lease.end} (Total Contract Duration: ${lease.months} months). The Tenant agrees to pay a base monthly rent of ₵${lease.monthlyRent.toLocaleString()} (Total Base Rent: ₵${lease.totalBaseCost.toLocaleString()}). In addition, the Tenant agrees to pay a monthly service & maintenance fee of ₵${lease.serviceChargeMonthly.toLocaleString()} (Total Service Charge: ₵${(lease.serviceChargeMonthly * lease.months).toLocaleString()}), an agency commission fee of ₵${lease.commissionFee.toLocaleString()}, and administrative/legal fees of ₵${lease.otherCharges.toLocaleString()}, making the Total Contract Value precisely ₵${lease.totalContractValue.toLocaleString()}. All payments are due on or before the 1st of each month via the RealtyOS portal.`);
    
    setEditSpecialConditions([
      "Security deposit equivalent to 2 months' base rent must be held in certified bank escrow.",
      "All service charges are allocated to 24/7 backup generator fuel, elevator servicing, and perimeter security.",
      "Agency commission and legal execution fees are non-refundable upon lease signing.",
      "Sub-leasing is strictly prohibited without written consent from RealtyOS Management."
    ]);
  };

  const handleAssign = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const selectedPropUnit = formData.get('propertyUnit').split('|||');
    const property = selectedPropUnit[0];
    const unit = selectedPropUnit[1];
    const tenantId = formData.get('tenantId');
    
    const tenantObj = registeredTenants.find(t => t.id === tenantId);
    if (!tenantObj) return;

    const newLease = {
      id: `LS-${Math.floor(Math.random() * 9000) + 1000}`,
      tenantId: tenantObj.id,
      tenant: tenantObj.name,
      unit: unit,
      property: property,
      start: selectedStartDate,
      end: selectedEndDate,
      months: calculatedMonthsCount,
      monthlyRent: selectedUnitRent,
      amount: `₵ ${selectedUnitRent.toLocaleString()}`,
      serviceChargeMonthly: serviceChargeMonthly,
      commissionFee: commissionFee,
      otherCharges: otherCharges,
      totalBaseCost: totalBaseRentalCost,
      totalContractValue: totalContractValue,
      status: 'Active'
    };
    
    const updatedLeases = [newLease, ...leases];
    saveStoredLeases(updatedLeases);
    setLeases(updatedLeases);

    // Update Unit status to Occupied in master storage
    const currentUnits = getStoredUnits();
    const updatedUnits = currentUnits.map(u => {
      if (u.id === unit || u.name === unit) {
        return { ...u, status: 'Occupied', tenant: tenantObj.name, lastPaid: selectedStartDate };
      }
      return u;
    });
    saveStoredUnits(updatedUnits);

    // Update Master Tenant Profile
    const masterTenants = getStoredTenants();
    const updatedTenants = masterTenants.map(t => {
      if (t.id === tenantObj.id) {
        return {
          ...t,
          unit: unit,
          property: property,
          status: 'Active Lease',
          rentStatus: 'Paid Up',
          monthlyRent: selectedUnitRent,
          securityDeposit: selectedUnitRent * 2
        };
      }
      return t;
    });
    saveStoredTenants(updatedTenants);
    setRegisteredTenants(updatedTenants);

    openAgreementModal(newLease);
    setShowModal(false);
    setSuccessMsg(`Unit ${unit} successfully linked to ${tenantObj.name}. Automated contract value calculated at ₵${totalContractValue.toLocaleString()}.`);
    setTimeout(() => setSuccessMsg(''), 6000);
  };

  const handleAddCondition = (e) => {
    e.preventDefault();
    if (!newConditionInput.trim()) return;
    setEditSpecialConditions([...editSpecialConditions, newConditionInput.trim()]);
    setNewConditionInput('');
  };

  const handleRemoveCondition = (index) => {
    setEditSpecialConditions(editSpecialConditions.filter((_, i) => i !== index));
  };

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  };

  const unassignedTenantsCount = registeredTenants.filter(t => !t.assignedUnit).length;

  return (
    <motion.div variants={container} initial="hidden" animate="show" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <span style={{ padding: '6px 14px', background: 'var(--primary-light)', color: 'var(--primary)', borderRadius: '20px', fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Calculator size={14} /> Fiscal Settlement & Contracting
            </span>
          </div>
          <h2 style={{ fontSize: '32px', fontWeight: '900', letterSpacing: '-0.5px', margin: 0, color: 'var(--text-main)' }}>
            Lease Agreements & Fiscal Billing
          </h2>
          <p style={{ fontSize: '15px', color: 'var(--text-muted)', fontWeight: '500', margin: '4px 0 0', maxWidth: '750px' }}>
            Link units to residents with intelligent automated calculations. The system multiplies base rent by total duration, itemizes fees, and automatically calculates remaining refund balances upon early termination.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button style={{ backgroundColor: 'white', border: '1px solid var(--border-dark)', padding: '12px 20px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '800', color: 'var(--text-main)', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
            <Printer size={18} /> Batch Print Active Leases
          </button>
          <button 
            onClick={() => setShowModal(true)}
            style={{ backgroundColor: 'var(--primary)', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', fontWeight: '800', cursor: 'pointer', boxShadow: '0 8px 20px -5px rgba(0, 135, 90, 0.4)' }}
          >
            <UserPlus size={18} /> Link Unit & Itemize Charges
            {unassignedTenantsCount > 0 && (
              <span style={{ background: '#f59e0b', color: 'white', padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: '900', marginLeft: '4px' }}>
                {unassignedTenantsCount} Unassigned
              </span>
            )}
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

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        {[
          { label: 'Active Agreements', count: leases.filter(l => l.status === 'Active').length, color: '#00875a' },
          { label: 'Unassigned Registered Tenants', count: unassignedTenantsCount, color: '#f59e0b', icon: Users },
          { label: 'Pending Renewals', count: leases.filter(l => l.status === 'Pending Renewal').length, color: '#6366f1' },
          { label: 'Terminated / Vacated', count: leases.filter(l => l.status === 'Terminated').length, color: '#ef4444' },
        ].map((stat, i) => (
          <div key={i} className="glass-card-premium" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: '24px' }}>
            <div>
              <p style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{stat.label}</p>
              <h3 style={{ fontSize: '28px', fontWeight: '900', marginTop: '4px', color: 'var(--text-main)' }}>{stat.count}</h3>
            </div>
            <div style={{ width: '56px', height: '56px', borderRadius: '18px', background: `${stat.color}15`, color: stat.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {stat.icon ? <stat.icon size={28} /> : <FileText size={28} />}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: '8px', padding: '4px', background: '#f1f5f9', borderRadius: '16px', border: '1px solid #cbd5e1' }}>
          {['active', 'expiring', 'pending', 'all'].map((f) => (
            <button 
              key={f}
              onClick={() => setFilter(f)}
              style={{ 
                padding: '10px 20px', borderRadius: '12px', border: 'none', 
                fontSize: '13px', fontWeight: '800', textTransform: 'capitalize',
                background: filter === f ? 'white' : 'transparent',
                color: filter === f ? 'var(--primary)' : '#475569',
                cursor: 'pointer', transition: 'all 0.2s',
                boxShadow: filter === f ? '0 4px 12px rgba(0,0,0,0.05)' : 'none'
              }}
            >
              {f} Leases
            </button>
          ))}
        </div>
        <div style={{ position: 'relative', width: '320px' }}>
          <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Search linked tenants or units..." 
            style={{ width: '100%', padding: '14px 16px 14px 44px', borderRadius: '16px', border: '1px solid #cbd5e1', fontSize: '14px', fontWeight: '600', background: 'white', boxSizing: 'border-box', outline: 'none' }} 
          />
        </div>
      </div>

      {/* LEASES GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px' }}>
        {leases.filter(l => filter === 'all' || l.status.toLowerCase().includes(filter)).map((lease) => (
          <motion.div 
            key={lease.id} 
            variants={item}
            whileHover={{ y: -4 }}
            className="glass-card-premium"
            style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px', borderRadius: '28px', border: '1px solid #cbd5e1', background: 'white' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <div style={{ width: '52px', height: '52px', borderRadius: '16px', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '22px', boxShadow: '0 8px 16px rgba(0, 135, 90, 0.25)' }}>
                  {lease.tenant[0]}
                </div>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: '900', color: 'var(--text-main)', margin: '0 0 2px' }}>{lease.tenant}</h3>
                  <span style={{ padding: '2px 8px', background: '#f1f5f9', color: '#475569', borderRadius: '8px', fontSize: '11px', fontWeight: '800', fontFamily: 'monospace' }}>{lease.id}</span>
                </div>
              </div>
              <div style={{ 
                backgroundColor: statusColors[lease.status]?.bg || '#f1f5f9', 
                color: statusColors[lease.status]?.text || '#64748b', 
                padding: '6px 14px', borderRadius: '14px', fontSize: '12px', fontWeight: '900',
                display: 'flex', alignItems: 'center', gap: '6px', border: `1px solid ${statusColors[lease.status]?.text}30`
              }}>
                {React.createElement(statusColors[lease.status]?.icon || AlertCircle, { size: 14 })}
                {lease.status}
              </div>
            </div>

            <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '20px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Building2 size={20} />
                </div>
                <div>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '800', textTransform: 'uppercase', display: 'block' }}>Linked Property Unit</span>
                  <strong style={{ fontSize: '16px', fontWeight: '900', color: '#0f172a' }}>{lease.property} — Unit {lease.unit}</strong>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', borderTop: '1px dashed #cbd5e1', paddingTop: '12px' }}>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '800', textTransform: 'uppercase', display: 'block', marginBottom: '2px' }}>Lease Duration</span>
                  <strong style={{ fontSize: '13px', fontWeight: '800', color: '#334155' }}>{lease.months || 12} Months ({lease.start.slice(0,7)})</strong>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '800', textTransform: 'uppercase', display: 'block', marginBottom: '2px' }}>Monthly Fiscal Rent</span>
                  <strong style={{ fontSize: '15px', fontWeight: '900', color: 'var(--primary)' }}>{lease.amount}</strong>
                </div>
              </div>

              {lease.totalContractValue && (
                <div style={{ background: '#fff', padding: '10px 14px', borderRadius: '12px', border: '1px solid #cbd5e1', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Contract Value</span>
                  <strong style={{ fontSize: '16px', fontWeight: '900', color: '#0f172a' }}>₵{lease.totalContractValue.toLocaleString()}</strong>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                onClick={() => openAgreementModal(lease)}
                style={{ flex: 1, padding: '14px', borderRadius: '16px', background: 'var(--primary)', color: 'white', fontSize: '14px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', cursor: 'pointer', border: 'none', boxShadow: '0 8px 20px rgba(0, 135, 90, 0.3)' }}
              >
                <FileText size={18} /> View Itemized Agreement
              </button>
              {lease.status !== 'Terminated' && (
                <button 
                  onClick={() => handleInitiateTermination(lease)}
                  title="Terminate Stay & Calculate Unused Refund Balance"
                  style={{ padding: '14px', borderRadius: '16px', background: '#fef2f2', border: '1px solid #fca5a5', color: '#dc2626', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <LogOut size={20} />
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* MODAL: EARLY TERMINATION & REMAINING REFUND SETTLEMENT */}
      <AnimatePresence>
        {showTerminationModal && selectedLeaseToTerminate && terminationCalculation && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200, padding: '24px' }}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              style={{ background: 'white', padding: '48px', borderRadius: '32px', width: '100%', maxWidth: '680px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #e2e8f0', paddingBottom: '20px', marginBottom: '28px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '20px', background: '#fef2f2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Scale size={28} />
                  </div>
                  <div>
                    <span style={{ padding: '4px 12px', background: '#f1f5f9', color: '#475569', borderRadius: '14px', fontSize: '11px', fontWeight: '900', textTransform: 'uppercase' }}>Automated Settlement Workflow</span>
                    <h3 style={{ margin: '6px 0 0', fontSize: '24px', fontWeight: '900', color: '#0f172a' }}>Terminate & Disburse Balance</h3>
                  </div>
                </div>
                <button onClick={() => setShowTerminationModal(false)} style={{ background: '#f1f5f9', border: 'none', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b' }}>
                  <X size={18} />
                </button>
              </div>

              <div style={{ background: terminationCalculation.isDue ? '#f1f5f9' : '#fff7ed', border: terminationCalculation.isDue ? '1px solid #cbd5e1' : '1px solid #fed7aa', padding: '16px 20px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px', color: terminationCalculation.isDue ? '#475569' : '#c2410c', fontWeight: '800', marginBottom: '28px' }}>
                <Receipt size={20} style={{ flexShrink: 0 }} />
                <span>
                  {terminationCalculation.isDue 
                    ? "The lease term has fully elapsed. No remaining unused rent calculation required. Standard vacation protocol applies."
                    : `Early Termination Detected: The tenant has ${terminationCalculation.remainingMonths} unused months remaining. The system has automatically calculated the remaining rent refund balance.`
                  }
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ background: '#f8fafc', padding: '24px', borderRadius: '24px', border: '1px solid #cbd5e1', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
                    <span style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: '700' }}>Occupying Tenant</span>
                    <strong style={{ fontSize: '16px', fontWeight: '900', color: '#0f172a' }}>{selectedLeaseToTerminate.tenant}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
                    <span style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: '700' }}>Linked Property Unit</span>
                    <strong style={{ fontSize: '16px', fontWeight: '900', color: '#0f172a' }}>{selectedLeaseToTerminate.property} — Unit {selectedLeaseToTerminate.unit}</strong>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', textAlign: 'center', paddingTop: '8px' }}>
                    <div style={{ background: 'white', padding: '12px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                      <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '800', display: 'block' }}>Total Lease Term</span>
                      <strong style={{ fontSize: '15px', fontWeight: '900', color: '#0f172a' }}>{terminationCalculation.totalMonths} Months</strong>
                    </div>
                    <div style={{ background: 'white', padding: '12px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                      <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '800', display: 'block' }}>Months Occupied</span>
                      <strong style={{ fontSize: '15px', fontWeight: '900', color: '#00875a' }}>{terminationCalculation.usedMonths} Months</strong>
                    </div>
                    <div style={{ background: 'white', padding: '12px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                      <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '800', display: 'block' }}>Remaining Unused</span>
                      <strong style={{ fontSize: '15px', fontWeight: '900', color: '#dc2626' }}>{terminationCalculation.remainingMonths} Months</strong>
                    </div>
                  </div>
                </div>

                {/* FINANCIAL SETTLEMENT BREAKDOWN */}
                <div style={{ background: terminationCalculation.isDue ? '#f8fafc' : '#ecfdf5', border: terminationCalculation.isDue ? '1px solid #cbd5e1' : '2px solid #10b981', padding: '24px', borderRadius: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px' }}>
                    <span style={{ color: terminationCalculation.isDue ? '#64748b' : '#065f46', fontWeight: '700' }}>Monthly Rental Rate</span>
                    <strong style={{ color: '#0f172a', fontWeight: '900' }}>₵{terminationCalculation.monthlyRent.toLocaleString()} / mo</strong>
                  </div>
                  
                  {!terminationCalculation.isDue && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px', borderTop: '1px dashed #a7f3d0', paddingTop: '12px' }}>
                      <span style={{ color: '#065f46', fontWeight: '800' }}>Unused Rent Refund ({terminationCalculation.remainingMonths} Mos)</span>
                      <strong style={{ color: '#065f46', fontWeight: '900' }}>+ ₵{terminationCalculation.refundRent.toLocaleString()}</strong>
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px', borderTop: terminationCalculation.isDue ? '1px dashed #cbd5e1' : '1px dashed #a7f3d0', paddingTop: '12px' }}>
                    <span style={{ color: terminationCalculation.isDue ? '#64748b' : '#065f46', fontWeight: '800' }}>Refundable Escrow Security Deposit (2 Mos)</span>
                    <strong style={{ color: '#065f46', fontWeight: '900' }}>+ ₵{terminationCalculation.securityDepositRefund.toLocaleString()}</strong>
                  </div>

                  <div style={{ borderTop: terminationCalculation.isDue ? '2px solid #cbd5e1' : '2px solid #10b981', paddingTop: '16px', marginTop: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '16px', fontWeight: '900', color: terminationCalculation.isDue ? '#0f172a' : '#065f46', textTransform: 'uppercase' }}>
                      {terminationCalculation.isDue ? "Total Standard Refund Due" : "Total Settlement Refund Due to Tenant"}
                    </span>
                    <strong style={{ fontSize: '24px', fontWeight: '900', color: 'var(--primary)' }}>
                      ₵{terminationCalculation.totalRefundDue.toLocaleString()}
                    </strong>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginTop: '12px' }}>
                  <button type="button" onClick={() => setShowTerminationModal(false)} style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', color: '#475569', padding: '16px 28px', borderRadius: '16px', fontWeight: '800', fontSize: '15px', cursor: 'pointer' }}>Cancel</button>
                  <button type="button" onClick={handleExecuteTermination} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '16px 36px', borderRadius: '16px', fontSize: '15px', fontWeight: '800', cursor: 'pointer', boxShadow: '0 8px 25px rgba(239, 68, 68, 0.4)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <RefreshCcw size={18} /> Confirm Termination & Disburse Funds
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: LINK RENTAL UNIT & CALCULATE CHARGES */}
      <AnimatePresence>
        {showModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '24px' }}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              style={{ background: 'white', padding: '48px', borderRadius: '32px', width: '100%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #e2e8f0', paddingBottom: '20px', marginBottom: '28px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '20px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Calculator size={28} />
                  </div>
                  <div>
                    <span style={{ padding: '4px 12px', background: '#f1f5f9', color: '#475569', borderRadius: '14px', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase' }}>Automated Multi-Month Calculation</span>
                    <h3 style={{ margin: '6px 0 0', fontSize: '24px', fontWeight: '900', color: '#0f172a' }}>Link Unit & Itemize Fiscal Charges</h3>
                  </div>
                </div>
                <button onClick={() => setShowModal(false)} style={{ background: '#f1f5f9', border: 'none', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b' }}>
                  <X size={18} />
                </button>
              </div>

              <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', padding: '16px 20px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px', color: '#1e3a8a', fontWeight: '700', marginBottom: '24px' }}>
                <Calculator size={20} style={{ flexShrink: 0 }} />
                <span>Selecting dates automatically multiplies rent by total months. Service charges, agency commission, and other fees are itemized separately into the formal agreement.</span>
              </div>
              
              <form onSubmit={handleAssign} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <label style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-main)', margin: 0 }}>Select Unassigned Registered Tenant</label>
                      <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--primary)', background: '#ecfdf5', padding: '2px 8px', borderRadius: '8px' }}>
                        {unassignedTenantsCount} Available
                      </span>
                    </div>
                    <select name="tenantId" required style={{ width: '100%', padding: '16px 20px', borderRadius: '16px', border: '2px solid var(--primary)', fontSize: '15px', fontWeight: '800', color: '#0f172a', background: '#f8fafc', outline: 'none', cursor: 'pointer' }}>
                      {registeredTenants.filter(t => !t.assignedUnit).map(t => (
                        <option key={t.id} value={t.id}>
                          {t.name} — ({t.id})
                        </option>
                      ))}
                      {registeredTenants.filter(t => !t.assignedUnit).length === 0 && (
                        <option disabled value="">No unassigned tenants available</option>
                      )}
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '8px', display: 'block' }}>Select Available Property & Unit</label>
                    <select 
                      name="propertyUnit" 
                      onChange={handleUnitSelectChange}
                      required 
                      style={{ width: '100%', padding: '16px 20px', borderRadius: '16px', border: '1px solid #cbd5e1', fontSize: '15px', fontWeight: '800', color: '#0f172a', background: 'white', outline: 'none' }}
                    >
                      {availableUnits.map((u, idx) => (
                        <option key={idx} value={`${u.property}|||${u.unit}`}>
                          {u.property} — Unit {u.unit} (₵{u.rent.toLocaleString()}/mo)
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                {/* DURATION SELECTION */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', background: '#f8fafc', padding: '20px', borderRadius: '20px', border: '1px solid #cbd5e1' }}>
                  <div>
                    <label style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '8px', display: 'block' }}>Lease Start Date</label>
                    <input 
                      name="startDate" 
                      type="date" 
                      value={selectedStartDate} 
                      onChange={e => setSelectedStartDate(e.target.value)} 
                      required 
                      style={{ width: '100%', padding: '14px 16px', borderRadius: '14px', border: '1px solid #cbd5e1', fontSize: '15px', fontWeight: '800', outline: 'none', boxSizing: 'border-box' }} 
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '8px', display: 'block' }}>Lease End Date</label>
                    <input 
                      name="endDate" 
                      type="date" 
                      value={selectedEndDate} 
                      onChange={e => setSelectedEndDate(e.target.value)} 
                      required 
                      style={{ width: '100%', padding: '14px 16px', borderRadius: '14px', border: '1px solid #cbd5e1', fontSize: '15px', fontWeight: '800', outline: 'none', boxSizing: 'border-box' }} 
                    />
                  </div>
                </div>

                {/* ITEMIZED CHARGES INPUT */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>Monthly Service Charge (₵)</label>
                    <input 
                      type="number" 
                      value={serviceChargeMonthly} 
                      onChange={e => setServiceChargeMonthly(parseInt(e.target.value) || 0)} 
                      required 
                      style={{ width: '100%', padding: '14px', borderRadius: '14px', border: '1px solid #cbd5e1', fontSize: '15px', fontWeight: '800', outline: 'none', boxSizing: 'border-box' }} 
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>Agency Commission Fee (₵)</label>
                    <input 
                      type="number" 
                      value={commissionFee} 
                      onChange={e => setCommissionFee(parseInt(e.target.value) || 0)} 
                      required 
                      style={{ width: '100%', padding: '14px', borderRadius: '14px', border: '1px solid #cbd5e1', fontSize: '15px', fontWeight: '800', outline: 'none', boxSizing: 'border-box' }} 
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>Other / Legal Charges (₵)</label>
                    <input 
                      type="number" 
                      value={otherCharges} 
                      onChange={e => setOtherCharges(parseInt(e.target.value) || 0)} 
                      required 
                      style={{ width: '100%', padding: '14px', borderRadius: '14px', border: '1px solid #cbd5e1', fontSize: '15px', fontWeight: '800', outline: 'none', boxSizing: 'border-box' }} 
                    />
                  </div>
                </div>

                {/* LIVE CALCULATION SUMMARY BANNER */}
                <div style={{ background: '#ecfdf5', border: '2px solid #10b981', padding: '24px', borderRadius: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid #a7f3d0', paddingBottom: '12px' }}>
                    <Calculator size={20} color="#00875a" />
                    <span style={{ fontSize: '14px', fontWeight: '900', color: '#065f46', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Automated Fiscal Contracting Summary
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', fontSize: '13px' }}>
                    <div>
                      <span style={{ color: '#065f46', fontWeight: '700', display: 'block', marginBottom: '4px' }}>Total Duration</span>
                      <strong style={{ fontSize: '16px', fontWeight: '900', color: '#0f172a' }}>{calculatedMonthsCount} Months</strong>
                    </div>
                    <div>
                      <span style={{ color: '#065f46', fontWeight: '700', display: 'block', marginBottom: '4px' }}>Base Rent (₵{selectedUnitRent}/mo)</span>
                      <strong style={{ fontSize: '16px', fontWeight: '900', color: '#0f172a' }}>₵{totalBaseRentalCost.toLocaleString()}</strong>
                    </div>
                    <div>
                      <span style={{ color: '#065f46', fontWeight: '700', display: 'block', marginBottom: '4px' }}>Service Total (₵{serviceChargeMonthly}/mo)</span>
                      <strong style={{ fontSize: '16px', fontWeight: '900', color: '#0f172a' }}>₵{totalServiceChargeCost.toLocaleString()}</strong>
                    </div>
                    <div>
                      <span style={{ color: '#065f46', fontWeight: '700', display: 'block', marginBottom: '4px' }}>Commission & Fees</span>
                      <strong style={{ fontSize: '16px', fontWeight: '900', color: '#0f172a' }}>₵{(commissionFee + otherCharges).toLocaleString()}</strong>
                    </div>
                  </div>

                  <div style={{ borderTop: '2px dashed #a7f3d0', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '15px', fontWeight: '900', color: '#065f46', textTransform: 'uppercase' }}>Total Contract Fiscal Value</span>
                    <strong style={{ fontSize: '26px', fontWeight: '900', color: 'var(--primary)' }}>₵{totalContractValue.toLocaleString()}</strong>
                  </div>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginTop: '12px' }}>
                  <button type="button" onClick={() => setShowModal(false)} style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', color: '#475569', padding: '16px 28px', borderRadius: '16px', fontWeight: '800', fontSize: '15px', cursor: 'pointer' }}>Cancel</button>
                  <button type="submit" disabled={unassignedTenantsCount === 0} style={{ background: unassignedTenantsCount === 0 ? '#cbd5e1' : 'var(--primary)', color: 'white', border: 'none', padding: '16px 36px', borderRadius: '16px', fontSize: '15px', fontWeight: '800', cursor: unassignedTenantsCount === 0 ? 'not-allowed' : 'pointer', boxShadow: unassignedTenantsCount === 0 ? 'none' : '0 8px 25px rgba(0, 135, 90, 0.4)' }}>
                    Link Unit & Generate Itemized Agreement
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* COMPREHENSIVE EDITABLE PDF AGREEMENT MODAL */}
      <AnimatePresence>
        {agreementView && (
          <div className="print-modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.9)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, padding: '24px' }}>
            <motion.div 
              className="print-modal-content"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              style={{ width: '100%', maxWidth: '1000px', height: '92vh', background: 'white', borderRadius: '32px', overflowY: 'auto', padding: '56px 64px', position: 'relative', boxShadow: '0 50px 100px rgba(0,0,0,0.6)', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
            >
              {/* TOP ACTION BAR */}
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
                  <button onClick={() => setAgreementView(null)} style={{ background: '#f1f5f9', border: 'none', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b' }}>
                    <X size={20} />
                  </button>
                </div>
              </div>
              
              {/* PRINTABLE AGREEMENT BODY */}
              <div className="agreement-print-area" style={{ color: '#1e293b' }}>
                <div style={{ textAlign: 'center', marginBottom: '48px' }}>
                  <Building2 size={56} color="var(--primary)" style={{ marginBottom: '16px' }} />
                  <h1 style={{ fontSize: '32px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '2px', color: '#0f172a', margin: '0 0 8px' }}>Residential Lease Agreement</h1>
                  <p style={{ color: '#64748b', fontSize: '15px', fontWeight: '700', margin: 0 }}>Official Legal Instrument • RealtyOS Asset Operations</p>
                </div>
                
                {/* PARTIES BLOCK */}
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
                    <p style={{ fontSize: '18px', fontWeight: '900', color: '#0f172a', margin: '0 0 6px' }}>{agreementView.tenant}</p>
                    <p style={{ fontSize: '15px', color: '#475569', margin: '0 0 4px' }}>Lease Reference No: <strong style={{ color: 'var(--primary)' }}>{agreementView.id}</strong></p>
                    <p style={{ fontSize: '15px', color: '#475569', margin: 0 }}>Biometric ID KYC Verified: <span style={{ color: '#00875a', fontWeight: '800', background: '#ecfdf5', padding: '2px 8px', borderRadius: '6px' }}>[CERTIFIED]</span></p>
                  </div>
                </div>
                
                {/* CONTRACT SECTIONS */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
                  <section>
                    <h3 style={{ fontSize: '18px', fontWeight: '900', marginBottom: '16px', color: '#0f172a', borderLeft: '4px solid var(--primary)', paddingLeft: '16px' }}>1. THE PREMISES</h3>
                    {isEditMode ? (
                      <textarea 
                        value={editPremisesClause} 
                        onChange={e => setEditPremisesClause(e.target.value)}
                        rows={4}
                        style={{ width: '100%', padding: '16px', borderRadius: '16px', border: '2px solid var(--primary)', fontSize: '15px', lineHeight: '1.8', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }}
                      />
                    ) : (
                      <p style={{ fontSize: '15px', lineHeight: '1.8', color: '#334155', margin: 0 }}>
                        {editPremisesClause}
                      </p>
                    )}
                  </section>
                  
                  <section>
                    <h3 style={{ fontSize: '18px', fontWeight: '900', marginBottom: '16px', color: '#0f172a', borderLeft: '4px solid var(--primary)', paddingLeft: '16px' }}>2. TERM & FISCAL CONSIDERATION</h3>
                    {isEditMode ? (
                      <textarea 
                        value={editTermsClause} 
                        onChange={e => setEditTermsClause(e.target.value)}
                        rows={5}
                        style={{ width: '100%', padding: '16px', borderRadius: '16px', border: '2px solid var(--primary)', fontSize: '15px', lineHeight: '1.8', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }}
                      />
                    ) : (
                      <p style={{ fontSize: '15px', lineHeight: '1.8', color: '#334155', margin: 0 }}>
                        {editTermsClause}
                      </p>
                    )}
                  </section>

                  {/* ITEMIZED FISCAL SCHEDULE TABLE */}
                  <section>
                    <h3 style={{ fontSize: '18px', fontWeight: '900', marginBottom: '16px', color: '#0f172a', borderLeft: '4px solid var(--primary)', paddingLeft: '16px' }}>SCHEDULE A: ITEMIZED FISCAL BREAKDOWN</h3>
                    <div style={{ borderRadius: '20px', border: '1px solid #cbd5e1', overflow: 'hidden' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                        <thead>
                          <tr style={{ background: '#f8fafc', borderBottom: '2px solid #cbd5e1' }}>
                            <th style={{ padding: '16px 20px', fontWeight: '900', color: '#0f172a' }}>Fee Description</th>
                            <th style={{ padding: '16px 20px', fontWeight: '900', color: '#0f172a' }}>Rate / Basis</th>
                            <th style={{ padding: '16px 20px', fontWeight: '900', color: '#0f172a', textAlign: 'right' }}>Total Amount (₵ GHS)</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                            <td style={{ padding: '16px 20px', fontWeight: '800', color: '#334155' }}>Base Property Rent</td>
                            <td style={{ padding: '16px 20px', color: '#64748b' }}>₵{agreementView.monthlyRent?.toLocaleString()} × {agreementView.months} Months</td>
                            <td style={{ padding: '16px 20px', fontWeight: '900', textAlign: 'right', color: '#0f172a' }}>₵{agreementView.totalBaseCost?.toLocaleString()}</td>
                          </tr>
                          <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                            <td style={{ padding: '16px 20px', fontWeight: '800', color: '#334155' }}>Service & Maintenance Fee</td>
                            <td style={{ padding: '16px 20px', color: '#64748b' }}>₵{agreementView.serviceChargeMonthly?.toLocaleString()} / Month</td>
                            <td style={{ padding: '16px 20px', fontWeight: '900', textAlign: 'right', color: '#0f172a' }}>₵{(agreementView.serviceChargeMonthly * agreementView.months)?.toLocaleString()}</td>
                          </tr>
                          <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                            <td style={{ padding: '16px 20px', fontWeight: '800', color: '#334155' }}>Agency & Leasing Commission</td>
                            <td style={{ padding: '16px 20px', color: '#64748b' }}>Fixed Agreement Commission</td>
                            <td style={{ padding: '16px 20px', fontWeight: '900', textAlign: 'right', color: '#0f172a' }}>₵{agreementView.commissionFee?.toLocaleString()}</td>
                          </tr>
                          <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                            <td style={{ padding: '16px 20px', fontWeight: '800', color: '#334155' }}>Legal Execution & Admin Charges</td>
                            <td style={{ padding: '16px 20px', color: '#64748b' }}>One-off legal attestation</td>
                            <td style={{ padding: '16px 20px', fontWeight: '900', textAlign: 'right', color: '#0f172a' }}>₵{agreementView.otherCharges?.toLocaleString()}</td>
                          </tr>
                          <tr style={{ background: '#ecfdf5', borderTop: '2px solid #10b981' }}>
                            <td colSpan={2} style={{ padding: '18px 20px', fontWeight: '900', color: '#065f46', fontSize: '16px' }}>TOTAL FISCAL CONTRACT OBLIGATION</td>
                            <td style={{ padding: '18px 20px', fontWeight: '900', textAlign: 'right', color: 'var(--primary)', fontSize: '20px' }}>₵{agreementView.totalContractValue?.toLocaleString()}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </section>
                  
                  <section>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <h3 style={{ fontSize: '18px', fontWeight: '900', margin: 0, color: '#0f172a', borderLeft: '4px solid var(--primary)', paddingLeft: '16px' }}>3. SPECIAL CONDITIONS & COVENANTS</h3>
                    </div>

                    <div style={{ padding: '28px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {editSpecialConditions.map((cond, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', fontSize: '15px', color: '#334155', lineHeight: '1.6' }}>
                          <span style={{ color: 'var(--primary)', fontWeight: '900', fontSize: '18px', marginTop: '-2px' }}>•</span>
                          <span style={{ flex: 1 }}>{cond}</span>
                          {isEditMode && (
                            <button 
                              onClick={() => handleRemoveCondition(idx)} 
                              style={{ background: '#fef2f2', border: '1px solid #fca5a5', color: '#dc2626', padding: '6px 10px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      ))}

                      {isEditMode && (
                        <form onSubmit={handleAddCondition} style={{ display: 'flex', gap: '12px', marginTop: '12px', borderTop: '1px solid #cbd5e1', paddingTop: '20px' }}>
                          <input 
                            type="text" 
                            placeholder="Type new special condition or legal covenant..." 
                            value={newConditionInput} 
                            onChange={e => setNewConditionInput(e.target.value)} 
                            style={{ flex: 1, padding: '14px 20px', borderRadius: '16px', border: '2px solid var(--primary)', fontSize: '15px', outline: 'none' }} 
                          />
                          <button type="submit" style={{ background: 'var(--primary)', color: 'white', border: 'none', padding: '14px 28px', borderRadius: '16px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Plus size={18} /> Add Clause
                          </button>
                        </form>
                      )}
                    </div>
                  </section>
                </div>
                
                {/* SIGNATURE BLOCK */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', marginTop: '100px', marginBottom: '60px' }}>
                  <div style={{ borderTop: '2px solid #0f172a', paddingTop: '20px' }}>
                    <p style={{ fontSize: '12px', textTransform: 'uppercase', fontWeight: '900', color: '#64748b', letterSpacing: '1px', margin: 0 }}>Landlord / Authorized Agent Signature</p>
                    <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ fontStyle: 'italic', color: 'var(--primary)', fontWeight: '900', fontSize: '20px', letterSpacing: '1px' }}>REALTY_OS_AUTHORIZED</div>
                      <ShieldCheck size={28} color="#10b981" />
                    </div>
                  </div>
                  <div style={{ borderTop: '2px solid #0f172a', paddingTop: '20px' }}>
                    <p style={{ fontSize: '12px', textTransform: 'uppercase', fontWeight: '900', color: '#64748b', letterSpacing: '1px', margin: 0 }}>Tenant / Lessee Signature</p>
                    <div style={{ marginTop: '28px', height: '36px', borderBottom: '1px dashed #cbd5e1' }}></div>
                  </div>
                </div>
                
                {/* BLOCKCHAIN TIMESTAMP BANNER */}
                <div style={{ textAlign: 'center', padding: '24px', background: '#ecfdf5', borderRadius: '24px', border: '1px solid #a7f3d0' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', color: '#065f46' }}>
                    <FileCheck size={24} style={{ color: '#10b981' }} />
                    <span style={{ fontSize: '15px', fontWeight: '900' }}>Digitally Certified & Escrow Secured via RealtyOS Smart Contracts Core</span>
                  </div>
                </div>
              </div>
              
              <div style={{ marginTop: '60px', display: 'flex', justifyContent: 'center', gap: '20px' }} className="no-print">
                <button disabled={isGeneratingPdf} onClick={handleExportPdf} style={{ padding: '16px 44px', borderRadius: '18px', background: 'var(--primary)', color: 'white', border: 'none', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '16px', boxShadow: '0 15px 30px -10px rgba(0, 135, 90, 0.4)', opacity: isGeneratingPdf ? 0.7 : 1 }}>
                  <Printer size={22} /> {isGeneratingPdf ? 'Generating Real PDF...' : 'Download Real PDF Document'}
                </button>
                <button onClick={() => setAgreementView(null)} style={{ padding: '16px 44px', borderRadius: '18px', background: 'white', border: '2px solid #cbd5e1', fontWeight: '800', cursor: 'pointer', fontSize: '16px', color: '#0f172a' }}>
                  Done & Return to Leases
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>
        {`
          @media print {
            .no-print { display: none !important; }
            body { background: white !important; margin: 0 !important; padding: 0 !important; }
            .glass-card-premium { border: none !important; box-shadow: none !important; }
            .agreement-print-area { padding: 0 !important; width: 100% !important; margin: 0 !important; }
            * { color-adjust: exact; -webkit-print-color-adjust: exact; }
          }
        `}
      </style>
    </motion.div>
  );
};

export default Leases;
