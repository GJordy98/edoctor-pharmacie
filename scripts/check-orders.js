import https from 'https';

// Configuration
const HOSTNAME = 'e-doctorpharma.onrender.com';
const PORT = 443;
const CREDENTIALS = {
    telephone: "699001122",
    password: "password123"
};
const PHARMACY_ID = "a832f7cf-c0a2-44c9-92eb-b33671b778af"; // From test-api.js

function request(path, method, body = null, headers = {}) {
    return new Promise((resolve, reject) => {
        const jsonBody = body ? JSON.stringify(body) : null;
        
        const options = {
            hostname: HOSTNAME,
            port: PORT,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json',
                ...(jsonBody && { 'Content-Length': Buffer.byteLength(jsonBody) }),
                ...headers
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const parsed = data ? JSON.parse(data) : {};
                    resolve({ status: res.statusCode, data: parsed, headers: res.headers });
                } catch {
                    resolve({ status: res.statusCode, data: data, headers: res.headers });
                }
            });
        });

        req.on('error', reject);
        if (jsonBody) req.write(jsonBody);
        req.end();
    });
}

async function debugOrders() {
    console.log("--- 1. LOGIN ---");
    const loginRes = await request('/api/v1/login/', 'POST', CREDENTIALS);
    console.log("Login Status:", loginRes.status);
    
    if (loginRes.status !== 200) {
        console.error("Login failed:", loginRes.data);
        return;
    }

    const token = loginRes.data.access;
    console.log("Token obtained.");

    console.log("\n--- 2. GET PENDING ORDERS ---");
    // Verify the URL constructed in ApiClient
    // /api/v1/officine/${pharmacyId}/list-officine-orders-pending/
    const path = `/api/v1/officine/${PHARMACY_ID}/list-officine-orders-pending/`;
    console.log(`Fetching: ${path}`);
    
    const ordersRes = await request(path, 'GET', null, {
        'Authorization': `Bearer ${token}`
    });

    console.log("Orders Status:", ordersRes.status);
    console.log("Orders Headers:", JSON.stringify(ordersRes.headers, null, 2));
    console.log("Orders Body:", JSON.stringify(ordersRes.data, null, 2));
}

debugOrders();
