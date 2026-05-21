import { createClient } from '@supabase/supabase-js';

const url = 'https://oshvcebnnuisjdmtwttd.supabase.co';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zaHZjZWJubnVpc2pkbXR3dHRkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxNDI4ODcsImV4cCI6MjA5NDcxODg4N30.hTVrUnyyuj6QjdGoCjAzi8e6rBVEZAQ5RrL4x6DyPc4';
const supabase = createClient(url, anonKey);

async function run() {
  // Create a 1.2MB base64 string
  const largeBase64 = 'data:image/jpeg;base64,' + 'A'.repeat(1200000);
  
  const testEmployee = {
    id: 'EMP-T-LARGE',
    name: 'Large Photo Employee',
    role: 'HVAC Specialist Technician',
    dept: 'Operations & Maintenance',
    rank: 'Junior Staff (Grade 3)',
    ghanaCardNo: 'GHA-123456789-0',
    passportPhoto: largeBase64,
    ghanaCardFront: null,
    ghanaCardBack: null,
    bankName: null,
    bankAccName: null,
    bankAccNo: null,
    emergencyName: null,
    emergencyPhone: null,
    email: 'large@realtyos.com',
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

  console.log("Attempting to upsert employee with a 1.2MB image...");
  const { data, error } = await supabase
    .from('staff_employees')
    .upsert([testEmployee], { onConflict: 'id' })
    .select('id, name');

  if (error) {
    console.error("Upsert failed:", error);
  } else {
    console.log("Upsert succeeded!", data);
  }
}

run();
