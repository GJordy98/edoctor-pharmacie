/**
 * Script pour inspecter la structure retournée par /items-order/
 * Usage: node scripts/check-order-items.js <ACCESS_TOKEN> <ORDER_ID>
 * 
 * Exemple:
 *   node scripts/check-order-items.js eyJ0eXAiOi... e9cff7ff-9924-408a-9188-b06cafc5cdd3
 */
import https from 'https';

const HOSTNAME = 'e-doctorpharma.onrender.com';
const PORT = 443;

const TOKEN = process.argv[2];
const ORDER_ID = process.argv[3];

if (!TOKEN || !ORDER_ID) {
    console.error('Usage: node scripts/check-order-items.js <ACCESS_TOKEN> <ORDER_ID>');
    process.exit(1);
}

function fetchWithAuth(path) {
    return new Promise((resolve) => {
        const options = {
            hostname: HOSTNAME,
            port: PORT,
            path: path,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${TOKEN}`
            }
        };

        console.log(`\n=== GET https://${HOSTNAME}${path} ===`);
        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                console.log(`Status: ${res.statusCode}`);
                try {
                    const parsed = JSON.parse(data);
                    console.log('Response:', JSON.stringify(parsed, null, 2));
                } catch {
                    console.log('Raw data:', data.substring(0, 1000));
                }
                resolve();
            });
        });
        req.on('error', (e) => { console.error(e); resolve(); });
        req.end();
    });
}

async function run() {
    // Récupère les items de la commande
    await fetchWithAuth(`/api/v1/officine-order/${ORDER_ID}/items-order/`);

    // Récupère aussi les sub-order-items pour comparer
    console.log('\n=== Checking sub-order-item-officine/ (tous les sub items) ===');
    await fetchWithAuth(`/api/v1/sub-order-item-officine/`);
}

run();
