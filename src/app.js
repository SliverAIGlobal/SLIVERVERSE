import { LocalStore } from './store/LocalStore.js';
import { AppRegistry } from './registry/AppRegistry.js';
import { ValuatorEngine } from './engine/Valuator.js';
import { SandboxViewer } from './components/SandboxViewer.js';
import { AdManager } from './engine/AdManager.js';

class AppController {
  constructor() {
    this.store = new LocalStore();
    this.registry = new AppRegistry(this.store);
    this.valuator = new ValuatorEngine();
    this.sandbox = new SandboxViewer('sandbox-iframe', 'sandbox-app-title', 'sandbox-wrapper');
    this.adManager = new AdManager();

    this.apps = [];
    this.selectedApp = null;
    this.selectedStar = 5;
  }

  async init() {
    await this.store.init();
    this.apps = await this.registry.getApps();
    this.adManager.initSlots();

    this.bindEvents();
    this.renderAppList();

    if (this.apps.length > 0) {
      await this.selectApp(this.apps[0].id);
    }

    if (window.lucide) window.lucide.createIcons();
  }

  bindEvents() {
    // Search and Sort
    document.getElementById('app-search')?.addEventListener('input', () => this.renderAppList());
    document.getElementById('app-sort')?.addEventListener('change', () => this.renderAppList());

    // Viewport switchers
    document.getElementById('view-mobile')?.addEventListener('click', () => this.sandbox.setViewport('mobile'));
    document.getElementById('view-tablet')?.addEventListener('click', () => this.sandbox.setViewport('tablet'));
    document.getElementById('view-desktop')?.addEventListener('click', () => this.sandbox.setViewport('desktop'));
    document.getElementById('btn-fullscreen')?.addEventListener('click', () => this.sandbox.toggleFullscreen());

    // App Injector Modal
    document.getElementById('btn-open-injector')?.addEventListener('click', () => {
      document.getElementById('modal-injector')?.classList.remove('hidden');
    });
    document.getElementById('btn-close-injector')?.addEventListener('click', () => {
      document.getElementById('modal-injector')?.classList.add('hidden');
    });
    document.getElementById('btn-cancel-injector')?.addEventListener('click', () => {
      document.getElementById('modal-injector')?.classList.add('hidden');
    });

    // Form submission for new app snippet
    document.getElementById('injector-form')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const newApp = {
        id: 'app-' + Date.now(),
        name: document.getElementById('inj-name').value,
        category: document.getElementById('inj-category').value,
        description: document.getElementById('inj-desc').value,
        code: document.getElementById('inj-code').value,
        rating: 5.0,
        reviewsCount: 1,
        type: 'snippet'
      };

      newApp.valuation = await this.valuator.calculateValuation(newApp, []);
      await this.registry.addApp(newApp);
      this.apps = await this.registry.getApps();

      document.getElementById('modal-injector')?.classList.add('hidden');
      document.getElementById('injector-form')?.reset();

      this.renderAppList();
      await this.selectApp(newApp.id);
    });

    // Review Modal
    document.getElementById('btn-open-review')?.addEventListener('click', () => {
      if (!this.selectedApp) return alert('Select an app first!');
      document.getElementById('modal-review')?.classList.remove('hidden');
    });
    document.getElementById('btn-close-review')?.addEventListener('click', () => {
      document.getElementById('modal-review')?.classList.add('hidden');
    });

    // Star Selector
    const starEls = document.querySelectorAll('#star-selector i');
    starEls.forEach(star => {
      star.addEventListener('click', (e) => {
        const rating = parseInt(e.target.getAttribute('data-star') || '5');
        this.selectedStar = rating;
        starEls.forEach((s, idx) => {
          if (idx < rating) {
            s.classList.add('text-amber-400', 'fill-amber-400');
            s.classList.remove('text-gray-600');
          } else {
            s.classList.remove('text-amber-400', 'fill-amber-400');
            s.classList.add('text-gray-600');
          }
        });
      });
    });

    // Submit Review
    document.getElementById('btn-submit-review')?.addEventListener('click', async () => {
      if (!this.selectedApp) return;
      const text = document.getElementById('review-text').value || 'Great app!';
      await this.store.addRating(this.selectedApp.id, this.selectedStar, text);

      const reviews = await this.store.getDiscussions(this.selectedApp.id);
      this.selectedApp.valuation = await this.valuator.calculateValuation(this.selectedApp, reviews);

      document.getElementById('modal-review')?.classList.add('hidden');
      document.getElementById('valuation-score').textContent = `$${(this.selectedApp.valuation / 1000).toFixed(2)}k`;
      this.renderAppList();
    });

    // Re-evaluate button
    document.getElementById('btn-reevaluate')?.addEventListener('click', async () => {
      if (!this.selectedApp) return;
      const reviews = await this.store.getDiscussions(this.selectedApp.id);
      this.selectedApp.valuation = await this.valuator.calculateValuation(this.selectedApp, reviews);
      document.getElementById('valuation-score').textContent = `$${(this.selectedApp.valuation / 1000).toFixed(2)}k`;
    });

    // Comment Form
    document.getElementById('comment-form')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const input = document.getElementById('comment-input');
      if (!input.value.trim() || !this.selectedApp) return;

      await this.store.addDiscussion(this.selectedApp.id, 'Tester', input.value.trim());
      input.value = '';
      await this.loadDiscussions(this.selectedApp.id);
    });
  }

  async selectApp(appId) {
    const app = this.apps.find(a => a.id === appId);
    if (!app) return;
    this.selectedApp = app;

    const reviews = await this.store.getDiscussions(app.id);
    app.valuation = await this.valuator.calculateValuation(app, reviews);

    document.getElementById('valuation-score').textContent = `$${(app.valuation / 1000).toFixed(2)}k`;
    this.sandbox.loadApp(app);

    await this.loadDiscussions(app.id);
    this.renderAppList();
  }

  async loadDiscussions(appId) {
    const discussions = await this.store.getDiscussions(appId);
    const container = document.getElementById('comments-container');
    if (!container) return;

    if (discussions.length === 0) {
      container.innerHTML = `<p class="text-xs text-gray-500 italic">No feedback threads yet. Be the first beta tester to comment!</p>`;
    } else {
      container.innerHTML = discussions.map(d => `
        <div class="p-3 bg-white/5 rounded-2xl border border-white/5">
          <div class="flex justify-between items-center text-[10px] text-gray-400 mb-1">
            <span class="font-bold text-indigo-400">${d.author}</span>
            <span>${new Date(d.timestamp).toLocaleTimeString()}</span>
          </div>
          <p class="text-xs text-gray-300">${d.text}</p>
        </div>
      `).join('');
    }
    document.getElementById('comment-count').textContent = `${discussions.length} Feedback Threads`;
  }

  renderAppList() {
    const container = document.getElementById('apps-container');
    if (!container) return;

    const search = (document.getElementById('app-search')?.value || '').toLowerCase();
    const sort = document.getElementById('app-sort')?.value || 'valuation';

    let filtered = this.apps.filter(a =>
      a.name.toLowerCase().includes(search) || a.description.toLowerCase().includes(search)
    );

    if (sort === 'valuation') filtered.sort((a, b) => b.valuation - a.valuation);
    if (sort === 'rating') filtered.sort((a, b) => b.rating - a.rating);

    container.innerHTML = filtered.map(app => `
      <div data-app-id="${app.id}" class="app-card-item glass-card p-4 rounded-2xl cursor-pointer ${this.selectedApp?.id === app.id ? 'border-indigo-500/60 bg-indigo-900/20' : ''}">
        <div class="flex items-start justify-between">
          <div>
            <span class="text-[10px] font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">${app.category}</span>
            <h4 class="text-sm font-bold text-white mt-1.5">${app.name}</h4>
          </div>
          <div class="text-right">
            <span class="text-xs font-bold text-emerald-400 font-mono">$${((app.valuation || 15000) / 1000).toFixed(1)}k</span>
            <div class="flex items-center text-[10px] text-amber-400 gap-1 mt-0.5">
              <i data-lucide="star" class="w-3 h-3 fill-amber-400"></i> ${app.rating}
            </div>
          </div>
        </div>
        <p class="text-xs text-gray-400 mt-2 line-clamp-2">${app.description}</p>
      </div>
    `).join('');

    container.querySelectorAll('.app-card-item').forEach(el => {
      el.addEventListener('click', () => {
        const id = el.getAttribute('data-app-id');
        if (id) this.selectApp(id);
      });
    });

    if (window.lucide) window.lucide.createIcons();
  }
}

window.addEventListener('DOMContentLoaded', () => {
  const controller = new AppController();
  controller.init();
});
