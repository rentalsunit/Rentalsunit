import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CreditCard, Wallet, DollarSign, TrendingUp, TrendingDown, Clock, 
  CheckCircle2, XCircle, Search, Filter, Plus, FileText, ArrowUpRight, 
  ArrowDownRight, UserCheck, Building, Landmark, Receipt, AlertCircle, 
  X, Download, ShieldCheck, RefreshCw, Send, Check, Briefcase, Calendar, Users, Folder,
  Zap, Wrench, ShieldAlert
} from 'lucide-react';
import { generateRealPDF } from '../lib/pdfService';
import { 
  getStoredFinancialVouchers, saveStoredFinancialVouchers,
  getStoredStaffLoans, saveStoredStaffLoans,
  getStoredStaffPayroll, saveStoredStaffPayroll
} from '../lib/masterData';

const Finance = () => {
  const [transactions, setTransactions] = useState(() => {
    return getStoredFinancialVouchers();
  });

  // Sync state when coming back from other modules or periodically
  useEffect(() => {
    const handleStorageChange = () => {
      setTransactions(getStoredFinancialVouchers());
    };
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('realtyos_finance_update', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('realtyos_finance_update', handleStorageChange);
    };
  }, []);

  const saveTransactions = (updated) => {
    setTransactions(updated);
    saveStoredFinancialVouchers(updated);
  };

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterSource, setFilterSource] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const handleExportPdf = async () => {
    setIsGeneratingPdf(true);
    await generateRealPDF('.voucher-print-area', `Audit_Voucher_${selectedVoucher?.id ? selectedVoucher.id : 'TRX'}.pdf`, { orientation: 'p', singlePage: true, scale: 2 });
    setIsGeneratingPdf(false);
  };

  // Form State
  const [newType, setNewType] = useState('Income');
  const [newSource, setNewSource] = useState('Rent');
  const [paymentMethod, setPaymentMethod] = useState('Bank Transfer');

  const handleApprove = (id) => {
    const trx = transactions.find(t => t.id === id);
    if (!trx) return;

    const updated = transactions.map(t => t.id === id ? { ...t, status: 'Approved' } : t);
    saveTransactions(updated);

    // Cross-module synchronization for HR Workflows
    if (trx.refNo?.startsWith('LN-')) {
      const loans = getStoredStaffLoans();
      const updatedLoans = loans.map(l => l.id === trx.refNo ? { ...l, status: 'Active Amortization' } : l);
      saveStoredStaffLoans(updatedLoans);
      window.dispatchEvent(new Event('realtyos_staff_update'));
    } else if (trx.refNo?.startsWith('PAY-')) {
      const payrolls = getStoredStaffPayroll();
      const updatedPayrolls = payrolls.map(p => p.id === trx.refNo ? { ...p, status: 'Approved & Disbursed' } : p);
      saveStoredStaffPayroll(updatedPayrolls);
      window.dispatchEvent(new Event('realtyos_staff_update'));
    }

    setSuccessMsg(`Voucher ${id} successfully approved and posted to General Ledger.`);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleReject = (id) => {
    const trx = transactions.find(t => t.id === id);
    if (!trx) return;

    const updated = transactions.map(t => t.id === id ? { ...t, status: 'Rejected' } : t);
    saveTransactions(updated);

    // Cross-module synchronization for HR Workflows
    if (trx.refNo?.startsWith('LN-')) {
      const loans = getStoredStaffLoans();
      const updatedLoans = loans.map(l => l.id === trx.refNo ? { ...l, status: 'Rejected by Finance' } : l);
      saveStoredStaffLoans(updatedLoans);
      window.dispatchEvent(new Event('realtyos_staff_update'));
    } else if (trx.refNo?.startsWith('PAY-')) {
      const payrolls = getStoredStaffPayroll();
      const updatedPayrolls = payrolls.map(p => p.id === trx.refNo ? { ...p, status: 'Rejected / Re-audit' } : p);
      saveStoredStaffPayroll(updatedPayrolls);
      window.dispatchEvent(new Event('realtyos_staff_update'));
    }

    setSuccessMsg(`Voucher ${id} has been rejected and flagged.`);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleSourceChange = (src) => {
    setNewSource(src);
    if (src === 'Rent' || src === 'Sales') {
      setNewType('Income');
    } else if (src === 'Utilities' || src === 'Maintenance' || src === 'Payroll' || src === 'Corporate') {
      setNewType('Expense');
    }
  };

  const handleAddTransaction = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const numAmount = parseFloat(formData.get('amount')) || 0;
    const formattedAmount = `₵ ${numAmount.toLocaleString()}`;

    let generatedCategory = '';
    let generatedPayerRecipient = '';
    let generatedNotes = formData.get('notes') || '';

    // Dynamically compile category, recipient, and notes based on source
    if (newSource === 'Rent') {
      const unit = formData.get('unitNo') || 'General Unit';
      const period = formData.get('leasePeriod') || 'Monthly';
      const tenant = formData.get('tenantName') || 'Valued Tenant';
      generatedCategory = `Rent - Unit #${unit} (${period})`;
      generatedPayerRecipient = `Tenant: ${tenant}`;
      generatedNotes = `Unit: #${unit} | Coverage: ${period} | ${generatedNotes}`;
    } 
    else if (newSource === 'Sales') {
      const asset = formData.get('salesAsset') || 'Property Unit';
      const milestone = formData.get('milestone') || 'Deposit';
      const buyer = formData.get('buyerName') || 'Client Payer';
      generatedCategory = `${asset} Acquisition (${milestone})`;
      generatedPayerRecipient = `Buyer: ${buyer}`;
      generatedNotes = `Asset: ${asset} | Stage: ${milestone} | ${generatedNotes}`;
    }
    else if (newSource === 'Utilities') {
      const provider = formData.get('utilityProvider') || 'ECG Electricity';
      const meterNo = formData.get('meterNo') || 'MTR-0000';
      const cycle = formData.get('billingCycle') || 'Current Month';
      generatedCategory = `Utility Bill - ${provider} (${cycle})`;
      generatedPayerRecipient = `Provider: ${provider}`;
      generatedNotes = `Meter/Account: #${meterNo} | Billing Cycle: ${cycle} | ${generatedNotes}`;
    }
    else if (newSource === 'Maintenance') {
      const svcType = formData.get('maintType') || 'Facility Repair';
      const vendor = formData.get('vendorName') || 'Certified Vendor';
      const refCode = formData.get('serviceRef') || 'SRV-000';
      generatedCategory = `Maintenance - ${svcType}`;
      generatedPayerRecipient = `Vendor: ${vendor}`;
      generatedNotes = `Job Code: ${refCode} | ${generatedNotes}`;
    }
    else if (newSource === 'Payroll') {
      const prType = formData.get('payrollType') || 'Monthly Staff Salary';
      const dept = formData.get('department') || 'All Staff';
      const prPeriod = formData.get('payPeriod') || 'Current Month';
      generatedCategory = `Payroll & Benefits - ${prType}`;
      generatedPayerRecipient = `Beneficiaries: ${dept}`;
      generatedNotes = `Payroll Period: ${prPeriod} | ${generatedNotes}`;
    }
    else if (newSource === 'Corporate') {
      const corpType = formData.get('corpType') || 'Legal / Professional Fees';
      const entity = formData.get('corpEntity') || 'Corporate Partner';
      generatedCategory = `Corporate OpEx - ${corpType}`;
      generatedPayerRecipient = `Vendor/Partner: ${entity}`;
    }

    const newTrx = {
      id: `TRX-${5000 + transactions.length + 1}`,
      type: newType,
      source: newSource,
      property: (newSource === 'Utilities' || newSource === 'Payroll' || newSource === 'Corporate') ? 'Corporate HQ & General' : (formData.get('property') || 'Main Portfolio HQ'),
      category: generatedCategory,
      amount: numAmount,
      formattedAmount: formattedAmount,
      date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      status: 'Approved', // Default to Approved instantly as requested
      officer: formData.get('officer') || 'Louis Kemenyo',
      payerRecipient: generatedPayerRecipient,
      paymentMethod: paymentMethod,
      refNo: formData.get('refNo') || `REF-${Math.floor(Math.random()*900000 + 100000)}`,
      notes: generatedNotes || 'Reconciled voucher entry.'
    };

    const updated = [newTrx, ...transactions];
    saveTransactions(updated);
    setShowAddModal(false);
    setSuccessMsg(`Successfully recorded ${newType} entry (${formattedAmount}) into financial ledger!`);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const openVoucher = (trx) => {
    setSelectedVoucher(trx);
    setShowVoucherModal(true);
  };

  // Search, Status, and Source filtering
  const filteredData = useMemo(() => {
    return transactions.filter(t => {
      const matchesSearch = t.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            t.property.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            t.officer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            t.payerRecipient.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            t.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || t.status.toLowerCase() === filterStatus.toLowerCase();
      const matchesSource = filterSource === 'all' || t.source.toLowerCase() === filterSource.toLowerCase();
      return matchesSearch && matchesStatus && matchesSource;
    });
  }, [transactions, searchTerm, filterStatus, filterSource]);

  // Financial Metrics Calculations
  const metrics = useMemo(() => {
    const totalIncome = transactions.filter(t => t.type === 'Income' && t.status === 'Approved').reduce((acc, t) => acc + t.amount, 0);
    const totalExpense = transactions.filter(t => t.type === 'Expense' && t.status === 'Approved').reduce((acc, t) => acc + t.amount, 0);
    const netCashFlow = totalIncome - totalExpense;
    
    const rentRevenue = transactions.filter(t => t.source === 'Rent' && t.status === 'Approved').reduce((acc, t) => acc + t.amount, 0);
    const salesRevenue = transactions.filter(t => t.source === 'Sales' && t.status === 'Approved').reduce((acc, t) => acc + t.amount, 0);
    const pendingCount = transactions.filter(t => t.status === 'Pending').length;

    return { totalIncome, totalExpense, netCashFlow, rentRevenue, salesRevenue, pendingCount };
  }, [transactions]);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  };

  return (
    <motion.div 
      variants={containerVariants} 
      initial="hidden" 
      animate="show" 
      style={{ display: 'flex', flexDirection: 'column', gap: '32px', width: '100%' }}
    >
      {/* Toast Banner */}
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

      {/* Top Header & Title */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px', width: '100%' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{ padding: '6px 12px', borderRadius: '20px', backgroundColor: 'var(--primary-glow)', color: 'var(--primary)', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Landmark size={12} /> Unified Accounting Vault
            </span>
          </div>
          <h2 style={{ fontSize: '28px', fontWeight: '800', letterSpacing: '-0.5px', color: 'var(--text-main)' }}>Master Financial Ledger</h2>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: '500', marginTop: '2px' }}>
            Central repository recording all income, operations expenditure, rent receipts, and payroll reconciliations.
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              const csvContent = "data:text/csv;charset=utf-8," + 
                ["Voucher ID,Type,Source,Category,Amount,Date,Status,Officer"].join(",") + "\n" +
                filteredData.map(t => `${t.id},${t.type},${t.source},"${t.category}",${t.amount},${t.date},${t.status},"${t.officer}"`).join("\n");
              const encodedUri = encodeURI(csvContent);
              const link = document.createElement("a");
              link.setAttribute("href", encodedUri);
              link.setAttribute("download", `RealtyOS_Master_Ledger_export.csv`);
              document.body.appendChild(link);
              link.click();
              link.remove();
              setSuccessMsg('Ledger successfully exported as CSV!');
              setTimeout(() => setSuccessMsg(''), 3000);
            }}
            style={{ 
              backgroundColor: 'white', color: 'var(--text-main)', border: '1px solid var(--border-dark)', 
              padding: '12px 20px', borderRadius: '12px', display: 'flex', 
              alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '700', 
              cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.03)' 
            }}
          >
            <Download size={18} /> Export Statement
          </motion.button>

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
            <Plus size={20} /> Record New Voucher
          </motion.button>
        </div>
      </header>

      {/* Financial Metrics Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', width: '100%' }}>
        <div className="glass-card-premium" style={{ padding: '24px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: '#ecfdf5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Wallet size={28} />
          </div>
          <div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Net Portfolio Cash Flow</p>
            <h3 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-main)', marginTop: '4px' }}>
              ₵ {(metrics.netCashFlow / 1000).toLocaleString()}k
            </h3>
            <span style={{ fontSize: '12px', color: '#10b981', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <TrendingUp size={14} /> Reconciled surplus
            </span>
          </div>
        </div>

        <div className="glass-card-premium" style={{ padding: '24px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: '#fffbeb', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Clock size={28} />
          </div>
          <div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Pending Approvals</p>
            <h3 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-main)', marginTop: '4px' }}>
              {metrics.pendingCount} Vouchers
            </h3>
            <span style={{ fontSize: '12px', color: '#d97706', fontWeight: '700' }}>Requires executive sign-off</span>
          </div>
        </div>

        <div className="glass-card-premium" style={{ padding: '24px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: '#fef2f2', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CreditCard size={28} />
          </div>
          <div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Realized Outflow</p>
            <h3 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-main)', marginTop: '4px' }}>
              ₵ {(metrics.totalExpense / 1000).toLocaleString()}k
            </h3>
            <span style={{ fontSize: '12px', color: '#ef4444', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <TrendingDown size={14} /> Operations & payroll
            </span>
          </div>
        </div>

        <div className="glass-card-premium" style={{ padding: '24px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: '#e0e7ff', color: '#4338ca', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Building size={28} />
          </div>
          <div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Rent & Sales Receipts</p>
            <h3 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-main)', marginTop: '4px' }}>
              ₵ {((metrics.rentRevenue + metrics.salesRevenue) / 1000).toLocaleString()}k
            </h3>
            <span style={{ fontSize: '12px', color: '#4338ca', fontWeight: '700' }}>Combined gross collections</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', background: 'white', padding: '16px 24px', borderRadius: '20px', border: '1px solid var(--border-dark)', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.03)', width: '100%' }}>
        <div style={{ position: 'relative', width: '100%', maxWidth: '380px' }}>
          <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Search by voucher ID, property, recipient, or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ 
              width: '100%', padding: '14px 16px 14px 48px', borderRadius: '14px', 
              border: '1px solid var(--border-dark)', fontSize: '13px', 
              background: '#f8fafc', fontWeight: '500', outline: 'none', color: 'var(--text-main)'
            }} 
          />
        </div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Source Filter Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Folder size={16} /> Source:
            </span>
            <select
              value={filterSource}
              onChange={(e) => setFilterSource(e.target.value)}
              style={{ padding: '10px 16px', borderRadius: '12px', border: '1px solid var(--border-dark)', fontSize: '13px', fontWeight: '700', background: '#f8fafc', color: 'var(--text-main)', cursor: 'pointer' }}
            >
              <option value="all">All Sources</option>
              <option value="rent">Rent Collection</option>
              <option value="sales">Sales Revenue</option>
              <option value="maintenance">Maintenance</option>
              <option value="payroll">Payroll</option>
              <option value="utilities">Utilities</option>
            </select>
          </div>

          {/* Status Filter Pillbox */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Filter size={16} /> Status:
            </span>
            <div style={{ display: 'flex', background: '#f1f5f9', padding: '4px', borderRadius: '12px', border: '1px solid var(--border-dark)' }}>
              {['All', 'Approved', 'Pending', 'Rejected'].map(st => (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st.toLowerCase())}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '8px',
                    border: 'none',
                    fontSize: '12px',
                    fontWeight: filterStatus === st.toLowerCase() ? '800' : '600',
                    backgroundColor: filterStatus === st.toLowerCase() ? 'white' : 'transparent',
                    color: filterStatus === st.toLowerCase() ? 'var(--primary)' : 'var(--text-muted)',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: filterStatus === st.toLowerCase() ? '0 2px 8px rgba(0,0,0,0.06)' : 'none'
                  }}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Ledger Data Table */}
      <div className="glass-card-premium" style={{ padding: '0', overflowX: 'auto', borderRadius: '24px', width: '100%', border: '1px solid var(--border-dark)', boxShadow: '0 25px 50px -20px rgba(0,0,0,0.05)' }}>
        <table style={{ width: '100%', minWidth: '950px', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border-dark)' }}>
              <th style={{ padding: '18px 24px', fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Voucher Ref & Date</th>
              <th style={{ padding: '18px 24px', fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Source / Property</th>
              <th style={{ padding: '18px 24px', fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Category & Recipient</th>
              <th style={{ padding: '18px 24px', fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Amount (â‚µ)</th>
              <th style={{ padding: '18px 24px', fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Status</th>
              <th style={{ padding: '18px 24px', fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', textAlign: 'right' }}>Audit / Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((trx, idx) => (
              <motion.tr 
                key={trx.id} 
                variants={itemVariants}
                style={{ borderBottom: '1px solid var(--border-dark)', transition: 'background 0.2s', background: idx % 2 === 0 ? 'white' : '#fcfdfd' }}
              >
                <td style={{ padding: '18px 24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: trx.type === 'Income' ? '#ecfdf5' : '#fef2f2', color: trx.type === 'Income' ? '#10b981' : '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '14px', flexShrink: 0 }}>
                      {trx.type === 'Income' ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
                    </div>
                    <div>
                      <span style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-main)', display: 'block', cursor: 'pointer' }} onClick={() => openVoucher(trx)}>{trx.id}</span>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>{trx.date}</span>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '18px 24px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-main)' }}>{trx.property}</span>
                    <span style={{ fontSize: '11px', padding: '2px 8px', background: '#f1f5f9', borderRadius: '6px', width: 'fit-content', marginTop: '4px', fontWeight: '800', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{trx.source}</span>
                  </div>
                </td>
                <td style={{ padding: '18px 24px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-main)' }}>{trx.category}</span>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                      <Users size={12} /> {trx.payerRecipient}
                    </span>
                  </div>
                </td>
                <td style={{ padding: '18px 24px', fontSize: '16px', fontWeight: '800', color: trx.type === 'Income' ? '#10b981' : '#ef4444' }}>
                  {trx.type === 'Income' ? '+' : '-'}{trx.formattedAmount}
                </td>
                <td style={{ padding: '18px 24px' }}>
                  <span style={{ 
                    padding: '6px 12px', 
                    borderRadius: '20px', 
                    fontSize: '12px', 
                    fontWeight: '800',
                    backgroundColor: trx.status === 'Approved' ? '#ecfdf5' : trx.status === 'Pending' ? '#fffbeb' : '#fef2f2',
                    color: trx.status === 'Approved' ? '#10b981' : trx.status === 'Pending' ? '#d97706' : '#ef4444',
                    border: trx.status === 'Approved' ? '1px solid #10b98130' : trx.status === 'Pending' ? '1px solid #d9770630' : '1px solid #ef444430',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    {trx.status === 'Approved' ? <CheckCircle2 size={14}/> : trx.status === 'Pending' ? <Clock size={14}/> : <XCircle size={14}/>}
                    {trx.status}
                  </span>
                </td>
                <td style={{ padding: '18px 24px', textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', alignItems: 'center' }}>
                    {trx.status === 'Pending' ? (
                      <>
                        <button
                          onClick={() => handleApprove(trx.id)}
                          title="Approve Voucher"
                          style={{ padding: '8px 12px', borderRadius: '10px', border: 'none', background: '#10b981', color: 'white', cursor: 'pointer', fontSize: '12px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '4px', boxShadow: '0 4px 10px rgba(16, 185, 129, 0.2)' }}
                        >
                          <Check size={14} /> Approve
                        </button>
                        <button
                          onClick={() => handleReject(trx.id)}
                          title="Reject Voucher"
                          style={{ padding: '8px 12px', borderRadius: '10px', border: '1px solid #fca5a5', background: '#fef2f2', color: '#ef4444', cursor: 'pointer', fontSize: '12px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                          <X size={14} /> Reject
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => openVoucher(trx)}
                        style={{ padding: '8px 14px', borderRadius: '10px', border: '1px solid var(--border-dark)', background: '#f8fafc', color: '#334155', cursor: 'pointer', fontSize: '12px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}
                      >
                        <Receipt size={14} /> Voucher Details
                      </button>
                    )}
                  </div>
                </td>
              </motion.tr>
            ))}

            {filteredData.length === 0 && (
              <tr>
                <td colSpan="6" style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)', fontWeight: '600', fontSize: '14px' }}>
                  No transaction vouchers match the selected filter criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Record New Entry / Voucher Modal - Fully Adaptable Form */}
      <AnimatePresence>
        {showAddModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              style={{ background: 'white', padding: '40px', borderRadius: '28px', width: '640px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ padding: '4px 10px', borderRadius: '20px', backgroundColor: 'var(--primary-glow)', color: 'var(--primary)', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase' }}>
                      Adaptive Form
                    </span>
                  </div>
                  <h3 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-main)' }}>Record Financial Voucher</h3>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '500', marginTop: '2px' }}>Form entries dynamically adapt based on selected accounting source</p>
                </div>
                <button onClick={() => setShowAddModal(false)} style={{ background: '#f1f5f9', border: 'none', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', cursor: 'pointer' }}>
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleAddTransaction} style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', background: '#f8fafc', padding: '16px', borderRadius: '16px', border: '1px solid var(--border-dark)' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Accounting Source</label>
                    <select 
                      value={newSource} 
                      onChange={(e) => handleSourceChange(e.target.value)}
                      style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '14px', fontWeight: '800', background: 'white', color: 'var(--primary)' }}
                    >
                      <option value="Rent">Rent Collection (Income)</option>
                      <option value="Sales">Sales Revenue (Income)</option>
                      <option value="Utilities">Utilities & Municipal (Expense)</option>
                      <option value="Maintenance">Maintenance & Repairs (Expense)</option>
                      <option value="Payroll">Staff Payroll & Commissions (Expense)</option>
                      <option value="Corporate">Corporate Operations (Expense)</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Voucher Type</label>
                    <select 
                      value={newType} 
                      onChange={(e) => setNewType(e.target.value)}
                      style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '14px', fontWeight: '800', background: 'white', color: newType === 'Income' ? '#10b981' : '#ef4444' }}
                    >
                      <option value="Income">Income (Deposit / Receipt)</option>
                      <option value="Expense">Expense (Payment / Outflow)</option>
                    </select>
                  </div>
                </div>

                {/* ========================================== */}
                {/* DYNAMIC FORM SEGMENT 1: RENT COLLECTION */}
                {/* ========================================== */}
                {newSource === 'Rent' && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ padding: '20px', borderRadius: '20px', background: 'var(--primary-glow)', border: '1px dashed var(--primary)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', fontWeight: '800', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      <Building size={16} /> Rental Asset Details
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-main)', marginBottom: '6px', display: 'block' }}>Property / Building</label>
                      <select name="property" style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-dark)', fontSize: '14px', background: 'white', fontWeight: '600' }}>
                        <option value="Sunset Luxury Apartments">Sunset Luxury Apartments</option>
                        <option value="The Apex Commercial Tower">The Apex Commercial Tower</option>
                        <option value="Green Valley Estate">Green Valley Estate</option>
                      </select>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                      <div>
                        <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-main)', marginBottom: '6px', display: 'block' }}>Unit / Room Number</label>
                        <input name="unitNo" type="text" placeholder="e.g. Unit 302 or Penthouse B" required style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-dark)', fontSize: '14px', background: 'white' }} />
                      </div>
                      <div>
                        <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-main)', marginBottom: '6px', display: 'block' }}>Lease Coverage Period</label>
                        <input name="leasePeriod" type="text" placeholder="e.g. Q3 Rent or 6 Months Advance" required style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-dark)', fontSize: '14px', background: 'white' }} />
                      </div>
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-main)', marginBottom: '6px', display: 'block' }}>Tenant / Payer Name</label>
                      <input name="tenantName" type="text" placeholder="e.g. Kwame Mensah or Melcom Superstores" required style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-dark)', fontSize: '14px', background: 'white' }} />
                    </div>
                  </motion.div>
                )}

                {/* ========================================== */}
                {/* DYNAMIC FORM SEGMENT 2: SALES REVENUE */}
                {/* ========================================== */}
                {newSource === 'Sales' && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ padding: '20px', borderRadius: '20px', background: 'rgba(59, 130, 246, 0.08)', border: '1px dashed #3b82f6', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#2563eb', fontWeight: '800', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      <Landmark size={16} /> Sales Milestone & Asset Specification
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-main)', marginBottom: '6px', display: 'block' }}>Development Project / Asset</label>
                      <select name="property" style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-dark)', fontSize: '14px', background: 'white', fontWeight: '600' }}>
                        <option value="Green Valley Estate">Green Valley Estate</option>
                        <option value="Palm Breeze Beach Residences">Palm Breeze Beach Residences</option>
                        <option value="Sunset Hills Luxury Villas">Sunset Hills Luxury Villas</option>
                      </select>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                      <div>
                        <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-main)', marginBottom: '6px', display: 'block' }}>Plot / Villa Reference</label>
                        <input name="salesAsset" type="text" placeholder="e.g. Plot 12 or Luxury Villa 4" required style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-dark)', fontSize: '14px', background: 'white' }} />
                      </div>
                      <div>
                        <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-main)', marginBottom: '6px', display: 'block' }}>Payment Milestone</label>
                        <select name="milestone" style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-dark)', fontSize: '14px', background: 'white', fontWeight: '600' }}>
                          <option value="Initial Deposit">Initial 30% Deposit</option>
                          <option value="Installment Payment">Milestone Installment</option>
                          <option value="Full Settlement">Full Final Settlement</option>
                          <option value="Escrow Release">Escrow Title Transfer Release</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-main)', marginBottom: '6px', display: 'block' }}>Buyer / Acquirer Name</label>
                      <input name="buyerName" type="text" placeholder="e.g. Dr. Evelyn Addo" required style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-dark)', fontSize: '14px', background: 'white' }} />
                    </div>
                  </motion.div>
                )}

                {/* ========================================== */}
                {/* DYNAMIC FORM SEGMENT 3: UTILITIES & MUNICIPAL */}
                {/* ========================================== */}
                {newSource === 'Utilities' && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ padding: '20px', borderRadius: '20px', background: 'rgba(239, 68, 68, 0.08)', border: '1px dashed #ef4444', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#dc2626', fontWeight: '800', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      <Zap size={16} /> Utility Provider & Meter Specifications
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                      <div>
                        <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-main)', marginBottom: '6px', display: 'block' }}>Utility Service Provider</label>
                        <select name="utilityProvider" style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-dark)', fontSize: '14px', background: 'white', fontWeight: '600' }}>
                          <option value="ECG Electricity">ECG Electricity (Prepaid/Postpaid)</option>
                          <option value="Ghana Water Co.">Ghana Water Company (GWCL)</option>
                          <option value="Internet Fiber Internet">Fiber Internet Service</option>
                          <option value="Municipal Waste Service">Municipal Waste Sanitation</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-main)', marginBottom: '6px', display: 'block' }}>Meter / Account Number</label>
                        <input name="meterNo" type="text" placeholder="e.g. ECG-MTR-4029" required style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-dark)', fontSize: '14px', background: 'white' }} />
                      </div>
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-main)', marginBottom: '6px', display: 'block' }}>Billing Cycle / Coverage</label>
                      <input name="billingCycle" type="text" placeholder="e.g. May 2026 Billing Cycle" required style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-dark)', fontSize: '14px', background: 'white' }} />
                    </div>
                  </motion.div>
                )}

                {/* ========================================== */}
                {/* DYNAMIC FORM SEGMENT 4: MAINTENANCE */}
                {/* ========================================== */}
                {newSource === 'Maintenance' && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ padding: '20px', borderRadius: '20px', background: 'rgba(245, 158, 11, 0.08)', border: '1px dashed #f59e0b', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#d97706', fontWeight: '800', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      <Wrench size={16} /> Maintenance Order & Contractor Payout
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-main)', marginBottom: '6px', display: 'block' }}>Target Facility</label>
                      <select name="property" style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-dark)', fontSize: '14px', background: 'white', fontWeight: '600' }}>
                        <option value="The Apex Commercial Tower">The Apex Commercial Tower</option>
                        <option value="Sunset Luxury Apartments">Sunset Luxury Apartments</option>
                        <option value="Green Valley Estate">Green Valley Estate</option>
                      </select>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                      <div>
                        <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-main)', marginBottom: '6px', display: 'block' }}>Maintenance Type</label>
                        <input name="maintType" type="text" placeholder="e.g. HVAC Servicing or Generator Fuel" required style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-dark)', fontSize: '14px', background: 'white' }} />
                      </div>
                      <div>
                        <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-main)', marginBottom: '6px', display: 'block' }}>Service Job Code / Ref</label>
                        <input name="serviceRef" type="text" placeholder="e.g. SRV-8829" style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-dark)', fontSize: '14px', background: 'white' }} />
                      </div>
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-main)', marginBottom: '6px', display: 'block' }}>Vendor / Contractor Entity</label>
                      <input name="vendorName" type="text" placeholder="e.g. CoolTech Engineers Ltd" required style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-dark)', fontSize: '14px', background: 'white' }} />
                    </div>
                  </motion.div>
                )}

                {/* ========================================== */}
                {/* DYNAMIC FORM SEGMENT 5: PAYROLL */}
                {/* ========================================== */}
                {newSource === 'Payroll' && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ padding: '20px', borderRadius: '20px', background: 'rgba(99, 102, 241, 0.08)', border: '1px dashed #6366f1', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#4f46e5', fontWeight: '800', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      <UserCheck size={16} /> Staff Payroll & Commission Disbursal
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                      <div>
                        <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-main)', marginBottom: '6px', display: 'block' }}>Payroll Payout Category</label>
                        <select name="payrollType" style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-dark)', fontSize: '14px', background: 'white', fontWeight: '600' }}>
                          <option value="Staff Monthly Salary">Monthly Executive & Admin Salary</option>
                          <option value="Sales Agent Commission">Sales Agent Commission Bonus</option>
                          <option value="Contractor Wages">Contractor Temporary Wages</option>
                          <option value="Annual Bonus Disbursal">Annual Staff Performance Bonus</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-main)', marginBottom: '6px', display: 'block' }}>Payroll Period</label>
                        <input name="payPeriod" type="text" placeholder="e.g. May 2026 Period" required style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-dark)', fontSize: '14px', background: 'white' }} />
                      </div>
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-main)', marginBottom: '6px', display: 'block' }}>Department / Beneficiaries</label>
                      <input name="department" type="text" placeholder="e.g. All Active Staff (18 Empl.) or Sales Division" required style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-dark)', fontSize: '14px', background: 'white' }} />
                    </div>
                  </motion.div>
                )}

                {/* ========================================== */}
                {/* DYNAMIC FORM SEGMENT 6: CORPORATE */}
                {/* ========================================== */}
                {newSource === 'Corporate' && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ padding: '20px', borderRadius: '20px', background: 'rgba(100, 116, 139, 0.08)', border: '1px dashed #64748b', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#475569', fontWeight: '800', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      <Briefcase size={16} /> Corporate Operations OpEx
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                      <div>
                        <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-main)', marginBottom: '6px', display: 'block' }}>Corporate Expense Type</label>
                        <input name="corpType" type="text" placeholder="e.g. Legal & Audit Fees or Software" required style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-dark)', fontSize: '14px', background: 'white' }} />
                      </div>
                      <div>
                        <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-main)', marginBottom: '6px', display: 'block' }}>Partner / Vendor Entity</label>
                        <input name="corpEntity" type="text" placeholder="e.g. KPMG or Microsoft Licensing" required style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-dark)', fontSize: '14px', background: 'white' }} />
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* ========================================== */}
                {/* GENERAL RECONCILIATION DATA */}
                {/* ========================================== */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '4px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Voucher Amount (â‚µ)</label>
                    <input name="amount" type="number" placeholder="12500" required style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-dark)', fontSize: '16px', fontWeight: '800', background: '#f8fafc', color: 'var(--primary)' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Payment Method</label>
                    <select 
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-dark)', fontSize: '14px', fontWeight: '700', background: '#f8fafc', cursor: 'pointer', color: 'var(--text-main)' }}
                    >
                      <option value="Cash">Cash Settlement</option>
                      <option value="Mobile Money (MoMo)">Mobile Money (MoMo)</option>
                      <option value="Bank Transfer">Bank Wire / Transfer</option>
                      <option value="Cheque">Bank Cheque</option>
                      <option value="Escrow Disbursement">Escrow Release</option>
                      <option value="Online Portal / Card">Online Portal / Card</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Bank / Txn Ref Number</label>
                  <input name="refNo" type="text" placeholder="e.g. ECO-1029384 or MOM-991823" style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-dark)', fontSize: '14px', fontWeight: '500', background: '#f8fafc' }} />
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Additional Audit Notes (Optional)</label>
                  <textarea name="notes" rows="3" placeholder="Enter special payment agreements, contract terms, or audit trail notes..." style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-dark)', fontSize: '14px', fontWeight: '500', background: '#f8fafc' }}></textarea>
                </div>

                <button type="submit" style={{ backgroundColor: 'var(--primary)', color: 'white', border: 'none', padding: '16px', borderRadius: '14px', fontSize: '15px', fontWeight: '800', marginTop: '12px', cursor: 'pointer', boxShadow: '0 10px 20px -5px rgba(0, 135, 90, 0.4)', transition: 'all 0.2s' }}>
                  Commit & Post Voucher to Master Ledger
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Audit Voucher Details Modal */}
      <AnimatePresence>
        {selectedVoucher && showVoucherModal && (
          <div className="print-modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <motion.div 
              className="print-modal-content voucher-print-area"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              style={{ background: 'white', padding: '28px 32px', borderRadius: '24px', width: '600px', maxHeight: '92vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', boxSizing: 'border-box' }}
            >
              {/* Header Row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', borderBottom: '2px solid var(--border-dark)', paddingBottom: '14px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ padding: '3px 10px', borderRadius: '20px', backgroundColor: selectedVoucher.type === 'Income' ? '#ecfdf5' : '#fef2f2', color: selectedVoucher.type === 'Income' ? '#10b981' : '#ef4444', fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Receipt size={11} /> Official Accounting Voucher
                    </span>
                    <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)' }}>#{selectedVoucher.id}</span>
                  </div>
                  <h3 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-main)', margin: '0 0 2px' }}>{selectedVoucher.category}</h3>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600', margin: 0 }}>{selectedVoucher.property} · Posted by {selectedVoucher.officer}</p>
                </div>
                <button className="no-print" onClick={() => setShowVoucherModal(false)} style={{ background: '#f1f5f9', border: 'none', width: '34px', height: '34px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', cursor: 'pointer', flexShrink: 0 }}>
                  <X size={18} />
                </button>
              </div>

              {/* Amount Banner */}
              <div style={{ padding: '16px 20px', background: selectedVoucher.type === 'Income' ? '#f0fdf4' : '#fef2f2', border: selectedVoucher.type === 'Income' ? '1px solid #10b98130' : '1px solid #ef444430', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <span style={{ fontSize: '10px', fontWeight: '800', color: selectedVoucher.type === 'Income' ? '#10b981' : '#ef4444', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '2px' }}>Total Reconciled {selectedVoucher.type}</span>
                  <h2 style={{ fontSize: '30px', fontWeight: '900', color: selectedVoucher.type === 'Income' ? '#10b981' : '#ef4444', margin: 0 }}>
                    {selectedVoucher.type === 'Income' ? '+' : '-'}{selectedVoucher.formattedAmount}
                  </h2>
                </div>
                <span style={{ padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: '800', backgroundColor: selectedVoucher.status === 'Approved' ? '#10b981' : selectedVoucher.status === 'Pending' ? '#f59e0b' : '#ef4444', color: 'white', display: 'flex', alignItems: 'center', gap: '5px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
                  {selectedVoucher.status === 'Approved' ? <CheckCircle2 size={14}/> : selectedVoucher.status === 'Pending' ? <Clock size={14}/> : <XCircle size={14}/>}
                  {selectedVoucher.status}
                </span>
              </div>

              {/* Info Grid — 4 fields in 2x2 */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
                <div style={{ padding: '12px 14px', background: '#f8fafc', borderRadius: '14px', border: '1px solid var(--border-dark)' }}>
                  <span style={{ fontSize: '10px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '3px' }}>Payer / Recipient</span>
                  <span style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-main)', display: 'block' }}>{selectedVoucher.payerRecipient}</span>
                </div>
                <div style={{ padding: '12px 14px', background: '#f8fafc', borderRadius: '14px', border: '1px solid var(--border-dark)' }}>
                  <span style={{ fontSize: '10px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '3px' }}>Payment Method</span>
                  <span style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-main)', display: 'block' }}>{selectedVoucher.paymentMethod}</span>
                </div>
                <div style={{ padding: '12px 14px', background: '#f8fafc', borderRadius: '14px', border: '1px solid var(--border-dark)' }}>
                  <span style={{ fontSize: '10px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '3px' }}>Transaction Ref Code</span>
                  <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--primary)', fontFamily: 'monospace', display: 'block' }}>{selectedVoucher.refNo}</span>
                </div>
                <div style={{ padding: '12px 14px', background: '#f8fafc', borderRadius: '14px', border: '1px solid var(--border-dark)' }}>
                  <span style={{ fontSize: '10px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '3px' }}>Posting Timestamp</span>
                  <span style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-main)', display: 'block' }}>{selectedVoucher.date}</span>
                </div>
              </div>

              {/* Audit Notes */}
              <div style={{ padding: '14px 16px', background: '#f8fafc', borderRadius: '14px', border: '1px solid var(--border-dark)', marginBottom: '18px' }}>
                <span style={{ fontSize: '10px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Executive Audit Notes</span>
                <p style={{ fontSize: '13px', color: 'var(--text-main)', fontWeight: '500', lineHeight: '1.55', margin: 0 }}>
                  {selectedVoucher.notes || 'No additional notes recorded for this transaction.'}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="no-print" style={{ display: 'flex', gap: '12px' }}>
                <button
                  disabled={isGeneratingPdf}
                  onClick={handleExportPdf}
                  style={{ flex: 1, padding: '13px', borderRadius: '14px', border: '1px solid var(--border-dark)', background: '#f1f5f9', color: '#334155', fontWeight: '800', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: '0.2s', opacity: isGeneratingPdf ? 0.7 : 1 }}
                >
                  <FileText size={16} /> {isGeneratingPdf ? 'Generating PDF...' : 'Download PDF Receipt'}
                </button>
                <button
                  onClick={() => setShowVoucherModal(false)}
                  style={{ flex: 1, padding: '13px', borderRadius: '14px', border: 'none', background: 'var(--primary)', color: 'white', fontWeight: '800', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: '0.2s', boxShadow: '0 8px 20px -5px rgba(0, 135, 90, 0.4)' }}
                >
                  Done Inspecting
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Finance;
