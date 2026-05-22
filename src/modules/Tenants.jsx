import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, UserPlus, Clock, ShieldCheck, DollarSign, Award, AlertTriangle, 
  CheckCircle2, Search, Filter, Plus, FileText, X, Check, Eye, Briefcase, 
  Calendar, Star, Wallet, FileCheck, Ban, Landmark, Coins, Play, AlertCircle,
  Lock, UserCheck, Calculator, LogIn, LogOut, Coffee, BarChart2, QrCode, 
  Printer, CreditCard, Camera, UploadCloud, PhoneCall, Building2, Download,
  Badge, Shield, Mail, MessageSquare, Key, Wrench, History,
  TrendingUp, Home, ArrowUpRight, Edit3, Trash2
} from 'lucide-react';
import html2canvas from 'html2canvas';

import { getStoredTenants, saveStoredTenants, getStoredUnits, saveStoredUnits, getStoredLeases, saveStoredLeases } from '../lib/masterData';
import { generateRealPDF } from '../lib/pdfService';

const Tenants = () => {
  const [activeTab, setActiveTab] = useState('directory'); // directory, rent-roll, maintenance, communications, kyc
  const [successMsg, setSuccessMsg] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [propertyFilter, setPropertyFilter] = useState('ALL');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const handleExportReceiptPdf = async () => {
    setIsGeneratingPdf(true);
    await generateRealPDF('#printable-receipt-container', `Rent_Receipt_${printableReceipt?.receiptNo || 'REC'}.pdf`, { 
      orientation: 'p', 
      singlePage: true 
    });
    setIsGeneratingPdf(false);
  };

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [tenantToEdit, setTenantToEdit] = useState(null);
  const [selectedTenantProfile, setSelectedTenantProfile] = useState(null);
  const [printableReceipt, setPrintableReceipt] = useState(null);
  const [showLogPaymentModal, setShowLogPaymentModal] = useState(false);
  const [paymentTenant, setPaymentTenant] = useState(null);
  const [selectedHistoryTenant, setSelectedHistoryTenant] = useState(null);
  const [historyFilterQuery, setHistoryFilterQuery] = useState('');

  // Master Tenant Data from Storage
  const [tenantsList, setTenantsList] = useState(getStoredTenants());

  useEffect(() => {
    const handleUpdate = () => {
      setTenantsList(getStoredTenants());
    };
    window.addEventListener('realtyos_tenants_update', handleUpdate);
    return () => window.removeEventListener('realtyos_tenants_update', handleUpdate);
  }, []);

  useEffect(() => {
    if (selectedHistoryTenant) {
      const updated = tenantsList.find(t => t.id === selectedHistoryTenant.id);
      if (updated && JSON.stringify(updated) !== JSON.stringify(selectedHistoryTenant)) {
        setSelectedHistoryTenant(updated);
      }
    }
    if (selectedTenantProfile) {
      const updated = tenantsList.find(t => t.id === selectedTenantProfile.id);
      if (updated && JSON.stringify(updated) !== JSON.stringify(selectedTenantProfile)) {
        setSelectedTenantProfile(updated);
      }
    }
  }, [tenantsList]);


  const handleDeleteResident = (residentId, residentName, unitId) => {
    if (window.confirm(`⚠️ CONFIRMATION SAFEGUARD: Are you absolutely sure you want to permanently delete resident "${residentName}" (ID: ${residentId})? This action cannot be undone.`)) {
      const updatedTenants = tenantsList.filter(t => t.id !== residentId);
      setTenantsList(updatedTenants);
      saveStoredTenants(updatedTenants);

      if (unitId && unitId !== '-') {
        const currentUnits = getStoredUnits();
        const updatedUnits = currentUnits.map(u => {
          if (u.id === unitId) {
            return { ...u, status: 'Available', tenant: '-', lastPaid: '-' };
          }
          return u;
        });
        saveStoredUnits(updatedUnits);
      }

      const currentLeases = getStoredLeases();
      const updatedLeases = currentLeases.map(l => {
        if (l.tenant === residentName || l.tenantId === residentId) {
          return { ...l, status: 'Terminated', end: new Date().toISOString().split('T')[0] };
        }
        return l;
      });
      saveStoredLeases(updatedLeases);

      if (selectedTenantProfile && selectedTenantProfile.id === residentId) {
        setSelectedTenantProfile(null);
      }
      setSuccessMsg(`Resident "${residentName}" successfully deleted.`);
      setTimeout(() => setSuccessMsg(''), 5000);
    }
  };

  const handleEditResidentSubmit = (e) => {
    e.preventDefault();
    if (!tenantToEdit) return;
    const formData = new FormData(e.target);
    const oldName = tenantToEdit.name;
    const newName = formData.get('name');
    const updated = {
      ...tenantToEdit,
      name: newName,
      email: formData.get('email'),
      phone: formData.get('phone'),
      ghanaCardNo: formData.get('ghanaCardNo'),
      employer: formData.get('employer'),
      occupation: formData.get('occupation'),
      guarantorName: formData.get('guarantorName'),
      guarantorPhone: formData.get('guarantorPhone'),
      witnessName: formData.get('witnessName'),
      witnessPhone: formData.get('witnessPhone'),
      status: formData.get('status'),
      rentStatus: formData.get('rentStatus'),
      notes: formData.get('notes')
    };

    const updatedList = tenantsList.map(t => t.id === tenantToEdit.id ? updated : t);
    setTenantsList(updatedList);
    saveStoredTenants(updatedList);

    if (oldName !== newName && tenantToEdit.unit && tenantToEdit.unit !== '-') {
      const currentUnits = getStoredUnits();
      const updatedUnits = currentUnits.map(u => {
        if (u.id === tenantToEdit.unit || u.tenant === oldName) {
          return { ...u, tenant: newName };
        }
        return u;
      });
      saveStoredUnits(updatedUnits);

      const currentLeases = getStoredLeases();
      const updatedLeases = currentLeases.map(l => {
        if (l.tenant === oldName || l.tenantId === tenantToEdit.id) {
          return { ...l, tenant: newName };
        }
        return l;
      });
      saveStoredLeases(updatedLeases);
    }

    if (selectedTenantProfile && selectedTenantProfile.id === tenantToEdit.id) {
      setSelectedTenantProfile(updated);
    }

    setShowEditModal(false);
    setTenantToEdit(null);
    setSuccessMsg(`Resident "${newName}" successfully modified.`);
    setTimeout(() => setSuccessMsg(''), 5000);
  };

  // Calculate lease expiration and overstay status
  const calculateLeaseStatus = (tenant) => {
    if (!tenant.leaseEnd || tenant.leaseEnd === '-') {
      return { statusText: 'No Active Lease', badgeBg: '#f1f5f9', badgeColor: '#64748b', badgeBorder: '#cbd5e1', dotsColor: null, isOverdue: false };
    }
    const now = new Date();
    const end = new Date(tenant.leaseEnd);
    const diffTime = end.getTime() - now.getTime();
    const diffDays = diffTime / (1000 * 3600 * 24);
    const diffMonths = diffDays / 30.44;

    if (diffMonths < 0 || tenant.rentStatus === 'Arrears / Overdue') {
      const monthsOverstayed = Math.max(1, Math.abs(Math.round(diffMonths)));
      return {
        statusText: `Rent Overdue • Overstayed (${monthsOverstayed} Month${monthsOverstayed > 1 ? 's' : ''})`,
        badgeBg: '#fef2f2',
        badgeColor: '#dc2626',
        badgeBorder: '#fca5a5',
        dotsColor: '#ef4444', // red
        isOverdue: true
      };
    } else if (diffMonths <= 1.2) {
      return {
        statusText: 'Critical Expiry (< 1 Month)',
        badgeBg: '#fef2f2',
        badgeColor: '#dc2626',
        badgeBorder: '#fca5a5',
        dotsColor: '#ef4444', // red
        isOverdue: false
      };
    } else if (diffMonths <= 2.2) {
      return {
        statusText: 'Lease Expiry (2 Months Left)',
        badgeBg: '#fef9c3',
        badgeColor: '#ca8a04',
        badgeBorder: '#fde047',
        dotsColor: '#eab308', // yellow
        isOverdue: false
      };
    } else if (diffMonths <= 3.2) {
      return {
        statusText: 'Lease Nearing Expiry (3 Months Left)',
        badgeBg: '#ffedd5',
        badgeColor: '#ea580c',
        badgeBorder: '#fed7aa',
        dotsColor: '#f97316', // orange
        isOverdue: false
      };
    } else {
      return {
        statusText: 'Active & Paid Up',
        badgeBg: '#ecfdf5',
        badgeColor: '#059669',
        badgeBorder: '#a7f3d0',
        dotsColor: null,
        isOverdue: false
      };
    }
  };

  // New Tenant Form States
  const [newTenantName, setNewTenantName] = useState('');
  const [newTenantEmail, setNewTenantEmail] = useState('');
  const [newTenantPhone, setNewTenantPhone] = useState('');
  const [newTenantGhanaCard, setNewTenantGhanaCard] = useState('');
  const [newTenantGuarantor, setNewTenantGuarantor] = useState('');
  const [newTenantGuarantorPhone, setNewTenantGuarantorPhone] = useState('');
  const [newTenantWitness, setNewTenantWitness] = useState('');
  const [newTenantWitnessPhone, setNewTenantWitnessPhone] = useState('');
  const [newTenantBank, setNewTenantBank] = useState('Ecobank Ghana PLC');
  const [newTenantAccNo, setNewTenantAccNo] = useState('');
  const [newTenantEmployer, setNewTenantEmployer] = useState('');
  const [newTenantOccupation, setNewTenantOccupation] = useState('');

  // Payment Form State
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('Bank Wire Transfer');
  const [paymentRefNo, setPaymentRefNo] = useState('');
  const [renewalMonths, setRenewalMonths] = useState(12); // 6, 12, 24
  const [sanitationFee, setSanitationFee] = useState(150);
  const [securityFee, setSecurityFee] = useState(200);
  const [waterFee, setWaterFee] = useState(100);
  const [includeServiceCharges, setIncludeServiceCharges] = useState(true);

  useEffect(() => {
    if (paymentTenant) {
      const baseRent = Number(paymentTenant.monthlyRent) || 0;
      const rentSubtotal = baseRent * renewalMonths;
      const serviceSubtotal = includeServiceCharges ? (sanitationFee + securityFee + waterFee) * renewalMonths : 0;
      setPaymentAmount(rentSubtotal + serviceSubtotal);
    }
  }, [paymentTenant, renewalMonths, includeServiceCharges, sanitationFee, securityFee, waterFee]);

  const getInitials = (name) => {
    if (!name || name === '-') return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  // Handlers
  const handleGhanaCardFormat = (e) => {
    let val = e.target.value.toUpperCase();
    if (!val.startsWith('GHA-')) {
      val = 'GHA-' + val.replace(/GHA-/g, '');
    }
    setNewTenantGhanaCard(val);
  };

  const handleOnboardNewResident = (e) => {
    e.preventDefault();
    const newId = `RES-${Math.floor(1000 + Math.random() * 8999)}`;
    const newResident = {
      id: newId,
      name: newTenantName,
      email: newTenantEmail,
      phone: newTenantPhone,
      property: '-',
      unit: '-',
      monthlyRent: 0,
      securityDeposit: 0,
      status: 'Registered / Unassigned',
      rentStatus: 'No Active Lease',
      leaseStart: '-',
      leaseEnd: '-',
      ghanaCardNo: newTenantGhanaCard || 'GHA-901283748-1',
      ghanaCardFront: '',
      ghanaCardBack: '',
      passportPhoto: '',
      guarantorName: newTenantGuarantor || 'Guarantor Backup',
      guarantorPhone: newTenantGuarantorPhone || '+233 20 000 0000',
      witnessName: newTenantWitness || 'Samuel Osei Tutu',
      witnessPhone: newTenantWitnessPhone || '+233 20 444 8811',
      employer: newTenantEmployer || 'Independent Professional',
      occupation: newTenantOccupation || 'Executive',
      bankName: newTenantBank || 'Ecobank Ghana PLC',
      bankAccNo: newTenantAccNo || 'N/A',
      maintenanceTicketsCount: 0,
      lastPaymentDate: '-',
      rating: 5.0,
      notes: `Newly onboarded resident profile. Employer: ${newTenantEmployer || 'Independent Professional'}. Emergency Guarantor: ${newTenantGuarantor}. Legal Witness: ${newTenantWitness}.`
    };

    const updatedList = [newResident, ...tenantsList];
    setTenantsList(updatedList);
    saveStoredTenants(updatedList);
    setShowAddModal(false);
    setSuccessMsg(`Resident ${newResident.name} successfully onboarded and registered! Ready for unit assignment.`);
    setTimeout(() => setSuccessMsg(''), 5000);

    // Reset fields
    setNewTenantName('');
    setNewTenantEmail('');
    setNewTenantPhone('');
    setNewTenantGhanaCard('');
    setNewTenantGuarantor('');
    setNewTenantGuarantorPhone('');
    setNewTenantWitness('');
    setNewTenantWitnessPhone('');
    setNewTenantEmployer('');
    setNewTenantOccupation('');
    setNewTenantAccNo('');
  };

  const getArrearsConsumedMonths = (tenant) => {
    if (!tenant || !tenant.leaseEnd || tenant.leaseEnd === '-') return 0;
    const existingEnd = new Date(tenant.leaseEnd);
    if (isNaN(existingEnd.getTime())) return 0;
    const now = new Date();
    if (existingEnd < now) {
      const diffMs = now.getTime() - existingEnd.getTime();
      const diffMonths = diffMs / (1000 * 3600 * 24 * 30.44);
      return Math.max(1, Math.round(diffMonths));
    }
    return 0;
  };

  const handleProcessPayment = (e) => {
    e.preventDefault();
    if (!paymentTenant) return;

    // Calculate new lease end date starting from existing expiration or today
    let currentEndDate = new Date();
    let consumedMonths = 0;
    if (paymentTenant.leaseEnd && paymentTenant.leaseEnd !== '-') {
      const existingEnd = new Date(paymentTenant.leaseEnd);
      if (!isNaN(existingEnd.getTime())) {
        if (existingEnd > new Date()) {
          currentEndDate = existingEnd;
        } else {
          // Expired lease in arrears! Start extending from the exact past expiration date
          consumedMonths = getArrearsConsumedMonths(paymentTenant);
          currentEndDate = new Date(existingEnd.getTime());
        }
      }
    }
    currentEndDate.setMonth(currentEndDate.getMonth() + renewalMonths);
    const newLeaseEndDateStr = currentEndDate.toISOString().split('T')[0];

    const baseRent = Number(paymentTenant.monthlyRent) || 0;
    const rentSubtotal = baseRent * renewalMonths;
    const serviceSubtotal = includeServiceCharges ? (sanitationFee + securityFee + waterFee) * renewalMonths : 0;
    const remainingFutureMonths = Math.max(0, renewalMonths - consumedMonths);
    const isStillExpired = currentEndDate <= new Date();
    const newRentStatus = isStillExpired ? 'Arrears / Overdue' : 'Paid Up';
    const newStatus = isStillExpired ? 'Expired Lease' : 'Active Lease';

    const receiptData = {
      receiptNo: `REC-${Math.floor(100000 + Math.random() * 900000)}`,
      tenantName: paymentTenant.name,
      property: paymentTenant.property,
      unit: paymentTenant.unit,
      amount: Number(paymentAmount),
      paymentMethod,
      refNo: paymentRefNo || `ACH-${Math.floor(10000 + Math.random() * 90000)}`,
      date: new Date().toLocaleDateString('en-GH', { year: 'numeric', month: 'long', day: 'numeric' }),
      time: new Date().toLocaleTimeString('en-GH', { hour: '2-digit', minute: '2-digit' }),
      ghanaCardNo: paymentTenant.ghanaCardNo,
      renewalMonths,
      consumedMonths,
      remainingFutureMonths,
      newLeaseEndDateStr,
      rentSubtotal,
      serviceSubtotal,
      includeServiceCharges,
      sanitationFee,
      securityFee,
      waterFee
    };

    const newHistoryRecord = {
      receiptNo: receiptData.receiptNo,
      date: new Date().toISOString().split('T')[0],
      amount: receiptData.amount,
      duration: `${renewalMonths} Months`,
      baseRent: rentSubtotal,
      levies: serviceSubtotal,
      paymentMethod,
      refNo: receiptData.refNo,
      cashier: 'Louis K. Executive',
      newLeaseEnd: newLeaseEndDateStr
    };

    const updatedList = tenantsList.map(t => {
      if (t.id === paymentTenant.id) {
        return {
          ...t,
          rentStatus: newRentStatus,
          status: newStatus,
          leaseEnd: newLeaseEndDateStr,
          lastPaymentDate: new Date().toISOString().split('T')[0],
          notes: `[RENEWAL] Rent payment & lease renewal for ${renewalMonths} Months (GHS ${Number(paymentAmount).toLocaleString()} total: GHS ${rentSubtotal.toLocaleString()} rent + GHS ${serviceSubtotal.toLocaleString()} levies) logged via ${paymentMethod} (Ref: ${paymentRefNo || 'AUTO-ACH'}). ${consumedMonths > 0 ? `Deducted ${consumedMonths} months of past overstay arrears. ` : ''}Lease successfully extended from ${paymentTenant.leaseEnd} to ${newLeaseEndDateStr}. ${t.notes}`,
          paymentHistory: [newHistoryRecord, ...(t.paymentHistory || [])]
        };
      }
      return t;
    });

    setTenantsList(updatedList);
    saveStoredTenants(updatedList);

    // Also sync the linked unit if applicable
    const storedUnits = getStoredUnits();
    const updatedUnits = storedUnits.map(u => {
      if (u.tenant === paymentTenant.name || u.id === paymentTenant.unit) {
        return {
          ...u,
          rentStatus: newRentStatus,
          status: isStillExpired ? 'Vacant' : 'Occupied',
          lastPaid: new Date().toISOString().split('T')[0]
        };
      }
      return u;
    });
    saveStoredUnits(updatedUnits);

    setSuccessMsg(`Rent renewal (${renewalMonths} Months) successfully processed for ${paymentTenant.name}! ${consumedMonths > 0 ? `${consumedMonths} Months deducted for arrears. ` : ''}Lease extended to ${newLeaseEndDateStr}.`);
    setTimeout(() => setSuccessMsg(''), 5000);
    setShowLogPaymentModal(false);
    setPaymentTenant(null);
    setPaymentAmount(0);
    setPaymentRefNo('');
    setPrintableReceipt(receiptData);
  };

  // Filtered Roster
  const filteredTenants = useMemo(() => {
    return tenantsList.filter(t => {
      const matchSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          t.unit.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.ghanaCardNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = statusFilter === 'ALL' || t.status === statusFilter;
      const matchProp = propertyFilter === 'ALL' || t.property === propertyFilter;
      return matchSearch && matchStatus && matchProp;
    });
  }, [tenantsList, searchTerm, statusFilter, propertyFilter]);

  // Aggregate Metrics calculation
  const totalMonthlyRoll = useMemo(() => tenantsList.reduce((acc, t) => acc + t.monthlyRent, 0), [tenantsList]);
  const activeTenantsCount = useMemo(() => tenantsList.filter(t => t.status === 'Active Lease').length, [tenantsList]);
  const arrearsCount = useMemo(() => tenantsList.filter(t => t.rentStatus.includes('Arrears')).length, [tenantsList]);
  const outstandingDepositTotal = useMemo(() => tenantsList.reduce((acc, t) => acc + t.securityDeposit, 0), [tenantsList]);

  const totalCollectedToDate = useMemo(() => {
    return tenantsList.reduce((acc, t) => {
      const tenantTotal = (t.paymentHistory || []).reduce((sum, h) => sum + (Number(h.amount) || 0), 0);
      return acc + tenantTotal;
    }, 0);
  }, [tenantsList]);

  const totalOutstandingArrears = useMemo(() => {
    return tenantsList.reduce((acc, t) => {
      if (t.rentStatus === 'Arrears / Overdue') {
        const consumedMonths = getArrearsConsumedMonths(t) || 1;
        return acc + (t.monthlyRent * consumedMonths);
      }
      return acc;
    }, 0);
  }, [tenantsList]);

  const collectionRate = useMemo(() => {
    const total = totalCollectedToDate + totalOutstandingArrears;
    if (total === 0) return 100;
    return Math.round((totalCollectedToDate / total) * 100);
  }, [totalCollectedToDate, totalOutstandingArrears]);

  const occupancyPercentage = useMemo(() => {
    if (tenantsList.length === 0) return 0;
    const active = tenantsList.filter(t => t.status === 'Active Lease').length;
    return Math.round((active / tenantsList.length) * 100);
  }, [tenantsList]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', width: '100%', boxSizing: 'border-box' }}>
      
      {/* HEADER BANNER */}
      <div style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', borderRadius: '32px', padding: '40px 48px', color: 'white', position: 'relative', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.35)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
        <div style={{ position: 'absolute', right: '-40px', top: '-40px', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 70%)', pointerEvents: 'none' }}></div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 2, flexWrap: 'wrap', gap: '24px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <span style={{ padding: '6px 14px', background: 'rgba(16, 185, 129, 0.2)', border: '1px solid rgba(16, 185, 129, 0.4)', borderRadius: '20px', fontSize: '12px', fontWeight: '800', color: '#34d399', textTransform: 'uppercase', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Home size={14} /> Residential & Commercial Leasehold
              </span>
              <span style={{ fontSize: '13px', color: '#94a3b8', fontWeight: '600' }}>Active DB Version 3.4</span>
            </div>
            <h1 style={{ fontSize: '38px', fontWeight: '900', color: 'white', margin: '0 0 8px 0', letterSpacing: '-1px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              Tenant & Resident Dossier Management
            </h1>
            <p style={{ fontSize: '16px', color: '#cbd5e1', fontWeight: '500', margin: 0, maxWidth: '720px', lineHeight: '1.6' }}>
              Real-time lease administration, biometric Ghana Card validation, rent roll automated invoicing, and property maintenance dispatch center.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '16px' }}>
            <button 
              onClick={() => setShowAddModal(true)}
              style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white', border: 'none', padding: '16px 32px', borderRadius: '20px', fontSize: '15px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', boxShadow: '0 12px 25px -5px rgba(16, 185, 129, 0.5)', transition: 'all 0.2s' }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <UserPlus size={20} /> Onboard New Resident
            </button>
          </div>
        </div>
      </div>

      {/* NOTIFICATION ALERT */}
      <AnimatePresence>
        {successMsg && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{ background: '#ecfdf5', border: '1px solid #10b981', color: '#065f46', padding: '18px 28px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '16px', fontWeight: '700', fontSize: '15px', boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.2)' }}
          >
            <CheckCircle2 size={24} style={{ color: '#10b981', flexShrink: 0 }} />
            <span>{successMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* METRICS DASHBOARD */}
      {/* COMPACT METRICS DASHBOARD */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
        <div style={{ background: 'white', padding: '16px 18px', borderRadius: '16px', border: '1px solid #cbd5e1', boxShadow: '0 4px 12px -4px rgba(0,0,0,0.05)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Verified Tenants</span>
            <div style={{ width: '30px', height: '30px', borderRadius: '10px', background: '#ecfdf5', color: '#00875a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={16} />
            </div>
          </div>
          <h3 style={{ fontSize: '22px', fontWeight: '900', color: 'var(--text-main)', margin: '0 0 2px 0', letterSpacing: '-0.5px' }}>
            {activeTenantsCount} <span style={{ fontSize: '13px', fontWeight: '700', color: '#00875a' }}>Active</span>
          </h3>
          <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <TrendingUp size={12} color="#00875a" /> Registered leases: {tenantsList.length}
          </span>
        </div>

        <div style={{ background: 'white', padding: '16px 18px', borderRadius: '16px', border: '1px solid #cbd5e1', boxShadow: '0 4px 12px -4px rgba(0,0,0,0.05)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Monthly Rent Roll</span>
            <div style={{ width: '30px', height: '30px', borderRadius: '10px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <DollarSign size={16} />
            </div>
          </div>
          <h3 style={{ fontSize: '22px', fontWeight: '900', color: '#1e293b', margin: '0 0 2px 0', letterSpacing: '-0.5px' }}>
            ₵{totalMonthlyRoll.toLocaleString()}
          </h3>
          <span style={{ fontSize: '11px', color: '#2563eb', fontWeight: '700' }}>
            Expected billing / mo
          </span>
        </div>

        <div style={{ background: 'white', padding: '16px 18px', borderRadius: '16px', border: '1px solid #cbd5e1', boxShadow: '0 4px 12px -4px rgba(0,0,0,0.05)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Held Escrow Deposits</span>
            <div style={{ width: '30px', height: '30px', borderRadius: '10px', background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Landmark size={16} />
            </div>
          </div>
          <h3 style={{ fontSize: '22px', fontWeight: '900', color: '#1e293b', margin: '0 0 2px 0', letterSpacing: '-0.5px' }}>
            ₵{outstandingDepositTotal.toLocaleString()}
          </h3>
          <span style={{ fontSize: '11px', color: '#d97706', fontWeight: '700' }}>
            Refundable security
          </span>
        </div>

        <div style={{ background: 'white', padding: '16px 18px', borderRadius: '16px', border: '1px solid #cbd5e1', boxShadow: '0 4px 12px -4px rgba(0,0,0,0.05)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Rent Arrears Status</span>
            <div style={{ width: '30px', height: '30px', borderRadius: '10px', background: arrearsCount > 0 ? '#fee2e2' : '#ecfdf5', color: arrearsCount > 0 ? '#ef4444' : '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertCircle size={16} />
            </div>
          </div>
          <h3 style={{ fontSize: '22px', fontWeight: '900', color: arrearsCount > 0 ? '#ef4444' : '#10b981', margin: '0 0 2px 0', letterSpacing: '-0.5px' }}>
            {arrearsCount} {arrearsCount === 1 ? 'Tenant' : 'Tenants'}
          </h3>
          <span style={{ fontSize: '11px', color: arrearsCount > 0 ? '#ef4444' : '#10b981', fontWeight: '700' }}>
            {arrearsCount > 0 ? 'Pending collection notices' : '100% On-time compliance'}
          </span>
        </div>
      </div>

      {/* TAB NAVIGATION */}
      <div style={{ display: 'flex', gap: '12px', borderBottom: '2px solid #cbd5e1', paddingBottom: '16px', overflowX: 'auto' }}>
        {[
          { id: 'directory', label: 'Resident Directory', icon: Users, badge: tenantsList.length },
          { id: 'rent-roll', label: 'Rent Ledger & Roll', icon: Wallet }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{ 
              padding: '14px 26px', 
              borderRadius: '20px', 
              border: activeTab === tab.id ? '2px solid var(--primary)' : '1px solid #cbd5e1',
              backgroundColor: activeTab === tab.id ? 'var(--primary)' : 'white',
              color: activeTab === tab.id ? 'white' : 'var(--text-main)',
              fontWeight: '800', 
              fontSize: '14px', 
              cursor: 'pointer',
              display: 'flex', 
              alignItems: 'center', 
              gap: '10px',
              transition: 'all 0.2s',
              boxShadow: activeTab === tab.id ? '0 10px 20px -5px rgba(0, 135, 90, 0.4)' : 'none'
            }}
          >
            <tab.icon size={18} />
            <span>{tab.label}</span>
            {tab.badge !== undefined && tab.badge > 0 && (
              <span style={{ background: activeTab === tab.id ? 'white' : '#e2e8f0', color: activeTab === tab.id ? 'var(--primary)' : 'var(--text-muted)', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: '900' }}>
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* FILTER & SEARCH BAR (Only for Directory & Rent Roll) */}
      {(activeTab === 'directory' || activeTab === 'rent-roll') && (
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', background: 'white', padding: '20px 28px', borderRadius: '24px', border: '1px solid #cbd5e1', flexWrap: 'wrap', boxShadow: '0 5px 15px -5px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: '1 1 300px', background: '#f8fafc', padding: '14px 20px', borderRadius: '16px', border: '1px solid #cbd5e1' }}>
            <Search size={20} style={{ color: '#64748b' }} />
            <input 
              type="text" 
              placeholder="Search resident name, unit number, Ghana Card PIN, or ID..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ border: 'none', background: 'transparent', width: '100%', fontSize: '14px', fontWeight: '600', outline: 'none', color: 'var(--text-main)' }}
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={18} /></button>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f8fafc', padding: '12px 18px', borderRadius: '16px', border: '1px solid #cbd5e1' }}>
              <Filter size={18} style={{ color: '#64748b' }} />
              <span style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-muted)' }}>Status:</span>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ border: 'none', background: 'transparent', fontWeight: '800', fontSize: '13px', color: 'var(--text-main)', outline: 'none', cursor: 'pointer' }}>
                <option value="ALL">All Leases</option>
                <option value="Active Lease">Active Lease</option>
                <option value="Notice Given">Notice Given</option>
                <option value="Eviction Pending">Eviction Pending</option>
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f8fafc', padding: '12px 18px', borderRadius: '16px', border: '1px solid #cbd5e1' }}>
              <Building2 size={18} style={{ color: '#64748b' }} />
              <span style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-muted)' }}>Property:</span>
              <select value={propertyFilter} onChange={(e) => setPropertyFilter(e.target.value)} style={{ border: 'none', background: 'transparent', fontWeight: '800', fontSize: '13px', color: 'var(--text-main)', outline: 'none', cursor: 'pointer' }}>
                <option value="ALL">All Properties</option>
                <option value="RealtyOS Towers Ridge">RealtyOS Towers Ridge</option>
                <option value="RealtyOS Plaza East">RealtyOS Plaza East</option>
                <option value="Palm Ridge Executive Villas">Palm Ridge Executive Villas</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB CONTENT 1: DIRECTORY --- */}
      {activeTab === 'directory' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ background: 'white', padding: '24px 32px', borderRadius: '24px', border: '1px solid #cbd5e1', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.01)' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '22px', fontWeight: '900', color: 'var(--text-main)' }}>Residential & Commercial Tenant Roster</h3>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '600' }}>Showing {filteredTenants.length} active matching leases</span>
            </div>
          </div>

          {filteredTenants.length === 0 ? (
            <div style={{ background: 'white', borderRadius: '28px', border: '1px solid #cbd5e1', padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.05)' }}>
              <AlertTriangle size={48} style={{ marginBottom: '16px', color: '#94a3b8' }} />
              <h4 style={{ margin: '0 0 6px', fontSize: '20px', fontWeight: '800', color: 'var(--text-main)' }}>No Resident Records Found</h4>
              <span style={{ fontSize: '14px' }}>Adjust your keyword search or property filters above.</span>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '24px' }}>
              {filteredTenants.map((tenant) => {
                const leaseInfo = calculateLeaseStatus(tenant);
                
                // Determine if Residential or Commercial
                const isCommercial = tenant.property.toLowerCase().includes('office') || 
                                     tenant.property.toLowerCase().includes('retail') || 
                                     tenant.property.toLowerCase().includes('shop') || 
                                     tenant.property.toLowerCase().includes('peninsula') ||
                                     tenant.property.toLowerCase().includes('commercial');
                
                // Calculate lease progress percentage
                const start = new Date(tenant.leaseStart);
                const end = new Date(tenant.leaseEnd);
                const now = new Date();
                let leasePercent = 100;
                if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
                  const total = end.getTime() - start.getTime();
                  const elapsed = now.getTime() - start.getTime();
                  if (total > 0) {
                    leasePercent = Math.min(100, Math.max(0, (elapsed / total) * 100));
                  }
                }
                
                let progressColor = '#10b981';
                if (leaseInfo.statusText.includes('Critical') || leaseInfo.isOverdue) {
                  progressColor = '#ef4444';
                } else if (leaseInfo.statusText.includes('Expiry') || leaseInfo.statusText.includes('Nearing')) {
                  progressColor = '#f59e0b';
                }
                
                const gradients = [
                  'linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)',
                  'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  'linear-gradient(135deg, #f59e0b 0%, #e11d48 100%)',
                  'linear-gradient(135deg, #8b5cf6 0%, #d946ef 100%)',
                  'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)'
                ];
                const avatarBg = gradients[Math.abs(tenant.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) % gradients.length];
                
                return (
                  <motion.div
                    key={tenant.id}
                    whileHover={{ y: -6, boxShadow: '0 20px 40px -15px rgba(15, 23, 42, 0.12)' }}
                    onClick={() => setSelectedTenantProfile(tenant)}
                    style={{
                      background: 'white',
                      border: leaseInfo.isOverdue ? '2px solid #ef4444' : '1px solid #cbd5e1',
                      borderRadius: '28px',
                      padding: '24px',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '18px',
                      position: 'relative',
                      boxShadow: '0 8px 24px -8px rgba(0, 0, 0, 0.04)',
                      transition: 'border-color 0.2s ease',
                      boxSizing: 'border-box'
                    }}
                  >
                    {/* Header: Initial + Name + Type Badge */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ 
                        width: '52px', 
                        height: '52px', 
                        borderRadius: '16px', 
                        background: avatarBg, 
                        color: 'white', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        fontWeight: '900', 
                        fontSize: '20px', 
                        border: '2px solid white', 
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)', 
                        flexShrink: 0 
                      }}>
                        {getInitials(tenant.name)}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
                          <span style={{ 
                            fontWeight: '900', 
                            fontSize: '16px', 
                            color: 'var(--text-main)', 
                            letterSpacing: '-0.3px',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}>
                            {tenant.name}
                          </span>
                          <span style={{
                            padding: '3px 8px',
                            borderRadius: '8px',
                            fontSize: '10px',
                            fontWeight: '800',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            background: isCommercial ? '#faf5ff' : '#e0f2fe',
                            color: isCommercial ? '#7c3aed' : '#0369a1',
                            border: isCommercial ? '1px solid #d8b4fe' : '1px solid #bae6fd'
                          }}>
                            {isCommercial ? '💼 Commercial' : '🏠 Residential'}
                          </span>
                        </div>
                        <span style={{ 
                          fontSize: '12px', 
                          color: 'var(--primary)', 
                          fontWeight: '800', 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '4px', 
                          marginTop: '4px' 
                        }}>
                          <Home size={12} /> {tenant.property} • <strong style={{ color: '#334155' }}>{tenant.unit}</strong>
                        </span>
                      </div>
                    </div>

                    {/* Contact Bar */}
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between', 
                      background: '#f8fafc', 
                      padding: '10px 14px', 
                      borderRadius: '16px',
                      border: '1px solid #e2e8f0',
                      gap: '8px'
                    }}>
                      <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                        <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tenant.email}</span>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600', marginTop: '2px' }}>{tenant.phone}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }} onClick={e => e.stopPropagation()}>
                        <a href={`mailto:${tenant.email}`} style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'white', border: '1px solid #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', transition: '0.2s', textDecoration: 'none' }}>
                          <Mail size={14} />
                        </a>
                        <a href={`tel:${tenant.phone}`} style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'white', border: '1px solid #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', transition: '0.2s', textDecoration: 'none' }}>
                          <PhoneCall size={14} />
                        </a>
                      </div>
                    </div>

                    {/* Financials block: Rent & Security deposit */}
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: '1fr 1fr', 
                      gap: '12px',
                      borderBottom: '1px solid #f1f5f9',
                      paddingBottom: '16px'
                    }}>
                      <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Monthly Rent</span>
                        <span style={{ fontSize: '16px', fontWeight: '900', color: 'var(--text-main)', fontFamily: 'monospace', marginTop: '4px', display: 'block' }}>₵{tenant.monthlyRent.toLocaleString()}</span>
                      </div>
                      <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Security Deposit</span>
                        <span style={{ fontSize: '16px', fontWeight: '900', color: '#00875a', fontFamily: 'monospace', marginTop: '4px', display: 'block' }}>₵{tenant.securityDeposit.toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Lease Status & Progress Bar */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Lease Duration Meter</span>
                        <span style={{ 
                          padding: '3px 8px', 
                          borderRadius: '8px', 
                          fontSize: '10px', 
                          fontWeight: '800', 
                          background: leaseInfo.badgeBg, 
                          color: leaseInfo.badgeColor, 
                          border: `1px solid ${leaseInfo.badgeBorder}` 
                        }}>
                          {leaseInfo.statusText}
                        </span>
                      </div>
                      
                      {tenant.leaseStart && tenant.leaseStart !== '-' ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <div style={{ width: '100%', height: '8px', borderRadius: '4px', background: '#e2e8f0', overflow: 'hidden' }}>
                            <div style={{ width: `${leasePercent}%`, height: '100%', borderRadius: '4px', background: progressColor, transition: 'width 0.5s ease-out' }}></div>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#64748b', fontWeight: '700' }}>
                            <span>Start: {tenant.leaseStart}</span>
                            <span>End: {tenant.leaseEnd}</span>
                          </div>
                        </div>
                      ) : (
                        <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '600', fontStyle: 'italic' }}>No active lease dates configured.</span>
                      )}
                    </div>

                    {/* Ghana Card KYC Badge */}
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '8px', 
                      background: '#ecfdf5', 
                      border: '1px solid #a7f3d0', 
                      padding: '10px 14px', 
                      borderRadius: '16px' 
                    }}>
                      <ShieldCheck size={18} style={{ color: '#10b981', flexShrink: 0 }} />
                      <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                        <span style={{ fontSize: '10px', fontWeight: '800', color: '#065f46', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Ghana Card Verified KYC</span>
                        <span style={{ fontSize: '12px', fontWeight: '900', color: '#047857', fontFamily: 'monospace', letterSpacing: '0.5px' }}>{tenant.ghanaCardNo}</span>
                      </div>
                    </div>

                    {/* Quick-Action Dock */}
                    <div style={{ 
                      display: 'flex', 
                      gap: '8px', 
                      borderTop: '1px solid #cbd5e1', 
                      paddingTop: '16px', 
                      marginTop: 'auto',
                      justifyContent: 'space-between'
                    }} onClick={(e) => e.stopPropagation()}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          title="Edit Resident Profile"
                          onClick={() => { setTenantToEdit(tenant); setShowEditModal(true); }}
                          style={{ background: '#eff6ff', border: '1px solid #bfdbfe', width: '36px', height: '36px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb', cursor: 'pointer', transition: '0.2s' }}
                          onMouseEnter={(e) => e.currentTarget.style.background = '#dbeafe'}
                          onMouseLeave={(e) => e.currentTarget.style.background = '#eff6ff'}
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          title="Delete Resident Profile"
                          onClick={() => handleDeleteResident(tenant.id, tenant.name, tenant.unit)}
                          style={{ background: '#fee2e2', border: '1px solid #fecaca', width: '36px', height: '36px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#dc2626', cursor: 'pointer', transition: '0.2s' }}
                          onMouseEnter={(e) => e.currentTarget.style.background = '#fcd3d3'}
                          onMouseLeave={(e) => e.currentTarget.style.background = '#fee2e2'}
                        >
                          <Trash2 size={16} />
                        </button>
                        <button
                          title="Audit Payment History & Ledger"
                          onClick={() => setSelectedHistoryTenant(tenant)}
                          style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', width: '36px', height: '36px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', cursor: 'pointer', transition: '0.2s' }}
                          onMouseEnter={(e) => e.currentTarget.style.background = '#e2e8f0'}
                          onMouseLeave={(e) => e.currentTarget.style.background = '#f1f5f9'}
                        >
                          <History size={16} />
                        </button>
                      </div>
                      <button
                        onClick={() => { setPaymentTenant(tenant); setPaymentAmount(tenant.monthlyRent); setShowLogPaymentModal(true); }}
                        style={{ background: '#ecfdf5', border: '1px solid #10b981', padding: '0 14px', height: '36px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '6px', color: '#00875a', fontWeight: '800', fontSize: '13px', cursor: 'pointer', transition: '0.2s' }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = '#10b981'; e.currentTarget.style.color = 'white'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = '#ecfdf5'; e.currentTarget.style.color = '#00875a'; }}
                      >
                        <DollarSign size={14} /> Pay Rent
                      </button>
                    </div>

                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* --- TAB CONTENT 2: RENT LEDGER & ROLL --- */}
      {activeTab === 'rent-roll' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', width: '100%', boxSizing: 'border-box' }}>
          
          {/* Visual Financial Metrics Telemetry Tiles */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
            {/* Tile 1: Gross Expected */}
            <div style={{ 
              background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', 
              color: 'white', 
              padding: '24px', 
              borderRadius: '24px', 
              border: '1px solid rgba(255, 255, 255, 0.1)', 
              boxShadow: '0 12px 24px -10px rgba(15, 23, 42, 0.3)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{ position: 'absolute', right: '-10px', top: '-10px', width: '80px', height: '80px', background: 'radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 70%)', pointerEvents: 'none' }}></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <span style={{ fontSize: '12px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.75px' }}>Gross Scheduled Revenue</span>
                <div style={{ width: '36px', height: '36px', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.1)', color: '#34d399', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Landmark size={18} />
                </div>
              </div>
              <h3 style={{ fontSize: '28px', fontWeight: '955', margin: '0 0 4px 0', letterSpacing: '-0.5px', fontFamily: 'monospace' }}>
                ₵{totalMonthlyRoll.toLocaleString()}
              </h3>
              <span style={{ fontSize: '12px', color: '#cbd5e1', fontWeight: '600' }}>Expected monthly roll</span>
            </div>

            {/* Tile 2: Total Collected */}
            <div style={{ 
              background: 'white', 
              padding: '24px', 
              borderRadius: '24px', 
              border: '1px solid #cbd5e1', 
              boxShadow: '0 10px 20px -8px rgba(0, 0, 0, 0.04)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.75px' }}>Total Receipts to Date</span>
                <div style={{ width: '36px', height: '36px', borderRadius: '12px', background: '#ecfdf5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Coins size={18} />
                </div>
              </div>
              <h3 style={{ fontSize: '28px', fontWeight: '955', color: 'var(--text-main)', margin: '0 0 6px 0', letterSpacing: '-0.5px', fontFamily: 'monospace' }}>
                ₵{totalCollectedToDate.toLocaleString()}
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ flex: 1, height: '6px', borderRadius: '3px', background: '#e2e8f0', overflow: 'hidden' }}>
                  <div style={{ width: `${collectionRate}%`, height: '100%', background: '#10b981' }}></div>
                </div>
                <span style={{ fontSize: '11px', color: '#047857', fontWeight: '850', background: '#ecfdf5', padding: '2px 8px', borderRadius: '8px', border: '1px solid #a7f3d0' }}>
                  {collectionRate}% efficiency
                </span>
              </div>
            </div>

            {/* Tile 3: Outstanding Arrears */}
            <div style={{ 
              background: 'white', 
              padding: '24px', 
              borderRadius: '24px', 
              border: totalOutstandingArrears > 0 ? '1.5px solid #fca5a5' : '1px solid #cbd5e1', 
              boxShadow: '0 10px 20px -8px rgba(0, 0, 0, 0.04)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.75px' }}>Outstanding Arrears</span>
                <div style={{ width: '36px', height: '36px', borderRadius: '12px', background: totalOutstandingArrears > 0 ? '#fee2e2' : '#ecfdf5', color: totalOutstandingArrears > 0 ? '#ef4444' : '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <AlertTriangle size={18} />
                </div>
              </div>
              <h3 style={{ fontSize: '28px', fontWeight: '955', color: totalOutstandingArrears > 0 ? '#dc2626' : '#059669', margin: '0 0 4px 0', letterSpacing: '-0.5px', fontFamily: 'monospace' }}>
                ₵{totalOutstandingArrears.toLocaleString()}
              </h3>
              <span style={{ fontSize: '12px', color: totalOutstandingArrears > 0 ? '#ef4444' : '#64748b', fontWeight: '700' }}>
                {arrearsCount} account{arrearsCount === 1 ? '' : 's'} past due
              </span>
            </div>

            {/* Tile 4: Occupancy Ratio */}
            <div style={{ 
              background: 'white', 
              padding: '24px', 
              borderRadius: '24px', 
              border: '1px solid #cbd5e1', 
              boxShadow: '0 10px 20px -8px rgba(0, 0, 0, 0.04)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.75px' }}>Portfolio Occupancy</span>
                <div style={{ width: '36px', height: '36px', borderRadius: '12px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Home size={18} />
                </div>
              </div>
              <h3 style={{ fontSize: '28px', fontWeight: '955', color: 'var(--text-main)', margin: '0 0 4px 0', letterSpacing: '-0.5px', fontFamily: 'monospace' }}>
                {occupancyPercentage}%
              </h3>
              <span style={{ fontSize: '12px', color: '#2563eb', fontWeight: '700' }}>
                {activeTenantsCount} active / {tenantsList.length} total units
              </span>
            </div>
          </div>

          {/* Detailed Financial Ledger Card Grid */}
          <div style={{ background: 'transparent', padding: '0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '900', color: 'var(--text-main)' }}>Rent Ledger & Roll</h3>
                <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--text-muted)', fontWeight: '600' }}>
                  Showing {filteredTenants.length} leasehold ledger accounts
                </p>
              </div>
            </div>

            {filteredTenants.length === 0 ? (
              <div style={{ background: 'white', padding: '40px', borderRadius: '28px', border: '1px solid #cbd5e1', textAlign: 'center', color: '#94a3b8' }}>
                <AlertCircle size={40} style={{ marginBottom: '12px' }} />
                <h4 style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: '800', color: '#475569' }}>No Ledger Matches</h4>
                <span style={{ fontSize: '13px' }}>Try adjusting your searches or property filters.</span>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '24px' }}>
                {filteredTenants.map((tenant, idx) => {
                  const leaseInfo = calculateLeaseStatus(tenant);
                  const isCommercial = tenant.property.toLowerCase().includes('office') || 
                                       tenant.property.toLowerCase().includes('retail') || 
                                       tenant.property.toLowerCase().includes('shop') || 
                                       tenant.property.toLowerCase().includes('commercial');
                  
                  const tenantTotalCollected = (tenant.paymentHistory || []).reduce((sum, h) => sum + (Number(h.amount) || 0), 0);
                  const overdueMonths = tenant.rentStatus === 'Arrears / Overdue' ? (getArrearsConsumedMonths(tenant) || 1) : 0;
                  const tenantOutstanding = overdueMonths * tenant.monthlyRent;
                  
                  const initials = getInitials(tenant.name);
                  
                  const gradients = [
                    'linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)',
                    'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    'linear-gradient(135deg, #f59e0b 0%, #e11d48 100%)',
                    'linear-gradient(135deg, #8b5cf6 0%, #d946ef 100%)',
                    'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)'
                  ];
                  const avatarBg = gradients[Math.abs(tenant.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) % gradients.length];
                  
                  return (
                    <div 
                      key={tenant.id} 
                      style={{ 
                        background: 'white', 
                        border: tenantOutstanding > 0 ? '2px solid #fca5a5' : '1px solid #cbd5e1', 
                        borderRadius: '28px', 
                        padding: '24px', 
                        boxShadow: '0 8px 24px -8px rgba(0,0,0,0.04)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '18px',
                        position: 'relative',
                        boxSizing: 'border-box'
                      }}
                    >
                      {/* Header */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ 
                          width: '48px', 
                          height: '48px', 
                          borderRadius: '14px', 
                          background: isCommercial ? 'linear-gradient(135deg, #7c3aed 0%, #c084fc 100%)' : 'linear-gradient(135deg, #10b981 0%, #60a5fa 100%)', 
                          color: 'white', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          fontWeight: '900', 
                          fontSize: '18px',
                          flexShrink: 0
                        }}>
                          {initials}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                            <span style={{ fontWeight: '900', fontSize: '16px', color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {tenant.name}
                            </span>
                            <span style={{ 
                              padding: '4px 10px', 
                              borderRadius: '10px', 
                              fontSize: '10px', 
                              fontWeight: '800', 
                              background: leaseInfo.badgeBg, 
                              color: leaseInfo.badgeColor, 
                              border: `1px solid ${leaseInfo.badgeBorder}`,
                              whiteSpace: 'nowrap'
                            }}>
                              {leaseInfo.statusText}
                            </span>
                          </div>
                          <span style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                            <Home size={12} /> {tenant.property.replace('RealtyOS ', '')} • <strong style={{ color: '#334155' }}>{tenant.unit}</strong>
                          </span>
                        </div>
                      </div>

                      {/* Financial Blocks */}
                      <div style={{ display: 'flex', gap: '12px' }}>
                        <div style={{ flex: 1, background: '#f8fafc', padding: '12px 16px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                          <span style={{ fontSize: '10px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '4px' }}>Expected Rent</span>
                          <span style={{ fontSize: '16px', fontWeight: '900', fontFamily: 'monospace', color: 'var(--text-main)' }}>₵{tenant.monthlyRent.toLocaleString()}</span>
                        </div>
                        <div style={{ flex: 1, background: '#f8fafc', padding: '12px 16px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                          <span style={{ fontSize: '10px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '4px' }}>Escrow Deposit</span>
                          <span style={{ fontSize: '16px', fontWeight: '900', fontFamily: 'monospace', color: '#00875a' }}>₵{tenant.securityDeposit.toLocaleString()}</span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '12px' }}>
                        <div style={{ flex: 1, background: '#ecfdf5', padding: '12px 16px', borderRadius: '16px', border: '1px solid #a7f3d0' }}>
                          <span style={{ fontSize: '10px', fontWeight: '800', color: '#047857', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '4px' }}>Collected</span>
                          <span style={{ fontSize: '16px', fontWeight: '900', fontFamily: 'monospace', color: '#065f46' }}>₵{tenantTotalCollected.toLocaleString()}</span>
                        </div>
                        <div style={{ flex: 1, background: tenantOutstanding > 0 ? '#fee2e2' : '#f8fafc', padding: '12px 16px', borderRadius: '16px', border: tenantOutstanding > 0 ? '1px solid #fca5a5' : '1px solid #e2e8f0' }}>
                          <span style={{ fontSize: '10px', fontWeight: '800', color: tenantOutstanding > 0 ? '#b91c1c' : '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '4px' }}>Arrears</span>
                          <span style={{ fontSize: '16px', fontWeight: '900', fontFamily: 'monospace', color: tenantOutstanding > 0 ? '#dc2626' : '#059669' }}>
                            {tenantOutstanding > 0 ? `₵${tenantOutstanding.toLocaleString()}` : '—'}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div style={{ display: 'flex', gap: '12px', marginTop: '4px' }}>
                        <button 
                          onClick={() => setSelectedHistoryTenant(tenant)}
                          style={{ 
                            flex: 1,
                            background: 'white', 
                            color: '#334155', 
                            border: '1px solid #cbd5e1', 
                            padding: '10px', 
                            borderRadius: '12px', 
                            fontSize: '12px', 
                            fontWeight: '800', 
                            cursor: 'pointer', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            gap: '6px',
                            transition: '0.2s'
                          }}
                          onMouseEnter={e => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.borderColor = '#94a3b8'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.borderColor = '#cbd5e1'; }}
                        >
                          <History size={14} style={{ color: 'var(--primary)' }} /> Audit Ledger
                        </button>
                        <button 
                          onClick={() => { setPaymentTenant(tenant); setPaymentAmount(tenant.monthlyRent); setShowLogPaymentModal(true); }}
                          style={{ 
                            flex: 1,
                            background: leaseInfo.isOverdue ? '#ef4444' : '#10b981', 
                            color: 'white', 
                            border: 'none', 
                            padding: '10px', 
                            borderRadius: '12px', 
                            fontSize: '12px', 
                            fontWeight: '800', 
                            cursor: 'pointer', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            gap: '6px',
                            transition: '0.2s',
                            boxShadow: leaseInfo.isOverdue ? '0 4px 12px rgba(239, 68, 68, 0.2)' : '0 4px 12px rgba(16, 185, 129, 0.2)'
                          }}
                          onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.1)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                          onMouseLeave={e => { e.currentTarget.style.filter = 'brightness(1)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                        >
                          <DollarSign size={14} /> Record Payment
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: ONBOARD NEW RESIDENT / TENANT DOSSIER */}
      {/* ========================================================= */}
      <AnimatePresence>
        {showAddModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px', boxSizing: 'border-box' }}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              style={{ background: '#f8fafc', borderRadius: '32px', width: '980px', maxWidth: '100%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 35px 60px -15px rgba(0,0,0,0.35)', display: 'flex', flexDirection: 'column', border: '1px solid rgba(255,255,255,0.4)', boxSizing: 'border-box' }}
            >
              <div style={{ padding: '36px 40px', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '4px solid var(--primary)', flexShrink: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '18px', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#34d399', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)' }}>
                    <UserPlus size={28} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '26px', fontWeight: '900', margin: '0', letterSpacing: '-0.5px', color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      Onboard New Resident Dossier <span style={{ fontSize: '11px', background: 'var(--primary)', color: 'white', padding: '4px 10px', borderRadius: '20px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>KYC Portal</span>
                    </h3>
                    <p style={{ fontSize: '13px', color: '#94a3b8', fontWeight: '600', margin: '4px 0 0', opacity: 0.9 }}>
                      Capture biometric ID scans, employment verification, emergency guarantor, and legal witness references prior to unit assignment.
                    </p>
                  </div>
                </div>
                <button onClick={() => setShowAddModal(false)} style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)', width: '42px', height: '42px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', cursor: 'pointer', transition: 'all 0.2s' }}>
                  <X size={22} />
                </button>
              </div>

              <form onSubmit={handleOnboardNewResident} style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '28px 36px', boxSizing: 'border-box' }}>
                
                {/* SECTION 1: PERSONAL & CONTACT (COMPACT 4-COL ROW) */}
                <div style={{ background: 'white', borderRadius: '20px', border: '1px solid #cbd5e1', padding: '20px 24px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                    <div style={{ width: '24px', height: '24px', borderRadius: '8px', background: '#ecfdf5', color: '#00875a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '12px' }}>1</div>
                    <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: 'var(--text-main)' }}>Resident Personal Details & KYC</h4>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '6px' }}>Full Legal Name</label>
                      <input type="text" required placeholder="e.g. Dr. Kwame Ansah" value={newTenantName} onChange={e => setNewTenantName(e.target.value)} style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: '600', outline: 'none', background: '#f8fafc', boxSizing: 'border-box' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '6px' }}>Ghana Card PIN</label>
                      <input type="text" required placeholder="GHA-718293810-1" value={newTenantGhanaCard} onChange={handleGhanaCardFormat} style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: '800', color: 'var(--primary)', outline: 'none', background: '#ecfdf5', boxSizing: 'border-box' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '6px' }}>Email Address</label>
                      <input type="email" required placeholder="k.ansah@health.gh" value={newTenantEmail} onChange={e => setNewTenantEmail(e.target.value)} style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: '600', outline: 'none', background: '#f8fafc', boxSizing: 'border-box' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '6px' }}>Phone Contact</label>
                      <input type="text" required placeholder="+233 20 112 2334" value={newTenantPhone} onChange={e => setNewTenantPhone(e.target.value)} style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: '600', outline: 'none', background: '#f8fafc', boxSizing: 'border-box' }} />
                    </div>
                  </div>
                </div>

                {/* SECTION 2 & 3 SIDE BY SIDE GRID */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  
                  {/* SECTION 2: EMPLOYMENT */}
                  <div style={{ background: 'white', borderRadius: '20px', border: '1px solid #cbd5e1', padding: '20px 24px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                        <div style={{ width: '24px', height: '24px', borderRadius: '8px', background: '#ecfdf5', color: '#00875a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '12px' }}>2</div>
                        <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: 'var(--text-main)' }}>Employment & Professional KYC</h4>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '6px' }}>Employer / Organization</label>
                          <input type="text" required placeholder="e.g. Korle-Bu Hospital or MTN" value={newTenantEmployer} onChange={e => setNewTenantEmployer(e.target.value)} style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: '600', outline: 'none', background: '#f8fafc', boxSizing: 'border-box' }} />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '6px' }}>Job Title / Occupation</label>
                          <input type="text" required placeholder="e.g. Chief Surgeon or Product Lead" value={newTenantOccupation} onChange={e => setNewTenantOccupation(e.target.value)} style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: '600', outline: 'none', background: '#f8fafc', boxSizing: 'border-box' }} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* SECTION 3: GUARANTOR & WITNESS */}
                  <div style={{ background: 'white', borderRadius: '20px', border: '1px solid #cbd5e1', padding: '20px 24px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                      <div style={{ width: '24px', height: '24px', borderRadius: '8px', background: '#ecfdf5', color: '#00875a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '12px' }}>3</div>
                      <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: 'var(--text-main)' }}>Guarantor & Legal Witness</h4>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '900', color: '#9f1239', marginBottom: '6px' }}>Guarantor Name</label>
                        <input type="text" required placeholder="Mrs. Ansah (Wife)" value={newTenantGuarantor} onChange={e => setNewTenantGuarantor(e.target.value)} style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', border: '1px solid #fca5a5', fontSize: '13px', fontWeight: '700', outline: 'none', background: '#fff1f2', boxSizing: 'border-box', color: '#881337' }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '900', color: '#9f1239', marginBottom: '6px' }}>Guarantor Phone</label>
                        <input type="text" required placeholder="+233 24 555 7788" value={newTenantGuarantorPhone} onChange={e => setNewTenantGuarantorPhone(e.target.value)} style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', border: '1px solid #fca5a5', fontSize: '13px', fontWeight: '700', outline: 'none', background: '#fff1f2', boxSizing: 'border-box', color: '#881337' }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#334155', marginBottom: '6px' }}>Witness Name</label>
                        <input type="text" required placeholder="Samuel Osei" value={newTenantWitness} onChange={e => setNewTenantWitness(e.target.value)} style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: '600', outline: 'none', background: '#f8fafc', boxSizing: 'border-box' }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#334155', marginBottom: '6px' }}>Witness Phone</label>
                        <input type="text" required placeholder="+233 20 444 8811" value={newTenantWitnessPhone} onChange={e => setNewTenantWitnessPhone(e.target.value)} style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: '600', outline: 'none', background: '#f8fafc', boxSizing: 'border-box' }} />
                      </div>
                    </div>
                  </div>

                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginTop: '8px' }}>
                  <button 
                    type="button" 
                    onClick={() => setShowAddModal(false)}
                    style={{ padding: '14px 28px', borderRadius: '14px', border: '1px solid #cbd5e1', background: 'white', color: '#334155', fontWeight: '800', fontSize: '14px', cursor: 'pointer' }}
                  >
                    Cancel Dossier
                  </button>
                  <button 
                    type="submit"
                    style={{ background: 'var(--primary)', color: 'white', border: 'none', padding: '14px 36px', borderRadius: '14px', fontSize: '14px', fontWeight: '800', cursor: 'pointer', boxShadow: '0 10px 20px -5px rgba(0, 135, 90, 0.4)' }}
                  >
                    <UserPlus size={18} /> Onboard Resident Profile
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================= */}
      {/* MODAL: RESIDENT PROFILE DOSSIER INSPECTION */}
      {/* ========================================================= */}
      <AnimatePresence>
        {selectedTenantProfile && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px', boxSizing: 'border-box' }}>
            <motion.div 
              style={{ background: '#f8fafc', borderRadius: '32px', width: '920px', maxWidth: '100%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 35px 60px -15px rgba(0,0,0,0.35)', display: 'flex', flexDirection: 'column', border: '1px solid rgba(255,255,255,0.4)', boxSizing: 'border-box' }}
            >
              {/* Header Banner */}
              <div style={{ padding: '40px 48px 60px', background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', color: 'white', position: 'relative', borderBottom: '4px solid var(--primary)' }}>
                <div style={{ position: 'absolute', top: '24px', right: '24px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <button 
                    onClick={() => { setTenantToEdit(selectedTenantProfile); setShowEditModal(true); }}
                    style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', padding: '10px 18px', borderRadius: '14px', display: 'flex', alignItems: 'center', gap: '8px', color: 'white', fontWeight: '800', fontSize: '13px', cursor: 'pointer' }}
                  >
                    <Edit3 size={16} /> Edit Resident
                  </button>
                  <button 
                    onClick={() => handleDeleteResident(selectedTenantProfile.id, selectedTenantProfile.name, selectedTenantProfile.unit)}
                    style={{ background: '#fee2e2', border: '1px solid #fca5a5', padding: '10px 18px', borderRadius: '14px', display: 'flex', alignItems: 'center', gap: '8px', color: '#ef4444', fontWeight: '800', fontSize: '13px', cursor: 'pointer' }}
                  >
                    <Trash2 size={16} /> Delete Resident
                  </button>
                  <button onClick={() => setSelectedTenantProfile(null)} style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)', width: '42px', height: '42px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', cursor: 'pointer' }}>
                    <X size={22} />
                  </button>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                  <div style={{ width: '84px', height: '84px', borderRadius: '24px', background: 'linear-gradient(135deg, var(--primary) 0%, #34d399 100%)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', fontWeight: '900', border: '4px solid rgba(255,255,255,0.2)', boxShadow: '0 12px 25px rgba(0,0,0,0.2)', flexShrink: 0 }}>
                    {getInitials(selectedTenantProfile.name)}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                      <span style={{ padding: '4px 12px', background: 'rgba(16, 185, 129, 0.2)', border: '1px solid rgba(16, 185, 129, 0.4)', borderRadius: '20px', fontSize: '11px', fontWeight: '800', color: '#34d399', textTransform: 'uppercase' }}>
                        {selectedTenantProfile.status}
                      </span>
                      <span style={{ fontSize: '13px', color: '#cbd5e1', fontWeight: '700' }}>ID: {selectedTenantProfile.id}</span>
                    </div>
                    <h2 style={{ margin: 0, fontSize: '32px', fontWeight: '900', color: 'white', letterSpacing: '-0.5px' }}>{selectedTenantProfile.name}</h2>
                    <span style={{ fontSize: '14px', color: '#94a3b8', fontWeight: '600', marginTop: '4px', display: 'block' }}>{selectedTenantProfile.property} • Unit {selectedTenantProfile.unit}</span>
                  </div>
                </div>
              </div>

              {/* Dossier Body */}
              <div style={{ padding: '36px 48px', display: 'flex', flexDirection: 'column', gap: '28px', boxSizing: 'border-box' }}>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
                  <div style={{ background: 'white', padding: '20px', borderRadius: '20px', border: '1px solid #cbd5e1' }}>
                    <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>Monthly Rent Rate</span>
                    <span style={{ fontSize: '22px', fontWeight: '900', color: 'var(--text-main)', marginTop: '2px', display: 'block' }}>₵{selectedTenantProfile.monthlyRent.toLocaleString()}</span>
                  </div>
                  <div style={{ background: 'white', padding: '20px', borderRadius: '20px', border: '1px solid #cbd5e1' }}>
                    <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>Security Deposit Escrow</span>
                    <span style={{ fontSize: '22px', fontWeight: '900', color: '#00875a', marginTop: '2px', display: 'block' }}>₵{selectedTenantProfile.securityDeposit.toLocaleString()}</span>
                  </div>
                  <div style={{ background: 'white', padding: '20px', borderRadius: '20px', border: '1px solid #cbd5e1' }}>
                    <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>Payment Compliance</span>
                    <span style={{ fontSize: '18px', fontWeight: '900', color: selectedTenantProfile.rentStatus === 'Paid Up' ? '#059669' : '#dc2626', marginTop: '4px', display: 'block' }}>{selectedTenantProfile.rentStatus}</span>
                  </div>
                </div>

                <div style={{ background: 'white', padding: '28px 32px', borderRadius: '24px', border: '1px solid #cbd5e1' }}>
                  <h4 style={{ margin: '0 0 20px 0', fontSize: '16px', fontWeight: '900', color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>KYC Verified Credentials</h4>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div>
                      <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>Email Contact</span>
                      <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-main)', display: 'block', marginTop: '2px' }}>{selectedTenantProfile.email}</span>
                    </div>
                    <div>
                      <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>Registered Mobile</span>
                      <span style={{ fontSize: '14px', fontWeight: '800', color: 'var(--primary)', display: 'block', marginTop: '2px' }}>{selectedTenantProfile.phone}</span>
                    </div>
                    <div>
                      <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>Employment & Occupation</span>
                      <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-main)', display: 'block', marginTop: '2px' }}>{selectedTenantProfile.occupation} • {selectedTenantProfile.employer}</span>
                    </div>
                    <div>
                      <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>Legal Witness Attestation</span>
                      <span style={{ fontSize: '14px', fontWeight: '800', color: '#334155', display: 'block', marginTop: '2px' }}>{selectedTenantProfile.witnessName || 'Samuel Osei Tutu'} ({selectedTenantProfile.witnessPhone || '+233 20 444 8811'})</span>
                    </div>
                  </div>
                </div>

                {/* Biometric Scans */}
                <div>
                  <h4 style={{ margin: '0 0 16px 0', fontSize: '15px', fontWeight: '900', color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>National Identity Scans (Ghana Card)</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <label style={{ background: 'white', borderRadius: '20px', overflow: 'hidden', border: '2px dashed #cbd5e1', height: '220px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative' }}>
                      <img src={selectedTenantProfile.ghanaCardFront} alt="Front" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <div style={{ position: 'absolute', bottom: '12px', right: '12px', background: 'rgba(15,23,42,0.8)', color: 'white', padding: '6px 12px', borderRadius: '12px', fontSize: '11px', fontWeight: '800', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Camera size={12} /> Click to Re-scan Front
                      </div>
                      <input type="file" accept="image/*" onChange={e => handleUpdateProfileGhanaCard(e, 'front')} style={{ display: 'none' }} />
                    </label>

                    <label style={{ background: 'white', borderRadius: '20px', overflow: 'hidden', border: '2px dashed #cbd5e1', height: '220px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative' }}>
                      <img src={selectedTenantProfile.ghanaCardBack} alt="Back" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <div style={{ position: 'absolute', bottom: '12px', right: '12px', background: 'rgba(15,23,42,0.8)', color: 'white', padding: '6px 12px', borderRadius: '12px', fontSize: '11px', fontWeight: '800', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Camera size={12} /> Click to Re-scan Back
                      </div>
                      <input type="file" accept="image/*" onChange={e => handleUpdateProfileGhanaCard(e, 'back')} style={{ display: 'none' }} />
                    </label>
                  </div>
                </div>

                <div style={{ background: '#fff1f2', border: '1px solid #fecdd3', padding: '24px 28px', borderRadius: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontSize: '11px', color: '#e11d48', fontWeight: '900', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>🚨 Emergency Guarantor Details</span>
                    <span style={{ fontSize: '18px', color: '#881337', fontWeight: '900', marginTop: '2px', display: 'block' }}>{selectedTenantProfile.guarantorName}</span>
                  </div>
                  <span style={{ fontSize: '15px', color: '#e11d48', fontWeight: '900', background: 'white', padding: '8px 16px', borderRadius: '14px', border: '1px solid #ffe4e6', boxShadow: '0 4px 12px rgba(225,29,72,0.1)' }}>
                    {selectedTenantProfile.guarantorPhone}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginTop: '12px' }}>
                  <button onClick={() => setSelectedTenantProfile(null)} style={{ padding: '16px 36px', borderRadius: '16px', border: '1px solid #cbd5e1', background: 'white', color: '#334155', fontWeight: '800', fontSize: '15px', cursor: 'pointer' }}>Close Profile</button>
                  <button onClick={() => { setSelectedHistoryTenant(selectedTenantProfile); setSelectedTenantProfile(null); }} style={{ background: 'var(--primary)', color: 'white', border: 'none', padding: '16px 40px', borderRadius: '16px', fontSize: '15px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 12px 25px -5px rgba(0, 135, 90, 0.4)' }}>
                    <History size={18} /> Audit Payment Ledger & History
                  </button>
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================= */}
      {/* MODAL: EDIT RESIDENT / TENANT DOSSIER */}
      {/* ========================================================= */}
      <AnimatePresence>
        {showEditModal && tenantToEdit && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200, padding: '20px', boxSizing: 'border-box' }}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              style={{ background: '#f8fafc', borderRadius: '32px', width: '920px', maxWidth: '100%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 35px 60px -15px rgba(0,0,0,0.35)', display: 'flex', flexDirection: 'column', border: '1px solid rgba(255,255,255,0.4)', boxSizing: 'border-box' }}
            >
              <div style={{ padding: '36px 40px', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '4px solid var(--primary)', flexShrink: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '18px', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#34d399', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)' }}>
                    <Edit3 size={28} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '26px', fontWeight: '900', margin: '0', letterSpacing: '-0.5px', color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      Modify Resident Profile: {tenantToEdit.id}
                    </h3>
                    <p style={{ fontSize: '13px', color: '#94a3b8', fontWeight: '600', margin: '4px 0 0', opacity: 0.9 }}>
                      Update contact details, employment status, emergency references, and tenancy compliance status.
                    </p>
                  </div>
                </div>
                <button onClick={() => setShowEditModal(false)} style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)', width: '42px', height: '42px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', cursor: 'pointer' }}>
                  <X size={22} />
                </button>
              </div>

              <form onSubmit={handleEditResidentSubmit} style={{ padding: '36px 40px', display: 'flex', flexDirection: 'column', gap: '28px', boxSizing: 'border-box' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div>
                    <label style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '8px', display: 'block' }}>Full Name</label>
                    <input name="name" type="text" defaultValue={tenantToEdit.name} required style={{ width: '100%', padding: '16px 20px', borderRadius: '16px', border: '1px solid #cbd5e1', fontSize: '15px', fontWeight: '800', boxSizing: 'border-box', outline: 'none' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '8px', display: 'block' }}>Email Address</label>
                    <input name="email" type="email" defaultValue={tenantToEdit.email} required style={{ width: '100%', padding: '16px 20px', borderRadius: '16px', border: '1px solid #cbd5e1', fontSize: '15px', fontWeight: '800', boxSizing: 'border-box', outline: 'none' }} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div>
                    <label style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '8px', display: 'block' }}>Phone Number</label>
                    <input name="phone" type="text" defaultValue={tenantToEdit.phone} required style={{ width: '100%', padding: '16px 20px', borderRadius: '16px', border: '1px solid #cbd5e1', fontSize: '15px', fontWeight: '800', boxSizing: 'border-box', outline: 'none' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '8px', display: 'block' }}>Ghana Card PIN</label>
                    <input name="ghanaCardNo" type="text" defaultValue={tenantToEdit.ghanaCardNo} required style={{ width: '100%', padding: '16px 20px', borderRadius: '16px', border: '1px solid #cbd5e1', fontSize: '15px', fontWeight: '800', boxSizing: 'border-box', outline: 'none' }} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div>
                    <label style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '8px', display: 'block' }}>Occupation / Title</label>
                    <input name="occupation" type="text" defaultValue={tenantToEdit.occupation} required style={{ width: '100%', padding: '16px 20px', borderRadius: '16px', border: '1px solid #cbd5e1', fontSize: '15px', fontWeight: '800', boxSizing: 'border-box', outline: 'none' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '8px', display: 'block' }}>Employer / Company</label>
                    <input name="employer" type="text" defaultValue={tenantToEdit.employer} required style={{ width: '100%', padding: '16px 20px', borderRadius: '16px', border: '1px solid #cbd5e1', fontSize: '15px', fontWeight: '800', boxSizing: 'border-box', outline: 'none' }} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div>
                    <label style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '8px', display: 'block' }}>Emergency Guarantor Name</label>
                    <input name="guarantorName" type="text" defaultValue={tenantToEdit.guarantorName} required style={{ width: '100%', padding: '16px 20px', borderRadius: '16px', border: '1px solid #cbd5e1', fontSize: '15px', fontWeight: '800', boxSizing: 'border-box', outline: 'none' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '8px', display: 'block' }}>Guarantor Phone Number</label>
                    <input name="guarantorPhone" type="text" defaultValue={tenantToEdit.guarantorPhone} required style={{ width: '100%', padding: '16px 20px', borderRadius: '16px', border: '1px solid #cbd5e1', fontSize: '15px', fontWeight: '800', boxSizing: 'border-box', outline: 'none' }} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div>
                    <label style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '8px', display: 'block' }}>Legal Witness Name</label>
                    <input name="witnessName" type="text" defaultValue={tenantToEdit.witnessName} required style={{ width: '100%', padding: '16px 20px', borderRadius: '16px', border: '1px solid #cbd5e1', fontSize: '15px', fontWeight: '800', boxSizing: 'border-box', outline: 'none' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '8px', display: 'block' }}>Witness Phone Number</label>
                    <input name="witnessPhone" type="text" defaultValue={tenantToEdit.witnessPhone} required style={{ width: '100%', padding: '16px 20px', borderRadius: '16px', border: '1px solid #cbd5e1', fontSize: '15px', fontWeight: '800', boxSizing: 'border-box', outline: 'none' }} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div>
                    <label style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '8px', display: 'block' }}>Lease Status</label>
                    <select name="status" defaultValue={tenantToEdit.status} style={{ width: '100%', padding: '16px 20px', borderRadius: '16px', border: '1px solid #cbd5e1', fontSize: '15px', fontWeight: '800', background: 'white', outline: 'none' }}>
                      <option value="Registered / Unassigned">Registered / Unassigned</option>
                      <option value="Active Lease">Active Lease</option>
                      <option value="Notice Given">Notice Given</option>
                      <option value="Eviction Pending">Eviction Pending</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '8px', display: 'block' }}>Rent Status</label>
                    <select name="rentStatus" defaultValue={tenantToEdit.rentStatus} style={{ width: '100%', padding: '16px 20px', borderRadius: '16px', border: '1px solid #cbd5e1', fontSize: '15px', fontWeight: '800', background: 'white', outline: 'none' }}>
                      <option value="Paid Up">Paid Up</option>
                      <option value="Arrears / Overdue">Arrears / Overdue</option>
                      <option value="No Active Lease">No Active Lease</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '8px', display: 'block' }}>Dossier Notes</label>
                  <textarea name="notes" defaultValue={tenantToEdit.notes} rows={3} style={{ width: '100%', padding: '16px 20px', borderRadius: '16px', border: '1px solid #cbd5e1', fontSize: '15px', fontWeight: '600', boxSizing: 'border-box', outline: 'none', fontFamily: 'inherit' }} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginTop: '12px' }}>
                  <button type="button" onClick={() => setShowEditModal(false)} style={{ padding: '16px 36px', borderRadius: '16px', border: '1px solid #cbd5e1', background: 'white', color: '#334155', fontWeight: '800', fontSize: '15px', cursor: 'pointer' }}>Cancel</button>
                  <button type="submit" style={{ background: 'var(--primary)', color: 'white', border: 'none', padding: '16px 40px', borderRadius: '16px', fontSize: '15px', fontWeight: '800', cursor: 'pointer', boxShadow: '0 12px 25px -5px rgba(0, 135, 90, 0.4)' }}>
                    Save Resident Modifications
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================= */}
      {/* MODAL: LOG RENT PAYMENT & ISSUE RECEIPT */}
      {/* ========================================================= */}
      <AnimatePresence>
        {showLogPaymentModal && paymentTenant && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, padding: '20px', boxSizing: 'border-box' }}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              style={{ background: 'white', borderRadius: '24px', padding: '28px 32px', width: '650px', maxWidth: '100%', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #f1f5f9', paddingBottom: '16px' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '900', color: 'var(--text-main)' }}>Log Rent Receipt & Deposit</h3>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>Tenant: {paymentTenant.name} ({paymentTenant.unit})</span>
                </div>
                <button onClick={() => setShowLogPaymentModal(false)} style={{ background: '#f8fafc', border: '1px solid #cbd5e1', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', cursor: 'pointer' }}>
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleProcessPayment} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* RENEWAL DURATION BUTTONS */}
                <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '16px', border: '1px solid #cbd5e1' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '10px' }}>Select Rental / Renewal Duration</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                    {[6, 12, 24].map(months => (
                      <button
                        key={months}
                        type="button"
                        onClick={() => setRenewalMonths(months)}
                        style={{
                          padding: '10px 12px',
                          borderRadius: '12px',
                          fontWeight: '800',
                          fontSize: '13px',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '2px',
                          border: renewalMonths === months ? '2px solid var(--primary)' : '1px solid #cbd5e1',
                          backgroundColor: renewalMonths === months ? '#ecfdf5' : 'white',
                          color: renewalMonths === months ? 'var(--primary)' : '#334155',
                          boxShadow: renewalMonths === months ? '0 4px 12px rgba(0,135,90,0.15)' : 'none',
                          transition: 'all 0.2s'
                        }}
                      >
                        <span>{months} Months</span>
                        <span style={{ fontSize: '11px', fontWeight: '700', color: renewalMonths === months ? '#00875a' : '#64748b' }}>
                          ₵{((Number(paymentTenant?.monthlyRent) || 0) * months).toLocaleString()}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* ARREARS DEBT RECOVERY NOTICE */}
                {getArrearsConsumedMonths(paymentTenant) > 0 && (
                  <div style={{ padding: '12px 16px', background: '#fff1f2', borderRadius: '16px', border: '1px solid #fecdd3', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: '#fee2e2', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                      <AlertTriangle size={16} />
                    </div>
                    <div>
                      <h4 style={{ margin: '0 0 2px', fontSize: '13px', fontWeight: '900', color: '#9f1239' }}>Arrears Debt Recovery Notice</h4>
                      <p style={{ margin: 0, fontSize: '12px', color: '#881337', lineHeight: '1.3' }}>
                        Tenant consumed <strong>{getArrearsConsumedMonths(paymentTenant)} Month{getArrearsConsumedMonths(paymentTenant) > 1 ? 's' : ''}</strong> in arrears since expiration ({paymentTenant.leaseEnd}). Out of this <strong>{renewalMonths}-Month</strong> payment, <strong>{getArrearsConsumedMonths(paymentTenant)} Month{getArrearsConsumedMonths(paymentTenant) > 1 ? 's' : ''}</strong> is deducted for past debt, granting <strong>{Math.max(0, renewalMonths - getArrearsConsumedMonths(paymentTenant))} Month{Math.max(0, renewalMonths - getArrearsConsumedMonths(paymentTenant)) > 1 ? 's' : ''}</strong> of remaining future occupancy.
                      </p>
                    </div>
                  </div>
                )}

                {/* ADDITIONAL LEVIES / CHARGES */}
                <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '16px', border: '1px solid #cbd5e1' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Coins size={16} style={{ color: '#d97706' }} />
                      <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-main)', margin: 0 }}>Additional Municipal Levies & Charges</label>
                    </div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '800', color: 'var(--primary)' }}>
                      <input 
                        type="checkbox" 
                        checked={includeServiceCharges} 
                        onChange={e => setIncludeServiceCharges(e.target.checked)} 
                        style={{ width: '16px', height: '16px', accentColor: '#00875a' }} 
                      />
                      Include Levies in Billing
                    </label>
                  </div>

                  {includeServiceCharges && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginTop: '12px' }}>
                      <div style={{ background: 'white', padding: '10px 12px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                        <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', display: 'block', marginBottom: '4px' }}>Sanitation (₵/mo)</span>
                        <input 
                          type="number" 
                          value={sanitationFee} 
                          onChange={e => setSanitationFee(Math.max(0, Number(e.target.value) || 0))}
                          style={{ width: '100%', padding: '6px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontWeight: '800', fontSize: '13px', color: '#1e293b', outline: 'none', boxSizing: 'border-box', background: '#f8fafc' }}
                        />
                        <span style={{ fontSize: '10px', color: '#00875a', fontWeight: '800', display: 'block', marginTop: '4px' }}>₵{(sanitationFee * renewalMonths).toLocaleString()} total</span>
                      </div>
                      <div style={{ background: 'white', padding: '10px 12px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                        <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', display: 'block', marginBottom: '4px' }}>Security (₵/mo)</span>
                        <input 
                          type="number" 
                          value={securityFee} 
                          onChange={e => setSecurityFee(Math.max(0, Number(e.target.value) || 0))}
                          style={{ width: '100%', padding: '6px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontWeight: '800', fontSize: '13px', color: '#1e293b', outline: 'none', boxSizing: 'border-box', background: '#f8fafc' }}
                        />
                        <span style={{ fontSize: '10px', color: '#00875a', fontWeight: '800', display: 'block', marginTop: '4px' }}>₵{(securityFee * renewalMonths).toLocaleString()} total</span>
                      </div>
                      <div style={{ background: 'white', padding: '10px 12px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                        <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', display: 'block', marginBottom: '4px' }}>Water/Maint. (₵/mo)</span>
                        <input 
                          type="number" 
                          value={waterFee} 
                          onChange={e => setWaterFee(Math.max(0, Number(e.target.value) || 0))}
                          style={{ width: '100%', padding: '6px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontWeight: '800', fontSize: '13px', color: '#1e293b', outline: 'none', boxSizing: 'border-box', background: '#f8fafc' }}
                        />
                        <span style={{ fontSize: '10px', color: '#00875a', fontWeight: '800', display: 'block', marginTop: '4px' }}>₵{(waterFee * renewalMonths).toLocaleString()} total</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* PAYMENT METHOD, REFERENCE & GRAND TOTAL (COMPACT 3-COL ROW) */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.2fr', gap: '14px', alignItems: 'flex-end' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '6px' }}>Payment Channel</label>
                    <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: '700', outline: 'none', background: '#f8fafc', boxSizing: 'border-box' }}>
                      <option value="Bank Wire Transfer">Bank Wire Transfer</option>
                      <option value="Standing Order ACH">Standing Order ACH</option>
                      <option value="MTN Mobile Money">MTN Mobile Money</option>
                      <option value="Telecel Cash">Telecel Cash</option>
                      <option value="Cash">Cash</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '6px' }}>Reference No.</label>
                    <input type="text" placeholder="e.g. TRN-882910" value={paymentRefNo} onChange={e => setPaymentRefNo(e.target.value)} style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: '700', outline: 'none', background: '#f8fafc', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '900', color: '#00875a', marginBottom: '6px' }}>Grand Total (₵)</label>
                    <input type="number" required value={paymentAmount} onChange={e => setPaymentAmount(e.target.value)} style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', border: '1px solid #00875a', fontSize: '16px', fontWeight: '900', color: '#00875a', outline: 'none', background: '#ecfdf5', boxSizing: 'border-box' }} />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
                  <button type="button" onClick={() => setShowLogPaymentModal(false)} style={{ padding: '12px 24px', borderRadius: '12px', border: '1px solid #cbd5e1', background: '#f8fafc', color: '#334155', fontWeight: '800', fontSize: '13px', cursor: 'pointer' }}>Cancel</button>
                  <button type="submit" style={{ background: 'var(--primary)', color: 'white', border: 'none', padding: '12px 32px', borderRadius: '12px', fontSize: '13px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 8px 20px -5px rgba(0, 135, 90, 0.4)' }}>
                    <Check size={16} /> Generate Valid Receipt
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================= */}
      {/* MODAL: OFFICIAL RENT RECEIPT PREVIEW / PRINT */}
      {/* ========================================================= */}
      <AnimatePresence>
        {printableReceipt && (
          <div className="print-modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1400, padding: '20px' }}>
            <motion.div 
              className="print-modal-content"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              style={{ background: '#ffffff', padding: '40px', borderRadius: '36px', width: '750px', maxWidth: '95vw', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 30px 60px -15px rgba(0,0,0,0.4)', display: 'flex', flexDirection: 'column', alignItems: 'center', border: '1px solid rgba(255,255,255,0.2)' }}
            >
              <div id="printable-receipt-container" style={{ width: '100%', background: 'white', borderRadius: '24px', padding: '36px', boxSizing: 'border-box', border: '1px solid #cbd5e1', position: 'relative' }}>
                {/* Header banner */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #00875a', paddingBottom: '24px', marginBottom: '28px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: '#ecfdf5', color: '#00875a', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #a7f3d0' }}>
                      <Building2 size={32} />
                    </div>
                    <div>
                      <h2 style={{ fontSize: '26px', fontWeight: '900', color: 'var(--text-main)', margin: '0 0 2px' }}>REALTY<span style={{ color: '#00875a' }}>OS</span></h2>
                      <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '700' }}>Official Tenancy Rent Renewal & Payment Receipt</span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '12px', background: '#ecfdf5', color: '#00875a', border: '1px solid #a7f3d0', padding: '6px 14px', borderRadius: '20px', fontWeight: '800', display: 'inline-block', marginBottom: '6px' }}>Verified Transaction</span>
                    <span style={{ display: 'block', fontSize: '13px', color: 'var(--text-muted)', fontWeight: '800' }}>No: {printableReceipt.receiptNo}</span>
                    <span style={{ display: 'block', fontSize: '12px', color: '#94a3b8', fontWeight: '600' }}>Date: {printableReceipt.date}</span>
                  </div>
                </div>

                {/* Amount Paid Big Callout */}
                <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', color: 'white', padding: '28px 32px', borderRadius: '20px', marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 10px 25px -5px rgba(15,23,42,0.3)' }}>
                  <div>
                    <span style={{ fontSize: '13px', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '4px' }}>Total Amount Received</span>
                    <span style={{ fontSize: '36px', fontWeight: '900', color: '#34d399', letterSpacing: '-0.5px' }}>GHS ₵{printableReceipt.amount.toLocaleString()}</span>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', padding: '12px 20px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <CheckCircle2 size={24} style={{ color: '#34d399' }} />
                    <span style={{ fontSize: '14px', fontWeight: '800', color: 'white' }}>Paid Up / Settled</span>
                  </div>
                </div>

                {/* Details Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', background: '#f8fafc', padding: '28px', borderRadius: '20px', border: '1px solid #e2e8f0', marginBottom: '28px' }}>
                  <div>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '800', textTransform: 'uppercase', display: 'block' }}>Received From (Tenant)</span>
                    <span style={{ fontSize: '16px', fontWeight: '900', color: 'var(--text-main)', marginTop: '2px', display: 'block' }}>{printableReceipt.tenantName}</span>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>ID: {printableReceipt.ghanaCardNo}</span>
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '800', textTransform: 'uppercase', display: 'block' }}>Property & Unit</span>
                    <span style={{ fontSize: '16px', fontWeight: '900', color: 'var(--text-main)', marginTop: '2px', display: 'block' }}>{printableReceipt.property}</span>
                    <span style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: '800' }}>Unit {printableReceipt.unit}</span>
                  </div>
                  <div style={{ borderTop: '1px solid #cbd5e1', paddingTop: '16px' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '800', textTransform: 'uppercase', display: 'block' }}>Renewal Duration & Extension</span>
                    <span style={{ fontSize: '14px', fontWeight: '800', color: '#334155', marginTop: '2px', display: 'block' }}>{printableReceipt.renewalMonths} Months (Lease Extended to {printableReceipt.newLeaseEndDateStr})</span>
                    {printableReceipt.consumedMonths > 0 && (
                      <div style={{ marginTop: '8px', padding: '8px 12px', background: '#fff1f2', borderRadius: '10px', border: '1px solid #fecdd3', fontSize: '12px', color: '#9f1239', fontWeight: '700', lineHeight: '1.3' }}>
                        ⚠️ <strong>Arrears Debt Recovery:</strong> Out of {printableReceipt.renewalMonths} Months paid, {printableReceipt.consumedMonths} Month{printableReceipt.consumedMonths > 1 ? 's' : ''} deducted for past overstay debt. Remaining Future Duration: {printableReceipt.remainingFutureMonths} Month{printableReceipt.remainingFutureMonths > 1 ? 's' : ''}.
                      </div>
                    )}
                  </div>
                  <div style={{ borderTop: '1px solid #cbd5e1', paddingTop: '16px' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '800', textTransform: 'uppercase', display: 'block' }}>Payment Channel & Ref</span>
                    <span style={{ fontSize: '14px', fontWeight: '800', color: '#334155', marginTop: '2px', display: 'block' }}>{printableReceipt.paymentMethod} • {printableReceipt.refNo}</span>
                  </div>
                </div>

                {/* Financial Itemized Breakdown Table */}
                <div style={{ border: '1px solid #cbd5e1', borderRadius: '20px', overflow: 'hidden', marginBottom: '32px' }}>
                  <div style={{ background: '#f1f5f9', padding: '14px 24px', display: 'flex', justifyContent: 'space-between', fontWeight: '800', fontSize: '12px', color: '#475569', borderBottom: '1px solid #cbd5e1' }}>
                    <span>ITEM DESCRIPTION</span>
                    <span>AMOUNT (GHS)</span>
                  </div>
                  <div style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', fontSize: '14px', fontWeight: '700', color: '#1e293b' }}>
                    <span>Base Rental ({printableReceipt.renewalMonths} Months @ ₵{((Number(printableReceipt.rentSubtotal) || 0) / (printableReceipt.renewalMonths || 1)).toLocaleString()}/mo)</span>
                    <span>₵{(Number(printableReceipt.rentSubtotal) || 0).toLocaleString()}</span>
                  </div>
                  {printableReceipt.includeServiceCharges && (
                    <div style={{ padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: '6px', borderBottom: '1px solid #e2e8f0', fontSize: '14px', fontWeight: '700', color: '#1e293b' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Municipal Levies & Estate Services Subtotal ({printableReceipt.renewalMonths} Months)</span>
                        <span>₵{(Number(printableReceipt.serviceSubtotal) || 0).toLocaleString()}</span>
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b', display: 'flex', gap: '16px' }}>
                        <span>• Sanitation: ₵{printableReceipt.sanitationFee}/mo</span>
                        <span>• Security: ₵{printableReceipt.securityFee}/mo</span>
                        <span>• Utility Maint: ₵{printableReceipt.waterFee}/mo</span>
                      </div>
                    </div>
                  )}
                  <div style={{ padding: '18px 24px', display: 'flex', justifyContent: 'space-between', background: '#ecfdf5', fontSize: '18px', fontWeight: '900', color: '#00875a' }}>
                    <span>GRAND TOTAL PAID</span>
                    <span>₵{(Number(printableReceipt.amount) || 0).toLocaleString()}</span>
                  </div>
                </div>

                {/* Signature footer */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px dashed #cbd5e1', paddingTop: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Shield size={20} style={{ color: '#00875a' }} />
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>Authorized & Biometrically Timestamped via RealtyOS System</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '14px', fontFamily: "'Dancing Script', cursive, sans-serif", fontWeight: 'bold', color: '#0f172a', display: 'block' }}>Louis K. Executive</span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '800', textTransform: 'uppercase' }}>Finance Director</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons (No Print) */}
              <div className="no-print" style={{ display: 'flex', gap: '16px', marginTop: '32px', width: '100%', justifyContent: 'center' }}>
                <button 
                  disabled={isGeneratingPdf}
                  onClick={handleExportReceiptPdf}
                  style={{ background: 'var(--primary)', color: 'white', border: 'none', padding: '16px 36px', borderRadius: '20px', fontSize: '16px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', boxShadow: '0 12px 25px -5px rgba(0, 135, 90, 0.4)', opacity: isGeneratingPdf ? 0.7 : 1 }}
                >
                  <Printer size={20} /> {isGeneratingPdf ? 'Generating Real PDF...' : 'Download Real PDF Receipt'}
                </button>
                <button 
                  onClick={() => setPrintableReceipt(null)}
                  style={{ background: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', padding: '16px 36px', borderRadius: '20px', fontSize: '16px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}
                >
                  <X size={20} /> Close Preview
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>



      {/* ========================================================= */}
      {/* MODAL: TENANT PAYMENT HISTORY AUDIT LOG */}
      {/* ========================================================= */}
      <AnimatePresence>
        {selectedHistoryTenant && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1300, padding: '20px' }}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              style={{ background: '#ffffff', padding: '36px', borderRadius: '32px', width: '850px', maxWidth: '95vw', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 30px 60px -15px rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.2)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid #e2e8f0', paddingBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '52px', height: '52px', borderRadius: '16px', background: '#ecfdf5', color: '#00875a', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #a7f3d0' }}>
                    <History size={28} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '22px', fontWeight: '900', color: 'var(--text-main)', margin: '0 0 2px' }}>{selectedHistoryTenant.name}</h3>
                    <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '700' }}>Unit {selectedHistoryTenant.unit} • {selectedHistoryTenant.property}</span>
                  </div>
                </div>
                <button 
                  onClick={() => { setSelectedHistoryTenant(null); setHistoryFilterQuery(''); }}
                  style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#f1f5f9', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', cursor: 'pointer', transition: '0.2s' }}
                >
                  <X size={20} />
                </button>
              </div>

              <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '20px', border: '1px solid #cbd5e1', marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', display: 'block' }}>Current Lease Status</span>
                  <span style={{ fontSize: '16px', fontWeight: '900', color: selectedHistoryTenant.rentStatus.includes('Paid') ? '#00875a' : '#dc2626' }}>{selectedHistoryTenant.rentStatus} • Exp: {selectedHistoryTenant.leaseEnd}</span>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', display: 'block' }}>Monthly Base Rent</span>
                  <span style={{ fontSize: '16px', fontWeight: '900', color: '#1e293b' }}>₵{(Number(selectedHistoryTenant.monthlyRent) || 0).toLocaleString()} / month</span>
                </div>
                <div style={{ background: 'white', padding: '8px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldCheck size={18} style={{ color: '#00875a' }} />
                  <span style={{ fontSize: '12px', fontWeight: '800', color: '#00875a' }}>Certified Audit Trail</span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '900', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FileText size={18} style={{ color: 'var(--primary)' }} /> Chronological Payment Records
                </h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f1f5f9', padding: '8px 14px', borderRadius: '14px', border: '1px solid #cbd5e1', width: '340px', maxWidth: '100%' }}>
                  <Search size={16} style={{ color: '#64748b', flexShrink: 0 }} />
                  <input 
                    type="text" 
                    placeholder="Filter by date (YYYY-MM), receipt #, ref..." 
                    value={historyFilterQuery}
                    onChange={e => setHistoryFilterQuery(e.target.value)}
                    style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '13px', width: '100%', color: '#1e293b', fontWeight: '600' }}
                  />
                  {historyFilterQuery && (
                    <button onClick={() => setHistoryFilterQuery('')} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}>
                      <X size={16} />
                    </button>
                  )}
                </div>
              </div>

              {(!selectedHistoryTenant.paymentHistory || selectedHistoryTenant.paymentHistory.length === 0) ? (
                <div style={{ background: '#f1f5f9', padding: '40px 20px', borderRadius: '20px', textAlign: 'center', border: '1px dashed #cbd5e1' }}>
                  <Clock size={40} style={{ color: '#94a3b8', margin: '0 auto 12px' }} />
                  <span style={{ fontSize: '15px', fontWeight: '800', color: '#475569', display: 'block', marginBottom: '4px' }}>No Historical Payments Logged Yet</span>
                  <span style={{ fontSize: '13px', color: '#64748b' }}>Payments logged for this resident will automatically appear in this immutable audit ledger.</span>
                </div>
              ) : (
                (() => {
                  const filteredList = selectedHistoryTenant.paymentHistory.filter(rec => {
                    if (!historyFilterQuery) return true;
                    const q = historyFilterQuery.toLowerCase();
                    return (rec.receiptNo && rec.receiptNo.toLowerCase().includes(q)) ||
                           (rec.date && rec.date.toLowerCase().includes(q)) ||
                           (rec.paymentMethod && rec.paymentMethod.toLowerCase().includes(q)) ||
                           (rec.refNo && rec.refNo.toLowerCase().includes(q));
                  });

                  if (filteredList.length === 0) {
                    return (
                      <div style={{ background: '#fff1f2', padding: '30px 20px', borderRadius: '20px', textAlign: 'center', border: '1px solid #fecdd3' }}>
                        <span style={{ fontSize: '15px', fontWeight: '800', color: '#be123c', display: 'block', marginBottom: '4px' }}>No Payments Match Your Search</span>
                        <span style={{ fontSize: '13px', color: '#881337' }}>Try adjusting your date or receipt number filter query.</span>
                      </div>
                    );
                  }

                  return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      {filteredList.map((rec, idx) => {
                        const originalIndex = selectedHistoryTenant.paymentHistory.indexOf(rec);
                        return (
                          <div key={originalIndex} style={{ background: 'white', border: '1px solid #cbd5e1', borderRadius: '20px', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', boxShadow: '0 4px 10px rgba(0,0,0,0.02)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                              <div style={{ width: '46px', height: '46px', borderRadius: '14px', background: '#ecfdf5', color: '#00875a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '14px' }}>
                                #{selectedHistoryTenant.paymentHistory.length - originalIndex}
                              </div>
                              <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <span style={{ fontSize: '15px', fontWeight: '900', color: '#1e293b' }}>{rec.receiptNo}</span>
                                  <span style={{ fontSize: '11px', background: '#e2e8f0', color: '#475569', padding: '2px 8px', borderRadius: '10px', fontWeight: '700' }}>{rec.duration}</span>
                                </div>
                                <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '600', display: 'block', marginTop: '2px' }}>
                                  Paid on: <strong>{rec.date}</strong> via {rec.paymentMethod} • Ref: {rec.refNo}
                                </span>
                              </div>
                            </div>

                            <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '20px' }}>
                              <div>
                                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '800', display: 'block', textTransform: 'uppercase' }}>Total Amount Paid</span>
                                <span style={{ fontSize: '20px', fontWeight: '900', color: '#00875a' }}>₵{(Number(rec.amount) || 0).toLocaleString()}</span>
                                {Number(rec.levies) > 0 && (
                                  <span style={{ fontSize: '11px', color: '#d97706', display: 'block', fontWeight: '700' }}>Includes ₵{rec.levies.toLocaleString()} Levies</span>
                                )}
                              </div>

                              <button
                                onClick={() => {
                                  setPrintableReceipt({
                                    receiptNo: rec.receiptNo,
                                    tenantName: selectedHistoryTenant.name,
                                    property: selectedHistoryTenant.property,
                                    unit: selectedHistoryTenant.unit,
                                    amount: rec.amount,
                                    paymentMethod: rec.paymentMethod,
                                    refNo: rec.refNo,
                                    date: rec.date,
                                    ghanaCardNo: selectedHistoryTenant.ghanaCardNo,
                                    renewalMonths: parseInt(rec.duration) || 1,
                                    newLeaseEndDateStr: rec.newLeaseEnd || selectedHistoryTenant.leaseEnd,
                                    rentSubtotal: rec.baseRent || rec.amount,
                                    serviceSubtotal: rec.levies || 0,
                                    includeServiceCharges: Number(rec.levies) > 0,
                                    sanitationFee: 150, securityFee: 200, waterFee: 100
                                  });
                                }}
                                style={{ background: '#f1f5f9', color: 'var(--primary)', border: '1px solid #cbd5e1', padding: '10px 16px', borderRadius: '14px', fontSize: '13px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', transition: '0.2s' }}
                                onMouseEnter={e => { e.currentTarget.style.background = '#ecfdf5'; e.currentTarget.style.borderColor = '#00875a'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.borderColor = '#cbd5e1'; }}
                              >
                                <Printer size={16} /> Re-print Receipt
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '28px', borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
                <button
                  onClick={() => { setSelectedHistoryTenant(null); setHistoryFilterQuery(''); }}
                  style={{ background: '#334155', color: 'white', border: 'none', padding: '14px 32px', borderRadius: '16px', fontSize: '14px', fontWeight: '800', cursor: 'pointer', transition: '0.2s' }}
                >
                  Close Audit Ledger
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Tenants;
