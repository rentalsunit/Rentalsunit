import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings as SettingsIcon, User, Bell, Shield, Database, Globe, Building2, 
  CreditCard, Lock, Key, FileText, CheckCircle2, AlertTriangle, Server, 
  HardDrive, Download, RefreshCw, Sliders, Mail, PhoneCall, DollarSign, 
  SlidersHorizontal, Layers, History, UserCheck, Eye, EyeOff,
  Check, X, Activity, ExternalLink, Zap, UserPlus, MoreVertical, Copy, 
  KeyRound, LogIn, Unlock, AlertCircle, ShieldCheck, Plus, CheckSquare, Square
} from 'lucide-react';

const Settings = () => {
  const [activeSection, setActiveSection] = useState('profile');
  const [successMsg, setSuccessMsg] = useState('');

  // Form States - Profile from localStorage
  const [userProfile, setUserProfile] = useState(() => {
    const saved = localStorage.getItem('realtyos_user_profile');
    let parsed = null;
    if (saved) {
      try { parsed = JSON.parse(saved); } catch(e) {}
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
        } catch(e) {}
      }
    };
    window.addEventListener('realtyos_profile_updated', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('realtyos_profile_updated', handleSync);
      window.removeEventListener('storage', handleSync);
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

  // --- ENTERPRISE EMPLOYEES DIRECTORY (Staff without login access) ---
  const [enterpriseEmployees, setEnterpriseEmployees] = useState([
    { id: 'EMP-K9X2', name: 'Louis Kemenyo', role: 'Portfolio Director', email: 'louis@realtyos.gh', phone: '+233 54 102 9384', hasLogin: true },
    { id: 'EMP-M4T8', name: 'Sarah Miller', role: 'Head of Leasing', email: 'sarah.m@realtyos.gh', phone: '+233 20 882 1092', hasLogin: true },
    { id: 'EMP-E7R1', name: 'Michael K.', role: 'Chief Facility Engineer', email: 'michael.k@realtyos.gh', phone: '+233 24 771 2930', hasLogin: true },
    { id: 'EMP-A2P4', name: 'Sarah Osei', role: 'Senior Portfolio Accountant', email: 'sarah.o@realtyos.gh', phone: '+233 55 901 8823', hasLogin: true },
    { id: 'EMP-W8N5', name: 'David Wilson', role: 'Safety & Compliance Chief', email: 'david.w@realtyos.gh', phone: '+233 26 441 9021', hasLogin: true },
    // Employees currently WITHOUT login access:
    { id: 'EMP-S3Q1', name: 'Kwame Mensah', role: 'Security Detail Lead', email: 'kwame.m@realtyos.gh', phone: '+233 27 331 9920', hasLogin: false },
    { id: 'EMP-V9B7', name: 'Victoria Addo', role: 'Client Experience Executive', email: 'vicky.a@realtyos.gh', phone: '+233 50 119 2839', hasLogin: false },
    { id: 'EMP-T1Z6', name: 'Kofi Antwi', role: 'HVAC Specialist Technician', email: 'kofi.a@realtyos.gh', phone: '+233 24 991 1029', hasLogin: false }
  ]);

  // --- SYSTEM USERS (Staff with active or temporary login credentials) ---
  const [systemUsers, setSystemUsers] = useState([
    { id: 'EMP-K9X2', name: 'Louis Kemenyo', username: 'louis.kemenyo', email: 'louis@realtyos.gh', role: 'Executive Administrator', phone: '+233 54 102 9384', lastLogin: 'Today, 01:15 AM', twoFactor: true, status: 'Active', isFirstLogin: false },
    { id: 'EMP-M4T8', name: 'Sarah Miller', username: 'sarah.miller', email: 'sarah.m@realtyos.gh', role: 'Senior Property Manager', phone: '+233 20 882 1092', lastLogin: 'Yesterday, 04:30 PM', twoFactor: true, status: 'Active', isFirstLogin: false },
    { id: 'EMP-E7R1', name: 'Michael K.', username: 'michael.k', email: 'michael.k@realtyos.gh', role: 'Maintenance Dispatcher', phone: '+233 24 771 2930', lastLogin: 'May 15, 11:20 AM', twoFactor: true, status: 'Active', isFirstLogin: false },
    { id: 'EMP-A2P4', name: 'Sarah Osei', username: 'sarah.osei', email: 'sarah.o@realtyos.gh', role: 'Financial Controller', phone: '+233 55 901 8823', lastLogin: 'May 14, 09:00 AM', twoFactor: false, status: 'Active', isFirstLogin: false },
    { id: 'EMP-W8N5', name: 'David Wilson', username: 'david.wilson', email: 'david.w@realtyos.gh', role: 'Executive Administrator', phone: '+233 26 441 9021', lastLogin: 'May 12, 02:15 PM', twoFactor: true, status: 'Active', isFirstLogin: false }
  ]);

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
      email: emp.email,
      role: selectedRoleForAccess,
      phone: emp.phone,
      lastLogin: 'Pending 1st Login (Temporary Pass)',
      twoFactor: false,
      status: 'Pending 1st Login',
      isFirstLogin: true,
      tempPassGiven: tempPassword
    };

    setSystemUsers([newUserCred, ...systemUsers]);
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
    setSystemUsers(systemUsers.filter(u => u.id !== userId));
    setEnterpriseEmployees(enterpriseEmployees.map(e => e.id === userId ? { ...e, hasLogin: false } : e));
    setSuccessMsg(`User access revoked for ${userToRevoke?.name || 'employee'} and active API tokens terminated.`);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleStartFirstLoginSimulation = (user) => {
    setSimulatingFirstLoginEmp(user);
    setFirstLoginTempPassInput(user.tempPassGiven || 'Realty-XXXX');
    setFirstLoginNewPassInput('');
    setFirstLoginConfirmPassInput('');
  };

  const handleConfirmFirstLoginPasswordChange = (e) => {
    e.preventDefault();
    if (firstLoginNewPassInput !== firstLoginConfirmPassInput) {
      alert("New password and confirmation do not match!");
      return;
    }
    if (firstLoginNewPassInput.length < 8) {
      alert("Password must be at least 8 characters for enterprise security.");
      return;
    }

    setSystemUsers(systemUsers.map(u => {
      if (u.id === simulatingFirstLoginEmp.id) {
        return {
          ...u,
          status: 'Active',
          isFirstLogin: false,
          lastLogin: 'Just Now (Password Established)',
          twoFactor: true
        };
      }
      return u;
    }));

    const empName = simulatingFirstLoginEmp.name;
    setSimulatingFirstLoginEmp(null);
    setSuccessMsg(`🔒 Success: ${empName} has successfully completed the first-time password setup protocol! Account is now Active.`);
    setTimeout(() => setSuccessMsg(''), 5000);
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

  const handleRunBackup = () => {
    const newBak = {
      id: `BAK-00${backups.length + 1}`,
      filename: `realtyos_manual_snapshot_${new Date().toISOString().slice(0,10).replace(/-/g,'_')}.sql.gz`,
      size: `${(485 + Math.random() * 5).toFixed(1)} MB`,
      type: 'Manual On-Demand Export',
      status: 'Verified Secure'
    };
    setBackups([newBak, ...backups]);
    setSuccessMsg('Instant database snapshot generated successfully! Encrypted archive stored on secure S3 bucket.');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const sections = [
    { id: 'profile', label: 'Executive Account & MFA', icon: User, desc: 'Manage biometric logins, 2FA security, and personal credentials.' },
    { id: 'organization', label: 'Corporate Profile & Legal TIN', icon: Building2, desc: 'Company legal title, VAT registration, and HQ contact details.' },
    { id: 'users', label: 'Users & System Permissions', icon: UserCheck, desc: 'Allocate employee login access, temporary passwords, and role privileges.' },
    { id: 'integrations', label: 'Payment Gateways & APIs', icon: Zap, desc: 'Paystack, MTN MoMo API, Zeepay, and Arkesel SMS integrations.' },
    { id: 'rbac', label: 'Role Permissions & Access', icon: Shield, desc: 'Enterprise Role-Based Access Control (RBAC) and user groups.' },
    { id: 'database', label: 'Database & Cloud Backups', icon: Database, desc: 'Automated daily snapshots, Supabase cluster status, and SQL dumps.' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', width: '100%', boxSizing: 'border-box' }}>
      
      {/* HEADER BANNER */}
      <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)', borderRadius: '32px', padding: '40px 48px', color: 'white', position: 'relative', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.4)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
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

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '32px' }}>
        
        {/* SIDEBAR NAVIGATION WITHIN MANAGEMENT */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
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
        <div style={{ background: 'white', borderRadius: '32px', border: '1px solid #cbd5e1', padding: '40px', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
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

              <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderLeft: '4px solid #6366f1', padding: '16px 20px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '14px', fontSize: '13px', color: '#334155', fontWeight: '600', lineHeight: '1.5' }}>
                <Lock size={20} color="#6366f1" style={{ flexShrink: 0 }} />
                <span>
                  <strong>HR Controlled Records:</strong> Your legal name, executive job title, and department are officially assigned during onboarding. Modifications can only be committed by authorized HR personnel via the Staff Directory.
                </span>
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

              <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '24px 28px', borderRadius: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: '#10b981', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Lock size={24} />
                  </div>
                  <div>
                    <h4 style={{ margin: '0 0 4px', fontSize: '18px', fontWeight: '900', color: '#065f46' }}>Two-Factor Authentication (2FA / MFA)</h4>
                    <span style={{ fontSize: '13px', color: '#047857', fontWeight: '600' }}>Active security protocol requiring biometric app authentication or SMS PIN on login</span>
                  </div>
                </div>
                <button 
                  onClick={() => setEnable2FA(!enable2FA)}
                  style={{ padding: '10px 20px', borderRadius: '16px', border: enable2FA ? '1px solid #a7f3d0' : '1px solid #cbd5e1', background: enable2FA ? '#10b981' : 'white', color: enable2FA ? 'white' : '#334155', fontWeight: '900', fontSize: '14px', cursor: 'pointer' }}
                >
                  {enable2FA ? '2FA Enabled' : 'Enable 2FA'}
                </button>
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

              {/* INLINE DRAWER: GRANT LOGIN ACCESS TO EXISTING EMPLOYEE */}
              <AnimatePresence>
                {showGrantAccessModal && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    style={{ background: '#f8fafc', border: '2px solid var(--primary)', borderRadius: '24px', padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px', overflow: 'hidden' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '16px' }}>
                      <h4 style={{ margin: 0, fontSize: '20px', fontWeight: '900', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <KeyRound size={22} color="var(--primary)" /> Grant Login Credentials to Registered Staff
                      </h4>
                      <button type="button" onClick={() => setShowGrantAccessModal(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                        <X size={20} />
                      </button>
                    </div>

                    {!generatedCreds ? (
                      <form onSubmit={handleGenerateCredentials} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', padding: '16px 20px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px', color: '#1e3a8a', fontWeight: '700' }}>
                          <AlertCircle size={20} style={{ flexShrink: 0 }} />
                          <span>Select an existing employee who currently lacks system login access to generate a username and temporary password.</span>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                          <div>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '8px' }}>Select Unassigned Employee</label>
                            <select 
                              value={selectedEmpForAccess} 
                              onChange={e => setSelectedEmpForAccess(e.target.value)} 
                              style={{ width: '100%', padding: '16px 20px', borderRadius: '16px', border: '1px solid #cbd5e1', fontSize: '15px', fontWeight: '800', color: 'var(--text-main)', outline: 'none', background: 'white' }}
                            >
                              {enterpriseEmployees.filter(e => !e.hasLogin).map(emp => (
                                <option key={emp.id} value={emp.id}>{emp.name} ({emp.role} • {emp.email})</option>
                              ))}
                              {enterpriseEmployees.filter(e => !e.hasLogin).length === 0 && (
                                <option value="">✅ All registered enterprise employees already have active login access</option>
                              )}
                            </select>
                          </div>

                          <div>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '8px' }}>Assigned RBAC Permission Group</label>
                            <select 
                              value={selectedRoleForAccess} 
                              onChange={e => setSelectedRoleForAccess(e.target.value)} 
                              style={{ width: '100%', padding: '16px 20px', borderRadius: '16px', border: '1px solid #cbd5e1', fontSize: '15px', fontWeight: '800', color: 'var(--primary)', outline: 'none', background: 'white' }}
                            >
                              {rolesList.map(role => (
                                <option key={role.id} value={role.name}>{role.name} ({role.id})</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginTop: '12px' }}>
                          <button type="button" onClick={() => setShowGrantAccessModal(false)} style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', color: '#475569', padding: '14px 28px', borderRadius: '16px', fontWeight: '800', fontSize: '14px', cursor: 'pointer' }}>Cancel</button>
                          <button 
                            type="submit" 
                            disabled={enterpriseEmployees.filter(e => !e.hasLogin).length === 0}
                            style={{ background: 'var(--primary)', border: 'none', color: 'white', padding: '14px 32px', borderRadius: '16px', fontWeight: '800', fontSize: '14px', cursor: 'pointer', boxShadow: '0 8px 20px rgba(0, 135, 90, 0.3)', opacity: enterpriseEmployees.filter(e => !e.hasLogin).length === 0 ? 0.5 : 1 }}
                          >
                            Generate Temporary Credentials
                          </button>
                        </div>
                      </form>
                    ) : (
                      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ background: '#ecfdf5', border: '1px solid #10b981', borderRadius: '20px', padding: '32px', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center', textAlign: 'center' }}>
                        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#10b981', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', fontWeight: 'bold', boxShadow: '0 10px 25px rgba(16, 185, 129, 0.3)' }}>
                          ✓
                        </div>
                        <div>
                          <h4 style={{ margin: '0 0 8px', fontSize: '22px', fontWeight: '900', color: '#065f46' }}>Credentials Generated for {generatedCreds.empName}</h4>
                          <p style={{ margin: 0, fontSize: '14px', color: '#047857', maxWidth: '500px', lineHeight: '1.5' }}>
                            The IT Department has securely created login credentials. The employee will be required to establish their own private password upon successful first login.
                          </p>
                        </div>

                        <div style={{ background: 'white', border: '1px solid #a7f3d0', borderRadius: '16px', padding: '24px 36px', display: 'flex', gap: '32px', alignItems: 'center', boxShadow: '0 8px 20px rgba(0,0,0,0.05)' }}>
                          <div>
                            <span style={{ fontSize: '12px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>System Username</span>
                            <strong style={{ fontSize: '18px', color: '#0f172a', fontFamily: 'monospace' }}>{generatedCreds.username}</strong>
                          </div>
                          <div style={{ width: '1px', height: '36px', background: '#cbd5e1' }}></div>
                          <div>
                            <span style={{ fontSize: '12px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Temporary Password</span>
                            <strong style={{ fontSize: '18px', color: 'var(--primary)', fontFamily: 'monospace' }}>{generatedCreds.tempPassword}</strong>
                          </div>
                          <button 
                            onClick={() => {
                              navigator.clipboard.writeText(`Username: ${generatedCreds.username}\nTemporary Password: ${generatedCreds.tempPassword}`);
                              alert('Credentials copied to clipboard!');
                            }} 
                            style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '12px 20px', borderRadius: '12px', fontSize: '13px', fontWeight: '800', color: '#334155', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '16px' }}
                          >
                            <Copy size={16} /> Copy Credentials
                          </button>
                        </div>

                        <button onClick={() => setShowGrantAccessModal(false)} style={{ background: '#10b981', color: 'white', border: 'none', padding: '14px 36px', borderRadius: '16px', fontWeight: '800', fontSize: '15px', cursor: 'pointer', boxShadow: '0 8px 20px rgba(16, 185, 129, 0.4)', marginTop: '8px' }}>
                          Done & Return to Users List
                        </button>
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* POP-UP MODAL: SIMULATE FIRST-TIME LOGIN PASSWORD CHANGE */}
              <AnimatePresence>
                {simulatingFirstLoginEmp && (
                  <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(10px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      style={{ background: 'white', borderRadius: '32px', padding: '48px', maxWidth: '600px', width: '100%', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', border: '1px solid #cbd5e1', display: 'flex', flexDirection: 'column', gap: '28px' }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #e2e8f0', paddingBottom: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <div style={{ width: '56px', height: '56px', borderRadius: '20px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Unlock size={28} />
                          </div>
                          <div>
                            <span style={{ padding: '4px 12px', background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a', borderRadius: '14px', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase' }}>First-Time Authentication Protocol</span>
                            <h3 style={{ margin: '6px 0 0', fontSize: '24px', fontWeight: '900', color: '#0f172a' }}>Establish Permanent Password</h3>
                          </div>
                        </div>
                        <button onClick={() => setSimulatingFirstLoginEmp(null)} style={{ background: '#f1f5f9', border: 'none', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b' }}>
                          <X size={18} />
                        </button>
                      </div>

                      <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '20px', border: '1px solid #e2e8f0', fontSize: '14px', color: '#334155', lineHeight: '1.6' }}>
                        Welcome, <strong style={{ color: 'var(--primary)' }}>{simulatingFirstLoginEmp.name}</strong> ({simulatingFirstLoginEmp.username}). You are logging in for the first time with temporary credentials. Enterprise compliance mandates that you immediately replace your temporary password with a secure, permanent confidential password.
                      </div>

                      <form onSubmit={handleConfirmFirstLoginPasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '13px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '8px' }}>Current Temporary Password</label>
                          <input type="text" value={firstLoginTempPassInput} disabled style={{ width: '100%', padding: '16px 20px', borderRadius: '16px', border: '1px solid #cbd5e1', fontSize: '15px', fontWeight: '800', color: '#64748b', background: '#f1f5f9', boxSizing: 'border-box' }} />
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '13px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '8px' }}>New Confidential Password (Min 8 chars)</label>
                          <input type="password" placeholder="Enter robust new password" value={firstLoginNewPassInput} onChange={e => setFirstLoginNewPassInput(e.target.value)} style={{ width: '100%', padding: '16px 20px', borderRadius: '16px', border: '1px solid #cbd5e1', fontSize: '15px', fontWeight: '800', color: '#0f172a', outline: 'none', background: 'white', boxSizing: 'border-box' }} required />
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '13px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '8px' }}>Confirm New Password</label>
                          <input type="password" placeholder="Re-enter robust new password" value={firstLoginConfirmPassInput} onChange={e => setFirstLoginConfirmPassInput(e.target.value)} style={{ width: '100%', padding: '16px 20px', borderRadius: '16px', border: '1px solid #cbd5e1', fontSize: '15px', fontWeight: '800', color: '#0f172a', outline: 'none', background: 'white', boxSizing: 'border-box' }} required />
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginTop: '16px' }}>
                          <button type="button" onClick={() => setSimulatingFirstLoginEmp(null)} style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', color: '#475569', padding: '16px 28px', borderRadius: '16px', fontWeight: '800', fontSize: '15px', cursor: 'pointer' }}>Cancel Protocol</button>
                          <button type="submit" style={{ background: 'var(--primary)', border: 'none', color: 'white', padding: '16px 36px', borderRadius: '16px', fontWeight: '800', fontSize: '15px', cursor: 'pointer', boxShadow: '0 8px 25px rgba(0, 135, 90, 0.4)' }}>
                            Commit Permanent Password & Activate Account
                          </button>
                        </div>
                      </form>
                    </motion.div>
                  </div>
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

                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      {user.isFirstLogin ? (
                        <button 
                          onClick={() => handleStartFirstLoginSimulation(user)}
                          style={{ background: '#f59e0b', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '16px', fontSize: '13px', fontWeight: '900', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 6px 15px rgba(245, 158, 11, 0.4)', animation: 'pulse 2s infinite' }}
                        >
                          <LogIn size={16} /> Simulate First Login
                        </button>
                      ) : (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '800', color: user.twoFactor ? '#10b981' : '#94a3b8', background: user.twoFactor ? '#ecfdf5' : '#f1f5f9', padding: '6px 12px', borderRadius: '14px', border: user.twoFactor ? '1px solid #a7f3d0' : '1px solid #cbd5e1' }}>
                          <Lock size={14} /> {user.twoFactor ? '2FA Secured' : '2FA Inactive'}
                        </span>
                      )}

                      <button onClick={() => handleRevokeUser(user.id)} style={{ background: '#fef2f2', border: '1px solid #fca5a5', color: '#dc2626', padding: '10px 18px', borderRadius: '16px', fontSize: '13px', fontWeight: '800', cursor: 'pointer', transition: 'all 0.2s' }}>
                        Revoke Access
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* --- SECTION 4: INTEGRATIONS & GATEWAYS --- */}
          {activeSection === 'integrations' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #cbd5e1', paddingBottom: '20px' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '24px', fontWeight: '900', color: 'var(--text-main)' }}>Payment Gateways & SMS Integrations</h3>
                  <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '600' }}>API Keys for automated rent collection, mobile money disbursement, and SMS alerts</span>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button 
                    onClick={() => setShowApiKeys(!showApiKeys)}
                    style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '14px 20px', borderRadius: '18px', fontSize: '14px', fontWeight: '800', color: '#334155', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                  >
                    {showApiKeys ? <EyeOff size={18} /> : <Eye size={18} />} {showApiKeys ? 'Hide Keys' : 'Reveal API Keys'}
                  </button>
                  <button onClick={() => handleSaveNotification('API Integration')} style={{ background: 'var(--primary)', color: 'white', border: 'none', padding: '14px 28px', borderRadius: '18px', fontSize: '14px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 8px 20px -5px rgba(0, 135, 90, 0.4)' }}>
                    <Check size={18} /> Save API Endpoints
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div style={{ background: '#f8fafc', padding: '28px', borderRadius: '24px', border: '1px solid #cbd5e1' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h4 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <CreditCard size={20} color="#0284c7" /> Paystack Ghana API Gateway (Card & Bank Transfers)
                    </h4>
                    <span style={{ padding: '4px 12px', background: '#ecfdf5', color: '#00875a', border: '1px solid #a7f3d0', borderRadius: '14px', fontSize: '12px', fontWeight: '800' }}>Webhook Active</span>
                  </div>
                  <input 
                    type={showApiKeys ? 'text' : 'password'} 
                    value={showApiKeys ? 'pk_live_8921a4f0b3e7c829d104e5f7b8c9a012' : paystackKey} 
                    onChange={e => setPaystackKey(e.target.value)} 
                    style={{ width: '100%', padding: '16px 20px', borderRadius: '16px', border: '1px solid #cbd5e1', fontSize: '15px', fontWeight: '800', fontFamily: 'monospace', color: '#0f172a', outline: 'none', background: 'white', boxSizing: 'border-box' }} 
                  />
                </div>

                <div style={{ background: '#f8fafc', padding: '28px', borderRadius: '24px', border: '1px solid #cbd5e1' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h4 style={{ margin: '0', fontSize: '18px', fontWeight: '800', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Zap size={20} color="#f59e0b" /> MTN Mobile Money API / Zeepay Merchant Key
                    </h4>
                    <span style={{ padding: '4px 12px', background: '#ecfdf5', color: '#00875a', border: '1px solid #a7f3d0', borderRadius: '14px', fontSize: '12px', fontWeight: '800' }}>MoMo Direct Connected</span>
                  </div>
                  <input 
                    type={showApiKeys ? 'text' : 'password'} 
                    value={showApiKeys ? 'momo_disb_live_994821039485721903847788' : momoKey} 
                    onChange={e => setMomoKey(e.target.value)} 
                    style={{ width: '100%', padding: '16px 20px', borderRadius: '16px', border: '1px solid #cbd5e1', fontSize: '15px', fontWeight: '800', fontFamily: 'monospace', color: '#0f172a', outline: 'none', background: 'white', boxSizing: 'border-box' }} 
                  />
                </div>

                <div style={{ background: '#f8fafc', padding: '28px', borderRadius: '24px', border: '1px solid #cbd5e1' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h4 style={{ margin: '0', fontSize: '18px', fontWeight: '800', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Mail size={20} color="#7c3aed" /> Automated SMS Notification Gateway Provider
                    </h4>
                    <span style={{ padding: '4px 12px', background: '#ede9fe', color: '#6d28d9', border: '1px solid #ddd6fe', borderRadius: '14px', fontSize: '12px', fontWeight: '800' }}>Default Gateway</span>
                  </div>
                  <select value={smsGateway} onChange={e => setSmsGateway(e.target.value)} style={{ width: '100%', padding: '16px 20px', borderRadius: '16px', border: '1px solid #cbd5e1', fontSize: '15px', fontWeight: '800', color: '#0f172a', outline: 'none', background: 'white' }}>
                    <option value="Arkesel Ghana SMS API">Arkesel Ghana SMS API (Primary)</option>
                    <option value="MNotify Enterprise Gateway">MNotify Enterprise Gateway (Backup)</option>
                    <option value="Twilio International SMS">Twilio International SMS</option>
                  </select>
                </div>
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
          {activeSection === 'database' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #cbd5e1', paddingBottom: '20px' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '24px', fontWeight: '900', color: 'var(--text-main)' }}>Database Snapshots & Cloud Recovery</h3>
                  <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '600' }}>PostgreSQL cluster replication logs, daily snapshot archives, and manual SQL dumps</span>
                </div>
                <button onClick={handleRunBackup} style={{ background: 'var(--primary)', color: 'white', border: 'none', padding: '14px 28px', borderRadius: '18px', fontSize: '14px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 8px 20px -5px rgba(0, 135, 90, 0.4)' }}>
                  <RefreshCw size={18} /> Trigger Manual DB Snapshot
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '24px', borderRadius: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: '#10b981', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Server size={24} />
                  </div>
                  <div>
                    <h4 style={{ margin: '0 0 4px', fontSize: '18px', fontWeight: '900', color: '#065f46' }}>PostgreSQL Cluster Node 1</h4>
                    <span style={{ fontSize: '13px', color: '#047857', fontWeight: '700' }}>Active replication • SSL Encrypted Connection</span>
                  </div>
                </div>

                <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', padding: '24px', borderRadius: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: '#2563eb', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <HardDrive size={24} />
                  </div>
                  <div>
                    <h4 style={{ margin: '0 0 4px', fontSize: '18px', fontWeight: '900', color: '#1e3a8a' }}>Automated Cloud Retention</h4>
                    <span style={{ fontSize: '13px', color: '#1d4ed8', fontWeight: '700' }}>Daily snapshots retained for 30 consecutive days</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h4 style={{ margin: '10px 0 0', fontSize: '18px', fontWeight: '800', color: 'var(--text-main)' }}>Available Encrypted Cloud Archives</h4>
                {backups.map(bak => (
                  <div key={bak.id} style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '20px', padding: '20px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
                        <span style={{ padding: '3px 10px', background: '#e2e8f0', borderRadius: '12px', fontSize: '11px', fontWeight: '900', color: '#334155' }}>{bak.id}</span>
                        <span style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: '800' }}>{bak.type}</span>
                      </div>
                      <h4 style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: '800', color: 'var(--text-main)', fontFamily: 'monospace' }}>{bak.filename}</h4>
                      <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '700' }}>Archive Size: {bak.size}</span>
                    </div>
                    <button onClick={() => alert(`Downloading secure archive ${bak.filename}...`)} style={{ background: 'white', border: '1px solid #0284c7', color: '#0284c7', padding: '10px 20px', borderRadius: '14px', fontSize: '13px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Download size={16} /> Download Archive
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};

export default Settings;
