import https from 'https';

const endpoints = [
    '/api/v1/register/',
    '/api/v1/inscription/',
    '/api/v1/signup/',
    '/api/v1/auth/register-officine/',
    '/api/v1/auth/register-pharmacist/',
    '/api/v1/register-pharmacien/'
];

const data = JSON.stringify({
    officine: "a832f7cf-c0a2-44c9-92eb-b33671b778af",
    telephone: "699001122",
    email: "test@gmail.com",
    last_name: "Jean",
    first_name: "Tamo",
    password: "password123"
});

const options = {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

function test(idx) {
    if (idx >= endpoints.length) return;
    const url = `https://e-doctorpharma.onrender.com${endpoints[idx]}`;
    console.log(`Testing ${url}...`);
    const req = https.request(url, options, (res) => {
        console.log(`${endpoints[idx]} -> Status: ${res.statusCode}`);
        res.resume();
        test(idx + 1);
    });
    req.on('error', err => {
        console.error(err.message);
        test(idx + 1);
    });
    req.write(data);
    req.end();
}

test(0);
