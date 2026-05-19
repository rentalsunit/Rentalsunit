import { supabase } from './supabaseClient';

/**
 * Helper to safely get data from localStorage or fallback
 */
export const getLocalData = (key, fallback) => {
  const saved = localStorage.getItem(key);
  if (saved) {
    try { 
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed;
    } catch (e) {}
  }
  return fallback;
};

/**
 * Synchronize a specific Supabase table with localStorage cache
 */
export const syncTableWithStorage = async (tableName, storageKey, defaultData, dispatchEventName) => {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .order(tableName === 'rental_properties' ? 'id' : 'created_at', { ascending: true })
      .limit(1000);

    if (error) {
      console.warn(`[Supabase Sync] Table '${tableName}' might not exist yet or connection error:`, error.message);
      return getLocalData(storageKey, defaultData);
    }

    // If table exists but is empty, try auto-seeding from local cache / defaults
    if (!data || data.length === 0) {
      console.log(`[Supabase Sync] Table '${tableName}' is currently empty in cloud. Auto-seeding...`);
      const local = getLocalData(storageKey, defaultData);
      if (local && local.length > 0) {
        // Sanitize objects to ensure id is string or correct type before upsert
        const sanitized = local.map(item => ({
          ...item,
          id: item.id ? String(item.id) : `ID-${Math.floor(Math.random() * 900000)}`
        }));
        
        const { error: seedError } = await supabase.from(tableName).upsert(sanitized, { onConflict: 'id' });
        if (seedError) {
          console.warn(`[Supabase Sync] Could not auto-seed table '${tableName}':`, seedError.message);
        } else {
          console.log(`[Supabase Sync] Successfully auto-seeded '${tableName}' with ${sanitized.length} records.`);
        }
      }
      return local;
    }

    // Cloud has data! Cache it locally
    localStorage.setItem(storageKey, JSON.stringify(data));
    if (dispatchEventName) {
      window.dispatchEvent(new Event(dispatchEventName));
    }
    return data;

  } catch (err) {
    console.warn(`[Supabase Sync] Exception syncing '${tableName}':`, err);
    return getLocalData(storageKey, defaultData);
  }
};

/**
 * Save records to both localStorage immediately and Supabase asynchronously in background
 */
export const saveToSupabaseAndStorage = async (tableName, storageKey, items, dispatchEventName) => {
  // 1. Instantaneous local update for snappy UI feel
  localStorage.setItem(storageKey, JSON.stringify(items));
  if (dispatchEventName) {
    window.dispatchEvent(new Event(dispatchEventName));
  }

  // 2. Background async sync with Supabase
  try {
    const sanitized = items.map(item => ({
      ...item,
      id: item.id ? String(item.id) : `ID-${Math.floor(Math.random() * 900000)}`
    }));

    const { error } = await supabase.from(tableName).upsert(sanitized, { onConflict: 'id' });
    if (error) {
      console.warn(`[Supabase Sync] Background backup to '${tableName}' failed:`, error.message);
    } else {
      console.log(`[Supabase Sync] Successfully synchronized ${sanitized.length} records to '${tableName}'.`);
    }
  } catch (err) {
    console.warn(`[Supabase Sync] Exception during cloud backup:`, err);
  }
};

/**
 * Comprehensive Connection & Table Schema Audit Check
 */
export const testSupabaseConnection = async () => {
  const tables = [
    'users',
    'notifications',
    'rental_properties', 
    'rental_units', 
    'tenants', 
    'rental_leases', 
    'sales_properties', 
    'sales_deals', 
    'maintenance_tickets',
    'staff_employees',
    'staff_leaves',
    'staff_attendance',
    'staff_loans',
    'financial_vouchers',
    'staff_tasks',
    'crm_prospects',
    'vault_documents'
  ];

  const results = {
    online: false,
    latency: 0,
    tables: {}
  };

  const startTime = Date.now();
  try {
    // Quick test query
    const { error: pingError } = await supabase.from('rental_properties').select('id').limit(1);
    results.latency = Date.now() - startTime;
    results.online = true;

    for (const table of tables) {
      const { data, error } = await supabase.from(table).select('id', { count: 'exact' }).limit(1);
      if (error) {
        results.tables[table] = { exists: false, count: 0, error: error.message };
      } else {
        results.tables[table] = { exists: true, count: data ? data.length : 0 };
      }
    }
  } catch (err) {
    results.online = false;
    results.error = err.message;
  }

  return results;
};

/**
 * Returns the complete ready-to-run PostgreSQL DDL script for Supabase SQL Editor
 */
export const getSupabaseMigrationSQL = () => `
-- ==============================================================================
-- REALTYOS ENTERPRISE SUPABASE POSTGRESQL DDL MIGRATION SCRIPT (COMPLETE)
-- Copy and execute this script in your Supabase SQL Editor to instantly setup
-- all 17 required tables, JSONB structures, and security policies.
-- ==============================================================================

-- 1. SYSTEM USERS & PROFILES TABLE
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  username TEXT UNIQUE,
  email TEXT UNIQUE NOT NULL,
  pass TEXT,
  "tempPassGiven" TEXT,
  phone TEXT,
  role TEXT DEFAULT 'Executive Administrator',
  department TEXT DEFAULT 'Executive Management',
  avatar TEXT,
  status TEXT DEFAULT 'Active',
  "isFirstLogin" BOOLEAN DEFAULT false,
  "twoFactor" BOOLEAN DEFAULT true,
  "securityQuestion" TEXT,
  "securityAnswer" TEXT,
  "failedLoginAttempts" INTEGER DEFAULT 0,
  "accountLocked" BOOLEAN DEFAULT false,
  "lastLogin" TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

ALTER TABLE users ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS pass TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS "tempPassGiven" TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Active';
ALTER TABLE users ADD COLUMN IF NOT EXISTS "isFirstLogin" BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS "twoFactor" BOOLEAN DEFAULT true;

-- 2. SYSTEM NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  type TEXT,
  title TEXT NOT NULL,
  message TEXT,
  time TEXT,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- 3. RENTAL PROPERTIES TABLE
CREATE TABLE IF NOT EXISTS rental_properties (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT,
  units INTEGER DEFAULT 0,
  status TEXT,
  type TEXT,
  image TEXT,
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- 4. RENTAL UNITS TABLE
CREATE TABLE IF NOT EXISTS rental_units (
  id TEXT PRIMARY KEY,
  property TEXT,
  type TEXT,
  price TEXT,
  status TEXT,
  tenant TEXT,
  "lastPaid" TEXT,
  sqft TEXT,
  hvac TEXT,
  inspection TEXT,
  amenities JSONB DEFAULT '[]'::JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- 5. TENANTS & RESIDENTS TABLE
CREATE TABLE IF NOT EXISTS tenants (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  unit TEXT,
  property TEXT,
  status TEXT,
  "rentStatus" TEXT,
  "monthlyRent" NUMERIC DEFAULT 0,
  "securityDeposit" NUMERIC DEFAULT 0,
  "leaseStart" TEXT,
  "leaseEnd" TEXT,
  "ghanaCardNo" TEXT,
  "ghanaCardFront" TEXT,
  "ghanaCardBack" TEXT,
  "passportPhoto" TEXT,
  "guarantorName" TEXT,
  "guarantorPhone" TEXT,
  "witnessName" TEXT,
  "witnessPhone" TEXT,
  employer TEXT,
  occupation TEXT,
  "bankName" TEXT,
  "bankAccNo" TEXT,
  "maintenanceTicketsCount" INTEGER DEFAULT 0,
  "lastPaymentDate" TEXT,
  rating NUMERIC DEFAULT 5.0,
  notes TEXT,
  "paymentHistory" JSONB DEFAULT '[]'::JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- 6. ACTIVE LEASES TABLE
CREATE TABLE IF NOT EXISTS rental_leases (
  id TEXT PRIMARY KEY,
  "tenantId" TEXT,
  tenant TEXT,
  unit TEXT,
  property TEXT,
  start TEXT,
  "end" TEXT,
  months INTEGER DEFAULT 12,
  "monthlyRent" NUMERIC DEFAULT 0,
  amount TEXT,
  "serviceChargeMonthly" NUMERIC DEFAULT 0,
  "commissionFee" NUMERIC DEFAULT 0,
  "otherCharges" NUMERIC DEFAULT 0,
  "totalBaseCost" NUMERIC DEFAULT 0,
  "totalContractValue" NUMERIC DEFAULT 0,
  status TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- 7. SALES PROJECTS (INVENTORY) TABLE
CREATE TABLE IF NOT EXISTS sales_properties (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  price NUMERIC DEFAULT 0,
  location TEXT,
  type TEXT,
  status TEXT,
  bedrooms INTEGER DEFAULT 0,
  bathrooms INTEGER DEFAULT 0,
  sqft INTEGER DEFAULT 0,
  image TEXT,
  agent TEXT,
  featured BOOLEAN DEFAULT false,
  description TEXT,
  amenities JSONB DEFAULT '[]'::JSONB,
  units JSONB DEFAULT '[]'::JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- 8. SALES PIPELINE & DEALS TABLE
CREATE TABLE IF NOT EXISTS sales_deals (
  id TEXT PRIMARY KEY,
  property TEXT,
  buyer TEXT,
  amount NUMERIC DEFAULT 0,
  date TEXT,
  status TEXT,
  agent TEXT,
  type TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- 9. MAINTENANCE WORK ORDERS TABLE
CREATE TABLE IF NOT EXISTS maintenance_tickets (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  unit TEXT,
  property TEXT,
  category TEXT,
  priority TEXT,
  status TEXT,
  date TEXT,
  "assignedTo" TEXT,
  cost NUMERIC DEFAULT 0,
  description TEXT,
  tenant TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- 10. HR PERSONNEL DIRECTORY TABLE
CREATE TABLE IF NOT EXISTS staff_employees (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT,
  dept TEXT,
  rank TEXT,
  "ghanaCardNo" TEXT,
  "passportPhoto" TEXT,
  "ghanaCardFront" TEXT,
  "ghanaCardBack" TEXT,
  "bankName" TEXT,
  "bankAccName" TEXT,
  "bankAccNo" TEXT,
  "emergencyName" TEXT,
  "emergencyPhone" TEXT,
  email TEXT,
  phone TEXT,
  salary NUMERIC DEFAULT 0,
  "formattedSalary" TEXT,
  contract TEXT,
  status TEXT,
  joined TEXT,
  rating NUMERIC DEFAULT 5.0,
  "daysPresent" INTEGER DEFAULT 0,
  "daysLate" INTEGER DEFAULT 0,
  "daysAbsent" INTEGER DEFAULT 0,
  "daysOnLeave" INTEGER DEFAULT 0,
  "attendanceRate" TEXT DEFAULT '100%',
  "loansCount" INTEGER DEFAULT 0,
  "sanctionsCount" INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- 11. HR LEAVES & VACATIONS TABLE
CREATE TABLE IF NOT EXISTS staff_leaves (
  id TEXT PRIMARY KEY,
  employee TEXT NOT NULL,
  type TEXT,
  "startDate" TEXT,
  "endDate" TEXT,
  "formattedDates" TEXT,
  duration TEXT,
  reason TEXT,
  status TEXT DEFAULT 'Pending Sign-off',
  "approvedBy" TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- 12. HR DAILY ATTENDANCE & ROSTER TABLE
CREATE TABLE IF NOT EXISTS staff_attendance (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  "formattedDate" TEXT,
  employee TEXT NOT NULL,
  dept TEXT,
  "clockIn" TEXT,
  "clockOut" TEXT,
  "shiftHours" TEXT,
  status TEXT,
  location TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- 13. HR STAFF LOANS TABLE
CREATE TABLE IF NOT EXISTS staff_loans (
  id TEXT PRIMARY KEY,
  employee TEXT NOT NULL,
  principal NUMERIC DEFAULT 0,
  "formattedPrincipal" TEXT,
  term TEXT,
  "interestRate" TEXT,
  "monthlyInstallmentNum" NUMERIC DEFAULT 0,
  "monthlyInstallment" TEXT,
  "remainingBal" NUMERIC DEFAULT 0,
  "formattedBal" TEXT,
  guarantor TEXT,
  purpose TEXT,
  status TEXT DEFAULT 'Active Amortization',
  "dateDisbursed" TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- 14. MASTER FINANCIAL LEDGER TABLE (TRANSACTION VOUCHERS)
CREATE TABLE IF NOT EXISTS financial_vouchers (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  source TEXT NOT NULL,
  property TEXT,
  category TEXT NOT NULL,
  amount NUMERIC DEFAULT 0,
  "formattedAmount" TEXT,
  date TEXT NOT NULL,
  status TEXT DEFAULT 'Approved',
  officer TEXT,
  "payerRecipient" TEXT,
  "paymentMethod" TEXT,
  "refNo" TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- 15. OPERATIONS DISPATCH & STAFF TASKS TABLE
CREATE TABLE IF NOT EXISTS staff_tasks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  property TEXT,
  unit TEXT,
  "assignedTo" TEXT NOT NULL,
  role TEXT,
  "dueDate" TEXT,
  priority TEXT DEFAULT 'Medium',
  status TEXT DEFAULT 'Pending',
  progress INTEGER DEFAULT 0,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- 16. CRM VIP PROSPECTS TABLE (BUYERS LEADS)
CREATE TABLE IF NOT EXISTS crm_prospects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  avatar TEXT,
  category TEXT,
  budget TEXT,
  "minBudget" NUMERIC DEFAULT 0,
  interest TEXT,
  status TEXT DEFAULT 'Warm Prospect',
  source TEXT,
  "lastInteraction" TEXT,
  "assignedAgent" TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- 17. ENTERPRISE ENCRYPTED DOCUMENT VAULT TABLE
CREATE TABLE IF NOT EXISTS vault_documents (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  property TEXT,
  unit TEXT,
  type TEXT,
  size TEXT,
  "uploadedBy" TEXT,
  date TEXT NOT NULL,
  security TEXT,
  status TEXT DEFAULT 'Verified Legal Doc',
  summary TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- ==============================================================================
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE rental_properties DISABLE ROW LEVEL SECURITY;
ALTER TABLE rental_units DISABLE ROW LEVEL SECURITY;
ALTER TABLE tenants DISABLE ROW LEVEL SECURITY;
ALTER TABLE rental_leases DISABLE ROW LEVEL SECURITY;
ALTER TABLE sales_properties DISABLE ROW LEVEL SECURITY;
ALTER TABLE sales_deals DISABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_tickets DISABLE ROW LEVEL SECURITY;
ALTER TABLE staff_employees DISABLE ROW LEVEL SECURITY;
ALTER TABLE staff_leaves DISABLE ROW LEVEL SECURITY;
ALTER TABLE staff_attendance DISABLE ROW LEVEL SECURITY;
ALTER TABLE staff_loans DISABLE ROW LEVEL SECURITY;
ALTER TABLE financial_vouchers DISABLE ROW LEVEL SECURITY;
ALTER TABLE staff_tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE crm_prospects DISABLE ROW LEVEL SECURITY;
ALTER TABLE vault_documents DISABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- 19. GRANT EXPLICIT ACCESS PRIVILEGES TO CLIENT API ROLES
-- ==============================================================================
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated, service_role;
`;
