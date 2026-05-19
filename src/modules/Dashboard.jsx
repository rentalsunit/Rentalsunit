import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, Home, Users, CreditCard, Wrench, 
  ArrowUpRight, ArrowDownRight, Key, MapPin, 
  Clock, AlertCircle, CheckCircle2, TrendingUp, Layers,
  Sparkles, FileText, PlusCircle, ArrowRight, ShieldCheck, PieChart as PieIcon
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
import { getStoredProperties, getStoredUnits, getStoredTenants } from '../lib/masterData';
import { generateRealPDF } from '../lib/pdfService';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.1 }
  }
};

const item = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.23, 1, 0.32, 1] } }
};

const Dashboard = ({ setActiveCategory, setActiveTab }) => {
  const [properties, setProperties] = useState([]);
  const [units, setUnits] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [projectionMode, setProjectionMode] = useState('2026'); // '2026' or '5YR'
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const handleExportPdf = async () => {
    setIsGeneratingPdf(true);
    await generateRealPDF('.overview-print-area', 'RealtyOS_Executive_Overview_Dashboard.pdf', { orientation: 'l' });
    setIsGeneratingPdf(false);
  };

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

  // Real-time calculations
  const totalUnitsCount = units.length;
  const occupiedUnitsCount = units.filter(u => u.status === 'Occupied').length;
  const vacantUnitsCount = units.filter(u => u.status === 'Available').length;
  const maintenanceUnitsCount = units.filter(u => u.status === 'Maintenance').length;
  const occupancyRate = totalUnitsCount > 0 ? Math.round((occupiedUnitsCount / totalUnitsCount) * 100) : 0;

  const monthlyRevenue = units
    .filter(u => u.status === 'Occupied')
    .reduce((sum, u) => {
      const num = parseFloat(u.price.replace(/[^\d.]/g, '')) || 0;
      return sum + num;
    }, 0);
  const formattedRevenue = `₵ ${monthlyRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const stats = [
    { 
      label: 'Portfolio Revenue (Mo.)', 
      value: formattedRevenue, 
      sub: '+15.4% vs previous cycle', 
      icon: CreditCard, 
      color: '#00875a', 
      trend: 'up',
      cat: 'finance',
      tab: 'finance-ledger',
      progress: 82
    },
    { 
      label: 'Active Occupancy Rate', 
      value: `${occupiedUnitsCount} / ${totalUnitsCount} Units`, 
      sub: `${occupancyRate}% Total capacity filled`, 
      icon: Key, 
      color: '#6366f1', 
      trend: 'up',
      cat: 'rental',
      tab: 'leases',
      progress: occupancyRate
    },
    { 
      label: 'Master Managed Estates', 
      value: `${properties.length} Properties`, 
      sub: `${vacantUnitsCount} Vacant parcels ready`, 
      icon: Building2, 
      color: '#3b82f6', 
      trend: 'up',
      cat: 'rental',
      tab: 'rental-properties',
      progress: 100
    },
    { 
      label: 'Operational Health', 
      value: `${maintenanceUnitsCount} Tasks`, 
      sub: 'All dispatches audited', 
      icon: Wrench, 
      color: '#f59e0b', 
      trend: 'down',
      cat: 'operations',
      tab: 'maintenance',
      progress: maintenanceUnitsCount > 0 ? 35 : 100
    },
  ];

  const dynamicOccupancyData = [
    { name: 'Occupied', value: occupiedUnitsCount || 1, color: '#00875a' },
    { name: 'Vacant', value: vacantUnitsCount || 1, color: '#94a3b8' },
    { name: 'Maintenance', value: maintenanceUnitsCount || 0, color: '#f59e0b' },
  ];

  const data2026 = [
    { name: 'JAN', rent: 45000, expenses: 12000 },
    { name: 'FEB', rent: 52000, expenses: 15000 },
    { name: 'MAR', rent: 48000, expenses: 11000 },
    { name: 'APR', rent: 61000, expenses: 18000 },
    { name: 'MAY (Live)', rent: monthlyRevenue > 0 ? monthlyRevenue : 67400, expenses: 14200 },
    { name: 'JUN (Est.)', rent: Math.round((monthlyRevenue > 0 ? monthlyRevenue : 67400) * 1.08), expenses: 15000 },
  ];

  const data5YR = [
    { name: '2022', rent: 280000, expenses: 95000 },
    { name: '2023', rent: 390000, expenses: 110000 },
    { name: '2024', rent: 520000, expenses: 145000 },
    { name: '2025', rent: 680000, expenses: 170000 },
    { name: '2026 (Live)', rent: (monthlyRevenue > 0 ? monthlyRevenue * 12 : 808800), expenses: 185000 },
    { name: '2027 (Pro.)', rent: Math.round((monthlyRevenue > 0 ? monthlyRevenue * 14.5 : 980000)), expenses: 210000 },
  ];

  const currentChartData = projectionMode === '2026' ? data2026 : data5YR;

  const leaseRenewals = tenants
    .filter(t => t.status === 'Active Lease' && t.leaseEnd && t.leaseEnd !== '-')
    .map(t => {
      const diffTime = new Date(t.leaseEnd) - new Date();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      let statusStr = 'Pending Renewal';
      let dateStr = `In ${diffDays} days`;
      if (diffDays < 0) {
        statusStr = 'Overstayed / Arrears';
        dateStr = `Expired ${Math.abs(diffDays)}d ago`;
      } else if (diffDays > 90) {
        statusStr = 'Secure Lease';
        dateStr = `Expires in ${Math.round(diffDays / 30)} mo.`;
      }
      return {
        name: t.name,
        unit: t.unit,
        date: dateStr,
        status: statusStr,
        urgent: diffDays <= 30
      };
    })
    .slice(0, 4);

  const displayRenewals = leaseRenewals.length > 0 ? leaseRenewals : [
    { name: 'Dr. Kwame Nkrumah Ansah', unit: '101-A', date: 'Expires in 6 mo.', status: 'Secure Lease', urgent: false },
    { name: 'Sophia Mensah-Osei', unit: '305-C', date: 'In 14 days', status: 'Pending Renewal', urgent: true },
    { name: 'Emmanuel Ofori Atta', unit: '102-A', date: 'In 90 days', status: 'Notice Generated', urgent: false },
    { name: 'Grace Amponsah', unit: '108-A', date: 'In 54 days', status: 'Secure Lease', urgent: false }
  ];

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="overview-print-area"
      style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', boxSizing: 'border-box' }}
    >
      {/* Header Banner */}
      <motion.div variants={item} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ padding: '2px 10px', background: 'var(--primary-glow)', color: 'var(--primary)', borderRadius: '20px', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <ShieldCheck size={12} /> Live Telemetry
            </span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700' }}>• Automated Asset Engine</span>
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: '900', letterSpacing: '-0.5px', color: 'var(--text-main)', margin: '0 0 2px' }}>Executive Overview</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', fontWeight: '600', margin: 0 }}>Real-time revenue, occupancy roll, and operational dispatches across all properties.</p>
        </div>
        
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <div style={{ padding: '4px 12px', background: 'white', borderRadius: '30px', border: '1px solid var(--border-dark)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: '800', color: 'var(--text-main)', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
            <Clock size={14} color="var(--primary)" /> System Status: <span style={{ color: '#00875a' }}>Optimal</span>
          </div>
        </div>
      </motion.div>

      {/* Executive Command Bar */}
      <motion.div variants={item} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', background: 'rgba(255, 255, 255, 0.75)', padding: '10px 16px', borderRadius: '18px', border: '1px solid rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(20px)', boxShadow: '0 6px 20px rgba(0, 0, 0, 0.03)', alignItems: 'center' }}>
        <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', paddingLeft: '4px' }}>Actions:</span>
        <motion.button 
          whileHover={{ scale: 1.02, y: -1 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => { setActiveCategory('rental'); setActiveTab('rental-properties'); }}
          style={{ padding: '8px 14px', borderRadius: '12px', background: 'var(--primary-gradient)', color: 'white', border: 'none', fontWeight: '800', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', boxShadow: '0 4px 12px -4px var(--primary)' }}
        >
          <Building2 size={15} /> + Register New Property
        </motion.button>
        <motion.button 
          whileHover={{ scale: 1.02, y: -1 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => { setActiveCategory('rental'); setActiveTab('units'); }}
          style={{ padding: '8px 14px', borderRadius: '12px', background: 'white', color: 'var(--text-main)', border: '1px solid #cbd5e1', fontWeight: '800', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}
        >
          <Home size={15} color="var(--primary)" /> + Intake Rental Unit
        </motion.button>
        <motion.button 
          whileHover={{ scale: 1.02, y: -1 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => { setActiveCategory('tenants-category'); setActiveTab('tenants'); }}
          style={{ padding: '8px 14px', borderRadius: '12px', background: 'white', color: 'var(--text-main)', border: '1px solid #cbd5e1', fontWeight: '800', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}
        >
          <Users size={15} color="#6366f1" /> Resident Directory & Ledger
        </motion.button>
        <motion.button 
          whileHover={{ scale: 1.02, y: -1 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => { setActiveCategory('operations'); setActiveTab('maintenance'); }}
          style={{ padding: '8px 14px', borderRadius: '12px', background: 'white', color: 'var(--text-main)', border: '1px solid #cbd5e1', fontWeight: '800', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}
        >
          <Wrench size={15} color="#f59e0b" /> Dispatch Maintenance
        </motion.button>
      </motion.div>

      {/* Top Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        {stats.map((stat, i) => (
          <motion.div 
            key={i} 
            variants={item} 
            whileHover={{ y: -3, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setActiveCategory(stat.cat);
              setActiveTab(stat.tab);
            }}
            className="glass-card-premium" 
            style={{ 
              padding: '16px 18px', 
              cursor: 'pointer', 
              background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)',
              border: '1px solid rgba(255,255,255,0.8)',
              boxShadow: '0 8px 20px rgba(0, 135, 90, 0.04)',
              borderRadius: '20px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxSizing: 'border-box'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
              <div style={{ 
                width: '36px', height: '36px', borderRadius: '12px', 
                background: `${stat.color}15`, color: stat.color, 
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: `0 4px 12px ${stat.color}20`
              }}>
                <stat.icon size={18} />
              </div>
              <div style={{ 
                padding: '4px 8px', borderRadius: '16px', 
                background: stat.trend === 'up' ? '#ecfdf5' : '#fef2f2',
                display: 'flex', alignItems: 'center', gap: '4px',
                border: `1px solid ${stat.trend === 'up' ? '#10b98130' : '#ef444430'}`
              }}>
                {stat.trend === 'up' ? <ArrowUpRight size={12} color="#10b981" /> : <ArrowDownRight size={12} color="#ef4444" />}
                <span style={{ fontSize: '10px', fontWeight: '900', color: stat.trend === 'up' ? '#10b981' : '#ef4444' }}>
                  {stat.sub.split(' ')[0]}
                </span>
              </div>
            </div>
            
            <div>
              <p style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{stat.label}</p>
              <h2 style={{ fontSize: '22px', fontWeight: '900', color: 'var(--text-main)', margin: '0 0 12px' }}>{stat.value}</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ flex: 1, height: '5px', background: '#e2e8f0', borderRadius: '10px', overflow: 'hidden' }}>
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${stat.progress}%` }}
                    transition={{ duration: 1, delay: 0.2 }}
                    style={{ height: '100%', background: stat.color, borderRadius: '10px' }}
                  />
                </div>
                <span style={{ fontSize: '11px', fontWeight: '800', color: stat.color }}>{stat.progress}%</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
        <motion.div variants={item} className="glass-card-premium" style={{ padding: '20px 24px', background: 'white', borderRadius: '22px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <span style={{ fontSize: '10px', fontWeight: '900', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '2px' }}>Cashflow Analytics</span>
              <h3 style={{ fontSize: '18px', fontWeight: '900', color: 'var(--text-main)', margin: 0 }}>Financial Trajectory & Forecast</h3>
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <div style={{ display: 'flex', background: '#f1f5f9', padding: '3px', borderRadius: '16px', border: '1px solid #cbd5e1' }}>
                <button 
                  onClick={() => setProjectionMode('2026')}
                  style={{ padding: '4px 12px', borderRadius: '14px', border: 'none', background: projectionMode === '2026' ? 'white' : 'transparent', color: projectionMode === '2026' ? 'var(--primary)' : '#64748b', fontWeight: '800', fontSize: '11px', cursor: 'pointer', boxShadow: projectionMode === '2026' ? '0 2px 6px rgba(0,0,0,0.05)' : 'none', transition: 'all 0.2s' }}
                >
                  2026 Monthly
                </button>
                <button 
                  onClick={() => setProjectionMode('5YR')}
                  style={{ padding: '4px 12px', borderRadius: '14px', border: 'none', background: projectionMode === '5YR' ? 'white' : 'transparent', color: projectionMode === '5YR' ? 'var(--primary)' : '#64748b', fontWeight: '800', fontSize: '11px', cursor: 'pointer', boxShadow: projectionMode === '5YR' ? '0 2px 6px rgba(0,0,0,0.05)' : 'none', transition: 'all 0.2s' }}
                >
                  5-Year Equity
                </button>
              </div>
            </div>
          </div>
          <div style={{ height: '220px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={currentChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00875a" stopOpacity={0.35}/>
                    <stop offset="95%" stopColor="#00875a" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b', fontWeight: 700 }} dy={8} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b', fontWeight: 700 }} />
                <Tooltip contentStyle={{ borderRadius: '16px', border: '1px solid #cbd5e1', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', padding: '12px', fontWeight: 800, fontSize: 12 }} />
                <Area type="monotone" dataKey="rent" name="Gross Collections" stroke="#00875a" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                <Area type="monotone" dataKey="expenses" name="Operating Costs" stroke="#818cf8" strokeWidth={2.5} fill="transparent" strokeDasharray="5 5" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '800', color: 'var(--text-main)' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: '#00875a' }}></div> Gross Collections & Yield
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '800', color: 'var(--text-main)' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: '#818cf8' }}></div> Operating Maintenance Costs
            </div>
          </div>
        </motion.div>

        <motion.div variants={item} className="glass-card-premium" style={{ padding: '20px 24px', background: 'white', borderRadius: '22px', border: '1px solid #cbd5e1', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>
          <div style={{ marginBottom: '16px' }}>
            <span style={{ fontSize: '10px', fontWeight: '900', color: '#6366f1', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '2px' }}>Inventory Distribution</span>
            <h3 style={{ fontSize: '18px', fontWeight: '900', color: 'var(--text-main)', margin: 0 }}>Unit Capacity Roll</h3>
          </div>
          
          <div style={{ height: '180px', position: 'relative', margin: 'auto 0' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={dynamicOccupancyData} innerRadius={55} outerRadius={80} paddingAngle={6} dataKey="value" stroke="none">
                  {dynamicOccupancyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '14px', border: 'none', boxShadow: '0 8px 20px rgba(0,0,0,0.1)', fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
              <p style={{ fontSize: '24px', fontWeight: '900', color: 'var(--text-main)', lineHeight: 1, margin: 0 }}>{totalUnitsCount}</p>
              <p style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '800', margin: '2px 0 0' }}>Total Units</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
            {dynamicOccupancyData.map((item) => (
              <div key={item.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: item.color }}></div>
                  <span style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-main)' }}>{item.name} Parcels</span>
                </div>
                <span style={{ fontSize: '13px', fontWeight: '900', color: 'var(--text-main)', background: '#f8fafc', padding: '2px 10px', borderRadius: '12px', border: '1px solid #cbd5e1' }}>{item.value} Units</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Bottom Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '16px' }}>
        <motion.div variants={item} className="glass-card-premium" style={{ padding: '20px 24px', background: 'white', borderRadius: '22px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <span style={{ fontSize: '10px', fontWeight: '900', color: '#00875a', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '2px' }}>Live Activity Feed</span>
              <h3 style={{ fontSize: '18px', fontWeight: '900', color: 'var(--text-main)', margin: 0 }}>Operational Audit Pulse</h3>
            </div>
            <button 
              onClick={() => { setActiveCategory('operations'); setActiveTab('tasks'); }}
              style={{ padding: '6px 12px', borderRadius: '12px', background: '#f1f5f9', border: '1px solid #cbd5e1', fontSize: '12px', fontWeight: '800', color: 'var(--primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              Full Log <ArrowRight size={12} />
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {[
              { icon: CheckCircle2, color: '#00875a', title: 'Unit 101-A Rent Payment Reconciled', time: '12m ago', desc: '₵ 12,500 Base Rent processed via Standing Order ACH', cat: 'finance', tab: 'finance-rent' },
              { icon: Layers, color: '#6366f1', title: 'New Unit Registration Link', time: '45m ago', desc: '3 Bedroom Penthouse Suite linked to Grand Horizon Apartments', cat: 'rental', tab: 'units' },
              { icon: ShieldCheck, color: '#3b82f6', title: 'Resident KYC Authorized', time: '1h ago', desc: 'Dr. Kwame Nkrumah Ansah biometric dossier verified', cat: 'tenants-category', tab: 'tenants' },
              { icon: AlertCircle, color: '#f59e0b', title: 'HVAC Tri-Zone Inspection Scheduled', time: '2h ago', desc: 'Dual inverter AC flush dispatched for Riverside Residencies', cat: 'operations', tab: 'maintenance' },
            ].map((activity, idx) => (
              <motion.div 
                key={idx} 
                whileHover={{ x: 4, background: '#f8fafc' }}
                onClick={() => { setActiveCategory(activity.cat); setActiveTab(activity.tab); }}
                style={{ display: 'flex', gap: '16px', cursor: 'pointer', padding: '12px 14px', borderRadius: '16px', border: '1px solid #f1f5f9', transition: 'all 0.2s' }}
              >
                <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: `${activity.color}15`, color: activity.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: `0 4px 10px ${activity.color}20` }}>
                  <activity.icon size={18} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-main)', margin: 0 }}>{activity.title}</h4>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700', background: 'white', padding: '2px 8px', borderRadius: '10px', border: '1px solid #cbd5e1' }}>{activity.time}</span>
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600', margin: 0 }}>{activity.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div variants={item} className="glass-card-premium" style={{ padding: '20px 24px', background: 'white', borderRadius: '22px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <span style={{ fontSize: '10px', fontWeight: '900', color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '2px' }}>Tenancy Roll Oversight</span>
              <h3 style={{ fontSize: '18px', fontWeight: '900', color: 'var(--text-main)', margin: 0 }}>Lease Expiration Status</h3>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {displayRenewals.map((renewal, idx) => (
              <motion.div 
                key={idx} 
                whileHover={{ scale: 1.01 }}
                onClick={() => { setActiveCategory('rental'); setActiveTab('leases'); }}
                style={{ padding: '14px 18px', borderRadius: '18px', background: renewal.urgent ? '#fef2f2' : '#f8fafc', border: `1px solid ${renewal.urgent ? '#fca5a5' : '#cbd5e1'}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}
              >
                <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: renewal.urgent ? '#ef4444' : 'var(--primary-gradient)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '16px', boxShadow: renewal.urgent ? '0 4px 12px -4px #ef4444' : '0 4px 12px -4px var(--primary)' }}>
                    {renewal.name[0]}
                  </div>
                  <div>
                    <p style={{ fontSize: '14px', fontWeight: '900', color: 'var(--text-main)', margin: '0 0 2px' }}>{renewal.name}</p>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '700', margin: 0 }}>Unit {renewal.unit}</p>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '13px', fontWeight: '900', color: renewal.urgent ? '#ef4444' : 'var(--primary)', margin: '0 0 2px' }}>{renewal.date}</p>
                  <p style={{ fontSize: '10px', color: renewal.urgent ? '#991b1b' : 'var(--text-muted)', fontWeight: '800', background: 'white', padding: '2px 10px', borderRadius: '12px', display: 'inline-block', margin: 0, border: '1px solid #cbd5e1' }}>{renewal.status}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Dashboard;
