import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Folder, FileText, Download, Eye, Trash2, Plus, Search, Filter, 
  CheckCircle2, AlertCircle, ShieldCheck, HardHat, FileCode, Archive, 
  UploadCloud, FileSpreadsheet, Lock, X, RefreshCw, Key
} from 'lucide-react';
import { getStoredVaultDocuments, saveStoredVaultDocuments, getStoredRoles, resolveRoleName } from '../lib/masterData';

const Documents = () => {
  const [documents, setDocuments] = useState(() => {
    return getStoredVaultDocuments();
  });

  const [userProfile, setUserProfile] = useState(() => {
    const saved = localStorage.getItem('realtyos_user_profile');
    let parsed = null;
    if (saved) {
      try { parsed = JSON.parse(saved); } catch(e) {}
    }
    return {
      name: parsed?.name || 'Louis Kemenyo',
      role: parsed?.role || 'Portfolio Director'
    };
  });

  // Sync state when coming back from other modules or periodically
  useEffect(() => {
    const handleStorageChange = () => {
      setDocuments(getStoredVaultDocuments());
    };
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('realtyos_docs_update', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('realtyos_docs_update', handleStorageChange);
    };
  }, []);

  const saveDocuments = (updated) => {
    setDocuments(updated);
    saveStoredVaultDocuments(updated);
  };

  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  const handleDelete = (id, name) => {
    if (window.confirm(`Are you certain you wish to archive document: ${name}?`)) {
      const updated = documents.filter(d => d.id !== id);
      saveDocuments(updated);
      setSuccessMsg(`Document ${name} has been securely archived.`);
      setTimeout(() => setSuccessMsg(''), 4000);
    }
  };

  const handleUploadDoc = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const fileName = formData.get('fileName');
    const ext = fileName.split('.').pop().toUpperCase() || 'PDF';

    const newDoc = {
      id: `DOC-${100 + documents.length + 1}`,
      name: fileName.includes('.') ? fileName : `${fileName}.pdf`,
      category: formData.get('category'),
      property: formData.get('property'),
      unit: formData.get('unit') || 'General Suite',
      type: ext.length > 4 ? 'PDF' : ext,
      size: `${(Math.random() * 8 + 1).toFixed(1)} MB`,
      uploadedBy: formData.get('uploadedBy') || 'Louis Kemenyo',
      date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      security: formData.get('security'),
      status: 'Verified Legal Doc',
      summary: formData.get('summary') || 'No document summary provided.'
    };

    const updated = [newDoc, ...documents];
    saveDocuments(updated);
    setShowAddModal(false);
    setSuccessMsg(`Successfully uploaded encrypted document ${newDoc.name} to vault!`);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const filteredDocs = useMemo(() => {
    const roles = getStoredRoles();
    const roleDef = roles.find(r => r.name.toLowerCase() === resolveRoleName(userProfile.role || '').toLowerCase());
    const hasOmniView = roleDef && roleDef.permissions && (
      roleDef.permissions.includes('Executive Dashboard & Analytics') || 
      roleDef.permissions.includes('System Parameters & RBAC Admin') || 
      roleDef.permissions.includes('HR Staff Directory & Payroll Runs')
    );

    return documents.filter(d => {
      // Document Clearance Privacy Check
      if (!hasOmniView && (d.security.includes('Level 3') || d.security.includes('Level 4'))) {
        return false;
      }

      const matchesSearch = d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            d.property.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            d.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            d.summary.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === 'all' || d.category.toLowerCase() === filterCategory.toLowerCase();
      return matchesSearch && matchesCategory;
    });
  }, [documents, searchTerm, filterCategory, userProfile.role]);

  const metrics = useMemo(() => {
    const totalCount = documents.length;
    const totalSize = documents.reduce((acc, d) => acc + parseFloat(d.size), 0).toFixed(1);
    const classifiedCount = documents.filter(d => d.security.includes('Level 3') || d.security.includes('Level 4')).length;
    return { totalCount, totalSize, classifiedCount };
  }, [documents]);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  };

  const getFileIcon = (type) => {
    switch(type) {
      case 'PDF': return <FileText size={24} style={{ color: '#ef4444' }} />;
      case 'DOCX': return <FileCode size={24} style={{ color: '#3b82f6' }} />;
      case 'XLSX': return <FileSpreadsheet size={24} style={{ color: '#10b981' }} />;
      case 'ZIP': return <Archive size={24} style={{ color: '#f59e0b' }} />;
      default: return <FileText size={24} style={{ color: '#64748b' }} />;
    }
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
              <Lock size={12} /> AES-256 Encrypted Legal Vault
            </span>
          </div>
          <h2 style={{ fontSize: '28px', fontWeight: '800', letterSpacing: '-0.5px', color: 'var(--text-main)' }}>Enterprise Document Library</h2>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: '500', marginTop: '2px' }}>
            Secure repository for title deeds, master lease contracts, CAD architectural blueprints, and compliance audits.
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
            <UploadCloud size={20} /> Upload New Document
          </motion.button>
        </div>
      </header>

      {/* Executive Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', width: '100%' }}>
        <div className="glass-card-premium" style={{ padding: '24px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: '#e0e7ff', color: '#4338ca', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Folder size={28} />
          </div>
          <div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Vault Documents</p>
            <h3 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-main)', marginTop: '4px' }}>
              {metrics.totalCount} Files
            </h3>
            <span style={{ fontSize: '12px', color: '#4338ca', fontWeight: '700' }}>Indexed across 5 properties</span>
          </div>
        </div>

        <div className="glass-card-premium" style={{ padding: '24px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: '#ecfdf5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShieldCheck size={28} />
          </div>
          <div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Storage Footprint</p>
            <h3 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-main)', marginTop: '4px' }}>
              {metrics.totalSize} MB
            </h3>
            <span style={{ fontSize: '12px', color: '#10b981', fontWeight: '700' }}>Of 100 GB Cloud Limit</span>
          </div>
        </div>

        <div className="glass-card-premium" style={{ padding: '24px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: '#fffbeb', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Lock size={28} />
          </div>
          <div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Highly Restricted</p>
            <h3 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-main)', marginTop: '4px' }}>
              {metrics.classifiedCount} Classified
            </h3>
            <span style={{ fontSize: '12px', color: '#d97706', fontWeight: '700' }}>Level 3/4 Clearance only</span>
          </div>
        </div>

        <div className="glass-card-premium" style={{ padding: '24px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: '#fef2f2', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Key size={28} />
          </div>
          <div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Encryption standard</p>
            <h3 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-main)', marginTop: '4px' }}>
              AES-256 bit
            </h3>
            <span style={{ fontSize: '12px', color: '#ef4444', fontWeight: '700' }}>Zero-knowledge architecture</span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', background: 'white', padding: '16px 24px', borderRadius: '20px', border: '1px solid var(--border-dark)', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.03)', width: '100%' }}>
        <div style={{ position: 'relative', width: '100%', maxWidth: '380px' }}>
          <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Search documents by name, summary, or property..."
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
          {/* Category Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Filter size={16} /> Category:
            </span>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              style={{ padding: '10px 16px', borderRadius: '12px', border: '1px solid var(--border-dark)', fontSize: '13px', fontWeight: '700', background: '#f8fafc', color: 'var(--text-main)', cursor: 'pointer' }}
            >
              <option value="all">All Categories</option>
              <option value="Contracts & Leases">Contracts & Leases</option>
              <option value="Blueprints & Schematics">Blueprints & Schematics</option>
              <option value="Permits & Certificates">Permits & Certificates</option>
              <option value="Deeds & Ownership">Deeds & Ownership</option>
              <option value="Vendor Agreements">Vendor Agreements</option>
              <option value="Financial Records">Financial Records</option>
              <option value="Media & Inspections">Media & Inspections</option>
            </select>
          </div>
        </div>
      </div>

      {/* Document List / Data Table */}
      <div className="glass-card-premium" style={{ padding: '0', overflowX: 'auto', borderRadius: '24px', width: '100%', border: '1px solid var(--border-dark)', boxShadow: '0 25px 50px -20px rgba(0,0,0,0.05)' }}>
        <table style={{ width: '100%', minWidth: '950px', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border-dark)' }}>
              <th style={{ padding: '18px 24px', fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>File Name & Type</th>
              <th style={{ padding: '18px 24px', fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Category & Security Clearance</th>
              <th style={{ padding: '18px 24px', fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Property Allocation</th>
              <th style={{ padding: '18px 24px', fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Size & Timestamp</th>
              <th style={{ padding: '18px 24px', fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Verification Status</th>
              <th style={{ padding: '18px 24px', fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredDocs.map((doc, idx) => (
              <motion.tr 
                key={doc.id} 
                variants={itemVariants}
                style={{ borderBottom: '1px solid var(--border-dark)', transition: 'background 0.2s', background: idx % 2 === 0 ? 'white' : '#fcfdfd' }}
              >
                <td style={{ padding: '18px 24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#f8fafc', border: '1px solid var(--border-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {getFileIcon(doc.type)}
                    </div>
                    <div>
                      <span style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-main)', display: 'block', cursor: 'pointer', wordBreak: 'break-all' }} onClick={() => setSelectedDoc(doc)}>{doc.name}</span>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{doc.id} • {doc.type} format</span>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '18px 24px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-main)' }}>{doc.category}</span>
                    <span style={{ fontSize: '12px', color: doc.security.includes('Level 4') ? '#ef4444' : doc.security.includes('Level 3') ? '#d97706' : 'var(--primary)', fontWeight: '700', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Lock size={12} /> {doc.security}
                    </span>
                  </div>
                </td>
                <td style={{ padding: '18px 24px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-main)' }}>{doc.property}</span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600' }}>Unit: {doc.unit}</span>
                  </div>
                </td>
                <td style={{ padding: '18px 24px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-main)' }}>{doc.size}</span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600' }}>{doc.date}</span>
                  </div>
                </td>
                <td style={{ padding: '18px 24px' }}>
                  <span style={{ 
                    padding: '6px 12px', 
                    borderRadius: '20px', 
                    fontSize: '11px', 
                    fontWeight: '800',
                    backgroundColor: '#ecfdf5',
                    color: '#10b981',
                    border: '1px solid #10b98130',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <ShieldCheck size={14} />
                    {doc.status}
                  </span>
                </td>
                <td style={{ padding: '18px 24px', textAlign: 'right' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                    <button
                      onClick={() => setSelectedDoc(doc)}
                      title="Inspect Vault Meta"
                      style={{ padding: '8px 12px', borderRadius: '10px', background: '#f8fafc', border: '1px solid var(--border-dark)', cursor: 'pointer', color: '#334155', fontSize: '12px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <Eye size={14} /> Preview
                    </button>
                    <button
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = 'data:text/plain;charset=utf-8,DummyEncryptedBlobData';
                        link.download = doc.name;
                        document.body.appendChild(link);
                        link.click();
                        link.remove();
                        setSuccessMsg(`Securely downloaded ${doc.name}`);
                        setTimeout(() => setSuccessMsg(''), 3000);
                      }}
                      title="Secure Download"
                      style={{ padding: '8px 12px', borderRadius: '10px', background: 'var(--primary)', border: 'none', cursor: 'pointer', color: 'white', fontSize: '12px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 4px 10px rgba(0, 135, 90, 0.2)' }}
                    >
                      <Download size={14} /> Get File
                    </button>
                    <button
                      onClick={() => handleDelete(doc.id, doc.name)}
                      title="Archive Document"
                      style={{ padding: '8px 10px', borderRadius: '10px', background: '#fef2f2', border: '1px solid #fca5a5', cursor: 'pointer', color: '#ef4444' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}

            {filteredDocs.length === 0 && (
              <tr>
                <td colSpan="6" style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)', fontWeight: '600', fontSize: '14px' }}>
                  No documents match the active search or category filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Upload New Document Modal */}
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
                  <h3 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-main)' }}>Upload New Document</h3>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '500', marginTop: '4px' }}>Encrypt and index file into AES-256 cloud repository</p>
                </div>
                <button onClick={() => setShowAddModal(false)} style={{ background: '#f1f5f9', border: 'none', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', cursor: 'pointer' }}>
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleUploadDoc} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Complete File Name</label>
                  <input name="fileName" type="text" placeholder="e.g. Master_Lease_Agreement_Unit_302.pdf" required style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-dark)', fontSize: '14px', fontWeight: '700', background: '#f8fafc' }} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Document Category</label>
                    <select name="category" required style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-dark)', fontSize: '14px', fontWeight: '700', background: '#f8fafc' }}>
                      <option value="Contracts & Leases">Contracts & Leases</option>
                      <option value="Blueprints & Schematics">Blueprints & Schematics</option>
                      <option value="Permits & Certificates">Permits & Certificates</option>
                      <option value="Deeds & Ownership">Deeds & Ownership</option>
                      <option value="Vendor Agreements">Vendor Agreements</option>
                      <option value="Financial Records">Financial Records</option>
                      <option value="Media & Inspections">Media & Inspections</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Security Clearance Level</label>
                    <select name="security" required style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-dark)', fontSize: '14px', fontWeight: '800', background: '#f8fafc', color: 'var(--primary)' }}>
                      <option value="Public Audit (Level 1)">Public Audit (Level 1)</option>
                      <option value="Classified (Level 2)">Classified (Level 2)</option>
                      <option value="Confidential (Level 3)">Confidential (Level 3)</option>
                      <option value="Highly Confidential (Level 4)">Highly Confidential (Level 4)</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Associated Property Scope</label>
                    <select name="property" required style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-dark)', fontSize: '14px', fontWeight: '700', background: '#f8fafc' }}>
                      <option value="Sunset Luxury Apartments">Sunset Luxury Apartments</option>
                      <option value="The Apex Commercial Tower">The Apex Commercial Tower</option>
                      <option value="Green Valley Estate">Green Valley Estate</option>
                      <option value="Palm Breeze Residences">Palm Breeze Residences</option>
                      <option value="Portfolio General HQ">Portfolio General HQ</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Specific Unit / Zone</label>
                    <input name="unit" type="text" placeholder="e.g. Unit 302 or All Floors" style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-dark)', fontSize: '14px', fontWeight: '500', background: '#f8fafc' }} />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Uploading Officer / Auditor</label>
                  <input name="uploadedBy" type="text" placeholder="e.g. Sarah Miller or Louis K." required style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-dark)', fontSize: '14px', fontWeight: '700', background: '#f8fafc' }} />
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Document Summary & Legal Context</label>
                  <textarea name="summary" rows="3" placeholder="Provide brief summary of contract terms, blueprint revisions, or permit validation dates..." style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-dark)', fontSize: '14px', fontWeight: '500', background: '#f8fafc' }}></textarea>
                </div>

                <div style={{ border: '2px dashed #cbd5e1', padding: '24px', borderRadius: '16px', textAlign: 'center', background: '#f8fafc', cursor: 'pointer' }}>
                  <UploadCloud size={32} style={{ color: 'var(--primary)', margin: '0 auto 8px' }} />
                  <span style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-main)', display: 'block' }}>Click or drag file to attach encrypted blob</span>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>Supports PDF, DOCX, XLSX, CAD ZIP (Max 100MB)</span>
                </div>

                <button type="submit" style={{ backgroundColor: 'var(--primary)', color: 'white', border: 'none', padding: '16px', borderRadius: '14px', fontSize: '15px', fontWeight: '800', marginTop: '12px', cursor: 'pointer', boxShadow: '0 10px 20px -5px rgba(0, 135, 90, 0.4)', transition: 'all 0.2s' }}>
                  Commit & Secure Document in Vault
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Preview Document Metadata Modal */}
      <AnimatePresence>
        {selectedDoc && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              style={{ background: 'white', padding: '40px', borderRadius: '28px', width: '640px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', borderBottom: '1px solid var(--border-dark)', paddingBottom: '20px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <span style={{ padding: '4px 10px', borderRadius: '20px', backgroundColor: 'var(--primary-glow)', color: 'var(--primary)', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase' }}>
                      Vault Item • {selectedDoc.id}
                    </span>
                    <span style={{ fontSize: '12px', fontWeight: '800', color: selectedDoc.security.includes('Level 4') ? '#ef4444' : 'var(--primary)', textTransform: 'uppercase' }}>• {selectedDoc.security}</span>
                  </div>
                  <h3 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-main)', wordBreak: 'break-all' }}>{selectedDoc.name}</h3>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '600', marginTop: '4px' }}>{selectedDoc.property} • {selectedDoc.unit}</p>
                </div>
                <button onClick={() => setSelectedDoc(null)} style={{ background: '#f1f5f9', border: 'none', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', cursor: 'pointer' }}>
                  <X size={20} />
                </button>
              </div>

              {/* Status Banner */}
              <div style={{ padding: '24px', background: '#f8fafc', border: '1px solid var(--border-dark)', borderRadius: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'white', border: '1px solid var(--border-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {getFileIcon(selectedDoc.type)}
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>File Type & Size</span>
                    <h4 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-main)', margin: 0 }}>{selectedDoc.type} Format ({selectedDoc.size})</h4>
                    <span style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: '700' }}>{selectedDoc.category}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-end' }}>
                  <span style={{ 
                    padding: '6px 16px', 
                    borderRadius: '20px', 
                    fontSize: '13px', 
                    fontWeight: '800',
                    backgroundColor: '#ecfdf5',
                    color: '#10b981',
                    border: '1px solid #10b98130',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <ShieldCheck size={16} /> {selectedDoc.status}
                  </span>
                  <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)' }}>
                    Uploaded: {selectedDoc.date}
                  </span>
                </div>
              </div>

              <div style={{ padding: '20px', background: '#f8fafc', borderRadius: '20px', border: '1px solid var(--border-dark)', marginBottom: '32px' }}>
                <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Document Summary & Audit Notes</span>
                <p style={{ fontSize: '14px', color: 'var(--text-main)', fontWeight: '500', lineHeight: '1.6' }}>
                  {selectedDoc.summary}
                </p>
                <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-dark)', display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-muted)', fontWeight: '700' }}>
                  <span>Auditor: {selectedDoc.uploadedBy}</span>
                  <span>AES-256 Cloud Encrypted</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px' }}>
                <button
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = 'data:text/plain;charset=utf-8,DummyEncryptedBlobData';
                    link.download = selectedDoc.name;
                    document.body.appendChild(link);
                    link.click();
                    link.remove();
                    setSuccessMsg(`Securely downloaded ${selectedDoc.name}`);
                    setSelectedDoc(null);
                    setTimeout(() => setSuccessMsg(''), 3000);
                  }}
                  style={{ flex: 1, padding: '16px', borderRadius: '16px', border: 'none', background: 'var(--primary)', color: 'white', fontWeight: '800', fontSize: '15px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: '0.2s', boxShadow: '0 10px 20px -5px rgba(0, 135, 90, 0.4)' }}
                >
                  <Download size={18} /> Secure File Download
                </button>
                <button
                  onClick={() => setSelectedDoc(null)}
                  style={{ padding: '16px 24px', borderRadius: '16px', border: '1px solid var(--border-dark)', background: '#f1f5f9', color: '#334155', fontWeight: '800', fontSize: '15px', cursor: 'pointer' }}
                >
                  Close Preview
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Documents;
