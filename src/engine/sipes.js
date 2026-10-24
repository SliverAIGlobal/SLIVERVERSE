class EngineSingleton {
  constructor() {
    this.reset();
  }

  reset() {
    this.biohash_active = false;
    this.fiduciary_ledger = [];
    this.mcp_logs = [];
    this.total_realized_value = 0.0;
    this.tadf_consultations_remaining = 5;
  }

  calculateIntegrity(data) {
    if (typeof data !== 'string' || !data) return 0.0;

    // Check for explicit noise indicators / trust taxes
    const noiseRegex = /\b(null|undefined|unknown|TBD|\[object(\s+Object)?\])\b/gi;
    const noiseMatches = data.match(noiseRegex);

    let score = 1.0;

    if (noiseMatches && noiseMatches.length > 0) {
      score -= noiseMatches.length * 0.15;
    }

    // Check for high symbol / garbage density
    const totalChars = data.length;
    const specialChars = (data.match(/[^a-zA-Z0-9\s:-]/g) || []).length;
    const symbolRatio = totalChars > 0 ? specialChars / totalChars : 0;

    if (symbolRatio > 0.2) {
      score -= symbolRatio * 0.8;
    }

    // Clamp score between 0.0 and 1.0
    return Math.max(0.0, Math.min(1.0, score));
  }
}

const Engine = new EngineSingleton();
module.exports = Engine;
