import { mapToDb, mapFromDb } from './src/lib/supabaseSync.js';
import { supabase } from './src/lib/supabaseClient.js';

async function testRoundtrip() {
  console.log('=== STARTING SUPABASE SCHEMA MAPPER ROUNDTRIP TEST ===\n');

  // --- 1. Test sales_properties ---
  console.log('--- 1. Testing sales_properties ---');
  const originalProperty = {
    id: 'test-prop-999',
    name: 'Sunset Hills Luxury Penthouse',
    numericPrice: 2450000,
    location: 'Airport Residential, Accra',
    type: 'Penthouse',
    status: 'Available',
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00',
    individualUnits: [{ unitNo: 'P-1', status: 'Available' }],
    priceRange: '₵ 2.4M - 2.5M',
    totalUnits: 1,
    soldUnits: 0,
    projectedValue: '₵ 2,450,000',
    inventory: ['P-1'],
    brochureSpecs: { size: '450 sqm', beds: 4 },
    icon: '🏢'
  };

  const dbProperty = mapToDb('sales_properties', originalProperty);
  console.log('Mapped to DB format (sales_properties):');
  console.log(JSON.stringify(dbProperty, null, 2));

  // Perform upsert
  const { error: propErr } = await supabase.from('sales_properties').upsert([dbProperty], { onConflict: 'id' });
  if (propErr) {
    console.error('❌ sales_properties Upsert Failed:', propErr.message);
  } else {
    console.log('✅ sales_properties Upsert Success!');
  }

  // Fetch back
  const { data: fetchedPropData, error: propFetchErr } = await supabase
    .from('sales_properties')
    .select('*')
    .eq('id', 'test-prop-999')
    .single();

  if (propFetchErr) {
    console.error('❌ sales_properties Fetch Failed:', propFetchErr.message);
  } else {
    console.log('✅ sales_properties Fetch Success!');
    const roundtripProperty = mapFromDb('sales_properties', fetchedPropData);
    console.log('Mapped back to Frontend format:');
    console.log(JSON.stringify(roundtripProperty, null, 2));

    // Verify key fields match
    const propMatched = 
      roundtripProperty.name === originalProperty.name &&
      roundtripProperty.numericPrice === originalProperty.numericPrice &&
      roundtripProperty.totalUnits === originalProperty.totalUnits &&
      JSON.stringify(roundtripProperty.individualUnits) === JSON.stringify(originalProperty.individualUnits);
    
    if (propMatched) {
      console.log('🎉 sales_properties roundtrip matches original frontend object!');
    } else {
      console.warn('⚠️ sales_properties roundtrip fields did not match perfectly.');
    }
  }

  // --- 2. Test sales_deals ---
  console.log('\n--- 2. Testing sales_deals ---');
  const originalDeal = {
    id: 'test-deal-999',
    property: 'Sunset Hills Luxury Penthouse',
    client: 'Aliko Dangote',
    numericPrice: 2400000,
    date: '2026-05-20',
    stage: 'In Escrow',
    agent: 'Louis Kemenyo',
    type: 'Outright Purchase',
    notes: 'Premium buyer requesting quick closure.',
    probability: 95,
    installmentLogs: [{ date: '2026-05-20', amount: 1200000 }]
  };

  const dbDeal = mapToDb('sales_deals', originalDeal);
  console.log('Mapped to DB format (sales_deals):');
  console.log(JSON.stringify(dbDeal, null, 2));

  // Perform upsert
  const { error: dealErr } = await supabase.from('sales_deals').upsert([dbDeal], { onConflict: 'id' }).select();
  if (dealErr) {
    console.error('❌ sales_deals Upsert Failed:', dealErr.message);
  } else {
    console.log('✅ sales_deals Upsert Success!');
  }

  // Fetch back
  const { data: fetchedDealData, error: dealFetchErr } = await supabase
    .from('sales_deals')
    .select('*')
    .eq('id', 'test-deal-999')
    .single();

  if (dealFetchErr) {
    console.error('❌ sales_deals Fetch Failed:', dealFetchErr.message);
  } else {
    console.log('✅ sales_deals Fetch Success!');
    const roundtripDeal = mapFromDb('sales_deals', fetchedDealData);
    console.log('Mapped back to Frontend format:');
    console.log(JSON.stringify(roundtripDeal, null, 2));

    const dealMatched = 
      roundtripDeal.client === originalDeal.client &&
      roundtripDeal.numericPrice === originalDeal.numericPrice &&
      roundtripDeal.stage === originalDeal.stage &&
      roundtripDeal.notes === originalDeal.notes &&
      roundtripDeal.probability === originalDeal.probability;

    if (dealMatched) {
      console.log('🎉 sales_deals roundtrip matches original frontend object!');
    } else {
      console.warn('⚠️ sales_deals roundtrip fields did not match perfectly.');
    }
  }

  // --- 3. Test maintenance_tickets ---
  console.log('\n--- 3. Testing maintenance_tickets ---');
  const originalTicket = {
    id: 'test-ticket-999',
    title: 'AC Compressor Replacement',
    unit: 'Penthouse P-1',
    property: 'Sunset Hills Luxury Penthouse',
    category: 'HVAC',
    priority: 'Emergency',
    status: 'In Progress',
    date: '2026-05-20',
    assignedTo: 'CoolTech Engineers',
    estCost: 1500,
    notes: 'Compressor burnt due to power surge. Needs stabilizer.',
    loggedBy: 'Dr. Kwame Nkrumah Ansah',
    formattedCost: '₵ 1,500.00',
    additionalDetails: 'Requires scaffold access'
  };

  const dbTicket = mapToDb('maintenance_tickets', originalTicket);
  console.log('Mapped to DB format (maintenance_tickets):');
  console.log(JSON.stringify(dbTicket, null, 2));

  // Perform upsert
  const { error: ticketErr } = await supabase.from('maintenance_tickets').upsert([dbTicket], { onConflict: 'id' }).select();
  if (ticketErr) {
    console.error('❌ maintenance_tickets Upsert Failed:', ticketErr.message);
  } else {
    console.log('✅ maintenance_tickets Upsert Success!');
  }

  // Fetch back
  const { data: fetchedTicketData, error: ticketFetchErr } = await supabase
    .from('maintenance_tickets')
    .select('*')
    .eq('id', 'test-ticket-999')
    .single();

  if (ticketFetchErr) {
    console.error('❌ maintenance_tickets Fetch Failed:', ticketFetchErr.message);
  } else {
    console.log('✅ maintenance_tickets Fetch Success!');
    const roundtripTicket = mapFromDb('maintenance_tickets', fetchedTicketData);
    console.log('Mapped back to Frontend format:');
    console.log(JSON.stringify(roundtripTicket, null, 2));

    const ticketMatched = 
      roundtripTicket.title === originalTicket.title &&
      roundtripTicket.estCost === originalTicket.estCost &&
      roundtripTicket.notes === originalTicket.notes &&
      roundtripTicket.loggedBy === originalTicket.loggedBy &&
      roundtripTicket.additionalDetails === originalTicket.additionalDetails;

    if (ticketMatched) {
      console.log('🎉 maintenance_tickets roundtrip matches original frontend object!');
    } else {
      console.warn('⚠️ maintenance_tickets roundtrip fields did not match perfectly.');
    }
  }

  // Clean up
  console.log('\n--- Cleaning up test records ---');
  await supabase.from('sales_properties').delete().eq('id', 'test-prop-999');
  await supabase.from('sales_deals').delete().eq('id', 'test-deal-999');
  await supabase.from('maintenance_tickets').delete().eq('id', 'test-ticket-999');
  console.log('✅ Cleanup completed.');

  console.log('\n=== SCHEMA MAPPER ROUNDTRIP TEST FINISHED ===');
}

testRoundtrip().catch(console.error);
