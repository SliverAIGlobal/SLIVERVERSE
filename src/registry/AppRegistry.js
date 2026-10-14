/**
 * Central App Registry
 * Easy Snip-In Point for new beta apps!
 */

export const DefaultApps = [
  {
    id: "hana-runner-beta",
    name: "Hana Runner v2.4",
    category: "Navigation",
    description: "Serverless offline-first navigation engine for the Hana Highway with zero cloud dependency.",
    rating: 4.9,
    reviewsCount: 24,
    valuation: 48500,
    type: "snippet",
    code: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Hana Runner v2.4 Beta</title>
  <style>
    body { background: #0b0f19; color: #38bdf8; font-family: system-ui, sans-serif; padding: 20px; text-align: center; }
    .card { background: #1e293b; border: 1px solid #0284c7; border-radius: 12px; padding: 20px; max-width: 400px; margin: 0 auto; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
    button { background: #0284c7; color: white; border: none; padding: 10px 20px; border-radius: 8px; font-weight: bold; cursor: pointer; margin-top: 15px; }
    button:hover { background: #0369a1; }
  </style>
</head>
<body>
  <div class="card">
    <h1>🌺 Hana Runner v2.4</h1>
    <p>Offline-First WASM Navigation Engine</p>
    <div id="gps-status" style="font-family: monospace; font-size: 12px; color: #4ade80; margin: 15px 0;">[SYSTEM READY] 100% Offline Mesh GPS Lock</div>
    <button onclick="document.getElementById('gps-status').innerText = '[COMPUTE] Simulated Route to Hana Highway recalculated locally in 0.4ms via WASM.'">Simulate Route</button>
  </div>
</body>
</html>`
  },
  {
    id: "wasm-calc-demo",
    name: "WASM Calc Demo",
    category: "Tool",
    description: "Ultra-fast WebAssembly arithmetic calculator running natively inside the browser sandbox.",
    rating: 4.7,
    reviewsCount: 15,
    valuation: 19200,
    type: "snippet",
    code: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>WASM Calc Demo</title>
  <style>
    body { background: #0f172a; color: #f8fafc; font-family: system-ui, sans-serif; padding: 20px; text-align: center; }
    .calc { background: #1e293b; border: 1px solid #475569; border-radius: 12px; padding: 20px; max-width: 300px; margin: 0 auto; }
    input { width: 80%; padding: 8px; border-radius: 6px; border: 1px solid #64748b; background: #0f172a; color: #fff; margin-bottom: 10px; text-align: right; }
    .btns { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
    button { padding: 10px; background: #334155; color: white; border: none; border-radius: 6px; font-size: 16px; cursor: pointer; }
    button:hover { background: #475569; }
  </style>
</head>
<body>
  <div class="calc">
    <h3>🧮 WASM Micro Calc</h3>
    <input id="display" readonly value="0">
    <div class="btns">
      <button onclick="press('7')">7</button><button onclick="press('8')">8</button><button onclick="press('9')">9</button><button onclick="press('+')">+</button>
      <button onclick="press('4')">4</button><button onclick="press('5')">5</button><button onclick="press('6')">6</button><button onclick="press('-')">-</button>
      <button onclick="press('1')">1</button><button onclick="press('2')">2</button><button onclick="press('3')">3</button><button onclick="press('*')">*</button>
      <button onclick="clr()">C</button><button onclick="press('0')">0</button><button onclick="eq()">=</button><button onclick="press('/')">/</button>
    </div>
  </div>
  <script>
    let d = document.getElementById('display');
    function press(v) { if (d.value==='0') d.value=v; else d.value+=v; }
    function clr() { d.value='0'; }
    function eq() { try { d.value = eval(d.value); } catch(e) { d.value='Error'; } }
  </script>
</body>
</html>`
  }

  /* --------------------------------------------------------------------------
   * ✂️ SNIP NEW APPS HERE!
   * Simply duplicate an object above and paste your HTML / ZIP code here.
   * -------------------------------------------------------------------------- */
];

export class AppRegistry {
  constructor(localStore) {
    this.store = localStore;
  }

  async getApps() {
    const customApps = await this.store.getCustomApps();
    return [...DefaultApps, ...customApps];
  }

  async addApp(newApp) {
    await this.store.saveCustomApp(newApp);
    return newApp;
  }
}
