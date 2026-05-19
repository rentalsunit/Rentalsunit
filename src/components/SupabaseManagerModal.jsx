import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Database, Cloud, CloudOff, RefreshCw, CheckCircle2, AlertTriangle, Copy, Check, ExternalLink, Terminal, HardDrive } from 'lucide-react';
import { testSupabaseConnection, getSupabaseMigrationSQL } from '../lib/supabaseSync';
import { initCloudSync } from '../lib/masterData';

const SupabaseManagerModal = ({ isOpen, onClose }) => {
  const [status, setStatus] = useState({ online: false, latency: 0, tables: {} });
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [seedSuccess, setSeedSuccess] = useState('');

  const runTest = async () => {
    setLoading(true);
    setSeedSuccess('');
    const res = await testSupabaseConnection();
    setStatus(res);
    setLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      runTest();
    }
  }, [isOpen]);

  const handleCopySQL = () => {
    const sql = getSupabaseMigrationSQL();
    navigator.clipboard.writeText(sql);
    setCopied(true);
    setTimeout(() => setCopied(false), 4000);
  };

  const handleForceSeed = async () => {
    setLoading(true);
    setSeedSuccess('');
    await initCloudSync();
    await runTest();
    setSeedSuccess('Cloud database successfully synced and seeded from local cache!');
    setTimeout(() => setSeedSuccess(''), 5000);
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(16px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2500, padding: '20px', boxSizing: 'border-box' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          style={{ background: '#ffffff', padding: '36px 44px', borderRadius: '32px', width: '880px', maxWidth: '95vw', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 30px 70px -15px rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.3)', display: 'flex', flexDirection: 'column', gap: '28px' }}
        >
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '18px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.4)' }}>
                <Database size={30} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '900', color: '#1e293b' }}>Supabase Cloud Database Connection</h2>
                  <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', background: status.online ? '#ecfdf5' : '#fef2f2', color: status.online ? '#10b981' : '#ef4444', border: `1px solid ${status.online ? '#a7f3d0' : '#fecaca'}`, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {status.online ? <Cloud size={14} /> : <CloudOff size={14} />}
                    {status.online ? `Online (${status.latency}ms)` : 'Offline / Setup Required'}
                  </span>
                </div>
                <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '600', display: 'block', marginTop: '4px' }}>
                  Project: <strong style={{ color: '#059669' }}>oshvcebnnuisjdmtwttd.supabase.co</strong>
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              style={{ background: '#f1f5f9', color: '#64748b', border: 'none', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: '0.2s', fontSize: '18px', fontWeight: '900' }}
            >
              ✕
            </button>
          </div>

          {/* Banner */}
          <div style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', color: 'white', borderRadius: '24px', padding: '28px', position: 'relative', overflow: 'hidden', boxShadow: '0 20px 40px -15px rgba(15,23,42,0.6)' }}>
            <div style={{ position: 'absolute', right: '-30px', bottom: '-30px', opacity: 0.1, color: '#10b981' }}>
              <Database size={240} />
            </div>
            <h3 style={{ margin: '0 0 8px', fontSize: '20px', fontWeight: '900', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Terminal size={22} style={{ color: '#10b981' }} /> Automatic Schema Setup & Cloud Sync
            </h3>
            <p style={{ margin: '0 0 20px', fontSize: '14px', color: '#94a3b8', lineHeight: 1.6, maxWidth: '650px' }}>
              Because your Supabase project is newly created, PostgreSQL tables must be initialized. If any table is missing, our system provides the exact SQL migration script to copy and run directly in your Supabase SQL Editor.
            </p>
            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
              <button
                onClick={handleCopySQL}
                style={{ background: copied ? '#10b981' : '#3b82f6', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '16px', fontWeight: '800', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: '0.2s', boxShadow: '0 10px 20px -5px rgba(59, 130, 246, 0.4)' }}
              >
                {copied ? <Check size={18} /> : <Copy size={18} />}
                {copied ? 'SQL DDL Script Copied to Clipboard!' : 'Copy PostgreSQL Migration DDL Script'}
              </button>
              <a
                href="https://oshvcebnnuisjdmtwttd.supabase.co"
                target="_blank"
                rel="noreferrer"
                style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', padding: '12px 24px', borderRadius: '16px', fontWeight: '800', fontSize: '14px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', transition: '0.2s' }}
              >
                Open Supabase Dashboard <ExternalLink size={16} />
              </a>
            </div>
          </div>

          {seedSuccess && (
            <div style={{ background: '#ecfdf5', border: '1px solid #10b981', color: '#047857', padding: '16px 24px', borderRadius: '20px', fontWeight: '800', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <CheckCircle2 size={20} style={{ color: '#10b981', flexShrink: 0 }} />
              {seedSuccess}
            </div>
          )}

          {/* Table List */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '900', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <HardDrive size={18} style={{ color: '#059669' }} /> PostgreSQL Table Synchronization Status
              </h4>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={handleForceSeed}
                  disabled={loading}
                  style={{ background: '#f8fafc', border: '1px solid #cbd5e1', color: '#1e293b', padding: '8px 16px', borderRadius: '14px', fontWeight: '800', fontSize: '13px', cursor: loading ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', gap: '6px', transition: '0.2s' }}
                >
                  <RefreshCw size={14} className={loading ? 'spinning' : ''} style={{ color: '#059669' }} /> Force Seed Cloud Database
                </button>
                <button
                  onClick={runTest}
                  disabled={loading}
                  style={{ background: '#10b981', border: 'none', color: 'white', padding: '8px 16px', borderRadius: '14px', fontWeight: '800', fontSize: '13px', cursor: loading ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', gap: '6px', transition: '0.2s' }}
                >
                  <RefreshCw size={14} className={loading ? 'spinning' : ''} /> Refresh Connection Ping
                </button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '16px' }}>
              {Object.entries(status.tables || {}).map(([tableName, info]) => (
                <div key={tableName} style={{ background: '#f8fafc', border: `1px solid ${info.exists ? '#cbd5e1' : '#fecaca'}`, borderRadius: '20px', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.02)' }}>
                  <div>
                    <span style={{ fontSize: '15px', fontWeight: '900', color: '#1e293b', display: 'block', margin: '0 0 4px' }}>
                      {tableName}
                    </span>
                    <span style={{ fontSize: '12px', color: info.exists ? '#64748b' : '#ef4444', fontWeight: '700', display: 'block' }}>
                      {info.exists ? `${info.count} active records verified` : '⚠️ Missing Table (Run SQL Migration)'}
                    </span>
                  </div>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: info.exists ? '#ecfdf5' : '#fef2f2', color: info.exists ? '#10b981' : '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${info.exists ? '#a7f3d0' : '#fecaca'}` }}>
                    {info.exists ? <CheckCircle2 size={22} /> : <AlertTriangle size={22} />}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default SupabaseManagerModal;
