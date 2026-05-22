import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckSquare, CheckCircle2, Clock, Calendar, Users, Plus, Search, 
  Filter, AlertCircle, User, ArrowRight, Building, Play, X, Award, FileText, Key
} from 'lucide-react';
import { getStoredStaffTasks, saveStoredStaffTasks, getStoredStaffEmployees, getStoredRoles, resolveRoleName } from '../lib/masterData';

const Tasks = () => {
  const [tasks, setTasks] = useState(() => {
    return getStoredStaffTasks();
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
    const handleUpdate = () => {
      setTasks(getStoredStaffTasks());
    };
    window.addEventListener('storage', handleUpdate);
    window.addEventListener('realtyos_tasks_update', handleUpdate);
    return () => {
      window.removeEventListener('storage', handleUpdate);
      window.removeEventListener('realtyos_tasks_update', handleUpdate);
    };
  }, []);

  const saveTasks = (updated) => {
    setTasks(updated);
    saveStoredStaffTasks(updated);
  };

  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  const staffEmployees = useMemo(() => {
    return getStoredStaffEmployees();
  }, []);

  const handleStatusChange = (id, newStatus) => {
    const updated = tasks.map(t => t.id === id ? { ...t, status: newStatus, progress: newStatus === 'Completed' ? 100 : newStatus === 'In Progress' ? 50 : 0 } : t);
    saveTasks(updated);
    setSuccessMsg(`Task ${id} status updated to ${newStatus}.`);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleAddTask = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const employeeName = formData.get('assignedTo');
    const emp = staffEmployees.find(s => s.name === employeeName) || { role: 'Operations Staff' };

    const newTask = {
      id: `TSK-${9000 + tasks.length + 1}`,
      title: formData.get('title'),
      property: formData.get('property'),
      unit: formData.get('unit') || 'General Scope',
      assignedTo: employeeName,
      role: emp.role,
      dueDate: formData.get('dueDate'),
      priority: formData.get('priority'),
      status: 'Pending',
      progress: 0,
      description: formData.get('description') || 'No specific instructions provided.'
    };

    const updated = [newTask, ...tasks];
    saveTasks(updated);
    setShowAddModal(false);
    setSuccessMsg(`Task ${newTask.id} assigned to ${newTask.assignedTo}. Login access provisioned.`);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const filteredTasks = useMemo(() => {
    const roles = getStoredRoles();
    const roleDef = roles.find(r => r.name.toLowerCase() === resolveRoleName(userProfile.role || '').toLowerCase());
    const hasOmniView = roleDef && roleDef.permissions && (
      roleDef.permissions.includes('Executive Dashboard & Analytics') || 
      roleDef.permissions.includes('System Parameters & RBAC Admin') || 
      roleDef.permissions.includes('HR Staff Directory & Payroll Runs')
    );

    return tasks.filter(t => {
      // Privacy Check: Hide unassigned tasks from low-level employees
      if (!hasOmniView && t.assignedTo.toLowerCase() !== userProfile.name.toLowerCase()) {
        return false;
      }

      const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            t.property.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            t.assignedTo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            t.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPriority = filterPriority === 'all' || t.priority.toLowerCase() === filterPriority.toLowerCase();
      const matchesStatus = filterStatus === 'all' || t.status.toLowerCase().includes(filterStatus.toLowerCase());
      return matchesSearch && matchesPriority && matchesStatus;
    });
  }, [tasks, searchTerm, filterPriority, filterStatus, userProfile.name, userProfile.role]);

  const metrics = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'Completed').length;
    const inProgress = tasks.filter(t => t.status === 'In Progress').length;
    const pending = tasks.filter(t => t.status === 'Pending').length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, inProgress, pending, completionRate };
  }, [tasks]);

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
              <CheckSquare size={12} /> Operations Dispatch & Staff Scheduling
            </span>
          </div>
          <h2 style={{ fontSize: '28px', fontWeight: '800', letterSpacing: '-0.5px', color: 'var(--text-main)' }}>Staff Task Management</h2>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: '500', marginTop: '2px' }}>
            Assign operational mandates to active employees. Assigned staff receive login credentials to update progress.
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
            <Plus size={20} /> Assign New Staff Task
          </motion.button>
        </div>
      </header>

      {/* Executive Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', width: '100%' }}>
        <div className="glass-card-premium" style={{ padding: '24px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: '#ecfdf5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Award size={28} />
          </div>
          <div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Team Completion Rate</p>
            <h3 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-main)', marginTop: '4px' }}>
              {metrics.completionRate}%
            </h3>
            <span style={{ fontSize: '12px', color: '#10b981', fontWeight: '700' }}>{metrics.completed} of {metrics.total} completed</span>
          </div>
        </div>

        <div className="glass-card-premium" style={{ padding: '24px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: '#e0e7ff', color: '#4338ca', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Clock size={28} />
          </div>
          <div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Active In Progress</p>
            <h3 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-main)', marginTop: '4px' }}>
              {metrics.inProgress} Tasks
            </h3>
            <span style={{ fontSize: '12px', color: '#4338ca', fontWeight: '700' }}>Currently underway</span>
          </div>
        </div>

        <div className="glass-card-premium" style={{ padding: '24px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: '#fffbeb', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Calendar size={28} />
          </div>
          <div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Pending Dispatch</p>
            <h3 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-main)', marginTop: '4px' }}>
              {metrics.pending} Tasks
            </h3>
            <span style={{ fontSize: '12px', color: '#d97706', fontWeight: '700' }}>Awaiting operator action</span>
          </div>
        </div>

        <div className="glass-card-premium" style={{ padding: '24px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: '#fef2f2', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Users size={28} />
          </div>
          <div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Active Staff Squad</p>
            <h3 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-main)', marginTop: '4px' }}>
              {staffEmployees.length} Personnel
            </h3>
            <span style={{ fontSize: '12px', color: '#ef4444', fontWeight: '700' }}>Provisioned login access</span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', background: 'white', padding: '16px 24px', borderRadius: '20px', border: '1px solid var(--border-dark)', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.03)', width: '100%' }}>
        <div style={{ position: 'relative', width: '100%', maxWidth: '380px' }}>
          <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Search tasks by title, assignee, or property..."
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
          {/* Priority Dropdown */}
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

          {/* Status Pillbox */}
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

      {/* Task List / Data Table */}
      <div className="glass-card-premium" style={{ padding: '0', overflowX: 'auto', borderRadius: '24px', width: '100%', border: '1px solid var(--border-dark)', boxShadow: '0 25px 50px -20px rgba(0,0,0,0.05)' }}>
        <table style={{ width: '100%', minWidth: '950px', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border-dark)' }}>
              <th style={{ padding: '18px 24px', fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Task ID & Priority</th>
              <th style={{ padding: '18px 24px', fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Task Title & Property Scope</th>
              <th style={{ padding: '18px 24px', fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Assigned Employee</th>
              <th style={{ padding: '18px 24px', fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Due Deadline</th>
              <th style={{ padding: '18px 24px', fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Progress Bar</th>
              <th style={{ padding: '18px 24px', fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', textAlign: 'right' }}>Workflow Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredTasks.map((tsk, idx) => (
              <motion.tr 
                key={tsk.id} 
                variants={itemVariants}
                style={{ borderBottom: '1px solid var(--border-dark)', transition: 'background 0.2s', background: idx % 2 === 0 ? 'white' : '#fcfdfd' }}
              >
                <td style={{ padding: '18px 24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: tsk.priority === 'Urgent' ? '#fef2f2' : tsk.priority === 'High' ? '#fffbeb' : '#e0e7ff', color: tsk.priority === 'Urgent' ? '#ef4444' : tsk.priority === 'High' ? '#d97706' : '#4338ca', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', flexShrink: 0 }}>
                      <CheckSquare size={18} />
                    </div>
                    <div>
                      <span style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-main)', display: 'block', cursor: 'pointer' }} onClick={() => setSelectedTask(tsk)}>{tsk.id}</span>
                      <span style={{ fontSize: '11px', fontWeight: '800', color: tsk.priority === 'Urgent' ? '#ef4444' : tsk.priority === 'High' ? '#d97706' : '#10b981', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{tsk.priority}</span>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '18px 24px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-main)' }}>{tsk.title}</span>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Building size={12} /> {tsk.property} • {tsk.unit}
                    </span>
                  </div>
                </td>
                <td style={{ padding: '18px 24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', overflow: 'hidden', border: '1px solid var(--border-dark)', flexShrink: 0 }}>
                      <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(tsk.assignedTo)}&background=f1f5f9&color=00875a`} alt={tsk.assignedTo} style={{ width: '100%', height: '100%' }} />
                    </div>
                    <div>
                      <span style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-main)', display: 'block' }}>{tsk.assignedTo}</span>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600' }}>{tsk.role}</span>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '18px 24px' }}>
                  <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Calendar size={14} style={{ color: 'var(--primary)' }} /> {tsk.dueDate}
                  </span>
                </td>
                <td style={{ padding: '18px 24px', width: '180px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)' }}>
                      <span>Progress</span>
                      <span>{tsk.progress}%</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${tsk.progress}%`, height: '100%', background: tsk.status === 'Completed' ? '#10b981' : tsk.status === 'In Progress' ? '#4338ca' : '#d97706', transition: 'width 0.4s ease' }}></div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '18px 24px', textAlign: 'right' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px' }}>
                    <select
                      value={tsk.status}
                      onChange={(e) => handleStatusChange(tsk.id, e.target.value)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '10px',
                        fontSize: '12px',
                        fontWeight: '800',
                        backgroundColor: tsk.status === 'Completed' ? '#ecfdf5' : tsk.status === 'In Progress' ? '#e0e7ff' : '#fffbeb',
                        color: tsk.status === 'Completed' ? '#10b981' : tsk.status === 'In Progress' ? '#4338ca' : '#d97706',
                        border: '1px solid var(--border-dark)',
                        cursor: 'pointer',
                        outline: 'none'
                      }}
                    >
                      <option value="Pending">Pending Start</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                    </select>
                    <button
                      onClick={() => setSelectedTask(tsk)}
                      title="View Instructions & Provisioned Access"
                      style={{ padding: '6px 10px', borderRadius: '10px', background: '#f1f5f9', border: '1px solid var(--border-dark)', cursor: 'pointer', color: '#334155' }}
                    >
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}

            {filteredTasks.length === 0 && (
              <tr>
                <td colSpan="6" style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)', fontWeight: '600', fontSize: '14px' }}>
                  No staff operations tasks match the current filter selection.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Assign New Task Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              style={{ background: 'white', padding: '40px', borderRadius: '28px', width: '640px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                  <h3 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-main)' }}>Assign New Staff Task</h3>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '500', marginTop: '4px' }}>Dispatch operations mandate and provision employee login credentials</p>
                </div>
                <button onClick={() => setShowAddModal(false)} style={{ background: '#f1f5f9', border: 'none', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', cursor: 'pointer' }}>
                  <X size={20} />
                </button>
              </div>

              {/* Login Credential Notice Notice */}
              <div style={{ padding: '16px 20px', background: '#ecfdf5', border: '1px solid #10b98140', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px' }}>
                <Key size={24} style={{ color: '#10b981', flexShrink: 0 }} />
                <div>
                  <span style={{ fontSize: '13px', fontWeight: '800', color: '#065f46', display: 'block' }}>Automatic Login Credential Provisioning</span>
                  <span style={{ fontSize: '12px', color: '#047857', fontWeight: '500' }}>Assigned employees receive secure login credentials via SMS/Email to access their personalized task workflow and update progress.</span>
                </div>
              </div>

              <form onSubmit={handleAddTask} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Task Title / Headline</label>
                  <input name="title" type="text" placeholder="e.g. Conduct Full Move-In Inspection & Key Handover" required style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-dark)', fontSize: '14px', fontWeight: '700', background: '#f8fafc' }} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Target Property Scope</label>
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
                    <input name="unit" type="text" placeholder="e.g. Penthouse B or All Floors" style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-dark)', fontSize: '14px', fontWeight: '500', background: '#f8fafc' }} />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Select Assigned Employee</label>
                  <select name="assignedTo" required style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-dark)', fontSize: '14px', fontWeight: '700', background: '#f8fafc' }}>
                    {staffEmployees.map(emp => (
                      <option key={emp.name} value={emp.name}>{emp.name} ({emp.role})</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Due Date Deadline</label>
                    <input name="dueDate" type="text" placeholder="e.g. 20 May 2026" required style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-dark)', fontSize: '14px', fontWeight: '700', background: '#f8fafc' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Priority Level</label>
                    <select name="priority" required style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-dark)', fontSize: '14px', fontWeight: '800', background: '#f8fafc', color: 'var(--primary)' }}>
                      <option value="Low">Low Priority</option>
                      <option value="Medium">Medium Priority</option>
                      <option value="High">High Priority</option>
                      <option value="Urgent">Urgent Action Required</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Detailed Task Instructions & Mandate</label>
                  <textarea name="description" rows="3" placeholder="Enter step-by-step instructions, inspection checklist items, or deliverables expected..." style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-dark)', fontSize: '14px', fontWeight: '500', background: '#f8fafc' }}></textarea>
                </div>

                <button type="submit" style={{ backgroundColor: 'var(--primary)', color: 'white', border: 'none', padding: '16px', borderRadius: '14px', fontSize: '15px', fontWeight: '800', marginTop: '12px', cursor: 'pointer', boxShadow: '0 10px 20px -5px rgba(0, 135, 90, 0.4)', transition: 'all 0.2s' }}>
                  Assign Task & Provision Employee Login Credentials
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Task Instruction Modal */}
      <AnimatePresence>
        {selectedTask && (
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
                      Operations Task • {selectedTask.id}
                    </span>
                    <span style={{ fontSize: '12px', fontWeight: '800', color: selectedTask.priority === 'Urgent' ? '#ef4444' : '#d97706', textTransform: 'uppercase' }}>• Priority: {selectedTask.priority}</span>
                  </div>
                  <h3 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-main)' }}>{selectedTask.title}</h3>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '600', marginTop: '4px' }}>{selectedTask.property} • {selectedTask.unit}</p>
                </div>
                <button onClick={() => setSelectedTask(null)} style={{ background: '#f1f5f9', border: 'none', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', cursor: 'pointer' }}>
                  <X size={20} />
                </button>
              </div>

              {/* Specialist & Status Banner */}
              <div style={{ padding: '24px', background: '#f8fafc', border: '1px solid var(--border-dark)', borderRadius: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', overflow: 'hidden', border: '2px solid var(--primary)' }}>
                    <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(selectedTask.assignedTo)}&background=fff&color=00875a`} alt={selectedTask.assignedTo} style={{ width: '100%', height: '100%' }} />
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Assigned Employee</span>
                    <h4 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-main)', margin: 0 }}>{selectedTask.assignedTo}</h4>
                    <span style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: '700' }}>{selectedTask.role}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-end' }}>
                  <span style={{ 
                    padding: '6px 16px', 
                    borderRadius: '20px', 
                    fontSize: '13px', 
                    fontWeight: '800',
                    backgroundColor: selectedTask.status === 'Completed' ? '#10b981' : selectedTask.status === 'In Progress' ? '#4338ca' : '#f59e0b',
                    color: 'white'
                  }}>
                    {selectedTask.status} ({selectedTask.progress}%)
                  </span>
                  <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={12} /> Due: {selectedTask.dueDate}
                  </span>
                </div>
              </div>

              {/* Login Provisioning Note */}
              <div style={{ padding: '14px 18px', background: '#f1f5f9', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
                <Key size={16} style={{ color: 'var(--primary)' }} />
                <span style={{ fontSize: '12px', fontWeight: '700', color: '#334155' }}>
                  Login Credentials Active: {selectedTask.assignedTo} has verified system access to update this task's status.
                </span>
              </div>

              <div style={{ padding: '20px', background: '#f8fafc', borderRadius: '20px', border: '1px solid var(--border-dark)', marginBottom: '32px' }}>
                <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Detailed Mandate & Execution Steps</span>
                <p style={{ fontSize: '14px', color: 'var(--text-main)', fontWeight: '500', lineHeight: '1.6' }}>
                  {selectedTask.description}
                </p>
              </div>

              <div style={{ display: 'flex', gap: '16px' }}>
                <button
                  onClick={() => {
                    handleStatusChange(selectedTask.id, selectedTask.status === 'Completed' ? 'In Progress' : 'Completed');
                    setSelectedTask(null);
                  }}
                  style={{ flex: 1, padding: '16px', borderRadius: '16px', border: '1px solid var(--border-dark)', background: '#ecfdf5', color: '#10b981', fontWeight: '800', fontSize: '15px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: '0.2s' }}
                >
                  <CheckCircle2 size={18} /> Toggle Complete Status
                </button>
                <button
                  onClick={() => setSelectedTask(null)}
                  style={{ flex: 1, padding: '16px', borderRadius: '16px', border: 'none', background: 'var(--primary)', color: 'white', fontWeight: '800', fontSize: '15px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: '0.2s', boxShadow: '0 10px 20px -5px rgba(0, 135, 90, 0.4)' }}
                >
                  Close Brief
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Tasks;
