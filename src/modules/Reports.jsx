import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, Download, Filter, Search, BarChart3, PieChart, TrendingUp, Calendar, 
  ChevronRight, ArrowDownRight, ArrowUpRight, Printer, FileSpreadsheet, FileArchive, Share2,
  Sparkles, CheckCircle2, Clock, X, Building2, Layers, DollarSign, Users, Wrench, ShieldCheck, RefreshCw, Check, AlertCircle, FileBarChart
} from 'lucide-react';
import { getStoredProperties, getStoredUnits, getStoredTenants } from '../lib/masterData';
import { generateRealPDF } from '../lib/pdfService';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } }
};

const item = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.23, 1, 0.32, 1] } }
};

const Reports = () => {
  const [reportType, setReportType] = useState('financial');
  const [dateRange, setDateRange] = useState({ start: '2026-04-01', end: '2026-05-31' });
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [successMsg, setSuccessMsg] = useState('');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // Real-time telemetry data
  const [properties, setProperties] = useState([]);
  const [units, setUnits] = useState([]);
  const [tenants, setTenants] = useState([]);

  useEffect(() => {
    const load = () => {
      setProperties(getStoredProperties());
      setUnits(getStoredUnits());
      setTenants(getStoredTenants());
    };
    load();
    window.addEventListener('realtyos_rental_update', load);
    window.addEventListener('realtyos_tenants_update', load);
    return () => {
      window.removeEventListener('realtyos_rental_update', load);
      window.removeEventListener('realtyos_tenants_update', load);
    };
  }, []);

  const reportMetadata = {
    financial: {
      title: 'Financial Ledger & Revenue Report',
      desc: 'Comprehensive statement of rental revenues, municipal utility billing, and outstanding tenant arrears.',
      icon: TrendingUp,
      color: '#00875a',
      badge: 'Revenue & Arrears Audit',
      kpis: [
        { label: 'Expected Gross Revenue', val: '₵ 184,500.00', trend: '+14.2%', good: true },
        { label: 'Collected to Date', val: '₵ 168,200.00', trend: '91.2% Rate', good: true },
        { label: 'Outstanding Arrears', val: '₵ 16,300.00', trend: '-3.4% MoM', good: false },
        { label: 'Active Billing Contracts', val: '42 Leases', trend: '100% Verified', good: true }
      ]
    },
    occupancy: {
      title: 'Occupancy Dynamics & Rental Roll',
      desc: 'Real-time utilization metrics, active residential lease allocations, and vacancy optimization tracking.',
      icon: BarChart3,
      color: '#6366f1',
      badge: 'Asset Utilization Roll',
      kpis: [
        { label: 'Total Managed Units', val: '48 Units', trend: 'Across 4 Estates', good: true },
        { label: 'Currently Occupied', val: '44 Units', trend: '91.6% Occupied', good: true },
        { label: 'Available / Ready', val: '3 Units', trend: 'Immediate Move-in', good: true },
        { label: 'Under Maintenance', val: '1 Unit', trend: 'Scheduled Repair', good: false }
      ]
    },
    maintenance: {
      title: 'Operational Health & Work Orders',
      desc: 'System maintenance logs, urgent technician dispatches, and facilities repair expense audit.',
      icon: Wrench,
      color: '#f59e0b',
      badge: 'Facilities Maintenance Audit',
      kpis: [
        { label: 'Total Work Orders', val: '14 Dispatches', trend: 'Current Month', good: true },
        { label: 'Verified Completed', val: '11 Jobs', trend: '78% Resolution Rate', good: true },
        { label: 'Pending / Critical', val: '3 Tasks', trend: 'Priority Response', good: false },
        { label: 'Total Maintenance Expense', val: '₵ 9,750.00', trend: 'Within Budget', good: true }
      ]
    },
    sales: {
      title: 'Capital Estate Valuations & Sales',
      desc: 'Market valuation estimates, master inventory asset appraisals, and sales pipeline conversion ledger.',
      icon: PieChart,
      color: '#ec4899',
      badge: 'Capital Asset Appraisals',
      kpis: [
        { label: 'Aggregate Portfolio Value', val: '₵ 18,450,000', trend: '+18.4% YoY', good: true },
        { label: 'Listed Sales Properties', val: '12 Estates', trend: 'Prime Commercial', good: true },
        { label: 'Average Unit Valuation', val: '₵ 145,000.00', trend: 'Stable Growth', good: true },
        { label: 'Verification Protocol', val: 'SECURE-KYC', trend: '100% Compliant', good: true }
      ]
    }
  };

  const currentMeta = reportMetadata[reportType] || reportMetadata.financial;

  const handlePrint = () => {
    window.print();
  };

  const handleExportPdf = async () => {
    setIsGeneratingPdf(true);
    await generateRealPDF('.reports-print-area', `RealtyOS_${reportType.toUpperCase()}_Intelligence_Report.pdf`, { orientation: 'l' });
    setIsGeneratingPdf(false);
  };

  const handleExportCSV = () => {
    const currentList = getFilteredData();
    const headers = ['Reference No', 'Recorded Date', 'Asset / Project Description', 'Category & Specification', 'Fiscal Valuation', 'Status Audit', 'Performance Momentum'];
    const rows = currentList.map(r => [
      `"${r.ref}"`, 
      `"${r.date}"`, 
      `"${r.asset}"`, 
      `"${r.type}"`, 
      `"${r.impact}"`, 
      `"${r.status}"`, 
      `"${r.trend}"`
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `RealtyOS_${reportType.toUpperCase()}_Intelligence_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    
    setSuccessMsg(`Successfully generated and downloaded audit Excel/CSV ledger for ${currentList.length} records!`);
    setTimeout(() => setSuccessMsg(''), 6000);
  };

  // Construct Realistic Dates and Data
  const getDynamicDatasets = () => {
    const occupancyRows = units.map((u, idx) => ({
      ref: `OC-2026-${100 + idx}`,
      date: `2026-05-${String((idx % 18) + 1).padStart(2, '0')}`,
      asset: `${u.property} • Unit ${u.id}`,
      type: u.type,
      impact: u.status, // Occupied, Available, Maintenance
      status: u.status === 'Occupied' ? 'Verified' : u.status === 'Available' ? 'Ready' : 'Service Req',
      trend: u.status === 'Occupied' ? '100%' : '0%',
      color: u.status === 'Occupied' ? '#00875a' : u.status === 'Available' ? '#6366f1' : '#f59e0b',
      pool: 'Linked Rental Unit'
    }));

    const financialRows = [
      ...tenants.filter(t => t.status === 'Active Lease').map((t, idx) => ({
        ref: `FN-2026-${100 + idx}`,
        date: `2026-05-${String((idx % 20) + 1).padStart(2, '0')}`,
        asset: `${t.name} • Unit ${t.unit}`,
        type: `${t.property}`,
        impact: `₵ ${(t.monthlyRent || 12500).toLocaleString()}`,
        status: t.rentStatus === 'Paid Up' ? 'Verified' : 'Arrears',
        trend: t.rentStatus === 'Paid Up' ? '+12.5%' : '-8.0%',
        color: t.rentStatus === 'Paid Up' ? '#00875a' : '#ef4444',
        pool: 'Active Lease Contract'
      })),
      { ref: 'FN-2026-001', date: '2026-05-02', asset: 'Dr. Kwame Nkrumah Ansah • Unit 101-A', type: 'Grand Horizon Apartments', impact: '₵ 12,500', status: 'Verified', trend: '+12.5%', color: '#00875a', pool: 'Active Lease Contract' },
      { ref: 'FN-2026-002', date: '2026-05-05', asset: 'Sophia Mensah-Osei • Unit 305-C', type: 'Grand Horizon Apartments', impact: '₵ 8,500', status: 'Verified', trend: '+12.5%', color: '#00875a', pool: 'Active Lease Contract' },
      { ref: 'FN-2026-003', date: '2026-04-28', asset: 'Kwadwo Asamoah • Unit 201-B', type: 'Riverside Residencies', impact: '₵ 1,800', status: 'Arrears', trend: '-8.0%', color: '#ef4444', pool: 'Overstay / Arrears' },
      { ref: 'FN-2026-004', date: '2026-05-12', asset: 'Zerivon Tech Corporate • Suite S-02', type: 'The Peninsula Master', impact: '₵ 12,000', status: 'Verified', trend: '+14.0%', color: '#00875a', pool: 'Enterprise Lease Contract' },
      { ref: 'FN-2026-005', date: '2026-04-15', asset: 'Sarah Wilson • Unit 204-B', type: 'Riverside Residencies', impact: '₵ 1,800', status: 'Verified', trend: '+12.5%', color: '#00875a', pool: 'Active Lease Contract' },
      { ref: 'FN-2026-006', date: '2026-05-14', asset: 'Global Logistics Guild • Suite P-04', type: 'The Peninsula Master', impact: '₵ 15,000', status: 'Verified', trend: '+18.0%', color: '#00875a', pool: 'Enterprise Lease Contract' }
    ];

    const maintenanceRows = [
      ...units.filter(u => u.status === 'Maintenance').map((u, idx) => ({
        ref: `MT-2026-${500 + idx}`,
        date: `2026-05-${String((idx % 15) + 1).padStart(2, '0')}`,
        asset: `${u.property} • Unit ${u.id}`,
        type: u.hvac || 'General Maintenance Dispatch',
        impact: '₵ 1,850.00',
        status: 'In Progress',
        trend: 'Urgent Dispatch',
        color: '#f59e0b',
        pool: 'Operational Work Order'
      })),
      { ref: 'MT-2026-901', date: '2026-05-10', asset: 'Grand Horizon Elevators B', type: 'Tri-Zone VRF System AC', impact: '₵ 4,200.00', status: 'In Progress', trend: 'Critical Task', color: '#f59e0b', pool: 'Preventive Schedule' },
      { ref: 'MT-2026-902', date: '2026-05-04', asset: 'Riverside Residencies Pipeline', type: 'Water Polytank Supply', impact: '₵ 2,500.00', status: 'Verified', trend: 'Completed', color: '#00875a', pool: 'Completed Audit' },
      { ref: 'MT-2026-903', date: '2026-04-25', asset: 'Peninsula Office AC Flush', type: 'Central Chiller Duct', impact: '₵ 1,200.00', status: 'Verified', trend: 'Completed', color: '#00875a', pool: 'Completed Audit' },
      { ref: 'MT-2026-904', date: '2026-05-16', asset: 'Grand Horizon Perimeter Lights', type: 'Solar Inverter Battery Unit', impact: '₵ 3,400.00', status: 'Verified', trend: 'Completed', color: '#00875a', pool: 'Completed Audit' }
    ];

    const salesRows = [
      ...properties.map((p, idx) => ({
        ref: `SL-2026-${800 + idx}`,
        date: `2026-05-${String((idx % 12) + 1).padStart(2, '0')}`,
        asset: `${p.name} Master Master Inventory`,
        type: p.type,
        impact: `₵ ${(p.units * 145000).toLocaleString()}`,
        status: p.status === 'High Performance' ? 'Verified' : 'Verified',
        trend: '+18.4%',
        color: '#6366f1',
        pool: 'Capital Sales Valuation'
      })),
      { ref: 'SL-2026-801', date: '2026-05-01', asset: 'Grand Horizon Tower Block Master', type: 'High-Rise Residential Estate', impact: '₵ 6,800,000', status: 'Verified', trend: '+22.4%', color: '#6366f1', pool: 'Certified Capital Valuation' },
      { ref: 'SL-2026-802', date: '2026-04-20', asset: 'Riverside Residencies Complex', type: 'Boutique Townhouse Cluster', impact: '₵ 3,200,000', status: 'Verified', trend: '+14.2%', color: '#6366f1', pool: 'Certified Capital Valuation' },
      { ref: 'SL-2026-803', date: '2026-05-15', asset: 'The Peninsula Executive Suites', type: 'Premium Corporate Waterfront', impact: '₵ 8,450,000', status: 'Verified', trend: '+19.8%', color: '#6366f1', pool: 'Certified Capital Valuation' }
    ];

    return {
      financial: financialRows,
      occupancy: occupancyRows.length > 0 ? occupancyRows : [
        { ref: 'OC-2026-101', date: '2026-05-01', asset: 'Grand Horizon • Unit 101-A', type: '2 Bedroom Apt', impact: 'Occupied', status: 'Verified', trend: '100%', color: '#00875a', pool: 'Linked Rental Unit' }
      ],
      maintenance: maintenanceRows,
      sales: salesRows
    };
  };

  const dynamicData = getDynamicDatasets();
  const currentDataset = dynamicData[reportType] || dynamicData.financial;

  const getFilteredData = () => {
    return currentDataset.filter(item => {
      const matchesSearch = item.asset.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            item.ref.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            item.type.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = activeFilter === 'All' || 
                            item.status.toLowerCase().includes(activeFilter.toLowerCase()) || 
                            item.impact.toLowerCase().includes(activeFilter.toLowerCase());
      
      const itemDate = new Date(item.date);
      const start = new Date(dateRange.start);
      const end = new Date(dateRange.end);
      
      const matchesDate = (!dateRange.start || isNaN(start.getTime()) || itemDate >= start) && 
                          (!dateRange.end || isNaN(end.getTime()) || itemDate <= end);

      return matchesSearch && matchesFilter && matchesDate;
    });
  };

  const filteredList = getFilteredData();

  const totalImpactSum = filteredList.reduce((acc, row) => {
    const val = parseFloat(row.impact.replace(/[^\d.]/g, '')) || 0;
    return acc + val;
  }, 0);
  const formattedTotalImpact = `₵ ${totalImpactSum.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="animate-fade-in" 
      style={{ display: 'flex', flexDirection: 'column', gap: '28px', width: '100%', boxSizing: 'border-box' }}
    >
      {/* Floating Success Banner */}
      <AnimatePresence>
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            style={{
              padding: '16px 24px', backgroundColor: '#00875a', color: 'white',
              borderRadius: '20px', display: 'flex', alignItems: 'center',
              justifyContent: 'space-between', boxShadow: '0 12px 30px -8px var(--primary)',
              fontWeight: '800', fontSize: '14px', zIndex: 100
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <CheckCircle2 size={22} style={{ flexShrink: 0 }} />
              <span>{successMsg}</span>
            </div>
            <button onClick={() => setSuccessMsg('')} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', opacity: 0.8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <X size={18} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MAGNIFICENT BACKBONE HEADER BANNER */}
      <header className="glass-card-premium no-print" style={{ padding: '36px 40px', borderRadius: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '24px', background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)', border: '1px solid #cbd5e1', boxShadow: '0 10px 35px -5px rgba(0, 0, 0, 0.04)' }}>
        <div style={{ flex: '1 1 500px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <span style={{ padding: '6px 16px', background: 'var(--primary-glow)', color: 'var(--primary)', borderRadius: '24px', fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1.5px', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 4px 12px rgba(0, 135, 90, 0.15)' }}>
              <ShieldCheck size={14} /> RealtyOS Central Backbone Hub
            </span>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '800' }}>• Executive Intelligence & Analytics</span>
          </div>
          <h1 style={{ fontSize: '36px', fontWeight: '900', letterSpacing: '-0.8px', color: '#0f172a', margin: '0 0 8px', lineHeight: 1.1 }}>
            Enterprise Reports & Auditing
          </h1>
          <p style={{ fontSize: '15px', color: '#475569', fontWeight: '500', margin: 0, maxWidth: '780px', lineHeight: 1.5 }}>
            The definitive command center for generating, filtering, and certifying portfolio intelligence. Instantly switch report pillars, apply precise date boundaries, and output flawless documents in our signature executive Crimson format.
          </p>
        </div>

        {/* PRIMARY EXPORT CONTROLS */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <motion.button 
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={handlePrint}
            style={{ backgroundColor: 'white', border: '2px solid #cbd5e1', padding: '14px 24px', borderRadius: '18px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', fontWeight: '800', color: '#0f172a', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', transition: 'all 0.2s' }}
          >
            <Printer size={18} color="var(--primary)" /> 
            <span>Print Dossier</span>
          </motion.button>
          
          <motion.button 
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleExportCSV}
            style={{ backgroundColor: '#ecfdf5', border: '2px solid #10b981', padding: '14px 24px', borderRadius: '18px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', fontWeight: '900', color: '#065f46', cursor: 'pointer', boxShadow: '0 6px 16px rgba(16, 185, 129, 0.15)', transition: 'all 0.2s' }}
          >
            <FileSpreadsheet size={18} color="#10b981" /> 
            <span>Excel / CSV Export</span>
          </motion.button>

          <motion.button 
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.98 }}
            disabled={isGeneratingPdf}
            onClick={handleExportPdf}
            style={{ backgroundColor: 'var(--primary)', color: 'white', border: 'none', padding: '14px 28px', borderRadius: '18px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', fontWeight: '900', cursor: 'pointer', boxShadow: '0 10px 25px -5px rgba(0, 135, 90, 0.4)', opacity: isGeneratingPdf ? 0.7 : 1, transition: 'all 0.2s' }}
          >
            <FileArchive size={18} /> 
            <span>{isGeneratingPdf ? 'Compiling PDF...' : 'Export Real PDF'}</span>
          </motion.button>
        </div>
      </header>

      {/* CORE CONTROL HUB: REPORT SELECTION & DATE RANGE PICKER */}
      <div className="glass-card-premium no-print" style={{ padding: '28px 36px', borderRadius: '28px', background: '#f8fafc', border: '1px solid #cbd5e1', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px', borderBottom: '2px solid #e2e8f0', paddingBottom: '24px' }}>
          {/* REPORT TYPE SELECTOR */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#0f172a', fontWeight: '900', fontSize: '15px' }}>
              <FileBarChart size={20} color="var(--primary)" />
              <span>Select Report Pillar:</span>
            </div>
            <div style={{ display: 'flex', background: 'white', padding: '6px', borderRadius: '20px', border: '1px solid #cbd5e1', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
              {Object.keys(reportMetadata).map((key) => {
                const meta = reportMetadata[key];
                const isSelected = reportType === key;
                return (
                  <motion.button
                    key={key}
                    whileHover={{ scale: isSelected ? 1 : 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setReportType(key)}
                    style={{ 
                      padding: '10px 20px', 
                      borderRadius: '16px', 
                      border: 'none', 
                      background: isSelected ? 'var(--primary)' : 'transparent',
                      color: isSelected ? 'white' : '#475569',
                      fontWeight: '800',
                      fontSize: '13px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: isSelected ? '0 6px 16px rgba(0, 135, 90, 0.3)' : 'none'
                    }}
                  >
                    <meta.icon size={16} />
                    <span>{meta.title.split(' ')[0]} {meta.title.split(' ')[1]}</span>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* DATE PICKER FILTER */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'white', padding: '8px 20px', borderRadius: '20px', border: '1px solid #cbd5e1', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
            <Calendar size={18} color="var(--primary)" style={{ flexShrink: 0 }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '10px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase' }}>Start Date</span>
                <input 
                  type="date" 
                  value={dateRange.start}
                  onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                  style={{ border: 'none', background: 'transparent', fontSize: '13px', fontWeight: '800', color: '#0f172a', outline: 'none', cursor: 'pointer' }}
                />
              </div>
              <span style={{ color: '#cbd5e1', fontWeight: '900', fontSize: '16px' }}>/</span>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '10px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase' }}>End Date</span>
                <input 
                  type="date" 
                  value={dateRange.end}
                  onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                  style={{ border: 'none', background: 'transparent', fontSize: '13px', fontWeight: '800', color: '#0f172a', outline: 'none', cursor: 'pointer' }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* SEARCH AND QUICK PILLS */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ position: 'relative', flex: '1 1 300px' }}>
            <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={`Search ${currentMeta.title.toLowerCase()} records, references or assets...`}
              style={{ width: '100%', padding: '14px 16px 14px 44px', borderRadius: '18px', border: '1px solid #cbd5e1', fontSize: '14px', fontWeight: '700', background: 'white', color: '#0f172a', outline: 'none', boxSizing: 'border-box' }} 
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '12px', fontWeight: '800', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Filter size={14} /> Status Audit:
            </span>
            <div style={{ display: 'flex', gap: '6px', background: 'white', padding: '4px', borderRadius: '16px', border: '1px solid #cbd5e1' }}>
              {['All', 'Verified', 'Arrears', 'Progress'].map((flt) => (
                <button
                  key={flt}
                  onClick={() => setActiveFilter(flt)}
                  style={{ 
                    padding: '8px 16px', 
                    borderRadius: '12px', 
                    border: 'none', 
                    background: activeFilter === flt ? '#0f172a' : 'transparent', 
                    color: activeFilter === flt ? 'white' : '#64748b', 
                    fontWeight: '800', 
                    fontSize: '12px', 
                    cursor: 'pointer', 
                    transition: 'all 0.2s',
                    boxShadow: activeFilter === flt ? '0 4px 10px rgba(0,0,0,0.1)' : 'none'
                  }}
                >
                  {flt}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* DYNAMIC KPI SUMMARY CARDS */}
      <div className="no-print" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
        {currentMeta.kpis.map((kpi, idx) => (
          <motion.div 
            key={idx}
            variants={item}
            className="glass-card-premium"
            style={{ padding: '24px 28px', borderRadius: '24px', background: 'white', border: '1px solid #cbd5e1', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '12px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {kpi.label}
              </span>
              <span style={{ 
                padding: '4px 10px', 
                borderRadius: '10px', 
                fontSize: '11px', 
                fontWeight: '900', 
                backgroundColor: kpi.good ? '#ecfdf5' : '#fef2f2',
                color: kpi.good ? '#00875a' : '#ef4444',
                border: `1px solid ${kpi.good ? '#a7f3d0' : '#fca5a5'}`
              }}>
                {kpi.trend}
              </span>
            </div>
            <div style={{ marginTop: '16px' }}>
              <h3 style={{ fontSize: '28px', fontWeight: '900', color: '#0f172a', margin: 0 }}>
                {kpi.val}
              </h3>
            </div>
          </motion.div>
        ))}
      </div>

      {/* MAIN PRINTABLE DOSSIER CONTAINER */}
      <motion.div 
        variants={item} 
        className="glass-card-premium reports-print-area" 
        style={{ padding: '36px 40px', background: 'white', borderRadius: '32px', border: '1px solid #cbd5e1', boxShadow: '0 12px 40px rgba(0,0,0,0.04)', boxSizing: 'border-box', width: '100%' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', borderBottom: '2px solid #f1f5f9', paddingBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{ padding: '4px 12px', background: '#ecfdf5', color: '#00875a', borderRadius: '14px', fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px', border: '1px solid #a7f3d0' }}>
                {currentMeta.badge}
              </span>
              <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '800' }}>• Filtered Roll ({filteredList.length} Entries)</span>
            </div>
            <h2 style={{ fontSize: '28px', fontWeight: '900', color: '#0f172a', margin: '0 0 4px', lineHeight: 1.2 }}>
              {currentMeta.title}
            </h2>
            <p style={{ fontSize: '14px', color: '#64748b', fontWeight: '600', margin: 0 }}>
              Showing verified telemetry between <strong style={{ color: '#0f172a' }}>{dateRange.start || 'Beginning'}</strong> and <strong style={{ color: '#0f172a' }}>{dateRange.end || 'Present'}</strong>.
            </p>
          </div>
          <div className="no-print" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button onClick={handlePrint} style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '10px 20px', borderRadius: '14px', fontWeight: '800', fontSize: '13px', color: '#0f172a', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Printer size={16} /> Quick Print
            </button>
            <button onClick={handleExportPdf} style={{ background: 'var(--primary)', border: 'none', color: 'white', padding: '10px 24px', borderRadius: '14px', fontWeight: '800', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 6px 16px rgba(0, 135, 90, 0.3)' }}>
              <FileArchive size={16} /> PDF Output
            </button>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px' }}>
            <thead>
              <tr style={{ textAlign: 'left' }}>
                <th style={{ padding: '12px 18px', fontSize: '12px', fontWeight: '900', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>Ref No</th>
                <th style={{ padding: '12px 18px', fontSize: '12px', fontWeight: '900', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>Recorded Date</th>
                <th style={{ padding: '12px 18px', fontSize: '12px', fontWeight: '900', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>Asset Description & Specification</th>
                <th style={{ padding: '12px 18px', fontSize: '12px', fontWeight: '900', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>Fiscal Impact</th>
                <th style={{ padding: '12px 18px', fontSize: '12px', fontWeight: '900', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>Audit Status</th>
                <th style={{ padding: '12px 18px', fontSize: '12px', fontWeight: '900', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>Momentum</th>
              </tr>
            </thead>
            <tbody>
              {filteredList.map((row, i) => (
                <motion.tr 
                  key={`${reportType}-${i}`} 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  style={{ background: '#f8fafc', borderRadius: '16px' }}
                >
                  <td style={{ padding: '16px 18px', fontSize: '13px', fontWeight: '900', color: 'var(--primary)', borderTopLeftRadius: '16px', borderBottomLeftRadius: '16px' }}>{row.ref}</td>
                  <td style={{ padding: '16px 18px', fontSize: '13px', fontWeight: '800', color: '#475569' }}>{row.date}</td>
                  <td style={{ padding: '16px 18px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '15px', fontWeight: '900', color: '#0f172a' }}>{row.asset}</span>
                      <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '700', marginTop: '2px' }}>{row.type} • {row.pool}</span>
                    </div>
                  </td>
                  <td style={{ padding: '16px 18px', fontSize: '15px', fontWeight: '900', color: '#0f172a' }}>{row.impact}</td>
                  <td style={{ padding: '16px 18px' }}>
                    <span style={{ 
                      backgroundColor: row.status.includes('Verified') ? '#ecfdf5' : row.status.includes('Arrears') || row.status.includes('Critical') ? '#fef2f2' : '#fffbeb', 
                      color: row.status.includes('Verified') ? '#00875a' : row.status.includes('Arrears') || row.status.includes('Critical') ? '#ef4444' : '#f59e0b', 
                      padding: '6px 12px', borderRadius: '12px', fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', display: 'inline-block', border: `1px solid ${row.status.includes('Verified') ? '#10b98130' : row.status.includes('Arrears') ? '#ef444430' : '#f59e0b30'}`
                    }}>
                      {row.status}
                    </span>
                  </td>
                  <td style={{ padding: '16px 18px', borderTopRightRadius: '16px', borderBottomRightRadius: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '40px', height: '6px', background: '#e2e8f0', borderRadius: '10px', overflow: 'hidden' }}>
                        <div style={{ width: row.trend.includes('-') ? '35%' : '85%', height: '100%', background: row.trend.includes('-') ? '#ef4444' : 'var(--primary)' }}></div>
                      </div>
                      <span style={{ fontSize: '12px', fontWeight: '900', color: row.trend.includes('-') ? '#ef4444' : 'var(--primary)' }}>{row.trend}</span>
                    </div>
                  </td>
                </motion.tr>
              ))}
              {filteredList.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ padding: '36px', textAlign: 'center', color: '#64748b', fontWeight: '800' }}>
                    No intelligence records found matching the active date boundaries or search filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <div style={{ marginTop: '36px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 28px', background: '#f1f5f9', borderRadius: '20px', border: '1px solid #cbd5e1', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', gap: '32px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div>
              <p style={{ fontSize: '11px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', margin: 0 }}>Aggregated Fiscal Valuation</p>
              <p style={{ fontSize: '22px', fontWeight: '900', color: '#0f172a', margin: '2px 0 0' }}>{formattedTotalImpact}</p>
            </div>
            <div style={{ width: '1px', height: '36px', background: '#cbd5e1' }}></div>
            <div>
              <p style={{ fontSize: '11px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', margin: 0 }}>Verified Audit Dossiers</p>
              <p style={{ fontSize: '22px', fontWeight: '900', color: '#0f172a', margin: '2px 0 0' }}>{filteredList.length} Certified Entries</p>
            </div>
          </div>
          <div className="no-print" style={{ display: 'flex', gap: '12px' }}>
            <button onClick={handleExportCSV} style={{ padding: '12px 20px', borderRadius: '16px', background: 'white', border: '2px solid #cbd5e1', fontSize: '13px', fontWeight: '800', color: '#0f172a', cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.03)' }}>
              Download Excel / CSV
            </button>
            <button onClick={handlePrint} style={{ padding: '12px 28px', borderRadius: '16px', background: 'var(--primary)', color: 'white', border: 'none', fontSize: '13px', fontWeight: '900', cursor: 'pointer', boxShadow: '0 8px 20px -5px var(--primary)' }}>
              Certify & Print Report
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Reports;
