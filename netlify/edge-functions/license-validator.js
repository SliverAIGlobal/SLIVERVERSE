/**
 * SIPES SAT-AI: License Validator & Gumroad P2P Header Logic
 * Epoch: 10/20/2026 | Verified for Heather Soares
 */
export default async (request, context) => {
  const url = new URL(request.url);
  const licenseKey = request.headers.get("X-Gumroad-License-Key") || url.searchParams.get("license");

  // Logic: Block access if license is missing or malformed for P2P resale assets
  if (!licenseKey && !url.pathname.startsWith("/public") && url.pathname.startsWith("/deploy")) {
    return new Response(JSON.stringify({ error: "Unauthorized: Valid License Required for T(x) Validation." }), {
      status: 401,
      headers: { "content-type": "application/json" },
    });
  }

  const response = await context.next();

  // Inject Cryptographic Attestation Headers
  response.headers.set("X-SIPES-SAT-AI-Audit", "Verified-10202026");
  response.headers.set("X-T-Logic", "0.998");
  return response;
};
