// Cloudflare Worker / Edge WASM Proxy for Athena Daniels AI Companion
export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // CORS Headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Athena-Key',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Edge API Proxy for HuggingFace Open Models
    if (url.pathname.startsWith('/api/chat')) {
      try {
        const body = await request.json();
        const model = body.model || 'google/gemma-2-9b-it';
        const hfKey = env.HF_API_KEY || request.headers.get('X-Athena-Key');

        const response = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(hfKey ? { 'Authorization': `Bearer ${hfKey}` } : {})
          },
          body: JSON.stringify(body.payload)
        });

        const data = await response.json();
        return new Response(JSON.stringify(data), {
          status: response.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    return new Response(JSON.stringify({ status: "Athena Edge Worker Active" }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
};
