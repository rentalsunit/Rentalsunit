import { testSupabaseConnection } from './src/lib/supabaseSync.js';

async function run() {
  try {
    console.log("Testing complete Supabase connection & table audit...");
    const audit = await testSupabaseConnection();
    console.log("Audit Results:", JSON.stringify(audit, null, 2));
  } catch (err) {
    console.error("Exceptions:", err);
  }
}

run();
