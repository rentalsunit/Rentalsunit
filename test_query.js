import { createClient } from '@supabase/supabase-js';

const url = 'https://oshvcebnnuisjdmtwttd.supabase.co';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zaHZjZWJubnVpc2pkbXR3dHRkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxNDI4ODcsImV4cCI6MjA5NDcxODg4N30.hTVrUnyyuj6QjdGoCjAzi8e6rBVEZAQ5RrL4x6DyPc4';
const supabase = createClient(url, anonKey);

async function query() {
  const { data, error } = await supabase.from('staff_employees').select('id, name, role, dept, created_at');
  if (error) {
    console.error("Error:", error);
  } else {
    console.log("Current staff employees in Supabase:");
    console.log(data);
  }
}
query();
