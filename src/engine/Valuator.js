/**
 * WASM Quantized App Valuator Engine
 * Evaluates app value based on client-side ONNX / Transformers.js sentiment analysis,
 * code feature complexity, ratings, and user feedback.
 */

export class ValuatorEngine {
  constructor() {
    this.pipelineInstance = null;
    this.isLoading = false;
  }

  async initPipeline() {
    if (this.pipelineInstance || this.isLoading) return;
    this.isLoading = true;
    try {
      if (window.TransformersPipeline) {
        // Quantized sentiment analysis model running via WASM in browser
        this.pipelineInstance = await window.TransformersPipeline(
          'sentiment-analysis',
          'Xenova/distilbert-base-uncased-finetuned-sst-2-english'
        );
      }
    } catch (e) {
      console.warn('WASM Transformers model fallback mode active:', e);
    } finally {
      this.isLoading = false;
    }
  }

  async calculateValuation(app, reviews = []) {
    let sentimentScore = 0.5;

    // Use Transformers.js WASM sentiment model if reviews exist
    if (reviews.length > 0) {
      try {
        if (!this.pipelineInstance) await this.initPipeline();
        if (this.pipelineInstance) {
          const combinedReviews = reviews.map(r => r.text).join('. ');
          const results = await this.pipelineInstance(combinedReviews.slice(0, 512));
          if (results && results[0]) {
            sentimentScore = results[0].label === 'POSITIVE' ? results[0].score : (1 - results[0].score);
          }
        }
      } catch (e) {
        console.warn('Sentiment calculation fallback:', e);
      }
    }

    // Code complexity feature calculation
    const codeLength = (app.code || '').length;
    const hasScript = (app.code || '').includes('<script');
    const hasStyle = (app.code || '').includes('<style') || (app.code || '').includes('class=');
    const hasWasmOrCanvas = (app.code || '').includes('wasm') || (app.code || '').includes('canvas') || (app.code || '').includes('WebGL');

    const codeFactor = Math.min(codeLength * 2, 12000);
    const featureFactor = (hasScript ? 3000 : 0) + (hasStyle ? 2000 : 0) + (hasWasmOrCanvas ? 8000 : 0);
    const ratingFactor = (app.rating || 4.5) * 4000;
    const sentimentFactor = sentimentScore * 5000;

    const totalValuation = Math.round(codeFactor + featureFactor + ratingFactor + sentimentFactor + 10000);
    return totalValuation;
  }
}
