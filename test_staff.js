import { createClient } from '@supabase/supabase-js';

const url = 'https://oshvcebnnuisjdmtwttd.supabase.co';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zaHZjZWJubnVpc2pkbXR3dHRkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxNDI4ODcsImV4cCI6MjA5NDcxODg4N30.hTVrUnyyuj6QjdGoCjAzi8e6rBVEZAQ5RrL4x6DyPc4';
const supabase = createClient(url, anonKey);

async function run() {
  try {
    console.log("1. Testing select * on staff_employees...");
    const { data: selectData, error: selectError } = await supabase
      .from('staff_employees')
      .select('*');
    
    if (selectError) {
      console.error("Select error:", selectError);
    } else {
      console.log(`Select successful! Retreived ${selectData.length} records.`);
      console.log("Current records ids:", selectData.map(e => e.id));
    }

    console.log("\n2. Testing upsert of a custom employee with optional/null fields...");
    const testEmployee = {
      id: 'EMP-T-' + Math.floor(Math.random() * 100000),
      name: 'John Doe',
      role: 'HVAC Specialist Technician',
      dept: 'Operations & Maintenance',
      rank: 'Junior Staff (Grade 3)',
      ghanaCardNo: 'GHA-123456789-0',
      passportPhoto: null,
      ghanaCardFront: null,
      ghanaCardBack: null,
      bankName: null,
      bankAccName: null,
      bankAccNo: null,
      emergencyName: null,
      emergencyPhone: null,
      email: 'john.doe@realtyos.com',
      phone: '+233 24 111 2222',
      salary: 4500,
      formattedSalary: '₵ 4,500 / mo',
      contract: 'Contractor',
      status: 'Active',
      joined: '20 May 2026',
      rating: 4.8,
      daysPresent: 1,
      daysLate: 0,
      daysAbsent: 0,
      daysOnLeave: 0,
      attendanceRate: '100%',
      loansCount: 0,
      sanctionsCount: 0
    };

    const { data: upsertData, error: upsertError } = await supabase
      .from('staff_employees')
      .upsert([testEmployee], { onConflict: 'id' })
      .select();

    if (upsertError) {
      console.error("Upsert failed:", upsertError);
    } else {
      console.log("Upsert succeeded!", upsertData);
    }

  } catch (err) {
    console.error("General Exception:", err);
  }
}

run();
