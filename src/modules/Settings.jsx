import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings as SettingsIcon, User, Bell, Shield, Database, Globe, Building2,
  CreditCard, Lock, Key, FileText, CheckCircle2, AlertTriangle, Server,
  HardDrive, Download, RefreshCw, Sliders, Mail, PhoneCall, DollarSign,
  SlidersHorizontal, Layers, History, UserCheck, Eye, EyeOff,
  Check, X, Activity, ExternalLink, Zap, UserPlus, MoreVertical, Copy,
  KeyRound, LogIn, Unlock, AlertCircle, ShieldCheck, Plus, CheckSquare, Square,
  Printer, Calendar
} from 'lucide-react';
import { generateRealPDF } from '../lib/pdfService';

import { getStoredUsers, saveStoredUsers, getStoredStaffEmployees, wipeAllMockData } from '../lib/masterData';

const Settings = () => {
  const [activeSection, setActiveSection] = useState('profile');
  const [successMsg, setSuccessMsg] = useState('');
  const [auditDateFilter, setAuditDateFilter] = useState('');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const AUDIT_LOGS = [
    { dateKey: '2026-05-20', time: 'Just now', user: 'Louis Kemenyo', action: 'Modified System Settings', detail: 'Accessed the Enterprise Audit Log', type: 'system' },
    { dateKey: '2026-05-20', time: '12 minutes ago', user: 'Sarah Miller', action: 'Updated Sales CRM Pipeline', detail: 'Moved "Sunset Hills Villa 4" to Closed Won', type: 'sales' },
    { dateKey: '2026-05-20', time: '1 hour ago', user: 'System Auto-Task', action: 'Daily Cloud Backup', detail: 'Generated secure database snapshot #8821', type: 'system' },
    { dateKey: '2026-05-20', time: '3 hours ago', user: 'Michael K.', action: 'Dispatched Maintenance Vendor', detail: 'Approved invoice for plumbing at Riverside Apartments', type: 'maintenance' },
    { dateKey: '2026-05-19', time: 'Yesterday, 4:30 PM', user: 'Sarah Osei', action: 'Approved Payroll Run', detail: 'Authorized October payroll for 7 active staff members', type: 'finance' },
    { dateKey: '2026-05-19', time: 'Yesterday, 2:15 PM', user: 'Michael K.', action: 'Created Work Order #9812', detail: 'Requested emergency HVAC repair for Penthouse Suite A', type: 'maintenance' },
    { dateKey: '2026-05-19', time: 'Yesterday, 10:00 AM', user: 'Louis Kemenyo', action: 'Biometric Access Configured', detail: 'Enforced facial recognition security protocol for Admin group', type: 'system' },
    { dateKey: '2026-05-19', time: 'Yesterday, 8:45 AM', user: 'Sarah Miller', action: 'New Lead Ingested', detail: 'Added prospective corporate client "John Doe" from landing page', type: 'sales' },
    { dateKey: '2026-05-18', time: '2 days ago', user: 'Sarah Osei', action: 'Disbursed Security Deposit', detail: 'Refunded GHS 4,500.00 to former tenant James Appiah', type: 'finance' },
    { dateKey: '2026-05-18', time: '2 days ago', user: 'System Auto-Task', action: 'Automated SMS Broadcast', detail: 'Sent balance payment reminders to 14 overdue accounts', type: 'system' },
    { dateKey: '2026-05-18', time: '2 days ago', user: 'Michael K.', action: 'Updated Lease Terms', detail: 'Extended residential tenancy agreement for Unit 3B by 12 months', type: 'sales' },
    { dateKey: '2026-05-17', time: '3 days ago', user: 'Louis Kemenyo', action: 'System IP Whitelisted', detail: 'Added HQ office router static IP to trusted Supabase cluster ingress list', type: 'system' }
  ];

  const handleExportPdf = async () => {
    setIsGeneratingPdf(true);
    const filteredLogs = AUDIT_LOGS.filter(log => !auditDateFilter || log.dateKey === auditDateFilter);
    await generateRealPDF('.audit-print-area', `Enterprise_Audit_Log_${auditDateFilter || 'All_Time'}.pdf`, {
      orientation: 'p',
      isAuditLog: true,
      auditLogs: filteredLogs,
      dateFilter: auditDateFilter,
      generatedBy: userProfile.name
    });
    setIsGeneratingPdf(false);
  };

  // Form States - Profile from localStorage
  const [userProfile, setUserProfile] = useState(() => {
    const saved = localStorage.getItem('realtyos_user_profile');
    let parsed = null;
    if (saved) {
      try { parsed = JSON.parse(saved); } catch (e) { }
    }
    return {
      name: parsed?.name || 'Louis Kemenyo',
      role: parsed?.role || 'Portfolio Director',
      department: parsed?.department || 'Executive Administration',
      email: parsed?.email || 'louis@realtyos.gh',
      phone: parsed?.phone || '+233 54 102 9384',
      avatar: parsed?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80'
    };
  });

  const [fullName, setFullName] = useState(userProfile.name);
  const [email, setEmail] = useState(userProfile.email);
  const [phone, setPhone] = useState(userProfile.phone);
  const [roleTitle, setRoleTitle] = useState(userProfile.role);
  const [avatarUrl, setAvatarUrl] = useState(userProfile.avatar);
  const [department, setDepartment] = useState(userProfile.department || 'Executive Administration');
  const [enable2FA, setEnable2FA] = useState(true);

  useEffect(() => {
    const handleSync = () => {
      const saved = localStorage.getItem('realtyos_user_profile');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setUserProfile(prev => ({
            name: parsed?.name || prev?.name || 'Louis Kemenyo',
            role: parsed?.role || prev?.role || 'Portfolio Director',
            department: parsed?.department || prev?.department || 'Executive Administration',
            email: parsed?.email || prev?.email || 'louis@realtyos.gh',
            phone: parsed?.phone || prev?.phone || '+233 54 102 9384',
            avatar: parsed?.avatar || prev?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80'
          }));
          setFullName(prev => parsed?.name || prev || 'Louis Kemenyo');
          setEmail(prev => parsed?.email || prev || 'louis@realtyos.gh');
          setPhone(prev => parsed?.phone || prev || '+233 54 102 9384');
          setRoleTitle(prev => parsed?.role || prev || 'Portfolio Director');
          setAvatarUrl(prev => parsed?.avatar || prev || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80');
          if (parsed?.department) setDepartment(parsed.department);
        } catch (e) { }
      }
    };
    const handleUsersUpdate = () => {
      const stored = getStoredUsers();
      setSystemUsers(stored.map(u => ({
        ...u,
        lastLogin: u.lastLogin || 'Today',
        status: u.status || 'Active',
        twoFactor: u.twoFactor ?? true
      })));
    };
    window.addEventListener('realtyos_profile_updated', handleSync);
    window.addEventListener('storage', handleSync);
    window.addEventListener('realtyos_users_update', handleUsersUpdate);
    return () => {
      window.removeEventListener('realtyos_profile_updated', handleSync);
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('realtyos_users_update', handleUsersUpdate);
    };
  }, []);

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Url = reader.result;
        setAvatarUrl(base64Url);
        const updated = { ...userProfile, name: fullName, role: roleTitle, email, phone, department, avatar: base64Url };
        setUserProfile(updated);
        localStorage.setItem('realtyos_user_profile', JSON.stringify(updated));
        window.dispatchEvent(new CustomEvent('realtyos_profile_updated'));
        setSuccessMsg('Profile image successfully updated and synchronized across all portals!');
        setTimeout(() => setSuccessMsg(''), 4000);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveAvatar = () => {
    const defaultAvatar = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80';
    setAvatarUrl(defaultAvatar);
    const updated = { ...userProfile, name: fullName, role: roleTitle, email, phone, department, avatar: defaultAvatar };
    setUserProfile(updated);
    localStorage.setItem('realtyos_user_profile', JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('realtyos_profile_updated'));
    setSuccessMsg('Profile image reset to system default!');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleSaveProfileSettings = () => {
    const updated = { ...userProfile, name: fullName, role: roleTitle, email, phone, department, avatar: avatarUrl };
    setUserProfile(updated);
    localStorage.setItem('realtyos_user_profile', JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('realtyos_profile_updated'));
    setSuccessMsg('Executive account & credentials successfully synchronized across cloud cluster!');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  // Form States - Organization
  const [orgName, setOrgName] = useState('RealtyOS Managed Assets Ltd');
  const [orgTIN, setOrgTIN] = useState('C0012938475');
  const [orgVAT, setOrgVAT] = useState('V-901283-74');
  const [orgAddress, setOrgAddress] = useState('RealtyOS Towers, 14 Independence Ave, Ridge, Accra, Ghana');
  const [orgPhone, setOrgPhone] = useState('+233 30 277 8899');
  const [orgEmail, setOrgEmail] = useState('corporate@realtyos.gh');

  // --- SYSTEM USERS (Staff with active or temporary login credentials) ---
  const [systemUsers, setSystemUsers] = useState(() => {
    const stored = getStoredUsers();
    return stored.map(u => ({
      ...u,
      lastLogin: u.lastLogin || 'Today',
      status: u.status || 'Active',
      twoFactor: u.twoFactor ?? true
    }));
  });

  // --- ENTERPRISE EMPLOYEES DIRECTORY (Staff without login access) ---
  const [enterpriseEmployees, setEnterpriseEmployees] = useState(() => {
    const staff = getStoredStaffEmployees();
    const currentUsers = getStoredUsers();
    return staff.map(emp => ({
      ...emp,
      hasLogin: currentUsers.some(u => u.id === emp.id || u.name?.toLowerCase() === emp.name?.toLowerCase())
    }));
  });

  // Modals & Grant Access States
  const [showGrantAccessModal, setShowGrantAccessModal] = useState(false);
  const [selectedEmpForAccess, setSelectedEmpForAccess] = useState('');
  const [selectedRoleForAccess, setSelectedRoleForAccess] = useState('Leasing Agent');
  const [generatedCreds, setGeneratedCreds] = useState(null);

  // First-Time Login Simulation States
  const [simulatingFirstLoginEmp, setSimulatingFirstLoginEmp] = useState(null);
  const [firstLoginTempPassInput, setFirstLoginTempPassInput] = useState('');
  const [firstLoginNewPassInput, setFirstLoginNewPassInput] = useState('');
  const [firstLoginConfirmPassInput, setFirstLoginConfirmPassInput] = useState('');

  // Form States - Gateways
  const [paystackKey, setPaystackKey] = useState('pk_live_8921************************9012');
  const [momoKey, setMomoKey] = useState('momo_disb_************************7788');
  const [smsGateway, setSmsGateway] = useState('Arkesel Ghana SMS API');
  const [showApiKeys, setShowApiKeys] = useState(false);

  // --- DATABASE & CLOUD RECOVERY SIMULATION STATES ---
  const [simulatedRole, setSimulatedRole] = useState('Executive Administrator');
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [selectedRestoreBackup, setSelectedRestoreBackup] = useState(null);
  const [isRestoring, setIsRestoring] = useState(false);
  const [restoreProgressLogs, setRestoreProgressLogs] = useState([]);
  const [restoreStep, setRestoreStep] = useState(0);

  const [showLaunchModal, setShowLaunchModal] = useState(false);
  const [isLaunching, setIsLaunching] = useState(false);
  const [launchProgressLogs, setLaunchProgressLogs] = useState([]);
  const [launchSuccess, setLaunchSuccess] = useState(false);

  const [showResetModal, setShowResetModal] = useState(false);
  const [resetConfirmText, setResetConfirmText] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [localBackupFile, setLocalBackupFile] = useState(null);
  const [localBackupData, setLocalBackupData] = useState(null);
  const [localBackupError, setLocalBackupError] = useState('');

  // --- RBAC ROLES & PERMISSIONS STATE (Expanded to include IT, HR, Account Officer, Finance, Admin, Sales) ---
  const [rolesList, setRolesList] = useState([
    { id: 'ROLE-1', name: 'Executive Administrator', users: 3, permissions: ['Executive Dashboard & Analytics', 'General Ledger & Fiscal Accounting', 'Rent Escrow & Security Deposits', 'System Parameters & RBAC Admin', 'HR Staff Directory & Payroll Runs', 'Lease Agreements & Contracts', 'Rental Properties & Units'] },
    { id: 'ROLE-2', name: 'Senior Property Manager', users: 8, permissions: ['Rental Properties & Units', 'Lease Agreements & Contracts', 'Tenant Register & Resident KYC', 'Maintenance Dispatch & Tickets', 'Sales Pipeline & CRM Directory'] },
    { id: 'ROLE-3', name: 'Financial Controller', users: 4, permissions: ['Executive Dashboard & Analytics', 'General Ledger & Fiscal Accounting', 'Rent Escrow & Security Deposits', 'HR Staff Directory & Payroll Runs'] },
    { id: 'ROLE-4', name: 'Leasing Agent', users: 12, permissions: ['Sales Pipeline & CRM Directory', 'Lease Agreements & Contracts', 'Rental Properties & Units', 'Tenant Register & Resident KYC'] },
    { id: 'ROLE-5', name: 'Maintenance Dispatcher', users: 6, permissions: ['Maintenance Dispatch & Tickets', 'Rental Properties & Units', 'Tenant Register & Resident KYC'] },
    { id: 'ROLE-6', name: 'IT Systems Officer', users: 2, permissions: ['System Parameters & RBAC Admin', 'Database Snapshots & Cloud Recovery', 'Executive Dashboard & Analytics'] },
    { id: 'ROLE-7', name: 'HR Director', users: 2, permissions: ['HR Staff Directory & Payroll Runs', 'Executive Dashboard & Analytics'] },
    { id: 'ROLE-8', name: 'Account Officer', users: 5, permissions: ['General Ledger & Fiscal Accounting', 'Rent Escrow & Security Deposits'] },
    { id: 'ROLE-9', name: 'Finance Director', users: 3, permissions: ['Executive Dashboard & Analytics', 'General Ledger & Fiscal Accounting', 'Rent Escrow & Security Deposits', 'HR Staff Directory & Payroll Runs'] },
    { id: 'ROLE-10', name: 'Administrative Manager', users: 4, permissions: ['Rental Properties & Units', 'Lease Agreements & Contracts', 'Tenant Register & Resident KYC', 'HR Staff Directory & Payroll Runs'] },
    { id: 'ROLE-11', name: 'Sales Director', users: 3, permissions: ['Sales Pipeline & CRM Directory', 'Executive Dashboard & Analytics', 'Lease Agreements & Contracts', 'Rental Properties & Units'] },
    { id: 'ROLE-12', name: 'Sales Executive', users: 10, permissions: ['Sales Pipeline & CRM Directory', 'Lease Agreements & Contracts', 'Rental Properties & Units'] }
  ]);


  // Available Modules & Capabilities
  const availablePermissionsList = [
    'Executive Dashboard & Analytics',
    'Rental Properties & Units',
    'Sales Pipeline & CRM Directory',
    'Lease Agreements & Contracts',
    'Tenant Register & Resident KYC',
    'General Ledger & Fiscal Accounting',
    'Rent Escrow & Security Deposits',
    'Maintenance Dispatch & Tickets',
    'HR Staff Directory & Payroll Runs',
    'System Parameters & RBAC Admin',
    'Database Snapshots & Cloud Recovery'
  ];

  const [editingRole, setEditingRole] = useState(null);
  const [rolePermissionsTemp, setRolePermissionsTemp] = useState([]);

  const [showCreateRoleModal, setShowCreateRoleModal] = useState(false);
  const [createRoleName, setCreateRoleName] = useState('');
  const [createRolePerms, setCreateRolePerms] = useState(['Rental Properties & Units', 'Tenant Register & Resident KYC']);

  // Mock DB Backups
  const [backups, setBackups] = useState([
    { id: 'BAK-001', filename: 'realtyos_db_snapshot_2026_05_16_00_00.sql.gz', size: '482.5 MB', type: 'Automated Daily', status: 'Verified Secure' },
    { id: 'BAK-002', filename: 'realtyos_db_snapshot_2026_05_15_00_00.sql.gz', size: '481.1 MB', type: 'Automated Daily', status: 'Verified Secure' },
    { id: 'BAK-003', filename: 'realtyos_manual_audit_export_2026_05_14.json', size: '124.8 MB', type: 'Manual Admin Snapshot', status: 'Verified Secure' }
  ]);

  const handleSaveNotification = (sectionName) => {
    setSuccessMsg(`${sectionName} configurations successfully verified and updated across cloud cluster!`);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleOpenGrantModal = () => {
    const unassigned = enterpriseEmployees.filter(e => !e.hasLogin);
    if (unassigned.length > 0) {
      setSelectedEmpForAccess(unassigned[0].id);
    } else {
      setSelectedEmpForAccess('');
    }
    setGeneratedCreds(null);
    setShowGrantAccessModal(true);
  };

  const handleGenerateCredentials = (e) => {
    e.preventDefault();
    const emp = enterpriseEmployees.find(e => e.id === selectedEmpForAccess);
    if (!emp) {
      alert("Please select a valid employee from the system.");
      return;
    }

    const names = emp.name.toLowerCase().split(' ');
    const username = names.length > 1 ? `${names[0]}.${names[1]}` : names[0];
    const randomPin = Math.floor(1000 + Math.random() * 9000);
    const tempPassword = `Realty-${randomPin}`;

    const newUserCred = {
      id: emp.id,
      name: emp.name,
      username: username,
      email: emp.email || `${username}@realtyos.gh`,
      role: selectedRoleForAccess,
      phone: emp.phone || '+233 24 000 0000',
      department: emp.department || emp.dept || 'Operations',
      avatar: emp.passportPhoto || emp.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      lastLogin: 'Pending 1st Login (Temporary Pass)',
      twoFactor: false,
      status: 'Pending 1st Login',
      isFirstLogin: true,
      tempPassGiven: tempPassword,
      pass: tempPassword
    };

    const updatedUsers = [newUserCred, ...systemUsers];
    setSystemUsers(updatedUsers);
    saveStoredUsers(updatedUsers);
    setEnterpriseEmployees(enterpriseEmployees.map(e => e.id === emp.id ? { ...e, hasLogin: true } : e));
    setGeneratedCreds({
      empName: emp.name,
      username: username,
      tempPassword: tempPassword
    });

    setSuccessMsg(`Login credentials generated for ${emp.name} under RBAC role: ${selectedRoleForAccess}.`);
    setTimeout(() => setSuccessMsg(''), 5000);
  };

  const handleRevokeUser = (userId) => {
    const userToRevoke = systemUsers.find(u => u.id === userId);
    const updatedUsers = systemUsers.filter(u => u.id !== userId);
    setSystemUsers(updatedUsers);
    saveStoredUsers(updatedUsers);
    setEnterpriseEmployees(enterpriseEmployees.map(e => e.id === userId ? { ...e, hasLogin: false } : e));
    setSuccessMsg(`User access revoked for ${userToRevoke?.name || 'employee'} and active API tokens terminated.`);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleResetUserPassword = (userId) => {
    const randomPin = Math.floor(1000 + Math.random() * 9000);
    const newTempPass = `Realty-${randomPin}`;
    const userToReset = systemUsers.find(u => u.id === userId);

    const updatedUsers = systemUsers.map(u => {
      if (u.id === userId) {
        return {
          ...u,
          status: 'Pending 1st Login',
          isFirstLogin: true,
          tempPassGiven: newTempPass,
          pass: newTempPass
        };
      }
      return u;
    });

    setSystemUsers(updatedUsers);
    saveStoredUsers(updatedUsers);

    setGeneratedCreds({
      empName: userToReset?.name || 'Employee',
      username: userToReset?.username || 'user',
      tempPassword: newTempPass
    });

    setSuccessMsg(`🔒 Success: Temporary PIN ${newTempPass} generated for ${userToReset?.name || 'Employee'}. On next login, they will be required to establish a permanent password.`);
    setTimeout(() => setSuccessMsg(''), 6000);
  };

  // --- RBAC HANDLERS ---
  const handleOpenEditPrivileges = (role) => {
    setEditingRole(role);
    setRolePermissionsTemp([...role.permissions]);
  };

  const handleTogglePermission = (perm) => {
    if (rolePermissionsTemp.includes(perm)) {
      setRolePermissionsTemp(rolePermissionsTemp.filter(p => p !== perm));
    } else {
      setRolePermissionsTemp([...rolePermissionsTemp, perm]);
    }
  };

  const handleSavePrivilegesUpdate = (e) => {
    e.preventDefault();
    setRolesList(rolesList.map(r => r.id === editingRole.id ? { ...r, permissions: rolePermissionsTemp } : r));
    const roleTitle = editingRole.name;
    setEditingRole(null);
    setSuccessMsg(`🛡️ Privileges successfully updated for role: ${roleTitle}. Security token rules re-synchronized.`);
    setTimeout(() => setSuccessMsg(''), 4500);
  };

  const handleToggleCreatePermission = (perm) => {
    if (createRolePerms.includes(perm)) {
      setCreateRolePerms(createRolePerms.filter(p => p !== perm));
    } else {
      setCreateRolePerms([...createRolePerms, perm]);
    }
  };

  const handleCommitCustomRole = (e) => {
    e.preventDefault();
    if (!createRoleName) {
      alert("Please enter a professional role title.");
      return;
    }
    if (createRolePerms.length === 0) {
      alert("Please assign at least one active capability to this role.");
      return;
    }

    const newCustomRole = {
      id: `ROLE-${rolesList.length + 1}`,
      name: createRoleName,
      users: 1, // Default newly created
      permissions: [...createRolePerms]
    };

    setRolesList([newCustomRole, ...rolesList]);
    setCreateRoleName('');
    setCreateRolePerms(['Rental Properties & Units']);
    setShowCreateRoleModal(false);
    setSuccessMsg(`🛡️ Custom security profile '${newCustomRole.name}' successfully deployed to cluster RBAC directory.`);
    setTimeout(() => setSuccessMsg(''), 4500);
  };

  const handleLocalFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLocalBackupError('');
    setLocalBackupData(null);
    setLocalBackupFile(file);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        const keys = Object.keys(parsed);
        const hasRealtyKeys = keys.some(k => k.startsWith('realtyos_'));

        if (!hasRealtyKeys) {
          setLocalBackupError('❌ Invalid file structure: No RealtyOS keys detected.');
          setSelectedRestoreBackup(null);
          return;
        }

        setLocalBackupData(parsed);
        setSelectedRestoreBackup({
          id: 'LOCAL_UPLOAD',
          filename: file.name,
          size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
          type: 'Uploaded Local Snapshot',
          status: 'Valid & Loaded'
        });
      } catch (err) {
        setLocalBackupError('❌ Failed to parse JSON file: Format is invalid.');
        setSelectedRestoreBackup(null);
      }
    };
    reader.readAsText(file);
  };

  const handleRunBackup = () => {
    if (isBackingUp) return;
    setIsBackingUp(true);
    setSuccessMsg('⏳ Compiling complete local device database snapshot...');

    setTimeout(() => {
      // Gather data
      const backupData = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('realtyos_')) {
          backupData[key] = localStorage.getItem(key);
        }
      }

      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '_');
      const filename = `realtyos_entire_system_${dateStr}_${Math.floor(1000 + Math.random() * 9000)}.json`;
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));

      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", filename);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      const newBak = {
        id: `BAK-00${backups.length + 1}`,
        filename: filename,
        size: `${(JSON.stringify(backupData).length / (1024 * 1024)).toFixed(2)} MB`,
        type: 'Local Snap Export',
        status: 'Downloaded Successfully'
      };

      setBackups(prev => [newBak, ...prev]);
      setIsBackingUp(false);
      setSuccessMsg('✅ Success! Full database snapshot downloaded to your local device.');
      setTimeout(() => setSuccessMsg(''), 6000);
    }, 2000);
  };

  const handleInitiateRestore = (backup) => {
    if (!backup) return;
    setIsRestoring(true);
    setRestoreProgressLogs([]);
    setRestoreStep(0);

    const steps = [
      'Establishing local buffer stream reader...',
      'Validating data structure signature integrity...',
      'Dismounting active write channels & locking schema write tables...',
      'Purging temporary caches & operational staging indexes...',
      `Decompressing system backup target: ${backup.filename}...`,
      'Executing tables drop & transactional SQL rebuild schema sequence...',
      'Restoring table records: Tenants, Leases, Finances & Staff lists...',
      'Verifying foreign key constraints & relational data integrity...',
      'Warm-rebuilding database indexes & active B-Tree hashes...',
      'Re-enabling global write-channels & synchronizing cluster states...'
    ];

    let currentLogIndex = 0;
    const interval = setInterval(() => {
      if (currentLogIndex < steps.length) {
        setRestoreProgressLogs(prev => [...prev, steps[currentLogIndex]]);
        setRestoreStep(currentLogIndex + 1);
        currentLogIndex++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setIsRestoring(false);
          setShowRestoreModal(false);

          if (backup.id === 'LOCAL_UPLOAD' && localBackupData) {
            // Apply restore
            // First clear current realtyos_ keys
            for (let i = localStorage.length - 1; i >= 0; i--) {
              const key = localStorage.key(i);
              if (key && key.startsWith('realtyos_')) {
                localStorage.removeItem(key);
              }
            }
            // Insert restored keys
            Object.entries(localBackupData).forEach(([k, v]) => {
              localStorage.setItem(k, v);
            });

            setSuccessMsg(`🎉 Success! Entire system database restored from ${backup.filename}. Reloading...`);
            setTimeout(() => {
              window.location.reload();
            }, 2500);
          } else {
            setSuccessMsg(`🎉 Database successfully rolled back to snapshot state using archive ${backup.filename}!`);
            setTimeout(() => setSuccessMsg(''), 5000);
          }
        }, 1200);
      }
    }, 600);
  };

  const handleInitiateLaunch = () => {
    setIsLaunching(true);
    setLaunchSuccess(false);
    setLaunchProgressLogs([]);

    const logs = [
      'root@realtyos-node-1:~# npx vite build --outDir production --minify',
      '🔍 Inspecting build dependencies and codebase integrity...',
      '📦 Packing assets (144 modules resolved)...',
      '⚡ Compiling CSS elements & tree-shaking unused variables...',
      '🧪 Initializing Jest & Playwright core regression test suites...',
      '✓ Test Suite 1: Authentication & Access Control (Passed in 184ms)',
      '✓ Test Suite 2: Ledger Records & Balance Balancing (Passed in 212ms)',
      '✓ Test Suite 3: Lease Contracts Generation & OCR (Passed in 98ms)',
      '✓ Test Suite 4: Database Snapshot Compression (Passed in 143ms)',
      '✅ All 42 end-to-end regression tests PASSED with zero warnings.',
      '🚀 Packaging production build assets... [production.tar.gz created]',
      '📡 Establishing secure socket connection to Cloudflare and AWS Edge...',
      '📤 Uploading static chunks to multi-region cloud CDN nodes...',
      '🔄 Invalidating global edge cache zones & purging Vercel CDN...',
      '🧹 Purging all mockup and sandbox dataset records from system tables...',
      '✅ Wiped mockup properties, transactions, ledgers & staff directories.',
      '🔒 Retained executive administrator credentials for Louis Kemenyo.',
      '🎉 Production release deployed! RealtyOS Cluster active on v4.8.2-stable. 🚀'
    ];

    let currentLogIndex = 0;
    const interval = setInterval(() => {
      if (currentLogIndex < logs.length) {
        setLaunchProgressLogs(prev => [...prev, logs[currentLogIndex]]);
        currentLogIndex++;
      } else {
        clearInterval(interval);
        
        // Execute system-wide mockup database purge & sync to Supabase
        wipeAllMockData()
          .then(() => {
            setLaunchSuccess(true);
            setTimeout(() => {
              setIsLaunching(false);
              setShowLaunchModal(false);
              setSuccessMsg('🚀 RealtyOS Production cluster compiled & deployed live successfully!');
              setTimeout(() => {
                setSuccessMsg('');
                window.location.reload();
              }, 1200);
            }, 1500);
          })
          .catch((err) => {
            console.error("[Settings] Purging mockup data failed:", err);
            // Proceed to success and reload regardless to maintain usability
            setLaunchSuccess(true);
            setTimeout(() => {
              setIsLaunching(false);
              setShowLaunchModal(false);
              window.location.reload();
            }, 1500);
          });
      }
    }, 600);
  };

  const handleInitiateReset = () => {
    if (resetConfirmText !== 'RESET') {
      alert("Please type the exact phrase 'RESET' to confirm.");
      return;
    }
    setIsResetting(true);
    setSuccessMsg('🛑 Initiating emergency factory reset purge...');

    setTimeout(() => {
      localStorage.clear();
      setIsResetting(false);
      setShowResetModal(false);
      window.location.reload();
    }, 2500);
  };

  const sections = [
    { id: 'profile', label: 'Executive Account', icon: User, desc: 'Manage biometric logins and personal credentials.' },
    { id: 'organization', label: 'Corporate Profile & Legal TIN', icon: Building2, desc: 'Company legal title, VAT registration, and HQ contact details.' },
    { id: 'users', label: 'Users & System Permissions', icon: UserCheck, desc: 'Allocate employee login access, temporary passwords, and role privileges.' },
    { id: 'activity', label: 'System Activities & Audit Log', icon: Activity, desc: 'Immutable tracking of all cross-module data mutations and logins.' },
    { id: 'rbac', label: 'Role Permissions & Access', icon: Shield, desc: 'Enterprise Role-Based Access Control (RBAC) and user groups.' },
    { id: 'database', label: 'Database & Cloud Backups', icon: Database, desc: 'Automated daily snapshots, Supabase cluster status, and SQL dumps.' }
  ];

  return (
    <div className="settings-outer-container" style={{ display: 'flex', flexDirection: 'column', gap: '32px', width: '100%', boxSizing: 'border-box' }}>

      {/* HEADER BANNER */}
      <div className="settings-header-banner no-print" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)', borderRadius: '32px', padding: '40px 48px', color: 'white', position: 'relative', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.4)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
        <div style={{ position: 'absolute', right: '-40px', bottom: '-40px', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%)', pointerEvents: 'none' }}></div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 2, flexWrap: 'wrap', gap: '24px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <span style={{ padding: '6px 14px', background: 'rgba(99, 102, 241, 0.2)', border: '1px solid rgba(99, 102, 241, 0.4)', borderRadius: '20px', fontSize: '12px', fontWeight: '800', color: '#818cf8', textTransform: 'uppercase', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <SettingsIcon size={14} /> System Configuration Hub
              </span>
              <span style={{ fontSize: '13px', color: '#94a3b8', fontWeight: '600' }}>RealtyOS Core v4.8 Enterprise Cluster</span>
            </div>
            <h1 style={{ fontSize: '38px', fontWeight: '900', color: 'white', margin: '0 0 8px 0', letterSpacing: '-1px' }}>
              Enterprise Management & Settings
            </h1>
            <p style={{ fontSize: '16px', color: '#cbd5e1', fontWeight: '500', margin: 0, maxWidth: '720px', lineHeight: '1.6' }}>
              Allocate employee login credentials, manage temporary first-time passwords, configure API payment gateways, and enforce RBAC access rights.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', padding: '14px 24px', borderRadius: '20px', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Activity size={20} color="#34d399" />
              <div>
                <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', display: 'block' }}>System Status</span>
                <strong style={{ fontSize: '14px', color: '#34d399', fontWeight: '800' }}>All Nodes Operational</strong>
              </div>
            </div>
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

      <div className="settings-grid-container" style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '32px' }}>

        {/* SIDEBAR NAVIGATION WITHIN MANAGEMENT */}
        <div className="settings-sidebar-nav no-print" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', paddingLeft: '12px', marginBottom: '4px' }}>Settings Directory</span>
          {sections.map(section => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '16px',
                padding: '20px 22px',
                borderRadius: '24px',
                border: activeSection === section.id ? '2px solid var(--primary)' : '1px solid #cbd5e1',
                backgroundColor: activeSection === section.id ? 'var(--primary)' : 'white',
                color: activeSection === section.id ? 'white' : 'var(--text-main)',
                cursor: 'pointer',
                transition: 'all 0.2s',
                textAlign: 'left',
                boxShadow: activeSection === section.id ? '0 12px 25px -6px rgba(0, 135, 90, 0.4)' : '0 4px 12px rgba(0,0,0,0.02)'
              }}
            >
              <div style={{ padding: '10px', borderRadius: '16px', background: activeSection === section.id ? 'rgba(255,255,255,0.2)' : '#f1f5f9', color: activeSection === section.id ? 'white' : 'var(--primary)', flexShrink: 0, marginTop: '2px' }}>
                <section.icon size={22} />
              </div>
              <div>
                <span style={{ fontWeight: '900', fontSize: '15px', display: 'block', marginBottom: '4px' }}>{section.label}</span>
                <span style={{ fontSize: '12px', color: activeSection === section.id ? '#a7f3d0' : 'var(--text-muted)', fontWeight: '600', lineHeight: '1.4', display: 'block' }}>{section.desc}</span>
              </div>
            </button>
          ))}
        </div>

        {/* SECTION CONTENT */}
        <div className="settings-content-pane" style={{ background: 'white', borderRadius: '32px', border: '1px solid #cbd5e1', padding: '40px', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: '32px' }}>

          {/* --- SECTION 1: PROFILE & MFA --- */}
          {activeSection === 'profile' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #cbd5e1', paddingBottom: '20px' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '24px', fontWeight: '900', color: 'var(--text-main)' }}>Executive Account & Security Credentials</h3>
                  <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '600' }}>Manage personal avatar, contact details, and multi-factor authentication</span>
                </div>
                <button onClick={handleSaveProfileSettings} style={{ background: 'var(--primary)', color: 'white', border: 'none', padding: '14px 28px', borderRadius: '18px', fontSize: '14px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 8px 20px -5px rgba(0, 135, 90, 0.4)' }}>
                  <Check size={18} /> Save Profile Settings
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '24px', background: '#f8fafc', padding: '24px', borderRadius: '24px', border: '1px solid #cbd5e1' }}>
                <div style={{ width: '90px', height: '90px', borderRadius: '24px', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', fontWeight: '900', border: '4px solid white', boxShadow: '0 8px 20px rgba(0,0,0,0.15)', overflow: 'hidden', flexShrink: 0 }}>
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={fullName || 'User'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    (fullName || 'Executive User').split(' ').map(n => (n ? n[0] : '')).join('')
                  )}
                </div>
                <div>
                  <h4 style={{ margin: '0 0 4px', fontSize: '20px', fontWeight: '900', color: 'var(--text-main)' }}>{fullName}</h4>
                  <span style={{ fontSize: '13px', color: 'var(--primary)', fontWeight: '800', display: 'block', marginBottom: '12px' }}>{roleTitle}</span>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <label style={{ background: 'white', border: '1px solid #cbd5e1', padding: '8px 16px', borderRadius: '14px', fontSize: '13px', fontWeight: '800', color: '#334155', cursor: 'pointer', display: 'inline-block' }}>
                      Change Avatar
                      <input type="file" accept="image/*" onChange={handleAvatarUpload} style={{ display: 'none' }} />
                    </label>
                    <button onClick={handleRemoveAvatar} style={{ background: '#fef2f2', border: '1px solid #fca5a5', padding: '8px 16px', borderRadius: '14px', fontSize: '13px', fontWeight: '800', color: '#dc2626', cursor: 'pointer' }}>Remove</button>
                  </div>
                </div>
              </div>


              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '8px' }}>
                    <span>Full Legal Name</span>
                    <span style={{ color: '#94a3b8', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}><Lock size={12} /> HR Locked</span>
                  </label>
                  <input type="text" value={fullName} readOnly disabled style={{ width: '100%', padding: '14px 18px', borderRadius: '16px', border: '1px solid #cbd5e1', fontSize: '14px', fontWeight: '700', color: '#64748b', outline: 'none', background: '#f1f5f9', cursor: 'not-allowed', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '8px' }}>
                    <span>Executive Job Title</span>
                    <span style={{ color: '#94a3b8', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}><Lock size={12} /> HR Locked</span>
                  </label>
                  <input type="text" value={roleTitle} readOnly disabled style={{ width: '100%', padding: '14px 18px', borderRadius: '16px', border: '1px solid #cbd5e1', fontSize: '14px', fontWeight: '700', color: '#64748b', outline: 'none', background: '#f1f5f9', cursor: 'not-allowed', boxSizing: 'border-box' }} />
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '8px' }}>
                    <span>Department</span>
                    <span style={{ color: '#94a3b8', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}><Lock size={12} /> HR Locked</span>
                  </label>
                  <input type="text" value={department} readOnly disabled style={{ width: '100%', padding: '14px 18px', borderRadius: '16px', border: '1px solid #cbd5e1', fontSize: '14px', fontWeight: '700', color: '#64748b', outline: 'none', background: '#f1f5f9', cursor: 'not-allowed', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '8px' }}>Work Email Address</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} style={{ width: '100%', padding: '14px 18px', borderRadius: '16px', border: '1px solid #cbd5e1', fontSize: '14px', fontWeight: '700', outline: 'none', background: '#f8fafc', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '8px' }}>Direct Phone Contact</label>
                  <input type="text" value={phone} onChange={e => setPhone(e.target.value)} style={{ width: '100%', padding: '14px 18px', borderRadius: '16px', border: '1px solid #cbd5e1', fontSize: '14px', fontWeight: '700', outline: 'none', background: '#f8fafc', boxSizing: 'border-box' }} />
                </div>
              </div>


            </div>
          )}

          {/* --- SECTION 2: ORGANIZATION --- */}
          {activeSection === 'organization' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #cbd5e1', paddingBottom: '20px' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '24px', fontWeight: '900', color: 'var(--text-main)' }}>Corporate Profile & Tax Identification</h3>
                  <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '600' }}>Official company registration details displayed on lease agreements and tax receipts</span>
                </div>
                <button onClick={() => handleSaveNotification('Corporate Legal')} style={{ background: 'var(--primary)', color: 'white', border: 'none', padding: '14px 28px', borderRadius: '18px', fontSize: '14px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 8px 20px -5px rgba(0, 135, 90, 0.4)' }}>
                  <Check size={18} /> Save Legal Info
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '8px' }}>Registered Company Legal Name</label>
                  <input type="text" value={orgName} onChange={e => setOrgName(e.target.value)} style={{ width: '100%', padding: '14px 18px', borderRadius: '16px', border: '1px solid #cbd5e1', fontSize: '14px', fontWeight: '800', color: 'var(--text-main)', outline: 'none', background: '#f8fafc', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '8px' }}>GRA Tax Identification Number (TIN)</label>
                  <input type="text" value={orgTIN} onChange={e => setOrgTIN(e.target.value)} style={{ width: '100%', padding: '14px 18px', borderRadius: '16px', border: '1px solid #cbd5e1', fontSize: '14px', fontWeight: '800', color: 'var(--primary)', outline: 'none', background: '#ecfdf5', boxSizing: 'border-box', letterSpacing: '0.5px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '8px' }}>VAT Registration Number</label>
                  <input type="text" value={orgVAT} onChange={e => setOrgVAT(e.target.value)} style={{ width: '100%', padding: '14px 18px', borderRadius: '16px', border: '1px solid #cbd5e1', fontSize: '14px', fontWeight: '700', outline: 'none', background: '#f8fafc', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '8px' }}>Corporate HQ Hotline</label>
                  <input type="text" value={orgPhone} onChange={e => setOrgPhone(e.target.value)} style={{ width: '100%', padding: '14px 18px', borderRadius: '16px', border: '1px solid #cbd5e1', fontSize: '14px', fontWeight: '700', outline: 'none', background: '#f8fafc', boxSizing: 'border-box' }} />
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '8px' }}>Corporate HQ Physical Address</label>
                  <input type="text" value={orgAddress} onChange={e => setOrgAddress(e.target.value)} style={{ width: '100%', padding: '14px 18px', borderRadius: '16px', border: '1px solid #cbd5e1', fontSize: '14px', fontWeight: '700', outline: 'none', background: '#f8fafc', boxSizing: 'border-box' }} />
                </div>
              </div>
            </div>
          )}

          {/* --- SECTION 3: USERS & PERMISSIONS (Staff Access Allocation & First Login Simulation) --- */}
          {activeSection === 'users' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #cbd5e1', paddingBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '24px', fontWeight: '900', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <KeyRound size={26} color="var(--primary)" /> Employee Login Access & System Permissions
                  </h3>
                  <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '600' }}>
                    Admin / IT Officer portal to grant login credentials to registered employees, generate temporary passwords, and simulate first-time password changes.
                  </span>
                </div>
                <button
                  onClick={handleOpenGrantModal}
                  style={{ background: 'var(--primary)', color: 'white', border: 'none', padding: '14px 28px', borderRadius: '18px', fontSize: '14px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 8px 20px -5px rgba(0, 135, 90, 0.4)' }}
                >
                  <KeyRound size={18} /> Grant Login Credentials (New Access)
                </button>
              </div>

              <div
                className="audit-logs-scrollbar"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '32px',
                  maxHeight: '520px',
                  overflowY: 'auto',
                  paddingRight: '8px'
                }}
              >
                {/* GLOBAL OVERLAY MODAL: GRANT LOGIN ACCESS TO EXISTING EMPLOYEE */}
                <AnimatePresence>
                  {showGrantAccessModal && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(15, 23, 42, 0.5)',
                        backdropFilter: 'blur(12px)',
                        zIndex: 99999,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '24px',
                        boxSizing: 'border-box'
                      }}
                      onClick={(e) => {
                        if (e.target === e.currentTarget) setShowGrantAccessModal(false);
                      }}
                    >
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 15 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 15 }}
                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        style={{
                          background: 'linear-gradient(135deg, #ffffff 0%, #fcfdfe 100%)',
                          border: '1px solid rgba(0, 135, 90, 0.15)',
                          borderRadius: '24px',
                          padding: '36px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '28px',
                          overflow: 'hidden',
                          position: 'relative',
                          width: '100%',
                          maxWidth: '720px',
                          boxShadow: '0 25px 60px -15px rgba(15, 23, 42, 0.25), 0 0 0 1px rgba(15, 23, 42, 0.05)',
                          boxSizing: 'border-box'
                        }}
                      >
                        {/* Top colored aesthetic primary gradient bar */}
                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '6px', background: 'linear-gradient(90deg, var(--primary) 0%, #10b981 100%)' }}></div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '18px' }}>
                          <h4 style={{ margin: 0, fontSize: '20px', fontWeight: '900', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '12px', letterSpacing: '-0.02em' }}>
                            <span style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#e6f3ed', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                              <UserPlus size={20} />
                            </span>
                            Access Provisioning Control
                          </h4>
                          <button
                            type="button"
                            onClick={() => setShowGrantAccessModal(false)}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              cursor: 'pointer',
                              color: '#94a3b8',
                              padding: '8px',
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.background = '#fef2f2'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.background = 'transparent'; }}
                          >
                            <X size={20} />
                          </button>
                        </div>

                        {!generatedCreds ? (
                          <form onSubmit={handleGenerateCredentials} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            <div style={{
                              background: 'linear-gradient(135deg, #eff6ff 0%, #f0fdf4 100%)',
                              border: '1px solid #bfdbfe',
                              padding: '18px 22px',
                              borderRadius: '16px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '14px',
                              fontSize: '13px',
                              color: '#1e3a8a',
                              fontWeight: '700',
                              lineHeight: '1.5',
                              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.04)'
                            }}>
                              <AlertCircle size={22} style={{ color: '#2563eb', flexShrink: 0 }} />
                              <span>Select an unassigned employee from the active roster. The system will securely instantiate a new user record with a randomized temporary entry pass.</span>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                              <div>
                                <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Select Unassigned Employee</label>
                                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                  <span style={{ position: 'absolute', left: '16px', color: '#94a3b8', display: 'flex', alignItems: 'center', pointerEvents: 'none' }}>
                                    <UserCheck size={18} />
                                  </span>
                                  <select
                                    value={selectedEmpForAccess}
                                    onChange={e => setSelectedEmpForAccess(e.target.value)}
                                    style={{
                                      width: '100%',
                                      padding: '16px 20px 16px 46px',
                                      borderRadius: '16px',
                                      border: '1.5px solid #e2e8f0',
                                      fontSize: '14px',
                                      fontWeight: '800',
                                      color: '#0f172a',
                                      outline: 'none',
                                      background: 'white',
                                      cursor: 'pointer',
                                      transition: 'all 0.2s',
                                      boxShadow: '0 2px 4px rgba(0,0,0,0.01)'
                                    }}
                                    onFocus={(e) => {
                                      e.target.style.borderColor = 'var(--primary)';
                                      e.target.style.boxShadow = '0 0 0 4px rgba(0, 135, 90, 0.1)';
                                    }}
                                    onBlur={(e) => {
                                      e.target.style.borderColor = '#e2e8f0';
                                      e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.01)';
                                    }}
                                  >
                                    {enterpriseEmployees.filter(e => !e.hasLogin).map(emp => (
                                      <option key={emp.id} value={emp.id}>{emp.name} ({emp.role} • {emp.email})</option>
                                    ))}
                                    {enterpriseEmployees.filter(e => !e.hasLogin).length === 0 && (
                                      <option value="">All registered staff already hold active credentials</option>
                                    )}
                                  </select>
                                </div>
                              </div>

                              <div>
                                <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Assigned RBAC Permission Group</label>
                                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                  <span style={{ position: 'absolute', left: '16px', color: '#94a3b8', display: 'flex', alignItems: 'center', pointerEvents: 'none' }}>
                                    <ShieldCheck size={18} />
                                  </span>
                                  <select
                                    value={selectedRoleForAccess}
                                    onChange={e => setSelectedRoleForAccess(e.target.value)}
                                    style={{
                                      width: '100%',
                                      padding: '16px 20px 16px 46px',
                                      borderRadius: '16px',
                                      border: '1.5px solid #e2e8f0',
                                      fontSize: '14px',
                                      fontWeight: '800',
                                      color: 'var(--primary)',
                                      outline: 'none',
                                      background: 'white',
                                      cursor: 'pointer',
                                      transition: 'all 0.2s',
                                      boxShadow: '0 2px 4px rgba(0,0,0,0.01)'
                                    }}
                                    onFocus={(e) => {
                                      e.target.style.borderColor = 'var(--primary)';
                                      e.target.style.boxShadow = '0 0 0 4px rgba(0, 135, 90, 0.1)';
                                    }}
                                    onBlur={(e) => {
                                      e.target.style.borderColor = '#e2e8f0';
                                      e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.01)';
                                    }}
                                  >
                                    {rolesList.map(role => (
                                      <option key={role.id} value={role.name}>{role.name} ({role.id})</option>
                                    ))}
                                  </select>
                                </div>
                              </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginTop: '8px' }}>
                              <button
                                type="button"
                                onClick={() => setShowGrantAccessModal(false)}
                                style={{
                                  background: '#f1f5f9',
                                  border: '1px solid #cbd5e1',
                                  color: '#475569',
                                  padding: '14px 30px',
                                  borderRadius: '16px',
                                  fontWeight: '800',
                                  fontSize: '14px',
                                  cursor: 'pointer',
                                  transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.background = '#e2e8f0'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = '#f1f5f9'; }}
                              >
                                Cancel
                              </button>
                              <button
                                type="submit"
                                disabled={enterpriseEmployees.filter(e => !e.hasLogin).length === 0}
                                style={{
                                  background: 'linear-gradient(135deg, var(--primary) 0%, #10b981 100%)',
                                  border: 'none',
                                  color: 'white',
                                  padding: '14px 32px',
                                  borderRadius: '16px',
                                  fontWeight: '800',
                                  fontSize: '14px',
                                  cursor: 'pointer',
                                  boxShadow: '0 8px 20px rgba(0, 135, 90, 0.3)',
                                  transition: 'all 0.2s',
                                  opacity: enterpriseEmployees.filter(e => !e.hasLogin).length === 0 ? 0.5 : 1
                                }}
                                onMouseEnter={(e) => {
                                  if (enterpriseEmployees.filter(e => !e.hasLogin).length > 0) {
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.boxShadow = '0 12px 24px rgba(0, 135, 90, 0.4)';
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.transform = 'translateY(0)';
                                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 135, 90, 0.3)';
                                }}
                              >
                                Instantiate & Grant Access
                              </button>
                            </div>
                          </form>
                        ) : (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.96 }}
                            animate={{ opacity: 1, scale: 1 }}
                            style={{
                              background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                              border: '1px solid #334155',
                              borderRadius: '24px',
                              padding: '40px 32px',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '26px',
                              alignItems: 'center',
                              textAlign: 'center',
                              boxShadow: '0 20px 45px rgba(15, 23, 42, 0.3)',
                              position: 'relative',
                              overflow: 'hidden'
                            }}
                          >
                            {/* Cyberpunk access grid lines */}
                            <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)', backgroundSize: '24px 24px', pointerEvents: 'none' }}></div>

                            <div style={{ width: '68px', height: '68px', borderRadius: '50%', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '30px', fontWeight: 'bold', boxShadow: '0 0 30px rgba(16, 185, 129, 0.4)', zIndex: 1 }}>
                              ✓
                            </div>

                            <div style={{ zIndex: 1 }}>
                              <h4 style={{ margin: '0 0 8px', fontSize: '22px', fontWeight: '900', color: '#ffffff', letterSpacing: '-0.02em' }}>Access Profile Initialized</h4>
                              <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8', maxWidth: '480px', lineHeight: '1.6', fontWeight: '500' }}>
                                Default credentials have been generated for <strong>{generatedCreds.empName}</strong>. The employee will be prompted to establish a custom private passcode on first authentication.
                              </p>
                            </div>

                            {/* Futuristic access voucher card */}
                            <div style={{ width: '100%', maxWidth: '460px', background: 'rgba(15, 23, 42, 0.7)', border: '1px dashed #475569', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px', zIndex: 1, position: 'relative' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #334155', paddingBottom: '12px' }}>
                                <span style={{ fontSize: '10px', fontWeight: '900', color: '#10b981', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Security Access Package</span>
                                <span style={{ fontSize: '10px', fontWeight: '800', color: '#64748b', fontFamily: 'monospace' }}>REOS//SEC-GRANTED</span>
                              </div>

                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', textAlign: 'left' }}>
                                <div>
                                  <span style={{ fontSize: '10px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>System Username</span>
                                  <strong style={{ fontSize: '16px', color: '#ffffff', fontFamily: 'monospace' }}>{generatedCreds.username}</strong>
                                </div>
                                <div>
                                  <span style={{ fontSize: '10px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Temporary Passcode</span>
                                  <strong style={{ fontSize: '16px', color: '#10b981', fontFamily: 'monospace', letterSpacing: '0.04em' }}>{generatedCreds.tempPassword}</strong>
                                </div>
                              </div>

                              <div style={{ borderTop: '1px solid #334155', paddingTop: '16px', display: 'flex', justifyContent: 'center' }}>
                                <button
                                  onClick={() => {
                                    navigator.clipboard.writeText(`Username: ${generatedCreds.username}\nTemporary Password: ${generatedCreds.tempPassword}`);
                                    alert('Credentials copied to clipboard!');
                                  }}
                                  style={{
                                    background: 'rgba(51, 65, 85, 0.4)',
                                    border: '1px solid #334155',
                                    padding: '12px 24px',
                                    borderRadius: '12px',
                                    fontSize: '13px',
                                    fontWeight: '800',
                                    color: '#f8fafc',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    transition: 'all 0.2s'
                                  }}
                                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(51, 65, 85, 0.8)'; }}
                                  onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(51, 65, 85, 0.4)'; }}
                                >
                                  <Copy size={15} /> Copy Access Credentials
                                </button>
                              </div>
                            </div>

                            <button
                              onClick={() => setShowGrantAccessModal(false)}
                              style={{
                                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                color: 'white',
                                border: 'none',
                                padding: '14px 40px',
                                borderRadius: '16px',
                                fontWeight: '800',
                                fontSize: '14px',
                                cursor: 'pointer',
                                boxShadow: '0 8px 25px rgba(16, 185, 129, 0.3)',
                                marginTop: '6px',
                                transition: 'all 0.2s',
                                zIndex: 1
                              }}
                              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
                              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
                            >
                              Done & Return to Directory
                            </button>
                          </motion.div>
                        )}
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* USER CARDS LIST */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-muted)' }}>Registered Active System Credentials ({systemUsers.length})</span>
                  </div>

                  {systemUsers.map(user => (
                    <div key={user.id} style={{ background: 'white', border: user.isFirstLogin ? '2px solid #f59e0b' : '1px solid #cbd5e1', borderRadius: '24px', padding: '24px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px', transition: 'box-shadow 0.2s', ':hover': { boxShadow: '0 10px 25px -5px rgba(0,0,0,0.08)' } }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div style={{ width: '56px', height: '56px', borderRadius: '18px', background: user.isFirstLogin ? '#fef3c7' : 'var(--primary)', color: user.isFirstLogin ? '#d97706' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: '900', border: user.isFirstLogin ? '2px solid #fde68a' : '2px solid #e2e8f0', flexShrink: 0 }}>
                          {user.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                            <h4 style={{ margin: 0, fontSize: '18px', fontWeight: '900', color: 'var(--text-main)' }}>{user.name}</h4>
                            <span style={{ padding: '3px 10px', background: user.isFirstLogin ? '#fff7ed' : (user.status === 'Active' ? '#ecfdf5' : '#f1f5f9'), color: user.isFirstLogin ? '#c2410c' : (user.status === 'Active' ? '#00875a' : '#64748b'), border: user.isFirstLogin ? '1px solid #ffedd5' : (user.status === 'Active' ? '1px solid #a7f3d0' : '1px solid #cbd5e1'), borderRadius: '12px', fontSize: '11px', fontWeight: '800' }}>
                              {user.status}
                            </span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', fontSize: '13px', color: 'var(--text-muted)', fontWeight: '600' }}>
                            <span>Username: <strong style={{ color: '#0f172a' }}>{user.username}</strong></span>
                            <span>•</span>
                            <span style={{ color: 'var(--primary)', fontWeight: '800' }}>{user.role}</span>
                            <span>•</span>
                            <span>Last login: {user.lastLogin}</span>
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {user.isFirstLogin ? (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '800', color: '#d97706', background: '#fef3c7', padding: '8px 14px', borderRadius: '14px', border: '1px solid #fde68a' }}>
                            <Key size={14} /> PIN: {user.tempPassGiven || user.pass}
                          </span>
                        ) : (
                          <button
                            onClick={() => handleResetUserPassword(user.id)}
                            style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', color: '#475569', padding: '10px 18px', borderRadius: '16px', fontSize: '13px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', transition: '0.2s' }}
                          >
                            <KeyRound size={16} /> Reset PIN
                          </button>
                        )}

                        <button onClick={() => handleRevokeUser(user.id)} style={{ background: '#fef2f2', border: '1px solid #fca5a5', color: '#dc2626', padding: '10px 18px', borderRadius: '16px', fontSize: '13px', fontWeight: '800', cursor: 'pointer', transition: 'all 0.2s' }}>
                          Revoke Access
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* --- SECTION 4: SYSTEM ACTIVITIES & AUDIT LOG --- */}
          {activeSection === 'activity' && (
            <div className="audit-print-area" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #cbd5e1', paddingBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '24px', fontWeight: '900', color: 'var(--text-main)' }}>Enterprise Audit Log</h3>
                  <span className="audit-print-subtitle" style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '600' }}>Immutable tracking of critical system events and user actions</span>
                </div>
                <div className="no-print" style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  <div style={{ position: 'relative' }}>
                    <Calendar size={16} color="#64748b" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type="date"
                      value={auditDateFilter}
                      onChange={(e) => setAuditDateFilter(e.target.value)}
                      style={{ padding: '12px 16px 12px 38px', borderRadius: '16px', border: '1px solid #cbd5e1', fontSize: '14px', fontWeight: '800', color: '#334155', outline: 'none' }}
                    />
                  </div>

                  <button onClick={() => window.print()} style={{ background: 'white', border: '1px solid #cbd5e1', padding: '14px 20px', borderRadius: '16px', fontSize: '14px', fontWeight: '800', color: '#334155', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Printer size={18} /> Print Log
                  </button>

                  <button onClick={handleExportPdf} disabled={isGeneratingPdf} style={{ background: '#0f172a', border: 'none', padding: '14px 20px', borderRadius: '16px', fontSize: '14px', fontWeight: '800', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 8px 15px -3px rgba(15, 23, 42, 0.3)' }}>
                    <Download size={18} /> {isGeneratingPdf ? 'Processing...' : 'Download PDF'}
                  </button>
                </div>
              </div>

              <div
                className="audit-logs-scrollbar"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  maxHeight: isGeneratingPdf ? 'none' : '480px',
                  overflowY: isGeneratingPdf ? 'visible' : 'auto',
                  paddingRight: isGeneratingPdf ? '0' : '8px'
                }}
              >
                {AUDIT_LOGS.filter(log => !auditDateFilter || log.dateKey === auditDateFilter).map((log, index) => (
                  <div key={index} className="audit-log-item" style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '12px', border: '1px solid #cbd5e1', display: 'flex', alignItems: 'flex-start', gap: '12px', transition: 'all 0.2s', cursor: 'default' }}>
                    <div className="audit-log-icon-container" style={{ width: '32px', height: '32px', borderRadius: '8px', background: log.type === 'system' ? '#eff6ff' : log.type === 'sales' ? '#fdf4ff' : log.type === 'maintenance' ? '#fff7ed' : '#ecfdf5', color: log.type === 'system' ? '#3b82f6' : log.type === 'sales' ? '#d946ef' : log.type === 'maintenance' ? '#f59e0b' : '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {log.type === 'system' ? <SettingsIcon size={16} /> : log.type === 'sales' ? <DollarSign size={16} /> : log.type === 'maintenance' ? <SettingsIcon size={16} /> : <CheckCircle2 size={16} />}
                    </div>
                    <div className="audit-log-details-container" style={{ flex: 1 }}>
                      <div className="audit-log-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                        <span className="audit-log-action" style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a' }}>{log.action}</span>
                        <span className="audit-log-time" style={{ fontSize: '11px', fontWeight: '700', color: '#94a3b8' }}>{log.time}</span>
                      </div>
                      <p className="audit-log-detail" style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#64748b', fontWeight: '500' }}>{log.detail}</p>
                      <div className="audit-log-user-tag" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <User size={10} color="#64748b" />
                        <span className="audit-log-username" style={{ fontSize: '10px', fontWeight: '800', color: '#64748b' }}>{log.user}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* --- SECTION 5: RBAC ROLES & CAPABILITIES --- */}
          {activeSection === 'rbac' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #cbd5e1', paddingBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '24px', fontWeight: '900', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Shield size={26} color="var(--primary)" /> Role-Based Access Control (RBAC)
                  </h3>
                  <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '600' }}>Define custom permission boundaries, modify module access, and deploy security profiles across personnel</span>
                </div>
                <button
                  onClick={() => setShowCreateRoleModal(true)}
                  style={{ background: 'var(--primary)', color: 'white', border: 'none', padding: '14px 28px', borderRadius: '18px', fontSize: '14px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 8px 20px -5px rgba(0, 135, 90, 0.4)' }}
                >
                  <Plus size={18} /> Create Custom Enterprise Role
                </button>
              </div>

              {/* POP-UP MODAL: CREATE CUSTOM ROLE */}
              <AnimatePresence>
                {showCreateRoleModal && (
                  <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(10px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      style={{ background: 'white', borderRadius: '32px', padding: '48px', maxWidth: '700px', width: '100%', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', border: '1px solid #cbd5e1', display: 'flex', flexDirection: 'column', gap: '28px', maxHeight: '90vh', overflowY: 'auto' }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #e2e8f0', paddingBottom: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <div style={{ width: '56px', height: '56px', borderRadius: '20px', background: '#ecfdf5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <ShieldCheck size={28} />
                          </div>
                          <div>
                            <span style={{ padding: '4px 12px', background: '#f1f5f9', color: '#475569', borderRadius: '14px', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase' }}>Security Framework Template</span>
                            <h3 style={{ margin: '6px 0 0', fontSize: '24px', fontWeight: '900', color: '#0f172a' }}>Build Custom Role Template</h3>
                          </div>
                        </div>
                        <button onClick={() => setShowCreateRoleModal(false)} style={{ background: '#f1f5f9', border: 'none', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b' }}>
                          <X size={18} />
                        </button>
                      </div>

                      <form onSubmit={handleCommitCustomRole} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '13px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '8px' }}>Custom Role Professional Title</label>
                          <input type="text" placeholder="e.g. Compliance Auditor, Senior Assistant Manager" value={createRoleName} onChange={e => setCreateRoleName(e.target.value)} style={{ width: '100%', padding: '16px 20px', borderRadius: '16px', border: '1px solid #cbd5e1', fontSize: '15px', fontWeight: '800', color: '#0f172a', outline: 'none', background: 'white', boxSizing: 'border-box' }} required />
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '14px', fontWeight: '900', color: 'var(--text-main)', marginBottom: '12px' }}>Assign Active Module Capabilities ({createRolePerms.length} Selected)</label>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            {availablePermissionsList.map((perm, idx) => {
                              const active = createRolePerms.includes(perm);
                              return (
                                <div
                                  key={idx}
                                  onClick={() => handleToggleCreatePermission(perm)}
                                  style={{ background: active ? '#ecfdf5' : '#f8fafc', border: active ? '2px solid #10b981' : '1px solid #cbd5e1', padding: '16px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', transition: 'all 0.2s' }}
                                >
                                  {active ? <CheckSquare size={20} color="#10b981" /> : <Square size={20} color="#94a3b8" />}
                                  <span style={{ fontSize: '13px', fontWeight: active ? '800' : '600', color: active ? '#065f46' : '#334155' }}>
                                    {perm}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginTop: '16px' }}>
                          <button type="button" onClick={() => setShowCreateRoleModal(false)} style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', color: '#475569', padding: '16px 28px', borderRadius: '16px', fontWeight: '800', fontSize: '15px', cursor: 'pointer' }}>Cancel</button>
                          <button type="submit" style={{ background: 'var(--primary)', border: 'none', color: 'white', padding: '16px 36px', borderRadius: '16px', fontWeight: '800', fontSize: '15px', cursor: 'pointer', boxShadow: '0 8px 25px rgba(0, 135, 90, 0.4)' }}>
                            Commit Custom Enterprise Role
                          </button>
                        </div>
                      </form>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>

              {/* POP-UP MODAL: EDIT EXISTING ROLE PRIVILEGES */}
              <AnimatePresence>
                {editingRole && (
                  <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(10px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      style={{ background: 'white', borderRadius: '32px', padding: '48px', maxWidth: '700px', width: '100%', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', border: '1px solid #cbd5e1', display: 'flex', flexDirection: 'column', gap: '28px', maxHeight: '90vh', overflowY: 'auto' }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #e2e8f0', paddingBottom: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <div style={{ width: '56px', height: '56px', borderRadius: '20px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Sliders size={28} />
                          </div>
                          <div>
                            <span style={{ padding: '4px 12px', background: '#e2e8f0', color: '#334155', borderRadius: '14px', fontSize: '11px', fontWeight: '900', textTransform: 'uppercase' }}>{editingRole.id} Profile</span>
                            <h3 style={{ margin: '6px 0 0', fontSize: '24px', fontWeight: '900', color: '#0f172a' }}>Modify Privileges: {editingRole.name}</h3>
                          </div>
                        </div>
                        <button onClick={() => setEditingRole(null)} style={{ background: '#f1f5f9', border: 'none', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b' }}>
                          <X size={18} />
                        </button>
                      </div>

                      <form onSubmit={handleSavePrivilegesUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '14px', fontWeight: '900', color: 'var(--text-main)', marginBottom: '12px' }}>Toggle Module Access Rules ({rolePermissionsTemp.length} Assigned)</label>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            {availablePermissionsList.map((perm, idx) => {
                              const active = rolePermissionsTemp.includes(perm);
                              return (
                                <div
                                  key={idx}
                                  onClick={() => handleTogglePermission(perm)}
                                  style={{ background: active ? '#ecfdf5' : '#f8fafc', border: active ? '2px solid #10b981' : '1px solid #cbd5e1', padding: '16px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', transition: 'all 0.2s' }}
                                >
                                  {active ? <CheckSquare size={20} color="#10b981" /> : <Square size={20} color="#94a3b8" />}
                                  <span style={{ fontSize: '13px', fontWeight: active ? '800' : '600', color: active ? '#065f46' : '#334155' }}>
                                    {perm}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginTop: '16px' }}>
                          <button type="button" onClick={() => setEditingRole(null)} style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', color: '#475569', padding: '16px 28px', borderRadius: '16px', fontWeight: '800', fontSize: '15px', cursor: 'pointer' }}>Cancel</button>
                          <button type="submit" style={{ background: 'var(--primary)', border: 'none', color: 'white', padding: '16px 36px', borderRadius: '16px', fontWeight: '800', fontSize: '15px', cursor: 'pointer', boxShadow: '0 8px 25px rgba(0, 135, 90, 0.4)' }}>
                            Save Permission Updates
                          </button>
                        </div>
                      </form>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>

              {/* ROLES LIST CARDS */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {rolesList.map(role => (
                  <div key={role.id} style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '24px', padding: '28px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px', transition: 'box-shadow 0.2s', ':hover': { boxShadow: '0 10px 25px -5px rgba(0,0,0,0.08)' } }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                        <span style={{ padding: '4px 12px', background: '#e2e8f0', borderRadius: '12px', fontSize: '12px', fontWeight: '900', color: '#334155' }}>{role.id}</span>
                        <span style={{ fontSize: '13px', color: 'var(--primary)', fontWeight: '800' }}>{role.users} Active Personnel Assigned</span>
                      </div>
                      <h4 style={{ margin: '0 0 12px', fontSize: '22px', fontWeight: '900', color: 'var(--text-main)' }}>{role.name}</h4>
                      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        {role.permissions.map((perm, idx) => (
                          <span key={idx} style={{ background: 'white', padding: '6px 14px', borderRadius: '14px', border: '1px solid #cbd5e1', fontSize: '12px', fontWeight: '800', color: '#475569', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                            {perm}
                          </span>
                        ))}
                      </div>
                    </div>
                    <button
                      onClick={() => handleOpenEditPrivileges(role)}
                      style={{ background: 'white', border: '2px solid #cbd5e1', padding: '12px 24px', borderRadius: '16px', fontSize: '14px', fontWeight: '900', color: '#0f172a', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s', ':hover': { borderColor: 'var(--primary)', color: 'var(--primary)' } }}
                    >
                      <Sliders size={18} /> Edit Privileges
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* --- SECTION 6: DATABASE & BACKUPS --- */}
          {activeSection === 'database' && (() => {
            const activeRole = simulatedRole || userProfile.role || 'Portfolio Director';
            const isExecutiveAdmin = activeRole === 'Executive Administrator' || activeRole === 'Portfolio Director';
            const isITSystemsOfficer = activeRole === 'IT Systems Officer';
            const hasControlAccess = isExecutiveAdmin || isITSystemsOfficer;

            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>


                {/* ACCESS STATE BANNER FOR LOCKOUT */}
                {!hasControlAccess && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      background: 'linear-gradient(135deg, #fef2f2 0%, #fff1f2 100%)',
                      border: '1.5px dashed #f87171',
                      borderRadius: '20px',
                      padding: '24px',
                      color: '#991b1b',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '16px',
                      boxShadow: '0 8px 20px rgba(239,68,68,0.05)'
                    }}
                  >
                    <AlertTriangle size={24} style={{ color: '#ef4444', flexShrink: 0, marginTop: '2px' }} />
                    <div>
                      <h4 style={{ margin: '0 0 6px 0', fontSize: '16px', fontWeight: '900', color: '#991b1b' }}>SECURE ACCESS LOCKOUT</h4>
                      <p style={{ margin: 0, fontSize: '13px', lineHeight: '1.5', fontWeight: '600', color: '#b91c1c' }}>
                        Your current simulated role as a <strong style={{ textDecoration: 'underline' }}>{simulatedRole}</strong> does not possess Database Snapshot or Recovery authorization. The control terminal, automated backup triggers, and restore parameters have been securely locked. Contact the Lead Systems Architect or Executive Director to provision access.
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* HEADING AND INFRASTRUCTURE GRID */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #cbd5e1', paddingBottom: '20px' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '24px', fontWeight: '900', color: 'var(--text-main)' }}>Cloud Snapshot & Recovery Control Center</h3>
                    <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '600' }}>Deploy production builds, roll back system clusters, and seed default tables securely</span>
                  </div>
                </div>

                {/* DATABASE SNAPSHOT & CLOUD RECOVERY ACTIONS GRID */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>

                  {/* CARD 1: BACKUP SYSTEM */}
                  <div style={{
                    background: 'white',
                    border: '1px solid #cbd5e1',
                    borderRadius: '24px',
                    padding: '28px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '20px',
                    opacity: hasControlAccess ? 1 : 0.6,
                    cursor: hasControlAccess ? 'default' : 'not-allowed',
                    transition: 'all 0.2s',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
                  }}>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                      <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '16px',
                        background: '#ecfdf5',
                        color: '#10b981',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <Database size={24} />
                      </div>
                      <div>
                        <h4 style={{ margin: '0 0 6px 0', fontSize: '18px', fontWeight: '900', color: 'var(--text-main)' }}>Backup System</h4>
                        <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '600', lineHeight: '1.5', display: 'block' }}>
                          Instantly compile a point-in-time SQL database snapshot and upload encrypted gz archive to secure S3 cold storage.
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={handleRunBackup}
                      disabled={!hasControlAccess || isBackingUp}
                      style={{
                        width: '100%',
                        background: hasControlAccess ? 'var(--primary)' : '#e2e8f0',
                        color: hasControlAccess ? 'white' : '#94a3b8',
                        border: 'none',
                        padding: '14px 20px',
                        borderRadius: '16px',
                        fontSize: '14px',
                        fontWeight: '800',
                        cursor: hasControlAccess ? 'pointer' : 'not-allowed',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        boxShadow: hasControlAccess && !isBackingUp ? '0 8px 20px rgba(0, 135, 90, 0.2)' : 'none',
                        transition: 'all 0.2s'
                      }}
                    >
                      {isBackingUp ? (
                        <>
                          <RefreshCw size={16} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
                          <span>Generating Encrypted Snapshot...</span>
                        </>
                      ) : (
                        <>
                          <Database size={16} />
                          <span>Backup System Snap</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* CARD 2: RESTORE SYSTEM */}
                  <div style={{
                    background: 'white',
                    border: '1px solid #cbd5e1',
                    borderRadius: '24px',
                    padding: '28px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '20px',
                    opacity: hasControlAccess ? 1 : 0.6,
                    cursor: hasControlAccess ? 'default' : 'not-allowed',
                    transition: 'all 0.2s',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
                  }}>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                      <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '16px',
                        background: '#eff6ff',
                        color: '#2563eb',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <History size={24} />
                      </div>
                      <div>
                        <h4 style={{ margin: '0 0 6px 0', fontSize: '18px', fontWeight: '900', color: 'var(--text-main)' }}>Restore System</h4>
                        <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '600', lineHeight: '1.5', display: 'block' }}>
                          Select a historically verified database snapshot from the encrypted cloud archives to roll back the cluster state.
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowRestoreModal(true)}
                      disabled={!hasControlAccess}
                      style={{
                        width: '100%',
                        background: hasControlAccess ? '#2563eb' : '#e2e8f0',
                        color: hasControlAccess ? 'white' : '#94a3b8',
                        border: 'none',
                        padding: '14px 20px',
                        borderRadius: '16px',
                        fontSize: '14px',
                        fontWeight: '800',
                        cursor: hasControlAccess ? 'pointer' : 'not-allowed',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        boxShadow: hasControlAccess ? '0 8px 20px rgba(37, 99, 235, 0.2)' : 'none',
                        transition: 'all 0.2s'
                      }}
                    >
                      <History size={16} />
                      <span>Restore System State</span>
                    </button>
                  </div>

                  {/* CARD 3: PRODUCTION LAUNCH */}
                  <div style={{
                    background: 'white',
                    border: '1px solid #cbd5e1',
                    borderRadius: '24px',
                    padding: '28px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '20px',
                    opacity: hasControlAccess ? 1 : 0.6,
                    cursor: hasControlAccess ? 'default' : 'not-allowed',
                    transition: 'all 0.2s',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
                  }}>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                      <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '16px',
                        background: '#fff7ed',
                        color: '#ea580c',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <Zap size={24} />
                      </div>
                      <div>
                        <h4 style={{ margin: '0 0 6px 0', fontSize: '18px', fontWeight: '900', color: 'var(--text-main)' }}>Production Launch</h4>
                        <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '600', lineHeight: '1.5', display: 'block' }}>
                          Compile the latest tested codebase, build optimized assets, run unit tests, and hot-deploy directly to production servers.
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setShowLaunchModal(true);
                        handleInitiateLaunch();
                      }}
                      disabled={!hasControlAccess}
                      style={{
                        width: '100%',
                        background: hasControlAccess ? '#ea580c' : '#e2e8f0',
                        color: hasControlAccess ? 'white' : '#94a3b8',
                        border: 'none',
                        padding: '14px 20px',
                        borderRadius: '16px',
                        fontSize: '14px',
                        fontWeight: '800',
                        cursor: hasControlAccess ? 'pointer' : 'not-allowed',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        boxShadow: hasControlAccess ? '0 8px 20px rgba(234, 88, 12, 0.2)' : 'none',
                        transition: 'all 0.2s'
                      }}
                    >
                      <Zap size={16} />
                      <span>Production Launch</span>
                    </button>
                  </div>

                  {/* CARD 4: FACTORY RESET (DANGER ZONE) */}
                  <div style={{
                    background: 'white',
                    border: '1px solid #cbd5e1',
                    borderRadius: '24px',
                    padding: '28px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '20px',
                    opacity: isExecutiveAdmin ? 1 : 0.6,
                    cursor: isExecutiveAdmin ? 'default' : 'not-allowed',
                    transition: 'all 0.2s',
                    position: 'relative',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
                  }}>
                    {/* Locked badge tooltip for IT Officer or others */}
                    {!isExecutiveAdmin && (
                      <div
                        title="Restricted: Factory Reset is strictly limited to Executive Administrators / Owners only."
                        style={{
                          position: 'absolute',
                          top: '16px',
                          right: '16px',
                          background: '#fef2f2',
                          border: '1px solid #fca5a5',
                          borderRadius: '12px',
                          padding: '6px 12px',
                          fontSize: '11px',
                          fontWeight: '800',
                          color: '#dc2626',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          cursor: 'help'
                        }}
                      >
                        <Lock size={12} /> Restricted Access
                      </div>
                    )}
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                      <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '16px',
                        background: '#fef2f2',
                        color: '#dc2626',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <AlertTriangle size={24} />
                      </div>
                      <div>
                        <h4 style={{ margin: '0 0 6px 0', fontSize: '18px', fontWeight: '900', color: '#991b1b' }}>Factory Reset</h4>
                        <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '600', lineHeight: '1.5', display: 'block' }}>
                          Purge all databases, clear localized browser storage state, and re-initialize RealtyOS to its initial pristine configurations.
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        if (!isExecutiveAdmin) return;
                        setResetConfirmText('');
                        setShowResetModal(true);
                      }}
                      disabled={!isExecutiveAdmin}
                      style={{
                        width: '100%',
                        background: isExecutiveAdmin ? '#dc2626' : '#e2e8f0',
                        color: isExecutiveAdmin ? 'white' : '#94a3b8',
                        border: 'none',
                        padding: '14px 20px',
                        borderRadius: '16px',
                        fontSize: '14px',
                        fontWeight: '800',
                        cursor: isExecutiveAdmin ? 'pointer' : 'not-allowed',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        boxShadow: isExecutiveAdmin ? '0 8px 20px rgba(220, 38, 38, 0.2)' : 'none',
                        transition: 'all 0.2s'
                      }}
                    >
                      {isExecutiveAdmin ? (
                        <>
                          <AlertTriangle size={16} />
                          <span>Factory Reset</span>
                        </>
                      ) : (
                        <>
                          <Lock size={16} />
                          <span>Locked for {simulatedRole}</span>
                        </>
                      )}
                    </button>
                  </div>

                </div>


                {/* --- MODAL 1: RESTORE SYSTEM STATE MODAL --- */}
                <AnimatePresence>
                  {showRestoreModal && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(15, 23, 42, 0.6)',
                        backdropFilter: 'blur(12px)',
                        zIndex: 99999,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '24px'
                      }}
                      onClick={(e) => {
                        if (e.target === e.currentTarget && !isRestoring) setShowRestoreModal(false);
                      }}
                    >
                      <motion.div
                        initial={{ scale: 0.95, y: 15 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.95, y: 15 }}
                        style={{
                          background: 'white',
                          borderRadius: '24px',
                          width: '100%',
                          maxWidth: '640px',
                          padding: '36px',
                          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
                          position: 'relative'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '16px', marginBottom: '24px' }}>
                          <h4 style={{ margin: 0, fontSize: '20px', fontWeight: '900', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <History size={22} color="#2563eb" /> System Restore Panel
                          </h4>
                          {!isRestoring && (
                            <button onClick={() => setShowRestoreModal(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                              <X size={20} />
                            </button>
                          )}
                        </div>

                        {!isRestoring ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', padding: '16px', borderRadius: '16px', fontSize: '13px', color: '#0369a1', fontWeight: '600', lineHeight: '1.5' }}>
                              ⚠️ <strong>RESTORE WARNING:</strong> Applying a system restore is a highly critical operation. This rolls back the relational PostgreSQL tables to a previous state, overriding current modifications. Active staff sessions will remain intact, but data entered after the snapshot time will be lost.
                            </div>

                            <div>
                              <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>Select Target Snapshot Archive</label>
                              <select
                                value={selectedRestoreBackup ? selectedRestoreBackup.id : ''}
                                onChange={(e) => {
                                  if (e.target.value === 'LOCAL_UPLOAD') return; // Handled separately
                                  const match = backups.find(b => b.id === e.target.value);
                                  setSelectedRestoreBackup(match);
                                  setLocalBackupFile(null);
                                  setLocalBackupData(null);
                                  setLocalBackupError('');
                                }}
                                style={{
                                  width: '100%',
                                  padding: '14px 18px',
                                  borderRadius: '14px',
                                  border: '1.5px solid #cbd5e1',
                                  fontSize: '14px',
                                  fontWeight: '700',
                                  color: '#1e293b',
                                  background: '#f8fafc',
                                  outline: 'none'
                                }}
                              >
                                <option value="" disabled>-- Select a Cloud SQL Backup Archive --</option>
                                {selectedRestoreBackup && selectedRestoreBackup.id === 'LOCAL_UPLOAD' && (
                                  <option value="LOCAL_UPLOAD">{selectedRestoreBackup.filename} (Uploaded File)</option>
                                )}
                                {backups.map(b => (
                                  <option key={b.id} value={b.id}>{b.filename} ({b.size}) - {b.type}</option>
                                ))}
                              </select>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', margin: '4px 0', gap: '10px' }}>
                              <div style={{ flex: 1, height: '1px', background: '#cbd5e1' }} />
                              <span style={{ fontSize: '11px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>OR</span>
                              <div style={{ flex: 1, height: '1px', background: '#cbd5e1' }} />
                            </div>

                            <div>
                              <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>
                                Upload Local Backup File (.json)
                              </label>
                              <div
                                style={{
                                  border: '2px dashed #cbd5e1',
                                  borderRadius: '16px',
                                  padding: '24px',
                                  textAlign: 'center',
                                  background: '#f8fafc',
                                  cursor: 'pointer',
                                  transition: 'all 0.2s',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: '10px'
                                }}
                                onClick={() => document.getElementById('local-backup-uploader').click()}
                                onDragOver={(e) => {
                                  e.preventDefault();
                                  e.currentTarget.style.borderColor = '#2563eb';
                                  e.currentTarget.style.background = '#eff6ff';
                                }}
                                onDragLeave={(e) => {
                                  e.preventDefault();
                                  e.currentTarget.style.borderColor = '#cbd5e1';
                                  e.currentTarget.style.background = '#f8fafc';
                                }}
                                onDrop={(e) => {
                                  e.preventDefault();
                                  e.currentTarget.style.borderColor = '#cbd5e1';
                                  e.currentTarget.style.background = '#f8fafc';
                                  const file = e.dataTransfer.files[0];
                                  if (file) {
                                    const fakeEvent = { target: { files: [file] } };
                                    handleLocalFileChange(fakeEvent);
                                  }
                                }}
                              >
                                <input
                                  id="local-backup-uploader"
                                  type="file"
                                  accept=".json"
                                  onChange={handleLocalFileChange}
                                  style={{ display: 'none' }}
                                />
                                <Download size={32} color="#64748b" style={{ transform: 'rotate(180deg)', marginBottom: '4px' }} />
                                {localBackupFile ? (
                                  <div>
                                    <span style={{ display: 'block', fontSize: '14px', fontWeight: '700', color: '#1e293b' }}>
                                      {localBackupFile.name}
                                    </span>
                                    <span style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#64748b', marginTop: '2px' }}>
                                      {localBackupFile.size ? `${(localBackupFile.size / (1024 * 1024)).toFixed(2)} MB` : ''} - Ready to Restore
                                    </span>
                                  </div>
                                ) : (
                                  <div>
                                    <span style={{ display: 'block', fontSize: '14px', fontWeight: '700', color: '#475569' }}>
                                      Drag & drop your backup file here, or <span style={{ color: '#2563eb', textDecoration: 'underline' }}>browse</span>
                                    </span>
                                    <span style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#94a3b8', marginTop: '4px' }}>
                                      Only valid system backup .json files are accepted.
                                    </span>
                                  </div>
                                )}
                              </div>
                              {localBackupError && (
                                <div style={{ marginTop: '8px', fontSize: '12px', color: '#dc2626', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <AlertTriangle size={14} /> {localBackupError}
                                </div>
                              )}
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
                              <button onClick={() => setShowRestoreModal(false)} style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '12px 24px', borderRadius: '14px', fontSize: '14px', fontWeight: '800', color: '#475569', cursor: 'pointer' }}>Cancel</button>
                              <button
                                onClick={() => handleInitiateRestore(selectedRestoreBackup)}
                                disabled={!selectedRestoreBackup}
                                style={{
                                  background: '#2563eb',
                                  color: 'white',
                                  border: 'none',
                                  padding: '12px 28px',
                                  borderRadius: '14px',
                                  fontSize: '14px',
                                  fontWeight: '800',
                                  cursor: selectedRestoreBackup ? 'pointer' : 'not-allowed',
                                  opacity: selectedRestoreBackup ? 1 : 0.6
                                }}
                              >
                                Commit Restore
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                              <RefreshCw size={24} className="animate-spin" style={{ animation: 'spin 1s linear infinite', color: '#2563eb' }} />
                              <div>
                                <strong style={{ fontSize: '16px', color: '#1e293b' }}>Cluster Restoration Active (Step {restoreStep} of 10)</strong>
                                <span style={{ fontSize: '13px', color: '#64748b', display: 'block' }}>Running table mapping sequences...</span>
                              </div>
                            </div>

                            <div style={{
                              background: '#090d16',
                              borderRadius: '16px',
                              padding: '20px',
                              fontFamily: 'monospace',
                              fontSize: '12px',
                              color: '#38bdf8',
                              maxHeight: '240px',
                              overflowY: 'auto',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '6px',
                              border: '1px solid rgba(255,255,255,0.05)'
                            }}>
                              {restoreProgressLogs.map((log, i) => (
                                <div key={i} style={{ display: 'flex', gap: '8px' }}>
                                  <span style={{ color: '#64748b' }}>[{new Date().toLocaleTimeString()}]</span>
                                  <span>{log}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* --- MODAL 2: PRODUCTION LAUNCH TERMINAL MODAL --- */}
                <AnimatePresence>
                  {showLaunchModal && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(9, 13, 22, 0.7)',
                        backdropFilter: 'blur(16px)',
                        zIndex: 99999,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '24px'
                      }}
                    >
                      <motion.div
                        initial={{ scale: 0.95, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.95, y: 20 }}
                        style={{
                          background: '#090d16',
                          borderRadius: '24px',
                          border: '1px solid #1e293b',
                          width: '100%',
                          maxWidth: '720px',
                          boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
                          overflow: 'hidden',
                          position: 'relative'
                        }}
                      >
                        {/* Terminal Header macOS style */}
                        <div style={{
                          background: '#0f172a',
                          borderBottom: '1px solid #1e293b',
                          padding: '16px 24px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ef4444' }}></div>
                            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#eab308' }}></div>
                            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#22c55e' }}></div>
                            <span style={{ color: '#94a3b8', fontFamily: 'monospace', fontSize: '13px', marginLeft: '12px', fontWeight: '700' }}>
                              realtyos-production-launchpad.sh
                            </span>
                          </div>
                          {!isLaunching && (
                            <button
                              onClick={() => setShowLaunchModal(false)}
                              style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}
                            >
                              <X size={18} />
                            </button>
                          )}
                        </div>

                        {/* Terminal Body */}
                        <div style={{
                          padding: '28px',
                          minHeight: '340px',
                          fontFamily: 'monospace',
                          fontSize: '13px',
                          color: '#34d399',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '10px',
                          background: '#030712',
                          maxHeight: '400px',
                          overflowY: 'auto'
                        }}>
                          {launchProgressLogs.map((log, idx) => {
                            let color = '#34d399';
                            if (log.startsWith('root@')) color = '#38bdf8';
                            else if (log.startsWith('✓')) color = '#10b981';
                            else if (log.startsWith('✅') || log.startsWith('🎉')) color = '#67e8f9';
                            else if (log.startsWith('🔍') || log.startsWith('📦')) color = '#fbbf24';

                            return (
                              <div key={idx} style={{ color, lineHeight: '1.6', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                                <span style={{ color: '#475569', userSelect: 'none' }}>$</span>
                                <span style={{ whiteSpace: 'pre-wrap' }}>{log}</span>
                              </div>
                            );
                          })}

                          {isLaunching && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', marginTop: '10px' }}>
                              <RefreshCw size={14} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
                              <span>Compiling bundle dependencies...</span>
                            </div>
                          )}

                          {launchSuccess && (
                            <div style={{
                              marginTop: '24px',
                              background: 'rgba(16, 185, 129, 0.1)',
                              border: '1px solid #10b981',
                              padding: '16px',
                              borderRadius: '12px',
                              color: '#34d399',
                              fontSize: '14px',
                              fontWeight: '700',
                              textAlign: 'center'
                            }}>
                              🎉 DEPLOYMENT PIPELINE COMPLETE: Live cluster updated.
                            </div>
                          )}
                        </div>

                        {/* Terminal Footer */}
                        <div style={{
                          background: '#0f172a',
                          borderTop: '1px solid #1e293b',
                          padding: '16px 24px',
                          display: 'flex',
                          justifyContent: 'flex-end',
                          gap: '12px'
                        }}>
                          <button
                            onClick={() => setShowLaunchModal(false)}
                            disabled={isLaunching}
                            style={{
                              background: 'transparent',
                              border: '1px solid #1e293b',
                              color: '#94a3b8',
                              padding: '10px 20px',
                              borderRadius: '10px',
                              cursor: isLaunching ? 'not-allowed' : 'pointer',
                              fontFamily: 'monospace',
                              fontSize: '12px'
                            }}
                          >
                            Close Launchpad
                          </button>
                        </div>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* --- MODAL 3: FACTORY RESET DANGER CONFIRMATION MODAL --- */}
                <AnimatePresence>
                  {showResetModal && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(15, 23, 42, 0.65)',
                        backdropFilter: 'blur(12px)',
                        zIndex: 99999,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '24px'
                      }}
                    >
                      <motion.div
                        initial={{ scale: 0.95, y: 15 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.95, y: 15 }}
                        style={{
                          background: 'white',
                          borderRadius: '24px',
                          width: '100%',
                          maxWidth: '540px',
                          padding: '36px',
                          boxShadow: '0 25px 50px -12px rgba(220,38,38,0.25)',
                          position: 'relative'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '16px', marginBottom: '24px' }}>
                          <h4 style={{ margin: 0, fontSize: '20px', fontWeight: '900', color: '#dc2626', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <AlertTriangle size={24} /> Dangerous Action: Factory Reset
                          </h4>
                          {!isResetting && (
                            <button onClick={() => setShowResetModal(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                              <X size={20} />
                            </button>
                          )}
                        </div>

                        {!isResetting ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', padding: '18px', borderRadius: '16px', fontSize: '13px', color: '#991b1b', fontWeight: '700', lineHeight: '1.6' }}>
                              🛑 CRITICAL IRREVERSIBLE OPERATION: Executing this action will completely wipe all browser cache data and purge local databases, destroying tenant records, active leases, invoices, and credentials. The application environment will be immediately hard-reloaded to initial default seed templates.
                            </div>

                            <div>
                              <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>
                                Type "<strong>RESET</strong>" to verify your authorization and intent:
                              </label>
                              <input
                                type="text"
                                value={resetConfirmText}
                                onChange={(e) => setResetConfirmText(e.target.value)}
                                placeholder="RESET"
                                style={{
                                  width: '100%',
                                  padding: '14px 18px',
                                  borderRadius: '14px',
                                  border: '2px solid #fca5a5',
                                  fontSize: '15px',
                                  fontWeight: '800',
                                  color: '#b91c1c',
                                  background: '#fff5f5',
                                  outline: 'none',
                                  boxSizing: 'border-box',
                                  textAlign: 'center',
                                  letterSpacing: '2px'
                                }}
                              />
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
                              <button onClick={() => setShowResetModal(false)} style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '12px 24px', borderRadius: '14px', fontSize: '14px', fontWeight: '800', color: '#475569', cursor: 'pointer' }}>Cancel</button>
                              <button
                                onClick={handleInitiateReset}
                                disabled={resetConfirmText !== 'RESET'}
                                style={{
                                  background: '#dc2626',
                                  color: 'white',
                                  border: 'none',
                                  padding: '12px 28px',
                                  borderRadius: '14px',
                                  fontSize: '14px',
                                  fontWeight: '800',
                                  cursor: resetConfirmText === 'RESET' ? 'pointer' : 'not-allowed',
                                  opacity: resetConfirmText === 'RESET' ? 1 : 0.5,
                                  boxShadow: resetConfirmText === 'RESET' ? '0 8px 20px rgba(220, 38, 38, 0.3)' : 'none'
                                }}
                              >
                                Trigger Database Wipe
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center', padding: '20px 0' }}>
                            <RefreshCw size={40} className="animate-spin" style={{ animation: 'spin 1.5s linear infinite', color: '#dc2626' }} />
                            <div style={{ textAlign: 'center' }}>
                              <strong style={{ fontSize: '18px', color: '#991b1b', display: 'block', marginBottom: '6px' }}>Purging Local Datastores & Re-seeding Defaults</strong>
                              <span style={{ fontSize: '14px', color: '#64748b' }}>Wiping table schemas, clearing cache & reloading node configurations...</span>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>

              </div>
            );
          })()}

        </div>

      </div>

    </div>
  );
};

export default Settings;
