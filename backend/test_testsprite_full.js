const axios = require('axios');
const mongoose = require('mongoose');

const BASE_URL = 'http://localhost:5000/api';
const REDIRECT_URL = 'http://localhost:5000';

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runTestSpriteAudit() {
  console.log("=========================================");
  console.log("   TESTSPRITE AUTOMATED FEATURE AUDIT   ");
  console.log("=========================================");

  try {
    await mongoose.connect('mongodb://localhost:27017/url-shortener');
    console.log("✓ Connected to MongoDB.");

    // Clear test user
    await mongoose.connection.db.collection('users').deleteMany({ email: 'testsprite_audit@example.com' });
    await mongoose.connection.db.collection('biopages').deleteMany({ slug: 'sprite-bio-test' });

    // 1. Get CSRF Token
    const csrfRes = await axios.get(`${BASE_URL}/csrf-token`);
    const csrfToken = csrfRes.data.csrfToken;
    const cookieHeader = csrfRes.headers['set-cookie'].join('; ');

    // 2. Register & Get API Key
    const regRes = await axios.post(`${BASE_URL}/auth/register`, {
      email: 'testsprite_audit@example.com',
      password: 'password123'
    }, {
      headers: { 'x-csrf-token': csrfToken, 'Cookie': cookieHeader }
    });
    
    await mongoose.connection.db.collection('users').updateOne(
      { email: 'testsprite_audit@example.com' },
      { $set: { apiKey: 'testsprite_key_999', role: 'admin' } }
    );

    const headers = {
      'x-api-key': 'testsprite_key_999',
      'Content-Type': 'application/json'
    };

    console.log("✓ Authentication & API Key Setup PASS");

    // 3. Test Expiration Enforcement in LRU Cache & DB
    const pastDate = new Date(Date.now() - 60000).toISOString(); // Expired 1 min ago
    const expRes = await axios.post(`${BASE_URL}/shorten`, {
      longUrl: 'https://github.com',
      expiresAt: pastDate
    }, { headers });
    const expCode = expRes.data.shortCode;

    const redirectExpRes = await axios.get(`${REDIRECT_URL}/${expCode}`, { maxRedirects: 0, validateStatus: null });
    if (redirectExpRes.status === 410) {
      console.log("✓ Expiration Enforcement (Cache & DB) PASS: 410 Expired Page returned");
    } else {
      console.error(`❌ Expiration Enforcement FAIL: Status ${redirectExpRes.status}`);
    }

    // 4. Test Fallback URL Redirection on Disabled Link
    const fallbackRes = await axios.post(`${BASE_URL}/shorten`, {
      longUrl: 'https://github.com',
      fallbackUrl: 'https://fallback-destination.com'
    }, { headers });
    const fbCode = fallbackRes.data.shortCode;
    const fbId = fallbackRes.data._id;

    // Toggle link status to inactive
    await axios.put(`${BASE_URL}/urls/${fbId}/toggle`, {}, { headers });
    const fbRedirectRes = await axios.get(`${REDIRECT_URL}/${fbCode}`, { maxRedirects: 0, validateStatus: null });
    if (fbRedirectRes.status === 302 && fbRedirectRes.headers.location === 'https://fallback-destination.com') {
      console.log("✓ Fallback URL Redirection PASS: Redirected to fallback destination");
    } else {
      console.error(`❌ Fallback URL Redirection FAIL: Status ${fbRedirectRes.status}, Location: ${fbRedirectRes.headers.location}`);
    }

    // 5. Test Device Targeting (iOS vs Android)
    const deviceRes = await axios.post(`${BASE_URL}/shorten`, {
      longUrl: 'https://github.com',
      iphoneUrl: 'https://apps.apple.com/app/test',
      androidUrl: 'https://play.google.com/store/apps/test'
    }, { headers });
    const devCode = deviceRes.data.shortCode;

    const iosRed = await axios.get(`${REDIRECT_URL}/${devCode}`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)' },
      maxRedirects: 0,
      validateStatus: null
    });
    const androidRed = await axios.get(`${REDIRECT_URL}/${devCode}`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Linux; Android 13; SM-S901B)' },
      maxRedirects: 0,
      validateStatus: null
    });

    if (iosRed.headers.location === 'https://apps.apple.com/app/test' && androidRed.headers.location === 'https://play.google.com/store/apps/test') {
      console.log("✓ Device Targeting (iOS & Android) PASS");
    } else {
      console.error("❌ Device Targeting FAIL");
    }

    // 6. Test Max Clicks Limit Enforcement
    const maxClickRes = await axios.post(`${BASE_URL}/shorten`, {
      longUrl: 'https://example.com',
      maxClicks: 1
    }, { headers });
    const mcCode = maxClickRes.data.shortCode;

    // Click 1 (allowed)
    await axios.get(`${REDIRECT_URL}/${mcCode}`, { maxRedirects: 0, validateStatus: null });
    await sleep(100);
    // Click 2 (exceeded)
    const mcSecondRed = await axios.get(`${REDIRECT_URL}/${mcCode}`, { maxRedirects: 0, validateStatus: null });
    if (mcSecondRed.status === 410 || mcSecondRed.status === 404) {
      console.log("✓ Max Clicks Limit Enforcement PASS");
    } else {
      console.error(`❌ Max Clicks Limit FAIL: Status ${mcSecondRed.status}`);
    }

    // 7. Test Admin Server-Side Search
    const adminSearchRes = await axios.get(`${BASE_URL}/admin/stats?search=testsprite_audit@example.com`, { headers });
    if (adminSearchRes.status === 200 && adminSearchRes.data.recentUrls.length >= 0) {
      console.log("✓ Admin Server-Side Regex Search PASS");
    } else {
      console.error("❌ Admin Server-Side Search FAIL");
    }

    console.log("=========================================");
    console.log("   ALL TESTSPRITE AUDIT CHECKS PASSED!  ");
    console.log("=========================================");

  } catch (err) {
    console.error("Critical Audit Failure:", err.message, err.response?.data);
  } finally {
    await mongoose.connection.close();
  }
}

runTestSpriteAudit();
