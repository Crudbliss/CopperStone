const { describe, it, before, after } = require('node:test');
const assert = require('node:assert');
const { spawn } = require('node:child_process');
const path = require('node:path');

const PORT = process.env.TEST_PORT || '3000';
const BASE_URL = `http://127.0.0.1:${PORT}`;
let serverProcess = null;

describe('ISO/IEC 25010 Software Quality Verification Suite', () => {

    before(async () => {
        try {
            const check = await fetch(`${BASE_URL}/api/health`);
            if (check.ok) return; // Server already running
        } catch (e) {}

        // Start server for tests using exact node binary
        serverProcess = spawn(process.execPath, [path.join(__dirname, '..', 'server.js')], {
            env: { ...process.env, PORT: PORT, NODE_ENV: 'test' },
            stdio: 'ignore'
        });

        // Poll for server readiness
        for (let i = 0; i < 25; i++) {
            try {
                const ready = await fetch(`${BASE_URL}/api/health`);
                if (ready.ok) return;
            } catch (err) {
                await new Promise(resolve => setTimeout(resolve, 250));
            }
        }
    });

    after(() => {
        if (serverProcess) {
            serverProcess.kill();
        }
    });

    // 1. Reliability & Availability: Health Check
    describe('1. Reliability & Availability (/api/health)', () => {
        it('should return status healthy with valid uptime and timestamp', async () => {
            const res = await fetch(`${BASE_URL}/api/health`);
            assert.strictEqual(res.status, 200, 'Health endpoint should return HTTP 200');
            const data = await res.json();
            assert.strictEqual(data.status, 'healthy', 'Status must be healthy');
            assert.ok(typeof data.uptime === 'number', 'Uptime must be a number');
            assert.ok(data.timestamp, 'Timestamp must be present');
        });
    });

    // 2. Functional Suitability & Correctness: Dual-Model Architecture
    describe('2. Functional Correctness: Dual-Model Assessment Engine', () => {
        it('should calculate both Model 1 (Relative Profile = 100%) and Model 2 (Independent Mastery)', async () => {
            // Mixed answers array across 28 questions
            const answers = [5,4,5,2,4,5,2,4,5,4,4,2,4,4,5,2,4,5,2,4,4,5,4,2,4,5,4,2];
            
            const res = await fetch(`${BASE_URL}/api/ai/simulate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ answersArray: answers })
            });

            assert.strictEqual(res.status, 200, 'Simulate endpoint should return HTTP 200');
            const data = await res.json();
            assert.strictEqual(data.success, true, 'Result should indicate success');
            
            // Model 1: Profile Breakdown
            assert.ok(data.result.mode, 'Dominant mode must be identified');
            assert.ok(data.result.fuzzy, 'Fuzzy relative profile must be returned');
            
            const p = data.result.fuzzy;
            const profileSum = (p['Hierarchical Individual'] || 0) + 
                               (p['Distributed Individual'] || 0) + 
                               (p['Hierarchical Collective'] || 0) + 
                               (p['Distributed Collective'] || 0);
            
            // Allow minor rounding tolerance (98-102%)
            assert.ok(profileSum >= 98 && profileSum <= 102, `Model 1 profile sum (${profileSum}%) should be ~100%`);

            // Model 2: Independent Quadrant Mastery
            assert.ok(data.result.mastery, 'Independent quadrant mastery must be returned');
            const m = data.result.mastery;
            
            ['Hierarchical Individual', 'Distributed Individual', 'Hierarchical Collective', 'Distributed Collective'].forEach(quad => {
                const val = m[quad];
                assert.ok(typeof val === 'number', `Mastery for ${quad} must be a number`);
                assert.ok(val >= 0 && val <= 100, `Mastery for ${quad} (${val}%) must be between 0% and 100%`);
            });
        });

        it('should handle boundary conditions: all maximum scores (all 5s = 100% mastery)', async () => {
            const allMax = Array(28).fill(5);
            const res = await fetch(`${BASE_URL}/api/ai/simulate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ answersArray: allMax })
            });

            const data = await res.json();
            assert.strictEqual(data.success, true);
            const m = data.result.mastery;
            assert.strictEqual(m['Hierarchical Individual'], 100, 'HI should be 100% on all max');
            assert.strictEqual(m['Distributed Individual'], 100, 'DI should be 100% on all max');
            assert.strictEqual(m['Hierarchical Collective'], 100, 'HC should be 100% on all max');
            assert.strictEqual(m['Distributed Collective'], 100, 'DC should be 100% on all max');
        });

        it('should reject malformed payloads with missing elements', async () => {
            const invalidAnswers = [5, 4, 3]; // Only 3 elements instead of 28
            const res = await fetch(`${BASE_URL}/api/ai/simulate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ answersArray: invalidAnswers })
            });

            assert.strictEqual(res.status, 400, 'Malformed input must return HTTP 400 Bad Request');
        });
    });

    // 3. Security & Input Sanitization
    describe('3. Security & Rate Limiting Verification', () => {
        it('should include HTTP security headers (Helmet)', async () => {
            const res = await fetch(`${BASE_URL}/api/health`);
            const xPoweredBy = res.headers.get('x-powered-by');
            assert.strictEqual(xPoweredBy, null, 'X-Powered-By header should be obscured by Helmet');
            assert.ok(res.headers.get('x-content-type-options'), 'X-Content-Type-Options header must be present');
        });

        it('should reject registration requests with integers/numbers in first or last name', async () => {
            const res1 = await fetch(`${BASE_URL}/api/students/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    first_name: 'John123',
                    last_name: 'Doe',
                    email: 'john123@test.com',
                    password: 'Password123!'
                })
            });
            assert.strictEqual(res1.status, 400, 'Numeric first name should return HTTP 400');
            const data1 = await res1.json();
            assert.ok(data1.error.includes('numbers'), 'Error message should mention numbers');

            const res2 = await fetch(`${BASE_URL}/api/students/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    first_name: 'John',
                    last_name: 'Doe99',
                    email: 'johndoe99@test.com',
                    password: 'Password123!'
                })
            });
            assert.strictEqual(res2.status, 400, 'Numeric last name should return HTTP 400');
            const data2 = await res2.json();
            assert.ok(data2.error.includes('numbers'), 'Error message should mention numbers');
        });

        it('should send 6-digit OTP code and complete student registration', async () => {
            const testEmail = `otp_test_${Date.now()}@student.olfu.edu.ph`;

            // Step 1: Request OTP code
            const otpRes = await fetch(`${BASE_URL}/api/auth/send-registration-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-test-suite': 'true' },
                body: JSON.stringify({ email: testEmail })
            });
            assert.strictEqual(otpRes.status, 200, 'OTP request should succeed');
            const otpData = await otpRes.json();
            assert.strictEqual(otpData.success, true);
            assert.ok(otpData.dev_code, 'Dev code should be provided in test environment');
            assert.strictEqual(otpData.dev_code.length, 6, 'Code must be 6 digits');

            // Step 2: Attempt registration with invalid OTP (should fail)
            const failRes = await fetch(`${BASE_URL}/api/students/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    first_name: 'OtpTest',
                    last_name: 'Student',
                    email: testEmail,
                    password: 'Password123!',
                    otp: '000000'
                })
            });
            assert.strictEqual(failRes.status, 400, 'Incorrect OTP must be rejected');

            // Step 3: Register with valid OTP (should succeed)
            const successRes = await fetch(`${BASE_URL}/api/students/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    first_name: 'OtpTest',
                    last_name: 'Student',
                    email: testEmail,
                    password: 'Password123!',
                    otp: otpData.dev_code
                })
            });
            assert.strictEqual(successRes.status, 201, 'Valid OTP registration should succeed');
            const successData = await successRes.json();
            assert.strictEqual(successData.success, true);
        });

        it('should handle password reset with OTP verification and allow login with new password', async () => {
            const resetEmail = `reset_test_${Date.now()}@student.olfu.edu.ph`;

            // Step 1: Register student first
            const otpReq = await fetch(`${BASE_URL}/api/auth/send-registration-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-test-suite': 'true' },
                body: JSON.stringify({ email: resetEmail })
            });
            const otpReqData = await otpReq.json();

            await fetch(`${BASE_URL}/api/students/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    first_name: 'Reset',
                    last_name: 'Tester',
                    email: resetEmail,
                    password: 'OldPassword123!',
                    otp: otpReqData.dev_code
                })
            });

            // Step 2: Request Password Reset OTP
            const forgotRes = await fetch(`${BASE_URL}/api/auth/send-reset-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-test-suite': 'true' },
                body: JSON.stringify({ email: resetEmail })
            });
            assert.strictEqual(forgotRes.status, 200, 'Forgot password OTP request should succeed');
            const forgotData = await forgotRes.json();
            assert.ok(forgotData.dev_code, 'Reset OTP code should be provided in test mode');

            // Step 3: Attempt reset with wrong OTP (should fail)
            const wrongOtpRes = await fetch(`${BASE_URL}/api/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: resetEmail,
                    otp: '999999',
                    new_password: 'NewBrandPassword123!'
                })
            });
            assert.strictEqual(wrongOtpRes.status, 400, 'Invalid OTP should fail');

            // Step 4: Reset with valid OTP
            const resetSuccess = await fetch(`${BASE_URL}/api/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: resetEmail,
                    otp: forgotData.dev_code,
                    new_password: 'NewBrandPassword123!'
                })
            });
            assert.strictEqual(resetSuccess.status, 200, 'Valid reset should return 200');
            const resetResult = await resetSuccess.json();
            assert.strictEqual(resetResult.success, true);

            // Step 5: Test login with new password
            const loginRes = await fetch(`${BASE_URL}/api/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: resetEmail,
                    password: 'NewBrandPassword123!',
                    requested_role: 'student'
                })
            });
            assert.strictEqual(loginRes.status, 200, 'Login with new password must succeed');
            const loginData = await loginRes.json();
            assert.strictEqual(loginData.success, true);
        });
    });

    // 4. Data Retrieval & History Consistency
    describe('4. Data Retrieval & History Endpoints', () => {
        it('should retrieve student profile with coordinates and mastery columns', async () => {
            const res = await fetch(`${BASE_URL}/api/students/1`);
            assert.strictEqual(res.status, 200, 'Student profile endpoint should return 200');
            const student = await res.json();
            assert.ok(student.id, 'Student id must exist');
            assert.ok(student.first_name, 'Student first name must exist');
            assert.ok(student.learning_mode, 'Student learning mode must exist');
            assert.ok(student.hi_mastery !== undefined, 'hi_mastery column must be present');
            assert.ok(student.di_mastery !== undefined, 'di_mastery column must be present');
            assert.ok(student.hc_mastery !== undefined, 'hc_mastery column must be present');
            assert.ok(student.dc_mastery !== undefined, 'dc_mastery column must be present');
        });

        it('should retrieve student assessment history without schema errors', async () => {
            const res = await fetch(`${BASE_URL}/api/students/1/history`);
            assert.strictEqual(res.status, 200, 'Student history endpoint should return 200');
            const history = await res.json();
            assert.ok(Array.isArray(history), 'History must be an array');
        });
    });
});
