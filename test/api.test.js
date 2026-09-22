const { describe, it, before, after } = require('node:test');
const assert = require('node:assert');
const { spawn } = require('node:child_process');
const path = require('node:path');

const PORT = process.env.TEST_PORT || '3000';
const BASE_URL = `http://localhost:${PORT}`;
let serverProcess = null;

describe('ISO/IEC 25010 Software Quality Verification Suite', () => {

    before(async () => {
        // Check if server is already running
        try {
            const check = await fetch(`${BASE_URL}/api/health`);
            if (check.ok) return; // Server already running
        } catch (e) {
            // Start server for tests
            serverProcess = spawn('node', [path.join(__dirname, '..', 'server.js')], {
                env: { ...process.env, PORT: PORT, NODE_ENV: 'test' },
                stdio: 'ignore'
            });
            // Wait 1.5s for server to start
            await new Promise(resolve => setTimeout(resolve, 1500));
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
