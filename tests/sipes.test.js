const request = require('supertest');
const app = require('../src/server');
const Engine = require('../src/engine/sipes');

describe('T(x)Shield Resonance Engine Test Suite', () => {

  beforeEach(() => {
    Engine.reset();
  });

  describe('Subtractive Logic Mathematics & Entropy Metrics', () => {
    test('Calculates perfect veridical score for clean structured data', () => {
      const cleanData = "ENTITY: SOL-998 VECTOR: RESONANCE SOURCE: Hana Maui INTENT: PONO COVENANT";
      const tx = Engine.calculateIntegrity(cleanData);
      expect(tx).toBe(1.0);
    });

    test('Penalizes malformed string indicators and trust-tax placeholders', () => {
      const noisyData = "ENTITY: null, VECTOR: undefined, source: TBD unknown, values: [object]";
      const tx = Engine.calculateIntegrity(noisyData);
      expect(tx).toBeLessThan(0.995);
    });

    test('Ensures math scoring limits are clamped properly between 0 and 1', () => {
      const garbageData = "@#$_-+".repeat(100);
      const tx = Engine.calculateIntegrity(garbageData);
      expect(tx).toBeGreaterThanOrEqual(0.0);
      expect(tx).toBeLessThanOrEqual(1.0);
    });
  });

  describe('Ontological Firewall Integrity Gate', () => {
    test('POST /api/ingest succeeds and returns 200 LIQUID when T(x) >= 0.995', async () => {
      const response = await request(app)
        .post('/api/ingest')
        .send({ data: "Sovereign veridical high-fidelity payload with zero trust taxes or noise." });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe("LIQUID");
      expect(parseFloat(response.body.tx)).toBeGreaterThanOrEqual(0.995);
      expect(response.body.etair).toBeDefined();
    });

    test('POST /api/ingest fails with 422 Unprocessable Entity when T(x) < 0.995', async () => {
      const response = await request(app)
        .post('/api/ingest')
        .send({ data: "High-entropy input: null undefined unknown TBD [object]" });

      expect(response.status).toBe(422);
      expect(response.body.error).toBe("Ontological Integrity Violation");
      expect(response.body.convergenceReport.status).toBe("REJECTED_LOGIC_ROT");
      expect(response.body.rollbackStatus).toBe("Active");
    });

    test('POST /api/ingest fails with 400 when missing the required string payload', async () => {
      const response = await request(app)
        .post('/api/ingest')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toBe("Pono Standard Validation Failed");
    });
  });

  describe('Gumroad v2 Monetization Pipeline & Asset Tokenization', () => {
    test('POST /api/tokenize successfully creates an asset and posts to the GAAP Fiduciary Ledger', async () => {
      const response = await request(app)
        .post('/api/tokenize')
        .send({
          assetName: "Validated Strategic Asset SIA-909",
          value: 49.00
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.product.id).toMatch(/^SAT-SIA-/);
      expect(response.body.ledgerEntry.audit_standard).toBe("ASC-350-40-READY");
      expect(response.body.total_realized_value).toBe(49.00);
    });

    test('POST /api/tokenize defaults to $197 SAT Sovereign Agency Suite and updates TADF countdown', async () => {
      const response = await request(app)
        .post('/api/tokenize')
        .send({});

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.product.id).toMatch(/^SAT-SIA-/);
      expect(response.body.product.price).toBe(197.00);
      expect(response.body.ledgerEntry.audit_standard).toBe("ASC-350-40-READY");
      expect(response.body.total_realized_value).toBe(197.00);
      expect(response.body.tadf_consultations_remaining).toBe(5);
    });

    test('POST /api/biohash performs zero-storage authentication handshake', async () => {
      const response = await request(app)
        .post('/api/biohash')
        .send({ biohashKey: "BIO-TESTKEY-9SM" });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe("AUTHENTICATED");
      expect(response.body.zeroStorage).toBe(true);
      expect(Engine.biohash_active).toBe(true);
    });

    test('POST /api/tokenize validation rejects invalid schema configurations', async () => {
      const response = await request(app)
        .post('/api/tokenize')
        .send({
          value: -100
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe("Tokenization Schema Error");
    });
  });

  describe('Global Telemetry Metrics & Audit Log States', () => {
    test('GET /api/telemetry serves updated real-time logs and realized ledger values', async () => {
      await request(app)
        .post('/api/ingest')
        .send({ data: "Clean sovereign data" });

      await request(app)
        .post('/api/ingest')
        .send({ data: "Bad data: null undefined unknown" });

      await request(app)
        .post('/api/tokenize')
        .send({ assetName: "Test SIA", value: 100 });

      const telemetryRes = await request(app).get('/api/telemetry');
      expect(telemetryRes.status).toBe(200);
      expect(telemetryRes.body.total_realized_value).toBe(100.00);
      expect(telemetryRes.body.fiduciary_ledger.length).toBe(1);
      expect(telemetryRes.body.mcp_logs.some(log => log.action === "TOROIDAL_SHEAR_DETECTION")).toBe(true);
    });
  });

});
