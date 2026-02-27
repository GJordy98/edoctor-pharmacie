const https = require('https');

const HOSTNAME = 'e-doctorpharma.onrender.com';
const PORT = 443;

function fetch(path) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: HOSTNAME,
            port: PORT,
            path: path,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        };

        console.log(`Fetching ${path}...`);
        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                console.log(`Status: ${res.statusCode}`);
                try {
                    const parsed = JSON.parse(data);
                    if (Array.isArray(parsed)) {
                        console.log(`Items found: ${parsed.length}`);
                        if (parsed.length > 0) console.log('First item:', JSON.stringify(parsed[0], null, 2));
                    } else if (parsed.results) {
                        console.log(`Items found (paginated): ${parsed.results.length}`);
                        if (parsed.results.length > 0) console.log('First item:', JSON.stringify(parsed.results[0], null, 2));
                    } else {
                        console.log('Response:', data.substring(0, 500));
                    }
                } catch (e) {
                    console.log('Raw Data:', data.substring(0, 500));
                }
                resolve();
            });
        });
        req.on('error', (e) => {
            console.error(e);
            resolve();
        });
        req.end();
    });
}

async function run() {
    console.log('--- Checking /api/v1/products/ ---');
    await fetch('/api/v1/products/');
    
    // Also check the specific one if we had an ID, but we don't have a known valid one for the user's current session.
    // We'll trust the user's hint for now.
}

run();
