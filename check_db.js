const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Parse .env.local
const envPath = path.join(__dirname, '.env.local');
let envContent = '';
try {
  envContent = fs.readFileSync(envPath, 'utf8');
} catch (e) {
  console.error("Could not read .env.local:", e.message);
  process.exit(1);
}

const env = {};
envContent.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length >= 2) {
    const key = parts[0].trim();
    const value = parts.slice(1).join('=').trim().replace(/^['"]|['"]$/g, '');
    env[key] = value;
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY || env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Supabase URL or Key missing in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log("=== DIAGNOSING ROOMS AND BOOKINGS ===");
  
  // 1. Fetch room Uji 3
  const { data: rooms, error: roomErr } = await supabase
    .from('kamar')
    .select('*');
  
  if (roomErr) {
    console.error("Error fetching rooms:", roomErr.message);
    return;
  }
  
  const uji3 = rooms.find(r => (r.nama || r.nama_kamar || '').includes('Uji 3') || r.slug === 'uji3');
  if (!uji3) {
    console.log("Room 'Uji 3' not found in DB! Available rooms:");
    rooms.forEach(r => console.log(`- ID: ${r.id}, Name: ${r.nama || r.nama_kamar}, Slug: ${r.slug}, Qty: ${r.jumlah_kamar || r.stok}`));
    return;
  }
  
  console.log("\n[Room Found]");
  console.log(`ID: ${uji3.id}`);
  console.log(`Name: ${uji3.nama || uji3.nama_kamar}`);
  console.log(`Slug: ${uji3.slug}`);
  console.log(`Price: ${uji3.harga_per_malam}`);
  console.log(`Jumlah Kamar (inventory limit): ${uji3.jumlah_kamar}`);
  console.log(`Stok: ${uji3.stok}`);
  console.log(`Is Active: ${uji3.is_active || uji3.status_aktif}`);
  
  // 2. Fetch bookings for this room on 25-26 June 2026
  const { data: bookings, error: bookingErr } = await supabase
    .from('pesanan')
    .select('*')
    .eq('kamar_id', uji3.id);
    
  if (bookingErr) {
    console.error("Error fetching bookings:", bookingErr.message);
    return;
  }
  
  console.log(`\n[Bookings Found for Room Uji 3: ${bookings.length}]`);
  bookings.forEach(b => {
    console.log(`- ID: ${b.id}`);
    console.log(`  Code: ${b.kode_pesanan}`);
    console.log(`  Dates: ${b.check_in || b.tgl_checkin} to ${b.check_out || b.tgl_checkout}`);
    console.log(`  Status (status): ${b.status}`);
    console.log(`  Status Pembayaran (status_pembayaran): ${b.status_pembayaran}`);
    console.log(`  Email: ${b.email}`);
  });
}

run();
