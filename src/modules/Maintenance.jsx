import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wrench, AlertTriangle, CheckCircle2, Clock, Search, Filter, 
  Plus, Building, User, DollarSign, FileText, X, ShieldAlert, 
  ArrowUpRight, HardHat, RefreshCw, Layers
} from 'lucide-react';
import { getStoredProperties, getStoredUnits, getStoredMaintenanceTickets, saveStoredMaintenanceTickets } from '../lib/masterData';
import { generateRealPDF } from '../lib/pdfService';

const Maintenance = () => {
  const [requests, setRequests] = useState(() => {
    return getStoredMaintenanceTickets();
  });

  // Listen for updates dispatched across modules (e.g. from Units.jsx)
  useEffect(() => {
    const handleUpdate = () => {
      setRequests(getStoredMaintenanceTickets());
    };
    window.addEventListener('storage', handleUpdate);
    window.addEventListener('realtyos_maintenance_tickets_update', handleUpdate);
    return () => {
      window.removeEventListener('storage', handleUpdate);
      window.removeEventListener('realtyos_maintenance_tickets_update', handleUpdate);
    };
  }, []);

  const saveToStorage = (updatedList) => {
    setRequests(updatedList);
    saveStoredMaintenanceTickets(updatedList);
  };

  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const handleExportPdf = async () => {
    setIsGeneratingPdf(true);
    await generateRealPDF('.workorder-print-area', `Work_Order_${selectedTicket?.id ? selectedTicket.id : 'MNT'}.pdf`, { orientation: 'p' });
    setIsGeneratingPdf(false);
  };

  const [selectedModalProperty, setSelectedModalProperty] = useState('');
  const [selectedModalUnit, setSelectedModalUnit] = useState('');
  const [customUnitInput, setCustomUnitInput] = useState('');

  const availableProps = useMemo(() => {
    const props = getStoredProperties() || [];
    const unitProps = (getStoredUnits() || []).map(u => u.property);
    const allNames = [...props.map(p => p.name), ...unitProps, 'Standalone Unit / Independent Property', 'General Facility / Common Grounds'];
    return Array.from(new Set(allNames)).filter(Boolean);
  }, [showAddModal]);

  useEffect(() => {
    if (showAddModal && availableProps.length > 0) {
      if (!selectedModalProperty || !availableProps.includes(selectedModalProperty)) {
        setSelectedModalProperty(availableProps[0]);
      }
    }
  }, [showAddModal, availableProps]);

  const availableUnitsForProperty = useMemo(() => {
    if (!selectedModalProperty) return [];
    const allUnits = getStoredUnits() || [];
    return allUnits.filter(u => u.property === selectedModalProperty);
  }, [selectedModalProperty, showAddModal]);

  useEffect(() => {
    if (showAddModal) {
      if (availableUnitsForProperty.length > 0) {
        setSelectedModalUnit(availableUnitsForProperty[0].id);
      } else {
        setSelectedModalUnit('🏛️ Common Area / Main Foyer');
      }
      setCustomUnitInput('');
    }
  }, [selectedModalProperty, showAddModal]);

  const handleStatusUpdate = (id, newStatus) => {
    const updated = requests.map(r => r.id === id ? { ...r, status: newStatus } : r);
    saveToStorage(updated);
    setSuccessMsg(`Ticket ${id} status successfully updated to ${newStatus}.`);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleAddRequest = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const numCost = parseFloat(formData.get('estCost')) || 0;
    const formattedCost = `₵ ${numCost.toLocaleString()}`;

    const finalUnit = selectedModalUnit === 'CUSTOM_ZONE' ? (customUnitInput || 'Custom Facility Zone') : selectedModalUnit;

    const newReq = {
      id: `MNT-${8000 + requests.length + 1}`,
      property: selectedModalProperty,
      unit: finalUnit,
      category: formData.get('category'),
      title: formData.get('title'),
      priority: formData.get('priority'),
      status: 'Assigned',
      loggedBy: formData.get('loggedBy') || 'Louis Kemenyo',
      assignedTo: formData.get('assignedTo'),
      estCost: numCost,
      formattedCost: formattedCost,
      date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      notes: formData.get('notes') || 'Initial repair work order logged.'
    };

    const updated = [newReq, ...requests];
    saveToStorage(updated);
    setShowAddModal(false);
    setSuccessMsg(`Successfully logged new maintenance order ${newReq.id} (${newReq.priority} priority)!`);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const filteredRequests = useMemo(() => {
    return requests.filter(r => {
      const matchesSearch = r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            r.property.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            r.unit.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            r.assignedTo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            r.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPriority = filterPriority === 'all' || r.priority.toLowerCase() === filterPriority.toLowerCase();
      const matchesStatus = filterStatus === 'all' || r.status.toLowerCase().includes(filterStatus.toLowerCase());
      return matchesSearch && matchesPriority && matchesStatus;
    });
  }, [requests, searchTerm, filterPriority, filterStatus]);

  const metrics = useMemo(() => {
    const total = requests.length;
    const urgentCount = requests.filter(r => r.priority === 'Urgent').length;
    const inProgressCount = requests.filter(r => r.status === 'In Progress').length;
    const totalCost = requests.filter(r => r.status !== 'Cancelled').reduce((acc, r) => acc + r.estCost, 0);
    return { total, urgentCount, inProgressCount, totalCost };
  }, [requests]);

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
              <Wrench size={12} /> Facility Operations & Repair Command
            </span>
          </div>
          <h2 style={{ fontSize: '28px', fontWeight: '800', letterSpacing: '-0.5px', color: 'var(--text-main)' }}>Maintenance Work Orders</h2>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: '500', marginTop: '2px' }}>
            Centralized dispatch for facility repairs, preventative maintenance, contractor assignments, and budgeting.
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
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
            <Plus size={20} /> Log New Repair Order
          </motion.button>
        </div>
      </header>

      {/* Executive Metric Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', width: '100%' }}>
        <div className="glass-card-premium" style={{ padding: '24px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: '#e0e7ff', color: '#4338ca', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Layers size={28} />
          </div>
          <div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Active Tickets</p>
            <h3 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-main)', marginTop: '4px' }}>
              {metrics.total} Orders
            </h3>
            <span style={{ fontSize: '12px', color: '#4338ca', fontWeight: '700' }}>Portfolio-wide dispatch</span>
          </div>
        </div>

        <div className="glass-card-premium" style={{ padding: '24px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: '#fef2f2', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AlertTriangle size={28} />
          </div>
          <div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Urgent Action Required</p>
            <h3 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-main)', marginTop: '4px' }}>
              {metrics.urgentCount} Critical
            </h3>
            <span style={{ fontSize: '12px', color: '#ef4444', fontWeight: '700' }}>Immediate dispatch active</span>
          </div>
        </div>

        <div className="glass-card-premium" style={{ padding: '24px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: '#fffbeb', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Clock size={28} />
          </div>
          <div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Active & In Progress</p>
            <h3 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-main)', marginTop: '4px' }}>
              {metrics.inProgressCount} Jobs
            </h3>
            <span style={{ fontSize: '12px', color: '#d97706', fontWeight: '700' }}>Contractors on site</span>
          </div>
        </div>

        <div className="glass-card-premium" style={{ padding: '24px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: '#ecfdf5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <DollarSign size={28} />
          </div>
          <div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Estimated Repair Budget</p>
            <h3 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-main)', marginTop: '4px' }}>
              ₵ {(metrics.totalCost / 1000).toLocaleString()}k
            </h3>
            <span style={{ fontSize: '12px', color: '#10b981', fontWeight: '700' }}>Combined OpEx allocation</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', background: 'white', padding: '16px 24px', borderRadius: '20px', border: '1px solid var(--border-dark)', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.03)', width: '100%' }}>
        <div style={{ position: 'relative', width: '100%', maxWidth: '380px' }}>
          <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Search tickets by title, property, unit, or contractor..."
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
          {/* Priority Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Filter size={16} /> Priority:
            </span>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              style={{ padding: '10px 16px', borderRadius: '12px', border: '1px solid var(--border-dark)', fontSize: '13px', fontWeight: '700', background: '#f8fafc', color: 'var(--text-main)', cursor: 'pointer' }}
            >
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent Priority</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>
          </div>

          {/* Status Filter Pills */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Clock size={16} /> Status:
            </span>
            <div style={{ display: 'flex', background: '#f1f5f9', padding: '4px', borderRadius: '12px', border: '1px solid var(--border-dark)' }}>
              {['All', 'Pending', 'In Progress', 'Completed'].map(st => (
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

      {/* Maintenance Tickets Table */}
      <div className="glass-card-premium" style={{ padding: '0', overflowX: 'auto', borderRadius: '24px', width: '100%', border: '1px solid var(--border-dark)', boxShadow: '0 25px 50px -20px rgba(0,0,0,0.05)' }}>
        <table style={{ width: '100%', minWidth: '950px', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border-dark)' }}>
              <th style={{ padding: '18px 24px', fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Ticket Ref & Date</th>
              <th style={{ padding: '18px 24px', fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Property & Unit</th>
              <th style={{ padding: '18px 24px', fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Issue Category & Title</th>
              <th style={{ padding: '18px 24px', fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Priority</th>
              <th style={{ padding: '18px 24px', fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Contractor / Technician</th>
              <th style={{ padding: '18px 24px', fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Est. Cost</th>
              <th style={{ padding: '18px 24px', fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Status & Dispatch</th>
            </tr>
          </thead>
          <tbody>
            {filteredRequests.map((req, idx) => (
              <motion.tr 
                key={req.id} 
                variants={itemVariants}
                style={{ borderBottom: '1px solid var(--border-dark)', transition: 'background 0.2s', background: idx % 2 === 0 ? 'white' : '#fcfdfd' }}
              >
                <td style={{ padding: '18px 24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: req.priority === 'Urgent' ? '#fef2f2' : req.priority === 'High' ? '#fffbeb' : '#e0e7ff', color: req.priority === 'Urgent' ? '#ef4444' : req.priority === 'High' ? '#d97706' : '#4338ca', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', flexShrink: 0 }}>
                      <HardHat size={18} />
                    </div>
                    <div>
                      <span style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-main)', display: 'block', cursor: 'pointer' }} onClick={() => setSelectedTicket(req)}>{req.id}</span>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>{req.date}</span>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '18px 24px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-main)' }}>{req.property}</span>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Building size={12} /> {req.unit}
                    </span>
                  </div>
                </td>
                <td style={{ padding: '18px 24px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                      <span style={{ fontSize: '11px', padding: '2px 8px', background: '#f1f5f9', borderRadius: '6px', fontWeight: '800', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{req.category}</span>
                    </div>
                    <span style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-main)', display: 'block' }}>{req.title}</span>
                  </div>
                </td>
                <td style={{ padding: '18px 24px' }}>
                  <span style={{ 
                    padding: '6px 12px', 
                    borderRadius: '20px', 
                    fontSize: '11px', 
                    fontWeight: '800',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    backgroundColor: req.priority === 'Urgent' ? '#fef2f2' : req.priority === 'High' ? '#fffbeb' : '#f0fdf4',
                    color: req.priority === 'Urgent' ? '#ef4444' : req.priority === 'High' ? '#d97706' : '#10b981',
                    border: req.priority === 'Urgent' ? '1px solid #ef444430' : req.priority === 'High' ? '1px solid #d9770630' : '1px solid #10b98130',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    {req.priority === 'Urgent' && <AlertTriangle size={12} />}
                    {req.priority}
                  </span>
                </td>
                <td style={{ padding: '18px 24px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-main)' }}>{req.assignedTo}</span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600', marginTop: '2px' }}>Logged by {req.loggedBy}</span>
                  </div>
                </td>
                <td style={{ padding: '18px 24px', fontSize: '15px', fontWeight: '800', color: 'var(--primary)' }}>
                  {req.formattedCost}
                </td>
                <td style={{ padding: '18px 24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <select
                      value={req.status}
                      onChange={(e) => handleStatusUpdate(req.id, e.target.value)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '10px',
                        fontSize: '12px',
                        fontWeight: '800',
                        backgroundColor: req.status === 'Completed' ? '#ecfdf5' : req.status === 'In Progress' ? '#e0e7ff' : '#fffbeb',
                        color: req.status === 'Completed' ? '#10b981' : req.status === 'In Progress' ? '#4338ca' : '#d97706',
                        border: '1px solid var(--border-dark)',
                        cursor: 'pointer',
                        outline: 'none'
                      }}
                    >
                      <option value="Pending Approval">Pending Approval</option>
                      <option value="Assigned">Assigned</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                    <button
                      onClick={() => setSelectedTicket(req)}
                      title="Inspect Work Order"
                      style={{ padding: '6px 10px', borderRadius: '10px', background: '#f1f5f9', border: '1px solid var(--border-dark)', cursor: 'pointer', color: '#334155' }}
                    >
                      <ArrowUpRight size={16} />
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}

            {filteredRequests.length === 0 && (
              <tr>
                <td colSpan="7" style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)', fontWeight: '600', fontSize: '14px' }}>
                  No maintenance work orders match the current filter criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Log New Repair Request Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              style={{ background: 'white', padding: '40px', borderRadius: '28px', width: '640px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                  <h3 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-main)' }}>Log New Repair Order</h3>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '500', marginTop: '4px' }}>Dispatch contractor technician and allocate estimated repair budget</p>
                </div>
                <button onClick={() => setShowAddModal(false)} style={{ background: '#f1f5f9', border: 'none', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', cursor: 'pointer' }}>
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleAddRequest} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Target Facility / Property</label>
                    <select 
                      value={selectedModalProperty} 
                      onChange={(e) => setSelectedModalProperty(e.target.value)} 
                      required 
                      style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-dark)', fontSize: '14px', fontWeight: '700', background: '#f8fafc', cursor: 'pointer', outline: 'none' }}
                    >
                      {availableProps.map(pName => (
                        <option key={pName} value={pName}>{pName}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Specific Unit / Zone</label>
                    <select 
                      value={selectedModalUnit} 
                      onChange={(e) => setSelectedModalUnit(e.target.value)} 
                      required 
                      style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-dark)', fontSize: '14px', fontWeight: '700', background: '#f8fafc', cursor: 'pointer', outline: 'none' }}
                    >
                      {availableUnitsForProperty.map(u => (
                        <option key={u.id} value={u.id}>Unit {u.id} ({u.type || 'Rental Unit'})</option>
                      ))}
                      {(selectedModalProperty.includes('Standalone') || selectedModalProperty.includes('Independent')) && (
                        <option value="Entire Standalone Villa Premises">Entire Standalone Villa Premises</option>
                      )}
                      <option value="🏛️ Common Area / Main Foyer">🏛️ Common Area / Main Foyer</option>
                      <option value="🚗 Basement Parking / Driveway">🚗 Basement Parking / Driveway</option>
                      <option value="💧 Main Water Pump / Polytank Line">💧 Main Water Pump / Polytank Line</option>
                      <option value="⚡ Generator / Electrical Switchboard">⚡ Generator / Electrical Switchboard</option>
                      <option value="🚪 Security Gatehouse / Perimeter Wall">🚪 Security Gatehouse / Perimeter Wall</option>
                      <option value="🏊 Poolside / Recreation Deck">🏊 Poolside / Recreation Deck</option>
                      <option value="CUSTOM_ZONE">🔧 Custom / Unlisted Zone...</option>
                    </select>
                  </div>
                </div>

                {selectedModalUnit === 'CUSTOM_ZONE' && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                    <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--primary)', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Specify Custom Zone / Standalone Area</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Roof Solar Panels, Rear Garden, Guardhouse" 
                      value={customUnitInput} 
                      onChange={(e) => setCustomUnitInput(e.target.value)} 
                      required 
                      style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '2px solid var(--primary)', fontSize: '14px', fontWeight: '700', background: 'white', outline: 'none', boxSizing: 'border-box' }} 
                    />
                  </motion.div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Maintenance Category</label>
                    <select name="category" required style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-dark)', fontSize: '14px', fontWeight: '700', background: '#f8fafc' }}>
                      <option value="Plumbing">Plumbing & Sanitation</option>
                      <option value="HVAC">HVAC & Air Conditioning</option>
                      <option value="Electrical">Electrical & Lighting</option>
                      <option value="Elevator">Elevator & Mechanical</option>
                      <option value="Security Systems">Security, CCTV & Access</option>
                      <option value="Carpentry / Structural">Carpentry & Structural</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Severity Priority</label>
                    <select name="priority" required style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-dark)', fontSize: '14px', fontWeight: '800', background: '#f8fafc', color: 'var(--primary)' }}>
                      <option value="Low">Low Priority</option>
                      <option value="Medium">Medium Priority</option>
                      <option value="High">High Priority</option>
                      <option value="Urgent">Urgent / Emergency Dispatch</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Issue Summary & Description</label>
                  <input name="title" type="text" placeholder="e.g. Main Water Line Burst & Pressure Drop" required style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-dark)', fontSize: '14px', fontWeight: '700', background: '#f8fafc' }} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Assigned Contractor / Tech</label>
                    <input name="assignedTo" type="text" placeholder="e.g. QuickFix Plumbing Engineers" required style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-dark)', fontSize: '14px', fontWeight: '500', background: '#f8fafc' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Estimated Repair Cost (₵)</label>
                    <input name="estCost" type="number" placeholder="3500" required style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-dark)', fontSize: '16px', fontWeight: '800', background: '#f8fafc', color: 'var(--primary)' }} />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Repair Instructions & Access Terms</label>
                  <textarea name="notes" rows="3" placeholder="Enter emergency access codes, warranty details, or specific replacement parts needed..." style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-dark)', fontSize: '14px', fontWeight: '500', background: '#f8fafc' }}></textarea>
                </div>

                <button type="submit" style={{ backgroundColor: 'var(--primary)', color: 'white', border: 'none', padding: '16px', borderRadius: '14px', fontSize: '15px', fontWeight: '800', marginTop: '12px', cursor: 'pointer', boxShadow: '0 10px 20px -5px rgba(0, 135, 90, 0.4)', transition: 'all 0.2s' }}>
                  Dispatch Work Order & Alert Contractor
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Inspect Ticket Details Modal */}
      <AnimatePresence>
        {selectedTicket && (
          <div className="print-modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <motion.div 
              className="print-modal-content workorder-print-area"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              style={{ background: 'white', padding: '40px', borderRadius: '28px', width: '640px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', borderBottom: '1px solid var(--border-dark)', paddingBottom: '20px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <span style={{ padding: '4px 10px', borderRadius: '20px', backgroundColor: 'var(--primary-glow)', color: 'var(--primary)', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase' }}>
                      Official Work Order • {selectedTicket.id}
                    </span>
                    <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)' }}>• Category: {selectedTicket.category}</span>
                  </div>
                  <h3 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-main)' }}>{selectedTicket.title}</h3>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '600', marginTop: '4px' }}>{selectedTicket.property} • {selectedTicket.unit}</p>
                </div>
                <button className="no-print" onClick={() => setSelectedTicket(null)} style={{ background: '#f1f5f9', border: 'none', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', cursor: 'pointer' }}>
                  <X size={20} />
                </button>
              </div>

              {/* Status & Priority Banner */}
              <div style={{ padding: '24px', background: '#f8fafc', border: '1px solid var(--border-dark)', borderRadius: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
                <div>
                  <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Estimated Budget Allocation</span>
                  <h2 style={{ fontSize: '32px', fontWeight: '900', color: 'var(--primary)', marginTop: '4px' }}>
                    {selectedTicket.formattedCost}
                  </h2>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
                  <span style={{ 
                    padding: '6px 16px', 
                    borderRadius: '20px', 
                    fontSize: '13px', 
                    fontWeight: '800',
                    backgroundColor: selectedTicket.status === 'Completed' ? '#10b981' : selectedTicket.status === 'In Progress' ? '#4338ca' : '#f59e0b',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    {selectedTicket.status}
                  </span>
                  <span style={{ fontSize: '12px', fontWeight: '800', color: selectedTicket.priority === 'Urgent' ? '#ef4444' : '#d97706' }}>
                    Priority: {selectedTicket.priority}
                  </span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '28px' }}>
                <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '16px', border: '1px solid var(--border-dark)' }}>
                  <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Assigned Contractor</span>
                  <span style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-main)', display: 'block' }}>{selectedTicket.assignedTo}</span>
                </div>
                <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '16px', border: '1px solid var(--border-dark)' }}>
                  <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Logged By Officer</span>
                  <span style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-main)', display: 'block' }}>{selectedTicket.loggedBy}</span>
                </div>
              </div>

              <div style={{ padding: '20px', background: '#f8fafc', borderRadius: '20px', border: '1px solid var(--border-dark)', marginBottom: '32px' }}>
                <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Repair Notes & Dispatch Logs</span>
                <p style={{ fontSize: '14px', color: 'var(--text-main)', fontWeight: '500', lineHeight: '1.6' }}>
                  {selectedTicket.notes}
                </p>
                <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-dark)', display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-muted)', fontWeight: '700' }}>
                  <span>Dispatch Date: {selectedTicket.date}</span>
                  <span>System Audit Verified</span>
                </div>
              </div>

              <div className="no-print" style={{ display: 'flex', gap: '16px' }}>
                <button
                  disabled={isGeneratingPdf}
                  onClick={handleExportPdf}
                  style={{ flex: 1, padding: '16px', borderRadius: '16px', border: '1px solid var(--border-dark)', background: '#f1f5f9', color: '#334155', fontWeight: '800', fontSize: '15px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: '0.2s', opacity: isGeneratingPdf ? 0.7 : 1 }}
                >
                  <FileText size={18} /> {isGeneratingPdf ? 'Generating Real PDF...' : 'Download Real PDF'}
                </button>
                <button
                  onClick={() => setSelectedTicket(null)}
                  style={{ flex: 1, padding: '16px', borderRadius: '16px', border: 'none', background: 'var(--primary)', color: 'white', fontWeight: '800', fontSize: '15px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: '0.2s', boxShadow: '0 10px 20px -5px rgba(0, 135, 90, 0.4)' }}
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

export default Maintenance;
