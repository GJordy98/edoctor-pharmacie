import https from 'https';

const endpoints = ['/api/v1/units/', '/api/v1/categories/', '/api/v1/galenics/'];

function fetchEndpoint(index) {
    if (index >= endpoints.length) return;
    
    const path = endpoints[index];
    const options = {
        hostname: 'e-doctorpharma.onrender.com',
        port: 443,
        path: path,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    };

    console.log(`\n--- FETCHING ${path} ---`);
    const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
            try {
                const parsed = JSON.parse(data);
                // Log first item to see structure
                if (Array.isArray(parsed) && parsed.length > 0) {
                    console.log(JSON.stringify(parsed[0], null, 2));
                } else if (parsed.results && Array.isArray(parsed.results) && parsed.results.length > 0) {
                     console.log(JSON.stringify(parsed.results[0], null, 2));
                } else {
                    console.log("Empty or unknown structure:", JSON.stringify(parsed).substring(0, 200));
                }
            } catch {
                console.log("Error parsing JSON");
            }
            fetchEndpoint(index + 1);
        });
    });
    req.on('error', (err) => { console.error(err); fetchEndpoint(index + 1); });
    req.end();
}

fetchEndpoint(0);
