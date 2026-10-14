/**
 * Isolated Sandbox Viewer Component
 * Renders beta apps safely inside iframe with viewport switching and fullscreen modes.
 */

export class SandboxViewer {
  constructor(iframeId, titleId, wrapperId) {
    this.iframe = document.getElementById(iframeId);
    this.title = document.getElementById(titleId);
    this.wrapper = document.getElementById(wrapperId);
  }

  loadApp(app) {
    if (!app) return;
    if (this.title) this.title.textContent = `${app.name} (v${app.version || '1.0'})`;

    // Set secure iframe content using Blob or srcdoc
    const blob = new Blob([app.code], { type: 'text/html' });
    this.iframe.src = URL.createObjectURL(blob);

    // Ensure placeholder is hidden
    const placeholder = document.getElementById('sandbox-placeholder');
    if (placeholder) placeholder.classList.add('hidden');
  }

  setViewport(mode) {
    if (!this.iframe) return;
    this.iframe.className = `border-0 bg-white rounded-xl shadow-2xl transition-all duration-300 device-${mode}`;
  }

  toggleFullscreen() {
    if (!this.wrapper) return;
    if (!document.fullscreenElement) {
      this.wrapper.requestFullscreen().catch(err => console.warn('Fullscreen error:', err));
    } else {
      document.exitFullscreen().catch(err => console.warn('Exit fullscreen error:', err));
    }
  }
}
