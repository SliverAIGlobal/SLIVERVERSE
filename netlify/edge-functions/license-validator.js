// netlify/edge-functions/license-validator.js
export default async (request, context) => {
  const url = new URL(request.url);
  const licenseKey = url.searchParams.get("license_key");

  // T(x) Logic Gate: 0.995 required for access
  if (!licenseKey) {
    return new Response("UNAUTHORIZED: P2P License Key Required for Resale Access.", { status: 401 });
  }

  // Gumroad Verification Logic
  const gumroadVerify = await fetch("https://api.gumroad.com/v2/licenses/verify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      product_id: "YOUR_GUMROAD_PRODUCT_ID", // Replace with actual ID
      license_key: licenseKey,
      increment_uses_count: "true"
    })
  });

  const verificationData = await gumroadVerify.json();

  if (!verificationData.success || verificationData.purchase.refunded) {
    return new Response("INVALID_LICENSE: Resale distribution denied.", { status: 403 });
  }

  // Inject P2P Developer Headers upon success
  const response = await context.next();
  response.headers.set("X-P2P-Resale-Authorized", "TRUE");
  response.headers.set("X-Developer-ID", verificationData.purchase.email);
  response.headers.set("Cache-Control", "private, no-store, must-revalidate");

  return response;
};
