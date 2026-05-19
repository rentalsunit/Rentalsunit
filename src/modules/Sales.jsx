import React, { useState, useRef, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Search, Filter, DollarSign, TrendingUp, User, 
  Building, MapPin, Calendar, Clock, ChevronRight, 
  MoreVertical, Kanban, List, CheckCircle2, AlertCircle, 
  X, ArrowUpRight, Sparkles, UserCheck, ShieldCheck,
  Folder, FolderPlus, History, Award, Flag, ThumbsUp, ThumbsDown, XCircle, Unlock,
  MoveHorizontal, ArrowLeftRight, FileText, Calculator, CreditCard, Handshake, CheckSquare, Square, Check, Printer, Wallet
} from 'lucide-react';
import { generateRealPDF } from '../lib/pdfService';

const Sales = () => {
  const [viewMode, setViewMode] = useState('kanban'); // kanban or list
  const [searchTerm, setSearchTerm] = useState('');
  const [activeStage, setActiveStage] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showNewPipelineModal, setShowNewPipelineModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historySearchTerm, setHistorySearchTerm] = useState('');
  const [interestType, setInterestType] = useState('Apartment');
  const [successMsg, setSuccessMsg] = useState('');

  // Execution & Installment Tracker Modals
  const [showSaleAgreementModal, setShowSaleAgreementModal] = useState(false);
  const [selectedAgreementDeal, setSelectedAgreementDeal] = useState(null);
  const [showLogPaymentModal, setShowLogPaymentModal] = useState(false);
  const [paymentAmountInput, setPaymentAmountInput] = useState('');

  // Deal Closing Modal state
  const [closingDealId, setClosingDealId] = useState(null);
  const [closeOutcome, setCloseOutcome] = useState('won'); // 'won' or 'lost'
  const [lostReason, setLostReason] = useState('');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const handleExportPdf = async () => {
    setIsGeneratingPdf(true);
    await generateRealPDF('.agreement-print-area', `Sales_Agreement_${selectedAgreementDeal?.id ? selectedAgreementDeal.id : '101'}.pdf`, { orientation: 'p' });
    setIsGeneratingPdf(false);
  };

  const kanbanContainerRef = useRef(null);

  // Pipelines state
  const [pipelines, setPipelines] = useState([
    { id: 'all', name: 'All Pipelines Overview', desc: 'Global master view across all sales divisions and development projects' },
    { id: 'pl-1', name: 'Main Development Projects', desc: 'Tracking sales across luxury villas, apartments, and commercial towers' },
    { id: 'pl-2', name: 'Diaspora Land Investments', desc: 'Exclusive serviced plots and acreage acquisition for overseas clients' },
    { id: 'pl-3', name: 'Commercial Leasing & Retail', desc: 'Corporate office suites and retail space long-term lease negotiations' },
  ]);
  const [activePipelineId, setActivePipelineId] = useState('all');

  // Deals state with localStorage persistence
  const [deals, setDeals] = useState(() => {
    const saved = localStorage.getItem('realtyos_sales_deals');
    if (saved) {
      try { return JSON.parse(saved); } catch(e) {}
    }
    return [
      { 
        id: 'SDL-101', 
        pipelineId: 'pl-1',
        title: 'Villa 14 Acquisition',
        property: 'Sunset Hills Luxury Villas', 
        unit: 'Villa 14',
        client: 'Michael Osei-Mensah', 
        clientPhone: '+233 24 888 9999',
        price: '₵ 850,000', 
        numericPrice: 850000,
        paymentMode: 'Installment',
        depositPaid: 250000,
        remainingBalance: 600000,
        months: 24,
        monthlyInstallment: 25000,
        installmentLogs: [
          { date: '14 May 2026', amount: 250000, ref: 'TX-DEP-8841', note: 'Initial 30% Downpayment Deposit via RTGS' }
        ],
        stage: 'Contract Pending', 
        probability: '90%', 
        agent: 'Louis Kemenyo', 
        agentAvatar: 'https://ui-avatars.com/api/?name=Louis+K&background=00875a&color=fff',
        type: 'House',
        date: '14 May 2026',
        notes: 'Official property sale & structured 24-month installment contract executed.'
      },
      { 
        id: 'SDL-102', 
        pipelineId: 'pl-3',
        title: 'Executive Suite Lease & Option',
        property: 'The Apex Commercial Tower', 
        unit: 'Suite 12-B',
        client: 'Serwaa Amihere', 
        clientPhone: '+233 20 987 6543',
        price: '₵ 2,500,000', 
        numericPrice: 2500000,
        paymentMode: 'Upfront',
        depositPaid: 2500000,
        remainingBalance: 0,
        months: 1,
        monthlyInstallment: 0,
        installmentLogs: [
          { date: '15 May 2026', amount: 2500000, ref: 'TX-FULL-9901', note: '100% Upfront Wire Transfer Fully Cleared' }
        ],
        stage: 'Closed Won', 
        probability: '100%', 
        agent: 'Pam Beesly', 
        agentAvatar: 'https://ui-avatars.com/api/?name=Pam+B&background=6366f1&color=fff',
        type: 'Commercial',
        date: '15 May 2026',
        notes: 'Keys transferred and corporate occupancy granted.'
      },
      { 
        id: 'SDL-103', 
        pipelineId: 'pl-2',
        title: '4x Serviced Plots Bundle',
        property: 'Green Valley Eco Estate', 
        unit: 'Plots 40-43',
        client: 'Kwadwo Asamoah', 
        clientPhone: '+233 55 333 4444',
        price: '₵ 480,000', 
        numericPrice: 480000,
        paymentMode: 'Installment',
        depositPaid: 180000,
        remainingBalance: 300000,
        months: 12,
        monthlyInstallment: 25000,
        installmentLogs: [
          { date: '10 May 2026', amount: 180000, ref: 'TX-DEP-3312', note: 'Initial Land Deposit Paid' }
        ],
        stage: 'Contract Pending', 
        probability: '95%', 
        agent: 'Phyllis Vance', 
        agentAvatar: 'https://ui-avatars.com/api/?name=Phyllis+V&background=f59e0b&color=fff',
        type: 'Land',
        date: '10 May 2026',
        notes: 'Indenture agreements currently with buyer lawyers for endorsement.'
      },
      { 
        id: 'SDL-104', 
        pipelineId: 'pl-2',
        title: 'Beachfront Plot Premium',
        property: 'Palm Breeze Beach Residences', 
        unit: 'Plot B-07',
        client: 'David Hammond', 
        clientPhone: '+233 27 777 8888',
        price: '₵ 600,000', 
        numericPrice: 600000,
        paymentMode: 'Installment',
        depositPaid: 150000,
        remainingBalance: 450000,
        months: 18,
        monthlyInstallment: 25000,
        installmentLogs: [
          { date: '16 May 2026', amount: 150000, ref: 'TX-DEP-7700', note: 'Reservation deposit received' }
        ],
        stage: 'Inquiry', 
        probability: '25%', 
        agent: 'Angela Martin', 
        agentAvatar: 'https://ui-avatars.com/api/?name=Angela+M&background=ec4899&color=fff',
        type: 'Land',
        date: '16 May 2026',
        notes: 'First inquiry received via online portal.'
      },
      { 
        id: 'SDL-105', 
        pipelineId: 'pl-1',
        title: 'Penthouse Suite 10B',
        property: 'Sunset Hills Luxury Villas', 
        unit: 'Penthouse 10B',
        client: 'Victoria Kemenyo', 
        clientPhone: '+233 24 999 1111',
        price: '₵ 1,200,000', 
        numericPrice: 1200000,
        paymentMode: 'Upfront',
        depositPaid: 1200000,
        remainingBalance: 0,
        months: 1,
        monthlyInstallment: 0,
        installmentLogs: [
          { date: '01 May 2026', amount: 1200000, ref: 'TX-FULL-5544', note: 'Full upfront bank draft deposit' }
        ],
        stage: 'Closed Won', 
        probability: '100%', 
        agent: 'Louis Kemenyo', 
        agentAvatar: 'https://ui-avatars.com/api/?name=Louis+K&background=10b981&color=fff',
        type: 'Apartment',
        date: '01 May 2026',
        notes: 'Full deposit received and keys handed over.'
      },
      { 
        id: 'SDL-106', 
        pipelineId: 'pl-3',
        title: 'Ground Floor Retail Anchor',
        property: 'The Apex Commercial Tower', 
        unit: 'Retail Space GF-01',
        client: 'Melcom Superstores', 
        clientPhone: '+233 30 255 5555',
        price: '₵ 4,200,000', 
        numericPrice: 4200000,
        paymentMode: 'Installment',
        depositPaid: 1200000,
        remainingBalance: 3000000,
        months: 30,
        monthlyInstallment: 100000,
        installmentLogs: [
          { date: '14 May 2026', amount: 1200000, ref: 'TX-DEP-9988', note: 'Fit-out commitment deposit' }
        ],
        stage: 'Negotiation', 
        probability: '75%', 
        agent: 'Louis Kemenyo', 
        agentAvatar: 'https://ui-avatars.com/api/?name=Louis+K&background=10b981&color=fff',
        type: 'Commercial',
        date: '14 May 2026',
        notes: 'Finalizing fit-out grace period and long-term lease terms.'
      },
      { 
        id: 'SDL-107', 
        pipelineId: 'pl-2',
        title: 'Serviced Ridge Plot C4',
        property: 'Green Valley Eco Estate', 
        unit: 'Plot C4',
        client: 'Dr. Michael Sarpong', 
        clientPhone: '+233 24 888 7777',
        price: '₵ 550,000', 
        numericPrice: 550000,
        paymentMode: 'Upfront',
        depositPaid: 550000,
        remainingBalance: 0,
        months: 1,
        monthlyInstallment: 0,
        installmentLogs: [
          { date: '05 May 2026', amount: 550000, ref: 'TX-FULL-2211', note: 'Direct cash bank deposit fully verified' }
        ],
        stage: 'Closed Won', 
        probability: '100%', 
        agent: 'Phyllis Vance', 
        agentAvatar: 'https://ui-avatars.com/api/?name=Phyllis+V&background=f59e0b&color=fff',
        type: 'Land',
        date: '05 May 2026',
        notes: 'Deed transferred and land title registered.'
      },
      { 
        id: 'SDL-108', 
        pipelineId: 'pl-3',
        title: 'Corporate Office Wing 4A',
        property: 'The Apex Commercial Tower', 
        unit: 'Wing 4A',
        client: 'Standard Chartered Bank', 
        clientPhone: '+233 30 222 1111',
        price: '₵ 3,800,000', 
        numericPrice: 3800000,
        paymentMode: 'Upfront',
        depositPaid: 3800000,
        remainingBalance: 0,
        months: 1,
        monthlyInstallment: 0,
        installmentLogs: [
          { date: '28 Apr 2026', amount: 3800000, ref: 'TX-FULL-0012', note: 'Institutional corporate wire cleared' }
        ],
        stage: 'Closed Won', 
        probability: '100%', 
        agent: 'Louis Kemenyo', 
        agentAvatar: 'https://ui-avatars.com/api/?name=Louis+K&background=10b981&color=fff',
        type: 'Commercial',
        date: '28 Apr 2026',
        notes: '10-year master lease agreement executed.'
      },
      { 
        id: 'SDL-109', 
        pipelineId: 'pl-1',
        title: 'Luxury Duplex Villa 2',
        property: 'Sunset Hills Luxury Villas', 
        unit: 'Duplex Villa 2',
        client: 'Kojo Antwi', 
        clientPhone: '+233 50 111 2222',
        price: '₵ 950,000', 
        numericPrice: 950000,
        paymentMode: 'Installment',
        depositPaid: 0,
        remainingBalance: 950000,
        months: 12,
        monthlyInstallment: 79166,
        installmentLogs: [],
        stage: 'Closed Lost', 
        probability: '0%', 
        agent: 'Angela Martin', 
        agentAvatar: 'https://ui-avatars.com/api/?name=Angela+M&background=ec4899&color=fff',
        type: 'House',
        date: '20 Apr 2026',
        notes: 'Client selected a competing development due to immediate move-in requirement. [Lost Reason: Timeline constraint]'
      },
      { 
        id: 'SDL-110', 
        pipelineId: 'pl-1',
        title: 'Garden Apartment 3B Inquiry',
        property: 'Sunset Hills Luxury Villas', 
        unit: 'Apartment 3B',
        client: 'Esi Mansah', 
        clientPhone: '+233 20 444 5555',
        price: '₵ 620,000', 
        numericPrice: 620000,
        paymentMode: 'Installment',
        depositPaid: 0,
        remainingBalance: 620000,
        months: 18,
        monthlyInstallment: 34444,
        installmentLogs: [],
        stage: 'Inquiry', 
        probability: '30%', 
        agent: 'Louis Kemenyo', 
        agentAvatar: 'https://ui-avatars.com/api/?name=Louis+K&background=10b981&color=fff',
        type: 'Apartment',
        date: '16 May 2026',
        notes: 'Requested brochure and pricing schedule for 2-bedroom units.'
      },
    ];
  });

  const saveDealsToStorage = (updatedDeals) => {
    setDeals(updatedDeals);
    localStorage.setItem('realtyos_sales_deals', JSON.stringify(updatedDeals));
    window.dispatchEvent(new Event('storage'));
  };

  const handleDelinkUnit = (dealId) => {
    const targetDeal = deals.find(d => d.id === dealId);
    if (!targetDeal) return;
    if (!window.confirm(`Are you sure you want to delink ${targetDeal.unit} from ${targetDeal.client} and cancel this sales contract? This will return the unit to available inventory.`)) return;

    const savedProps = localStorage.getItem('realtyos_sales_properties');
    if (savedProps) {
      try {
        const propsList = JSON.parse(savedProps);
        const updatedProps = propsList.map(p => {
          if (p.name === targetDeal.property) {
            let newSold = Math.max(0, (p.soldUnits || 1) - 1);
            let newUnits = (p.individualUnits || []).map(u => {
              if (u.name === targetDeal.unit) {
                return { ...u, status: 'Available', buyer: '', price: targetDeal.numericPrice || u.price || 500000 };
              }
              return u;
            });
            return { ...p, soldUnits: newSold, individualUnits: newUnits };
          }
          return p;
        });
        localStorage.setItem('realtyos_sales_properties', JSON.stringify(updatedProps));
        window.dispatchEvent(new Event('storage'));
      } catch(e) {}
    }

    const updatedDeals = deals.map(d => {
      if (d.id === dealId) {
        return {
          ...d,
          stage: 'Closed Lost',
          probability: '0%',
          notes: `${d.notes || ''} [CONTRACT CANCELLED / UNIT DELINKED ON ${new Date().toLocaleDateString('en-GB')}]`
        };
      }
      return d;
    });
    saveDealsToStorage(updatedDeals);
    if (selectedAgreementDeal?.id === dealId) {
      setSelectedAgreementDeal(updatedDeals.find(d => d.id === dealId));
    }
    setSuccessMsg(`Successfully delinked ${targetDeal.unit} and returned it to available sales inventory.`);
    setTimeout(() => setSuccessMsg(''), 5000);
  };

  // Execution Modal Form states
  const [execProperty, setExecProperty] = useState('Sunset Hills Luxury Villas');
  const [execUnit, setExecUnit] = useState('Villa 18');
  const [execClient, setExecClient] = useState('Michael Osei-Mensah');
  const [execClientPhone, setExecClientPhone] = useState('+233 24 888 9999');
  const [execPrice, setExecPrice] = useState(850000);
  const [execPaymentMode, setExecPaymentMode] = useState('Installment'); // 'Upfront' or 'Installment'
  const [execDeposit, setExecDeposit] = useState(250000);
  const [execMonths, setExecMonths] = useState(24);
  const [execAgent, setExecAgent] = useState('Louis Kemenyo');

  // Auto-prefill effect from SalesProperties
  useEffect(() => {
    const prefill = localStorage.getItem('realtyos_pending_sale_prefill');
    if (prefill) {
      try {
        const data = JSON.parse(prefill);
        setExecProperty(data.property || 'Sunset Hills Luxury Villas');
        setExecUnit(data.unit || 'Villa 18');
        setExecPrice(data.price || 850000);
        setExecDeposit(Math.round((data.price || 850000) * 0.3));
        setShowSaleAgreementModal(true);
        localStorage.removeItem('realtyos_pending_sale_prefill');
      } catch(e) {}
    }
  }, []);

  // Live calculation for installment
  const calculatedRemaining = useMemo(() => {
    return Math.max(0, execPrice - execDeposit);
  }, [execPrice, execDeposit]);

  const calculatedMonthly = useMemo(() => {
    if (execMonths <= 0 || calculatedRemaining <= 0) return 0;
    return Math.round(calculatedRemaining / execMonths);
  }, [calculatedRemaining, execMonths]);

  const handleExecuteAgreementSubmit = (e) => {
    e.preventDefault();
    const newId = `SDL-${deals.length + 101}`;
    const formattedPrice = `₵ ${execPrice.toLocaleString()}`;

    const initialLog = {
      date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      amount: execPaymentMode === 'Upfront' ? execPrice : execDeposit,
      ref: `TX-${execPaymentMode === 'Upfront' ? 'FULL' : 'DEP'}-${Math.floor(1000 + Math.random() * 9000)}`,
      note: execPaymentMode === 'Upfront' ? '100% Upfront Purchase Wire Transfer Cleared' : `Initial Downpayment Deposit Paid (${Math.round((execDeposit/execPrice)*100)}%)`
    };

    const newAgreementDeal = {
      id: newId,
      pipelineId: 'pl-1',
      title: `${execUnit} Purchase Contract`,
      property: execProperty,
      unit: execUnit,
      client: execClient,
      clientPhone: execClientPhone,
      price: formattedPrice,
      numericPrice: execPrice,
      paymentMode: execPaymentMode,
      depositPaid: execPaymentMode === 'Upfront' ? execPrice : execDeposit,
      remainingBalance: execPaymentMode === 'Upfront' ? 0 : calculatedRemaining,
      months: execPaymentMode === 'Upfront' ? 1 : execMonths,
      monthlyInstallment: execPaymentMode === 'Upfront' ? 0 : calculatedMonthly,
      installmentLogs: [initialLog],
      stage: execPaymentMode === 'Upfront' ? 'Closed Won' : 'Contract Pending',
      probability: execPaymentMode === 'Upfront' ? '100%' : '95%',
      agent: execAgent,
      agentAvatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(execAgent)}&background=00875a&color=fff`,
      type: execUnit.includes('Villa') || execUnit.includes('House') ? 'House' : execUnit.includes('Plot') ? 'Land' : execUnit.includes('Suite') || execUnit.includes('Retail') ? 'Commercial' : 'Apartment',
      date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      notes: `Executed Property Purchase Contract. ${execPaymentMode === 'Upfront' ? 'Paid in full upfront.' : `Structured ${execMonths}-month installment schedule established.`}`
    };

    const updated = [newAgreementDeal, ...deals];
    saveDealsToStorage(updated);
    
    // Sync back to SalesProperties inventory
    const savedProps = localStorage.getItem('realtyos_sales_properties');
    if (savedProps) {
      try {
        const propsList = JSON.parse(savedProps);
        const updatedProps = propsList.map(p => {
          if (p.name === execProperty) {
            let newSold = p.soldUnits + 1;
            let newUnits = (p.individualUnits || []).map(u => {
              if (u.name === execUnit || (!execUnit && u.status === 'Available')) {
                return { ...u, status: 'Sold', buyer: execClient, price: execPrice };
              }
              return u;
            });
            return { ...p, soldUnits: newSold, individualUnits: newUnits };
          }
          return p;
        });
        localStorage.setItem('realtyos_sales_properties', JSON.stringify(updatedProps));
        window.dispatchEvent(new Event('storage'));
      } catch(e) {}
    }

    setShowSaleAgreementModal(false);
    setSuccessMsg(`Property Sale Agreement successfully executed for ${execClient}! Contract ID: ${newId}`);
    setTimeout(() => setSuccessMsg(''), 5000);
  };

  const handleLogPaymentSubmit = (e) => {
    e.preventDefault();
    if (!selectedAgreementDeal) return;
    const numPay = parseFloat(paymentAmountInput);
    if (!numPay || numPay <= 0) return;

    const newLog = {
      date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      amount: numPay,
      ref: `TX-INST-${Math.floor(1000 + Math.random() * 9000)}`,
      note: `Monthly Installment Payment Cleared via Bank Transfer`
    };

    const newDeposit = selectedAgreementDeal.depositPaid + numPay;
    const newRemaining = Math.max(0, selectedAgreementDeal.remainingBalance - numPay);
    const newStage = newRemaining === 0 ? 'Closed Won' : selectedAgreementDeal.stage;
    const newProb = newRemaining === 0 ? '100%' : selectedAgreementDeal.probability;

    const updatedDeals = deals.map(d => {
      if (d.id === selectedAgreementDeal.id) {
        const updatedLogs = [...(d.installmentLogs || []), newLog];
        return {
          ...d,
          depositPaid: newDeposit,
          remainingBalance: newRemaining,
          installmentLogs: updatedLogs,
          stage: newStage,
          probability: newProb,
          notes: newRemaining === 0 ? `${d.notes} [100% Fully Paid off on ${newLog.date}]` : d.notes
        };
      }
      return d;
    });

    saveDealsToStorage(updatedDeals);
    setSelectedAgreementDeal(updatedDeals.find(d => d.id === selectedAgreementDeal.id));
    setPaymentAmountInput('');
    setShowLogPaymentModal(false);
    setSuccessMsg(`Successfully logged payment of ₵ ${numPay.toLocaleString()} for deal ${selectedAgreementDeal.id}!`);
    setTimeout(() => setSuccessMsg(''), 5000);
  };

  const stages = ['Inquiry', 'Inspection', 'Negotiation', 'Contract Pending', 'Closed Won', 'Closed Lost'];

  const stageColors = {
    'Inquiry': { bg: '#e0e7ff', text: '#4338ca', border: '#c7d2fe' },
    'Inspection': { bg: '#fef3c7', text: '#d97706', border: '#fde68a' },
    'Negotiation': { bg: '#ffedd5', text: '#c2410c', border: '#fed7aa' },
    'Contract Pending': { bg: '#dcfce7', text: '#15803d', border: '#bbf7d0' },
    'Closed Won': { bg: '#00875a15', text: '#00875a', border: '#00875a30' },
    'Closed Lost': { bg: '#fee2e2', text: '#ef4444', border: '#fca5a5' },
  };

  const handleAddDeal = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const numPrice = parseFloat(formData.get('price')) || 0;
    const formattedPrice = `₵ ${numPrice.toLocaleString()}`;
    const targetPlId = formData.get('pipelineId') || 'pl-1';

    const newDeal = {
      id: `SDL-${deals.length + 101}`,
      pipelineId: targetPlId,
      title: formData.get('title'),
      property: formData.get('property'),
      unit: formData.get('unit') || 'Standard Unit',
      client: formData.get('client'),
      clientPhone: formData.get('phone') || '+233 20 000 0000',
      price: formattedPrice,
      numericPrice: numPrice,
      paymentMode: 'Installment',
      depositPaid: 0,
      remainingBalance: numPrice,
      months: 18,
      monthlyInstallment: Math.round(numPrice / 18),
      installmentLogs: [],
      stage: 'Inquiry',
      probability: '25%',
      agent: formData.get('agent'),
      agentAvatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.get('agent'))}&background=00875a&color=fff`,
      type: interestType,
      date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      notes: formData.get('notes') || 'New inquiry created in pipeline.'
    };

    const updated = [newDeal, ...deals];
    saveDealsToStorage(updated);
    setShowAddModal(false);
    setSuccessMsg('New deal successfully recorded into pipeline!');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleStartNewPipeline = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const name = formData.get('name');
    const desc = formData.get('description');
    const newId = `pl-${pipelines.length + 1}`;

    const newPipeline = {
      id: newId,
      name,
      desc
    };

    setPipelines([...pipelines, newPipeline]);
    setActivePipelineId(newId);
    setShowNewPipelineModal(false);
    setSuccessMsg(`Successfully created and opened "${name}" sales pipeline!`);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const moveStage = (dealId, nextStage) => {
    const updated = deals.map(d => {
      if (d.id === dealId) {
        let prob = d.probability;
        if (nextStage === 'Closed Won') prob = '100%';
        else if (nextStage === 'Closed Lost') prob = '0%';
        else if (nextStage === 'Contract Pending') prob = '90%';
        else if (nextStage === 'Negotiation') prob = '75%';
        else if (nextStage === 'Inspection') prob = '50%';
        return { ...d, stage: nextStage, probability: prob };
      }
      return d;
    });
    saveDealsToStorage(updated);
  };

  const scrollKanban = (direction) => {
    const scrollAmount = 350;
    if (kanbanContainerRef.current) {
      kanbanContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
    window.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  };

  const handleConfirmClose = () => {
    if (!closingDealId) return;
    const currentDeal = deals.find(d => d.id === closingDealId);
    const newStage = closeOutcome === 'won' ? 'Closed Won' : 'Closed Lost';
    const prob = closeOutcome === 'won' ? '100%' : '0%';
    const extraNote = closeOutcome === 'lost' && lostReason.trim() ? ` [Lost Reason: ${lostReason}]` : '';

    const updated = deals.map(d => {
      if (d.id === closingDealId) {
        return { 
          ...d, 
          stage: newStage, 
          probability: prob, 
          notes: d.notes + extraNote 
        };
      }
      return d;
    });
    saveDealsToStorage(updated);

    setSuccessMsg(`Deal "${currentDeal?.title}" finalized as ${newStage}!`);
    setClosingDealId(null);
    setLostReason('');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const currentPipelineDeals = activePipelineId === 'all' 
    ? deals 
    : deals.filter(d => d.pipelineId === activePipelineId);

  const totalPipelineValue = currentPipelineDeals.filter(d => d.stage !== 'Closed Won' && d.stage !== 'Closed Lost').reduce((acc, d) => acc + d.numericPrice, 0);
  const closedRevenue = currentPipelineDeals.filter(d => d.stage === 'Closed Won').reduce((acc, d) => acc + d.numericPrice, 0);
  const activeDealsCount = currentPipelineDeals.filter(d => d.stage !== 'Closed Won' && d.stage !== 'Closed Lost').length;

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } }
  };

  const item = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  };

  const filteredDeals = currentPipelineDeals.filter(d => {
    const matchesSearch = d.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          d.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          d.property.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (d.unit && d.unit.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  const activePipelineObj = pipelines.find(p => p.id === activePipelineId) || pipelines[0];

  return (
    <motion.div 
      variants={container} 
      initial="hidden" 
      animate="show" 
      style={{ display: 'flex', flexDirection: 'column', gap: '32px', width: '100%' }}
    >
      {/* Toast Notification Banner */}
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

      {/* Top Banner & Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px', width: '100%' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{ padding: '6px 12px', borderRadius: '20px', backgroundColor: 'var(--primary-glow)', color: 'var(--primary)', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Handshake size={14} /> Property Allocation & Agreements
            </span>
          </div>
          <h2 style={{ fontSize: '28px', fontWeight: '800', letterSpacing: '-0.5px', color: 'var(--text-main)' }}>Sales & Installment Contracts</h2>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: '500', marginTop: '2px' }}>
            Execute formal property purchase agreements, assign buyers, and calculate structured installment payment schedules.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', background: 'white', borderRadius: '12px', border: '1px solid var(--border-dark)', padding: '4px' }}>
            <button 
              onClick={() => setViewMode('kanban')}
              style={{ padding: '8px 14px', borderRadius: '8px', background: viewMode === 'kanban' ? '#f1f5f9' : 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '700', color: viewMode === 'kanban' ? 'var(--primary)' : 'var(--text-muted)', transition: '0.2s' }}
            >
              <Kanban size={16} /> Kanban Board
            </button>
            <button 
              onClick={() => setViewMode('list')}
              style={{ padding: '8px 14px', borderRadius: '8px', background: viewMode === 'list' ? '#f1f5f9' : 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '700', color: viewMode === 'list' ? 'var(--primary)' : 'var(--text-muted)', transition: '0.2s' }}
            >
              <List size={16} /> List View
            </button>
          </div>

          {/* Record Inquiry / Deal Button */}
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowAddModal(true)}
            style={{ 
              backgroundColor: '#3b82f6', color: 'white', border: 'none', 
              padding: '12px 20px', borderRadius: '12px', display: 'flex', 
              alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '700', 
              cursor: 'pointer', boxShadow: '0 10px 20px -5px rgba(59, 130, 246, 0.4)' 
            }}
          >
            <Plus size={18} /> Record Inquiry
          </motion.button>

          {/* Completed Sales Archive Button */}
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowHistoryModal(true)}
            style={{ 
              backgroundColor: '#059669', color: 'white', border: 'none', 
              padding: '12px 20px', borderRadius: '12px', display: 'flex', 
              alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '700', 
              cursor: 'pointer', boxShadow: '0 10px 20px -5px rgba(5, 150, 105, 0.4)' 
            }}
          >
            <History size={18} /> Completed Archive
          </motion.button>

          {/* Execute Property Sale Agreement Button */}
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowSaleAgreementModal(true)}
            style={{ 
              backgroundColor: 'var(--primary)', color: 'white', border: 'none', 
              padding: '12px 24px', borderRadius: '12px', display: 'flex', 
              alignItems: 'center', gap: '10px', fontSize: '14px', fontWeight: '800', 
              cursor: 'pointer', boxShadow: '0 10px 25px -5px rgba(0, 135, 90, 0.5)' 
            }}
          >
            <Handshake size={20} /> Execute Sale Agreement
          </motion.button>
        </div>
      </header>

      {/* Pipeline Navigation Selector */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%', overflowX: 'auto', paddingBottom: '4px' }}>
        {pipelines.map(pl => {
          const count = pl.id === 'all' ? deals.length : deals.filter(d => d.pipelineId === pl.id).length;
          return (
            <button
              key={pl.id}
              onClick={() => setActivePipelineId(pl.id)}
              style={{
                padding: '10px 18px',
                borderRadius: '14px',
                border: activePipelineId === pl.id ? '1px solid var(--primary)' : '1px solid var(--border-dark)',
                backgroundColor: activePipelineId === pl.id ? 'var(--primary-glow)' : 'white',
                color: activePipelineId === pl.id ? 'var(--primary)' : 'var(--text-muted)',
                fontWeight: activePipelineId === pl.id ? '800' : '600',
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s',
                whiteSpace: 'nowrap',
                boxShadow: activePipelineId === pl.id ? '0 4px 12px rgba(0, 135, 90, 0.1)' : 'none'
              }}
            >
              <Folder size={16} />
              <span>{pl.name}</span>
              <span style={{ padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: '700', backgroundColor: activePipelineId === pl.id ? 'var(--primary)' : '#e2e8f0', color: activePipelineId === pl.id ? 'white' : '#64748b' }}>
                {count}
              </span>
            </button>
          );
        })}
        <button
          onClick={() => setShowNewPipelineModal(true)}
          style={{
            padding: '10px 18px',
            borderRadius: '14px',
            border: '1px dashed #cbd5e1',
            backgroundColor: '#f8fafc',
            color: '#475569',
            fontWeight: '700',
            fontSize: '13px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.2s',
            whiteSpace: 'nowrap'
          }}
        >
          <FolderPlus size={16} color="var(--primary)" />
          <span>+ New Pipeline</span>
        </button>
      </div>

      {/* Metrics Banner */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', width: '100%' }}>
        <div className="glass-card-premium" style={{ padding: '24px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <DollarSign size={28} />
          </div>
          <div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Active Pipeline Valuation</p>
            <h3 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-main)', marginTop: '4px' }}>₵ {(totalPipelineValue / 1000000).toFixed(2)}M</h3>
            <span style={{ fontSize: '12px', color: '#16a34a', fontWeight: '700' }}>{activeDealsCount} active property deals</span>
          </div>
        </div>

        <div className="glass-card-premium" style={{ padding: '24px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: '#e0e7ff', color: '#4338ca', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Wallet size={28} />
          </div>
          <div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Deposits & Realized Cash</p>
            <h3 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-main)', marginTop: '4px' }}>
              ₵ {(currentPipelineDeals.reduce((acc, d) => acc + (d.depositPaid || 0), 0) / 1000000).toFixed(2)}M
            </h3>
            <span style={{ fontSize: '12px', color: '#4338ca', fontWeight: '700' }}>Upfront & installment receipts</span>
          </div>
        </div>

        <div className="glass-card-premium" style={{ padding: '24px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <TrendingUp size={28} />
          </div>
          <div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Outstanding Installments</p>
            <h3 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-main)', marginTop: '4px' }}>
              ₵ {(currentPipelineDeals.reduce((acc, d) => acc + (d.remainingBalance || 0), 0) / 1000000).toFixed(2)}M
            </h3>
            <span style={{ fontSize: '12px', color: '#d97706', fontWeight: '700' }}>Scheduled future receipts</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', background: 'white', padding: '12px 20px', borderRadius: '16px', border: '1px solid var(--border-dark)', boxShadow: 'var(--shadow-premium)', width: '100%' }}>
        <div style={{ position: 'relative', width: '100%', maxWidth: '380px' }}>
          <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder={`Search ${activePipelineObj.name} deals by property, unit or buyer...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ 
              width: '100%', padding: '12px 16px 12px 48px', borderRadius: '12px', 
              border: '1px solid var(--border-dark)', fontSize: '13px', 
              background: '#f8fafc', fontWeight: '500', outline: 'none', color: 'var(--text-main)'
            }} 
          />
        </div>

        {viewMode === 'kanban' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <ArrowLeftRight size={14} /> Scroll Board:
            </span>
            <button 
              onClick={() => scrollKanban('left')} 
              style={{ padding: '8px 16px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '800', fontSize: '13px', cursor: 'pointer', boxShadow: '0 4px 10px rgba(0, 135, 90, 0.2)' }}
            >
              &larr; Scroll Left
            </button>
            <button 
              onClick={() => scrollKanban('right')} 
              style={{ padding: '8px 16px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '800', fontSize: '13px', cursor: 'pointer', boxShadow: '0 4px 10px rgba(0, 135, 90, 0.2)' }}
            >
              Scroll Right &rarr;
            </button>
          </div>
        )}

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '700' }}>Filter Stage:</span>
          <select 
            value={activeStage}
            onChange={(e) => setActiveStage(e.target.value)}
            style={{ padding: '10px 16px', borderRadius: '10px', border: '1px solid var(--border-dark)', fontSize: '13px', fontWeight: '600', background: '#f8fafc', color: 'var(--text-main)' }}
          >
            <option value="all">All Pipeline Stages</option>
            {stages.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* Kanban Mode View */}
      {viewMode === 'kanban' ? (
        <div style={{ position: 'relative', width: '100%', maxWidth: '100%', overflow: 'hidden' }}>
          <div 
            ref={kanbanContainerRef}
            style={{ 
              display: 'flex', 
              gap: '16px', 
              width: '100%', 
              overflowX: 'auto', 
              paddingBottom: '20px', 
              minHeight: '550px',
              scrollBehavior: 'smooth',
              WebkitOverflowScrolling: 'touch'
            }}
          >
            {stages.map(stage => {
              const stageDeals = filteredDeals.filter(d => d.stage === stage && (activeStage === 'all' || activeStage === stage));
              const stageTotal = stageDeals.reduce((a, b) => a + b.numericPrice, 0);

              return (
                <div key={stage} style={{ display: 'flex', flexDirection: 'column', gap: '14px', flex: '0 0 280px', width: '280px' }}>
                  <div style={{ padding: '14px 16px', background: 'white', borderRadius: '16px', border: '1px solid var(--border-dark)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: '0' }}>
                      <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: stageColors[stage].text, flexShrink: 0 }} />
                      <h4 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{stage}</h4>
                      <span style={{ padding: '2px 8px', borderRadius: '10px', background: '#f1f5f9', fontSize: '12px', fontWeight: '700', color: '#64748b' }}>{stageDeals.length}</span>
                    </div>
                    <span style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-muted)' }}>
                      ₵{(stageTotal / 1000).toFixed(0)}k
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', minHeight: '420px', padding: '10px', background: 'rgba(0, 0, 0, 0.02)', borderRadius: '20px', border: '1px dashed rgba(0,0,0,0.06)' }}>
                    {stageDeals.length === 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, color: 'var(--text-muted)', opacity: 0.6, padding: '32px 16px', textAlign: 'center' }}>
                        <p style={{ fontSize: '13px', fontWeight: '600' }}>No deals in {stage}</p>
                      </div>
                    ) : (
                      stageDeals.map(deal => (
                        <motion.div
                          key={deal.id}
                          variants={item}
                          whileHover={{ y: -4, boxShadow: '0 12px 24px -8px rgba(0,0,0,0.1)' }}
                          className="glass-card-premium"
                          style={{ padding: '20px', borderRadius: '20px', display: 'flex', flexDirection: 'column', gap: '14px', background: 'white', border: deal.stage === 'Closed Won' ? '1px solid #10b98130' : deal.stage === 'Closed Lost' ? '1px solid #ef444430' : '1px solid rgba(0,0,0,0.06)' }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ padding: '4px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: '700', backgroundColor: '#f1f5f9', color: '#475569', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <Building size={12} /> {deal.type}
                            </span>
                            <span style={{ fontSize: '11px', fontWeight: '800', color: stage === 'Closed Lost' ? '#ef4444' : stage === 'Closed Won' ? '#10b981' : 'var(--primary)' }}>
                              {stage === 'Closed Won' ? '🏆 Won Contract' : stage === 'Closed Lost' ? '❌ Lost Contract' : `${deal.probability} probability`}
                            </span>
                          </div>

                          <div>
                            <h4 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '4px', lineHeight: '1.3', wordBreak: 'break-word' }}>{deal.title}</h4>
                            <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <MapPin size={12} style={{ color: 'var(--primary)', flexShrink: 0 }} /> {deal.property} • {deal.unit}
                            </p>
                          </div>

                          <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#e2e8f0', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '12px', flexShrink: 0 }}>
                              {deal.client.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div style={{ minWidth: 0 }}>
                              <p style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{deal.client}</p>
                              <p style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{deal.clientPhone}</p>
                            </div>
                          </div>

                          {/* Installment Tracker Box */}
                          <div style={{ padding: '12px', background: deal.paymentMode === 'Upfront' ? '#ecfdf5' : '#eff6ff', borderRadius: '12px', border: deal.paymentMode === 'Upfront' ? '1px solid #10b98130' : '1px solid #bfdbfe' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                              <span style={{ fontSize: '11px', color: deal.paymentMode === 'Upfront' ? '#065f46' : '#1e3a8a', fontWeight: '800', textTransform: 'uppercase' }}>
                                {deal.paymentMode === 'Upfront' ? '100% Upfront Paid' : `Installment Schedule (${deal.months} Mos)`}
                              </span>
                              <span style={{ fontSize: '11px', fontWeight: '800', color: deal.paymentMode === 'Upfront' ? '#10b981' : '#2563eb' }}>
                                {deal.paymentMode === 'Upfront' ? 'Fully Realized' : `₵ ${deal.monthlyInstallment?.toLocaleString()}/mo`}
                              </span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: '700', color: '#334155', marginTop: '6px' }}>
                              <span>Paid: ₵ {(deal.depositPaid || 0).toLocaleString()}</span>
                              <span style={{ color: deal.remainingBalance === 0 ? '#10b981' : '#d97706' }}>
                                Balance: ₵ {(deal.remainingBalance || 0).toLocaleString()}
                              </span>
                            </div>
                          </div>

                          {/* Valuation & Actions */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingTop: '10px', borderTop: '1px solid #f1f5f9' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Sale Value</span>
                              <span style={{ fontSize: '16px', fontWeight: '900', color: stage === 'Closed Lost' ? '#ef4444' : 'var(--primary)' }}>{deal.price}</span>
                            </div>

                            {/* Inspect Agreement Button & Delink */}
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button
                                onClick={() => setSelectedAgreementDeal(deal)}
                                style={{ flex: 1, padding: '10px', borderRadius: '10px', background: '#f8fafc', border: '1px solid #cbd5e1', color: '#334155', fontWeight: '800', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', transition: '0.2s' }}
                              >
                                <FileText size={14} color="var(--primary)" /> Inspect Sale Agreement & Logs
                              </button>
                              {deal.stage !== 'Closed Lost' && (
                                <button
                                  onClick={() => handleDelinkUnit(deal.id)}
                                  title="Delink Unit & Cancel Contract"
                                  style={{ padding: '10px', borderRadius: '10px', background: '#fee2e2', border: '1px solid #fca5a5', color: '#ef4444', fontWeight: '800', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                >
                                  <Unlock size={16} />
                                </button>
                              )}
                            </div>

                            {/* Action Buttons Grid */}
                            {(stage !== 'Closed Won' && stage !== 'Closed Lost') && (
                              <div style={{ display: 'grid', gridTemplateColumns: stages.indexOf(stage) < stages.length - 2 ? '1fr 1fr' : '1fr', gap: '8px', width: '100%', marginTop: '2px' }}>
                                <button
                                  onClick={() => { setClosingDealId(deal.id); setCloseOutcome('won'); setLostReason(''); }}
                                  title="Finalize Won/Lost"
                                  style={{ padding: '8px 12px', borderRadius: '10px', border: '1px solid var(--border-dark)', background: '#f8fafc', color: '#334155', cursor: 'pointer', fontSize: '12px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', transition: '0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}
                                >
                                  <Flag size={14} /> Close
                                </button>

                                {stages.indexOf(stage) < stages.length - 2 && (
                                  <button 
                                    onClick={() => moveStage(deal.id, stages[stages.indexOf(stage) + 1])}
                                    title="Advance Stage"
                                    style={{ padding: '8px 12px', borderRadius: '10px', border: 'none', background: 'var(--primary-glow)', color: 'var(--primary)', cursor: 'pointer', fontSize: '12px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', transition: '0.2s', boxShadow: '0 2px 4px rgba(0, 135, 90, 0.1)' }}
                                  >
                                    Next <ChevronRight size={14} />
                                  </button>
                                )}
                              </div>
                            )}

                            {stage === 'Closed Won' && (
                              <div style={{ padding: '8px', background: '#ecfdf5', color: '#10b981', borderRadius: '10px', fontSize: '12px', fontWeight: '800', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                                <ThumbsUp size={14} /> Fully Realized Agreement
                              </div>
                            )}
                            {stage === 'Closed Lost' && (
                              <div style={{ padding: '8px', background: '#fef2f2', color: '#ef4444', borderRadius: '10px', fontSize: '12px', fontWeight: '800', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                                <ThumbsDown size={14} /> Contract Closed Lost
                              </div>
                            )}
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* List Mode View */
        <div className="glass-card-premium" style={{ padding: '0', overflowX: 'auto', borderRadius: '24px', width: '100%', border: '1px solid var(--border-dark)', boxShadow: '0 20px 40px -15px rgba(0,0,0,0.05)' }}>
          <table style={{ width: '100%', minWidth: '950px', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border-dark)' }}>
                <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Contract ref & Title</th>
                <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Property & Unit</th>
                <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Buyer / Client</th>
                <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Agreed Price</th>
                <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Installment Status</th>
                <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Actions / Agreement</th>
              </tr>
            </thead>
            <tbody>
              {filteredDeals.map((deal, idx) => (
                <tr key={deal.id} style={{ borderBottom: '1px solid var(--border-dark)', transition: '0.2s', background: idx % 2 === 0 ? 'white' : '#fcfdfd' }}>
                  <td style={{ padding: '16px 20px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-main)' }}>{deal.title}</span>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>{deal.id} • {deal.date}</span>
                    </div>
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-main)' }}>{deal.property}</span>
                      <span style={{ fontSize: '12px', padding: '2px 8px', background: '#f1f5f9', borderRadius: '6px', width: 'fit-content', marginTop: '4px', fontWeight: '700', color: '#475569' }}>{deal.unit}</span>
                    </div>
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-main)' }}>{deal.client}</span>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>{deal.clientPhone}</span>
                    </div>
                  </td>
                  <td style={{ padding: '16px 20px', fontSize: '15px', fontWeight: '900', color: 'var(--primary)' }}>
                    {deal.price}
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ fontSize: '12px', fontWeight: '800', color: deal.paymentMode === 'Upfront' ? '#065f46' : '#1e3a8a', background: deal.paymentMode === 'Upfront' ? '#ecfdf5' : '#eff6ff', padding: '2px 8px', borderRadius: '6px', width: 'fit-content' }}>
                        {deal.paymentMode === 'Upfront' ? '100% Upfront Paid' : `${deal.months} Mos Installment`}
                      </span>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700' }}>
                        Paid: ₵ {(deal.depositPaid || 0).toLocaleString()} | Balance: ₵ {(deal.remainingBalance || 0).toLocaleString()}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <button
                        onClick={() => setSelectedAgreementDeal(deal)}
                        title="Inspect Agreement Document"
                        style={{ padding: '8px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', background: '#f8fafc', color: '#334155', cursor: 'pointer', fontSize: '12px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}
                      >
                        <FileText size={14} color="var(--primary)" /> Agreement Specs
                      </button>
                      {deal.remainingBalance > 0 && (
                        <button 
                          onClick={() => { setSelectedAgreementDeal(deal); setShowLogPaymentModal(true); }}
                          title="Log Installment Payment"
                          style={{ padding: '8px 14px', borderRadius: '10px', border: 'none', background: '#fff7ed', color: '#d97706', cursor: 'pointer', fontSize: '12px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px' }}
                        >
                          <CreditCard size={14} /> Log Pay
                        </button>
                      )}
                      {deal.stage !== 'Closed Lost' && (
                        <button
                          onClick={() => handleDelinkUnit(deal.id)}
                          title="Delink Unit & Cancel Contract"
                          style={{ padding: '8px 14px', borderRadius: '10px', border: '1px solid #fca5a5', background: '#fee2e2', color: '#ef4444', cursor: 'pointer', fontSize: '12px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px' }}
                        >
                          <Unlock size={14} /> Delink Unit
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL: EXECUTE PROPERTY SALE AGREEMENT & INSTALLMENT SCHEDULE */}
      <AnimatePresence>
        {showSaleAgreementModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200, padding: '24px' }}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              style={{ background: 'white', padding: '48px', borderRadius: '32px', width: '100%', maxWidth: '750px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #e2e8f0', paddingBottom: '20px', marginBottom: '28px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '20px', background: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Handshake size={28} />
                  </div>
                  <div>
                    <span style={{ padding: '4px 12px', background: '#f1f5f9', color: '#475569', borderRadius: '14px', fontSize: '11px', fontWeight: '900', textTransform: 'uppercase' }}>Contract Execution Suite</span>
                    <h3 style={{ margin: '6px 0 0', fontSize: '24px', fontWeight: '900', color: '#0f172a' }}>Execute Property Sale Agreement</h3>
                  </div>
                </div>
                <button onClick={() => setShowSaleAgreementModal(false)} style={{ background: '#f1f5f9', border: 'none', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b' }}>
                  <X size={18} />
                </button>
              </div>

              <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', padding: '16px 20px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px', color: '#1e3a8a', fontWeight: '800', marginBottom: '28px' }}>
                <Calculator size={22} style={{ flexShrink: 0 }} />
                <span>
                  Select property unit and assign buyer. Choose 100% upfront payment or configure structured installment terms. The system will generate an official purchase schedule instantly.
                </span>
              </div>

              <form onSubmit={handleExecuteAgreementSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div>
                    <label style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '8px', display: 'block' }}>Target Property Asset</label>
                    <select value={execProperty} onChange={(e) => setExecProperty(e.target.value)} required style={{ width: '100%', padding: '16px 20px', borderRadius: '16px', border: '1px solid #cbd5e1', fontSize: '15px', fontWeight: '800', background: '#f8fafc', outline: 'none' }}>
                      <option value="Sunset Hills Luxury Villas">Sunset Hills Luxury Villas</option>
                      <option value="Green Valley Eco Estate">Green Valley Eco Estate</option>
                      <option value="The Apex Commercial Tower">The Apex Commercial Tower</option>
                      <option value="Palm Breeze Beach Residences">Palm Breeze Beach Residences</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '8px', display: 'block' }}>Specific Unit / Parcel #</label>
                    <input type="text" value={execUnit} onChange={(e) => setExecUnit(e.target.value)} placeholder="e.g. Villa 18 or Plot 22" required style={{ width: '100%', padding: '16px 20px', borderRadius: '16px', border: '1px solid #cbd5e1', fontSize: '15px', fontWeight: '800', boxSizing: 'border-box', outline: 'none' }} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div>
                    <label style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '8px', display: 'block' }}>Assigned Customer / Buyer</label>
                    <input type="text" value={execClient} onChange={(e) => setExecClient(e.target.value)} placeholder="e.g. Michael Osei-Mensah" required style={{ width: '100%', padding: '16px 20px', borderRadius: '16px', border: '1px solid #cbd5e1', fontSize: '15px', fontWeight: '800', boxSizing: 'border-box', outline: 'none' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '8px', display: 'block' }}>Customer Contact Phone</label>
                    <input type="text" value={execClientPhone} onChange={(e) => setExecClientPhone(e.target.value)} placeholder="+233 24 888 9999" required style={{ width: '100%', padding: '16px 20px', borderRadius: '16px', border: '1px solid #cbd5e1', fontSize: '15px', fontWeight: '800', boxSizing: 'border-box', outline: 'none' }} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div>
                    <label style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '8px', display: 'block' }}>Agreed Sale Valuation (₵)</label>
                    <input type="number" value={execPrice} onChange={(e) => setExecPrice(parseFloat(e.target.value) || 0)} placeholder="850000" required style={{ width: '100%', padding: '16px 20px', borderRadius: '16px', border: '1px solid #cbd5e1', fontSize: '16px', fontWeight: '900', color: 'var(--primary)', boxSizing: 'border-box', outline: 'none' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '8px', display: 'block' }}>Payment Mode Option</label>
                    <select value={execPaymentMode} onChange={(e) => setExecPaymentMode(e.target.value)} required style={{ width: '100%', padding: '16px 20px', borderRadius: '16px', border: '2px solid var(--primary)', fontSize: '15px', fontWeight: '800', background: '#ecfdf5', color: '#065f46', outline: 'none' }}>
                      <option value="Installment">🗓️ Structured Installment Plan</option>
                      <option value="Upfront">💵 100% Full Upfront Payment</option>
                    </select>
                  </div>
                </div>

                {execPaymentMode === 'Installment' && (
                  <div style={{ padding: '24px', background: '#f8fafc', borderRadius: '24px', border: '1px solid #cbd5e1', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <h4 style={{ fontSize: '15px', fontWeight: '900', color: '#0f172a', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Calculator size={18} color="var(--primary)" /> Installment Terms & Live Calculator
                    </h4>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                      <div>
                        <label style={{ fontSize: '13px', fontWeight: '800', color: '#334155', marginBottom: '8px', display: 'block' }}>Initial Downpayment Deposit (₵)</label>
                        <input type="number" value={execDeposit} onChange={(e) => setExecDeposit(parseFloat(e.target.value) || 0)} max={execPrice} placeholder="250000" required style={{ width: '100%', padding: '14px 16px', borderRadius: '14px', border: '1px solid #cbd5e1', fontSize: '15px', fontWeight: '800', boxSizing: 'border-box', outline: 'none' }} />
                      </div>
                      <div>
                        <label style={{ fontSize: '13px', fontWeight: '800', color: '#334155', marginBottom: '8px', display: 'block' }}>Installment Period (Months)</label>
                        <select value={execMonths} onChange={(e) => setExecMonths(parseInt(e.target.value) || 12)} style={{ width: '100%', padding: '14px 16px', borderRadius: '14px', border: '1px solid #cbd5e1', fontSize: '15px', fontWeight: '800', background: 'white', outline: 'none' }}>
                          <option value={6}>6 Months Installment</option>
                          <option value={12}>12 Months Installment</option>
                          <option value={18}>18 Months Installment</option>
                          <option value={24}>24 Months Installment</option>
                          <option value={36}>36 Months Installment</option>
                          <option value={48}>48 Months Installment</option>
                        </select>
                      </div>
                    </div>

                    <div style={{ padding: '16px 20px', background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '800', textTransform: 'uppercase', display: 'block' }}>Remaining Financed Balance</span>
                        <strong style={{ fontSize: '20px', fontWeight: '900', color: '#0f172a' }}>₵ {calculatedRemaining.toLocaleString()}</strong>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '800', textTransform: 'uppercase', display: 'block' }}>Required Monthly Installment</span>
                        <strong style={{ fontSize: '22px', fontWeight: '900', color: 'var(--primary)' }}>₵ {calculatedMonthly.toLocaleString()} / mo</strong>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '8px', display: 'block' }}>Assigned Broker / Agent</label>
                  <input type="text" value={execAgent} onChange={(e) => setExecAgent(e.target.value)} required style={{ width: '100%', padding: '16px 20px', borderRadius: '16px', border: '1px solid #cbd5e1', fontSize: '15px', fontWeight: '800', boxSizing: 'border-box', outline: 'none' }} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginTop: '12px' }}>
                  <button type="button" onClick={() => setShowSaleAgreementModal(false)} style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', color: '#475569', padding: '16px 28px', borderRadius: '16px', fontWeight: '800', fontSize: '15px', cursor: 'pointer' }}>Cancel</button>
                  <button type="submit" style={{ background: 'var(--primary)', color: 'white', border: 'none', padding: '16px 36px', borderRadius: '16px', fontSize: '15px', fontWeight: '800', cursor: 'pointer', boxShadow: '0 8px 25px rgba(0, 135, 90, 0.4)' }}>
                    Execute Sale Agreement & Pipeline Sync
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: LOG INSTALLMENT PAYMENT */}
      <AnimatePresence>
        {showLogPaymentModal && selectedAgreementDeal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1300, padding: '24px' }}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              style={{ background: 'white', padding: '48px', borderRadius: '32px', width: '100%', maxWidth: '600px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #e2e8f0', paddingBottom: '20px', marginBottom: '28px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '20px', background: '#fff7ed', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CreditCard size={28} />
                  </div>
                  <div>
                    <span style={{ padding: '4px 12px', background: '#f1f5f9', color: '#475569', borderRadius: '14px', fontSize: '11px', fontWeight: '900', textTransform: 'uppercase' }}>Installment Receipting</span>
                    <h3 style={{ margin: '6px 0 0', fontSize: '24px', fontWeight: '900', color: '#0f172a' }}>Log Installment Payment</h3>
                  </div>
                </div>
                <button onClick={() => setShowLogPaymentModal(false)} style={{ background: '#f1f5f9', border: 'none', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b' }}>
                  <X size={18} />
                </button>
              </div>

              <div style={{ padding: '20px', background: '#f8fafc', borderRadius: '20px', border: '1px solid #cbd5e1', marginBottom: '28px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '700' }}>Contract Title:</span>
                  <strong style={{ fontSize: '14px', color: '#0f172a' }}>{selectedAgreementDeal.title}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '700' }}>Assigned Client:</span>
                  <strong style={{ fontSize: '14px', color: '#0f172a' }}>{selectedAgreementDeal.client}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '700' }}>Remaining Balance Due:</span>
                  <strong style={{ fontSize: '16px', fontWeight: '900', color: '#d97706' }}>₵ {(selectedAgreementDeal.remainingBalance || 0).toLocaleString()}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '700' }}>Standard Monthly Installment:</span>
                  <strong style={{ fontSize: '16px', fontWeight: '900', color: 'var(--primary)' }}>₵ {(selectedAgreementDeal.monthlyInstallment || 0).toLocaleString()}</strong>
                </div>
              </div>

              <form onSubmit={handleLogPaymentSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '8px', display: 'block' }}>Payment Amount Received (₵)</label>
                  <input type="number" value={paymentAmountInput} onChange={(e) => setPaymentAmountInput(e.target.value)} max={selectedAgreementDeal.remainingBalance} placeholder={selectedAgreementDeal.monthlyInstallment || 25000} required style={{ width: '100%', padding: '16px 20px', borderRadius: '16px', border: '2px solid var(--primary)', fontSize: '18px', fontWeight: '900', color: 'var(--primary)', boxSizing: 'border-box', outline: 'none' }} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginTop: '12px' }}>
                  <button type="button" onClick={() => setShowLogPaymentModal(false)} style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', color: '#475569', padding: '16px 28px', borderRadius: '16px', fontWeight: '800', fontSize: '15px', cursor: 'pointer' }}>Cancel</button>
                  <button type="submit" style={{ background: '#d97706', color: 'white', border: 'none', padding: '16px 36px', borderRadius: '16px', fontSize: '15px', fontWeight: '800', cursor: 'pointer', boxShadow: '0 8px 25px rgba(217, 119, 6, 0.4)' }}>
                    Confirm Payment Receipt
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: OFFICIAL PROPERTY SALE AGREEMENT & INSTALLMENT SCHEDULE (PRINTABLE) */}
      <AnimatePresence>
        {selectedAgreementDeal && !showLogPaymentModal && (
          <div className="print-modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, padding: '24px' }}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="print-modal-content agreement-print-area"
              style={{ background: 'white', padding: '48px', borderRadius: '32px', width: '100%', maxWidth: '850px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
            >
              <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #e2e8f0', paddingBottom: '20px', marginBottom: '28px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '20px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FileText size={28} />
                  </div>
                  <div>
                    <span style={{ padding: '4px 12px', background: '#f1f5f9', color: '#475569', borderRadius: '14px', fontSize: '11px', fontWeight: '900', textTransform: 'uppercase' }}>Legal Documentation</span>
                    <h3 style={{ margin: '6px 0 0', fontSize: '24px', fontWeight: '900', color: '#0f172a' }}>Property Purchase & Installment Agreement</h3>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                  {selectedAgreementDeal.stage !== 'Closed Lost' && (
                    <button 
                      onClick={() => handleDelinkUnit(selectedAgreementDeal.id)}
                      style={{ background: '#fee2e2', color: '#ef4444', border: '1px solid #fca5a5', padding: '12px 20px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '800', fontSize: '14px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.15)' }}
                    >
                      <Unlock size={18} /> Delink Unit & Cancel Contract
                    </button>
                  )}
                  <button disabled={isGeneratingPdf} onClick={handleExportPdf} style={{ background: 'var(--primary)', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '800', fontSize: '14px', cursor: 'pointer', boxShadow: '0 8px 20px rgba(0, 135, 90, 0.3)', opacity: isGeneratingPdf ? 0.7 : 1 }}>
                    <Printer size={18} /> {isGeneratingPdf ? 'Generating Real PDF...' : 'Download Real PDF'}
                  </button>
                  <button onClick={() => setSelectedAgreementDeal(null)} style={{ background: '#f1f5f9', border: 'none', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b' }}>
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* PRINTABLE LEGAL DOCUMENT HEADER */}
              <div style={{ borderBottom: '2px solid #0f172a', paddingBottom: '24px', marginBottom: '28px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h1 style={{ fontSize: '28px', fontWeight: '900', color: '#0f172a', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '-0.5px' }}>
                      REALTYOS MASTER SALES DEED
                    </h1>
                    <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>
                      Official Contract Ref: {selectedAgreementDeal.id}
                    </span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '12px', fontWeight: '800', background: selectedAgreementDeal.remainingBalance === 0 ? '#ecfdf5' : '#fff7ed', color: selectedAgreementDeal.remainingBalance === 0 ? '#065f46' : '#d97706', padding: '4px 12px', borderRadius: '12px', display: 'inline-block' }}>
                      {selectedAgreementDeal.remainingBalance === 0 ? 'STATUS: 100% FULLY REALIZED' : `STATUS: INSTALLMENT ACTIVE (${selectedAgreementDeal.months} Mos)`}
                    </span>
                    <p style={{ fontSize: '13px', color: '#334155', fontWeight: '800', margin: '4px 0 0' }}>Executed Date: {selectedAgreementDeal.date}</p>
                  </div>
                </div>
              </div>

              {/* CONTRACT PARTIES */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
                <div style={{ background: '#f8fafc', padding: '24px', borderRadius: '20px', border: '1px solid #cbd5e1' }}>
                  <span style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '8px' }}>Vendor / Developer</span>
                  <strong style={{ fontSize: '18px', fontWeight: '900', color: '#0f172a', display: 'block' }}>RealtyOS Master Properties Ltd</strong>
                  <p style={{ fontSize: '13px', color: '#475569', margin: '4px 0 0', fontWeight: '600' }}>Property Asset: <strong>{selectedAgreementDeal.property}</strong></p>
                  <p style={{ fontSize: '13px', color: '#475569', margin: '2px 0 0', fontWeight: '600' }}>Specific Unit/Plot: <strong>{selectedAgreementDeal.unit}</strong></p>
                </div>
                <div style={{ background: '#f8fafc', padding: '24px', borderRadius: '20px', border: '1px solid #cbd5e1' }}>
                  <span style={{ fontSize: '12px', color: '#2563eb', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '8px' }}>Purchaser / Assignee</span>
                  <strong style={{ fontSize: '18px', fontWeight: '900', color: '#0f172a', display: 'block' }}>{selectedAgreementDeal.client}</strong>
                  <p style={{ fontSize: '13px', color: '#475569', margin: '4px 0 0', fontWeight: '600' }}>Contact Phone: {selectedAgreementDeal.clientPhone}</p>
                  <p style={{ fontSize: '13px', color: '#475569', margin: '2px 0 0', fontWeight: '600' }}>Assigned Agent: {selectedAgreementDeal.agent}</p>
                </div>
              </div>

              {/* FISCAL TERMS GRID */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '20px', borderRadius: '20px' }}>
                  <span style={{ fontSize: '11px', color: '#16a34a', fontWeight: '800', textTransform: 'uppercase', display: 'block' }}>Total Agreed Sale Price</span>
                  <strong style={{ fontSize: '20px', fontWeight: '900', color: '#16a34a', marginTop: '4px', display: 'block' }}>{selectedAgreementDeal.price}</strong>
                </div>
                <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', padding: '20px', borderRadius: '20px' }}>
                  <span style={{ fontSize: '11px', color: '#2563eb', fontWeight: '800', textTransform: 'uppercase', display: 'block' }}>Total Paid to Date</span>
                  <strong style={{ fontSize: '20px', fontWeight: '900', color: '#2563eb', marginTop: '4px', display: 'block' }}>₵ {(selectedAgreementDeal.depositPaid || 0).toLocaleString()}</strong>
                </div>
                <div style={{ background: selectedAgreementDeal.remainingBalance === 0 ? '#f0fdf4' : '#fff7ed', border: selectedAgreementDeal.remainingBalance === 0 ? '1px solid #bbf7d0' : '1px solid #fed7aa', padding: '20px', borderRadius: '20px' }}>
                  <span style={{ fontSize: '11px', color: selectedAgreementDeal.remainingBalance === 0 ? '#16a34a' : '#d97706', fontWeight: '800', textTransform: 'uppercase', display: 'block' }}>Remaining Balance Due</span>
                  <strong style={{ fontSize: '20px', fontWeight: '900', color: selectedAgreementDeal.remainingBalance === 0 ? '#16a34a' : '#d97706', marginTop: '4px', display: 'block' }}>₵ {(selectedAgreementDeal.remainingBalance || 0).toLocaleString()}</strong>
                </div>
                <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', padding: '20px', borderRadius: '20px' }}>
                  <span style={{ fontSize: '11px', color: '#475569', fontWeight: '800', textTransform: 'uppercase', display: 'block' }}>Monthly Payment Spec</span>
                  <strong style={{ fontSize: '18px', fontWeight: '900', color: '#0f172a', marginTop: '4px', display: 'block' }}>
                    {selectedAgreementDeal.paymentMode === 'Upfront' ? 'N/A (Upfront)' : `₵ ${(selectedAgreementDeal.monthlyInstallment || 0).toLocaleString()}/mo`}
                  </strong>
                </div>
              </div>

              {/* INSTALLMENT PAYMENTS TABLE */}
              <div style={{ marginBottom: '32px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h4 style={{ fontSize: '16px', fontWeight: '900', color: '#0f172a', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Schedule of Installment Payments & Receipts Log</h4>
                  {selectedAgreementDeal.remainingBalance > 0 && (
                    <button 
                      onClick={() => setShowLogPaymentModal(true)} 
                      className="no-print"
                      style={{ background: '#d97706', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '12px', fontSize: '12px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <CreditCard size={14} /> Log New Installment Payment
                    </button>
                  )}
                </div>

                <div style={{ borderRadius: '20px', border: '1px solid #cbd5e1', overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                    <thead>
                      <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #cbd5e1' }}>
                        <th style={{ padding: '14px 20px', fontWeight: '800', color: '#475569' }}>Transaction Date</th>
                        <th style={{ padding: '14px 20px', fontWeight: '800', color: '#475569' }}>Payment Reference</th>
                        <th style={{ padding: '14px 20px', fontWeight: '800', color: '#475569' }}>Description / Note</th>
                        <th style={{ padding: '14px 20px', fontWeight: '800', color: '#475569', textAlign: 'right' }}>Amount Paid</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedAgreementDeal.installmentLogs && selectedAgreementDeal.installmentLogs.length > 0 ? (
                        selectedAgreementDeal.installmentLogs.map((log, i) => (
                          <tr key={i} style={{ borderBottom: '1px solid #e2e8f0', background: i % 2 === 0 ? 'white' : '#f8fafc' }}>
                            <td style={{ padding: '14px 20px', fontWeight: '700', color: '#0f172a' }}>{log.date}</td>
                            <td style={{ padding: '14px 20px', fontFamily: 'monospace', fontWeight: '800', color: 'var(--primary)' }}>{log.ref}</td>
                            <td style={{ padding: '14px 20px', color: '#475569' }}>{log.note}</td>
                            <td style={{ padding: '14px 20px', fontWeight: '900', color: '#00875a', textAlign: 'right' }}>₵ {log.amount?.toLocaleString()}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4" style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>No payments logged yet.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* LEGAL TERMS & SIGNATURE BLOCK */}
              <div style={{ background: '#f8fafc', padding: '28px', borderRadius: '24px', border: '1px solid #cbd5e1', marginBottom: '32px' }}>
                <h5 style={{ fontSize: '14px', fontWeight: '900', color: '#0f172a', margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Official Legal Covenant & Attestation</h5>
                <p style={{ fontSize: '13px', color: '#475569', lineHeight: '1.6', margin: '0 0 20px' }}>
                  This deed confirms the assignment of the specified physical property unit to the purchaser under the agreed financial terms. In the event of installment default exceeding 90 consecutive days, the vendor reserves the right to repossess the unit and disburse escrow deposits less statutory liquidated damages.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', paddingTop: '28px', borderTop: '1px solid #cbd5e1' }}>
                  <div>
                    <div style={{ height: '50px', borderBottom: '1px solid #0f172a', marginBottom: '8px', display: 'flex', alignItems: 'flex-end', paddingBottom: '4px' }}>
                      <span style={{ fontFamily: 'cursive', fontSize: '18px', color: '#00875a', fontWeight: '700' }}>RealtyOS Master Officer</span>
                    </div>
                    <span style={{ fontSize: '12px', fontWeight: '800', color: '#0f172a', display: 'block' }}>Authorized Vendor Signature</span>
                    <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>RealtyOS Master Properties Ltd</span>
                  </div>
                  <div>
                    <div style={{ height: '50px', borderBottom: '1px solid #0f172a', marginBottom: '8px', display: 'flex', alignItems: 'flex-end', paddingBottom: '4px' }}>
                      <span style={{ fontFamily: 'cursive', fontSize: '18px', color: '#2563eb', fontWeight: '700' }}>{selectedAgreementDeal.client}</span>
                    </div>
                    <span style={{ fontSize: '12px', fontWeight: '800', color: '#0f172a', display: 'block' }}>Authorized Purchaser Attestation</span>
                    <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>Agreed & Endorsed</span>
                  </div>
                </div>
              </div>

              <div className="no-print" style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button onClick={() => setSelectedAgreementDeal(null)} style={{ background: 'var(--primary)', color: 'white', border: 'none', padding: '16px 36px', borderRadius: '16px', fontSize: '15px', fontWeight: '800', cursor: 'pointer', boxShadow: '0 8px 25px rgba(0, 135, 90, 0.4)' }}>
                  Done & Return to Sales Board
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Close Deal Modal */}
      <AnimatePresence>
        {closingDealId && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              style={{ background: 'white', padding: '36px', borderRadius: '28px', width: '500px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                  <h3 style={{ fontSize: '22px', fontWeight: '800', color: 'var(--text-main)' }}>Finalize Deal Outcome</h3>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '500', marginTop: '2px' }}>
                    Select whether this contract was won or lost
                  </p>
                </div>
                <button onClick={() => setClosingDealId(null)} style={{ background: '#f1f5f9', border: 'none', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', cursor: 'pointer' }}>
                  <X size={20} />
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                <button
                  type="button"
                  onClick={() => setCloseOutcome('won')}
                  style={{
                    padding: '20px',
                    borderRadius: '20px',
                    border: closeOutcome === 'won' ? '2px solid #10b981' : '1px solid var(--border-dark)',
                    backgroundColor: closeOutcome === 'won' ? '#f0fdf4' : 'white',
                    color: closeOutcome === 'won' ? '#10b981' : 'var(--text-muted)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '10px',
                    fontWeight: '800',
                    transition: 'all 0.2s',
                    boxShadow: closeOutcome === 'won' ? '0 10px 20px -5px rgba(16, 185, 129, 0.2)' : 'none'
                  }}
                >
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: closeOutcome === 'won' ? '#10b981' : '#f1f5f9', color: closeOutcome === 'won' ? 'white' : '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ThumbsUp size={24} />
                  </div>
                  <span style={{ fontSize: '16px', color: closeOutcome === 'won' ? '#10b981' : 'var(--text-main)' }}>🏆 Closed Won</span>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '500' }}>Contract signed & deposit paid</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCloseOutcome('lost')}
                  style={{
                    padding: '20px',
                    borderRadius: '20px',
                    border: closeOutcome === 'lost' ? '2px solid #ef4444' : '1px solid var(--border-dark)',
                    backgroundColor: closeOutcome === 'lost' ? '#fef2f2' : 'white',
                    color: closeOutcome === 'lost' ? '#ef4444' : 'var(--text-muted)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '10px',
                    fontWeight: '800',
                    transition: 'all 0.2s',
                    boxShadow: closeOutcome === 'lost' ? '0 10px 20px -5px rgba(239, 68, 68, 0.2)' : 'none'
                  }}
                >
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: closeOutcome === 'lost' ? '#ef4444' : '#f1f5f9', color: closeOutcome === 'lost' ? 'white' : '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ThumbsDown size={24} />
                  </div>
                  <span style={{ fontSize: '16px', color: closeOutcome === 'lost' ? '#ef4444' : 'var(--text-main)' }}>❌ Closed Lost</span>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '500' }}>Client withdrew or budget limit</span>
                </button>
              </div>

              {closeOutcome === 'lost' && (
                <div style={{ marginBottom: '24px' }}>
                  <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Reason for Lost Deal (Optional)</label>
                  <textarea 
                    value={lostReason} 
                    onChange={(e) => setLostReason(e.target.value)} 
                    rows="3" 
                    placeholder="e.g., Selected competitor, budget constraint, project delayed..." 
                    style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-dark)', fontSize: '14px', fontWeight: '500', background: '#f8fafc' }}
                  ></textarea>
                </div>
              )}

              <button 
                onClick={handleConfirmClose}
                style={{ width: '100%', backgroundColor: closeOutcome === 'won' ? '#10b981' : '#ef4444', color: 'white', border: 'none', padding: '16px', borderRadius: '16px', fontSize: '15px', fontWeight: '800', cursor: 'pointer', transition: '0.2s', boxShadow: closeOutcome === 'won' ? '0 10px 20px -5px rgba(16, 185, 129, 0.4)' : '0 10px 20px -5px rgba(239, 68, 68, 0.4)' }}
              >
                Confirm Deal as {closeOutcome === 'won' ? 'Closed Won' : 'Closed Lost'}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Completed Sales History Archive Modal */}
      <AnimatePresence>
        {showHistoryModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              style={{ background: 'white', padding: '40px', borderRadius: '28px', width: '800px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <span style={{ padding: '4px 10px', borderRadius: '20px', backgroundColor: '#ecfdf5', color: '#059669', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Award size={12} /> Historical Outcomes
                    </span>
                  </div>
                  <h3 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-main)' }}>Completed Sales Archive</h3>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '500', marginTop: '4px' }}>Review historical records of both won contracts and lost sales</p>
                </div>
                <button onClick={() => setShowHistoryModal(false)} style={{ background: '#f1f5f9', border: 'none', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', cursor: 'pointer' }}>
                  <X size={20} />
                </button>
              </div>

              <div style={{ padding: '20px 24px', background: 'var(--primary-glow)', border: '1px solid rgba(0, 135, 90, 0.2)', borderRadius: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                  <p style={{ fontSize: '12px', fontWeight: '800', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Realized Revenue</p>
                  <h2 style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text-main)', marginTop: '4px' }}>
                    ₵ {(deals.filter(d => d.stage === 'Closed Won').reduce((acc, d) => acc + d.numericPrice, 0) / 1000000).toFixed(2)}M
                  </h2>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#10b981', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '16px' }}>
                      {deals.filter(d => d.stage === 'Closed Won').length}
                    </div>
                    <span style={{ fontSize: '13px', fontWeight: '800', color: '#10b981' }}>Won</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#ef4444', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '16px' }}>
                      {deals.filter(d => d.stage === 'Closed Lost').length}
                    </div>
                    <span style={{ fontSize: '13px', fontWeight: '800', color: '#ef4444' }}>Lost</span>
                  </div>
                </div>
              </div>

              <div style={{ position: 'relative', marginBottom: '24px' }}>
                <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="text"
                  placeholder="Search historical deals by client, property, or agent..."
                  value={historySearchTerm}
                  onChange={(e) => setHistorySearchTerm(e.target.value)}
                  style={{ width: '100%', padding: '14px 16px 14px 48px', borderRadius: '14px', border: '1px solid var(--border-dark)', fontSize: '13px', background: '#f8fafc', fontWeight: '500', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '420px', overflowY: 'auto', paddingRight: '8px' }}>
                {deals.filter(d => (d.stage === 'Closed Won' || d.stage === 'Closed Lost') && (
                  d.title.toLowerCase().includes(historySearchTerm.toLowerCase()) ||
                  d.client.toLowerCase().includes(historySearchTerm.toLowerCase()) ||
                  d.property.toLowerCase().includes(historySearchTerm.toLowerCase()) ||
                  d.agent.toLowerCase().includes(historySearchTerm.toLowerCase())
                )).map(deal => (
                  <div key={deal.id} style={{ padding: '20px', borderRadius: '20px', border: deal.stage === 'Closed Won' ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)', background: deal.stage === 'Closed Won' ? '#fcfdfd' : '#fefefe', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                      <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: deal.stage === 'Closed Won' ? '#10b98115' : '#ef444415', color: deal.stage === 'Closed Won' ? '#10b981' : '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {deal.stage === 'Closed Won' ? <CheckCircle2 size={24} /> : <XCircle size={24} />}
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <h4 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-main)' }}>{deal.title}</h4>
                          <span style={{ padding: '2px 8px', borderRadius: '8px', background: '#f1f5f9', fontSize: '11px', fontWeight: '700', color: '#475569' }}>{deal.type}</span>
                        </div>
                        <p style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '600', marginTop: '2px' }}>
                          {deal.property} • Date: {deal.date}
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                          <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-main)', background: '#e2e8f0', padding: '2px 8px', borderRadius: '6px' }}>{deal.client} ({deal.clientPhone})</span>
                          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Agent: <strong>{deal.agent}</strong></span>
                        </div>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '18px', fontWeight: '800', color: deal.stage === 'Closed Won' ? '#059669' : '#ef4444', display: 'block' }}>{deal.price}</span>
                      <span style={{ fontSize: '11px', fontWeight: '700', color: deal.stage === 'Closed Won' ? '#10b981' : '#ef4444', background: deal.stage === 'Closed Won' ? '#10b98115' : '#ef444415', padding: '2px 8px', borderRadius: '6px', display: 'inline-block', marginTop: '4px' }}>
                        {deal.stage === 'Closed Won' ? '100% Realized' : '0% Realized (Lost)'}
                      </span>
                    </div>
                  </div>
                ))}

                {deals.filter(d => d.stage === 'Closed Won' || d.stage === 'Closed Lost').length === 0 && (
                  <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontWeight: '600', fontSize: '14px' }}>
                    No historical deals found in archive.
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Start New Pipeline Modal */}
      <AnimatePresence>
        {showNewPipelineModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              style={{ background: 'white', padding: '40px', borderRadius: '28px', width: '560px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <span style={{ padding: '4px 10px', borderRadius: '20px', backgroundColor: 'var(--primary-glow)', color: 'var(--primary)', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase' }}>
                      Orchestration
                    </span>
                  </div>
                  <h3 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-main)' }}>Start New Sales Pipeline</h3>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '500', marginTop: '4px' }}>Create a dedicated sales workspace for a new project or client segment</p>
                </div>
                <button onClick={() => setShowNewPipelineModal(false)} style={{ background: '#f1f5f9', border: 'none', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', cursor: 'pointer' }}>
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleStartNewPipeline} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Pipeline Name</label>
                  <input name="name" type="text" placeholder="e.g. Q4 Beachfront Villas Pre-Sale" required style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-dark)', fontSize: '14px', fontWeight: '500', background: '#f8fafc' }} />
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Objective / Segment Description</label>
                  <textarea name="description" rows="3" placeholder="e.g. Managing premium residential unit inquiries and institutional bookings..." required style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-dark)', fontSize: '14px', fontWeight: '500', background: '#f8fafc' }}></textarea>
                </div>

                <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '16px', border: '1px solid var(--border-dark)' }}>
                  <h5 style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '4px' }}>Default Stages Included:</h5>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '500' }}>Inquiry &rarr; Inspection &rarr; Negotiation &rarr; Contract Pending &rarr; Closed Won</p>
                </div>

                <button type="submit" style={{ backgroundColor: 'var(--primary)', color: 'white', border: 'none', padding: '16px', borderRadius: '14px', fontSize: '15px', fontWeight: '800', marginTop: '12px', cursor: 'pointer', boxShadow: '0 10px 20px -5px rgba(0, 135, 90, 0.4)', transition: 'all 0.2s' }}>
                  Create & Launch Pipeline
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Record New Deal Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              style={{ background: 'white', padding: '40px', borderRadius: '28px', width: '600px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                  <h3 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-main)' }}>Record Sales Inquiry / Deal</h3>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '500', marginTop: '4px' }}>Assigning to active pipeline</p>
                </div>
                <button onClick={() => setShowAddModal(false)} style={{ background: '#f1f5f9', border: 'none', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', cursor: 'pointer' }}>
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleAddDeal} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Target Pipeline</label>
                  <select name="pipelineId" defaultValue={activePipelineId === 'all' ? 'pl-1' : activePipelineId} required style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-dark)', fontSize: '14px', fontWeight: '600', background: '#f8fafc' }}>
                    {pipelines.filter(p => p.id !== 'all').map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Deal Title / Description</label>
                  <input name="title" type="text" placeholder="e.g. Villa 5 Acquisition Inquiry" required style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-dark)', fontSize: '14px', fontWeight: '500', background: '#f8fafc' }} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Prospect / Buyer Name</label>
                    <input name="client" type="text" placeholder="e.g. Dr. Kwame Kyei" required style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-dark)', fontSize: '14px', fontWeight: '500', background: '#f8fafc' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Contact Phone</label>
                    <input name="phone" type="text" placeholder="+233 24 000 0000" required style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-dark)', fontSize: '14px', fontWeight: '500', background: '#f8fafc' }} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Target Property Project</label>
                    <select name="property" required style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-dark)', fontSize: '14px', fontWeight: '600', background: '#f8fafc' }}>
                      <option value="Sunset Hills Luxury Villas">Sunset Hills Luxury Villas</option>
                      <option value="Green Valley Eco Estate">Green Valley Eco Estate</option>
                      <option value="The Apex Commercial Tower">The Apex Commercial Tower</option>
                      <option value="Palm Breeze Beach Residences">Palm Breeze Beach Residences</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Asset Type</label>
                    <select 
                      value={interestType} 
                      onChange={(e) => setInterestType(e.target.value)}
                      style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-dark)', fontSize: '14px', fontWeight: '600', background: '#f8fafc' }}
                    >
                      <option value="Apartment">Apartment</option>
                      <option value="House">House</option>
                      <option value="Commercial">Commercial</option>
                      <option value="Land">Land</option>
                    </select>
                  </div>
                </div>

                {interestType === 'Land' ? (
                  <div style={{ padding: '20px', border: '1px dashed var(--primary)', borderRadius: '16px', backgroundColor: 'var(--primary-glow)' }}>
                    <p style={{ fontSize: '12px', fontWeight: '800', color: 'var(--primary)', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Land Inquiry Requirements</p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                      <input name="landAcreage" type="text" placeholder="Min. Acreage / Plots" defaultValue="2 Plots" style={{ width: '100%', padding: '12px', backgroundColor: 'white', border: '1px solid var(--border-dark)', borderRadius: '10px', fontSize: '13px', fontWeight: '500' }} />
                      <input name="landLocation" type="text" placeholder="Preferred Zone" defaultValue="Ridge / High elevation" style={{ width: '100%', padding: '12px', backgroundColor: 'white', border: '1px solid var(--border-dark)', borderRadius: '10px', fontSize: '13px', fontWeight: '500' }} />
                    </div>
                  </div>
                ) : (
                  <div style={{ padding: '20px', border: '1px dashed var(--primary)', borderRadius: '16px', backgroundColor: 'var(--primary-glow)' }}>
                    <p style={{ fontSize: '12px', fontWeight: '800', color: 'var(--primary)', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Property Specifications</p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                      <input name="bedCount" type="number" placeholder="Min. Bedrooms" defaultValue="4" style={{ width: '100%', padding: '12px', backgroundColor: 'white', border: '1px solid var(--border-dark)', borderRadius: '10px', fontSize: '13px', fontWeight: '500' }} />
                      <input name="parkingReq" type="text" placeholder="Parking Spaces" defaultValue="2 Cars Parking" style={{ width: '100%', padding: '12px', backgroundColor: 'white', border: '1px solid var(--border-dark)', borderRadius: '10px', fontSize: '13px', fontWeight: '500' }} />
                    </div>
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Expected Deal Value (₵)</label>
                    <input name="price" type="number" placeholder="850000" required style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-dark)', fontSize: '14px', fontWeight: '500', background: '#f8fafc' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Assigned Agent</label>
                    <select name="agent" required style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-dark)', fontSize: '14px', fontWeight: '600', background: '#f8fafc' }}>
                      <option value="Dwight Schrute">Dwight Schrute</option>
                      <option value="Pam Beesly">Pam Beesly</option>
                      <option value="Phyllis Vance">Phyllis Vance</option>
                      <option value="Louis Kemenyo">Louis Kemenyo</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Initial Notes & Requirements</label>
                  <textarea name="notes" rows="3" placeholder="Enter key prospect requirements, timeline, or financing options..." style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-dark)', fontSize: '14px', fontWeight: '500', background: '#f8fafc' }}></textarea>
                </div>

                <button type="submit" style={{ backgroundColor: 'var(--primary)', color: 'white', border: 'none', padding: '16px', borderRadius: '14px', fontSize: '15px', fontWeight: '800', marginTop: '12px', cursor: 'pointer', boxShadow: '0 10px 20px -5px rgba(0, 135, 90, 0.4)', transition: 'all 0.2s' }}>
                  Add to Active Deal Pipeline
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Sales;
