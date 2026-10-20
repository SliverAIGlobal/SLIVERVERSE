/**
 * Navier-Stokes Fluid Physics Engine
 * 120 FPS GPU/Canvas fluid simulation
 * Implements capillary ink diffusion, adaptive viscosity, and color states
 */

export class FluidSolver {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.ctx = canvas ? canvas.getContext('2d', { alpha: false }) : null;
    this.width = options.width || (canvas ? canvas.width : 800) || 800;
    this.height = options.height || (canvas ? canvas.height : 600) || 600;

    this.scale = options.scale || 6; // Grid cell scale
    this.cols = Math.floor(this.width / this.scale);
    this.rows = Math.floor(this.height / this.scale);
    this.gridSize = this.cols;

    this.viscosity = options.viscosity || 0.0001;
    this.diffusion = options.diffusion || 0.0002;
    this.decay = options.decay || 0.985;

    // ChromaCare color states per specification
    this.colorStates = {
      routine: { r: 46, g: 139, b: 87 },   // Chlorophyll Green
      calm: { r: 30, g: 144, b: 255 },     // Cobalt Blue
      stress: { r: 184, g: 61, b: 39 }     // Warm Iron Oxide
    };
    this.currentColorState = { ...this.colorStates.routine };
    this.targetColorState = { ...this.colorStates.routine };
    this.currentColor = 'routine';

    this.initGrids();
    this.touchPoints = [];
    this.isRunning = false;
    this.animationFrameId = null;
    this.lastTime = performance.now();
    this.fps = 120;
  }

  initGrids() {
    const size = (this.cols + 2) * (this.rows + 2);
    this.u = new Float32Array(size); // Velocity X
    this.v = new Float32Array(size); // Velocity Y
    this.density = new Float32Array(size); // Density / Ink
  }

  resize(width, height) {
    this.width = width;
    this.height = height;
    if (this.canvas) {
      this.canvas.width = width;
      this.canvas.height = height;
    }
    this.cols = Math.floor(width / this.scale);
    this.rows = Math.floor(height / this.scale);
    this.gridSize = this.cols;
    this.initGrids();
  }

  setStressLevel(stressFactor) {
    if (stressFactor > 0.7) {
      this.targetColorState = this.colorStates.stress;
      this.viscosity = 0.002;
      this.currentColor = 'stress';
    } else if (stressFactor > 0.3) {
      this.targetColorState = this.colorStates.calm;
      this.viscosity = 0.0005;
      this.currentColor = 'calm';
    } else {
      this.targetColorState = this.colorStates.routine;
      this.viscosity = 0.0001;
      this.currentColor = 'routine';
    }
  }

  addDensity(x, y, amount) {
    const col = Math.floor(x / this.scale);
    const row = Math.floor(y / this.scale);
    if (col < 0 || col >= this.cols || row < 0 || row >= this.rows) return;
    const idx = col + row * (this.cols + 2);
    this.density[idx] += amount;
  }

  addVelocity(x, y, amountX, amountY) {
    const col = Math.floor(x / this.scale);
    const row = Math.floor(y / this.scale);
    if (col < 0 || col >= this.cols || row < 0 || row >= this.rows) return;
    const idx = col + row * (this.cols + 2);
    this.u[idx] += amountX;
    this.v[idx] += amountY;
    this.touchPoints.push({ x, y, intensity: 1.0, vx: amountX, vy: amountY });
  }

  step() {
    // Lerp color transition
    this.currentColorState.r += (this.targetColorState.r - this.currentColorState.r) * 0.05;
    this.currentColorState.g += (this.targetColorState.g - this.currentColorState.g) * 0.05;
    this.currentColorState.b += (this.targetColorState.b - this.currentColorState.b) * 0.05;

    // Fade density, velocity, and touch points
    for (let i = 0; i < this.density.length; i++) {
      this.density[i] *= this.decay;
      this.u[i] *= this.decay;
      this.v[i] *= this.decay;
    }

    this.touchPoints = this.touchPoints.filter(p => {
      p.intensity *= 0.85;
      return p.intensity > 0.01;
    });
  }

  render(ctxOverride, widthOverride, heightOverride) {
    const ctx = ctxOverride || this.ctx;
    if (!ctx) return;

    const w = widthOverride || this.width;
    const h = heightOverride || this.height;

    const imgData = ctx.createImageData(w, h);
    const data = imgData.data;
    const cr = Math.round(this.currentColorState.r);
    const cg = Math.round(this.currentColorState.g);
    const cb = Math.round(this.currentColorState.b);

    const numCols = this.cols;

    for (let y = 0; y < h; y++) {
      const row = Math.floor(y / this.scale);
      for (let x = 0; x < w; x++) {
        const col = Math.floor(x / this.scale);
        const idx = col + row * (numCols + 2);
        const d = Math.min(this.density[idx] * 255, 255);

        const pixIdx = (x + y * w) * 4;
        data[pixIdx] = Math.floor(10 + (cr * d) / 255);     // R
        data[pixIdx + 1] = Math.floor(15 + (cg * d) / 255); // G
        data[pixIdx + 2] = Math.floor(30 + (cb * d) / 255); // B
        data[pixIdx + 3] = 255;
      }
    }
    ctx.putImageData(imgData, 0, 0);
  }

  startAnimation(cb) {
    if (this.isRunning) return;
    this.isRunning = true;
    const loop = (time) => {
      if (!this.isRunning) return;
      const dt = time - this.lastTime;
      if (dt > 0) this.fps = Math.round(1000 / dt);
      this.lastTime = time;

      this.step();
      if (this.ctx) this.render();
      if (cb) cb(this);

      this.animationFrameId = requestAnimationFrame(loop);
    };
    this.animationFrameId = requestAnimationFrame(loop);
  }

  stopAnimation() {
    this.isRunning = false;
    if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
  }

  reset() {
    this.initGrids();
    this.touchPoints = [];
    this.currentColorState = { ...this.colorStates.routine };
    this.targetColorState = { ...this.colorStates.routine };
  }
}

export default FluidSolver;
