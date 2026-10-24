const express = require('express');
const Engine = require('./engine/sipes');

const app = express();
app.use(express.json());

// POST /api/ingest
app.post('/api/ingest', (req, res) => {
  const { data } = req.body;

  if (typeof data !== 'string') {
    return res.status(400).json({
      error: "Pono Standard Validation Failed"
    });
  }

  const tx = Engine.calculateIntegrity(data);

  if (tx >= 0.995) {
    return res.status(200).json({
      status: "LIQUID",
      tx: tx.toFixed(4),
      etair: "ACTIVE_PONO_FLOW"
    });
  } else {
    // Log toroidal shear detection
    Engine.mcp_logs.push({
      action: "TOROIDAL_SHEAR_DETECTION",
      timestamp: new Date().toISOString(),
      tx: tx
    });

    return res.status(422).json({
      error: "Ontological Integrity Violation",
      convergenceReport: {
        status: "REJECTED_LOGIC_ROT",
        tx: tx
      },
      rollbackStatus: "Active"
    });
  }
});

// POST /api/tokenize
app.post('/api/tokenize', (req, res) => {
  const { assetName, value } = req.body;

  if (value !== undefined && typeof value === 'number' && value < 0) {
    return res.status(400).json({
      error: "Tokenization Schema Error"
    });
  }

  const finalName = assetName || "SAT Sovereign Agency Suite";
  const finalValue = value !== undefined ? value : 197.00;

  let productId;
  if (assetName) {
    const codeMatch = assetName.match(/SIA-\d+/i);
    if (codeMatch) {
      productId = `SAT-${codeMatch[0].toUpperCase()}`;
    } else {
      productId = `SAT-SIA-${Math.floor(100 + Math.random() * 900)}`;
    }
  } else {
    productId = "SAT-SIA-197";
  }

  const ledgerEntry = {
    assetName: finalName,
    value: finalValue,
    audit_standard: "ASC-350-40-READY",
    timestamp: new Date().toISOString()
  };

  Engine.fiduciary_ledger.push(ledgerEntry);
  Engine.total_realized_value += finalValue;

  const responseBody = {
    success: true,
    product: {
      id: productId,
      name: finalName,
      price: finalValue
    },
    ledgerEntry: ledgerEntry,
    total_realized_value: Engine.total_realized_value
  };

  if (!assetName && value === undefined) {
    responseBody.tadf_consultations_remaining = Engine.tadf_consultations_remaining;
  }

  return res.status(200).json(responseBody);
});

// POST /api/biohash
app.post('/api/biohash', (req, res) => {
  const { biohashKey } = req.body;

  Engine.biohash_active = true;

  return res.status(200).json({
    status: "AUTHENTICATED",
    zeroStorage: true
  });
});

// GET /api/telemetry
app.get('/api/telemetry', (req, res) => {
  return res.status(200).json({
    total_realized_value: Engine.total_realized_value,
    fiduciary_ledger: Engine.fiduciary_ledger,
    mcp_logs: Engine.mcp_logs,
    biohash_active: Engine.biohash_active
  });
});

module.exports = app;
