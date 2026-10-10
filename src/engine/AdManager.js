/**
 * Ad Manager Module
 * Configures AdMob / AdSense slot placements and provides mock or live script hooks.
 */

export class AdManager {
  constructor() {
    this.mockMode = true;
  }

  initSlots() {
    this.renderTopBanner();
    this.renderInlineFeedAd();
  }

  renderTopBanner() {
    const slot = document.getElementById('ad-slot-top');
    if (!slot) return;
    if (this.mockMode) {
      slot.innerHTML = `
        <div class="max-w-4xl mx-auto flex items-center justify-between gap-4 p-2.5 rounded-xl bg-gradient-to-r from-indigo-900/30 via-purple-900/20 to-gray-900 border border-indigo-500/20">
          <div class="flex items-center gap-3">
            <span class="text-[9px] font-black tracking-widest text-indigo-400 uppercase bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded">ADMOB / ADSENSE SLOT</span>
            <span class="text-xs text-gray-300 font-medium">Monetization Active • Serverless Edge Revenue Node</span>
          </div>
          <button class="text-xs text-indigo-400 hover:text-indigo-300 font-bold underline">Learn More</button>
        </div>
      `;
    }
  }

  renderInlineFeedAd() {
    const slot = document.getElementById('ad-slot-feed');
    if (!slot) return;
    if (this.mockMode) {
      slot.innerHTML = `
        <span class="text-[9px] font-black tracking-widest text-indigo-400 uppercase bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded">INLINE FEED AD SLOT</span>
        <p class="text-xs text-gray-400 mt-1">Support beta developers through quick ad views during testing cycles.</p>
      `;
    }
  }
}
