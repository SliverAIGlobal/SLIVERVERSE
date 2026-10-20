/**
 * Conflict-Free Replicated Data Type (CRDT) Engine for Multi-User Offline Sync
 * Uses Hybrid Logical Clocks (HLC) and Last-Write-Wins Element Sets (LWW)
 */

export function hlcTick(prev, node, now = Date.now()) {
  const wall = prev ? Math.max(now, prev.wall) : now;
  const counter = prev && wall === prev.wall ? prev.counter + 1 : 0;
  return { wall, counter, node };
}

export function hlcCompare(a, b) {
  if (!a || !b) return 0;
  if (a.wall !== b.wall) return a.wall < b.wall ? -1 : 1;
  if (a.counter !== b.counter) return a.counter < b.counter ? -1 : 1;
  return a.node < b.node ? -1 : a.node > b.node ? 1 : 0;
}

export class ProposalCRDT {
  constructor(proposalId) {
    this.proposalId = proposalId;
    this.stateVector = new Map(); // Key -> { value, hlc }
  }

  set(key, value, hlc) {
    const existing = this.stateVector.get(key);
    if (!existing || hlcCompare(hlc, existing.hlc) > 0) {
      this.stateVector.set(key, { value, hlc });
    }
  }

  get(key) {
    const entry = this.stateVector.get(key);
    return entry ? entry.value : undefined;
  }

  merge(remoteStateVector) {
    for (const [key, remoteEntry] of remoteStateVector.entries()) {
      this.set(key, remoteEntry.value, remoteEntry.hlc);
    }
  }

  toJSON() {
    const obj = {};
    for (const [key, entry] of this.stateVector.entries()) {
      obj[key] = entry;
    }
    return obj;
  }

  static fromJSON(proposalId, json) {
    const crdt = new ProposalCRDT(proposalId);
    if (json) {
      for (const [key, entry] of Object.entries(json)) {
        crdt.set(key, entry.value, entry.hlc);
      }
    }
    return crdt;
  }
}

export default ProposalCRDT;
