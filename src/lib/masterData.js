/**
 * Master Data Synchronizer for RealtyOS
 * Seamlessly synchronizes rental properties and rental units via localStorage
 * across the Rental Properties and Units portfolio modules.
 */

import { syncTableWithStorage, saveToSupabaseAndStorage, getLocalData } from './supabaseSync';

export const defaultRentalProperties = [
  { 
    id: 1, 
    name: 'Grand Horizon Apartments', 
    location: 'East Legon, Accra', 
    units: 48, 
    status: 'High Performance',
    type: '🏢 Residential Apartment Complex',
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
    icon: '🏢 Apartment Complex'
  },
  { 
    id: 2, 
    name: 'Riverside Residencies', 
    location: 'Cantonments, Accra', 
    units: 32, 
    status: 'Stable',
    type: '🏢 Residential Apartment Complex',
    image: 'https://images.unsplash.com/photo-1460317442991-0ec239397148?auto=format&fit=crop&w=800&q=80',
    icon: '🏢 Apartment Complex'
  },
  { 
    id: 3, 
    name: 'The Peninsula Office Complex', 
    location: 'Airport City, Accra', 
    units: 12, 
    status: 'Fully Occupied',
    type: '💼 Commercial Office Tower',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
    icon: '💼 Commercial Office Tower'
  },
  { 
    id: 4, 
    name: 'Osu Oxford Street Retail Hub', 
    location: 'Osu, Accra', 
    units: 18, 
    status: 'High Performance',
    type: '🏪 Commercial Shop / Retail Store',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80',
    icon: '🏪 Shop / Store'
  }
];

export const defaultRentalUnits = [
  { 
    id: '101-A', property: 'Grand Horizon Apartments', type: '2 Bedroom Apt', price: '₵ 12,500', status: 'Occupied', tenant: 'Dr. Kwame Nkrumah Ansah', lastPaid: '2026-05-01',
    sqft: '1,450 sq.ft', hvac: 'Dual Inverter Split AC', inspection: 'Certified Ready', amenities: ['Ceiling Fan', 'Fitted Built-in Wardrobe', 'Inverter Air Conditioner (AC)', 'Water Heater System', 'Fitted Kitchen Cabinets', 'Polytank / Dedicated Water Storage', 'Prepaid Electricity Meter', 'Walled & Gated Perimeter Security']
  },
  { 
    id: '102-A', property: 'Grand Horizon Apartments', type: '1 Bedroom Apt', price: '₵ 4,000', status: 'Available', tenant: '-', lastPaid: '-',
    sqft: '850 sq.ft', hvac: 'Single Split Inverter', inspection: 'Passed Maintenance', amenities: ['Ceiling Fan', 'Fitted Built-in Wardrobe', 'Inverter Air Conditioner (AC)', 'Water Heater System', 'Prepaid Electricity Meter']
  },
  { 
    id: '305-C', property: 'Grand Horizon Apartments', type: '3 Bedroom Penthouse', price: '₵ 8,500', status: 'Occupied', tenant: 'Sophia Mensah-Osei', lastPaid: '2026-05-02',
    sqft: '2,800 sq.ft', hvac: 'Tri-Zone VRF System', inspection: 'Executive VIP Verified', amenities: ['Ceiling Fan', 'Fitted Built-in Wardrobe', 'Inverter Air Conditioner (AC)', 'Water Heater System', 'Fitted Kitchen Cabinets', 'Generator Backup Power Line', 'Fibre Broadband Internet Ready', 'En-suite Master Bathroom']
  },
  { 
    id: '108-A', property: 'Riverside Residencies', type: '2 Bedroom Apt', price: '₵ 2,200', status: 'Available', tenant: '-', lastPaid: '-',
    sqft: '1,100 sq.ft', hvac: 'Single Inverter AC', inspection: 'Deep Cleaned', amenities: ['Ceiling Fan', 'Fitted Built-in Wardrobe', 'Prepaid Electricity Meter', 'Polytank / Dedicated Water Storage']
  },
  { 
    id: '201-B', property: 'Riverside Residencies', type: 'Studio Suite', price: '₵ 1,800', status: 'Maintenance', tenant: '-', lastPaid: '-',
    sqft: '520 sq.ft', hvac: 'Central Chiller Duct', inspection: 'Scheduled AC Flush', amenities: ['Ceiling Fan', 'Fitted Kitchen Cabinets', 'Prepaid Electricity Meter']
  },
  { 
    id: 'S-02', property: 'The Peninsula Office Complex', type: 'Office Suite', price: '₵ 12,000', status: 'Occupied', tenant: 'Zerivon Tech / Corporate', lastPaid: '2026-05-01',
    sqft: '3,200 sq.ft', hvac: 'Commercial Central Air', inspection: 'Fire Safety Compliant', amenities: ['Inverter Air Conditioner (AC)', 'Generator Backup Power Line', 'Fibre Broadband Internet Ready', 'Walled & Gated Perimeter Security']
  },
  { 
    id: 'R-01', property: 'Osu Oxford Street Retail Hub', type: 'Retail Storefront', price: '₵ 15,000', status: 'Occupied', tenant: 'Kofi & Sons Electronics', lastPaid: '2026-05-01',
    sqft: '1,800 sq.ft', hvac: 'Commercial Cassette AC', inspection: 'Fire Safety Compliant', amenities: ['Inverter Air Conditioner (AC)', 'Prepaid Electricity Meter', 'Walled & Gated Perimeter Security']
  },
  { 
    id: 'ST-99', property: 'Standalone Unit / Independent Property', type: 'Executive Standalone Villa', price: '₵ 9,000', status: 'Available', tenant: '-', lastPaid: '-',
    sqft: '2,500 sq.ft', hvac: 'Multi-Split AC Setup', inspection: 'Pristine Inspection', amenities: ['Ceiling Fan', 'Fitted Built-in Wardrobe', 'Inverter Air Conditioner (AC)', 'Water Heater System', 'Fitted Kitchen Cabinets', 'Polytank / Dedicated Water Storage', 'Prepaid Electricity Meter', 'Generator Backup Power Line', 'Walled & Gated Perimeter Security']
  },
];

export const getStoredProperties = () => {
  return getLocalData('realtyos_rental_properties', defaultRentalProperties);
};

export const saveStoredProperties = (properties) => {
  saveToSupabaseAndStorage('rental_properties', 'realtyos_rental_properties', properties, 'realtyos_rental_update');
};

export const getStoredUnits = () => {
  return getLocalData('realtyos_rental_units', defaultRentalUnits);
};

export const saveStoredUnits = (units) => {
  saveToSupabaseAndStorage('rental_units', 'realtyos_rental_units', units, 'realtyos_rental_update');
};

export const defaultTenants = [
  { 
    id: 'RES-8819', 
    name: 'Dr. Kwame Nkrumah Ansah', 
    email: 'k.ansah@healthcare.gh', 
    phone: '+233 20 112 2334', 
    unit: '101-A', 
    property: 'Grand Horizon Apartments', 
    status: 'Active Lease',
    rentStatus: 'Paid Up',
    monthlyRent: 12500,
    securityDeposit: 25000,
    leaseStart: '2025-01-15',
    leaseEnd: '2027-01-14',
    ghanaCardNo: 'GHA-718293810-1',
    ghanaCardFront: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80',
    ghanaCardBack: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80',
    passportPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    guarantorName: 'Mrs. Evelyn Ansah (Wife)',
    guarantorPhone: '+233 24 555 7788',
    witnessName: 'Samuel Osei Tutu',
    witnessPhone: '+233 20 444 8811',
    employer: 'Korle-Bu Teaching Hospital',
    occupation: 'Chief Surgeon',
    bankName: 'Stanbic Bank Ghana Ltd',
    bankAccNo: '9012837410293',
    maintenanceTicketsCount: 2,
    lastPaymentDate: '2026-05-01',
    rating: 4.9,
    notes: 'Exemplary resident, rent paid via standing order on the 1st of every month.',
    paymentHistory: [
      { receiptNo: 'REC-718293', date: '2026-05-01', amount: 150000, duration: '12 Months', baseRent: 150000, levies: 0, paymentMethod: 'Standing Order ACH', refNo: 'ACH-991823', cashier: 'Louis K. Executive', newLeaseEnd: '2027-01-14' },
      { receiptNo: 'REC-618204', date: '2025-05-01', amount: 150000, duration: '12 Months', baseRent: 150000, levies: 0, paymentMethod: 'Standing Order ACH', refNo: 'ACH-881920', cashier: 'Louis K. Executive', newLeaseEnd: '2026-01-14' }
    ]
  },
  { 
    id: 'RES-8820', 
    name: 'Sophia Mensah-Osei', 
    email: 's.mensah@fintech.io', 
    phone: '+233 24 888 9911', 
    unit: '305-C', 
    property: 'Grand Horizon Apartments', 
    status: 'Active Lease',
    rentStatus: 'Paid Up',
    monthlyRent: 8500,
    securityDeposit: 17000,
    leaseStart: '2025-06-01',
    leaseEnd: '2026-05-31',
    ghanaCardNo: 'GHA-829102938-2',
    ghanaCardFront: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80',
    ghanaCardBack: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80',
    passportPhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    guarantorName: 'Mr. David Mensah (Father)',
    guarantorPhone: '+233 20 444 1122',
    witnessName: 'Samuel Osei Tutu',
    witnessPhone: '+233 20 444 8811',
    employer: 'MTN Ghana / MobileMoney Ltd',
    occupation: 'Product Strategy Lead',
    bankName: 'Ecobank Ghana PLC',
    bankAccNo: '1029384758192',
    maintenanceTicketsCount: 0,
    lastPaymentDate: '2026-05-02',
    rating: 5.0,
    notes: 'Immaculate apartment maintenance. Lease up for renewal next month.',
    paymentHistory: [
      { receiptNo: 'REC-592810', date: '2026-05-02', amount: 51000, duration: '6 Months', baseRent: 51000, levies: 0, paymentMethod: 'MTN Mobile Money', refNo: 'MM-772910', cashier: 'Louis K. Executive', newLeaseEnd: '2026-05-31' }
    ]
  },
  { 
    id: 'RES-8821', 
    name: 'Nigel Vanderpuye', 
    email: 'nigel@vanderpuye.co.uk', 
    phone: '+233 50 123 9900', 
    unit: '-', 
    property: '-', 
    status: 'Registered / Unassigned',
    rentStatus: 'No Active Lease',
    monthlyRent: 0,
    securityDeposit: 0,
    leaseStart: '-',
    leaseEnd: '-',
    ghanaCardNo: 'GHA-394810293-5',
    ghanaCardFront: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80',
    ghanaCardBack: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80',
    passportPhoto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    guarantorName: 'Vanderpuye Logistics Ltd',
    guarantorPhone: '+233 30 255 1100',
    witnessName: 'Samuel Osei Tutu',
    witnessPhone: '+233 20 444 8811',
    employer: 'Vanderpuye Logistics Ltd',
    occupation: 'Managing Director',
    bankName: 'Stanbic Bank Ghana Ltd',
    bankAccNo: '8829102938475',
    maintenanceTicketsCount: 3,
    lastPaymentDate: '-',
    rating: 4.2,
    notes: 'Newly onboarded executive KYC profile waiting for unit link.',
    paymentHistory: []
  },
  { 
    id: 'RES-8822', 
    name: 'Emmanuel Ofori Atta', 
    email: 'e.ofori@goldfields.gh', 
    phone: '+233 24 111 2233', 
    unit: '102-A', 
    property: 'Grand Horizon Apartments', 
    status: 'Active Lease',
    rentStatus: 'Paid Up',
    monthlyRent: 4000,
    securityDeposit: 8000,
    leaseStart: '2025-08-15',
    leaseEnd: '2026-08-15',
    ghanaCardNo: 'GHA-102938475-3',
    ghanaCardFront: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80',
    ghanaCardBack: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80',
    passportPhoto: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80',
    guarantorName: 'Dr. Seth Ofori (Brother)',
    guarantorPhone: '+233 20 555 1234',
    witnessName: 'Samuel Osei Tutu',
    witnessPhone: '+233 20 444 8811',
    employer: 'Goldfields Ghana Ltd',
    occupation: 'Senior Mining Engineer',
    bankName: 'N/A (Decoupled)',
    bankAccNo: 'N/A',
    maintenanceTicketsCount: 1,
    lastPaymentDate: '2026-05-01',
    rating: 4.8,
    notes: 'Lease expiring in exactly 3 months. Renewal notice generated.',
    paymentHistory: [
      { receiptNo: 'REC-391820', date: '2026-05-01', amount: 48000, duration: '12 Months', baseRent: 48000, levies: 0, paymentMethod: 'Bank Wire Transfer', refNo: 'TRN-102938', cashier: 'Louis K. Executive', newLeaseEnd: '2026-08-15' }
    ]
  },
  { 
    id: 'RES-8823', 
    name: 'Grace Amponsah', 
    email: 'g.amponsah@kpmg.com.gh', 
    phone: '+233 50 888 7766', 
    unit: '108-A', 
    property: 'Riverside Residencies', 
    status: 'Active Lease',
    rentStatus: 'Paid Up',
    monthlyRent: 2200,
    securityDeposit: 4400,
    leaseStart: '2025-07-10',
    leaseEnd: '2026-07-10',
    ghanaCardNo: 'GHA-584930291-8',
    ghanaCardFront: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80',
    ghanaCardBack: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80',
    passportPhoto: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    guarantorName: 'Mr. Ernest Amponsah (Father)',
    guarantorPhone: '+233 24 333 4455',
    witnessName: 'Samuel Osei Tutu',
    witnessPhone: '+233 20 444 8811',
    employer: 'KPMG Ghana',
    occupation: 'Senior Audit Manager',
    bankName: 'N/A (Decoupled)',
    bankAccNo: 'N/A',
    maintenanceTicketsCount: 0,
    lastPaymentDate: '2026-05-03',
    rating: 5.0,
    notes: 'Lease expiring in 2 months. Scheduled for contract renewal review.',
    paymentHistory: [
      { receiptNo: 'REC-992019', date: '2026-05-03', amount: 26400, duration: '12 Months', baseRent: 26400, levies: 0, paymentMethod: 'Standing Order ACH', refNo: 'ACH-441029', cashier: 'Louis K. Executive', newLeaseEnd: '2026-07-10' }
    ]
  },
  { 
    id: 'RES-8824', 
    name: 'Kwadwo Asamoah', 
    email: 'k.asamoah@builder.com', 
    phone: '+233 24 999 0000', 
    unit: '201-B', 
    property: 'Riverside Residencies', 
    status: 'Active Lease',
    rentStatus: 'Arrears / Overdue',
    monthlyRent: 1800,
    securityDeposit: 3600,
    leaseStart: '2025-02-15',
    leaseEnd: '2026-02-15',
    ghanaCardNo: 'GHA-938401928-7',
    ghanaCardFront: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80',
    ghanaCardBack: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80',
    passportPhoto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    guarantorName: 'Asamoah Builders Enterprise',
    guarantorPhone: '+233 30 222 5588',
    witnessName: 'Samuel Osei Tutu',
    witnessPhone: '+233 20 444 8811',
    employer: 'Asamoah Construction',
    occupation: 'Site Contractor',
    bankName: 'N/A (Decoupled)',
    bankAccNo: 'N/A',
    maintenanceTicketsCount: 2,
    lastPaymentDate: '2026-02-01',
    rating: 3.5,
    notes: 'Lease expired 3 months ago. Currently in rent overstay calculation mode.',
    paymentHistory: [
      { receiptNo: 'REC-102938', date: '2025-02-15', amount: 21600, duration: '12 Months', baseRent: 21600, levies: 0, paymentMethod: 'Cash', refNo: 'CASH-0012', cashier: 'Louis K. Executive', newLeaseEnd: '2026-02-15' }
    ]
  }
];

export const getStoredTenants = () => {
  const local = getLocalData('realtyos_tenants', defaultTenants);
  return local.map(t => {
    const defaultMatch = defaultTenants.find(dt => dt.id === t.id);
    return {
      ...t,
      paymentHistory: t.paymentHistory || (defaultMatch ? defaultMatch.paymentHistory : [])
    };
  });
};

export const saveStoredTenants = (tenants) => {
  saveToSupabaseAndStorage('tenants', 'realtyos_tenants', tenants, 'realtyos_tenants_update');
};

export const defaultLeases = [
  { 
    id: 'LS-9001', tenantId: 'RES-8819', tenant: 'Dr. Kwame Nkrumah Ansah', unit: '101-A', property: 'Grand Horizon Apartments', 
    start: '2025-05-01', end: '2026-05-01', months: 12, monthlyRent: 12500, amount: '₵ 12,500', 
    serviceChargeMonthly: 1000, commissionFee: 5000, otherCharges: 2000, totalBaseCost: 150000, totalContractValue: 169000,
    status: 'Expiring' 
  },
  { 
    id: 'LS-9002', tenantId: 'RES-8820', tenant: 'Sophia Mensah-Osei', unit: '305-C', property: 'Grand Horizon Apartments', 
    start: '2025-11-15', end: '2026-11-15', months: 12, monthlyRent: 8500, amount: '₵ 8,500', 
    serviceChargeMonthly: 800, commissionFee: 3500, otherCharges: 1500, totalBaseCost: 102000, totalContractValue: 116600,
    status: 'Active' 
  },
  { 
    id: 'LS-9003', tenantId: 'RES-8821', tenant: 'Zerivon Tech / Corporate', unit: 'S-02', property: 'The Peninsula Office Complex', 
    start: '2026-01-01', end: '2027-01-01', months: 12, monthlyRent: 12000, amount: '₵ 12,000', 
    serviceChargeMonthly: 1500, commissionFee: 6000, otherCharges: 2500, totalBaseCost: 144000, totalContractValue: 170500,
    status: 'Active' 
  },
  { 
    id: 'LS-9004', tenantId: 'RES-8823', tenant: 'Grace Amponsah', unit: '108-A', property: 'Riverside Residencies', 
    start: '2025-07-10', end: '2026-07-10', months: 12, monthlyRent: 2200, amount: '₵ 2,200', 
    serviceChargeMonthly: 300, commissionFee: 1000, otherCharges: 500, totalBaseCost: 26400, totalContractValue: 31400,
    status: 'Pending Renewal' 
  },
];

export const getStoredLeases = () => {
  return getLocalData('realtyos_rental_leases', defaultLeases);
};

export const saveStoredLeases = (leases) => {
  saveToSupabaseAndStorage('rental_leases', 'realtyos_rental_leases', leases, 'realtyos_rental_update');
};

// ==========================================
// EXPANDED 13 TABLES MASTER DATA & DEFAULTS
// ==========================================

export const defaultUsers = [
  { id: 'USR-1', name: 'Louis Kemenyo', username: 'louis.kemenyo', pass: 'password', email: 'louis.kemenyo@realtyos.gh', phone: '+233 54 102 9384', role: 'Executive Administrator', department: 'Executive Management', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80', lastLogin: '2026-05-18', securityQuestion: 'What was the name of your first school?', securityAnswer: 'st augustine' },
  { id: 'USR-2', name: 'Sarah Miller', username: 'sarah.miller', pass: 'ManagerSecure88!', email: 'sarah.miller@realtyos.gh', phone: '+233 20 882 1092', role: 'Senior Property Manager', department: 'Sales & Leasing', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80', lastLogin: '2026-05-18', securityQuestion: 'What is your mother\'s maiden name?', securityAnswer: 'johnson' },
  { id: 'USR-3', name: 'Michael K.', username: 'michael.k', pass: 'MaintFlow992!', email: 'michael.k@realtyos.gh', phone: '+233 24 771 2930', role: 'Facility Dispatch Engineer', department: 'Operations & Maintenance', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80', lastLogin: '2026-05-18', securityQuestion: 'What was the name of your childhood best friend?', securityAnswer: 'kweku' },
  { id: 'USR-4', name: 'Sarah Osei', username: 'sarah.osei', pass: 'FinanceVault771!', email: 'sarah.osei@realtyos.gh', phone: '+233 55 901 8823', role: 'Financial Controller', department: 'Finance & Accounts', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80', lastLogin: '2026-05-18', securityQuestion: 'What city were you born in?', securityAnswer: 'kumasi' }
];

export const getStoredUsers = () => {
  const list = getLocalData('realtyos_users_list', defaultUsers);
  return list.map(u => u.username === 'louis.kemenyo' ? { ...u, pass: 'password' } : u);
};
export const saveStoredUsers = (users) => saveToSupabaseAndStorage('users', 'realtyos_users_list', users, 'realtyos_users_update');

export const defaultNotifications = [
  { id: 'n1', title: 'Critical Lease Expiration', desc: 'Penthouse 305-C lease for Sophia Mensah-Osei expires in 14 days.', type: 'alert', time: '10m ago', unread: true },
  { id: 'n2', title: 'Urgent Maintenance Ticket', desc: 'Main Water Line Burst logged at Sunset Luxury Apartments (Unit 104).', type: 'urgent', time: '1h ago', unread: true },
  { id: 'n3', title: 'Rent Payment Received', desc: '₵ 12,500 received from Kwame Mensah (6 Months Advance).', type: 'success', time: '3h ago', unread: true },
  { id: 'n4', title: 'System Cloud Audit Complete', desc: 'Automated daily cloud portfolio ledger snapshot archived successfully.', type: 'info', time: '1d ago', unread: false },
];

export const getStoredNotifications = () => getLocalData('realtyos_notifications', defaultNotifications);
export const saveStoredNotifications = (notifs) => saveToSupabaseAndStorage('notifications', 'realtyos_notifications', notifs, 'realtyos_notifs_update');

const generateIndividualUnits = (prefix, count, defaultPrice, initialSold) => {
  const units = [];
  const numPrice = parseFloat(defaultPrice.replace(/[^0-9.]/g, '')) || 500000;
  for (let i = 1; i <= count; i++) {
    const isSold = i <= initialSold;
    units.push({
      id: `u-${i}`,
      name: `${prefix} ${i}`,
      status: isSold ? 'Sold' : 'Available',
      buyer: isSold ? (i % 2 === 1 ? 'Michael Osei-Mensah' : 'Victoria Kemenyo') : '',
      price: numPrice + ((i - 1) * 5000)
    });
  }
  return units;
};

export const defaultSalesProperties = [
  { 
    id: 1, name: 'Sunset Hills Luxury Villas', location: 'East Legon Hills, Accra', type: 'Housing Project', priceRange: '₵ 850,000', numericPrice: 850000, totalUnits: 30, soldUnits: 18, projectedValue: '₵ 25.5M', status: 'Active Sales', inventory: ['18x 4BR Villas', '12x 5BR Mansions'], individualUnits: generateIndividualUnits('Villa', 30, '₵ 850,000', 18), image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80',
    brochureSpecs: { architecturalStyle: 'Modern Tropical Contemporary', zoning: 'Residential Elite', title: 'Land Title Certificate (99 Yr Lease)', amenities: ['Private Infinity Pool', 'Solar Inverter Included', '24/7 Manned Security Gate', 'Fitted Italian Kitchen'] }
  },
  { 
    id: 2, name: 'Green Valley Eco Estate', location: 'Aburi Mountains, Eastern Region', type: 'Land Development', priceRange: '₵ 120,000', numericPrice: 120000, totalUnits: 80, soldUnits: 68, projectedValue: '₵ 9.6M', status: 'Almost Sold Out', inventory: ['60x Serviced Plots', '20x Commercial Plots', 'Title: Registered Indenture', 'Zoning: Residential'], individualUnits: generateIndividualUnits('Plot', 80, '₵ 120,000', 68), image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80',
    brochureSpecs: { architecturalStyle: 'Serviced Mountain Acreage', zoning: 'Eco-Residential / Boutique Commercial', title: 'Registered Indenture & Cadastral Site Plan', amenities: ['Tarred Road Access', 'Underground Drainage', 'High Elevation Panoramas', 'Borehole Water Grid'] }
  },
  { 
    id: 3, name: 'The Apex Commercial Tower', location: 'Airport City, Accra', type: 'Commercial Tower', priceRange: '₵ 2,500,000', numericPrice: 2500000, totalUnits: 15, soldUnits: 12, projectedValue: '₵ 37.5M', status: 'Active Sales', inventory: ['12x Office Floors', '3x Retail Showrooms'], individualUnits: generateIndividualUnits('Suite', 15, '₵ 2,500,000', 12), image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
    brochureSpecs: { architecturalStyle: 'Glass Neo-Futurist Highrise', zoning: 'Grade-A Commercial Business', title: 'Sub-Lease / Sectional Title', amenities: ['Tri-Zone VRF Air Conditioning', 'Fibre Broadband Lines', 'Underground Vault Parking', 'Helipad Access'] }
  },
  { 
    id: 4, name: 'Palm Breeze Beach Residences', location: 'Prampram, Coastal Strip', type: 'Housing Project', priceRange: '₵ 600,000', numericPrice: 600000, totalUnits: 40, soldUnits: 15, projectedValue: '₵ 24.0M', status: 'Active Sales', inventory: ['25x Beach Cottages', '15x Sea View Villas'], individualUnits: generateIndividualUnits('Cottage', 40, '₵ 600,000', 15), image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
    brochureSpecs: { architecturalStyle: 'Mediterranean Coastal Villa', zoning: 'Tourism / Residential Resort', title: 'Government Stamped Leasehold', amenities: ['Direct Ocean Frontage', 'Clubhouse & Tennis Courts', 'Desalination Water Facility', 'Private Boat Jetty'] }
  }
];

export const getStoredSalesProperties = () => getLocalData('realtyos_sales_properties', defaultSalesProperties);
export const saveStoredSalesProperties = (props) => saveToSupabaseAndStorage('sales_properties', 'realtyos_sales_properties', props, 'realtyos_sales_props_update');

export const defaultSalesDeals = [
  { id: 'SDL-101', pipelineId: 'pl-1', title: 'Villa 14 Acquisition', property: 'Sunset Hills Luxury Villas', unit: 'Villa 14', client: 'Michael Osei-Mensah', clientPhone: '+233 24 888 9999', price: '₵ 850,000', numericPrice: 850000, paymentMode: 'Installment', depositPaid: 250000, remainingBalance: 600000, months: 24, monthlyInstallment: 25000, installmentLogs: [{ date: '14 May 2026', amount: 250000, ref: 'TX-DEP-8841', note: 'Initial 30% Downpayment Deposit via RTGS' }], stage: 'Contract Pending', probability: '90%', agent: 'Louis Kemenyo', agentAvatar: 'https://ui-avatars.com/api/?name=Louis+K&background=00875a&color=fff', type: 'House', date: '14 May 2026', notes: 'Official property sale & structured 24-month installment contract executed.' },
  { id: 'SDL-102', pipelineId: 'pl-3', title: 'Executive Suite Lease & Option', property: 'The Apex Commercial Tower', unit: 'Suite 12-B', client: 'Serwaa Amihere', clientPhone: '+233 20 987 6543', price: '₵ 2,500,000', numericPrice: 2500000, paymentMode: 'Upfront', depositPaid: 2500000, remainingBalance: 0, months: 1, monthlyInstallment: 0, installmentLogs: [{ date: '15 May 2026', amount: 2500000, ref: 'TX-FULL-9901', note: '100% Upfront Wire Transfer Fully Cleared' }], stage: 'Closed Won', probability: '100%', agent: 'Pam Beesly', agentAvatar: 'https://ui-avatars.com/api/?name=Pam+B&background=6366f1&color=fff', type: 'Commercial', date: '15 May 2026', notes: 'Keys transferred and corporate occupancy granted.' },
  { id: 'SDL-103', pipelineId: 'pl-2', title: '4x Serviced Plots Bundle', property: 'Green Valley Eco Estate', unit: 'Plots 40-43', client: 'Kwadwo Asamoah', clientPhone: '+233 55 333 4444', price: '₵ 480,000', numericPrice: 480000, paymentMode: 'Installment', depositPaid: 180000, remainingBalance: 300000, months: 12, monthlyInstallment: 25000, installmentLogs: [{ date: '10 May 2026', amount: 180000, ref: 'TX-DEP-3312', note: 'Initial Land Deposit Paid' }], stage: 'Contract Pending', probability: '95%', agent: 'Phyllis Vance', agentAvatar: 'https://ui-avatars.com/api/?name=Phyllis+V&background=f59e0b&color=fff', type: 'Land', date: '10 May 2026', notes: 'Indenture agreements currently with buyer lawyers for endorsement.' },
  { id: 'SDL-104', pipelineId: 'pl-2', title: 'Beachfront Plot Premium', property: 'Palm Breeze Beach Residences', unit: 'Plot B-07', client: 'David Hammond', clientPhone: '+233 27 777 8888', price: '₵ 600,000', numericPrice: 600000, paymentMode: 'Installment', depositPaid: 150000, remainingBalance: 450000, months: 18, monthlyInstallment: 25000, installmentLogs: [{ date: '16 May 2026', amount: 150000, ref: 'TX-DEP-7700', note: 'Reservation deposit received' }], stage: 'Inquiry', probability: '25%', agent: 'Angela Martin', agentAvatar: 'https://ui-avatars.com/api/?name=Angela+M&background=ec4899&color=fff', type: 'Land', date: '16 May 2026', notes: 'First inquiry received via online portal.' },
  { id: 'SDL-105', pipelineId: 'pl-1', title: 'Penthouse Suite 10B', property: 'Sunset Hills Luxury Villas', unit: 'Penthouse 10B', client: 'Victoria Kemenyo', clientPhone: '+233 24 999 1111', price: '₵ 1,200,000', numericPrice: 1200000, paymentMode: 'Upfront', depositPaid: 1200000, remainingBalance: 0, months: 1, monthlyInstallment: 0, installmentLogs: [{ date: '01 May 2026', amount: 1200000, ref: 'TX-FULL-5544', note: 'Full upfront bank draft deposit' }], stage: 'Closed Won', probability: '100%', agent: 'Louis Kemenyo', agentAvatar: 'https://ui-avatars.com/api/?name=Louis+K&background=10b981&color=fff', type: 'Apartment', date: '01 May 2026', notes: 'Full deposit received and keys handed over.' },
  { id: 'SDL-106', pipelineId: 'pl-3', title: 'Ground Floor Retail Anchor', property: 'The Apex Commercial Tower', unit: 'Retail Space GF-01', client: 'Melcom Superstores', clientPhone: '+233 30 255 5555', price: '₵ 4,200,000', numericPrice: 4200000, paymentMode: 'Installment', depositPaid: 1200000, remainingBalance: 3000000, months: 30, monthlyInstallment: 100000, installmentLogs: [{ date: '14 May 2026', amount: 1200000, ref: 'TX-DEP-9988', note: 'Fit-out commitment deposit' }], stage: 'Negotiation', probability: '75%', agent: 'Louis Kemenyo', agentAvatar: 'https://ui-avatars.com/api/?name=Louis+K&background=10b981&color=fff', type: 'Commercial', date: '14 May 2026', notes: 'Finalizing fit-out grace period and long-term lease terms.' },
  { id: 'SDL-107', pipelineId: 'pl-2', title: 'Serviced Ridge Plot C4', property: 'Green Valley Eco Estate', unit: 'Plot C4', client: 'Dr. Michael Sarpong', clientPhone: '+233 24 888 7777', price: '₵ 550,000', numericPrice: 550000, paymentMode: 'Upfront', depositPaid: 550000, remainingBalance: 0, months: 1, monthlyInstallment: 0, installmentLogs: [{ date: '05 May 2026', amount: 550000, ref: 'TX-FULL-2211', note: 'Direct cash bank deposit fully verified' }], stage: 'Closed Won', probability: '100%', agent: 'Phyllis Vance', agentAvatar: 'https://ui-avatars.com/api/?name=Phyllis+V&background=f59e0b&color=fff', type: 'Land', date: '05 May 2026', notes: 'Deed transferred and land title registered.' },
  { id: 'SDL-108', pipelineId: 'pl-3', title: 'Corporate Office Wing 4A', property: 'The Apex Commercial Tower', unit: 'Wing 4A', client: 'Standard Chartered Bank', clientPhone: '+233 30 222 1111', price: '₵ 3,800,000', numericPrice: 3800000, paymentMode: 'Upfront', depositPaid: 3800000, remainingBalance: 0, months: 1, monthlyInstallment: 0, installmentLogs: [{ date: '28 Apr 2026', amount: 3800000, ref: 'TX-FULL-0012', note: 'Institutional corporate wire cleared' }], stage: 'Closed Won', probability: '100%', agent: 'Louis Kemenyo', agentAvatar: 'https://ui-avatars.com/api/?name=Louis+K&background=10b981&color=fff', type: 'Commercial', date: '28 Apr 2026', notes: '10-year master lease agreement executed.' },
  { id: 'SDL-109', pipelineId: 'pl-1', title: 'Luxury Duplex Villa 2', property: 'Sunset Hills Luxury Villas', unit: 'Duplex Villa 2', client: 'Kojo Antwi', clientPhone: '+233 50 111 2222', price: '₵ 950,000', numericPrice: 950000, paymentMode: 'Installment', depositPaid: 0, remainingBalance: 950000, months: 12, monthlyInstallment: 79166, installmentLogs: [], stage: 'Closed Lost', probability: '0%', agent: 'Angela Martin', agentAvatar: 'https://ui-avatars.com/api/?name=Angela+M&background=ec4899&color=fff', type: 'House', date: '20 Apr 2026', notes: 'Client selected a competing development due to immediate move-in requirement. [Lost Reason: Timeline constraint]' },
  { id: 'SDL-110', pipelineId: 'pl-1', title: 'Garden Apartment 3B Inquiry', property: 'Sunset Hills Luxury Villas', unit: 'Apartment 3B', client: 'Esi Mansah', clientPhone: '+233 20 444 5555', price: '₵ 620,000', numericPrice: 620000, paymentMode: 'Installment', depositPaid: 0, remainingBalance: 620000, months: 18, monthlyInstallment: 34444, installmentLogs: [], stage: 'Inquiry', probability: '30%', agent: 'Louis Kemenyo', agentAvatar: 'https://ui-avatars.com/api/?name=Louis+K&background=10b981&color=fff', type: 'Apartment', date: '16 May 2026', notes: 'Requested brochure and pricing schedule for 2-bedroom units.' },
];

export const getStoredSalesDeals = () => getLocalData('realtyos_sales_deals', defaultSalesDeals);
export const saveStoredSalesDeals = (deals) => saveToSupabaseAndStorage('sales_deals', 'realtyos_sales_deals', deals, 'realtyos_sales_deals_update');

export const defaultMaintenanceTickets = [
  { id: 'MNT-8001', property: 'Sunset Luxury Apartments', unit: 'Unit 104', category: 'Plumbing', title: 'Main Water Line Burst & Pressure Drop', priority: 'Urgent', status: 'In Progress', loggedBy: 'David Wilson', assignedTo: 'QuickFix Plumbing Engineers', estCost: 3500, formattedCost: '₵ 3,500', date: '16 May 2026', notes: 'Emergency shut-off activated. Plumbers currently on site replacing damaged copper valve.' },
  { id: 'MNT-8002', property: 'The Apex Commercial Tower', unit: '12th Floor West Wing', category: 'HVAC', title: 'Central Air Conditioning Compressor Failure', priority: 'High', status: 'Pending Approval', loggedBy: 'Michael K.', assignedTo: 'CoolTech HVAC Ltd', estCost: 18500, formattedCost: '₵ 18,500', date: '15 May 2026', notes: 'Requires replacement of primary coolant coil and system refrigerant recharge.' },
  { id: 'MNT-8003', property: 'Green Valley Estate', unit: 'Villa 14', category: 'Electrical', title: 'Main Breaker Tripping Continuously', priority: 'High', status: 'Assigned', loggedBy: 'Sarah Miller', assignedTo: 'VoltMaster Electricals', estCost: 1200, formattedCost: '₵ 1,200', date: '14 May 2026', notes: 'Tenant reported sparking near kitchen high-voltage outlet. Circuit isolated safely.' },
  { id: 'MNT-8004', property: 'Sunset Luxury Apartments', unit: 'Common Area Penthouse', category: 'Elevator', title: 'Passenger Elevator #2 Door Sensor Glitch', priority: 'Urgent', status: 'Completed', loggedBy: 'Louis Kemenyo', assignedTo: 'Otis Elevator Servicing', estCost: 8500, formattedCost: '₵ 8,500', date: '12 May 2026', notes: 'Optical sensor realigned and recalibrated. Tested under load with zero faults.' },
  { id: 'MNT-8005', property: 'Palm Breeze Residences', unit: 'Poolside Lounge', category: 'Masonry & Tiling', title: 'Cracked Non-Slip Tiles near Deep End', priority: 'Medium', status: 'Completed', loggedBy: 'David Wilson', assignedTo: 'In-house Maintenance Team', estCost: 1800, formattedCost: '₵ 1,800', date: '10 May 2026', notes: 'Hazardous broken ceramic removed and replaced with high-friction quartz composite.' },
  { id: 'MNT-8006', property: 'The Apex Commercial Tower', unit: 'Basement Parking B2', category: 'Security Systems', title: 'CCTV Camera #8 Feed Offline & Static', priority: 'Medium', status: 'In Progress', loggedBy: 'Security Chief', assignedTo: 'Securitas Tech Ops', estCost: 950, formattedCost: '₵ 950', date: '08 May 2026', notes: 'Cat6 Ethernet line severed during cable duct cleaning. Splicing underway.' },
  { id: 'MNT-8007', property: 'Green Valley Estate', unit: 'Perimeter Gate 2', category: 'Carpentry / Structural', title: 'Motorized Gate Hinge Realignment', priority: 'Low', status: 'Pending Approval', loggedBy: 'Sarah Miller', assignedTo: 'Fortress Metalworks', estCost: 2800, formattedCost: '₵ 2,800', date: '05 May 2026', notes: 'Gate dragging against concrete track. Requires heavy welding and hydraulic grease.' }
];

export const getStoredMaintenanceTickets = () => getLocalData('realtyos_maintenance_tickets', defaultMaintenanceTickets);
export const saveStoredMaintenanceTickets = (tickets) => saveToSupabaseAndStorage('maintenance_tickets', 'realtyos_maintenance_tickets', tickets, 'maintenance_tickets_updated');

export const defaultStaffEmployees = [
  { id: 'EMP-K9X2', name: 'Louis Kemenyo', role: 'Portfolio Director', dept: 'Executive Management', rank: 'Executive Staff (Grade 1)', ghanaCardNo: 'GHA-718293819-2', passportPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80', ghanaCardFront: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80', ghanaCardBack: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80', bankName: 'Ecobank Ghana', bankAccName: 'Louis Kemenyo', bankAccNo: '1029384759102', emergencyName: 'Grace Kemenyo (Spouse)', emergencyPhone: '+233 24 111 9021', email: 'louis@realtyos.com', phone: '+233 54 102 9384', salary: 25000, formattedSalary: '₵ 25,000 / mo', contract: 'Permanent Full-time', status: 'Active', joined: '15 Jan 2022', rating: 4.9, daysPresent: 21, daysLate: 0, daysAbsent: 0, daysOnLeave: 0, attendanceRate: '100%', loansCount: 0, sanctionsCount: 0 },
  { id: 'EMP-M4T8', name: 'Sarah Miller', role: 'Head of Leasing', dept: 'Sales & Leasing', rank: 'Senior Staff (Grade 2)', ghanaCardNo: 'GHA-829102938-1', passportPhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80', ghanaCardFront: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80', ghanaCardBack: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80', bankName: 'Stanbic Bank', bankAccName: 'Sarah Miller', bankAccNo: '9012837482910', emergencyName: 'Jonathan Miller (Brother)', emergencyPhone: '+233 20 551 2839', email: 'sarah.m@realtyos.com', phone: '+233 20 882 1092', salary: 14500, formattedSalary: '₵ 14,500 / mo', contract: 'Permanent Full-time', status: 'Active', joined: '01 Mar 2023', rating: 4.8, daysPresent: 19, daysLate: 1, daysAbsent: 0, daysOnLeave: 3, attendanceRate: '98%', loansCount: 1, sanctionsCount: 0 },
  { id: 'EMP-E7R1', name: 'Michael K.', role: 'Chief Facility Engineer', dept: 'Operations & Maintenance', rank: 'Senior Staff (Grade 2)', ghanaCardNo: 'GHA-394810293-5', passportPhoto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80', ghanaCardFront: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80', ghanaCardBack: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80', bankName: 'GCB Bank', bankAccName: 'Michael Kojo Mensah', bankAccNo: '3019283948102', emergencyName: 'Akosua Mensah (Mother)', emergencyPhone: '+233 24 881 2930', email: 'michael.k@realtyos.com', phone: '+233 24 771 2930', salary: 16000, formattedSalary: '₵ 16,000 / mo', contract: 'Permanent Full-time', status: 'Active', joined: '10 Nov 2023', rating: 4.7, daysPresent: 20, daysLate: 1, daysAbsent: 0, daysOnLeave: 0, attendanceRate: '97%', loansCount: 1, sanctionsCount: 0 },
  { id: 'EMP-A2P4', name: 'Sarah Osei', role: 'Senior Portfolio Accountant', dept: 'Finance & Accounts', rank: 'Senior Staff (Grade 2)', ghanaCardNo: 'GHA-582910394-8', passportPhoto: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80', ghanaCardFront: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80', ghanaCardBack: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80', bankName: 'Absa Bank Ghana', bankAccName: 'Sarah Osei', bankAccNo: '4019283749102', emergencyName: 'Kwabena Osei (Father)', emergencyPhone: '+233 55 221 9021', email: 'sarah.o@realtyos.com', phone: '+233 55 901 8823', salary: 12500, formattedSalary: '₵ 12,500 / mo', contract: 'Permanent Full-time', status: 'Active', joined: '15 May 2024', rating: 4.9, daysPresent: 21, daysLate: 0, daysAbsent: 0, daysOnLeave: 0, attendanceRate: '100%', loansCount: 1, sanctionsCount: 0 },
  { id: 'EMP-W8N5', name: 'David Wilson', role: 'Safety & Compliance Chief', dept: 'Compliance & Legal', rank: 'Executive Staff (Grade 1)', ghanaCardNo: 'GHA-492019283-7', passportPhoto: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80', ghanaCardFront: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80', ghanaCardBack: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80', bankName: 'Fidelity Bank', bankAccName: 'David Nii Wilson', bankAccNo: '5019283749102', emergencyName: 'Elizabeth Wilson (Sister)', emergencyPhone: '+233 26 111 8823', email: 'david.w@realtyos.com', phone: '+233 26 441 9021', salary: 13000, formattedSalary: '₵ 13,000 / mo', contract: 'Permanent Full-time', status: 'Active', joined: '05 Jan 2025', rating: 4.6, daysPresent: 18, daysLate: 3, daysAbsent: 0, daysOnLeave: 0, attendanceRate: '94%', loansCount: 0, sanctionsCount: 0 },
  { id: 'EMP-S3Q1', name: 'Kwame Mensah', role: 'Security Detail Lead', dept: 'Security & Surveillance', rank: 'Junior Staff (Grade 3)', ghanaCardNo: 'GHA-102938475-4', passportPhoto: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80', ghanaCardFront: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80', ghanaCardBack: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80', bankName: 'Prudential Bank', bankAccName: 'Kwame Mensah', bankAccNo: '6019283749102', emergencyName: 'Yaa Asantewaa (Wife)', emergencyPhone: '+233 27 551 9021', email: 'kwame.m@realtyos.com', phone: '+233 27 331 9920', salary: 6500, formattedSalary: '₵ 6,500 / mo', contract: 'Annual Contract', status: 'On Leave', joined: '12 Aug 2024', rating: 4.5, daysPresent: 8, daysLate: 0, daysAbsent: 1, daysOnLeave: 12, attendanceRate: '88%', loansCount: 0, sanctionsCount: 1 },
  { id: 'EMP-V9B7', name: 'Victoria Addo', role: 'Client Experience Executive', dept: 'Sales & Leasing', rank: 'Junior Staff (Grade 3)', ghanaCardNo: 'GHA-928374610-9', passportPhoto: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80', ghanaCardFront: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80', ghanaCardBack: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80', bankName: 'Consolidated Bank Ghana', bankAccName: 'Victoria Addo', bankAccNo: '7019283749102', emergencyName: 'George Addo (Husband)', emergencyPhone: '+233 50 221 2839', email: 'vicky.a@realtyos.com', phone: '+233 50 119 2839', salary: 8500, formattedSalary: '₵ 8,500 / mo', contract: 'Annual Contract', status: 'Active', joined: '10 Feb 2026', rating: 4.9, daysPresent: 20, daysLate: 0, daysAbsent: 0, daysOnLeave: 0, attendanceRate: '100%', loansCount: 0, sanctionsCount: 0 },
  { id: 'EMP-T1Z6', name: 'Kofi Antwi', role: 'HVAC Specialist Technician', dept: 'Operations & Maintenance', rank: 'Subcontractor / Temporary', ghanaCardNo: 'GHA-201928374-3', passportPhoto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80', ghanaCardFront: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80', ghanaCardBack: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80', bankName: 'Access Bank Ghana', bankAccName: 'Kofi Antwi', bankAccNo: '8019283749102', emergencyName: 'Kwame Antwi (Brother)', emergencyPhone: '+233 24 331 2839', email: 'kofi.a@realtyos.com', phone: '+233 24 551 2839', salary: 4500, formattedSalary: '₵ 4,500 / mo', contract: 'Contractor', status: 'Active', joined: '01 Apr 2026', rating: 4.1, daysPresent: 15, daysLate: 4, daysAbsent: 1, daysOnLeave: 0, attendanceRate: '78%', loansCount: 0, sanctionsCount: 2 }
];

export const getStoredStaffEmployees = () => getLocalData('realtyos_staff_employees', defaultStaffEmployees);
export const saveStoredStaffEmployees = (emp) => saveToSupabaseAndStorage('staff_employees', 'realtyos_staff_employees', emp, 'realtyos_staff_update');

export const defaultStaffLeaves = [
  { id: 'LV-401', employee: 'Kwame Mensah', type: 'Annual Vacation', startDate: '2026-05-10', endDate: '2026-05-24', formattedDates: '10 May - 24 May 2026', duration: '14 Days', reason: 'Annual statutory rest entitlement.', status: 'Approved', approvedBy: 'Louis Kemenyo' },
  { id: 'LV-402', employee: 'Sarah Miller', type: 'Medical Leave', startDate: '2026-05-02', endDate: '2026-05-05', formattedDates: '02 May - 05 May 2026', duration: '3 Days', reason: 'Dental surgery recovery.', status: 'Approved', approvedBy: 'Louis Kemenyo' },
  { id: 'LV-403', employee: 'Michael K.', type: 'Personal Leave', startDate: '2026-05-28', endDate: '2026-05-30', formattedDates: '28 May - 30 May 2026', duration: '2 Days', reason: 'Family funeral attendance in Kumasi.', status: 'Pending Sign-off', approvedBy: 'Pending' },
  { id: 'LV-404', employee: 'Victoria Addo', type: 'Maternity Leave', startDate: '2026-07-01', endDate: '2026-10-01', formattedDates: '01 Jul - 01 Oct 2026', duration: '90 Days', reason: 'Statutory 3-month maternity leave.', status: 'Pending Sign-off', approvedBy: 'Pending' },
];

export const getStoredStaffLeaves = () => getLocalData('realtyos_staff_leaves', defaultStaffLeaves);
export const saveStoredStaffLeaves = (leaves) => saveToSupabaseAndStorage('staff_leaves', 'realtyos_staff_leaves', leaves, 'realtyos_staff_update');

export const defaultStaffAttendance = [
  { id: 'ATT-301', date: '2026-05-17', formattedDate: '17 May 2026', employee: 'Louis Kemenyo', dept: 'Executive Management', clockIn: '07:45 AM', clockOut: '05:30 PM', shiftHours: '9.75 hrs', status: '🟢 Present (On Time)', location: 'HQ Corporate Plaza', notes: 'Routine check-in.' },
  { id: 'ATT-302', date: '2026-05-17', formattedDate: '17 May 2026', employee: 'Sarah Miller', dept: 'Sales & Leasing', clockIn: '08:00 AM', clockOut: '05:15 PM', shiftHours: '9.25 hrs', status: '🟢 Present (On Time)', location: 'HQ Corporate Plaza', notes: 'Routine check-in.' },
  { id: 'ATT-303', date: '2026-05-17', formattedDate: '17 May 2026', employee: 'Michael K.', dept: 'Operations & Maintenance', clockIn: '07:30 AM', clockOut: '06:00 PM', shiftHours: '10.5 hrs', status: '🟢 Present (On Time)', location: 'Sunset Luxury Site', notes: 'Facility emergency checks.' },
  { id: 'ATT-304', date: '2026-05-17', formattedDate: '17 May 2026', employee: 'Sarah Osei', dept: 'Finance & Accounts', clockIn: '08:14 AM', clockOut: '05:00 PM', shiftHours: '8.75 hrs', status: '🟢 Present (On Time)', location: 'HQ Corporate Plaza', notes: 'Routine check-in.' },
  { id: 'ATT-305', date: '2026-05-17', formattedDate: '17 May 2026', employee: 'David Wilson', dept: 'Compliance & Legal', clockIn: '08:35 AM', clockOut: '04:45 PM', shiftHours: '8.1 hrs', status: '🟡 Present (Late)', location: 'HQ Corporate Plaza', notes: 'Traffic delay on N1 highway.' },
  { id: 'ATT-306', date: '2026-05-17', formattedDate: '17 May 2026', employee: 'Kwame Mensah', dept: 'Security & Surveillance', clockIn: '--:-- --', clockOut: '--:-- --', shiftHours: '0.0 hrs', status: '🏖️ Approved Leave', location: 'Off Duty', notes: 'Automated detection: Statutory Annual Vacation.' },
  { id: 'ATT-307', date: '2026-05-17', formattedDate: '17 May 2026', employee: 'Victoria Addo', dept: 'Sales & Leasing', clockIn: '07:55 AM', clockOut: '05:00 PM', shiftHours: '9.0 hrs', status: '🟢 Present (On Time)', location: 'HQ Corporate Plaza', notes: 'Routine check-in.' },
  { id: 'ATT-308', date: '2026-05-17', formattedDate: '17 May 2026', employee: 'Kofi Antwi', dept: 'Operations & Maintenance', clockIn: '--:-- --', clockOut: '--:-- --', shiftHours: '0.0 hrs', status: '🔴 Unexcused Absent', location: 'No Show', notes: 'Failed to clock in without notification.' },
];

export const getStoredStaffAttendance = () => getLocalData('realtyos_staff_attendance', defaultStaffAttendance);
export const saveStoredStaffAttendance = (att) => saveToSupabaseAndStorage('staff_attendance', 'realtyos_staff_attendance', att, 'realtyos_staff_update');

export const defaultStaffLoans = [
  { id: 'LN-701', employee: 'Michael K.', principal: 25000, formattedPrincipal: '₵ 25,000', term: '18 Months', interestRate: '5.0%', monthlyInstallmentNum: 1458, monthlyInstallment: '₵ 1,458 / mo', remainingBal: 15000, formattedBal: '₵ 15,000', guarantor: 'Louis Kemenyo', purpose: 'Land acquisition in Dodowa', status: 'Active Amortization', dateDisbursed: '10 Jan 2026' },
  { id: 'LN-702', employee: 'Sarah Osei', principal: 12000, formattedPrincipal: '₵ 12,000', term: '12 Months', interestRate: '3.5%', monthlyInstallmentNum: 1035, monthlyInstallment: '₵ 1,035 / mo', remainingBal: 8000, formattedBal: '₵ 8,000', guarantor: 'Louis Kemenyo', purpose: 'Solar battery inverter setup', status: 'Active Amortization', dateDisbursed: '01 Mar 2026' },
];

export const getStoredStaffLoans = () => getLocalData('realtyos_staff_loans', defaultStaffLoans);
export const saveStoredStaffLoans = (loans) => saveToSupabaseAndStorage('staff_loans', 'realtyos_staff_loans', loans, 'realtyos_staff_update');

export const defaultFinancialVouchers = [
  { id: 'TRX-5001', type: 'Income', source: 'Rent', property: 'Sunset Luxury Apartments', category: 'Rent - Unit 302 (6 Months Advance)', amount: 12500, formattedAmount: '₵ 12,500', date: '15 May 2026', status: 'Approved', officer: 'Sarah Osei', payerRecipient: 'Tenant: Kwame Mensah', paymentMethod: 'Bank Transfer', refNo: 'GTB-902184920', notes: 'Unit: #302 | Coverage: May 2026 - Nov 2026 | Full advance rent received.' },
  { id: 'TRX-5002', type: 'Income', source: 'Sales', property: 'Green Valley Estate', category: 'Plot 12 Acquisition (Initial Deposit)', amount: 150000, formattedAmount: '₵ 150,000', date: '14 May 2026', status: 'Approved', officer: 'Louis Kemenyo', payerRecipient: 'Buyer: Dr. Evelyn Addo', paymentMethod: 'Cheque', refNo: 'SCB-8839201', notes: 'Asset: Plot 12 | Initial 30% deposit secured. Sale agreement endorsed.' },
  { id: 'TRX-5003', type: 'Expense', source: 'Maintenance', property: 'The Apex Commercial Tower', category: 'HVAC Central Air Servicing', amount: 8500, formattedAmount: '₵ 8,500', date: '12 May 2026', status: 'Pending', officer: 'Michael K.', payerRecipient: 'Vendor: CoolTech Engineers Ltd', paymentMethod: 'Mobile Money (MoMo)', refNo: 'MOM-774829', notes: 'Service Ref: CT-8829 | Preventative quarterly servicing of 14 AC compressor units.' },
  { id: 'TRX-5004', type: 'Expense', source: 'Payroll', property: 'Corporate HQ', category: 'Executive & Admin Staff Payroll', amount: 45000, formattedAmount: '₵ 45,000', date: '10 May 2026', status: 'Pending', officer: 'Finance Director', payerRecipient: 'Beneficiaries: 18 Active Empl.', paymentMethod: 'Bank Transfer', refNo: 'ACH-BATCH-0526', notes: 'Period: May 2026 | Standard monthly salary disbursements.' },
  { id: 'TRX-5005', type: 'Income', source: 'Rent', property: 'The Apex Commercial Tower', category: 'Ground Floor Retail Store Q2 Rent', amount: 85000, formattedAmount: '₵ 85,000', date: '08 May 2026', status: 'Approved', officer: 'Sarah Osei', payerRecipient: 'Tenant: Melcom Superstores', paymentMethod: 'Bank Transfer', refNo: 'ECO-1102930', notes: 'Unit: Retail Anchor G1 | Coverage: Q2 2026 | Direct wire confirmed.' },
  { id: 'TRX-5006', type: 'Expense', source: 'Utilities', property: 'Sunset Luxury Apartments', category: 'ECG Electricity Common Area Power', amount: 14200, formattedAmount: '₵ 14,200', date: '05 May 2026', status: 'Approved', officer: 'Michael K.', payerRecipient: 'Vendor: ECG Ghana PLC', paymentMethod: 'Bank Transfer', refNo: 'ECG-5510293', notes: 'Monthly high-voltage line billing for exterior floodlights & water booster pumps.' }
];

export const getStoredFinancialVouchers = () => getLocalData('realtyos_financial_vouchers', defaultFinancialVouchers);
export const saveStoredFinancialVouchers = (vouchers) => saveToSupabaseAndStorage('financial_vouchers', 'realtyos_financial_vouchers', vouchers, 'realtyos_finance_update');

export const defaultStaffTasks = [
  { id: 'TSK-9001', title: 'Conduct Full Move-In Inspection & Key Handover', property: 'Sunset Luxury Apartments', unit: 'Penthouse B', assignedTo: 'Sarah Miller', role: 'Leasing Specialist', dueDate: '18 May 2026', priority: 'High', status: 'In Progress', progress: 65, description: 'Meet new VIP tenant Victoria K. on site. Walk through inventory check, test all smart home lighting controls, and issue 3 RFID access fobs.' },
  { id: 'TSK-9002', title: 'Quarterly Fire Safety Audit & Extinguisher Testing', property: 'The Apex Commercial Tower', unit: 'All Floors (1-15)', assignedTo: 'David Wilson', role: 'Safety Compliance Officer', dueDate: '20 May 2026', priority: 'Urgent', status: 'Pending', progress: 0, description: 'Inspect all emergency exit stairwells, verify carbon monoxide sensors, and sign off on fire extinguisher pressure tags for insurance compliance.' },
  { id: 'TSK-9003', title: 'Draft Commercial Lease Agreement Renewal', property: 'The Apex Commercial Tower', unit: 'Anchor Retail Store G1', assignedTo: 'Louis Kemenyo', role: 'Portfolio Director', dueDate: '22 May 2026', priority: 'High', status: 'In Progress', progress: 80, description: 'Review Melcom Superstores 3-year extension terms. Incorporate 8% annual rent escalation clause and update common area maintenance fee schedule.' },
  { id: 'TSK-9004', title: 'Verify Bank Wire Receipt & Issue Receipt Voucher', property: 'Green Valley Estate', unit: 'Plot 12', assignedTo: 'Sarah Osei', role: 'Senior Accountant', dueDate: '16 May 2026', priority: 'Medium', status: 'Completed', progress: 100, description: 'Confirm SCB cheque clearance of ₵150,000 for Dr. Evelyn Addo. Post official transaction voucher to General Ledger.' },
  { id: 'TSK-9005', title: 'Supervise Solar Inverter & Battery Rack Installation', property: 'Palm Breeze Residences', unit: 'Roof Deck Utility Room', assignedTo: 'Michael K.', role: 'Chief Engineer', dueDate: '25 May 2026', priority: 'Medium', status: 'Pending', progress: 10, description: 'Oversee mounting of 20kW hybrid solar inverter and lithium battery backup. Test auto-switchover under grid blackout simulation.' },
  { id: 'TSK-9006', title: 'Publish Monthly Landlord Financial Distribution Report', property: 'Sunset Luxury Apartments', unit: 'Portfolio General', assignedTo: 'Sarah Osei', role: 'Senior Accountant', dueDate: '28 May 2026', priority: 'High', status: 'Pending', progress: 25, description: 'Compile net rental yield statements, deduct property management commission, and schedule ACH payouts to all registered unit investors.' },
  { id: 'TSK-9007', title: 'Landscaping & Tree Trimming Prior to Monsoon', property: 'Green Valley Estate', unit: 'Boulevard & Park 1', assignedTo: 'Kofi Antwi', role: 'Maintenance Technician', dueDate: '14 May 2026', priority: 'Low', status: 'Completed', progress: 100, description: 'Prune overgrown palm fronds near overhead power lines and clear drainage gutters to prevent waterlogging during heavy rain storms.' }
];

export const getStoredStaffTasks = () => getLocalData('realtyos_staff_tasks', defaultStaffTasks);
export const saveStoredStaffTasks = (tasks) => saveToSupabaseAndStorage('staff_tasks', 'realtyos_staff_tasks', tasks, 'realtyos_tasks_update');

export const defaultCrmProspects = [
  { id: 'PR-201', name: 'Michael Osei-Mensah', email: 'm.oseimensah@corporate.com.gh', phone: '+233 24 888 9999', avatar: 'https://ui-avatars.com/api/?name=Michael+O&background=00875a&color=fff', category: 'High Net Worth', budget: '₵ 1,500,000 - ₵ 2,500,000', minBudget: 1500000, interest: 'Sunset Hills Luxury Villas', status: 'Hot Lead', source: 'Diaspora Roadshow', lastInteraction: 'Attended VIP Private Viewing on 14 May', assignedAgent: 'Louis Kemenyo' },
  { id: 'PR-202', name: 'Evelyn Addo-Danquah', email: 'evelyn.danquah@investments.gh', phone: '+233 20 111 2222', avatar: 'https://ui-avatars.com/api/?name=Evelyn+A&background=6366f1&color=fff', category: 'Institutional Investor', budget: '₵ 5,000,000+', minBudget: 5000000, interest: 'The Apex Commercial Tower', status: 'Warm Prospect', source: 'Direct Executive Referral', lastInteraction: 'Requested financial yield analysis & occupancy projections', assignedAgent: 'Pam Beesly' },
  { id: 'PR-203', name: 'Kwadwo Asamoah', email: 'k.asamoah@miningholdings.com', phone: '+233 55 333 4444', avatar: 'https://ui-avatars.com/api/?name=Kwadwo+A&background=f59e0b&color=fff', category: 'VIP Buyer', budget: '₵ 800,000 - ₵ 1,200,000', minBudget: 800000, interest: 'Green Valley Eco Estate (Land)', status: 'Hot Lead', source: 'Website Inquiry', lastInteraction: 'Site inspection completed; requested titled indenture drafts', assignedAgent: 'Dwight Schrute' },
  { id: 'PR-204', name: 'Jessica Tetteh', email: 'jessica.t@designstudio.gh', phone: '+233 27 555 6666', avatar: 'https://ui-avatars.com/api/?name=Jessica+T&background=ec4899&color=fff', category: 'First-Time Buyer', budget: '₵ 450,000 - ₵ 650,000', minBudget: 450000, interest: 'Palm Breeze Beach Residences', status: 'Nurture', source: 'Social Media Campaign', lastInteraction: 'Downloaded digital brochure on 12 May', assignedAgent: 'Phyllis Vance' },
  { id: 'PR-205', name: 'Nana Yaw Boakye', email: 'ny.boakye@kensington.co.uk', phone: '+44 7700 900077', avatar: 'https://ui-avatars.com/api/?name=Nana+Y&background=10b981&color=fff', category: 'Diaspora Buyer', budget: '₵ 2,000,000 - ₵ 3,500,000', minBudget: 2000000, interest: 'Sunset Hills Luxury Villas', status: 'Hot Lead', source: 'London Property Expo', lastInteraction: 'Video conference setup with legal advisor on 15 May', assignedAgent: 'Louis Kemenyo' },
];

export const getStoredCrmProspects = () => getLocalData('realtyos_crm_prospects', defaultCrmProspects);
export const saveStoredCrmProspects = (prospects) => saveToSupabaseAndStorage('crm_prospects', 'realtyos_crm_prospects', prospects, 'realtyos_buyers_update');

export const defaultVaultDocuments = [
  { id: 'DOC-101', name: 'Master_Lease_Agreement_Unit_302.pdf', category: 'Contracts & Leases', property: 'Sunset Luxury Apartments', unit: 'Unit 302', type: 'PDF', size: '3.4 MB', uploadedBy: 'Sarah Miller', date: '15 May 2026', security: 'Classified (Level 2)', status: 'Verified Legal Doc', summary: 'Standard 12-month residential tenancy agreement signed by Kwame Mensah. Includes security deposit escrow clauses.' },
  { id: 'DOC-102', name: 'Architectural_Floor_Plans_Tower_B.pdf', category: 'Blueprints & Schematics', property: 'The Apex Commercial Tower', unit: 'All Floors', type: 'PDF', size: '28.5 MB', uploadedBy: 'Michael K.', date: '12 May 2026', security: 'Restricted (Level 3)', status: 'Verified Blueprint', summary: 'High-resolution CAD exported vector blueprints including load-bearing pillar coordinates and fire evacuation routes.' },
  { id: 'DOC-103', name: 'Municipal_Fire_Safety_Certificate_2026.pdf', category: 'Permits & Certificates', property: 'The Apex Commercial Tower', unit: 'General Facility', type: 'PDF', size: '1.8 MB', uploadedBy: 'David Wilson', date: '10 May 2026', security: 'Public Audit (Level 1)', status: 'Verified Certificate', summary: 'Official municipal safety clearance certificate valid through December 2026 following fire suppression system overhaul.' },
  { id: 'DOC-104', name: 'Plot_12_Title_Deed_Transfer_Registry.pdf', category: 'Deeds & Ownership', property: 'Green Valley Estate', unit: 'Plot 12', type: 'PDF', size: '4.2 MB', uploadedBy: 'Louis Kemenyo', date: '08 May 2026', security: 'Highly Confidential (Level 4)', status: 'Verified Title', summary: 'Original stamped Land Commission title transfer deed for Dr. Evelyn Addo. Registered in central land registry archives.' },
  { id: 'DOC-105', name: 'HVAC_Annual_Maintenance_Contract.docx', category: 'Vendor Agreements', property: 'Sunset Luxury Apartments', unit: 'Portfolio-wide', type: 'DOCX', size: '1.1 MB', uploadedBy: 'Michael K.', date: '04 May 2026', security: 'Classified (Level 2)', status: 'Active Agreement', summary: 'CoolTech Engineers SLA covering bi-monthly filter replacements, compressor inspections, and 24/7 emergency dispatch.' },
  { id: 'DOC-106', name: 'Q1_Portfolio_Tax_Assessment_Return.xlsx', category: 'Financial Records', property: 'Portfolio General HQ', unit: 'Corporate Accounting', type: 'XLSX', size: '6.8 MB', uploadedBy: 'Sarah Osei', date: '02 May 2026', security: 'Confidential (Level 3)', status: 'Audited & Filed', summary: 'Consolidated commercial property tax reconciliation and depreciation schedules submitted to Ghana Revenue Authority.' },
];

export const getStoredVaultDocuments = () => getLocalData('realtyos_vault_documents', defaultVaultDocuments);
export const saveStoredVaultDocuments = (docs) => saveToSupabaseAndStorage('vault_documents', 'realtyos_vault_documents', docs, 'realtyos_docs_update');

export const initCloudSync = async () => {
  await Promise.all([
    syncTableWithStorage('users', 'realtyos_users_list', defaultUsers),
    syncTableWithStorage('notifications', 'realtyos_notifications', defaultNotifications),
    syncTableWithStorage('rental_properties', 'realtyos_rental_properties', defaultRentalProperties).then(() => {
      window.dispatchEvent(new Event('realtyos_rental_update'));
    }),
    syncTableWithStorage('rental_units', 'realtyos_rental_units', defaultRentalUnits).then(() => {
      window.dispatchEvent(new Event('realtyos_rental_update'));
    }),
    syncTableWithStorage('tenants', 'realtyos_tenants', defaultTenants).then(() => {
      window.dispatchEvent(new Event('realtyos_tenants_update'));
    }),
    syncTableWithStorage('rental_leases', 'realtyos_rental_leases', defaultLeases).then(() => {
      window.dispatchEvent(new Event('realtyos_rental_update'));
    }),
    syncTableWithStorage('sales_properties', 'realtyos_sales_properties', defaultSalesProperties).then(() => {
      window.dispatchEvent(new Event('realtyos_sales_props_update'));
    }),
    syncTableWithStorage('sales_deals', 'realtyos_sales_deals', defaultSalesDeals).then(() => {
      window.dispatchEvent(new Event('realtyos_sales_deals_update'));
    }),
    syncTableWithStorage('maintenance_tickets', 'realtyos_maintenance_tickets', defaultMaintenanceTickets).then(() => {
      window.dispatchEvent(new Event('maintenance_tickets_updated'));
    }),
    syncTableWithStorage('staff_employees', 'realtyos_staff_employees', defaultStaffEmployees).then(() => {
      window.dispatchEvent(new Event('realtyos_staff_update'));
    }),
    syncTableWithStorage('staff_leaves', 'realtyos_staff_leaves', defaultStaffLeaves).then(() => {
      window.dispatchEvent(new Event('realtyos_staff_update'));
    }),
    syncTableWithStorage('staff_attendance', 'realtyos_staff_attendance', defaultStaffAttendance).then(() => {
      window.dispatchEvent(new Event('realtyos_staff_update'));
    }),
    syncTableWithStorage('staff_loans', 'realtyos_staff_loans', defaultStaffLoans).then(() => {
      window.dispatchEvent(new Event('realtyos_staff_update'));
    }),
    syncTableWithStorage('financial_vouchers', 'realtyos_financial_vouchers', defaultFinancialVouchers).then(() => {
      window.dispatchEvent(new Event('realtyos_finance_update'));
    }),
    syncTableWithStorage('staff_tasks', 'realtyos_staff_tasks', defaultStaffTasks).then(() => {
      window.dispatchEvent(new Event('realtyos_tasks_update'));
    }),
    syncTableWithStorage('crm_prospects', 'realtyos_crm_prospects', defaultCrmProspects).then(() => {
      window.dispatchEvent(new Event('realtyos_buyers_update'));
    }),
    syncTableWithStorage('vault_documents', 'realtyos_vault_documents', defaultVaultDocuments).then(() => {
      window.dispatchEvent(new Event('realtyos_docs_update'));
    })
  ]);
};
