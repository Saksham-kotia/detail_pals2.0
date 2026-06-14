const fs = require('fs');
const path = require('path');

// Parse env
const envPath = path.join(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    let value = match[2] || '';
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
    if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
    env[match[1]] = value;
  }
});

const url = `${env['VITE_SUPABASE_URL']}/rest/v1/`;
const key = env['SUPABASE_SERVICE_ROLE_KEY'] || env['VITE_SUPABASE_ANON_KEY'];

console.log('Fetching OpenAPI schema from:', url);
fetch(url, {
  headers: {
    'apikey': key,
    'Authorization': `Bearer ${key}`
  }
})
.then(res => res.json())
.then(data => {
  console.log('\n--- Paths / RPCs ---');
  const paths = Object.keys(data.paths || {});
  const rpcs = paths.filter(p => p.startsWith('/rpc/'));
  console.log('Total RPCs found:', rpcs.length);
  console.log('RPC list:', rpcs);
})
.catch(err => {
  console.error('Error fetching schema:', err);
});
