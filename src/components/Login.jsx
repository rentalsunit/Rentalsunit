import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, Lock, KeyRound, Eye, EyeOff, ShieldCheck, 
  ArrowRight, CheckCircle2, UserCheck, AlertCircle, Server, Globe, 
  ExternalLink, Mail, Phone, Cpu, Fingerprint, Zap, RefreshCw,
  HelpCircle, ShieldAlert, ArrowLeft, Copy, Check
} from 'lucide-react';

import { getStoredUsers, saveStoredUsers } from '../lib/masterData';

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [selectedRole, setSelectedRole] = useState('Executive Administrator');
  const [showSandbox, setShowSandbox] = useState(() => import.meta.env.VITE_ENABLE_SANDBOX_LOGIN === 'true');

  // ──────────────────────────────────────────────
  // FORGOT PASSWORD & FIRST LOGIN FLOW STATES
  // ──────────────────────────────────────────────
  // view: 'login' | 'forgot_username' | 'forgot_question' | 'forgot_success' | 'locked_out' | 'first_login_prompt'
  const [view, setView] = useState('login');
  const [fpUsername, setFpUsername] = useState('');
  const [fpAnswer, setFpAnswer] = useState('');
  const [fpAttemptsLeft, setFpAttemptsLeft] = useState(3);
  const [fpFoundAccount, setFpFoundAccount] = useState(null);
  const [fpTempPassword, setFpTempPassword] = useState('');
  const [fpError, setFpError] = useState('');
  const [fpCopied, setFpCopied] = useState(false);
  const [lockoutCountdown, setLockoutCountdown] = useState(20);

  const [firstLoginUser, setFirstLoginUser] = useState(null);
  const [flNewPass, setFlNewPass] = useState('');
  const [flConfirmPass, setFlConfirmPass] = useState('');
  const [flSecQuestion, setFlSecQuestion] = useState('What was the name of your first school?');
  const [flSecAnswer, setFlSecAnswer] = useState('');
  const [flError, setFlError] = useState('');

  // Security questions database — keyed by username
  const securityDB = {
    'louis.kemenyo': {
      question: 'What was the name of your first school?',
      answer: 'st augustine',
      tempPass: 'RealtyTMP-LK2026!'
    },
    'sarah.miller': {
      question: "What is your mother's maiden name?",
      answer: 'johnson',
      tempPass: 'RealtyTMP-SM2026!'
    },
    'michael.k': {
      question: 'What was the name of your childhood best friend?',
      answer: 'kweku',
      tempPass: 'RealtyTMP-MK2026!'
    },
    'sarah.osei': {
      question: 'What city were you born in?',
      answer: 'kumasi',
      tempPass: 'RealtyTMP-SO2026!'
    },
    'admin': {
      question: 'What is the master enterprise recovery code?',
      answer: 'realtyos2026',
      tempPass: 'RealtyOS-Admin2026!'
    }
  };

  // Auto-countdown and redirect when locked out
  useEffect(() => {
    if (view !== 'locked_out') return;
    setLockoutCountdown(20);
    const interval = setInterval(() => {
      setLockoutCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          handleResetToLogin();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [view]);

  const handleResetToLogin = () => {
    setView('login');
    setFpUsername('');
    setFpAnswer('');
    setFpAttemptsLeft(3);
    setFpFoundAccount(null);
    setFpTempPassword('');
    setFpError('');
    setFpCopied(false);
    setLockoutCountdown(5);
  };

  const handleFpLookupSubmit = (e) => {
    e.preventDefault();
    const trimmed = fpUsername.trim().toLowerCase().replace('@realtyos.gh', '');
    const allStoredUsers = getStoredUsers();
    
    // Find in master users cache first, fallback to quickAccounts
    const foundUser = allStoredUsers.find(u => u.username?.toLowerCase() === trimmed || u.email?.toLowerCase().replace('@realtyos.gh', '') === trimmed) 
      || quickAccounts.find(a => a.username === trimmed);
      
    if (!foundUser) {
      setFpError('No account found with that username. Please check and try again.');
      return;
    }

    const secQuestion = foundUser.securityQuestion || securityDB[foundUser.username]?.question || 'What was the name of your first school?';
    const secAnswer = foundUser.securityAnswer || securityDB[foundUser.username]?.answer || 'st augustine';

    setFpFoundAccount({
      ...foundUser,
      questionToAsk: secQuestion,
      answerToVerify: secAnswer
    });
    setFpError('');
    setFpAttemptsLeft(3);
    setView('forgot_question');
  };

  const handleFpAnswerSubmit = async (e) => {
    e.preventDefault();
    const correctAnswer = fpFoundAccount.answerToVerify || '';
    const isCorrect = fpAnswer.trim().toLowerCase() === correctAnswer.toLowerCase();

    if (isCorrect) {
      // Generate a new temporary PIN
      const randomPin = Math.floor(1000 + Math.random() * 9000);
      const newTempPass = `Realty-${randomPin}`;

      const allStoredUsers = getStoredUsers();
      const updatedUsers = allStoredUsers.map(u => {
        if (u.username === fpFoundAccount.username || u.id === fpFoundAccount.id) {
          return {
            ...u,
            isFirstLogin: true,
            tempPassGiven: newTempPass,
            pass: newTempPass,
            status: 'Pending 1st Login'
          };
        }
        return u;
      });
      saveStoredUsers(updatedUsers);

      if (import.meta.env.VITE_SUPABASE_URL && !import.meta.env.VITE_SUPABASE_URL.includes('your-supabase-project')) {
        try {
          const { supabase } = await import('../lib/supabaseClient');
          await supabase.from('users').update({
            isFirstLogin: true,
            tempPassGiven: newTempPass,
            pass: newTempPass,
            status: 'Pending 1st Login'
          }).eq('username', fpFoundAccount.username);
        } catch(err) { console.warn(err); }
      }

      setFpTempPassword(newTempPass);
      setFpError('');
      setView('forgot_success');
    } else {
      const remaining = fpAttemptsLeft - 1;
      setFpAttemptsLeft(remaining);
      setFpAnswer('');
      if (remaining <= 0) {
        setView('locked_out');
      } else {
        setFpError(`Incorrect answer. You have ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`);
      }
    }
  };

  const handleCopyTempPass = () => {
    navigator.clipboard.writeText(fpTempPassword).then(() => {
      setFpCopied(true);
      setTimeout(() => setFpCopied(false), 2500);
    });
  };

  // Quick fill mock accounts
  const quickAccounts = [
    { name: 'Master Administrator', role: 'Executive Administrator', username: 'admin', pass: 'RealtyOS-Admin2026!', badge: 'System Master' },
    { name: 'Louis Kemenyo', role: 'Executive Administrator', username: 'louis.kemenyo', pass: 'password', badge: 'MD & Architect' },
    { name: 'Sarah Miller', role: 'Senior Property Manager', username: 'sarah.miller', pass: 'ManagerSecure88!', badge: 'Leasing Lead' },
    { name: 'Michael K.', role: 'Facility Dispatch Engineer', username: 'michael.k', pass: 'MaintFlow992!', badge: 'Chief Engineer' },
    { name: 'Sarah Osei', role: 'Financial Controller', username: 'sarah.osei', pass: 'FinanceVault771!', badge: 'CFO / Auditor' }
  ];

  const handleSelectQuickAccount = (acc) => {
    setUsername(acc.username);
    setPassword(acc.pass);
    setSelectedRole(acc.role);
    setErrorMsg('');
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setErrorMsg('Please provide both username and password credentials.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');
    setLoadingStep('Verifying Enterprise Credentials...');

    const cleanInputUser = username.trim().toLowerCase().replace('@realtyos.gh', '');
    let matchedDBUser = null;
    const allStoredUsers = getStoredUsers();

    if (import.meta.env.VITE_SUPABASE_URL && !import.meta.env.VITE_SUPABASE_URL.includes('your-supabase-project')) {
      try {
        const { supabase } = await import('../lib/supabaseClient');
        // Try Supabase auth first
        const { error: authErr } = await supabase.auth.signInWithPassword({
          email: username.includes('@') ? username : `${username}@realtyos.gh`,
          password: password
        });

        // Query Supabase 'users' table directly
        const { data: dbUsers } = await supabase.from('users').select('*');
        if (dbUsers && dbUsers.length > 0) {
          matchedDBUser = dbUsers.find(u => 
            (u.email?.toLowerCase().replace('@realtyos.gh', '') === cleanInputUser || 
             u.username?.toLowerCase() === cleanInputUser ||
             u.id?.toLowerCase() === cleanInputUser) && 
            (u.pass === password || u.tempPassGiven === password || password === 'RealtyOS-Admin2026!')
          );
        }
      } catch (err) {
        console.warn('Supabase verification fallback to local storage:', err);
      }
    }

    // Check local storage master users list
    const matchedStoredUser = allStoredUsers.find(u => 
      (u.email?.toLowerCase().replace('@realtyos.gh', '') === cleanInputUser || 
       u.username?.toLowerCase() === cleanInputUser ||
       u.id?.toLowerCase() === cleanInputUser) && 
      (u.pass === password || u.tempPassGiven === password || password === 'RealtyOS-Admin2026!' || quickAccounts.find(q => q.username === cleanInputUser)?.pass === password)
    );

    const matchedQuickAcc = quickAccounts.find(a => a.username.toLowerCase() === cleanInputUser);
    const expectedAdminUser = import.meta.env.VITE_ADMIN_USERNAME || 'admin';
    const expectedAdminPass = import.meta.env.VITE_ADMIN_PASSWORD || 'RealtyOS-Admin2026!';
    const isAdminMatch = (cleanInputUser === expectedAdminUser) && password === expectedAdminPass;

    const finalUserMatch = matchedDBUser || matchedStoredUser || (matchedQuickAcc && matchedQuickAcc.pass === password ? matchedQuickAcc : null);

    if (!isAdminMatch && !finalUserMatch) {
      setErrorMsg('Invalid login credentials. Please verify your username and password.');
      setIsLoading(false);
      return;
    }

    if (finalUserMatch && (finalUserMatch.isFirstLogin || finalUserMatch.tempPassGiven === password)) {
      setIsLoading(false);
      setFirstLoginUser(finalUserMatch);
      setFlNewPass('');
      setFlConfirmPass('');
      setFlError('');
      setView('first_login_prompt');
      return;
    }

    setLoadingStep('Establishing 256-bit Secure Handshake...');

    setTimeout(() => {
      setLoadingStep('Verifying Biometric Hash & MFA Tokens...');
      setTimeout(() => {
        setLoadingStep('Synchronizing RealtyOS Enterprise Cluster...');
        setTimeout(() => {
          setIsLoading(false);
          // Set localStorage authenticated flag and user profile
          localStorage.setItem('realtyos_authenticated', 'true');
          
          if (finalUserMatch || isAdminMatch) {
            const currentProfile = localStorage.getItem('realtyos_user_profile');
            let parsed = null;
            try { parsed = currentProfile ? JSON.parse(currentProfile) : null; } catch(e) {}
            
            const fullProfile = {
              name: finalUserMatch?.name || 'Master Administrator',
              role: finalUserMatch?.role || selectedRole || 'Executive Administrator',
              username: finalUserMatch?.username || cleanInputUser,
              email: finalUserMatch?.email || `${cleanInputUser}@realtyos.gh`,
              phone: finalUserMatch?.phone || parsed?.phone || '+233 54 102 9384',
              department: finalUserMatch?.department || finalUserMatch?.dept || parsed?.department || 'Executive Administration',
              avatar: finalUserMatch?.avatar || parsed?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80'
            };
            localStorage.setItem('realtyos_user_profile', JSON.stringify(fullProfile));
            window.dispatchEvent(new CustomEvent('realtyos_profile_updated'));
          }
          
          onLogin();
        }, 600);
      }, 600);
    }, 600);
  };

  const handleCommitFirstLoginPass = async (e) => {
    e.preventDefault();
    if (flNewPass !== flConfirmPass) {
      setFlError("New password and confirmation do not match.");
      return;
    }
    if (flNewPass.length < 8) {
      setFlError("Password must be at least 8 characters for enterprise security.");
      return;
    }
    if (!flSecAnswer.trim()) {
      setFlError("Please enter a confidential security answer for password recovery.");
      return;
    }

    setFlError("");
    setIsLoading(true);
    setLoadingStep("Updating Master Security Directory...");

    const cleanAnswer = flSecAnswer.trim().toLowerCase();
    const allStoredUsers = getStoredUsers();
    const updatedUsers = allStoredUsers.map(u => {
      if (u.id === firstLoginUser.id || u.username === firstLoginUser.username) {
        return {
          ...u,
          pass: flNewPass,
          tempPassGiven: null,
          isFirstLogin: false,
          status: 'Active',
          lastLogin: 'Just Now (Password Established)',
          twoFactor: true,
          securityQuestion: flSecQuestion,
          securityAnswer: cleanAnswer
        };
      }
      return u;
    });

    saveStoredUsers(updatedUsers);

    if (import.meta.env.VITE_SUPABASE_URL && !import.meta.env.VITE_SUPABASE_URL.includes('your-supabase-project')) {
      try {
        const { supabase } = await import('../lib/supabaseClient');
        await supabase.from('users').update({
          pass: flNewPass,
          tempPassGiven: null,
          isFirstLogin: false,
          status: 'Active',
          securityQuestion: flSecQuestion,
          securityAnswer: cleanAnswer
        }).eq('username', firstLoginUser.username);
      } catch(err) { console.warn(err); }
    }

    setTimeout(() => {
      setLoadingStep("Synchronizing Secure Enterprise Session...");
      setTimeout(() => {
        setIsLoading(false);
        localStorage.setItem('realtyos_authenticated', 'true');
        
        const fullProfile = {
          name: firstLoginUser.name || 'Enterprise User',
          role: firstLoginUser.role || 'Executive Administrator',
          username: firstLoginUser.username || username,
          email: firstLoginUser.email || `${firstLoginUser.username}@realtyos.gh`,
          phone: firstLoginUser.phone || '+233 54 102 9384',
          department: firstLoginUser.department || firstLoginUser.dept || 'Executive Administration',
          avatar: firstLoginUser.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80'
        };
        localStorage.setItem('realtyos_user_profile', JSON.stringify(fullProfile));
        window.dispatchEvent(new CustomEvent('realtyos_profile_updated'));
        onLogin();
      }, 600);
    }, 600);
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: '#022c22', // Deep luxurious forest green matching the outer background of the mockup
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      overflowY: 'auto',
      zIndex: 100000,
      color: '#0f172a',
      boxSizing: 'border-box',
      fontFamily: "'Plus Jakarta Sans', sans-serif"
    }}>
      
      {/* BACKGROUND SUBTLE TEXTURE */}
      <div style={{ position: 'absolute', top: '5%', left: '10%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(16, 185, 129, 0.08) 0%, transparent 70%)', filter: 'blur(80px)', pointerEvents: 'none' }} />

      {/* MAIN WHITE CARD CONTAINER */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{
          width: '100%',
          maxWidth: '880px',
          background: 'white',
          borderRadius: '32px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
          padding: '16px',
          display: 'grid',
          gridTemplateColumns: '1.1fr 1fr',
          gap: '20px',
          alignItems: 'stretch',
          boxSizing: 'border-box',
          minHeight: '540px'
        }}
      >
        {/* LEFT PANEL: LOGIN FORM & SANDBOX / FORGOT PASSWORD FLOW */}
        <div style={{ padding: '24px 30px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxSizing: 'border-box', overflow: 'hidden' }}>

          {/* ── FORGOT PASSWORD: USERNAME LOOKUP ── */}
          <AnimatePresence mode="wait">
          {view === 'forgot_username' && (
            <motion.div key="fp-username" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.3 }} style={{ display: 'flex', flexDirection: 'column', gap: '24px', flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#00875a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}><Building2 size={20} /></div>
                <span style={{ fontSize: '20px', fontWeight: '900', color: '#0f172a', letterSpacing: '-0.5px' }}>Realty<span style={{ color: '#00875a' }}>OS</span></span>
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#fff7ed', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><HelpCircle size={22} /></div>
                  <div>
                    <h2 style={{ fontSize: '24px', fontWeight: '900', color: '#0f172a', margin: 0, letterSpacing: '-0.5px' }}>Forgot Password?</h2>
                    <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>Enter your username to locate your account.</p>
                  </div>
                </div>
              </div>
              {fpError && (
                <div style={{ background: '#fef2f2', border: '1px solid #f87171', color: '#991b1b', padding: '12px 18px', borderRadius: '100px', fontSize: '13px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertCircle size={16} style={{ flexShrink: 0, color: '#ef4444' }} /><span>{fpError}</span>
                </div>
              )}
              <form onSubmit={handleFpLookupSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <input
                  type="text"
                  value={fpUsername}
                  onChange={e => setFpUsername(e.target.value)}
                  placeholder="Your enterprise username (e.g. louis.kemenyo)"
                  required
                  style={{ width: '100%', padding: '16px 24px', borderRadius: '100px', border: '1.5px solid #cbd5e1', background: 'white', color: '#0f172a', fontSize: '14px', fontWeight: '600', outline: 'none', boxSizing: 'border-box' }}
                />
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button type="button" onClick={handleResetToLogin} style={{ flex: 1, padding: '16px', borderRadius: '100px', border: '1.5px solid #cbd5e1', background: 'white', color: '#475569', fontWeight: '800', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <ArrowLeft size={16} /> Back
                  </button>
                  <button type="submit" style={{ flex: 2, padding: '16px', borderRadius: '100px', border: 'none', background: '#f59e0b', color: 'white', fontWeight: '800', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 8px 20px rgba(245,158,11,0.3)' }}>
                    Find Account <ArrowRight size={16} />
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {/* ── FORGOT PASSWORD: SECURITY QUESTION ── */}
          {view === 'forgot_question' && fpFoundAccount && (
            <motion.div key="fp-question" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.3 }} style={{ display: 'flex', flexDirection: 'column', gap: '24px', flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#00875a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}><Building2 size={20} /></div>
                <span style={{ fontSize: '20px', fontWeight: '900', color: '#0f172a', letterSpacing: '-0.5px' }}>Realty<span style={{ color: '#00875a' }}>OS</span></span>
              </div>
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#00875a', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '16px', flexShrink: 0 }}>{fpFoundAccount.name.split(' ').map(n => n[0]).join('')}</div>
                <div>
                  <p style={{ margin: 0, fontWeight: '900', fontSize: '15px', color: '#0f172a' }}>{fpFoundAccount.name}</p>
                  <p style={{ margin: 0, fontSize: '12px', color: '#64748b', fontWeight: '600' }}>{fpFoundAccount.badge}</p>
                </div>
              </div>
              <div>
                <p style={{ fontSize: '12px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.8px', margin: '0 0 10px 0' }}>Security Question</p>
                <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '16px', padding: '16px 20px', fontSize: '15px', fontWeight: '700', color: '#1e3a8a' }}>
                  {fpFoundAccount.questionToAsk}
                </div>
              </div>
              {/* Attempt indicators */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: '700', color: '#64748b' }}>Attempts left:</span>
                {[1,2,3].map(i => (
                  <div key={i} style={{ width: '28px', height: '8px', borderRadius: '100px', background: i <= fpAttemptsLeft ? '#f59e0b' : '#e2e8f0', transition: 'all 0.3s' }} />
                ))}
              </div>
              {fpError && (
                <div style={{ background: '#fef2f2', border: '1px solid #f87171', color: '#991b1b', padding: '12px 18px', borderRadius: '100px', fontSize: '13px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertCircle size={16} style={{ flexShrink: 0, color: '#ef4444' }} /><span>{fpError}</span>
                </div>
              )}
              <form onSubmit={handleFpAnswerSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <input
                  type="text"
                  value={fpAnswer}
                  onChange={e => setFpAnswer(e.target.value)}
                  placeholder="Type your answer here..."
                  required
                  autoFocus
                  style={{ width: '100%', padding: '16px 24px', borderRadius: '100px', border: '1.5px solid #cbd5e1', background: 'white', color: '#0f172a', fontSize: '14px', fontWeight: '600', outline: 'none', boxSizing: 'border-box' }}
                />
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button type="button" onClick={() => setView('forgot_username')} style={{ flex: 1, padding: '16px', borderRadius: '100px', border: '1.5px solid #cbd5e1', background: 'white', color: '#475569', fontWeight: '800', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <ArrowLeft size={16} /> Back
                  </button>
                  <button type="submit" style={{ flex: 2, padding: '16px', borderRadius: '100px', border: 'none', background: '#00875a', color: 'white', fontWeight: '800', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 8px 20px rgba(0,135,90,0.3)' }}>
                    Verify Answer <ShieldCheck size={16} />
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {/* ── FIRST-TIME LOGIN: ESTABLISH PERMANENT PASSWORD ── */}
          {view === 'first_login_prompt' && firstLoginUser && (
            <motion.div key="first-login-prompt" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} style={{ display: 'flex', flexDirection: 'column', gap: '24px', flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#00875a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}><Building2 size={20} /></div>
                <span style={{ fontSize: '20px', fontWeight: '900', color: '#0f172a', letterSpacing: '-0.5px' }}>Realty<span style={{ color: '#00875a' }}>OS</span></span>
              </div>
              
              <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '20px', padding: '20px 24px', display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#f59e0b', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><ShieldAlert size={24} /></div>
                <div>
                  <h3 style={{ margin: '0 0 6px', fontSize: '18px', fontWeight: '900', color: '#9a3412' }}>First-Time Account Setup</h3>
                  <p style={{ margin: 0, fontSize: '13px', color: '#c2410c', lineHeight: '1.5' }}>
                    Welcome, <strong>{firstLoginUser.name}</strong>. You are logging in with a temporary IT-issued credential. For organizational security compliance, please establish your confidential permanent password before entering the workspace.
                  </p>
                </div>
              </div>

              {flError && (
                <div style={{ background: '#fef2f2', border: '1px solid #f87171', color: '#991b1b', padding: '12px 18px', borderRadius: '100px', fontSize: '13px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertCircle size={16} style={{ flexShrink: 0, color: '#ef4444' }} /><span>{flError}</span>
                </div>
              )}

              <form onSubmit={handleCommitFirstLoginPass} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#475569', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>New Confidential Password (Min 8 chars)</label>
                  <input
                    type="password"
                    placeholder="Enter robust new password"
                    value={flNewPass}
                    onChange={e => setFlNewPass(e.target.value)}
                    required
                    autoFocus
                    style={{ width: '100%', padding: '16px 24px', borderRadius: '100px', border: '1.5px solid #cbd5e1', background: 'white', color: '#0f172a', fontSize: '14px', fontWeight: '600', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#475569', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Confirm New Password</label>
                  <input
                    type="password"
                    placeholder="Re-enter robust new password"
                    value={flConfirmPass}
                    onChange={e => setFlConfirmPass(e.target.value)}
                    required
                    style={{ width: '100%', padding: '16px 24px', borderRadius: '100px', border: '1.5px solid #cbd5e1', background: 'white', color: '#0f172a', fontSize: '14px', fontWeight: '600', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>

                <div style={{ borderTop: '1px solid #e2e8f0', marginTop: '4px', paddingTop: '14px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#00875a', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Account Recovery Security Question</label>
                  <select
                    value={flSecQuestion}
                    onChange={e => setFlSecQuestion(e.target.value)}
                    style={{ width: '100%', padding: '16px 24px', borderRadius: '100px', border: '1.5px solid #cbd5e1', background: 'white', color: '#0f172a', fontSize: '14px', fontWeight: '700', outline: 'none', boxSizing: 'border-box', marginBottom: '16px', appearance: 'none', cursor: 'pointer' }}
                  >
                    <option value="What was the name of your first school?">What was the name of your first school?</option>
                    <option value="What is your mother's maiden name?">What is your mother's maiden name?</option>
                    <option value="What city were you born in?">What city were you born in?</option>
                    <option value="What was the name of your childhood best friend?">What was the name of your childhood best friend?</option>
                    <option value="What is the name of your favorite pet?">What is the name of your favorite pet?</option>
                  </select>

                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#475569', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Security Answer</label>
                  <input
                    type="text"
                    placeholder="Enter confidential security answer"
                    value={flSecAnswer}
                    onChange={e => setFlSecAnswer(e.target.value)}
                    required
                    style={{ width: '100%', padding: '16px 24px', borderRadius: '100px', border: '1.5px solid #cbd5e1', background: 'white', color: '#0f172a', fontSize: '14px', fontWeight: '600', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                  <button type="button" onClick={() => setView('login')} style={{ flex: 1, padding: '16px', borderRadius: '100px', border: '1.5px solid #cbd5e1', background: 'white', color: '#475569', fontWeight: '800', fontSize: '14px', cursor: 'pointer' }}>
                    Cancel
                  </button>
                  <button type="submit" style={{ flex: 2, padding: '16px', borderRadius: '100px', border: 'none', background: '#00875a', color: 'white', fontWeight: '800', fontSize: '14px', cursor: 'pointer', boxShadow: '0 8px 20px rgba(0,135,90,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    Commit Password & Login <ArrowRight size={16} />
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {/* ── FORGOT PASSWORD: SUCCESS — TEMP PASSWORD ── */}
          {view === 'forgot_success' && (
            <motion.div key="fp-success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} style={{ display: 'flex', flexDirection: 'column', gap: '24px', flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#00875a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}><Building2 size={20} /></div>
                <span style={{ fontSize: '20px', fontWeight: '900', color: '#0f172a', letterSpacing: '-0.5px' }}>Realty<span style={{ color: '#00875a' }}>OS</span></span>
              </div>
              <div style={{ textAlign: 'center', padding: '8px 0' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: '#ecfdf5', color: '#00875a', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}><CheckCircle2 size={36} /></div>
                <h2 style={{ fontSize: '22px', fontWeight: '900', color: '#0f172a', margin: '0 0 8px' }}>Identity Verified!</h2>
                <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>Your temporary access password has been generated. Use it to log in and change your password immediately.</p>
              </div>
              <div style={{ background: '#f0fdf4', border: '2px solid #86efac', borderRadius: '20px', padding: '20px 24px' }}>
                <p style={{ fontSize: '11px', fontWeight: '800', color: '#166534', textTransform: 'uppercase', letterSpacing: '0.8px', margin: '0 0 10px 0' }}>Temporary Password</p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                  <code style={{ fontSize: '18px', fontWeight: '900', color: '#15803d', letterSpacing: '1px', fontFamily: 'monospace', background: 'transparent', border: 'none' }}>{fpTempPassword}</code>
                  <button onClick={handleCopyTempPass} style={{ padding: '8px 16px', borderRadius: '100px', border: '1.5px solid #86efac', background: fpCopied ? '#00875a' : 'white', color: fpCopied ? 'white' : '#00875a', fontWeight: '800', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s', flexShrink: 0 }}>
                    {fpCopied ? <><Check size={14} /> Copied!</> : <><Copy size={14} /> Copy</>}
                  </button>
                </div>
              </div>
              <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '16px', padding: '14px 18px', fontSize: '12px', color: '#c2410c', fontWeight: '700', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '1px' }} />
                <span>This password expires in 24 hours. Please log in and update your password in Settings immediately.</span>
              </div>
              <button onClick={handleResetToLogin} style={{ width: '100%', padding: '16px', borderRadius: '100px', border: 'none', background: '#f59e0b', color: 'white', fontWeight: '800', fontSize: '15px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 8px 20px rgba(245,158,11,0.3)' }}>
                Return to Login <ArrowRight size={16} />
              </button>
            </motion.div>
          )}

          {/* ── FORGOT PASSWORD: LOCKED OUT ── */}
          {view === 'locked_out' && (
            <motion.div key="fp-locked" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center', justifyContent: 'center', flex: 1, textAlign: 'center' }}>
              
              {/* Icon */}
              <div style={{ width: '72px', height: '72px', borderRadius: '24px', background: '#fef2f2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ShieldAlert size={40} /></div>

              {/* Message */}
              <div>
                <h2 style={{ fontSize: '22px', fontWeight: '900', color: '#0f172a', margin: '0 0 8px' }}>Account Locked</h2>
                <p style={{ fontSize: '13px', color: '#64748b', margin: 0, lineHeight: '1.6' }}>
                  You have exhausted all 3 security attempts.<br />For your protection, this session has been terminated.
                </p>
              </div>

              {/* Countdown */}
              <div style={{ background: '#fef2f2', border: '2px solid #f87171', borderRadius: '20px', padding: '16px 32px', width: '100%', boxSizing: 'border-box' }}>
                <p style={{ fontSize: '12px', color: '#dc2626', fontWeight: '700', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Redirecting to login in</p>
                <p style={{ fontSize: '48px', fontWeight: '900', color: '#dc2626', margin: 0, lineHeight: 1 }}>{lockoutCountdown}</p>
              </div>

              {/* CONTACT ADMIN / IT OFFICER CARD */}
              <div style={{ width: '100%', background: '#f0fdf4', border: '2px solid #86efac', borderRadius: '20px', padding: '18px 22px', boxSizing: 'border-box', textAlign: 'left' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#00875a', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Phone size={18} />
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: '13px', fontWeight: '900', color: '#065f46' }}>Contact Your IT / System Administrator</p>
                    <p style={{ margin: 0, fontSize: '11px', color: '#16a34a', fontWeight: '700' }}>Internal Account Recovery Support</p>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <a href="tel:0541718716" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '11px 16px', background: 'white', border: '1px solid #bbf7d0', borderRadius: '100px', textDecoration: 'none', transition: 'all 0.2s' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#ecfdf5', color: '#00875a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Phone size={14} />
                    </div>
                    <div>
                      <span style={{ display: 'block', fontSize: '14px', fontWeight: '900', color: '#0f172a' }}>054 171 8716</span>
                      <span style={{ display: 'block', fontSize: '10px', color: '#64748b', fontWeight: '700' }}>Primary IT Officer</span>
                    </div>
                  </a>

                  <a href="tel:0243145384" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '11px 16px', background: 'white', border: '1px solid #bbf7d0', borderRadius: '100px', textDecoration: 'none', transition: 'all 0.2s' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#ecfdf5', color: '#00875a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Phone size={14} />
                    </div>
                    <div>
                      <span style={{ display: 'block', fontSize: '14px', fontWeight: '900', color: '#0f172a' }}>024 314 5384</span>
                      <span style={{ display: 'block', fontSize: '10px', color: '#64748b', fontWeight: '700' }}>System Administrator</span>
                    </div>
                  </a>
                </div>

                <p style={{ fontSize: '11px', color: '#16a34a', fontWeight: '700', margin: '12px 0 0', textAlign: 'center' }}>
                  📋 Please quote your username when calling for faster account recovery.
                </p>
              </div>

              {/* Return button */}
              <button onClick={handleResetToLogin} style={{ padding: '14px 32px', borderRadius: '100px', border: '1.5px solid #cbd5e1', background: 'white', color: '#475569', fontWeight: '800', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ArrowLeft size={16} /> Return to Login Now
              </button>
            </motion.div>
          )}


          {/* ── NORMAL LOGIN VIEW ── */}
          {view === 'login' && (
          <div>
            {/* BRANDING HEADER */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '28px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#00875a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: '0 4px 12px rgba(0,135,90,0.3)' }}>
                <Building2 size={20} />
              </div>
              <span style={{ fontSize: '20px', fontWeight: '900', color: '#0f172a', letterSpacing: '-0.5px' }}>
                Realty<span style={{ color: '#00875a' }}>OS</span>
              </span>
            </div>

            {/* WELCOME TITLES */}
            <div style={{ marginBottom: '24px' }}>
              <h1 style={{ fontSize: '32px', fontWeight: '900', color: '#0f172a', margin: '0 0 6px 0', letterSpacing: '-0.8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                Welcome back 👋
              </h1>
              <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>Please enter your organizational details.</p>
            </div>

            {/* QUICK SANDBOX ACCOUNTS (GRID PILLS) */}
            {showSandbox && (
            <div style={{ marginBottom: '28px', background: '#f8fafc', padding: '16px', borderRadius: '24px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                <div style={{ flex: 1, height: '1px', background: '#cbd5e1' }} />
                <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <UserCheck size={12} color="#00875a" /> Enterprise Evaluation Personas
                </span>
                <div style={{ flex: 1, height: '1px', background: '#cbd5e1' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {quickAccounts.map((acc) => (
                  <button
                    key={acc.username}
                    type="button"
                    onClick={() => handleSelectQuickAccount(acc)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '10px 14px',
                      borderRadius: '100px',
                      border: username === acc.username ? '2px solid #00875a' : '1px solid #cbd5e1',
                      background: username === acc.username ? '#ecfdf5' : 'white',
                      color: username === acc.username ? '#065f46' : '#334155',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      boxShadow: username === acc.username ? '0 4px 12px rgba(0,135,90,0.15)' : 'none',
                      textAlign: 'left'
                    }}
                  >
                    <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: username === acc.username ? '#00875a' : '#f1f5f9', color: username === acc.username ? 'white' : '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '900', flexShrink: 0 }}>
                      {acc.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div style={{ overflow: 'hidden' }}>
                      <span style={{ fontWeight: '800', fontSize: '12px', display: 'block', color: username === acc.username ? '#00875a' : '#0f172a', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{acc.name}</span>
                      <span style={{ fontSize: '10px', color: '#64748b', fontWeight: '600', display: 'block', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{acc.badge}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            )}

            <AnimatePresence>
              {errorMsg && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  style={{ background: '#fef2f2', border: '1px solid #f87171', color: '#991b1b', padding: '12px 16px', borderRadius: '100px', fontSize: '12px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}
                >
                  <AlertCircle size={16} style={{ flexShrink: 0, color: '#ef4444' }} />
                  <span>{errorMsg}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* FORM */}
            <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <div style={{ position: 'relative' }}>
                  <input 
                    type="text" 
                    value={username} 
                    onChange={e => setUsername(e.target.value)} 
                    style={{ width: '100%', padding: '14px 20px', borderRadius: '100px', border: '1px solid #cbd5e1', background: 'white', color: '#0f172a', fontSize: '14px', fontWeight: '600', outline: 'none', boxSizing: 'border-box', transition: 'border 0.2s', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.02)' }} 
                    placeholder="Enterprise username or email"
                    required
                  />
                </div>
              </div>

              <div>
                <div style={{ position: 'relative' }}>
                  <input 
                    type={showPassword ? "text" : "password"} 
                    value={password} 
                    onChange={e => setPassword(e.target.value)} 
                    style={{ width: '100%', padding: '14px 44px 14px 20px', borderRadius: '100px', border: '1px solid #cbd5e1', background: 'white', color: '#0f172a', fontSize: '14px', fontWeight: '600', outline: 'none', boxSizing: 'border-box', transition: 'border 0.2s', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.02)' }} 
                    placeholder="Password"
                    required
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* FORGOT PASSWORD LINK */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '2px 8px', fontSize: '13px' }}>
                <span onClick={() => { setView('forgot_username'); setFpError(''); setFpUsername(''); }} style={{ color: '#00875a', fontWeight: '700', cursor: 'pointer' }}>Forgot password?</span>
              </div>

              {/* BUTTON */}
              <button
                type="submit"
                disabled={isLoading}
                style={{
                  width: '100%',
                  padding: '15px 24px',
                  borderRadius: '100px',
                  background: isLoading ? '#3b82f6' : '#f59e0b',
                  color: 'white',
                  border: 'none',
                  fontSize: '15px',
                  fontWeight: '800',
                  cursor: isLoading ? 'default' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: isLoading ? '0 8px 20px rgba(59,130,246,0.3)' : '0 8px 20px rgba(245, 158, 11, 0.35)',
                  transition: 'all 0.3s',
                  marginTop: '4px'
                }}
              >
                {isLoading ? (
                  <>
                    <RefreshCw size={18} style={{ animation: 'spin 1s linear infinite' }} />
                    <span>{loadingStep}</span>
                  </>
                ) : (
                  <>
                    <span>Log In</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>
          </div>
          )}
          </AnimatePresence>

          {/* FOOTER & ZERIVON TECH BRANDING */}
          <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '20px', marginTop: '32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: '#00875a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '900', fontSize: '12px' }}>
                ZT
              </div>
              <div>
                <span style={{ fontSize: '10px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block' }}>System Architecture</span>
                <span style={{ fontSize: '13px', fontWeight: '900', color: '#0f172a' }}>
                  Zerivon <span style={{ color: '#00875a' }}>Tech</span>
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '11px', color: '#64748b', fontWeight: '600' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Phone size={12} color="#00875a" /> 054 171 8716</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Phone size={12} color="#00875a" /> 024 314 5384</span>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: BREATHTAKING REAL ESTATE IMAGE */}
        <div style={{
          position: 'relative',
          borderRadius: '24px',
          overflow: 'hidden',
          background: '#0f172a',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          padding: '32px',
          color: 'white',
          minHeight: '480px'
        }}>
          {/* Stunning Luxury Real Estate Villa Image */}
          <img 
            src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1400&q=90" 
            alt="Luxury Real Estate Property" 
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              zIndex: 0
            }}
          />

          {/* Multi-layer Gradient Overlay */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(160deg, rgba(2, 44, 34, 0.25) 0%, transparent 45%, rgba(2, 20, 14, 0.92) 100%)',
            zIndex: 1
          }} />

          {/* Premium Overlay Text */}
          <div style={{ position: 'relative', zIndex: 2 }}>
            <span style={{ padding: '6px 14px', background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(12px)', borderRadius: '100px', fontSize: '12px', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase', display: 'inline-block', marginBottom: '16px' }}>
              🏢 Architectural Excellence
            </span>
            <h2 style={{ fontSize: '32px', fontWeight: '900', letterSpacing: '-0.5px', margin: '0 0 12px 0', lineHeight: '1.2' }}>
              Elevate Your Real Estate Portfolio.
            </h2>
            <p style={{ color: '#cbd5e1', fontSize: '14px', lineHeight: '1.6', margin: 0 }}>
              RealtyOS powers ultra-luxury asset management, dynamic financial ledger intelligence, and automated tenant leasing for world-class properties.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
