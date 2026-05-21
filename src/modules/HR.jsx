import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, UserPlus, Clock, ShieldCheck, DollarSign, Award, AlertTriangle,
  CheckCircle2, Search, Filter, Plus, FileText, X, Check, Eye, Briefcase,
  Calendar, Star, Wallet, FileCheck, Ban, Landmark, Coins, Play, AlertCircle,
  Lock, UserCheck, Calculator, LogIn, LogOut, Coffee, BarChart2, QrCode,
  Printer, CreditCard, Camera, UploadCloud, PhoneCall, Building2, Download,
  Badge, Shield, Edit2, Trash2
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { generateRealPDF } from '../lib/pdfService';
import {
  getStoredStaffEmployees, saveStoredStaffEmployees,
  getStoredStaffLeaves, saveStoredStaffLeaves,
  getStoredStaffAttendance, saveStoredStaffAttendance,
  getStoredStaffLoans, saveStoredStaffLoans,
  getStoredStaffPayroll, saveStoredStaffPayroll,
  getStoredStaffSanctions, saveStoredStaffSanctions,
  getStoredStaffAppraisals, saveStoredStaffAppraisals
} from '../lib/masterData';

const HR = () => {
  const [activeSubTab, setActiveSubTab] = useState('directory'); // directory, attendance, leaves, payroll, loans, sanctions, appraisals

  // Live Cloud Synchronizer for HR Modules
  useEffect(() => {
    const handleSync = () => {
      setStaffList(getStoredStaffEmployees());
      setLeavesList(getStoredStaffLeaves());
      setAttendanceLogsList(getStoredStaffAttendance());
      setLoansList(getStoredStaffLoans());
      setPayrollRunsList(getStoredStaffPayroll());
      setSanctionsList(getStoredStaffSanctions());
      setAppraisalsList(getStoredStaffAppraisals());
    };

    window.addEventListener('storage', handleSync);
    window.addEventListener('realtyos_staff_update', handleSync);

    return () => {
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('realtyos_staff_update', handleSync);
    };
  }, []);

  const [successMsg, setSuccessMsg] = useState('');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const [attendanceDate, setAttendanceDate] = useState('2026-05-17');

  // 1. Staff Directory State
  const [staffList, setStaffList] = useState(() => getStoredStaffEmployees());

  // Onboarding Form Live Inputs State
  const [newEmpGhanaCard, setNewEmpGhanaCard] = useState('GHA-');
  const [passportPreview, setPassportPreview] = useState(null);
  const [ghanaCardFrontPreview, setGhanaCardFrontPreview] = useState(null);
  const [ghanaCardBackPreview, setGhanaCardBackPreview] = useState(null);

  // Edit Employee Form Fields State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editEmpName, setEditEmpName] = useState('');
  const [editEmpRole, setEditEmpRole] = useState('');
  const [editEmpDept, setEditEmpDept] = useState('');
  const [editEmpRank, setEditEmpRank] = useState('');
  const [editEmpGhanaCard, setEditEmpGhanaCard] = useState('');
  const [editEmpEmail, setEditEmpEmail] = useState('');
  const [editEmpPhone, setEditEmpPhone] = useState('');
  const [editEmpSalary, setEditEmpSalary] = useState(0);
  const [editEmpBankName, setEditEmpBankName] = useState('');
  const [editEmpBankAccNo, setEditEmpBankAccNo] = useState('');
  const [editEmpEmergencyName, setEditEmpEmergencyName] = useState('');
  const [editEmpEmergencyPhone, setEditEmpEmergencyPhone] = useState('');
  const [editEmpStatus, setEditEmpStatus] = useState('Active');
  const [editEmpContract, setEditEmpContract] = useState('Permanent Full-time');

  // 2. Leaves & Vacations State
  const [leavesList, setLeavesList] = useState(() => getStoredStaffLeaves());

  // 3. Daily Attendance Logs State
  const [attendanceLogsList, setAttendanceLogsList] = useState(() => getStoredStaffAttendance());

  // 4. Staff Loans State
  const [loansList, setLoansList] = useState(() => getStoredStaffLoans());

  // 5. Monthly Salary Runs State (Payroll Logs)
  const [payrollRunsList, setPayrollRunsList] = useState(() => getStoredStaffPayroll());

  // 6. Sanctions State
  const [sanctionsList, setSanctionsList] = useState(() => getStoredStaffSanctions());

  // 7. Appraisals State
  const [appraisalsList, setAppraisalsList] = useState(() => getStoredStaffAppraisals());

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDept, setFilterDept] = useState('all');

  // Modal Controls
  const [showOnboardModal, setShowOnboardModal] = useState(false);
  const [showTakeAttendanceModal, setShowTakeAttendanceModal] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showPayrollModal, setShowPayrollModal] = useState(false);
  const [showLoanModal, setShowLoanModal] = useState(false);
  const [showSanctionModal, setShowSanctionModal] = useState(false);
  const [showAppraisalModal, setShowAppraisalModal] = useState(false);

  const [selectedStaffProfile, setSelectedStaffProfile] = useState(null);
  const [printableTagEmployee, setPrintableTagEmployee] = useState(null);

  // Take Daily Attendance Roster Check Form State
  const [dailyCheckDate, setDailyCheckDate] = useState(new Date().toISOString().split('T')[0]);
  const [dailyCheckRoster, setDailyCheckRoster] = useState([]);

  // Automated Alphanumeric ID Generator
  const generateShortEmployeeID = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let randomPart = '';
    for (let i = 0; i < 4; i++) {
      randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `EMP-${randomPart}`;
  };

  const handleGhanaCardInputChange = (e) => {
    let val = e.target.value.toUpperCase();
    if (!val.startsWith('GHA-')) {
      val = 'GHA-' + val.replace(/GHA-/g, '');
    }
    setNewEmpGhanaCard(val);
  };

  const handleImageUpload = (e, setPreviewCallback) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 400;
          const scaleSize = MAX_WIDTH / img.width;
          canvas.width = MAX_WIDTH;
          canvas.height = img.height * scaleSize;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
          setPreviewCallback(compressedDataUrl);
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfileGhanaCard = (e, side) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 600;
          const scaleSize = MAX_WIDTH / img.width;
          canvas.width = MAX_WIDTH;
          canvas.height = img.height * scaleSize;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const url = canvas.toDataURL('image/jpeg', 0.8);
          
          const updatedProfile = {
            ...selectedStaffProfile,
            [side === 'front' ? 'ghanaCardFront' : 'ghanaCardBack']: url
          };
          setSelectedStaffProfile(updatedProfile);
          setStaffList(prevList => {
            const newList = prevList.map(emp => emp.id === selectedStaffProfile.id ? updatedProfile : emp);
            saveStoredStaffEmployees(newList);
            return newList;
          });
          setSuccessMsg(`Ghana Card (${side === 'front' ? 'Front' : 'Back'}) updated successfully!`);
          setTimeout(() => setSuccessMsg(''), 4000);
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdatePassportPhoto = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 400;
          const scaleSize = MAX_WIDTH / img.width;
          canvas.width = MAX_WIDTH;
          canvas.height = img.height * scaleSize;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const url = canvas.toDataURL('image/jpeg', 0.8);
          
          const updatedProfile = {
            ...selectedStaffProfile,
            passportPhoto: url
          };
          setSelectedStaffProfile(updatedProfile);
          setStaffList(prevList => {
            const newList = prevList.map(emp => emp.id === selectedStaffProfile.id ? updatedProfile : emp);
            saveStoredStaffEmployees(newList);
            return newList;
          });
          setSuccessMsg('Profile photo updated successfully!');
          setTimeout(() => setSuccessMsg(''), 4000);
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDownloadCardImage = async (format = 'png') => {
    const element = document.getElementById('printable-id-cards-container');
    if (!element) return;

    try {
      setSuccessMsg(`Generating ultra high-resolution ${format.toUpperCase()} image...`);
      const canvas = await html2canvas(element, {
        scale: 3, // High DPI / Retina resolution
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false
      });

      const imageURL = canvas.toDataURL(`image/${format}`, format === 'jpeg' ? 0.95 : undefined);
      const downloadLink = document.createElement('a');
      downloadLink.href = imageURL;
      downloadLink.download = `${printableTagEmployee.name.replace(/\s+/g, '_')}_ID_Badge.${format === 'jpeg' ? 'jpg' : 'png'}`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);

      setSuccessMsg(`ID Card successfully saved as high-resolution ${format.toUpperCase()}!`);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error("Error generating card screenshot:", err);
      alert("Failed to generate image. Ensure all photos are accessible or uploaded locally.");
    }
  };

  const handleOpenTakeAttendanceModal = () => {
    const defaultDate = dailyCheckDate;
    const formattedDisplayDate = new Date(defaultDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

    const preparedRoster = staffList.map(emp => {
      const activeLeave = leavesList.find(lv => {
        if (lv.status !== 'Approved') return false;
        return defaultDate >= lv.startDate && defaultDate <= lv.endDate;
      });

      if (activeLeave) {
        return {
          employeeId: emp.id,
          name: emp.name,
          dept: emp.dept,
          status: 'ðŸ–ï¸ Approved Leave',
          clockIn: '--:-- --',
          clockOut: '--:-- --',
          location: 'On Approved Leave',
          notes: `Automated System Detection: ${activeLeave.type} (${activeLeave.duration})`
        };
      }

      return {
        employeeId: emp.id,
        name: emp.name,
        dept: emp.dept,
        status: 'ðŸŸ¢ Present (On Time)',
        clockIn: '08:00 AM',
        clockOut: '05:00 PM',
        location: 'HQ Corporate Plaza',
        notes: 'Routine check-in'
      };
    });

    setDailyCheckRoster(preparedRoster);
    setShowTakeAttendanceModal(true);
  };

  const handleUpdateRosterRow = (index, field, val) => {
    const updated = [...dailyCheckRoster];
    updated[index][field] = val;
    if (field === 'status') {
      if (val === 'ðŸ”´ Unexcused Absent') {
        updated[index].clockIn = '--:-- --';
        updated[index].clockOut = '--:-- --';
      } else if (val === 'ðŸŸ¡ Present (Late)') {
        updated[index].clockIn = '08:45 AM';
      }
    }
    setDailyCheckRoster(updated);
  };

  const handleSubmitDailyAttendanceRoster = (e) => {
    e.preventDefault();
    const formattedCheckDate = new Date(dailyCheckDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

    const newLogs = dailyCheckRoster.map((item, idx) => ({
      id: `ATT-${Date.now().toString().slice(-4)}-${idx}`,
      date: dailyCheckDate,
      formattedDate: formattedCheckDate,
      employee: item.name,
      dept: item.dept,
      clockIn: item.clockIn,
      clockOut: item.clockOut,
      shiftHours: item.clockIn.includes('--') ? '0.0 hrs' : '9.0 hrs',
      status: item.status,
      location: item.location,
      notes: item.notes
    }));

    const updatedStaff = staffList.map(emp => {
      const recordedItem = dailyCheckRoster.find(r => r.name === emp.name);
      if (!recordedItem) return emp;

      let p = emp.daysPresent;
      let l = emp.daysLate;
      let a = emp.daysAbsent;
      let lv = emp.daysOnLeave;

      if (recordedItem.status === 'ðŸŸ¢ Present (On Time)') p += 1;
      else if (recordedItem.status === 'ðŸŸ¡ Present (Late)') { p += 1; l += 1; }
      else if (recordedItem.status === 'ðŸ”´ Unexcused Absent') a += 1;
      else if (recordedItem.status === 'ðŸ–ï¸ Approved Leave') lv += 1;

      const totalDays = p + a + lv;
      const rate = totalDays > 0 ? Math.round(((p + lv) / totalDays) * 100) + '%' : '100%';

      return { ...emp, daysPresent: p, daysLate: l, daysAbsent: a, daysOnLeave: lv, attendanceRate: rate };
    });

    setStaffList(updatedStaff);
    saveStoredStaffEmployees(updatedStaff);
    const updatedAtt = [...newLogs, ...attendanceLogsList];
    setAttendanceLogsList(updatedAtt);
    saveStoredStaffAttendance(updatedAtt);
    setShowTakeAttendanceModal(false);
    setSuccessMsg(`Daily attendance roster for ${formattedCheckDate} officially recorded and cumulative metrics updated!`);
    setTimeout(() => setSuccessMsg(''), 4500);
  };

  const calculatedTotalGross = useMemo(() => {
    return staffList
      .filter(emp => emp.dept !== 'Executive Management' && emp.role !== 'Portfolio Director')
      .reduce((sum, emp) => sum + emp.salary, 0);
  }, [staffList]);

  const activeLoanDeductionsTotal = useMemo(() => {
    return loansList
      .filter(l => l.status === 'Active Amortization' && l.remainingBal > 0)
      .reduce((sum, l) => sum + l.monthlyInstallmentNum, 0);
  }, [loansList]);

  const calculatedNetDisbursement = useMemo(() => {
    return calculatedTotalGross - activeLoanDeductionsTotal;
  }, [calculatedTotalGross, activeLoanDeductionsTotal]);

  const handleOnboardStaff = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const numSalary = parseFloat(formData.get('salary')) || 7500;

    const newEmpID = generateShortEmployeeID();
    const fallbackPhoto = `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.get('name'))}&background=00875a&color=fff&size=400`;

    const newEmp = {
      id: newEmpID,
      name: formData.get('name'),
      role: formData.get('role'),
      dept: formData.get('dept'),
      rank: formData.get('rank') || 'Junior Staff (Grade 3)',
      ghanaCardNo: newEmpGhanaCard,
      passportPhoto: passportPreview || fallbackPhoto,
      ghanaCardFront: ghanaCardFrontPreview || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80',
      ghanaCardBack: ghanaCardBackPreview || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80',
      bankName: formData.get('bankName'),
      bankAccName: formData.get('bankAccName'),
      bankAccNo: formData.get('bankAccNo'),
      emergencyName: formData.get('emergencyName'),
      emergencyPhone: formData.get('emergencyPhone'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      salary: numSalary,
      formattedSalary: `â‚µ ${numSalary.toLocaleString()} / mo`,
      contract: formData.get('contract'),
      status: 'Active',
      joined: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      rating: 4.8,
      daysPresent: 1,
      daysLate: 0,
      daysAbsent: 0,
      daysOnLeave: 0,
      attendanceRate: '100%',
      loansCount: 0,
      sanctionsCount: 0
    };

    const updated = [newEmp, ...staffList];
    setStaffList(updated);
    saveStoredStaffEmployees(updated);
    setShowOnboardModal(false);
    setPassportPreview(null);
    setGhanaCardFrontPreview(null);
    setGhanaCardBackPreview(null);
    setNewEmpGhanaCard('GHA-');

    setSuccessMsg(`Successfully onboarded ${newEmp.name} (${newEmp.id}) as ${newEmp.role}! Automatic date and digital ID Tag generated.`);
    setTimeout(() => setSuccessMsg(''), 4500);
  };

  const handleLogLeave = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newLeave = {
      id: `LV-${400 + leavesList.length + 1}`,
      employee: formData.get('employee'),
      type: formData.get('type'),
      startDate: formData.get('startDate'),
      endDate: formData.get('endDate'),
      formattedDates: `${formData.get('startDate')} to ${formData.get('endDate')}`,
      duration: `${formData.get('duration')} Days`,
      reason: formData.get('reason'),
      status: 'Pending Sign-off',
      approvedBy: 'Pending'
    };
    const updatedLeaves = [newLeave, ...leavesList];
    setLeavesList(updatedLeaves);
    saveStoredStaffLeaves(updatedLeaves);
    setShowLeaveModal(false);
    setSuccessMsg(`Leave request for ${newLeave.employee} recorded successfully.`);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleRunPayrollSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const monthYear = formData.get('monthYear');

    const newRun = {
      id: `PAY-2026-${monthYear.substring(0, 3).toUpperCase()}-${Date.now().toString().slice(-3)}`,
      monthYear: monthYear,
      totalStaff: staffList.filter(emp => emp.dept !== 'Executive Management' && emp.role !== 'Portfolio Director').length,
      grossAmount: calculatedTotalGross,
      formattedGross: `â‚µ ${calculatedTotalGross.toLocaleString()}`,
      loanDeductions: activeLoanDeductionsTotal,
      formattedDeductions: `-â‚µ ${activeLoanDeductionsTotal.toLocaleString()}`,
      netAmount: calculatedNetDisbursement,
      formattedNet: `â‚µ ${calculatedNetDisbursement.toLocaleString()}`,
      status: 'Pending Finance Sign-off',
      runDate: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      runBy: 'Finance Director'
    };

    const updatedPayroll = [newRun, ...payrollRunsList];
    setPayrollRunsList(updatedPayroll);
    saveStoredStaffPayroll(updatedPayroll);
    setShowPayrollModal(false);
    setSuccessMsg(`Payroll run for ${monthYear} calculated (Net: â‚µ${calculatedNetDisbursement.toLocaleString()}) and submitted to Finance for audit.`);
    setTimeout(() => setSuccessMsg(''), 4500);
  };

  const handleApprovePayroll = (id) => {
    const updatedPayroll = payrollRunsList.map(run => run.id === id ? { ...run, status: 'Approved & Disbursed' } : run);
    setPayrollRunsList(updatedPayroll);
    saveStoredStaffPayroll(updatedPayroll);

    const updatedLoans = loansList.map(loan => {
      if (loan.status === 'Active Amortization' && loan.remainingBal > 0) {
        const newBal = Math.max(0, loan.remainingBal - loan.monthlyInstallmentNum);
        return {
          ...loan,
          remainingBal: newBal,
          formattedBal: `â‚µ ${newBal.toLocaleString()}`,
          status: newBal === 0 ? 'Fully Repaid' : 'Active Amortization'
        };
      }
      return loan;
    });
    setLoansList(updatedLoans);
    saveStoredStaffLoans(updatedLoans);

    setSuccessMsg(`Payroll run ${id} officially approved. Automated loan recovery deducted from employee balances.`);
    setTimeout(() => setSuccessMsg(''), 4500);
  };

  const handleRejectPayroll = (id) => {
    const updatedPayroll = payrollRunsList.map(run => run.id === id ? { ...run, status: 'Rejected / Re-audit' } : run);
    setPayrollRunsList(updatedPayroll);
    saveStoredStaffPayroll(updatedPayroll);
    setSuccessMsg(`Payroll run ${id} flagged and returned to HR for re-auditing.`);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleRequestLoan = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const principal = parseFloat(formData.get('principal')) || 0;
    const term = parseInt(formData.get('term')) || 12;
    const interest = parseFloat(formData.get('interestRate')) || 0;

    const monthlyInstallmentNum = Math.round((principal * (1 + interest / 100)) / term);

    const newLoan = {
      id: `LN-${700 + loansList.length + 1}`,
      employee: formData.get('employee'),
      principal: principal,
      formattedPrincipal: `â‚µ ${principal.toLocaleString()}`,
      term: `${term} Months`,
      interestRate: `${interest}%`,
      monthlyInstallmentNum: monthlyInstallmentNum,
      monthlyInstallment: `â‚µ ${monthlyInstallmentNum.toLocaleString()} / mo`,
      remainingBal: principal,
      formattedBal: `â‚µ ${principal.toLocaleString()}`,
      guarantor: formData.get('guarantor'),
      purpose: formData.get('purpose'),
      status: 'Pending Underwriting',
      dateDisbursed: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    };
    const updatedLoans = [newLoan, ...loansList];
    setLoansList(updatedLoans);
    saveStoredStaffLoans(updatedLoans);
    setShowLoanModal(false);
    setSuccessMsg(`Staff loan request for ${newLoan.employee} logged for underwriting audit.`);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleLogSanction = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newSanction = {
      id: `SNC-${900 + sanctionsList.length + 1}`,
      employee: formData.get('employee'),
      date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      infraction: formData.get('infraction'),
      severity: formData.get('severity'),
      issuer: 'Louis Kemenyo',
      notes: formData.get('notes')
    };
    const updatedSanctions = [newSanction, ...sanctionsList];
    setSanctionsList(updatedSanctions);
    saveStoredStaffSanctions(updatedSanctions);
    setShowSanctionModal(false);
    setSuccessMsg(`Disciplinary sanction recorded for ${newSanction.employee}.`);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleLogAppraisal = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newAppr = {
      id: `APR-${500 + appraisalsList.length + 1}`,
      employee: formData.get('employee'),
      reviewer: 'Louis Kemenyo',
      date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      rating: parseFloat(formData.get('rating')) || 4.5,
      keyAchievements: formData.get('keyAchievements'),
      recommendation: formData.get('recommendation')
    };
    const updatedAppraisals = [newAppr, ...appraisalsList];
    setAppraisalsList(updatedAppraisals);
    saveStoredStaffAppraisals(updatedAppraisals);
    setShowAppraisalModal(false);
    setSuccessMsg(`Performance appraisal for ${newAppr.employee} successfully archived.`);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const openProfile = (emp) => {
    setSelectedStaffProfile(emp);
    setIsEditingProfile(false);

    // Populate edit fields
    setEditEmpName(emp.name || '');
    setEditEmpRole(emp.role || '');
    setEditEmpDept(emp.dept || 'Operations & Maintenance');
    setEditEmpRank(emp.rank || 'Junior Staff (Grade 3)');
    setEditEmpGhanaCard(emp.ghanaCardNo || 'GHA-');
    setEditEmpEmail(emp.email || '');
    setEditEmpPhone(emp.phone || '');
    setEditEmpSalary(emp.salary || 0);
    setEditEmpBankName(emp.bankName || '');
    setEditEmpBankAccNo(emp.bankAccNo || '');
    setEditEmpEmergencyName(emp.emergencyName || '');
    setEditEmpEmergencyPhone(emp.emergencyPhone || '');
    setEditEmpStatus(emp.status || 'Active');
    setEditEmpContract(emp.contract || 'Permanent Full-time');
  };

  const handleEditProfileSubmit = (e) => {
    e.preventDefault();
    if (!selectedStaffProfile) return;

    const updatedEmp = {
      ...selectedStaffProfile,
      name: editEmpName,
      role: editEmpRole,
      dept: editEmpDept,
      rank: editEmpRank,
      ghanaCardNo: editEmpGhanaCard,
      email: editEmpEmail,
      phone: editEmpPhone,
      salary: parseFloat(editEmpSalary) || 0,
      formattedSalary: `â‚µ ${parseFloat(editEmpSalary).toLocaleString()} / mo`,
      bankName: editEmpBankName,
      bankAccNo: editEmpBankAccNo,
      bankAccName: editEmpName, // acc name matches name by default
      emergencyName: editEmpEmergencyName,
      emergencyPhone: editEmpEmergencyPhone,
      status: editEmpStatus,
      contract: editEmpContract
    };

    const updatedList = staffList.map(emp => emp.id === selectedStaffProfile.id ? updatedEmp : emp);
    setStaffList(updatedList);
    saveStoredStaffEmployees(updatedList);
    setSelectedStaffProfile(updatedEmp);
    setIsEditingProfile(false);
    setSuccessMsg(`Employee records updated successfully for ${updatedEmp.name}!`);
    setTimeout(() => setSuccessMsg(''), 4500);
  };

  const handleDeleteEmployee = (userId) => {
    const userToTerminate = staffList.find(u => u.id === userId);
    if (!userToTerminate) return;

    const confirmed = window.confirm(`âš ï¸ ARE YOU ABSOLUTELY SURE?\nThis will permanently delete/terminate employee record for "${userToTerminate.name}" (${userId}). This action cannot be undone and will immediately revoke all access.`);
    if (!confirmed) return;

    const updatedList = staffList.filter(u => u.id !== userId);
    setStaffList(updatedList);
    saveStoredStaffEmployees(updatedList);
    setSelectedStaffProfile(null);
    setIsEditingProfile(false);
    setSuccessMsg(`Employee record for ${userToTerminate.name} has been permanently terminated and deleted.`);
    setTimeout(() => setSuccessMsg(''), 4500);
  };

  const triggerPrintIDTag = (emp) => {
    setPrintableTagEmployee(emp);
  };

  const executeBrowserPrint = async () => {
    setIsGeneratingPdf(true);
    await generateRealPDF('#printable-id-cards-container', `Staff_ID_Badge_${printableTagEmployee?.id ? printableTagEmployee.id : 'EMP'}.pdf`, { orientation: 'l', scale: 3 });
    setIsGeneratingPdf(false);
  };

  const filteredStaff = useMemo(() => {
    return staffList.filter(s => {
      const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.dept.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.ghanaCardNo.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDept = filterDept === 'all' || s.dept.toLowerCase() === filterDept.toLowerCase();
      return matchesSearch && matchesDept;
    });
  }, [staffList, searchTerm, filterDept]);

  const filteredAttendanceLogs = useMemo(() => {
    return attendanceLogsList.filter(l => l.date === attendanceDate);
  }, [attendanceLogsList, attendanceDate]);

  const attendanceDateStats = useMemo(() => {
    let present = 0;
    let late = 0;
    let absent = 0;
    let leave = 0;

    filteredAttendanceLogs.forEach(l => {
      if (l.status.includes('On Time')) present += 1;
      else if (l.status.includes('Late')) { present += 1; late += 1; }
      else if (l.status.includes('Absent') || l.status.includes('Suspension')) absent += 1;
      else if (l.status.includes('Leave')) leave += 1;
    });

    const total = filteredAttendanceLogs.length;
    return { present, late, absent, leave, total };
  }, [filteredAttendanceLogs]);

  const metrics = useMemo(() => {
    const activeStaff = staffList.filter(emp => emp.dept !== 'Executive Management' && emp.role !== 'Portfolio Director').length;
    const outstandingLoans = loansList.filter(l => l.status.includes('Active')).reduce((acc, l) => acc + l.remainingBal, 0);
    return { activeStaff, outstandingLoans };
  }, [staffList, loansList]);

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
      style={{ display: 'flex', flexDirection: 'column', gap: '32px', width: '100%', boxSizing: 'border-box' }}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <span style={{ padding: '6px 12px', borderRadius: '20px', backgroundColor: 'var(--primary-glow)', color: 'var(--primary)', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Users size={12} /> Enterprise Human Resources & Workforce Hub
            </span>
          </div>

          <h2 style={{ fontSize: '28px', fontWeight: '800', letterSpacing: '-0.5px', color: 'var(--text-main)' }}>Human Capital Management</h2>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: '500', marginTop: '2px' }}>
            Unified command for employee directory, daily attendance check-ins, leave vaults, automated payroll runs with live loan recoveries, and printable ID badges.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowOnboardModal(true)}
            style={{
              backgroundColor: 'var(--primary)', color: 'white', border: 'none',
              padding: '12px 24px', borderRadius: '12px', display: 'flex',
              alignItems: 'center', gap: '10px', fontSize: '14px', fontWeight: '700',
              cursor: 'pointer', boxShadow: '0 10px 20px -5px rgba(0, 135, 90, 0.4)'
            }}
          >
            <UserPlus size={20} /> Onboard New Employee
          </motion.button>
        </div>
      </header>

      {/* Executive Metric Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', width: '100%' }}>
        <div className="glass-card-premium" style={{ padding: '24px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: '#ecfdf5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Users size={28} />
          </div>
          <div style={{ overflow: 'hidden' }}>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>Total Workforce</p>
            <h3 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-main)', marginTop: '4px' }}>
              {metrics.activeStaff} Staff
            </h3>
            <span style={{ fontSize: '12px', color: '#10b981', fontWeight: '700', whiteSpace: 'nowrap' }}>Across 4 core departments</span>
          </div>
        </div>

        <div className="glass-card-premium" style={{ padding: '24px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: '#e0e7ff', color: '#4338ca', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Calculator size={28} />
          </div>
          <div style={{ overflow: 'hidden' }}>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>Gross Monthly Payroll</p>
            <h3 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-main)', marginTop: '4px' }}>
              â‚µ {(calculatedTotalGross / 1000).toFixed(1)}k <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-muted)' }}>/ mo</span>
            </h3>
            <span style={{ fontSize: '12px', color: '#4338ca', fontWeight: '700', whiteSpace: 'nowrap' }}>Dynamic gross calculation</span>
          </div>
        </div>

        <div className="glass-card-premium" style={{ padding: '24px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: '#fffbeb', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Landmark size={28} />
          </div>
          <div style={{ overflow: 'hidden' }}>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>Amortized Staff Loans</p>
            <h3 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-main)', marginTop: '4px' }}>
              â‚µ {(metrics.outstandingLoans / 1000).toLocaleString()}k
            </h3>
            <span style={{ fontSize: '12px', color: '#d97706', fontWeight: '700', whiteSpace: 'nowrap' }}>Medium & long term credit</span>
          </div>
        </div>

        <div className="glass-card-premium" style={{ padding: '24px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: '#fef2f2', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Clock size={28} />
          </div>
          <div style={{ overflow: 'hidden' }}>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>Attendance Rate</p>
            <h3 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-main)', marginTop: '4px' }}>
              96.4%
            </h3>
            <span style={{ fontSize: '12px', color: '#ef4444', fontWeight: '700', whiteSpace: 'nowrap' }}>Checked in today</span>
          </div>
        </div>
      </div>

      {/* Internal HR Sub-Navigation Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', background: 'white', padding: '12px 24px', borderRadius: '20px', border: '1px solid var(--border-dark)', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.03)', width: '100%' }}>
        <nav style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', width: '100%' }}>
          {[
            { id: 'directory', label: 'ðŸ‘¨â€ðŸ’¼ Staff Registry & ID Badges' },
            { id: 'attendance', label: 'â±ï¸ Daily Attendance Logs' },
            { id: 'leaves', label: 'ðŸ–ï¸ Leave & Vacation Vault' },
            { id: 'payroll', label: 'ðŸ’³ Monthly Payroll Run' },
            { id: 'loans', label: 'ðŸ¦ Staff Loans Ledger' },
            { id: 'sanctions', label: 'âš–ï¸ Sanctions Registry' },
            { id: 'appraisals', label: 'â­ Performance Appraisals' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              style={{
                padding: '12px 20px',
                borderRadius: '14px',
                border: 'none',
                fontSize: '14px',
                fontWeight: activeSubTab === tab.id ? '800' : '600',
                backgroundColor: activeSubTab === tab.id ? 'var(--primary)' : 'transparent',
                color: activeSubTab === tab.id ? 'white' : 'var(--text-muted)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: activeSubTab === tab.id ? '0 8px 20px -6px var(--primary)' : 'none',
                whiteSpace: 'nowrap',
                flexShrink: 0
              }}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* ========================================================= */}
      {/* 1. STAFF REGISTRY & BEAUTIFUL EMPLOYEE ID CARDS */}
      {/* ========================================================= */}
      {activeSubTab === 'directory' && (
        <motion.div variants={containerVariants} initial="hidden" animate="show" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ position: 'relative', width: '100%', maxWidth: '380px' }}>
              <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search staff by name, ID, Ghana Card..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: '100%', padding: '14px 16px 14px 48px', borderRadius: '14px', border: '1px solid var(--border-dark)', fontSize: '13px', background: '#f8fafc', fontWeight: '500', outline: 'none' }}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '700' }}><Filter size={16} /> Filter Dept:</span>
              <select value={filterDept} onChange={(e) => setFilterDept(e.target.value)} style={{ padding: '10px 16px', borderRadius: '12px', border: '1px solid var(--border-dark)', fontSize: '13px', fontWeight: '700', background: '#f8fafc', color: 'var(--text-main)', cursor: 'pointer' }}>
                <option value="all">All Departments</option>
                <option value="Executive Management">Executive Management</option>
                <option value="Sales & Leasing">Sales & Leasing</option>
                <option value="Operations & Maintenance">Operations & Maintenance</option>
                <option value="Finance & Accounts">Finance & Accounts</option>
                <option value="Compliance & Legal">Compliance & Legal</option>
                <option value="Security & Surveillance">Security & Surveillance</option>
              </select>
            </div>
          </div>

          {/* BEAUTIFUL PREMIUM EMPLOYEE BADGES GRID */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: '28px' }}>
            {filteredStaff.map((emp) => (
              <motion.div
                key={emp.id}
                variants={itemVariants}
                whileHover={{ y: -6, boxShadow: '0 28px 55px -12px rgba(0, 135, 90, 0.18)' }}
                style={{
                  background: 'white',
                  borderRadius: '24px',
                  border: '1px solid rgba(0, 135, 90, 0.15)',
                  boxShadow: '0 8px 28px -6px rgba(0,0,0,0.08)',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  transition: 'all 0.3s ease',
                  width: '100%'
                }}
              >
                {/* Header Banner */}
                <div style={{ height: '80px', background: 'linear-gradient(135deg, #00875a 0%, #005c3d 100%)', position: 'relative', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexShrink: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Building2 size={14} style={{ color: '#6ee7b7' }} />
                    <span style={{ color: 'white', fontSize: '10px', fontWeight: '900', letterSpacing: '1.5px', textTransform: 'uppercase', opacity: 0.9 }}>RealtyOS Hub</span>
                  </div>
                  <span style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)', color: 'white', padding: '3px 10px', borderRadius: '10px', fontSize: '11px', fontWeight: '900', letterSpacing: '0.5px', border: '1px solid rgba(255,255,255,0.35)' }}>
                    {emp.id}
                  </span>
                  {/* Decorative circles */}
                  <div style={{ position: 'absolute', bottom: '-20px', left: '-20px', width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)', pointerEvents: 'none' }} />
                  <div style={{ position: 'absolute', top: '-30px', right: '80px', width: '90px', height: '90px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', pointerEvents: 'none' }} />
                </div>

                {/* Avatar Row — sits below header, overlapping */}
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', padding: '0 20px', marginTop: '-28px', position: 'relative', zIndex: 10 }}>
                  <div style={{ width: '72px', height: '72px', borderRadius: '50%', border: '4px solid white', overflow: 'hidden', background: '#e2e8f0', boxShadow: '0 8px 20px -4px rgba(0,0,0,0.2)', flexShrink: 0 }}>
                    <img src={emp.passportPhoto} alt={emp.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  {/* Status pill — top right of avatar row */}
                  <span style={{
                    marginBottom: '6px',
                    display: 'inline-flex', alignItems: 'center', gap: '5px',
                    padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '800',
                    background: emp.status === 'Active' ? '#ecfdf5' : '#fffbeb',
                    color: emp.status === 'Active' ? '#059669' : '#d97706',
                    border: `1px solid ${emp.status === 'Active' ? '#6ee7b740' : '#fcd34d60'}`,
                    boxShadow: emp.status === 'Active' ? '0 0 0 3px #ecfdf5' : '0 0 0 3px #fffbeb'
                  }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: emp.status === 'Active' ? '#10b981' : '#f59e0b', boxShadow: emp.status === 'Active' ? '0 0 6px #10b981' : 'none' }} />
                    {emp.status}
                  </span>
                </div>

                {/* Name & Role */}
                <div style={{ padding: '10px 20px 0' }}>
                  <h3 style={{ fontSize: '17px', fontWeight: '900', color: 'var(--text-main)', margin: '0 0 5px', lineHeight: 1.25, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {emp.name}
                  </h3>
                  <span style={{ display: 'inline-block', padding: '3px 12px', background: '#ecfdf5', color: '#00875a', borderRadius: '14px', fontSize: '11px', fontWeight: '800', border: '1px solid #10b98130', maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {emp.role}
                  </span>
                </div>

                {/* Info Grid — Dept, Rank, Contract, Joined */}
                <div style={{ margin: '14px 20px 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <div style={{ background: '#f8fafc', borderRadius: '14px', padding: '10px 12px', border: '1px solid #f1f5f9' }}>
                    <span style={{ fontSize: '9px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', display: 'block', marginBottom: '3px' }}>Department</span>
                    <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-main)', display: 'block', lineHeight: 1.3 }}>{emp.dept}</span>
                  </div>
                  <div style={{ background: '#f0f4ff', borderRadius: '14px', padding: '10px 12px', border: '1px solid #e0e7ff' }}>
                    <span style={{ fontSize: '9px', fontWeight: '800', color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.8px', display: 'block', marginBottom: '3px' }}>Rank</span>
                    <span style={{ fontSize: '12px', fontWeight: '800', color: '#4338ca', display: 'block', lineHeight: 1.3 }}>{emp.rank}</span>
                  </div>
                  <div style={{ background: '#f8fafc', borderRadius: '14px', padding: '10px 12px', border: '1px solid #f1f5f9' }}>
                    <span style={{ fontSize: '9px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', display: 'block', marginBottom: '3px' }}>Contract</span>
                    <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-main)', display: 'block', lineHeight: 1.3 }}>{emp.contract || 'Full-Time'}</span>
                  </div>
                  <div style={{ background: '#f8fafc', borderRadius: '14px', padding: '10px 12px', border: '1px solid #f1f5f9' }}>
                    <span style={{ fontSize: '9px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', display: 'block', marginBottom: '3px' }}>Joined</span>
                    <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-main)', display: 'block', lineHeight: 1.3 }}>{emp.joined || '—'}</span>
                  </div>
                </div>

                {/* Ghana Card ID Strip */}
                <div style={{ margin: '12px 20px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 14px', background: '#f1f5f9', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Shield size={13} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                    <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', letterSpacing: '0.5px' }}>{emp.ghanaCardNo || 'GHA-—'}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#334155', fontWeight: '800', fontSize: '11px' }}>
                    <QrCode size={13} style={{ color: 'var(--primary)' }} /> Secure Tag
                  </div>
                </div>

                {/* Footer Action Buttons */}
                <div style={{ padding: '12px 20px 20px', display: 'flex', gap: '10px', marginTop: 'auto' }}>
                  <button
                    onClick={() => openProfile(emp)}
                    title="Inspect Full HR Dossier"
                    style={{ flex: 1, padding: '11px 0', borderRadius: '14px', background: 'white', border: '1px solid #e2e8f0', color: '#334155', fontSize: '12px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
                  >
                    <Eye size={14} style={{ color: 'var(--text-muted)' }} /> Dossier
                  </button>
                  <button
                    onClick={() => triggerPrintIDTag(emp)}
                    title="Print Official ID Tag (PDF / PNG)"
                    style={{ flex: 1.4, padding: '11px 0', borderRadius: '14px', background: 'linear-gradient(135deg, #00875a, #005c3d)', color: 'white', border: 'none', fontSize: '12px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', cursor: 'pointer', boxShadow: '0 6px 16px -4px rgba(0, 135, 90, 0.45)', transition: 'all 0.2s' }}
                  >
                    <Printer size={14} /> Print ID Tag
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ========================================================= */}
      {/* 2. DAILY ATTENDANCE LOGS TAB (STANDALONE) */}
      {/* ========================================================= */}
      {activeSubTab === 'attendance' && (
        <motion.div variants={containerVariants} initial="hidden" animate="show" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h3 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-main)' }}>Daily Workforce Attendance & Shift Timelogs</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '500', marginTop: '2px' }}>Real-time clock-in timestamps, automated leave detections, and punctuality scoring across corporate and property site locations.</p>
            </div>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f8fafc', border: '1px solid var(--border-dark)', padding: '6px 14px', borderRadius: '14px' }}>
                <Calendar size={16} style={{ color: 'var(--text-muted)' }} />
                <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-muted)' }}>Date:</span>
                <input
                  type="date"
                  value={attendanceDate}
                  onChange={(e) => setAttendanceDate(e.target.value)}
                  style={{ border: 'none', background: 'transparent', fontSize: '13px', fontWeight: '800', color: 'var(--text-main)', cursor: 'pointer', outline: 'none' }}
                />
              </div>

              <button
                onClick={handleOpenTakeAttendanceModal}
                style={{ padding: '12px 24px', borderRadius: '12px', background: 'var(--primary)', color: 'white', border: 'none', fontWeight: '800', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 10px 20px -5px rgba(0, 135, 90, 0.4)' }}
              >
                <Plus size={18} /> Record Daily Attendance Roster Check
              </button>
            </div>
          </div>

          {/* Roster Metrics Banner for Selected Date */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', background: 'white', border: '1px solid var(--border-dark)', padding: '20px', borderRadius: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#ecfdf5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '20px' }}>
                {attendanceDateStats.present}
              </div>
              <div>
                <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Present (On Time)</span>
                <span style={{ fontSize: '18px', fontWeight: '800', color: '#10b981', display: 'block' }}>{attendanceDateStats.present} Personnel</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#fffbeb', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '20px' }}>
                {attendanceDateStats.late}
              </div>
              <div>
                <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Present (Late Arrival)</span>
                <span style={{ fontSize: '18px', fontWeight: '800', color: '#d97706', display: 'block' }}>{attendanceDateStats.late} Personnel</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#e0e7ff', color: '#4338ca', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '20px' }}>
                {attendanceDateStats.leave}
              </div>
              <div>
                <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Approved Leave / Rest</span>
                <span style={{ fontSize: '18px', fontWeight: '800', color: '#4338ca', display: 'block' }}>{attendanceDateStats.leave} Personnel</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#fef2f2', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '20px' }}>
                {attendanceDateStats.absent}
              </div>
              <div>
                <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Unexcused Absent</span>
                <span style={{ fontSize: '18px', fontWeight: '800', color: '#ef4444', display: 'block' }}>{attendanceDateStats.absent} Personnel</span>
              </div>
            </div>
          </div>

          <div className="glass-card-premium" style={{ padding: '0', overflowX: 'auto', borderRadius: '24px', width: '100%' }}>
            {filteredAttendanceLogs.length === 0 ? (
              <div style={{ padding: '64px 24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                <Calendar size={48} style={{ opacity: 0.3, marginBottom: '16px' }} />
                <h4 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '6px' }}>No Attendance Records Found for Selected Date</h4>
                <p style={{ fontSize: '14px', maxWidth: '400px', margin: '0 auto 20px' }}>Click the button above to record the daily check-in roster and automatically verify staff leaves.</p>
                <button
                  onClick={handleOpenTakeAttendanceModal}
                  style={{ padding: '10px 20px', borderRadius: '12px', background: 'var(--primary)', color: 'white', border: 'none', fontWeight: '800', fontSize: '14px', cursor: 'pointer' }}
                >
                  Take Attendance Roster
                </button>
              </div>
            ) : (
              <table style={{ width: '100%', minWidth: '950px', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border-dark)' }}>
                    <th style={{ padding: '18px 24px', fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Employee & Dept</th>
                    <th style={{ padding: '18px 24px', fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Clock-In Time</th>
                    <th style={{ padding: '18px 24px', fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Clock-Out Time</th>
                    <th style={{ padding: '18px 24px', fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Hours</th>
                    <th style={{ padding: '18px 24px', fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Punctuality Status</th>
                    <th style={{ padding: '18px 24px', fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', textAlign: 'right' }}>Audit Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAttendanceLogs.map((log, idx) => (
                    <motion.tr key={log.id} variants={itemVariants} style={{ borderBottom: '1px solid var(--border-dark)', background: idx % 2 === 0 ? 'white' : '#fcfdfd' }}>
                      <td style={{ padding: '18px 24px' }}>
                        <span style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-main)', display: 'block' }}>{log.employee}</span>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>{log.dept}</span>
                      </td>
                      <td style={{ padding: '18px 24px' }}>
                        <span style={{ fontSize: '14px', fontWeight: '800', color: log.clockIn.includes('--') ? '#94a3b8' : '#10b981', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <LogIn size={16} /> {log.clockIn}
                        </span>
                      </td>
                      <td style={{ padding: '18px 24px' }}>
                        <span style={{ fontSize: '14px', fontWeight: '800', color: log.clockOut.includes('--') ? '#94a3b8' : '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <LogOut size={16} /> {log.clockOut}
                        </span>
                      </td>
                      <td style={{ padding: '18px 24px', fontSize: '14px', fontWeight: '800', color: 'var(--primary)' }}>
                        {log.shiftHours}
                      </td>
                      <td style={{ padding: '18px 24px' }}>
                        <span style={{
                          padding: '6px 12px',
                          borderRadius: '20px',
                          fontSize: '11px',
                          fontWeight: '800',
                          backgroundColor: log.status.includes('On Time') ? '#ecfdf5' : log.status.includes('Leave') ? '#e0e7ff' : log.status.includes('Late') ? '#fffbeb' : '#fef2f2',
                          color: log.status.includes('On Time') ? '#10b981' : log.status.includes('Leave') ? '#4338ca' : log.status.includes('Late') ? '#d97706' : '#ef4444',
                          display: 'inline-block'
                        }}>
                          {log.status}
                        </span>
                      </td>
                      <td style={{ padding: '18px 24px', textAlign: 'right', fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)', maxWidth: '220px' }}>
                        {log.notes}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Cumulative Punctuality & Attendance Ledger Summary */}
          <div className="glass-card-premium" style={{ padding: '28px', borderRadius: '24px', width: '100%', marginTop: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <BarChart2 size={24} style={{ color: 'var(--primary)' }} />
              <div>
                <h4 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-main)', margin: 0 }}>Cumulative Workforce Attendance & Punctuality Ledger</h4>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '500', margin: '2px 0 0' }}>Comprehensive aggregation of days present on time, late arrivals, approved statutory rest, and unexcused absences.</p>
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', minWidth: '850px', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border-dark)' }}>
                    <th style={{ padding: '14px 20px', fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Employee & Role</th>
                    <th style={{ padding: '14px 20px', fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', textAlign: 'center' }}>Days Present (On Time)</th>
                    <th style={{ padding: '14px 20px', fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', textAlign: 'center' }}>Days Late Arrival</th>
                    <th style={{ padding: '14px 20px', fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', textAlign: 'center' }}>Days On Approved Leave</th>
                    <th style={{ padding: '14px 20px', fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', textAlign: 'center' }}>Unexcused Absences</th>
                    <th style={{ padding: '14px 20px', fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', textAlign: 'right' }}>Overall Punctuality Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {staffList.map((emp, idx) => (
                    <tr key={emp.id} style={{ borderBottom: '1px solid var(--border-dark)', background: idx % 2 === 0 ? 'white' : '#fcfdfd' }}>
                      <td style={{ padding: '16px 20px' }}>
                        <span style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-main)', display: 'block' }}>{emp.name}</span>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>{emp.role}</span>
                      </td>
                      <td style={{ padding: '16px 20px', textAlign: 'center', fontSize: '15px', fontWeight: '800', color: '#10b981' }}>
                        {emp.daysPresent} Days
                      </td>
                      <td style={{ padding: '16px 20px', textAlign: 'center', fontSize: '15px', fontWeight: '800', color: emp.daysLate > 0 ? '#d97706' : '#64748b' }}>
                        {emp.daysLate} Days
                      </td>
                      <td style={{ padding: '16px 20px', textAlign: 'center', fontSize: '15px', fontWeight: '800', color: emp.daysOnLeave > 0 ? '#4338ca' : '#64748b' }}>
                        {emp.daysOnLeave} Days
                      </td>
                      <td style={{ padding: '16px 20px', textAlign: 'center', fontSize: '15px', fontWeight: '800', color: emp.daysAbsent > 0 ? '#ef4444' : '#64748b' }}>
                        {emp.daysAbsent} Days
                      </td>
                      <td style={{ padding: '16px 20px', textAlign: 'right', fontSize: '16px', fontWeight: '900', color: parseFloat(emp.attendanceRate) < 90 ? '#ef4444' : 'var(--primary)' }}>
                        {emp.attendanceRate}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      )}

      {/* ========================================================= */}
      {/* 3. LEAVES & VACATION VAULT TAB */}
      {/* ========================================================= */}
      {activeSubTab === 'leaves' && (
        <motion.div variants={containerVariants} initial="hidden" animate="show" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h3 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-main)' }}>Employee Vacation & Leave Vault</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '500', marginTop: '2px' }}>Review and sign off on annual vacation entitlements, medical leave certificates, and emergency family absences.</p>
            </div>
            <button
              onClick={() => setShowLeaveModal(true)}
              style={{ padding: '12px 20px', borderRadius: '12px', background: 'var(--primary)', color: 'white', border: 'none', fontWeight: '700', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 10px rgba(0, 135, 90, 0.2)' }}
            >
              <Plus size={18} /> Log New Leave Request
            </button>
          </div>

          <div className="glass-card-premium" style={{ padding: '0', overflowX: 'auto', borderRadius: '24px', width: '100%' }}>
            <table style={{ width: '100%', minWidth: '950px', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border-dark)' }}>
                  <th style={{ padding: '18px 24px', fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Leave Ref & Employee</th>
                  <th style={{ padding: '18px 24px', fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Leave Type</th>
                  <th style={{ padding: '18px 24px', fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Date Range & Duration</th>
                  <th style={{ padding: '18px 24px', fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Reason Summary</th>
                  <th style={{ padding: '18px 24px', fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Approval Status</th>
                  <th style={{ padding: '18px 24px', fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', textAlign: 'right' }}>Audit Action</th>
                </tr>
              </thead>
              <tbody>
                {leavesList.map((lv, idx) => (
                  <motion.tr key={lv.id} variants={itemVariants} style={{ borderBottom: '1px solid var(--border-dark)', background: idx % 2 === 0 ? 'white' : '#fcfdfd' }}>
                    <td style={{ padding: '18px 24px' }}>
                      <span style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-main)', display: 'block' }}>{lv.employee}</span>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>Ref: {lv.id}</span>
                    </td>
                    <td style={{ padding: '18px 24px' }}>
                      <span style={{ fontSize: '13px', padding: '4px 10px', background: '#f1f5f9', borderRadius: '8px', fontWeight: '800', color: '#475569' }}>{lv.type}</span>
                    </td>
                    <td style={{ padding: '18px 24px' }}>
                      <span style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-main)', display: 'block' }}>{lv.formattedDates}</span>
                      <span style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: '700' }}>Duration: {lv.duration}</span>
                    </td>
                    <td style={{ padding: '18px 24px', fontSize: '13px', color: 'var(--text-muted)', fontWeight: '500', maxWidth: '280px' }}>
                      {lv.reason}
                    </td>
                    <td style={{ padding: '18px 24px' }}>
                      <span style={{
                        padding: '6px 12px',
                        borderRadius: '20px',
                        fontSize: '11px',
                        fontWeight: '800',
                        backgroundColor: lv.status === 'Approved' ? '#ecfdf5' : '#fffbeb',
                        color: lv.status === 'Approved' ? '#10b981' : '#d97706',
                        border: lv.status === 'Approved' ? '1px solid #10b98130' : '1px solid #d9770630',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        {lv.status === 'Approved' ? <CheckCircle2 size={14} /> : <Clock size={14} />}
                        {lv.status}
                      </span>
                    </td>
                    <td style={{ padding: '18px 24px', textAlign: 'right' }}>
                      {lv.status === 'Pending Sign-off' && (
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => {
                              setLeavesList(leavesList.map(l => l.id === lv.id ? { ...l, status: 'Approved', approvedBy: 'Louis Kemenyo' } : l));
                              setSuccessMsg(`Approved leave for ${lv.employee}`);
                              setTimeout(() => setSuccessMsg(''), 3000);
                            }}
                            style={{ padding: '6px 12px', borderRadius: '8px', border: 'none', background: '#10b981', color: 'white', fontWeight: '800', fontSize: '12px', cursor: 'pointer' }}
                          >
                            Approve
                          </button>
                        </div>
                      )}
                      {lv.status === 'Approved' && <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '700' }}>Audited by {lv.approvedBy}</span>}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* ========================================================= */}
      {/* 4. MONTHLY PAYROLL RUN TAB */}
      {/* ========================================================= */}
      {activeSubTab === 'payroll' && (
        <motion.div variants={containerVariants} initial="hidden" animate="show" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h3 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-main)' }}>Monthly Salary Calculations & Payroll Runs</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '500', marginTop: '2px' }}>Automatically compile active workforce salary packages, apply automated loan recovery deductions, and route for Finance Officer sign-off.</p>
            </div>
            <button
              onClick={() => setShowPayrollModal(true)}
              style={{ padding: '12px 24px', borderRadius: '12px', background: 'var(--primary)', color: 'white', border: 'none', fontWeight: '800', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 10px 20px -5px rgba(0, 135, 90, 0.4)' }}
            >
              <Play size={18} fill="white" /> Run Monthly Payroll
            </button>
          </div>



          <div className="glass-card-premium" style={{ padding: '0', overflowX: 'auto', borderRadius: '24px', width: '100%' }}>
            <table style={{ width: '100%', minWidth: '950px', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border-dark)' }}>
                  <th style={{ padding: '18px 24px', fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Payroll Run Ref & Month</th>
                  <th style={{ padding: '18px 24px', fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Headcount</th>
                  <th style={{ padding: '18px 24px', fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Gross Salary Payout</th>
                  <th style={{ padding: '18px 24px', fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Loan Deductions Recovered</th>
                  <th style={{ padding: '18px 24px', fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Net ACH Payout</th>
                  <th style={{ padding: '18px 24px', fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Status</th>
                  <th style={{ padding: '18px 24px', fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', textAlign: 'right' }}>Finance Action</th>
                </tr>
              </thead>
              <tbody>
                {payrollRunsList.map((pay, idx) => (
                  <motion.tr key={pay.id} variants={itemVariants} style={{ borderBottom: '1px solid var(--border-dark)', background: idx % 2 === 0 ? 'white' : '#fcfdfd' }}>
                    <td style={{ padding: '18px 24px' }}>
                      <span style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-main)', display: 'block' }}>{pay.monthYear} Payroll</span>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>Ref: {pay.id} â€¢ {pay.runDate}</span>
                    </td>
                    <td style={{ padding: '18px 24px', fontSize: '15px', fontWeight: '800', color: 'var(--text-main)' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', background: '#f1f5f9', borderRadius: '8px' }}>
                        <Users size={14} style={{ color: 'var(--primary)' }} /> {pay.totalStaff} Personnel
                      </span>
                    </td>
                    <td style={{ padding: '18px 24px', fontSize: '16px', fontWeight: '800', color: 'var(--text-main)' }}>
                      {pay.formattedGross}
                    </td>
                    <td style={{ padding: '18px 24px', fontSize: '15px', fontWeight: '800', color: '#ef4444' }}>
                      {pay.formattedDeductions}
                    </td>
                    <td style={{ padding: '18px 24px', fontSize: '18px', fontWeight: '900', color: 'var(--primary)' }}>
                      {pay.formattedNet}
                    </td>
                    <td style={{ padding: '18px 24px' }}>
                      <span style={{
                        padding: '6px 12px',
                        borderRadius: '20px',
                        fontSize: '11px',
                        fontWeight: '800',
                        backgroundColor: pay.status === 'Approved & Disbursed' ? '#ecfdf5' : pay.status === 'Rejected / Re-audit' ? '#fef2f2' : '#fffbeb',
                        color: pay.status === 'Approved & Disbursed' ? '#10b981' : pay.status === 'Rejected / Re-audit' ? '#ef4444' : '#d97706',
                        display: 'inline-block'
                      }}>
                        {pay.status}
                      </span>
                    </td>
                    <td style={{ padding: '18px 24px', textAlign: 'right' }}>
                      {pay.status === 'Pending Finance Sign-off' ? (
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => handleApprovePayroll(pay.id)}
                            title="Approve & Schedule ACH Payout"
                            style={{ padding: '8px 14px', borderRadius: '10px', border: 'none', background: '#10b981', color: 'white', fontWeight: '800', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                          >
                            <Check size={14} /> Approve
                          </button>
                          <button
                            onClick={() => handleRejectPayroll(pay.id)}
                            title="Reject & Flag for Re-audit"
                            style={{ padding: '8px 14px', borderRadius: '10px', border: 'none', background: '#ef4444', color: 'white', fontWeight: '800', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                          >
                            <X size={14} /> Reject
                          </button>
                        </div>
                      ) : (
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '700' }}>Audit Complete</span>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* ========================================================= */}
      {/* 5. STAFF LOANS TAB */}
      {/* ========================================================= */}
      {activeSubTab === 'loans' && (
        <motion.div variants={containerVariants} initial="hidden" animate="show" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h3 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-main)' }}>Amortized Staff Loans & Long-Term Credit Ledger</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '500', marginTop: '2px' }}>Medium to long-term employee credit structured over fixed terms with guarantor verification and automated payroll deductions.</p>
            </div>
            <button
              onClick={() => setShowLoanModal(true)}
              style={{ padding: '12px 20px', borderRadius: '12px', background: 'var(--primary)', color: 'white', border: 'none', fontWeight: '700', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 10px rgba(0, 135, 90, 0.2)' }}
            >
              <Plus size={18} /> Request Staff Loan
            </button>
          </div>

          <div className="glass-card-premium" style={{ padding: '0', overflowX: 'auto', borderRadius: '24px', width: '100%' }}>
            <table style={{ width: '100%', minWidth: '950px', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border-dark)' }}>
                  <th style={{ padding: '18px 24px', fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Loan Ref & Employee</th>
                  <th style={{ padding: '18px 24px', fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Principal Amount</th>
                  <th style={{ padding: '18px 24px', fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Term & Rate</th>
                  <th style={{ padding: '18px 24px', fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Monthly Installment</th>
                  <th style={{ padding: '18px 24px', fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Remaining Bal</th>
                  <th style={{ padding: '18px 24px', fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Guarantor & Purpose</th>
                  <th style={{ padding: '18px 24px', fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', textAlign: 'right' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {loansList.map((ln, idx) => (
                  <motion.tr key={ln.id} variants={itemVariants} style={{ borderBottom: '1px solid var(--border-dark)', background: idx % 2 === 0 ? 'white' : '#fcfdfd' }}>
                    <td style={{ padding: '18px 24px' }}>
                      <span style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-main)', display: 'block' }}>{ln.employee}</span>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>Ref: {ln.id} â€¢ Disbursed {ln.dateDisbursed}</span>
                    </td>
                    <td style={{ padding: '18px 24px', fontSize: '16px', fontWeight: '800', color: 'var(--primary)' }}>
                      {ln.formattedPrincipal}
                    </td>
                    <td style={{ padding: '18px 24px' }}>
                      <span style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-main)', display: 'block' }}>{ln.term}</span>
                      <span style={{ fontSize: '12px', color: '#d97706', fontWeight: '700' }}>APR: {ln.interestRate}</span>
                    </td>
                    <td style={{ padding: '18px 24px', fontSize: '15px', fontWeight: '800', color: 'var(--text-main)' }}>
                      {ln.monthlyInstallment}
                    </td>
                    <td style={{ padding: '18px 24px', fontSize: '16px', fontWeight: '800', color: ln.remainingBal > 0 ? '#ef4444' : '#10b981' }}>
                      {ln.formattedBal}
                    </td>
                    <td style={{ padding: '18px 24px', fontSize: '13px', color: 'var(--text-muted)', fontWeight: '500', maxWidth: '240px' }}>
                      <span style={{ fontWeight: '800', color: '#475569', display: 'block' }}>Guarantor: {ln.guarantor}</span>
                      <span>{ln.purpose}</span>
                    </td>
                    <td style={{ padding: '18px 24px', textAlign: 'right' }}>
                      <span style={{
                        padding: '6px 12px',
                        borderRadius: '20px',
                        fontSize: '11px',
                        fontWeight: '800',
                        backgroundColor: ln.status === 'Fully Repaid' ? '#ecfdf5' : ln.status.includes('Active') ? '#e0e7ff' : '#fffbeb',
                        color: ln.status === 'Fully Repaid' ? '#10b981' : ln.status.includes('Active') ? '#4338ca' : '#d97706',
                        display: 'inline-block'
                      }}>
                        {ln.status}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* ========================================================= */}
      {/* 6. SANCTIONS & 7. APPRAISALS */}
      {/* ========================================================= */}
      {activeSubTab === 'sanctions' && (
        <motion.div variants={containerVariants} initial="hidden" animate="show" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-main)' }}>Disciplinary Sanctions & Warnings Registry</h3>
            <button
              onClick={() => setShowSanctionModal(true)}
              style={{ padding: '12px 20px', borderRadius: '12px', background: '#ef4444', color: 'white', border: 'none', fontWeight: '700', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 10px rgba(239, 68, 68, 0.2)' }}
            >
              <Plus size={18} /> Record Disciplinary Action
            </button>
          </div>

          <div className="glass-card-premium" style={{ padding: '0', overflowX: 'auto', borderRadius: '24px', width: '100%' }}>
            <table style={{ width: '100%', minWidth: '950px', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border-dark)' }}>
                  <th style={{ padding: '18px 24px', fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Ref & Date</th>
                  <th style={{ padding: '18px 24px', fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Employee</th>
                  <th style={{ padding: '18px 24px', fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Infraction Details</th>
                  <th style={{ padding: '18px 24px', fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Severity / Penalty</th>
                  <th style={{ padding: '18px 24px', fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Incident Audit Notes</th>
                  <th style={{ padding: '18px 24px', fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', textAlign: 'right' }}>Logged By</th>
                </tr>
              </thead>
              <tbody>
                {sanctionsList.map((sn, idx) => (
                  <motion.tr key={sn.id} variants={itemVariants} style={{ borderBottom: '1px solid var(--border-dark)', background: idx % 2 === 0 ? 'white' : '#fcfdfd' }}>
                    <td style={{ padding: '18px 24px' }}>
                      <span style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-main)', display: 'block' }}>{sn.id}</span>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>{sn.date}</span>
                    </td>
                    <td style={{ padding: '18px 24px', fontSize: '15px', fontWeight: '800', color: 'var(--text-main)' }}>
                      {sn.employee}
                    </td>
                    <td style={{ padding: '18px 24px', fontSize: '14px', fontWeight: '800', color: '#ef4444' }}>
                      {sn.infraction}
                    </td>
                    <td style={{ padding: '18px 24px' }}>
                      <span style={{ padding: '4px 10px', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '8px', fontSize: '12px', fontWeight: '800', color: '#ef4444' }}>
                        {sn.severity}
                      </span>
                    </td>
                    <td style={{ padding: '18px 24px', fontSize: '13px', color: 'var(--text-muted)', fontWeight: '500', maxWidth: '280px' }}>
                      {sn.notes}
                    </td>
                    <td style={{ padding: '18px 24px', textAlign: 'right', fontSize: '13px', fontWeight: '700', color: 'var(--text-muted)' }}>
                      {sn.issuer}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {activeSubTab === 'appraisals' && (
        <motion.div variants={containerVariants} initial="hidden" animate="show" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-main)' }}>Bi-Annual Performance Appraisals & KPI Reviews</h3>
            <button
              onClick={() => setShowAppraisalModal(true)}
              style={{ padding: '12px 20px', borderRadius: '12px', background: 'var(--primary)', color: 'white', border: 'none', fontWeight: '700', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 10px rgba(0, 135, 90, 0.2)' }}
            >
              <Plus size={18} /> Record Employee Review
            </button>
          </div>

          <div className="glass-card-premium" style={{ padding: '0', overflowX: 'auto', borderRadius: '24px', width: '100%' }}>
            <table style={{ width: '100%', minWidth: '950px', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border-dark)' }}>
                  <th style={{ padding: '18px 24px', fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Ref & Employee</th>
                  <th style={{ padding: '18px 24px', fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>KPI Score</th>
                  <th style={{ padding: '18px 24px', fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Key Accomplishments</th>
                  <th style={{ padding: '18px 24px', fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Promotion / Bonus Recommendation</th>
                  <th style={{ padding: '18px 24px', fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', textAlign: 'right' }}>Review Date</th>
                </tr>
              </thead>
              <tbody>
                {appraisalsList.map((ap, idx) => (
                  <motion.tr key={ap.id} variants={itemVariants} style={{ borderBottom: '1px solid var(--border-dark)', background: idx % 2 === 0 ? 'white' : '#fcfdfd' }}>
                    <td style={{ padding: '18px 24px' }}>
                      <span style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-main)', display: 'block' }}>{ap.employee}</span>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>Reviewer: {ap.reviewer}</span>
                    </td>
                    <td style={{ padding: '18px 24px' }}>
                      <span style={{ fontSize: '15px', fontWeight: '800', color: '#d97706', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Star size={16} fill="#f59e0b" color="#f59e0b" /> {ap.rating} / 5.0
                      </span>
                    </td>
                    <td style={{ padding: '18px 24px', fontSize: '13px', color: 'var(--text-main)', fontWeight: '600', maxWidth: '300px' }}>
                      {ap.keyAchievements}
                    </td>
                    <td style={{ padding: '18px 24px', fontSize: '13px', color: 'var(--primary)', fontWeight: '700', maxWidth: '250px' }}>
                      {ap.recommendation}
                    </td>
                    <td style={{ padding: '18px 24px', textAlign: 'right', fontSize: '13px', fontWeight: '700', color: 'var(--text-muted)' }}>
                      {ap.date}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* ========================================================= */}
      {/* MODAL: ONBOARD NEW EMPLOYEE */}
      {/* ========================================================= */}
      <AnimatePresence>
        {showOnboardModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px', boxSizing: 'border-box' }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              style={{ background: '#f8fafc', borderRadius: '32px', width: '980px', maxWidth: '100%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 35px 60px -15px rgba(0,0,0,0.35)', display: 'flex', flexDirection: 'column', border: '1px solid rgba(255,255,255,0.4)', boxSizing: 'border-box' }}
            >
              {/* MODAL HEADER BANNER */}
              <div style={{ padding: '36px 40px', background: 'linear-gradient(135deg, #00875a 0%, #022c1e 100%)', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '4px solid #10b981', flexShrink: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '18px', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#34d399', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)' }}>
                    <UserPlus size={28} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '26px', fontWeight: '900', margin: 0, letterSpacing: '-0.5px', color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      Onboard New Employee Dossier <span style={{ fontSize: '11px', background: '#10b981', color: 'white', padding: '4px 10px', borderRadius: '20px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>HR Portal</span>
                    </h3>
                    <p style={{ fontSize: '13px', color: '#a7f3d0', fontWeight: '600', margin: '4px 0 0', opacity: 0.9 }}>
                      Complete professional onboarding, biometric credential registration, and auto-generate staff ID badges.
                    </p>
                  </div>
                </div>
                <button onClick={() => setShowOnboardModal(false)} style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)', width: '42px', height: '42px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'} onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}>
                  <X size={22} />
                </button>
              </div>

              {/* FORM BODY */}
              <form onSubmit={handleOnboardStaff} style={{ display: 'flex', flexDirection: 'column', gap: '28px', padding: '36px 40px', boxSizing: 'border-box' }}>

                {/* SECTION 1: BIOMETRIC FILES UPLOAD CONTAINER */}
                <div style={{ background: 'white', borderRadius: '24px', border: '1px solid #cbd5e1', padding: '32px', boxShadow: '0 10px 25px -10px rgba(0,0,0,0.05)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px', borderBottom: '1px solid #f1f5f9', paddingBottom: '16px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: '#ecfdf5', color: '#00875a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '14px' }}>1</div>
                    <h4 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: 'var(--text-main)' }}>Biometric Identification & Card Scans</h4>
                    <span style={{ marginLeft: 'auto', fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>Used for official access pass printing</span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
                    {/* Passport Upload */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', background: '#f8fafc', padding: '20px', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
                      <span style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-main)' }}>Employee Passport Scan</span>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '-8px' }}>Standard 1:1 ratio square/circle</span>
                      <label style={{ width: '130px', height: '130px', borderRadius: '50%', border: '3px dashed #00875a', background: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden', position: 'relative', transition: '0.2s', boxShadow: '0 8px 20px rgba(0,135,90,0.15)' }}>
                        {passportPreview ? (
                          <img src={passportPreview} alt="Passport Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '12px', textAlign: 'center' }}>
                            <Camera size={32} style={{ color: '#00875a', marginBottom: '6px' }} />
                            <span style={{ fontSize: '12px', fontWeight: '800', color: '#00875a' }}>Select Photo</span>
                          </div>
                        )}
                        <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, setPassportPreview)} style={{ display: 'none' }} />
                      </label>
                    </div>

                    {/* Ghana Card Front Upload */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', background: '#f8fafc', padding: '20px', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
                      <span style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-main)' }}>Ghana Card (Front Scan)</span>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '-8px' }}>National Identity Verification</span>
                      <label style={{ width: '100%', height: '130px', borderRadius: '18px', border: '2px dashed #64748b', background: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden', position: 'relative', transition: '0.2s', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                        {ghanaCardFrontPreview ? (
                          <img src={ghanaCardFrontPreview} alt="Ghana Card Front" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '12px', textAlign: 'center' }}>
                            <UploadCloud size={32} style={{ color: '#64748b', marginBottom: '6px' }} />
                            <span style={{ fontSize: '12px', fontWeight: '800', color: '#334155' }}>Upload Front ID</span>
                          </div>
                        )}
                        <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, setGhanaCardFrontPreview)} style={{ display: 'none' }} />
                      </label>
                    </div>

                    {/* Ghana Card Back Upload */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', background: '#f8fafc', padding: '20px', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
                      <span style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-main)' }}>Ghana Card (Back Scan)</span>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '-8px' }}>Includes Barcode & Serial</span>
                      <label style={{ width: '100%', height: '130px', borderRadius: '18px', border: '2px dashed #64748b', background: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden', position: 'relative', transition: '0.2s', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                        {ghanaCardBackPreview ? (
                          <img src={ghanaCardBackPreview} alt="Ghana Card Back" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '12px', textAlign: 'center' }}>
                            <UploadCloud size={32} style={{ color: '#64748b', marginBottom: '6px' }} />
                            <span style={{ fontSize: '12px', fontWeight: '800', color: '#334155' }}>Upload Back ID</span>
                          </div>
                        )}
                        <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, setGhanaCardBackPreview)} style={{ display: 'none' }} />
                      </label>
                    </div>
                  </div>
                </div>

                {/* SECTION 2: PERSONAL IDENTITY & CREDENTIALS */}
                <div style={{ background: 'white', borderRadius: '24px', border: '1px solid #cbd5e1', padding: '32px', boxShadow: '0 10px 25px -10px rgba(0,0,0,0.05)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px', borderBottom: '1px solid #f1f5f9', paddingBottom: '16px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: '#ecfdf5', color: '#00875a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '14px' }}>2</div>
                    <h4 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: 'var(--text-main)' }}>Personal Identity & Contact Information</h4>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '8px' }}>Full Legal Name</label>
                      <input type="text" name="name" required placeholder="e.g. Osei Tutu" style={{ width: '100%', padding: '14px 18px', borderRadius: '14px', border: '1px solid #cbd5e1', fontSize: '14px', fontWeight: '600', outline: 'none', background: '#f8fafc', boxSizing: 'border-box' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '8px' }}>Ghana Card PIN / National ID</label>
                      <input
                        type="text"
                        required
                        value={newEmpGhanaCard}
                        onChange={handleGhanaCardInputChange}
                        placeholder="GHA-718293819-2"
                        style={{ width: '100%', padding: '14px 18px', borderRadius: '14px', border: '1px solid #cbd5e1', fontSize: '14px', fontWeight: '800', color: 'var(--primary)', outline: 'none', background: '#ecfdf5', boxSizing: 'border-box', letterSpacing: '0.5px' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '8px' }}>Corporate Email Address</label>
                      <input type="email" name="email" required placeholder="e.g. osei@realtyos.com" style={{ width: '100%', padding: '14px 18px', borderRadius: '14px', border: '1px solid #cbd5e1', fontSize: '14px', fontWeight: '600', outline: 'none', background: '#f8fafc', boxSizing: 'border-box' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '8px' }}>Direct Phone Contact</label>
                      <input type="text" name="phone" required placeholder="e.g. +233 24 123 4567" style={{ width: '100%', padding: '14px 18px', borderRadius: '14px', border: '1px solid #cbd5e1', fontSize: '14px', fontWeight: '600', outline: 'none', background: '#f8fafc', boxSizing: 'border-box' }} />
                    </div>
                  </div>
                </div>

                {/* SECTION 3: ROLE PLACEMENT & COMPENSATION */}
                <div style={{ background: 'white', borderRadius: '24px', border: '1px solid #cbd5e1', padding: '32px', boxShadow: '0 10px 25px -10px rgba(0,0,0,0.05)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px', borderBottom: '1px solid #f1f5f9', paddingBottom: '16px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: '#ecfdf5', color: '#00875a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '14px' }}>3</div>
                    <h4 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: 'var(--text-main)' }}>Professional Placement & Monthly Compensation</h4>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '8px' }}>Assign Department</label>
                      <select name="dept" style={{ width: '100%', padding: '14px 18px', borderRadius: '14px', border: '1px solid #cbd5e1', fontSize: '14px', fontWeight: '600', outline: 'none', background: '#f8fafc', boxSizing: 'border-box' }}>
                        <option value="Executive Management">Executive Management</option>
                        <option value="Sales & Leasing">Sales & Leasing</option>
                        <option value="Operations & Maintenance">Operations & Maintenance</option>
                        <option value="Finance & Accounts">Finance & Accounts</option>
                        <option value="Compliance & Legal">Compliance & Legal</option>
                        <option value="Security & Surveillance">Security & Surveillance</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '8px' }}>Official Job Title / Role</label>
                      <input type="text" name="role" required placeholder="e.g. Senior Property Manager" style={{ width: '100%', padding: '14px 18px', borderRadius: '14px', border: '1px solid #cbd5e1', fontSize: '14px', fontWeight: '600', outline: 'none', background: '#f8fafc', boxSizing: 'border-box' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '8px' }}>Staff Rank & Seniority Grade</label>
                      <select name="rank" style={{ width: '100%', padding: '14px 18px', borderRadius: '14px', border: '1px solid #cbd5e1', fontSize: '14px', fontWeight: '600', outline: 'none', background: '#f8fafc', boxSizing: 'border-box' }}>
                        <option value="Junior Staff (Grade 3)">Junior Staff (Grade 3)</option>
                        <option value="Senior Staff (Grade 2)">Senior Staff (Grade 2)</option>
                        <option value="Executive Staff (Grade 1)">Executive Staff (Grade 1)</option>
                        <option value="Subcontractor / Temporary">Subcontractor / Temporary</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '8px' }}>Gross Monthly Compensation (GHS â‚µ)</label>
                      <input type="number" name="salary" required defaultValue={7500} style={{ width: '100%', padding: '14px 18px', borderRadius: '14px', border: '1px solid #cbd5e1', fontSize: '15px', fontWeight: '800', color: '#00875a', outline: 'none', background: '#f8fafc', boxSizing: 'border-box' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '8px' }}>Employment Contract Setup</label>
                      <select name="contract" style={{ width: '100%', padding: '14px 18px', borderRadius: '14px', border: '1px solid #cbd5e1', fontSize: '14px', fontWeight: '600', outline: 'none', background: '#f8fafc', boxSizing: 'border-box' }}>
                        <option value="Permanent Full-time">Permanent Full-time</option>
                        <option value="Annual Contract">Annual Contract</option>
                        <option value="Temporary / Subcontractor">Temporary / Subcontractor</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* SECTION 4: FINANCIAL DEPOSIT & EMERGENCY CONTACTS */}
                <div style={{ background: 'white', borderRadius: '24px', border: '1px solid #cbd5e1', padding: '32px', boxShadow: '0 10px 25px -10px rgba(0,0,0,0.05)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px', borderBottom: '1px solid #f1f5f9', paddingBottom: '16px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: '#ecfdf5', color: '#00875a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '14px' }}>4</div>
                    <h4 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: 'var(--text-main)' }}>Direct Deposit ACH & Emergency Backup</h4>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '8px' }}>Destination Bank Name</label>
                      <select name="bankName" style={{ width: '100%', padding: '14px 18px', borderRadius: '14px', border: '1px solid #cbd5e1', fontSize: '14px', fontWeight: '600', outline: 'none', background: '#f8fafc', boxSizing: 'border-box' }}>
                        <optgroup label="Major Commercial Banks">
                          <option value="Ecobank Ghana PLC">Ecobank Ghana PLC</option>
                          <option value="GCB Bank PLC">GCB Bank PLC</option>
                          <option value="Stanbic Bank Ghana Ltd">Stanbic Bank Ghana Ltd</option>
                          <option value="Absa Bank Ghana PLC">Absa Bank Ghana PLC</option>
                          <option value="Fidelity Bank Ghana Ltd">Fidelity Bank Ghana Ltd</option>
                          <option value="Consolidated Bank Ghana (CBG)">Consolidated Bank Ghana (CBG)</option>
                          <option value="Access Bank Ghana PLC">Access Bank Ghana PLC</option>
                          <option value="Standard Chartered Bank Ghana PLC">Standard Chartered Bank Ghana PLC</option>
                          <option value="Zenith Bank Ghana Ltd">Zenith Bank Ghana Ltd</option>
                          <option value="Guaranty Trust Bank (GTBank) Ghana">Guaranty Trust Bank (GTBank) Ghana</option>
                          <option value="United Bank for Africa (UBA) Ghana">United Bank for Africa (UBA) Ghana</option>
                          <option value="CalBank PLC">CalBank PLC</option>
                          <option value="Agricultural Development Bank (ADB) PLC">Agricultural Development Bank (ADB) PLC</option>
                          <option value="Republic Bank Ghana PLC">Republic Bank Ghana PLC</option>
                          <option value="Prudential Bank Ltd">Prudential Bank Ltd</option>
                          <option value="FBNBank Ghana Ltd">FBNBank Ghana Ltd</option>
                          <option value="Bank of Africa Ghana Ltd">Bank of Africa Ghana Ltd</option>
                          <option value="First Atlantic Bank Ltd">First Atlantic Bank Ltd</option>
                          <option value="Societe Generale Ghana PLC">Societe Generale Ghana PLC</option>
                          <option value="OmniBSIC Bank Ghana Ltd">OmniBSIC Bank Ghana Ltd</option>
                          <option value="National Investment Bank (NIB)">National Investment Bank (NIB)</option>
                        </optgroup>
                        <optgroup label="Savings & Loans / Microfinance / Rural Banks">
                          <option value="Best Point Savings & Loans Ltd">Best Point Savings & Loans Ltd</option>
                          <option value="Letshego Savings & Loans">Letshego Savings & Loans</option>
                          <option value="Opportunity International Savings & Loans">Opportunity International Savings & Loans</option>
                          <option value="Bayport Financial Services">Bayport Financial Services</option>
                          <option value="Izwe Savings & Loans">Izwe Savings & Loans</option>
                          <option value="Pan-African Savings & Loans">Pan-African Savings & Loans</option>
                          <option value="Bond Savings & Loans">Bond Savings & Loans</option>
                          <option value="Multi Credit Savings & Loans">Multi Credit Savings & Loans</option>
                          <option value="Amenfiman Rural Bank">Amenfiman Rural Bank</option>
                          <option value="Atwima Kwanwoma Rural Bank">Atwima Kwanwoma Rural Bank</option>
                          <option value="Juaben Rural Bank">Juaben Rural Bank</option>
                          <option value="Fiaseman Rural Bank">Fiaseman Rural Bank</option>
                        </optgroup>
                        <optgroup label="Mobile Money & Fintech / Digital Wallets">
                          <option value="MTN Mobile Money (MoMo)">MTN Mobile Money (MoMo)</option>
                          <option value="Telecel Cash (Vodafone Cash)">Telecel Cash (Vodafone Cash)</option>
                          <option value="AT Money (AirtelTigo)">AT Money (AirtelTigo)</option>
                          <option value="Zeepay Ghana">Zeepay Ghana</option>
                        </optgroup>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '8px' }}>Bank Account Beneficiary Name</label>
                      <input type="text" name="bankAccName" required placeholder="e.g. Osei Tutu" style={{ width: '100%', padding: '14px 18px', borderRadius: '14px', border: '1px solid #cbd5e1', fontSize: '14px', fontWeight: '600', outline: 'none', background: '#f8fafc', boxSizing: 'border-box' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '8px' }}>Bank Account Number</label>
                      <input type="text" name="bankAccNo" required placeholder="e.g. 1029384758102" style={{ width: '100%', padding: '14px 18px', borderRadius: '14px', border: '1px solid #cbd5e1', fontSize: '14px', fontWeight: '600', outline: 'none', background: '#f8fafc', boxSizing: 'border-box' }} />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', background: '#fff1f2', padding: '24px', borderRadius: '20px', border: '1px solid #fecdd3' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: '900', color: '#9f1239', marginBottom: '8px' }}>ðŸš¨ Emergency Contact Name & Relation</label>
                      <input type="text" name="emergencyName" required placeholder="e.g. Grace Tutu (Wife)" style={{ width: '100%', padding: '14px 18px', borderRadius: '14px', border: '1px solid #fca5a5', fontSize: '14px', fontWeight: '700', outline: 'none', background: 'white', boxSizing: 'border-box', color: '#881337' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: '900', color: '#9f1239', marginBottom: '8px' }}>Emergency Contact Phone Number</label>
                      <input type="text" name="emergencyPhone" required placeholder="e.g. +233 20 999 1122" style={{ width: '100%', padding: '14px 18px', borderRadius: '14px', border: '1px solid #fca5a5', fontSize: '14px', fontWeight: '700', outline: 'none', background: 'white', boxSizing: 'border-box', color: '#881337' }} />
                    </div>
                  </div>
                </div>

                {/* MODAL FOOTER BUTTONS */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '16px', marginTop: '16px' }}>
                  <button
                    type="button"
                    onClick={() => setShowOnboardModal(false)}
                    style={{ padding: '16px 32px', borderRadius: '16px', border: '1px solid #cbd5e1', background: 'white', color: '#334155', fontWeight: '800', fontSize: '15px', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#f1f5f9'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                  >
                    Cancel Dossier
                  </button>
                  <button
                    type="submit"
                    style={{ background: 'linear-gradient(135deg, #00875a 0%, #023825 100%)', color: 'white', border: 'none', padding: '16px 40px', borderRadius: '16px', fontSize: '15px', fontWeight: '800', cursor: 'pointer', boxShadow: '0 12px 25px -5px rgba(0, 135, 90, 0.4)', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '10px' }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    <UserPlus size={20} /> Commit Dossier & Auto-Generate Digital ID Tag
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================= */}
      {/* MODAL: PRINT OFFICIAL EMPLOYEE ID TAG PREVIEW */}
      {/* ========================================================= */}
      <AnimatePresence>
        {printableTagEmployee && (
          <div className="print-modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200, padding: '20px' }}>
            <motion.div
              className="print-modal-content"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              style={{ background: '#ffffff', padding: '40px', borderRadius: '36px', width: '860px', maxWidth: '95vw', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 30px 60px -15px rgba(0,0,0,0.4)', display: 'flex', flexDirection: 'column', alignItems: 'center', border: '1px solid rgba(255,255,255,0.2)' }}
            >
              <div className="no-print" style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', borderBottom: '1px solid #f1f5f9', paddingBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: 'var(--primary-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                    <Printer size={22} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-main)', margin: 0 }}>Official ID Badge (Front & Back)</h3>
                    <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '600' }}>CR80 Standard Personnel Access Credentials</span>
                  </div>
                </div>
                <button onClick={() => setPrintableTagEmployee(null)} style={{ background: '#f1f5f9', border: 'none', width: '38px', height: '38px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', cursor: 'pointer', transition: '0.2s' }}>
                  <X size={20} />
                </button>
              </div>

              {/* DUAL CARD CONTAINER (FRONT & BACK) */}
              <div id="printable-id-cards-container" style={{ display: 'flex', flexWrap: 'wrap', gap: '32px', justifyContent: 'center', width: '100%' }}>

                {/* --- FRONT CARD --- */}
                <div id="printable-id-card-front" className="printable-card-unit" style={{ width: '360px', minHeight: '560px', borderRadius: '28px', background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)', border: '2px solid #cbd5e1', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.22)', overflow: 'hidden', display: 'flex', flexDirection: 'column', position: 'relative', boxSizing: 'border-box' }}>
                  {/* Background Watermark Crest */}
                  <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', opacity: 0.03, pointerEvents: 'none', zIndex: 1 }}>
                    <Building2 size={280} color="#00875a" />
                  </div>

                  {/* Deep Emerald Header Banner */}
                  <div style={{ padding: '26px 24px 52px', background: 'linear-gradient(135deg, #00875a 0%, #023825 100%)', color: 'white', position: 'relative', borderBottom: '4px solid #10b981', zIndex: 2 }}>
                    <div style={{ position: 'absolute', top: '16px', right: '16px', display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(255,255,255,0.2)', padding: '4px 10px', borderRadius: '20px', backdropFilter: 'blur(4px)' }}>
                      <ShieldCheck size={14} color="#38bdf8" />
                      <span style={{ fontSize: '10px', fontWeight: '800', color: '#e0f2fe', letterSpacing: '0.5px' }}>SECURE</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center', marginTop: '4px' }}>
                      <Building2 size={24} color="#34d399" />
                      <h4 style={{ margin: 0, fontSize: '20px', fontWeight: '900', letterSpacing: '2px', textTransform: 'uppercase' }}>REALTYOS PLAZA</h4>
                    </div>
                    <span style={{ fontSize: '10px', fontWeight: '700', color: '#a7f3d0', letterSpacing: '1px', display: 'block', marginTop: '4px', textAlign: 'center', opacity: 0.9 }}>
                      STAFF IDENTIFICATION & ACCESS CREDENTIAL
                    </span>
                  </div>

                  {/* Centered Avatar with Verification Badge */}
                  <div style={{ alignSelf: 'center', marginTop: '-56px', position: 'relative', zIndex: 10 }}>
                    <div style={{ width: '112px', height: '112px', borderRadius: '24px', border: '4px solid white', overflow: 'hidden', background: '#e2e8f0', boxShadow: '0 12px 25px rgba(0,0,0,0.18)', position: 'relative' }}>
                      <img src={printableTagEmployee.passportPhoto} alt={printableTagEmployee.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div style={{ position: 'absolute', bottom: '-4px', right: '-4px', background: '#10b981', border: '3px solid white', borderRadius: '50%', padding: '6px', color: 'white', boxShadow: '0 4px 10px rgba(16,185,129,0.4)' }} title="Verified Active Personnel">
                      <Check size={16} strokeWidth={3} />
                    </div>
                  </div>

                  {/* Employee Name, Titles & Identification Metadata */}
                  <div style={{ padding: '20px 24px 28px', textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 5 }}>
                    <h3 style={{ fontSize: '24px', fontWeight: '900', color: 'var(--text-main)', margin: '0 0 4px', letterSpacing: '-0.5px' }}>
                      {printableTagEmployee.name}
                    </h3>
                    <span style={{ fontSize: '15px', fontWeight: '800', color: '#00875a', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px', display: 'block' }}>
                      {printableTagEmployee.role}
                    </span>

                    <div style={{ display: 'flex', gap: '8px', marginBottom: '22px', flexWrap: 'wrap', justifyContent: 'center' }}>
                      <span style={{ padding: '5px 14px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '20px', fontSize: '11px', fontWeight: '800', color: '#334155', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        {printableTagEmployee.dept}
                      </span>
                      <span style={{ padding: '5px 14px', background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '20px', fontSize: '11px', fontWeight: '800', color: '#059669', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        {printableTagEmployee.rank ? printableTagEmployee.rank.split('(')[0].trim() : 'Staff'}
                      </span>
                    </div>

                    {/* Identification Card Grid (No Emergency Contact) */}
                    <div style={{ width: '100%', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', textAlign: 'left', marginBottom: '24px', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)' }}>
                      <div>
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '800', display: 'block', textTransform: 'uppercase' }}>Emp ID No.</span>
                        <span style={{ fontSize: '15px', color: 'var(--text-main)', fontWeight: '900', letterSpacing: '1px' }}>{printableTagEmployee.id}</span>
                      </div>
                      <div>
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '800', display: 'block', textTransform: 'uppercase' }}>Ghana Card PIN</span>
                        <span style={{ fontSize: '14px', color: '#00875a', fontWeight: '800', letterSpacing: '0.5px' }}>{printableTagEmployee.ghanaCardNo}</span>
                      </div>
                      <div style={{ gridColumn: 'span 2', borderTop: '1px solid #e2e8f0', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '800', display: 'block', textTransform: 'uppercase' }}>Corporate Email</span>
                          <span style={{ fontSize: '13px', color: 'var(--text-main)', fontWeight: '700' }}>{printableTagEmployee.email}</span>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '800', display: 'block', textTransform: 'uppercase' }}>Staff Contact</span>
                          <span style={{ fontSize: '13px', color: 'var(--primary)', fontWeight: '800' }}>{printableTagEmployee.phone}</span>
                        </div>
                      </div>
                    </div>

                    {/* Official Credentials Footer */}
                    <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '16px', width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 'auto' }}>
                      <div style={{ textAlign: 'left' }}>
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '800', display: 'block', textTransform: 'uppercase' }}>Issued Date</span>
                        <span style={{ fontSize: '13px', color: 'var(--text-main)', fontWeight: '800' }}>{printableTagEmployee.joined || '15 Jan 2022'}</span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontFamily: "'Plus Jakarta Sans', cursive, sans-serif", fontSize: '16px', fontWeight: '800', color: 'var(--primary)', fontStyle: 'italic', borderBottom: '1px solid #cbd5e1', paddingBottom: '2px', marginBottom: '4px', display: 'inline-block' }}>
                          L. Kemenyo
                        </div>
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '800', display: 'block', textTransform: 'uppercase' }}>Authorized Signature</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* --- BACK CARD --- */}
                <div id="printable-id-card-back" className="printable-card-unit" style={{ width: '360px', minHeight: '560px', borderRadius: '28px', background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)', border: '2px solid #cbd5e1', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.22)', overflow: 'hidden', display: 'flex', flexDirection: 'column', position: 'relative', padding: '36px 28px', boxSizing: 'border-box' }}>
                  {/* Back Header */}
                  <div style={{ textAlign: 'center', borderBottom: '2px solid #e2e8f0', paddingBottom: '24px', marginBottom: '24px' }}>
                    <div style={{ width: '56px', height: '56px', borderRadius: '18px', background: 'var(--primary-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', margin: '0 auto 12px', boxShadow: '0 8px 20px -6px var(--primary)' }}>
                      <Building2 size={32} />
                    </div>
                    <h4 style={{ margin: 0, fontSize: '20px', fontWeight: '900', letterSpacing: '1px', color: 'var(--text-main)', textTransform: 'uppercase' }}>REALTYOS PLAZA</h4>
                    <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', letterSpacing: '1.5px', textTransform: 'uppercase', marginTop: '2px', display: 'block' }}>PROPERTY MANAGEMENT HQ</span>
                  </div>

                  {/* Back Body / Company Details */}
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '18px', fontSize: '13px', color: 'var(--text-main)', lineHeight: '1.5', textAlign: 'left' }}>
                    <div style={{ background: '#f1f5f9', padding: '14px 18px', borderRadius: '16px', border: '1px solid #cbd5e1' }}>
                      <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Property Policy Notice</span>
                      <span style={{ fontWeight: '600', fontSize: '12px', color: '#334155' }}>This digital identification badge is the strictly confidential property of RealtyOS Managed Assets Ltd. If found, please return immediately to the Head Office Security Desk.</span>
                    </div>

                    <div style={{ background: '#f8fafc', padding: '14px 18px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '800', display: 'block', textTransform: 'uppercase', marginBottom: '2px' }}>Corporate HQ Address</span>
                      <span style={{ fontWeight: '800', fontSize: '13px', color: 'var(--text-main)' }}>RealtyOS Towers, 14 Independence Avenue, Ridge, Accra, Ghana</span>
                    </div>

                    <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div>
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '800', display: 'block', textTransform: 'uppercase', marginBottom: '2px' }}>HQ Security Desk</span>
                        <span style={{ fontWeight: '900', fontSize: '13px', color: 'var(--primary)' }}>+233 30 277 8899</span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '800', display: 'block', textTransform: 'uppercase', marginBottom: '2px' }}>HR Hotline Number</span>
                        <span style={{ fontWeight: '900', fontSize: '13px', color: 'var(--primary)' }}>+233 24 111 2233</span>
                      </div>
                    </div>
                  </div>

                  {/* Emergency Block at the bottom */}
                  <div style={{ marginTop: '24px', background: '#fff1f2', border: '1px solid #fecdd3', padding: '16px 20px', borderRadius: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', textAlign: 'left' }}>
                    <div>
                      <span style={{ fontSize: '10px', color: '#e11d48', fontWeight: '900', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>ðŸš¨ IN CASE OF EMERGENCY</span>
                      <span style={{ fontSize: '15px', color: '#881337', fontWeight: '900', marginTop: '2px', display: 'block' }}>{printableTagEmployee.emergencyName || 'HR Support Desk'}</span>
                    </div>
                    <span style={{ fontSize: '13px', color: '#e11d48', fontWeight: '900', background: 'white', padding: '6px 12px', borderRadius: '12px', border: '1px solid #ffe4e6', boxShadow: '0 2px 6px rgba(225,29,72,0.15)', flexShrink: 0 }}>
                      {printableTagEmployee.emergencyPhone || '+233 24 000 0000'}
                    </span>
                  </div>
                </div>

              </div>

              <div className="no-print" style={{ display: 'flex', gap: '14px', marginTop: '36px', width: '100%', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button
                  onClick={() => setPrintableTagEmployee(null)}
                  style={{ padding: '16px 28px', borderRadius: '18px', border: '1px solid #cbd5e1', background: '#f8fafc', color: '#334155', fontWeight: '800', fontSize: '14px', cursor: 'pointer', transition: '0.2s' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#f1f5f9'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#f8fafc'}
                >
                  Close Preview
                </button>
                <button
                  onClick={() => handleDownloadCardImage('png')}
                  style={{ padding: '16px 28px', borderRadius: '18px', border: '1px solid #0284c7', background: '#e0f2fe', color: '#0369a1', fontWeight: '800', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', transition: '0.2s', boxShadow: '0 4px 12px rgba(2,132,199,0.1)' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#bae6fd'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#e0f2fe'}
                >
                  <Download size={18} /> Save PNG (High Res)
                </button>
                <button
                  onClick={() => handleDownloadCardImage('jpeg')}
                  style={{ padding: '16px 28px', borderRadius: '18px', border: '1px solid #7c3aed', background: '#ede9fe', color: '#6d28d9', fontWeight: '800', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', transition: '0.2s', boxShadow: '0 4px 12px rgba(124,58,237,0.1)' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#ddd6fe'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#ede9fe'}
                >
                  <Download size={18} /> Save JPG (High Res)
                </button>
                <button
                  disabled={isGeneratingPdf}
                  onClick={executeBrowserPrint}
                  style={{ padding: '16px 36px', borderRadius: '18px', border: 'none', background: 'var(--primary)', color: 'white', fontWeight: '800', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 12px 25px -5px rgba(0, 135, 90, 0.4)', transition: '0.2s', opacity: isGeneratingPdf ? 0.7 : 1 }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <Printer size={18} /> {isGeneratingPdf ? 'Generating Real PDF...' : 'Download Real PDF Badge'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================= */}
      {/* DRAWER / MODAL: INSPECT EMPLOYEE PROFILE */}
      {/* ========================================================= */}
      <AnimatePresence>
        {selectedStaffProfile && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              style={{ background: 'white', padding: '40px', borderRadius: '28px', width: '740px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px', borderBottom: '1px solid var(--border-dark)', paddingBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <div style={{ width: '72px', height: '72px', borderRadius: '50%', overflow: 'hidden', border: '3px solid var(--primary)', flexShrink: 0, position: 'relative' }}>
                    <img src={selectedStaffProfile.passportPhoto} alt={selectedStaffProfile.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    {isEditingProfile && (
                      <label style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white' }}>
                        <Camera size={20} />
                        <input type="file" accept="image/*" onChange={handleUpdatePassportPhoto} style={{ display: 'none' }} />
                      </label>
                    )}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ padding: '4px 10px', borderRadius: '20px', backgroundColor: 'var(--primary-glow)', color: 'var(--primary)', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase' }}>
                        {selectedStaffProfile.id} â€¢ {selectedStaffProfile.status}
                      </span>
                      <span style={{ fontSize: '14px', fontWeight: '800', color: '#d97706', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Star size={16} fill="#f59e0b" color="#f59e0b" /> {selectedStaffProfile.rating} â­
                      </span>
                    </div>
                    <h3 style={{ fontSize: '26px', fontWeight: '800', color: 'var(--text-main)', margin: 0 }}>{selectedStaffProfile.name}</h3>
                    <p style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: '600', margin: '2px 0 0' }}>{selectedStaffProfile.role} â€¢ {selectedStaffProfile.dept}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {!isEditingProfile ? (
                    <>
                      <button
                        onClick={() => setIsEditingProfile(true)}
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px', borderRadius: '12px', border: '1px solid #cbd5e1', background: 'white', color: '#334155', fontWeight: '800', fontSize: '13px', cursor: 'pointer', transition: '0.2s' }}
                      >
                        <Edit2 size={15} /> Edit
                      </button>
                      <button
                        onClick={() => handleDeleteEmployee(selectedStaffProfile.id)}
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px', borderRadius: '12px', border: '1px solid #fee2e2', background: '#fef2f2', color: '#ef4444', fontWeight: '800', fontSize: '13px', cursor: 'pointer', transition: '0.2s' }}
                      >
                        <Trash2 size={15} /> Delete
                      </button>
                    </>
                  ) : null}
                  <button onClick={() => { setSelectedStaffProfile(null); setIsEditingProfile(false); }} style={{ background: '#f1f5f9', border: 'none', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', cursor: 'pointer' }}>
                    <X size={20} />
                  </button>
                </div>
              </div>

              {isEditingProfile ? (
                <form onSubmit={handleEditProfileSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {/* Grid fields */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase' }}>Full Name</label>
                      <input
                        type="text"
                        required
                        value={editEmpName}
                        onChange={(e) => setEditEmpName(e.target.value)}
                        style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border-dark)', fontSize: '14px', fontWeight: '600', boxSizing: 'border-box' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase' }}>Professional Title / Role</label>
                      <input
                        type="text"
                        required
                        value={editEmpRole}
                        onChange={(e) => setEditEmpRole(e.target.value)}
                        style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border-dark)', fontSize: '14px', fontWeight: '600', boxSizing: 'border-box' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase' }}>Department</label>
                      <select
                        value={editEmpDept}
                        onChange={(e) => setEditEmpDept(e.target.value)}
                        style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border-dark)', fontSize: '14px', fontWeight: '600', background: 'white', boxSizing: 'border-box' }}
                      >
                        <option value="Executive Management">Executive Management</option>
                        <option value="Sales & Leasing">Sales & Leasing</option>
                        <option value="Finance & Accounts">Finance & Accounts</option>
                        <option value="Operations & Maintenance">Operations & Maintenance</option>
                        <option value="Compliance & Legal">Compliance & Legal</option>
                        <option value="Security & Surveillance">Security & Surveillance</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase' }}>Administrative Grade / Rank</label>
                      <select
                        value={editEmpRank}
                        onChange={(e) => setEditEmpRank(e.target.value)}
                        style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border-dark)', fontSize: '14px', fontWeight: '600', background: 'white', boxSizing: 'border-box' }}
                      >
                        <option value="Executive Staff (Grade 1)">Executive Staff (Grade 1)</option>
                        <option value="Senior Staff (Grade 2)">Senior Staff (Grade 2)</option>
                        <option value="Junior Staff (Grade 3)">Junior Staff (Grade 3)</option>
                        <option value="Subcontractor / Temporary">Subcontractor / Temporary</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase' }}>Email Address</label>
                      <input
                        type="email"
                        required
                        value={editEmpEmail}
                        onChange={(e) => setEditEmpEmail(e.target.value)}
                        style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border-dark)', fontSize: '14px', fontWeight: '600', boxSizing: 'border-box' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase' }}>Phone Contact</label>
                      <input
                        type="text"
                        required
                        value={editEmpPhone}
                        onChange={(e) => setEditEmpPhone(e.target.value)}
                        style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border-dark)', fontSize: '14px', fontWeight: '600', boxSizing: 'border-box' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase' }}>Monthly Salary (â‚µ)</label>
                      <input
                        type="number"
                        required
                        value={editEmpSalary}
                        onChange={(e) => setEditEmpSalary(e.target.value)}
                        style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border-dark)', fontSize: '14px', fontWeight: '600', boxSizing: 'border-box' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase' }}>Ghana Card PIN</label>
                      <input
                        type="text"
                        required
                        value={editEmpGhanaCard}
                        onChange={(e) => setEditEmpGhanaCard(e.target.value)}
                        style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border-dark)', fontSize: '14px', fontWeight: '600', boxSizing: 'border-box' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase' }}>Bank Setup</label>
                      <input
                        type="text"
                        placeholder="e.g. Stanbic Bank"
                        value={editEmpBankName}
                        onChange={(e) => setEditEmpBankName(e.target.value)}
                        style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border-dark)', fontSize: '14px', fontWeight: '600', boxSizing: 'border-box' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase' }}>Bank Account Number</label>
                      <input
                        type="text"
                        placeholder="Acc Number"
                        value={editEmpBankAccNo}
                        onChange={(e) => setEditEmpBankAccNo(e.target.value)}
                        style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border-dark)', fontSize: '14px', fontWeight: '600', boxSizing: 'border-box' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase' }}>Emergency Contact Name</label>
                      <input
                        type="text"
                        value={editEmpEmergencyName}
                        onChange={(e) => setEditEmpEmergencyName(e.target.value)}
                        style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border-dark)', fontSize: '14px', fontWeight: '600', boxSizing: 'border-box' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase' }}>Emergency Contact Phone</label>
                      <input
                        type="text"
                        value={editEmpEmergencyPhone}
                        onChange={(e) => setEditEmpEmergencyPhone(e.target.value)}
                        style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border-dark)', fontSize: '14px', fontWeight: '600', boxSizing: 'border-box' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase' }}>Employment Status</label>
                      <select
                        value={editEmpStatus}
                        onChange={(e) => setEditEmpStatus(e.target.value)}
                        style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border-dark)', fontSize: '14px', fontWeight: '600', background: 'white', boxSizing: 'border-box' }}
                      >
                        <option value="Active">Active</option>
                        <option value="On Leave">On Leave</option>
                        <option value="Suspended">Suspended</option>
                        <option value="Terminated">Terminated</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase' }}>Contract Type</label>
                      <select
                        value={editEmpContract}
                        onChange={(e) => setEditEmpContract(e.target.value)}
                        style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border-dark)', fontSize: '14px', fontWeight: '600', background: 'white', boxSizing: 'border-box' }}
                      >
                        <option value="Permanent Full-time">Permanent Full-time</option>
                        <option value="Annual Contract">Annual Contract</option>
                        <option value="Temporary / Subcontractor">Temporary / Subcontractor</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px', borderTop: '1px solid var(--border-dark)', paddingTop: '20px' }}>
                    <button
                      type="button"
                      onClick={() => setIsEditingProfile(false)}
                      style={{ padding: '14px 28px', borderRadius: '12px', border: '1px solid var(--border-dark)', background: '#f1f5f9', color: '#334155', fontWeight: '800', fontSize: '14px', cursor: 'pointer' }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      style={{ padding: '14px 32px', borderRadius: '12px', border: 'none', background: 'var(--primary)', color: 'white', fontWeight: '800', fontSize: '14px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0, 135, 90, 0.2)' }}
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  {/* Financial & Direct Deposit Summary */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                    <div style={{ padding: '20px', background: '#f8fafc', borderRadius: '20px', border: '1px solid var(--border-dark)' }}>
                      <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Compensation Package</span>
                      <span style={{ fontSize: '22px', fontWeight: '900', color: 'var(--primary)', display: 'block' }}>{selectedStaffProfile.formattedSalary}</span>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600', marginTop: '4px', display: 'block' }}>{selectedStaffProfile.contract}</span>
                    </div>

                    <div style={{ padding: '20px', background: '#f8fafc', borderRadius: '20px', border: '1px solid var(--border-dark)' }}>
                      <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Direct ACH Banking Setup</span>
                      <span style={{ fontSize: '16px', fontWeight: '900', color: 'var(--text-main)', display: 'block' }}>{selectedStaffProfile.bankName}</span>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '700', marginTop: '2px', display: 'block' }}>Acc: {selectedStaffProfile.bankAccNo}</span>
                    </div>
                  </div>

                  {/* Emergency Contact & Biometric Info */}
                  <div style={{ background: '#fef8f2', border: '1px solid #fed7aa', padding: '20px', borderRadius: '20px', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <PhoneCall size={24} style={{ color: '#ea580c' }} />
                      <div>
                        <span style={{ fontSize: '11px', fontWeight: '800', color: '#ea580c', textTransform: 'uppercase', display: 'block' }}>Emergency Contact Person</span>
                        <span style={{ fontSize: '16px', fontWeight: '900', color: '#431407', display: 'block', marginTop: '2px' }}>{selectedStaffProfile.emergencyName}</span>
                        <span style={{ fontSize: '13px', fontWeight: '700', color: '#9a3412', display: 'block' }}>Phone: {selectedStaffProfile.emergencyPhone}</span>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>Ghana Card PIN</span>
                      <span style={{ fontSize: '14px', fontWeight: '800', color: 'var(--primary)' }}>{selectedStaffProfile.ghanaCardNo}</span>
                    </div>
                  </div>

                  {/* Verified ID Document Images Preview & Local Upload */}
                  <div style={{ background: 'white', border: '1px solid var(--border-dark)', padding: '20px', borderRadius: '20px', marginBottom: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                        Verified Ghana Card Images (Front & Back)
                      </span>
                      <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--primary)', background: '#ecfdf5', padding: '4px 10px', borderRadius: '20px', border: '1px solid #a7f3d0' }}>
                        Click either card to upload new scan
                      </span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <label style={{ height: '150px', borderRadius: '16px', overflow: 'hidden', border: '2px dashed #cbd5e1', background: '#f8fafc', cursor: 'pointer', position: 'relative', display: 'block', transition: '0.2s', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)' }} title="Click to upload Front ID from local device">
                        <img src={selectedStaffProfile.ghanaCardFront} alt="Ghana Card Front" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', opacity: 0, transition: '0.2s', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white' }} onMouseEnter={(e) => e.currentTarget.style.opacity = 1} onMouseLeave={(e) => e.currentTarget.style.opacity = 0}>
                          <UploadCloud size={28} style={{ marginBottom: '4px' }} />
                          <span style={{ fontSize: '12px', fontWeight: '800' }}>Update Front Scan</span>
                        </div>
                        <input type="file" accept="image/*" onChange={(e) => handleUpdateProfileGhanaCard(e, 'front')} style={{ display: 'none' }} />
                      </label>

                      <label style={{ height: '150px', borderRadius: '16px', overflow: 'hidden', border: '2px dashed #cbd5e1', background: '#f8fafc', cursor: 'pointer', position: 'relative', display: 'block', transition: '0.2s', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)' }} title="Click to upload Back ID from local device">
                        <img src={selectedStaffProfile.ghanaCardBack} alt="Ghana Card Back" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', opacity: 0, transition: '0.2s', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white' }} onMouseEnter={(e) => e.currentTarget.style.opacity = 1} onMouseLeave={(e) => e.currentTarget.style.opacity = 0}>
                          <UploadCloud size={28} style={{ marginBottom: '4px' }} />
                          <span style={{ fontSize: '12px', fontWeight: '800' }}>Update Back Scan</span>
                        </div>
                        <input type="file" accept="image/*" onChange={(e) => handleUpdateProfileGhanaCard(e, 'back')} style={{ display: 'none' }} />
                      </label>
                    </div>
                  </div>

                  {/* Comprehensive Attendance Ledger Breakdown */}
                  <div style={{ background: 'white', border: '1px solid var(--border-dark)', padding: '20px', borderRadius: '20px', marginBottom: '28px' }}>
                    <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '16px' }}>
                      Detailed Punctuality Breakdown ({selectedStaffProfile.attendanceRate} Score)
                    </span>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '12px', textAlign: 'center' }}>
                      <div style={{ padding: '12px', background: '#ecfdf5', borderRadius: '14px' }}>
                        <span style={{ fontSize: '11px', fontWeight: '800', color: '#10b981', display: 'block', textTransform: 'uppercase' }}>Present</span>
                        <span style={{ fontSize: '20px', fontWeight: '900', color: '#10b981', marginTop: '4px', display: 'block' }}>{selectedStaffProfile.daysPresent}</span>
                      </div>

                      <div style={{ padding: '12px', background: '#fffbeb', borderRadius: '14px' }}>
                        <span style={{ fontSize: '11px', fontWeight: '800', color: '#d97706', display: 'block', textTransform: 'uppercase' }}>Late Arrival</span>
                        <span style={{ fontSize: '20px', fontWeight: '900', color: '#d97706', marginTop: '4px', display: 'block' }}>{selectedStaffProfile.daysLate}</span>
                      </div>

                      <div style={{ padding: '12px', background: '#e0e7ff', borderRadius: '14px' }}>
                        <span style={{ fontSize: '11px', fontWeight: '800', color: '#4338ca', display: 'block', textTransform: 'uppercase' }}>On Leave</span>
                        <span style={{ fontSize: '20px', fontWeight: '900', color: '#4338ca', marginTop: '4px', display: 'block' }}>{selectedStaffProfile.daysOnLeave}</span>
                      </div>

                      <div style={{ padding: '12px', background: '#fef2f2', borderRadius: '14px' }}>
                        <span style={{ fontSize: '11px', fontWeight: '800', color: '#ef4444', display: 'block', textTransform: 'uppercase' }}>Absent</span>
                        <span style={{ fontSize: '20px', fontWeight: '900', color: '#ef4444', marginTop: '4px', display: 'block' }}>{selectedStaffProfile.daysAbsent}</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
                    <div style={{ padding: '16px 20px', background: selectedStaffProfile.sanctionsCount > 0 ? '#fef2f2' : '#f8fafc', border: selectedStaffProfile.sanctionsCount > 0 ? '1px solid #fca5a5' : '1px solid var(--border-dark)', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Ban size={20} style={{ color: selectedStaffProfile.sanctionsCount > 0 ? '#ef4444' : '#64748b' }} />
                        <span style={{ fontSize: '14px', fontWeight: '800', color: selectedStaffProfile.sanctionsCount > 0 ? '#ef4444' : 'var(--text-main)' }}>Disciplinary Sanctions Registry</span>
                      </div>
                      <span style={{ fontSize: '14px', fontWeight: '800', color: selectedStaffProfile.sanctionsCount > 0 ? '#ef4444' : 'var(--text-muted)' }}>
                        {selectedStaffProfile.sanctionsCount} Recorded Infractions
                      </span>
                    </div>

                    <div style={{ padding: '16px 20px', background: selectedStaffProfile.loansCount > 0 ? '#fffbeb' : '#f8fafc', border: selectedStaffProfile.loansCount > 0 ? '1px solid #fde68a' : '1px solid var(--border-dark)', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Landmark size={20} style={{ color: selectedStaffProfile.loansCount > 0 ? '#d97706' : '#64748b' }} />
                        <span style={{ fontSize: '14px', fontWeight: '800', color: selectedStaffProfile.loansCount > 0 ? '#d97706' : 'var(--text-main)' }}>Staff Credit Status</span>
                      </div>
                      <span style={{ fontSize: '14px', fontWeight: '800', color: selectedStaffProfile.loansCount > 0 ? '#d97706' : 'var(--text-muted)' }}>
                        {selectedStaffProfile.loansCount > 0 ? 'Active Credit / Advance Account' : 'Zero Active Debt'}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      onClick={() => setSelectedStaffProfile(null)}
                      style={{ padding: '16px 32px', borderRadius: '16px', border: '1px solid var(--border-dark)', background: '#f1f5f9', color: '#334155', fontWeight: '800', fontSize: '15px', cursor: 'pointer' }}
                    >
                      Close Profile
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================= */}
      {/* MISSING MODALS IMPLEMENTATION */}
      {/* ========================================================= */}

      {/* 1. LEAVE MODAL */}
      <AnimatePresence>
        {showLeaveModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} style={{ background: 'white', borderRadius: '24px', width: '500px', maxWidth: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '24px', borderBottom: '1px solid var(--border-dark)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: 'var(--text-main)' }}>Log Leave Request</h3>
                <button onClick={() => setShowLeaveModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} color="var(--text-muted)" /></button>
              </div>
              <form onSubmit={handleLogLeave} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '800', marginBottom: '8px' }}>Select Employee</label>
                  <select name="employee" required style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #cbd5e1', background: '#f8fafc' }}>
                    {staffList.map(emp => <option key={emp.id} value={emp.name}>{emp.name} ({emp.dept})</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '800', marginBottom: '8px' }}>Leave Type</label>
                  <select name="type" required style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #cbd5e1', background: '#f8fafc' }}>
                    <option value="Annual Vacation">Annual Vacation</option>
                    <option value="Medical Leave">Medical Leave</option>
                    <option value="Personal Leave">Personal Leave</option>
                    <option value="Maternity Leave">Maternity/Paternity Leave</option>
                  </select>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '800', marginBottom: '8px' }}>Start Date</label>
                    <input type="date" name="startDate" required style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #cbd5e1', background: '#f8fafc', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '800', marginBottom: '8px' }}>End Date</label>
                    <input type="date" name="endDate" required style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #cbd5e1', background: '#f8fafc', boxSizing: 'border-box' }} />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '800', marginBottom: '8px' }}>Total Days</label>
                  <input type="number" name="duration" required placeholder="e.g. 5" style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #cbd5e1', background: '#f8fafc', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '800', marginBottom: '8px' }}>Reason / Notes</label>
                  <textarea name="reason" required placeholder="Brief explanation..." style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #cbd5e1', background: '#f8fafc', minHeight: '80px', boxSizing: 'border-box', resize: 'vertical' }}></textarea>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
                  <button type="button" onClick={() => setShowLeaveModal(false)} style={{ padding: '12px 24px', borderRadius: '12px', border: '1px solid #cbd5e1', background: 'white', fontWeight: '700', cursor: 'pointer' }}>Cancel</button>
                  <button type="submit" style={{ padding: '12px 24px', borderRadius: '12px', border: 'none', background: 'var(--primary)', color: 'white', fontWeight: '800', cursor: 'pointer' }}>Submit Request</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. PAYROLL MODAL */}
      <AnimatePresence>
        {showPayrollModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} style={{ background: 'white', borderRadius: '24px', width: '500px', maxWidth: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '24px', borderBottom: '1px solid var(--border-dark)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: 'var(--text-main)' }}>Run Monthly Payroll</h3>
                <button onClick={() => setShowPayrollModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} color="var(--text-muted)" /></button>
              </div>
              <form onSubmit={handleRunPayrollSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ background: '#f1f5f9', padding: '16px', borderRadius: '12px', border: '1px solid #cbd5e1' }}>
                  <p style={{ margin: '0 0 12px 0', fontSize: '13px', color: '#475569', fontWeight: '600' }}>The system has calculated the following provisional totals for the active workforce:</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '14px', fontWeight: '700' }}>Active Headcount:</span>
                    <span style={{ fontSize: '14px', fontWeight: '800' }}>{staffList.filter(emp => emp.dept !== 'Executive Management' && emp.role !== 'Portfolio Director').length}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '14px', fontWeight: '700' }}>Total Gross Salary:</span>
                    <span style={{ fontSize: '14px', fontWeight: '800' }}>â‚µ {calculatedTotalGross.toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: '#ef4444' }}>
                    <span style={{ fontSize: '14px', fontWeight: '700' }}>Loan Deductions:</span>
                    <span style={{ fontSize: '14px', fontWeight: '800' }}>- â‚µ {activeLoanDeductionsTotal.toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #cbd5e1', color: 'var(--primary)' }}>
                    <span style={{ fontSize: '16px', fontWeight: '900' }}>Net ACH Payout:</span>
                    <span style={{ fontSize: '16px', fontWeight: '900' }}>â‚µ {calculatedNetDisbursement.toLocaleString()}</span>
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '800', marginBottom: '8px' }}>Select Target Month</label>
                  <select name="monthYear" required style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #cbd5e1', background: '#f8fafc', fontWeight: '700' }}>
                    <option value="May 2026">May 2026</option>
                    <option value="June 2026">June 2026</option>
                    <option value="July 2026">July 2026</option>
                  </select>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
                  <button type="button" onClick={() => setShowPayrollModal(false)} style={{ padding: '12px 24px', borderRadius: '12px', border: '1px solid #cbd5e1', background: 'white', fontWeight: '700', cursor: 'pointer' }}>Cancel</button>
                  <button type="submit" style={{ padding: '12px 24px', borderRadius: '12px', border: 'none', background: 'var(--primary)', color: 'white', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}><Play size={16} fill="white" /> Generate Payroll Batch</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 3. LOAN MODAL */}
      <AnimatePresence>
        {showLoanModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} style={{ background: 'white', borderRadius: '24px', width: '500px', maxWidth: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '24px', borderBottom: '1px solid var(--border-dark)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: 'var(--text-main)' }}>Request Staff Loan</h3>
                <button onClick={() => setShowLoanModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} color="var(--text-muted)" /></button>
              </div>
              <form onSubmit={handleRequestLoan} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '800', marginBottom: '8px' }}>Select Employee</label>
                  <select name="employee" required style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #cbd5e1', background: '#f8fafc' }}>
                    {staffList.map(emp => <option key={emp.id} value={emp.name}>{emp.name} ({emp.dept})</option>)}
                  </select>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '800', marginBottom: '8px' }}>Principal Amount (â‚µ)</label>
                    <input type="number" name="principal" required placeholder="e.g. 10000" style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #cbd5e1', background: '#f8fafc', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '800', marginBottom: '8px' }}>Term (Months)</label>
                    <select name="term" required style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #cbd5e1', background: '#f8fafc' }}>
                      <option value="6">6 Months</option>
                      <option value="12">12 Months</option>
                      <option value="18">18 Months</option>
                      <option value="24">24 Months</option>
                    </select>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '800', marginBottom: '8px' }}>Interest Rate (%)</label>
                    <input type="number" step="0.1" name="interestRate" defaultValue="5.0" required style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #cbd5e1', background: '#f8fafc', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '800', marginBottom: '8px' }}>Guarantor Name</label>
                    <input type="text" name="guarantor" required placeholder="Manager/Director" style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #cbd5e1', background: '#f8fafc', boxSizing: 'border-box' }} />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '800', marginBottom: '8px' }}>Loan Purpose</label>
                  <input type="text" name="purpose" required placeholder="e.g. Medical emergency, Land purchase..." style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #cbd5e1', background: '#f8fafc', boxSizing: 'border-box' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
                  <button type="button" onClick={() => setShowLoanModal(false)} style={{ padding: '12px 24px', borderRadius: '12px', border: '1px solid #cbd5e1', background: 'white', fontWeight: '700', cursor: 'pointer' }}>Cancel</button>
                  <button type="submit" style={{ padding: '12px 24px', borderRadius: '12px', border: 'none', background: 'var(--primary)', color: 'white', fontWeight: '800', cursor: 'pointer' }}>Submit Request</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 4. SANCTION MODAL */}
      <AnimatePresence>
        {showSanctionModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} style={{ background: 'white', borderRadius: '24px', width: '500px', maxWidth: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column', border: '2px solid #fecaca' }}>
              <div style={{ padding: '24px', borderBottom: '1px solid var(--border-dark)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fef2f2' }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '900', color: '#dc2626' }}>Record Disciplinary Sanction</h3>
                <button onClick={() => setShowSanctionModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} color="#dc2626" /></button>
              </div>
              <form onSubmit={handleLogSanction} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '800', marginBottom: '8px' }}>Select Employee</label>
                  <select name="employee" required style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #cbd5e1', background: '#f8fafc' }}>
                    {staffList.map(emp => <option key={emp.id} value={emp.name}>{emp.name} ({emp.dept})</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '800', marginBottom: '8px' }}>Infraction Details</label>
                  <input type="text" name="infraction" required placeholder="e.g. Unexcused absence, Policy violation..." style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #cbd5e1', background: '#f8fafc', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '800', marginBottom: '8px' }}>Severity / Penalty</label>
                  <select name="severity" required style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #cbd5e1', background: '#f8fafc' }}>
                    <option value="Verbal Warning">Verbal Warning</option>
                    <option value="Written Warning">Written Warning</option>
                    <option value="Written Warning & Pay Dock">Written Warning & Pay Dock</option>
                    <option value="Unpaid Suspension (3 Days)">Unpaid Suspension (3 Days)</option>
                    <option value="Final Warning">Final Warning</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '800', marginBottom: '8px' }}>Audit Notes</label>
                  <textarea name="notes" required placeholder="Detailed incident description..." style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #cbd5e1', background: '#f8fafc', minHeight: '80px', boxSizing: 'border-box', resize: 'vertical' }}></textarea>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
                  <button type="button" onClick={() => setShowSanctionModal(false)} style={{ padding: '12px 24px', borderRadius: '12px', border: '1px solid #cbd5e1', background: 'white', fontWeight: '700', cursor: 'pointer' }}>Cancel</button>
                  <button type="submit" style={{ padding: '12px 24px', borderRadius: '12px', border: 'none', background: '#dc2626', color: 'white', fontWeight: '800', cursor: 'pointer' }}>Log Sanction</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 5. APPRAISAL MODAL */}
      <AnimatePresence>
        {showAppraisalModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} style={{ background: 'white', borderRadius: '24px', width: '500px', maxWidth: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '24px', borderBottom: '1px solid var(--border-dark)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fffbeb' }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '900', color: '#d97706' }}>Employee Performance Appraisal</h3>
                <button onClick={() => setShowAppraisalModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} color="#d97706" /></button>
              </div>
              <form onSubmit={handleLogAppraisal} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '800', marginBottom: '8px' }}>Select Employee</label>
                    <select name="employee" required style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #cbd5e1', background: '#f8fafc' }}>
                      {staffList.map(emp => <option key={emp.id} value={emp.name}>{emp.name} ({emp.dept})</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '800', marginBottom: '8px' }}>KPI Rating (/5)</label>
                    <input type="number" step="0.1" name="rating" min="0" max="5" defaultValue="4.5" required style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #cbd5e1', background: '#f8fafc', boxSizing: 'border-box' }} />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '800', marginBottom: '8px' }}>Key Accomplishments</label>
                  <textarea name="keyAchievements" required placeholder="What did they achieve this quarter?" style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #cbd5e1', background: '#f8fafc', minHeight: '70px', boxSizing: 'border-box', resize: 'vertical' }}></textarea>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '800', marginBottom: '8px' }}>HR / Management Recommendation</label>
                  <input type="text" name="recommendation" required placeholder="e.g. Promotion, Salary Bump, PIP..." style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #cbd5e1', background: '#f8fafc', boxSizing: 'border-box' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
                  <button type="button" onClick={() => setShowAppraisalModal(false)} style={{ padding: '12px 24px', borderRadius: '12px', border: '1px solid #cbd5e1', background: 'white', fontWeight: '700', cursor: 'pointer' }}>Cancel</button>
                  <button type="submit" style={{ padding: '12px 24px', borderRadius: '12px', border: 'none', background: '#d97706', color: 'white', fontWeight: '800', cursor: 'pointer' }}>Save Appraisal</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 6. TAKE ATTENDANCE MODAL */}
      <AnimatePresence>
        {showTakeAttendanceModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} style={{ background: 'white', borderRadius: '24px', width: '900px', maxWidth: '100%', maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '24px', borderBottom: '1px solid var(--border-dark)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: 'var(--text-main)' }}>Take Daily Attendance</h3>
                  <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--text-muted)' }}>Manually verify staff presence and punctuality for today.</p>
                </div>
                <button onClick={() => setShowTakeAttendanceModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} color="var(--text-muted)" /></button>
              </div>
              <form onSubmit={handleSubmitDailyAttendanceRoster} style={{ padding: '0', display: 'flex', flexDirection: 'column', overflow: 'hidden', flex: 1 }}>

                <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-dark)', display: 'flex', gap: '16px', alignItems: 'center', background: 'white' }}>
                  <label style={{ fontSize: '14px', fontWeight: '800' }}>Select Date:</label>
                  <input type="date" value={dailyCheckDate} onChange={(e) => setDailyCheckDate(e.target.value)} required style={{ padding: '10px 16px', borderRadius: '12px', border: '1px solid #cbd5e1', background: '#f8fafc' }} />
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Changing the date will NOT recalculate approved leaves. Close and reopen the modal to recalculate.</span>
                </div>

                <div style={{ overflowY: 'auto', padding: '0', flex: 1, background: '#f8fafc' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ position: 'sticky', top: 0, background: '#f1f5f9', zIndex: 10 }}>
                      <tr>
                        <th style={{ padding: '12px 24px', fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Employee</th>
                        <th style={{ padding: '12px 24px', fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Status</th>
                        <th style={{ padding: '12px 24px', fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Clock-In</th>
                        <th style={{ padding: '12px 24px', fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dailyCheckRoster.map((item, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid var(--border-dark)', background: 'white' }}>
                          <td style={{ padding: '12px 24px' }}>
                            <span style={{ fontSize: '14px', fontWeight: '800', display: 'block' }}>{item.name}</span>
                            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{item.dept}</span>
                          </td>
                          <td style={{ padding: '12px 24px' }}>
                            <select
                              value={item.status}
                              onChange={(e) => handleUpdateRosterRow(idx, 'status', e.target.value)}
                              style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: '700' }}
                            >
                              <option value="ðŸŸ¢ Present (On Time)">ðŸŸ¢ Present (On Time)</option>
                              <option value="ðŸŸ¡ Present (Late)">ðŸŸ¡ Present (Late)</option>
                              <option value="ðŸ”´ Unexcused Absent">ðŸ”´ Unexcused Absent</option>
                              <option value="ðŸ–ï¸ Approved Leave">ðŸ–ï¸ Approved Leave</option>
                            </select>
                          </td>
                          <td style={{ padding: '12px 24px' }}>
                            <input
                              type="text"
                              value={item.clockIn}
                              onChange={(e) => handleUpdateRosterRow(idx, 'clockIn', e.target.value)}
                              disabled={item.status.includes('Absent') || item.status.includes('Leave')}
                              style={{ width: '100px', padding: '8px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                            />
                          </td>
                          <td style={{ padding: '12px 24px' }}>
                            <input
                              type="text"
                              value={item.notes}
                              onChange={(e) => handleUpdateRosterRow(idx, 'notes', e.target.value)}
                              style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div style={{ padding: '24px', borderTop: '1px solid var(--border-dark)', display: 'flex', justifyContent: 'flex-end', gap: '12px', background: 'white' }}>
                  <button type="button" onClick={() => setShowTakeAttendanceModal(false)} style={{ padding: '12px 24px', borderRadius: '12px', border: '1px solid #cbd5e1', background: 'white', fontWeight: '700', cursor: 'pointer' }}>Cancel</button>
                  <button type="submit" style={{ padding: '12px 24px', borderRadius: '12px', border: 'none', background: 'var(--primary)', color: 'white', fontWeight: '800', cursor: 'pointer' }}>Save Attendance Roster</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default HR;

