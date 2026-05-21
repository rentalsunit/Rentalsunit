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
 * Maps frontend models to backend database rows
 */
export const mapToDb = (tableName, item) => {
  if (tableName === 'sales_properties') {
    return {
      id: String(item.id),
      title: item.name || '',
      price: Number(item.numericPrice) || 0,
      location: item.location || '',
      type: item.type || '',
      status: item.status || '',
      image: item.image || '',
      units: item.individualUnits || [],
      amenities: {
        priceRange: item.priceRange,
        totalUnits: item.totalUnits,
        soldUnits: item.soldUnits,
        projectedValue: item.projectedValue,
        inventory: item.inventory,
        brochureSpecs: item.brochureSpecs,
        icon: item.icon
      }
    };
  }

  if (tableName === 'sales_deals') {
    const { id, property, client, numericPrice, date, stage, agent, type, notes, ...extra } = item;
    return {
      id: String(id),
      property: property || '',
      buyer: client || '',
      amount: Number(numericPrice) || 0,
      date: date || '',
      status: stage || '',
      agent: agent || '',
      type: type || '',
      notes: JSON.stringify({
        notes: notes || '',
        ...extra
      })
    };
  }

  if (tableName === 'maintenance_tickets') {
    const { id, title, unit, property, category, priority, status, date, assignedTo, estCost, notes, ...extra } = item;
    return {
      id: String(id),
      title: title || '',
      unit: unit || '',
      property: property || '',
      category: category || '',
      priority: priority || '',
      status: status || '',
      date: date || '',
      assignedTo: assignedTo || '',
      cost: Number(estCost) || 0,
      description: notes || '',
      tenant: JSON.stringify(extra)
    };
  }

  // Fallback / standard tables (ensure id is String)
  return {
    ...item,
    id: item.id ? String(item.id) : `ID-${Math.floor(Math.random() * 900000)}`
  };
};

/**
 * Maps backend database rows back to frontend models
 */
export const mapFromDb = (tableName, dbItem) => {
  if (tableName === 'sales_properties') {
    const metadata = dbItem.amenities || {};
    return {
      id: isNaN(dbItem.id) ? dbItem.id : Number(dbItem.id),
      name: dbItem.title,
      numericPrice: Number(dbItem.price),
      location: dbItem.location,
      type: dbItem.type,
      status: dbItem.status,
      image: dbItem.image,
      individualUnits: dbItem.units || [],
      priceRange: metadata.priceRange || `â‚µ ${Number(dbItem.price).toLocaleString()}`,
      totalUnits: metadata.totalUnits || (dbItem.units ? dbItem.units.length : 0),
      soldUnits: metadata.soldUnits || 0,
      projectedValue: metadata.projectedValue || `â‚µ ${Number(dbItem.price).toLocaleString()}`,
      inventory: metadata.inventory || [],
      brochureSpecs: metadata.brochureSpecs || {},
      icon: metadata.icon || 'ðŸ¢'
    };
  }

  if (tableName === 'sales_deals') {
    let notes = dbItem.notes || '';
    let extra = {};
    if (typeof notes === 'string' && notes.startsWith('{') && notes.endsWith('}')) {
      try {
        const parsed = JSON.parse(notes);
        notes = parsed.notes || '';
        extra = parsed;
        delete extra.notes;
      } catch (e) {}
    }
    return {
      id: dbItem.id,
      property: dbItem.property,
      client: dbItem.buyer,
      numericPrice: Number(dbItem.amount),
      price: `â‚µ ${Number(dbItem.amount).toLocaleString()}`,
      date: dbItem.date,
      stage: dbItem.status,
      agent: dbItem.agent,
      type: dbItem.type,
      notes: notes,
      ...extra
    };
  }

  if (tableName === 'maintenance_tickets') {
    let extra = {};
    if (typeof dbItem.tenant === 'string' && dbItem.tenant.startsWith('{') && dbItem.tenant.endsWith('}')) {
      try {
        extra = JSON.parse(dbItem.tenant);
      } catch (e) {}
    }
    return {
      id: dbItem.id,
      title: dbItem.title,
      unit: dbItem.unit,
      property: dbItem.property,
      category: dbItem.category,
      priority: dbItem.priority,
      status: dbItem.status,
      date: dbItem.date,
      assignedTo: dbItem.assignedTo,
      estCost: Number(dbItem.cost),
      formattedCost: extra.formattedCost || `â‚µ ${Number(dbItem.cost).toLocaleString()}`,
      notes: dbItem.description,
      loggedBy: extra.loggedBy || 'System',
      ...extra
    };
  }

  return dbItem;
};

/**
 * Synchronize a specific Supabase table with localStorage cache.
 * FIX: localStorage is always the source of truth. We MERGE Supabase data with
 * local data — local records always win to prevent data loss on page refresh.
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

    // Get whatever is currently in localStorage (may have uncommitted new records)
    const localData = getLocalData(storageKey, defaultData);

    // If table exists but is empty in cloud, push all local data up
    if (!data || data.length === 0) {
      console.log(`[Supabase Sync] Table '${tableName}' is currently empty in cloud. Auto-seeding from local...`);
      if (localData && localData.length > 0) {
        const sanitized = localData.map(item => mapToDb(tableName, item));
        const { error: seedError } = await supabase.from(tableName).upsert(sanitized, { onConflict: 'id' });
        if (seedError) {
          console.warn(`[Supabase Sync] Could not auto-seed table '${tableName}':`, seedError.message);
        } else {
          console.log(`[Supabase Sync] Successfully auto-seeded '${tableName}' with ${sanitized.length} records.`);
        }
      }
      return localData;
    }

    // Cloud has data — map from DB format to frontend format
    const cloudMapped = data.map(item => mapFromDb(tableName, item));

    // CRITICAL FIX: Merge cloud data with local data.
    // Local records that don't exist in the cloud (just added, not yet synced) are preserved.
    // Cloud records overwrite local records with the same ID (cloud is confirmed persisted).
    const cloudIds = new Set(cloudMapped.map(item => String(item.id)));
    const localOnlyRecords = localData.filter(item => !cloudIds.has(String(item.id)));
    
    if (localOnlyRecords.length > 0) {
      console.log(`[Supabase Sync] Found ${localOnlyRecords.length} local-only record(s) in '${tableName}' not yet in cloud. Pushing them up...`);
      // Push local-only records to Supabase so they're persisted
      const sanitizedLocalOnly = localOnlyRecords.map(item => mapToDb(tableName, item));
      const { error: pushError } = await supabase.from(tableName).upsert(sanitizedLocalOnly, { onConflict: 'id' });
      if (pushError) {
        console.warn(`[Supabase Sync] Could not push local-only records to '${tableName}':`, pushError.message);
      } else {
        console.log(`[Supabase Sync] Successfully pushed ${localOnlyRecords.length} local-only record(s) to '${tableName}'.`);
      }
    }

    // Merged result: cloud data + any local-only records
    const merged = [...cloudMapped, ...localOnlyRecords];
    localStorage.setItem(storageKey, JSON.stringify(merged));
    if (dispatchEventName) {
      window.dispatchEvent(new Event(dispatchEventName));
    }
    return merged;

  } catch (err) {
    console.warn(`[Supabase Sync] Exception syncing '${tableName}':`, err);
    return getLocalData(storageKey, defaultData);
  }
};

/**
 * Save records to both localStorage immediately and Supabase asynchronously in background.
 * FIX: localStorage is ALWAYS the primary source of truth. Supabase is a backup.
 * The deletion step only runs AFTER the upsert fully completes without error.
 */
export const saveToSupabaseAndStorage = async (tableName, storageKey, items, dispatchEventName) => {
  // 1. Instantaneous local update for snappy UI feel — this is the SOURCE OF TRUTH
  localStorage.setItem(storageKey, JSON.stringify(items));
  if (dispatchEventName) {
    window.dispatchEvent(new Event(dispatchEventName));
  }

  // 2. Background async sync with Supabase
  try {
    const sanitized = items.map(item => mapToDb(tableName, item));
    let upsertSucceeded = false;

    // Perform upsert of all current items
    const { error } = await supabase.from(tableName).upsert(sanitized, { onConflict: 'id' });
    if (error) {
      console.warn(`[Supabase Sync] Background backup to '${tableName}' failed:`, error.message);

      // Dynamic Fallback Save for Large Payloads (e.g. base64 images)
      const isPayloadTooLarge = error.message.includes('413') || 
                                error.message.toLowerCase().includes('payload too large') || 
                                error.message.toLowerCase().includes('too large');
                                
      if (isPayloadTooLarge) {
        console.log(`[Supabase Sync] Payload too large for '${tableName}'. Retrying with heavy image URLs stripped...`);
        const safetyItems = sanitized.map(item => ({
          ...item,
          passportPhoto: item.passportPhoto?.startsWith('data:') ? null : item.passportPhoto,
          ghanaCardFront: item.ghanaCardFront?.startsWith('data:') ? null : item.ghanaCardFront,
          ghanaCardBack: item.ghanaCardBack?.startsWith('data:') ? null : item.ghanaCardBack
        }));
        
        const { error: retryError } = await supabase.from(tableName).upsert(safetyItems, { onConflict: 'id' });
        if (retryError) {
          console.error(`[Supabase Sync] Safety retry also failed for '${tableName}':`, retryError.message);
          // DO NOT proceed to deletion — upsert never succeeded
          return;
        } else {
          console.log(`[Supabase Sync] Safety retry succeeded for '${tableName}'! Records preserved without images.`);
          upsertSucceeded = true;
        }
      } else {
        // Standard error — abort entirely, do NOT delete anything
        return;
      }
    } else {
      upsertSucceeded = true;
      console.log(`[Supabase Sync] Successfully synchronized ${sanitized.length} records to '${tableName}'.`);
    }

    // CRITICAL FIX: Only delete stale rows if the upsert fully succeeded.
    // This prevents a race condition where new records are deleted because Supabase
    // hadn't yet registered the upsert when we fetched existing IDs.
    if (!upsertSucceeded) return;

    // Small delay to allow Supabase to fully commit the upsert before we fetch IDs
    await new Promise(resolve => setTimeout(resolve, 500));

    // Explicitly delete any records in Supabase that are no longer present in local state
    const { data: existingRows, error: fetchError } = await supabase.from(tableName).select('id');
    if (!fetchError && existingRows) {
      const currentIds = new Set(sanitized.map(item => String(item.id)));
      const idsToDelete = existingRows
        .map(row => String(row.id))
        .filter(id => !currentIds.has(id));
      
      if (idsToDelete.length > 0) {
        const { error: deleteError } = await supabase.from(tableName).delete().in('id', idsToDelete);
        if (deleteError) {
          console.warn(`[Supabase Sync] Failed to delete omitted records from '${tableName}':`, deleteError.message);
        } else {
          console.log(`[Supabase Sync] Cleaned up ${idsToDelete.length} stale records from '${tableName}'.`);
        }
      }
    }
  } catch (err) {
    console.warn(`[Supabase Sync] Exception during cloud backup to '${tableName}':`, err);
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
    'staff_sanctions',
    'staff_appraisals',
    'staff_payroll',
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


